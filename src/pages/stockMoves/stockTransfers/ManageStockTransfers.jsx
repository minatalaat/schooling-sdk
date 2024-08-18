import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

import Spinner from '../../../components/Spinner/Spinner';
import ConfirmationPopup from '../../../components/ConfirmationPopup';
import MoreAction from '../../../parts/MoreAction';
import BreadCrumb from '../../../components/ui/BreadCrumb';
import BackButton from '../../../components/ui/buttons/BackButton';
import PrimaryButton from '../../../components/ui/buttons/PrimaryButton';
import CancelButton from '../../../components/ui/buttons/CancelButton';
import StockTransfersForm from './StockTransfersForm';
import ActionsProgessBar from '../../../parts/ActionsProgessBar';
import Calendar from '../../../components/ui/Calendar';
import CancellationModal from '../CancellationModal';

import { useAxiosFunction } from '../../../hooks/useAxios';
import { useFeatures } from '../../../hooks/useFeatures';
import { getFetchUrl, getSearchUrl, getActionUrl } from '../../../services/getUrl';
import { modelsEnum } from '../../../constants/modelsEnum/modelsEnum';
import { STOCK_MOVES_FETCH_FIELDS, STOCK_MOVE_LINES_SEARCH_FIELDS } from '../StockMovesPayloadsFields';
import { STOCK_MOVE_STATUS } from '../../../constants/enums/StockMoveEnums';
import { useDispatch } from 'react-redux';
import { stockMoveLineActions } from '../../../store/stockMoveLines';
import { alertsActions } from '../../../store/alerts';
import { MODELS } from '../../../constants/models';

export default function ManageStockTransfers({ addNew, enableEdit }) {
  const feature = 'STOCK_MANAGEMENT';
  const subFeature = 'STOCK_TRANSFERS';

  const { api } = useAxiosFunction();
  const { t } = useTranslation();
  const { canView, canEdit, canDelete, getFeaturePath } = useFeatures(feature, subFeature);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [stockMove, setStockMove] = useState(null);
  const [stockMoveLineList, setStockMoveLineList] = useState([]);
  const [isSave, setIsSave] = useState(false);
  const [isReverseStockMove, setReverseStockMove] = useState(false);
  const [isRealizeStockMove, setRealizeStockMove] = useState(false);
  const [isCancelMove, setCancelMove] = useState(false);
  const [cancelReason, setCancelReason] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [isLoading, setIsLoading] = useState(addNew ? false : true);
  const [productDomain, setProductDomain] = useState(null);
  const [noAvailableQty, setNoAvailableQty] = useState([]);

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
      if (isDelete) setIsDelete(false);
      if (isRealizeStockMove) setRealizeStockMove(false);
      if (isReverseStockMove) setReverseStockMove(false);
      if (isCancelMove) setCancelMove(false);
    }
  };

  const finishedSaveHandler = status => {
    if (status === 'success') {
      alertHandler('Success', 'LBL_STOCK_TRANSFER_SAVED_SUCCESS');
      setTimeout(() => {
        setIsSave(false);
        navigate(getFeaturePath(subFeature));
      }, 3000);
    } else {
      alertHandler('Error', 'SOMETHING_WENT_WRONG');
    }
  };

  const finishedRealizeHandler = status => {
    if (status === 'success') {
      alertHandler('Success', 'LBL_STOCK_TRANSFER_REALIZED_SUCCESS');
      setTimeout(() => {
        setRealizeStockMove(false);
        navigate(getFeaturePath(subFeature));
      }, 3000);
    } else {
      alertHandler('Error', 'SOMETHING_WENT_WRONG');
    }
  };

  const finishedReverseMoveHandler = (status) => {
    if (status === 'success') {
      alertHandler('Success', 'LBL_REVERSE_STOCK_TRANSFER_SUCCESS');
      setTimeout(() => {
        setReverseStockMove(false);
        navigate(getFeaturePath('TRANSFER_REQUESTS'));
      }, 3000);
    } else {
      alertHandler('Error', 'SOMETHING_WENT_WRONG');
    }
  };

  const finishedCancelMoveHandler = (status) => {
    if (status === 'success') {
      setShowCancelModal(false);
      alertHandler('Success', 'LBL_CANCEL_STOCK_TRANSFER_SUCCESS');
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
      alertHandler('Success', 'LBL_STOCK_TRANSFER_DELETED');
      setTimeout(() => {
        setIsDelete(false);
        navigate(getFeaturePath(subFeature));
      }, 3000);
    } else {
      alertHandler('Error', 'SOMETHING_WENT_WRONG');
    }
  };

  const fetchStockMove = async () => {
    if (addNew) return null;
    if (isLoading === false) setIsLoading(true);
    const stockMoveResponse = await api('POST', getFetchUrl(modelsEnum[subFeature].name, id), {
      fields: STOCK_MOVES_FETCH_FIELDS,
      related: {},
    });
    let stockMoveResponseData = stockMoveResponse.data.data;
    if (!stockMoveResponse.data || stockMoveResponse.data.status !== 0 || !stockMoveResponseData || !stockMoveResponseData[0])
      return navigate('/error');
    setStockMove(stockMoveResponseData[0]);
    await onFromStockLocationChange(stockMoveResponseData[0].fromStockLocation);
    dispatch(stockMoveLineActions.updateExTaxTotal({ exTaxTotal: stockMoveResponseData[0].exTaxTotal || 0 }));
    if (stockMoveResponseData[0]?.stockMoveLineList?.length > 0) getStockMoveLineList(stockMoveResponseData[0]);
    else setIsLoading(false);
  };

  const onFromStockLocationPayload = stockLocation => {
    let payload = {
      model: MODELS.STOCK_MOVE_LINE,
      action: 'action-stock-move-line-method-product-domain',
      data: {
        criteria: [],
        context: {
          _model: MODELS.STOCK_MOVE_LINE,
          id: null,
          companyUnitPriceUntaxed: '0',
          conformitySelect: 0,
          lineTypeSelect: 0,
          netMass: '0',
          qty: '0',
          qtyInvoiced: '0',
          realQty: '0',
          unitPriceTaxed: '0',
          unitPriceUntaxed: '0',
          selected: false,
          filterOnAvailableProducts: true,
          _form: true,
          _parent: {
            _id: null,
            _typeSelect: 1,
            statusSelect: 1,
            fromStockLocation: stockLocation,
            _xFillProductAvailableQty: true,
            _model: MODELS.STOCK_MOVE,
          },
          _source: 'product',
        },
      },
    };
    return payload;
  };

  const onFromStockLocationChange = async stockLocation => {
    if (stockLocation) {
      const changeResponse = await api('POST', getActionUrl(), onFromStockLocationPayload(stockLocation));
      if (changeResponse.data.status !== 0) return alertHandler('Error', 'LBL_ERROR_SELECTING_STOCK_LOCATION');
      let resData = changeResponse.data.data;
      let domain = resData[0]?.attrs?.product?.domain || null;
      setProductDomain(domain);
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

  let isButtonDisabled = isSave || isRealizeStockMove || isReverseStockMove || isDelete || isCancelMove;
  return (
    <>
      {showMoreAction && (
        <MoreAction
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          editHandler={!enableEdit ? (canEdit ? editHandler : null) : null}
          viewHandler={enableEdit ? (canView ? viewHandler : null) : null}
          deleteHandler={!addNew && canDelete ? deleteHandler : null}
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
                <h4>{addNew ? t('LBL_NEW_STOCK_TRANSFER') : stockMove?.stockMoveSeq ?? ''}</h4>
              </div>
              <div className="reverse-page float-end">
                <BackButton disabled={isButtonDisabled} text={addNew ? 'LBL_CANCEL' : 'LBL_BACK'} />
                {enableEdit && stockMove && (stockMove.statusSelect === 2 || stockMove.statusSelect === 3) && (
                  <CancelButton disabled={isButtonDisabled} onClick={() => setShowCancelModal(true)} />
                )}
                {(addNew || enableEdit) && <PrimaryButton disabled={isButtonDisabled} onClick={() => setIsSave(true)} />}
                {enableEdit && stockMove && stockMove.statusSelect === 2 && (
                  <PrimaryButton
                    text="LBL_REALIZE_STOCK_TRANSFER"
                    disabled={isButtonDisabled || stockMoveLineList.length === 0}
                    onClick={() => setRealizeStockMove(true)}
                  />
                )}
                {enableEdit && stockMove && stockMove.statusSelect === 3 && (
                  <PrimaryButton text="LBL_REVERSE_STOCK_TRANSFER" disabled={isButtonDisabled} onClick={() => setReverseStockMove(true)} />
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
                  editHandler={!enableEdit ? (canEdit ? editHandler : null) : null}
                  viewHandler={enableEdit ? (canView ? viewHandler : null) : null}
                  deleteHandler={canDelete ? deleteHandler : null}
                  setShowMoreAction={setShowMoreAction}
                  statusBarItems={statusBarItems}
                  currentStatusLabel={(stockMove && t(STOCK_MOVE_STATUS[stockMove.statusSelect])) || t(STOCK_MOVE_STATUS[1])}
                />
              )}
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
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
                  {stockMove && !addNew && (
                    <StockTransfersForm
                      enableEdit={enableEdit}
                      data={stockMove}
                      isSave={isSave}
                      isDelete={isDelete}
                      isReverseStockMove={isReverseStockMove}
                      isRealizeStockMove={isRealizeStockMove}
                      isCancelMove={isCancelMove}
                      cancelReason={cancelReason}
                      finishedSaveHandler={finishedSaveHandler}
                      finishedDeleteHandler={finishedDeleteHandler}
                      finishedRealizeHandler={finishedRealizeHandler}
                      finishedReverseMoveHandler={finishedReverseMoveHandler}
                      finishedCancelMoveHandler={finishedCancelMoveHandler}
                      alertHandler={alertHandler}
                      setActionInProgress={setActionInProgress}
                      setIsLoading={setIsLoading}
                      stockMoveLineList={stockMoveLineList}
                      setStockMoveLineList={setStockMoveLineList}
                      productDomain={productDomain}
                      onFromStockLocationChange={onFromStockLocationChange}
                      noAvailableQty={noAvailableQty}
                      setNoAvailableQty={setNoAvailableQty}
                    />
                  )}
                  {addNew && (
                    <StockTransfersForm
                      addNew={addNew}
                      data={stockMove}
                      isSave={isSave}
                      finishedSaveHandler={finishedSaveHandler}
                      isRealizeStockMove={isRealizeStockMove}
                      finishedRealizeHandler={finishedRealizeHandler}
                      isReverseStockMove={isReverseStockMove}
                      finishedReverseMoveHandler={finishedReverseMoveHandler}
                      alertHandler={alertHandler}
                      setActionInProgress={setActionInProgress}
                      setIsLoading={setIsLoading}
                      stockMoveLineList={stockMoveLineList}
                      setStockMoveLineList={setStockMoveLineList}
                      onFromStockLocationChange={onFromStockLocationChange}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {showCancelModal && (
        <CancellationModal
          show={showCancelModal}
          setShow={setShowCancelModal}
          submit={() => setCancelMove(true)}
          setCancelReason={setCancelReason}
        />
      )}
    </>
  );
}
