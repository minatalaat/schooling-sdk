import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import Spinner from '../../../components/Spinner/Spinner';
import ConfirmationPopup from '../../../components/ConfirmationPopup';
import MoreAction from '../../../parts/MoreAction';
import BreadCrumb from '../../../components/ui/BreadCrumb';
import BackButton from '../../../components/ui/buttons/BackButton';
import PrimaryButton from '../../../components/ui/buttons/PrimaryButton';
import SupplierReturnsForm from './SupplierReturnsForm';
import ActionsProgessBar from '../../../parts/ActionsProgessBar';
import Calendar from '../../../components/ui/Calendar';
import CancellationModal from '../CancellationModal';
import TotalsAndActionsCard from '../TotalsAndActionsCard';

import { useAxiosFunction } from '../../../hooks/useAxios';
import { useFeatures } from '../../../hooks/useFeatures';
import { getFetchUrl, getSearchUrl, getActionUrl } from '../../../services/getUrl';
import { modelsEnum } from '../../../constants/modelsEnum/modelsEnum';
import { STOCK_MOVES_FETCH_FIELDS, STOCK_MOVE_LINES_SEARCH_FIELDS } from '../StockMovesPayloadsFields';
import { STOCK_MOVE_STATUS } from '../../../constants/enums/StockMoveEnums';
import { stockMoveLineActions } from '../../../store/stockMoveLines';
import { alertsActions } from '../../../store/alerts';
import { MODELS } from '../../../constants/models';

export default function ManageSupplierReturns({ addNew, enableEdit }) {
  const feature = 'STOCK_MANAGEMENT';
  const subFeature = 'SUPPLIER_RETURNS';

  const { api } = useAxiosFunction();
  const { t } = useTranslation();
  const { canView, canEdit, canDelete, getFeaturePath } = useFeatures(feature, subFeature);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [stockMove, setStockMove] = useState(null);
  const [fetchedStockMoveAdditional, setFetchedStockMoveAdditional] = useState(null);
  const [stockMoveLineList, setStockMoveLineList] = useState([]);
  const [isSave, setIsSave] = useState(false);
  const [isRealizeStockMove, setRealizeStockMove] = useState(false);
  const [isPlanStockMove, setPlanStockMove] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [isLoading, setIsLoading] = useState(addNew ? false : true);
  const [isCancelMove, setCancelMove] = useState(false);
  const [cancelReason, setCancelReason] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [noAvailableQty, setNoAvailableQty] = useState([]);

  let mode = addNew ? 'add' : enableEdit ? 'edit' : 'view';

  let statusBarItems = [
    {
      label: 'LBL_DRAFT',
      className: 'done',
    },
    {
      label: 'LBL_PLANNED',
      className: stockMove && stockMove.statusSelect > 1 ? 'done' : 'default',
    },
    {
      label: 'LBL_CONFIRMED',
      className: stockMove && stockMove.statusSelect > 2 ? 'done' : 'default',
    },
  ];

  const { id } = useParams();

  const alertHandler = (title, message) => {
    if (message) dispatch(alertsActions.initiateAlert({ title, message }));
    setActionInProgress(false);

    if (title !== 'Success' || !message) {
      if (isSave) setIsSave(false);
      if (isRealizeStockMove) setRealizeStockMove(false);
      if (isPlanStockMove) setPlanStockMove(false);
      if (isDelete) setIsDelete(false);
      if (isCancelMove) setCancelMove(false);
    }
  };

  const finishedSaveHandler = status => {
    if (status === 'success') {
      alertHandler('Success', 'LBL_SUPPLIER_RETURN_SAVED_SUCCESS');
      setTimeout(() => {
        setIsSave(false);
        navigate(getFeaturePath(subFeature));
      }, 3000);
    } else {
      alertHandler('Error', 'SOMETHING_WENT_WRONG');
    }
  };

  const finishedPlanHandler = status => {
    if (status === 'success') {
      alertHandler('Success', 'LBL_SUPPLIER_RETURN_PLANNED_SUCCESS');
      setTimeout(() => {
        setPlanStockMove(false);
        navigate(getFeaturePath(subFeature));
      }, 3000);
    } else {
      alertHandler('Error', 'SOMETHING_WENT_WRONG');
    }
  };

  const finishedRealizeHandler = (status, msg) => {
    let message = msg ?? 'LBL_SUPPLIER_RETURN_REALIZED_SUCCESS';

    if (status === 'success') {
      alertHandler('Success', message);
      setTimeout(() => {
        setRealizeStockMove(false);
        navigate(getFeaturePath(subFeature));
      }, 3000);
    } else {
      alertHandler('Error', 'SOMETHING_WENT_WRONG');
    }
  };

  const finishedCancelMoveHandler = status => {
    if (status === 'success') {
      setShowCancelModal(false);
      alertHandler('Success', 'LBL_CANCEL_SUPPLIER_RETURN_SUCCESS');
      setTimeout(() => {
        setCancelMove(false);
        navigate(getFeaturePath(subFeature));
      }, 3000);
    } else {
      alertHandler('Error', 'SOMETHING_WENT_WRONG');
    }
  };

  const finishedDeleteHandler = status => {
    if (status === 'success') {
      alertHandler('Success', 'LBL_SUPPLIER_RETURN_DELETED');
      setTimeout(() => {
        setIsDelete(false);
        navigate(getFeaturePath(subFeature));
      }, 3000);
    } else {
      alertHandler('Error', 'SOMETHING_WENT_WRONG');
    }
  };

  const getStockMoveAdditionalDataPayload = () => {
    let payload = {
      fields: ['stockMove', 'stockMoveDate'],
      sortBy: ['stockMove'],
      data: {
        _domain: 'self.stockMove.id = :_stockMove',
        _domainContext: {
          _stockMove: id,
        },
        operator: 'and',
        criteria: [],
      },
      limit: 1,
      offset: 0,
      translate: true,
    };
    return payload;
  };

  const fetchStockMove = async () => {
    if (addNew) return null;
    if (isLoading === false) setIsLoading(true);
    await fetchMove();
  };

  const fetchMove = async tempID => {
    if (!tempID) tempID = id;
    const stockMoveResponse = await api('POST', getFetchUrl(modelsEnum[subFeature].name, tempID), {
      fields: STOCK_MOVES_FETCH_FIELDS,
      related: {},
    });
    let stockMoveResponseData = stockMoveResponse.data.data;
    if (!stockMoveResponse.data || stockMoveResponse.data.status !== 0 || !stockMoveResponseData || !stockMoveResponseData[0])
      return navigate('/error');
    setStockMove(stockMoveResponseData[0]);
    dispatch(stockMoveLineActions.updateExTaxTotal({ exTaxTotal: stockMoveResponseData[0].exTaxTotal || 0 }));

    if (stockMoveResponseData[0]?.stockMoveLineList?.length > 0) getStockMoveLineList(stockMoveResponseData[0]);

    const stockMoveDateResponse = await api('POST', getSearchUrl(MODELS.STOCK_MOVE_ADDITIONAL_DATA), getStockMoveAdditionalDataPayload());
    let status = stockMoveDateResponse.data.status;
    let total = stockMoveDateResponse.data.total;
    let data = stockMoveDateResponse.data.data;

    if (status === 0 && total >= 0 && data) {
      setFetchedStockMoveAdditional(data?.[0]);
    }
  };

  const onProductChangePayload = (data, line) => {
    let payload = {
      model: MODELS.STOCK_MOVE_LINE,
      action: 'action-stock-move-line-tracking-number-attrs,action-group-stock-stockmoveline-product-onchange',
      data: {
        criteria: [],
        context: {
          _model: MODELS.STOCK_MOVE_LINE,
          productModel: null,
          'product.productTypeSelect': 'storable',
          productName: line?.product?.productName || undefined,
          stockMove: data
            ? {
                statusSelect: data.statusSelect,
                fromStockLocation: data.fromStockLocation,
                toStockLocation: data.toStockLocation,
                stockMoveSeq: data.stockMoveSeq,
                company: data.company,
                typeSelect: data.typeSelect,
                id: data.id,
              }
            : undefined,
          id: line?.id || null,
          product: line?.product,
          realQty: '0',
          unitPriceUntaxed: '0',
          companyUnitPriceUntaxed: '0',
          lineTypeSelect: 0,
          qtyInvoiced: '0',
          qty: '0',
          unitPriceTaxed: '0',
          companyPurchasePrice: '0',
          'stockMove.typeSelect': data?.typeSelect || undefined,
          'stockMove.statusSelect': data?.statusSelect || undefined,
          version: line?.version || undefined,
          productTypeSelect: 'storable',
          _parent: data,
          _source: 'product',
        },
      },
    };
    return payload;
  };

  const getStockMoveLineList = async data => {
    let stockMoveLinesIDs = data?.stockMoveLineList?.map(line => line.id);
    let payload = {
      fields: STOCK_MOVE_LINES_SEARCH_FIELDS,
      sortBy: ['sequence'],
      data: {
        _domain: 'self.id in (:_field_ids)',
        _domainContext: {
          id: data.id,
          _model: MODELS.STOCK_MOVE,
          _field: 'stockMoveLineList',
          _field_ids: stockMoveLinesIDs,
        },
        _archived: true,
      },
      limit: -1,
      offset: 0,
      translate: true,
    };
    let moveLinesResponse = await api('POST', getSearchUrl(MODELS.STOCK_MOVE_LINE), payload);
    let tempLines = moveLinesResponse?.data?.data;
    let lines = [];
    setNoAvailableQty([]);

    for (const tempLine of tempLines) {
      let newLine = { ...tempLine };
      newLine.lineId = uuidv4();
      const changeResponse = await api('POST', getActionUrl(), onProductChangePayload(data, newLine));
      let changeResponseData = changeResponse?.data?.data;
      newLine.availableQty = changeResponseData.find(el => el.values && 'availableQty' in el.values)?.values?.availableQty;
      if (Number(newLine.availableQty) < Number(newLine.realQty)) setNoAvailableQty(oldArray => [...oldArray, newLine.id]);
      lines.push(newLine);
    }

    setStockMoveLineList(lines);
    setIsLoading(false);
  };

  const viewHandler = () => {
    navigate(getFeaturePath(subFeature, 'view', { id }));
    setShowMoreAction(false);
  };

  const editHandler = () => {
    navigate(getFeaturePath(subFeature, 'edit', { id }));
    setShowMoreAction(false);
  };

  const deleteHandler = () => {
    setShowDelete(true);
  };

  useEffect(() => {
    setNoAvailableQty([]);
    fetchStockMove();
  }, [addNew, enableEdit]);

  let isButtonDisabled = isSave || isDelete || isRealizeStockMove || isPlanStockMove || isCancelMove;

  return (
    <>
      {showMoreAction && (
        <MoreAction
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          editHandler={!enableEdit ? (canEdit && stockMove && stockMove.statusSelect < 3 ? editHandler : null) : null}
          viewHandler={enableEdit ? (canView ? viewHandler : null) : null}
          deleteHandler={canDelete ? deleteHandler : null}
          canSelectAll={false}
        />
      )}
      {actionInProgress && <div className="lodingpage"></div>}
      {isLoading && <Spinner />}
      <div className="page-body">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <Calendar />
              <BreadCrumb
                feature={feature}
                subFeature={subFeature}
                modeText={
                  !addNew && enableEdit
                    ? `${t('LBL_EDIT')} ${t(modelsEnum[subFeature].titleSingular)}`
                    : !addNew && !enableEdit
                      ? `${t('LBL_VIEW')} ${t(modelsEnum[subFeature].titleSingular)}`
                      : `${t('LBL_ADD_NEW')} ${t(modelsEnum[subFeature].titleSingular)}`
                }
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{addNew ? t('LBL_NEW_SUPPLIER_RETURN') : stockMove?.stockMoveSeq ? stockMove.stockMoveSeq : ''}</h4>
              </div>

              <div className="reverse-page float-end">
                <BackButton disabled={isButtonDisabled} text={addNew ? 'LBL_CANCEL' : 'LBL_BACK'} />
                {(addNew || enableEdit) && <PrimaryButton disabled={isButtonDisabled} onClick={() => setIsSave(true)} />}
                {enableEdit && stockMove && stockMove.statusSelect === 1 && (
                  <PrimaryButton text="LBL_PLAN_SUPPLIER_RETURN" disabled={isButtonDisabled} onClick={() => setPlanStockMove(true)} />
                )}
                {enableEdit && stockMove && stockMove.statusSelect === 2 && (
                  <PrimaryButton text="LBL_REALIZE_SUPPLIER_RETURN" disabled={isButtonDisabled} onClick={() => setRealizeStockMove(true)} />
                )}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              {!isLoading && !addNew && (
                <ActionsProgessBar
                  feature={feature}
                  subfeature={subFeature}
                  editHandler={!enableEdit ? (canEdit && stockMove && stockMove.statusSelect < 3 ? editHandler : null) : null}
                  viewHandler={enableEdit ? (canView ? viewHandler : null) : null}
                  setShowMoreAction={setShowMoreAction}
                  statusBarItems={statusBarItems}
                  currentStatusLabel={(stockMove && t(STOCK_MOVE_STATUS[stockMove.statusSelect])) || t(STOCK_MOVE_STATUS[1])}
                />
              )}
            </div>
          </div>
          <div className="row">
            <div className="col-md-9">
              {showDelete && (
                <ConfirmationPopup
                  item={stockMove.reference}
                  onClickHandler={() => {
                    setIsDelete(true);
                    setShowDelete(false);
                  }}
                  setConfirmationPopup={setShowDelete}
                />
              )}
              {!isLoading && (
                <>
                  {(Object.keys(stockMove).length > 0 || addNew) && (
                    <>
                      {!addNew && (
                        <SupplierReturnsForm
                          enableEdit={enableEdit}
                          data={stockMove}
                          isSave={isSave}
                          isPlanStockMove={isPlanStockMove}
                          isRealizeStockMove={isRealizeStockMove}
                          isCancelMove={isCancelMove}
                          cancelReason={cancelReason}
                          finishedSaveHandler={finishedSaveHandler}
                          finishedPlanHandler={finishedPlanHandler}
                          finishedRealizeHandler={finishedRealizeHandler}
                          finishedCancelMoveHandler={finishedCancelMoveHandler}
                          isDelete={false}
                          finishedDeleteHandler={finishedDeleteHandler}
                          alertHandler={alertHandler}
                          setActionInProgress={setActionInProgress}
                          fetchMove={fetchMove}
                          fetchedStockMoveAdditional={fetchedStockMoveAdditional}
                          setIsLoading={setIsLoading}
                          stockMoveLineList={stockMoveLineList}
                          setStockMoveLineList={setStockMoveLineList}
                          noAvailableQty={noAvailableQty}
                          setNoAvailableQty={setNoAvailableQty}
                        />
                      )}
                      {addNew && (
                        <SupplierReturnsForm
                          data={stockMove}
                          addNew={addNew}
                          isSave={isSave}
                          finishedSaveHandler={finishedSaveHandler}
                          alertHandler={alertHandler}
                          setActionInProgress={setActionInProgress}
                          fetchMove={fetchMove}
                          setIsLoading={setIsLoading}
                          stockMoveLineList={stockMoveLineList}
                          setStockMoveLineList={setStockMoveLineList}
                        />
                      )}
                    </>
                  )}
                </>
              )}
            </div>
            <div className="col-md-3">
              <TotalsAndActionsCard
                mode={mode}
                fetchedObject={stockMove}
                onCancelClick={() => setShowCancelModal(true)}
                isBtnDisabled={isButtonDisabled}
              />
            </div>
          </div>
        </div>
      </div>
      {showCancelModal && (
        <CancellationModal
          title="LBL_CANCEL_SUPPLIER_RETURN"
          show={showCancelModal}
          setShow={setShowCancelModal}
          submit={() => setCancelMove(true)}
          setCancelReason={setCancelReason}
        />
      )}
    </>
  );
}
