import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import Spinner from '../../../components/Spinner/Spinner';
import ConfirmationPopup from '../../../components/ConfirmationPopup';
import OrdersForm from './OrdersForm';
import ActionsProgessBar from '../../../parts/ActionsProgessBar';
import MoreAction from '../../../parts/MoreAction';
import BreadCrumb from '../../../components/ui/BreadCrumb';
import BackButton from '../../../components/ui/buttons/BackButton';
import Calendar from '../../../components/ui/Calendar';
import PrimaryButton from '../../../components/ui/buttons/PrimaryButton';

import { useAxiosFunction } from '../../../hooks/useAxios';
import { getFetchUrl, getSearchUrl } from '../../../services/getUrl';
import { useFeatures } from '../../../hooks/useFeatures';
import { alertsActions } from '../../../store/alerts';
import { modelsEnum } from '../../../constants/modelsEnum/modelsEnum';
import { invoiceLinesActions } from '../../../store/invoiceLines';
import { FETCH_FIELDS, LINES_FIELDS, ORDER_STATUS } from './OrdersConstants';
import { MODELS } from '../../../constants/models';
import { STOCK_MOVES_SEARCH_FIELDS } from '../../stockMoves/StockMovesPayloadsFields';
import { tourStepsActions } from '../../../store/tourSteps';
import { useTourServices } from '../../../services/useTourServices';

const OrdersManagement = ({ addNew, enableEdit, orderConfig }) => {
  const { api } = useAxiosFunction();
  const { canView, canEdit, canDelete, getFeaturePath } = useFeatures(orderConfig.feature, orderConfig.subFeature);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { addStepsOptions } = useTourServices();
  const isTour = useSelector(state => state.tourSteps.isTour);

  const [order, setOrder] = useState({});
  const [isSave, setIsSave] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [isConfirm, setIsConfirm] = useState(false);
  const [isGenerate, setIsGenerate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [showMoreActionToolbar, setShowMoreActionToolbar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { id } = useParams();

  const alertHandler = (title, message) => {
    if (message) dispatch(alertsActions.initiateAlert({ title, message }));

    if (title !== 'Success' || !message) {
      setIsSave(false);
      setIsConfirm(false);
      setIsDelete(false);
      setIsGenerate(false);
      setIsLoading(false);
      setActionInProgress(false);
    }
  };

  const currentStatus = useMemo(() => {
    return addNew ? ORDER_STATUS[1] : order.id ? ORDER_STATUS.find(record => record.id === order.statusSelect) : ORDER_STATUS[0];
  }, [order]);

  const disableActionButtons = useMemo(() => {
    return isSave || isDelete || isConfirm || isGenerate;
  }, [isSave, isDelete, isConfirm, isGenerate]);

  let statusBarItems = [
    {
      label: 'LBL_DRAFT',
      className: 'done',
    },
    {
      label: 'LBL_CONFIRMED',
      className: currentStatus.status === 'Finished' || currentStatus.status === 'Confirmed' ? 'done' : 'default',
    },
    {
      label: 'LBL_FINISHED',
      className: currentStatus.status === 'Finished' ? 'done' : 'default',
    },
  ];

  const getPOStockMovePayload = () => {
    let payload = {
      fields: STOCK_MOVES_SEARCH_FIELDS,
      sortBy: ['statusSelect', '-estimatedDate'],
      data: {
        _domain: orderConfig?.subFeatureChecks?.isPO
          ? "self.originTypeSelect LIKE 'com.axelor.apps.purchase.db.PurchaseOrder' AND self.originId\n    = :purchaseOrder"
          : "self.originTypeSelect LIKE 'com.axelor.apps.sale.db.SaleOrder' AND self.originId\n    = :saleOrder",
        _domainContext: {
          saleOrder: id,
          purchaseOrder: id,
          id: id,
          _id: null,
          _model: orderConfig?.subFeatureChecks?.isPO ? 'com.axelor.apps.purchase.db.PurchaseOrder' : 'com.axelor.apps.sale.db.SaleOrder',
        },
        // _domainAction: 'action-purchase-order-view-stock-moves',
        operator: 'and',
        criteria: [],
      },
      limit: -1,
      offset: 0,
      translate: true,
    };
    return payload;
  };

  const getStockMoves = async () => {
    let payload;

    payload = getPOStockMovePayload();

    let movesResponse = await api('POST', getSearchUrl(MODELS.STOCK_MOVE), payload);
    let tempLines = movesResponse.data.data;

    if (tempLines && tempLines.length > 0) {
      return tempLines;
    } else {
      return null;
    }
  };

  const redirect = async () => {
    const stockMoves = await getStockMoves();

    if (stockMoves && stockMoves.length > 0) {
      let currentStockLocation = stockMoves[0];

      if (orderConfig?.subFeatureChecks?.isPO) {
        navigate(getFeaturePath('SUPPLIER_ARRIVALS', 'edit', { id: currentStockLocation?.id }));
      } else {
        navigate(getFeaturePath('CUSTOMER_DELIVERIES', 'edit', { id: currentStockLocation?.id }));
      }
    } else {
      navigate(getFeaturePath(orderConfig.subFeature));
    }
  };

  const checkAutoRedirect = async () => {
    const stocktConfigDefaultResponse = await api('POST', getFetchUrl(MODELS.COMPANY_STOCK_CONFIG, 1), {
      fields: orderConfig?.subFeatureChecks?.isPO ? ['authRedirectPurchaseOrderToStockMove'] : ['authRedirectSaleOrderToStockMove'],
      related: {},
    });
    if (stocktConfigDefaultResponse.data.status !== 0 || !stocktConfigDefaultResponse?.data?.data) return false;
    return orderConfig?.subFeatureChecks?.isPO
      ? stocktConfigDefaultResponse?.data?.data[0]?.authRedirectPurchaseOrderToStockMove
      : stocktConfigDefaultResponse?.data?.data[0]?.authRedirectSaleOrderToStockMove;
  };

  const finishedActionHandler = async (status, message) => {
    setActionInProgress(false);

    if (status === 'Success') {
      alertHandler('Success', message);
      setTimeout(async () => {
        setIsSave(false);
        setIsConfirm(false);
        setIsDelete(false);
        setIsGenerate(false);

        if (await checkAutoRedirect()) {
          redirect();
        } else {
          navigate(getFeaturePath(orderConfig.subFeature));
        }
      }, 3000);
    } else {
      setIsSave(false);
      setIsConfirm(false);
      setIsDelete(false);
      setIsGenerate(false);
      alertHandler(status || 'Error', message || 'SOMETHING_WENT_WRONG');
    }
  };

  const finishedFinishActionHandler = async (status, message) => {
    setActionInProgress(false);

    if (status === 'Success') {
      alertHandler('Success', message);
      setTimeout(async () => {
        setIsSave(false);
        setIsConfirm(false);
        setIsDelete(false);
        setIsGenerate(false);
        navigate(getFeaturePath(orderConfig.subFeature));
      }, 3000);
    } else {
      setIsSave(false);
      setIsConfirm(false);
      setIsDelete(false);
      setIsGenerate(false);
      alertHandler(status || 'Error', message || 'SOMETHING_WENT_WRONG');
    }
  };

  const fetchElementData = async () => {
    setIsLoading(true);

    dispatch(invoiceLinesActions.resetInvoiceLines());

    const fetchPrintingSettingResponse = await api('POST', getSearchUrl(MODELS.PRINTING_SETTINGS), {
      fields: ['id', 'name'],
      sortBy: null,
      data: {
        _domain: `self.id IN (1)`,
        operator: 'and',
        criteria: [],
      },
      limit: 1,
      offset: 0,
      translate: true,
    });

    if (!(fetchPrintingSettingResponse?.data?.status === 0) || !fetchPrintingSettingResponse?.data?.data?.[0]) {
      setIsLoading(false);
      navigate('/error');
      return null;
    }

    let printingSettings = fetchPrintingSettingResponse?.data?.data?.[0] || null;

    if (addNew) {
      setIsLoading(false);
      return setOrder({ printingSettings });
    }

    const fetchOrderResponse = await api('POST', getFetchUrl(modelsEnum[orderConfig.modelsEnumKey].name, id), {
      fields: FETCH_FIELDS,
      related: orderConfig.subFeatureChecks.isSO
        ? {
            saleOrderLineList: ['tax'],
          }
        : {},
    });

    if (!(fetchOrderResponse?.data?.status === 0) || !fetchOrderResponse?.data?.data?.[0]) {
      setIsLoading(false);
      navigate('/error');
      return null;
    }

    let fetchedOrder = fetchOrderResponse.data.data[0];

    let invoiceLinesIds = [];
    let invoicesLinestemp = [];

    if (fetchedOrder?.[orderConfig.lines.key]?.length > 0) {
      fetchedOrder[orderConfig.lines.key].forEach(line => {
        if (line.id) {
          invoiceLinesIds.push(line.id);
        }
      });

      let invoiceLinesPayload = {
        fields: LINES_FIELDS,
        sortBy: ['sequence'],
        data: {
          _domain: 'self.id in (:_field_ids)',
          _domainContext: {
            id,
            _model: modelsEnum[orderConfig.modelsEnumKey].name,
            _field: orderConfig.lines.key,
            _field_ids: invoiceLinesIds,
          },
          _archived: true,
        },
        limit: -1,
        offset: 0,
        translate: true,
      };
      const invoiceLinesResponse = await api('POST', getSearchUrl(orderConfig.lines.model), invoiceLinesPayload);

      if (!(invoiceLinesResponse?.data?.status === 0) || !invoiceLinesResponse?.data?.data) {
        setIsLoading(false);
        navigate('/error');
        return null;
      }

      let invoiceLinesData = invoiceLinesResponse.data.data;

      if (invoiceLinesResponse?.data?.data?.length === 0) dispatch(invoiceLinesActions.setLines({ invoiceLines: [] }));

      invoiceLinesData.forEach(line => {
        let temp = {
          lineId: uuidv4(),
          ...line,
        };
        invoicesLinestemp.push(temp);
      });

      dispatch(
        invoiceLinesActions.setLines({
          invoiceLines: invoicesLinestemp,
        })
      );
    }

    setOrder({
      ...fetchedOrder,
      printingSettings,
    });

    setIsLoading(false);
  };

  const viewHandler = () => {
    navigate(getFeaturePath(orderConfig.subFeature, 'view', { id }));
    setShowMoreActionToolbar(false);
  };

  const editHandler = () => {
    navigate(getFeaturePath(orderConfig.subFeature, 'edit', { id }));
    setShowMoreActionToolbar(false);
  };

  const deleteHandler = () => {
    setShowDelete(true);
  };

  useEffect(() => {
    if (orderConfig.tourConfig?.addSteps && isTour === 'true' && !isLoading) {
      addStepsOptions(orderConfig.tourConfig?.addSteps);
      dispatch(tourStepsActions.setIsTour('true'));
      dispatch(tourStepsActions.setSpotlightClick(true));
      dispatch(tourStepsActions.setSteps({ steps: orderConfig.tourConfig?.addSteps }));
    }
  }, [isTour, isLoading]);

  useEffect(() => {
    fetchElementData();
  }, [addNew, enableEdit]);

  return (
    <>
      {showMoreActionToolbar && (
        <MoreAction
          showMoreAction={showMoreActionToolbar}
          setShowMoreAction={setShowMoreActionToolbar}
          editHandler={!enableEdit ? (canEdit ? editHandler : null) : null}
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
                feature={orderConfig.feature}
                subFeature={orderConfig.subFeature}
                modeText={
                  !addNew && enableEdit
                    ? `${t('LBL_EDIT')} ${t(modelsEnum[orderConfig.modelsEnumKey].titleSingular)}`
                    : !addNew && !enableEdit
                      ? `${t('LBL_VIEW')} ${t(modelsEnum[orderConfig.modelsEnumKey].titleSingular)}`
                      : `${t('LBL_ADD_NEW')} ${t(modelsEnum[orderConfig.modelsEnumKey].titleSingular)}`
                }
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{addNew ? t(orderConfig.newLabel) : order?.[orderConfig.sequenceKey] || ''}</h4>
              </div>

              <div className="reverse-page float-end">
                <BackButton disabled={isSave || isDelete} text={addNew ? 'LBL_CANCEL' : 'LBL_BACK'} />
                {(addNew || enableEdit) &&
                  currentStatus.status !== 'Confirmed' &&
                  currentStatus.status !== 'Finished' &&
                  currentStatus.status !== 'Canceled' && (
                    <PrimaryButton
                      className={orderConfig.tourConfig?.stepAddSubmit || undefined}
                      disabled={disableActionButtons}
                      onClick={() => setIsSave(true)}
                    />
                  )}
                {enableEdit &&
                  currentStatus.status !== 'Confirmed' &&
                  currentStatus.status !== 'Canceled' &&
                  currentStatus.status !== 'Finished' && (
                    <PrimaryButton text="LBL_CONFIRM" disabled={disableActionButtons} onClick={() => setIsConfirm(true)} />
                  )}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              {!isLoading && !addNew && (
                <ActionsProgessBar
                  feature={orderConfig.feature}
                  subfeature={orderConfig.subFeature}
                  viewHandler={canView && enableEdit ? viewHandler : null}
                  editHandler={
                    (!orderConfig?.stockMangamentAvaiable &&
                      canEdit &&
                      !enableEdit &&
                      orderConfig?.subFeatureChecks?.isSO &&
                      currentStatus.status !== ORDER_STATUS[4]?.status &&
                      order &&
                      order?.amountInvoiced &&
                      order?.amountInvoiced !== order?.totalWithOutTax) ||
                    (canEdit &&
                      !enableEdit &&
                      orderConfig?.subFeatureChecks?.isSO &&
                      currentStatus.status !== ORDER_STATUS[4]?.status &&
                      order &&
                      order.amountInvoiced &&
                      order?.amountInvoiced !== order?.totalWithOutTax) ||
                    (canEdit &&
                      !enableEdit &&
                      orderConfig?.subFeatureChecks?.isPO &&
                      currentStatus.status !== ORDER_STATUS[5]?.status &&
                      currentStatus.status !== ORDER_STATUS[4]?.status &&
                      order &&
                      !enableEdit &&
                      order?.amountInvoiced &&
                      order?.amountInvoiced !== order?.totalWithOutTax)
                      ? editHandler
                      : null
                  }
                  deleteHandler={
                    canDelete && currentStatus.status !== 'Confirmed' && currentStatus.status !== 'Canceled' ? deleteHandler : null
                  }
                  setShowMoreAction={setShowMoreActionToolbar}
                  statusBarItems={statusBarItems}
                  currentStatusLabel={currentStatus.label}
                />
              )}
              {showDelete && (
                <ConfirmationPopup
                  onClickHandler={() => setIsDelete(true)}
                  setConfirmationPopup={setShowDelete}
                  item={`${t('LBL_ORDER')} : ${order?.invoiceId}`}
                />
              )}
              {!isLoading && (
                <div className="row">
                  {(Object.keys(order).length > 0 || addNew) && (
                    <>
                      {!addNew && (
                        <OrdersForm
                          enableEdit={enableEdit}
                          data={order}
                          isSave={isSave}
                          isConfirm={isConfirm}
                          isDelete={isDelete}
                          finishedActionHandler={finishedActionHandler}
                          finishedFinishActionHandler={finishedFinishActionHandler}
                          alertHandler={alertHandler}
                          setActionInProgress={setActionInProgress}
                          currentStatus={currentStatus}
                          orderConfig={orderConfig}
                          disableActionButtons={disableActionButtons}
                          setIsGenerate={setIsGenerate}
                        />
                      )}
                      {addNew && (
                        <OrdersForm
                          data={order}
                          addNew={addNew}
                          isSave={isSave}
                          isConfirm={isConfirm}
                          isDelete={isDelete}
                          finishedActionHandler={finishedActionHandler}
                          finishedFinishActionHandler={finishedFinishActionHandler}
                          alertHandler={alertHandler}
                          setActionInProgress={setActionInProgress}
                          currentStatus={currentStatus}
                          orderConfig={orderConfig}
                          disableActionButtons={disableActionButtons}
                          setIsGenerate={setIsGenerate}
                        />
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrdersManagement;
