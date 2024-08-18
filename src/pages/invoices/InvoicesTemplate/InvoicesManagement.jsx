import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import Spinner from '../../../components/Spinner/Spinner';
import ConfirmationPopup from '../../../components/ConfirmationPopup';
import InvoicesForm from './InvoicesForm';
import ActionsProgessBar from '../../../parts/ActionsProgessBar';
import MoreAction from '../../../parts/MoreAction';
import BreadCrumb from '../../../components/ui/BreadCrumb';
import BackButton from '../../../components/ui/buttons/BackButton';
import Calendar from '../../../components/ui/Calendar';
import PrimaryButton from '../../../components/ui/buttons/PrimaryButton';
import CancelConfirmationPopup from '../../../components/CancelConfirmationPopup';
import PaymentRegistration from './PaymentRegistration';
import OTPModal from '../components/OTPModal';

import { useAxiosFunction } from '../../../hooks/useAxios';
import { getFetchUrl, getSearchUrl } from '../../../services/getUrl';
import { MODELS } from '../../../constants/models';
import { useFeatures } from '../../../hooks/useFeatures';
import { alertsActions } from '../../../store/alerts';
import {
  INVOICE_FETCH_FIELDS,
  INVOICE_LINES_FIELDS,
  INVOICE_PAYMENT_LIST_FIELDS,
  INVOICE_STATUS,
  REFUND_INVOICE_LIST_FIELDS,
} from './InvoicesConstants';
import { modelsEnum } from '../../../constants/modelsEnum/modelsEnum';
import { getActionUrl } from '../../../services/getUrl';
import { checkFlashOrError } from '../../../utils/helpers';
import { STOCK_MOVES_SEARCH_FIELDS } from '../../stockMoves/StockMovesPayloadsFields';
import { invoiceLinesActions } from '../../../store/invoiceLines';
import { ONLY_SIX_DIGITS } from '../../../constants/regex/Regex';
import { INVSTATUS_SELECT, INVOICE_STATUS_LABELS } from './InvoicesConstants';
import { tourStepsActions } from '../../../store/tourSteps';
import { useTourServices } from '../../../services/useTourServices';

const InvoicesManagement = ({ addNew, enableEdit, invoiceConfig }) => {
  const { api } = useAxiosFunction();
  const { canView, canEdit, canDelete, getFeaturePath } = useFeatures(invoiceConfig.feature, invoiceConfig.subFeature);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { addStepsOptions } = useTourServices();
  const isTour = useSelector(state => state.tourSteps.isTour);

  const [invoice, setInvoice] = useState({});
  const [showCancelPop, setShowCancelPop] = useState(false);
  const [isSave, setIsSave] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [isPost, setIsPost] = useState(false);
  const [isRefund, setIsRefund] = useState(false);
  const [isCancel, setIsCancel] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [showMoreActionToolbar, setShowMoreActionToolbar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPaymentReg, setShowPaymentReg] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [zatcaQRCode, setZatcaQRCode] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);

  const { id } = useParams();

  const alertHandler = (title, message) => {
    if (message) dispatch(alertsActions.initiateAlert({ title, message }));

    if (title !== 'Success' || !message) {
      setIsSave(false);
      setIsPost(false);
      setIsRefund(false);
      setIsCancel(false);
      setIsDelete(false);
      setIsLoading(false);
      setActionInProgress(false);
    }
  };

  const currentStatus = useMemo(() => {
    return addNew ? INVOICE_STATUS[1] : invoice.id ? INVOICE_STATUS.find(record => record.id === invoice.statusSelect) : INVOICE_STATUS[0];
  }, [invoice]);

  const currentStatusSelect = useMemo(() => {
    return addNew ? 1 : invoice?.statusSelect;
  }, [invoice]);

  const disableActionButtons = useMemo(() => {
    return isSave || isDelete || isPost || isRefund || isCancel;
  }, [isSave, isDelete, isPost, isRefund, isCancel]);

  let statusBarItems = [
    {
      label: 'LBL_DRAFT',
      className: 'done',
    },
    {
      label: 'LBL_VALIDATED_INV',
      className: currentStatusSelect >= INVSTATUS_SELECT.VALIDATED ? 'done' : 'default',
    },
    {
      label: 'LBL_POSTED',
      className: currentStatusSelect >= INVSTATUS_SELECT.POSTED ? 'done' : 'default',
    },
    {
      label: 'LBL_CANCELED',
      className: currentStatusSelect === INVSTATUS_SELECT.CANCELLED ? 'cancelled' : 'default',
    },
  ];

  const initialValues = {
    otp: '',
  };

  const validationSchema = Yup.object().shape({
    otp: Yup.string().required(t('ZATCA_OTP_VALIDATION_MESSAGE')).matches(ONLY_SIX_DIGITS, t('ZATCA_OTP_VALIDATION_MESSAGE_1')),
  });

  const OTPFormik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: true,
  });

  const finishedActionHandler = (status, message) => {
    setActionInProgress(false);

    if (status === 'Success') {
      alertHandler('Success', message || 'INVOICE_SAVED_AS_DRAFT_MESSAGE');
      setTimeout(() => {
        setIsSave(false);
        setIsPost(false);
        setIsRefund(false);
        setIsCancel(false);
        setIsDelete(false);
        navigate(getFeaturePath(invoiceConfig.subFeature));
      }, 3000);
    } else {
      setIsSave(false);
      setIsPost(false);
      setIsRefund(false);
      setIsCancel(false);
      setIsDelete(false);
      alertHandler(status || 'Error', message || 'SOMETHING_WENT_WRONG');
    }
  };

  const fetchElementData = async () => {
    setIsLoading(true);
    dispatch(invoiceLinesActions.resetInvoiceLines());

    const metaDataResponse = await api('POST', getSearchUrl(MODELS.METASELECT), {
      fields: ['title', 'value'],
      sortby: null,
      data: {
        _domain: 'self.select.name = :selectionName',
        _domainContext: {
          selectionName: 'liteaccounting.iinvoice.operation.sub.type.select',
        },
      },
    });

    if (!(metaDataResponse?.data?.status === 0) || !metaDataResponse?.data?.data) {
      setIsLoading(false);
      navigate('/error');
      return null;
    }

    let documentSubTypesOptions = [
      {
        name: 'LBL_PLEASE_SELECT',
        value: '',
      },
    ];

    if (metaDataResponse?.data?.total > 0) {
      metaDataResponse.data.data.forEach(item => {
        let temp = {
          name: item ? (item.title === 'Classic invoice' ? 'LBL_CLASSIC_INVOICE' : 'LBL_FREE_TEXT_INVOICE') : 'LBL_FREE_TEXT_INVOICE',
          value: item?.value ?? '',
        };
        documentSubTypesOptions.push(temp);
      });
    }

    const paymentModesResponse = await api('POST', getSearchUrl(MODELS.PAYMENTMODES), {
      fields: ['id', 'name', 'code'],
      sortBy: null,
      data: {
        _domain: `self.inOutSelect = ${invoiceConfig.subFeatureChecks.isOutgoingPayment ? '2' : '1'}`,
      },
      limit: -1,
      offset: 0,
      translate: true,
    });

    if (!(paymentModesResponse?.data?.status === 0) || !paymentModesResponse?.data?.data) {
      setIsLoading(false);
      navigate('/error');
      return null;
    }

    let paymentModesOptions = [];

    paymentModesResponse.data.data.forEach(paymentMode => {
      let obj = {
        name: paymentMode?.name ?? '',
        id: paymentMode ? (paymentMode.id ? paymentMode.id : -1) : -1,
      };
      paymentModesOptions.push(obj);
    });

    const paymentConditionsResponse = await api('POST', getSearchUrl(MODELS.PAYMENTCONDITION), {
      fields: ['id', 'name', 'code'],
      sortBy: null,
      data: { _domainContext: {} },
      limit: -1,
      offset: 0,
      translate: true,
    });

    if (!(paymentConditionsResponse?.data?.status === 0) || !paymentConditionsResponse?.data?.data) {
      setIsLoading(false);
      navigate('/error');
      return null;
    }

    let paymentConditionsOptions = [];

    paymentConditionsResponse.data.data.forEach(paymentCondition => {
      let obj = {
        name: paymentCondition?.name ?? '',
        id: paymentCondition ? (paymentCondition.id ? paymentCondition.id : -1) : -1,
      };
      paymentConditionsOptions.push(obj);
    });

    let operationTypeSelect = '';

    if (addNew) {
      const getNewInvoiceDataResponse = await api('POST', getActionUrl(), {
        model: MODELS.INVOICE,
        action: 'action-account-invoice-onnew-group,com.axelor.meta.web.MetaController:moreAttrs',
        data: {
          criteria: [],
          context: {
            _model: MODELS.INVOICE,
            _operationTypeSelect: invoiceConfig.operationTypeSelect,
            _id: null,
            todayDate: moment().locale('en').format('YYYY-MM-DD'),
            _viewType: 'form',
            _viewName: 'invoice-form',
            _views: [
              { type: 'grid', name: 'invoice-grid' },
              { type: 'form', name: 'invoice-form' },
            ],
            _source: 'form',
          },
        },
      });

      if (
        !(getNewInvoiceDataResponse?.data?.status === 0) ||
        !getNewInvoiceDataResponse?.data?.data ||
        checkFlashOrError(getNewInvoiceDataResponse?.data?.data)
      ) {
        setIsLoading(false);
        navigate('/error');
        return null;
      }

      if (getNewInvoiceDataResponse?.data?.data?.[0]?.values) {
        operationTypeSelect = getNewInvoiceDataResponse?.data?.data?.[0]?.values?.operationTypeSelect || '';
      }
    }

    if (addNew) {
      setIsLoading(false);
      return setInvoice({
        documentSubTypesOptions,
        paymentConditionsOptions,
        paymentModesOptions,
        operationTypeSelect,
      });
    }

    const fetchInvoiceResponse = await api('POST', getFetchUrl(MODELS.INVOICE, id), {
      fields: INVOICE_FETCH_FIELDS,
      related: {
        advancePaymentInvoiceSet: ['invoiceId'],
        invoicePaymentList: INVOICE_PAYMENT_LIST_FIELDS,
        refundInvoiceList: REFUND_INVOICE_LIST_FIELDS,
      },
    });

    if (!(fetchInvoiceResponse?.data?.status === 0) || !fetchInvoiceResponse?.data?.data?.[0]) {
      setIsLoading(false);
      navigate('/error');
      return null;
    }

    let fetchedInvoiceTemp = {
      ...fetchInvoiceResponse.data.data[0],
      operationSubTypeSelect: fetchInvoiceResponse.data.data[0]?.operationSubTypeSelect !== 8 ? '1' : '8',
    };
    let invoiceLinesIds = [];
    let invoicesLinestemp = [];

    if (fetchedInvoiceTemp.invoiceLineList && fetchedInvoiceTemp.invoiceLineList.length > 0) {
      fetchedInvoiceTemp.invoiceLineList.forEach(line => {
        if (line.id) {
          invoiceLinesIds.push(line.id);
        }
      });
      let invoiceLinesPayload = {
        fields: INVOICE_LINES_FIELDS,
        sortBy: ['sequence'],
        data: {
          _domain: 'self.id in (:_field_ids)',
          _domainContext: {
            id: id,
            _model: MODELS.INVOICE,
            _field: 'invoiceLineList',
            _field_ids: invoiceLinesIds,
          },
          _archived: true,
        },
        limit: -1,
        offset: 0,
        translate: true,
      };
      const invoiceLinesResponse = await api('POST', getSearchUrl(MODELS.INVOICELINE), invoiceLinesPayload);

      if (!(invoiceLinesResponse?.data?.status === 0) || !invoiceLinesResponse?.data?.data) {
        setIsLoading(false);
        navigate('/error');
        return null;
      }

      let invoiceLinesData = invoiceLinesResponse.data.data;

      if (invoiceLinesResponse?.data?.data?.length === 0) dispatch(invoiceLinesActions.setLines({ invoiceLines: [] }));

      let maxQuantityInvoiceLines = [];

      if (fetchedInvoiceTemp?.originalInvoice && currentStatusSelect === INVSTATUS_SELECT.POSTED) {
        let getMaxQuantityPayload = {
          model: MODELS.INVOICE,
          action: 'action-invoice-refund-remaining-product-qty',
          data: {
            criteria: [],
            context: {
              _model: MODELS.INVOICE,
              id: id,
            },
          },
        };
        const maxQtyResponse = await api('POST', getActionUrl(), getMaxQuantityPayload);

        if (!(maxQtyResponse?.data?.status === 0) || !maxQtyResponse?.data?.data) {
          setIsLoading(false);
          navigate('/error');
          return null;
        }

        if (!checkFlashOrError(maxQtyResponse.data.data)) {
          maxQuantityInvoiceLines = maxQtyResponse.data.data;
        }
      }

      let isMaxQty = fetchedInvoiceTemp && fetchedInvoiceTemp.originalInvoice && maxQuantityInvoiceLines?.length > 0;

      invoiceLinesData.forEach((line, index) => {
        let maxQuantity = maxQuantityInvoiceLines?.[index]?.qty;
        let temp = {
          lineId: uuidv4(),
          ...line,
        };
        if (isMaxQty) temp = { ...temp, maxQty: maxQuantity };
        invoicesLinestemp.push(temp);
      });

      dispatch(
        invoiceLinesActions.setLines({
          invoiceLines: invoicesLinestemp,
        })
      );
    }

    let hasOrigin = false;
    let stockLoc = null;
    let minDate = moment().locale('en').format('YYYY-MM-DD');

    if (fetchedInvoiceTemp && fetchedInvoiceTemp.stockMoveSet && fetchedInvoiceTemp.stockMoveSet.length > 0) {
      hasOrigin = true;
      const { stockLocation, invoiceMinDate } = await getStockMoves(fetchedInvoiceTemp);
      stockLoc = stockLocation;
      minDate = invoiceMinDate;
    }

    if (fetchedInvoiceTemp && fetchedInvoiceTemp?.saleOrder) {
      minDate = fetchedInvoiceTemp?.saleOrder?.orderDate;
    }
    if (fetchedInvoiceTemp && fetchedInvoiceTemp?.purchaseOrder) {
      minDate = fetchedInvoiceTemp?.purchaseOrder?.orderDate;
    }

    if (fetchedInvoiceTemp && fetchedInvoiceTemp?.originalInvoice) {
      minDate = fetchedInvoiceTemp?.originalInvoice?.invoiceDate;
    }

    if (fetchedInvoiceTemp.statusSelect >= 3 && !enableEdit && !addNew) {
      await getZatcaQRCode();
    }
    //getZatca

    setInvoice({
      ...fetchedInvoiceTemp,
      address: {
        ...fetchedInvoiceTemp.address,
        name: fetchedInvoiceTemp.address.fullName,
        id: fetchedInvoiceTemp.address.id,
        addressL4: fetchedInvoiceTemp.address.addressL4,
        addressL7Country: fetchedInvoiceTemp.address.addressL7Country,
      },
      documentSubTypesOptions,
      paymentConditionsOptions,
      paymentModesOptions,
      invoiceLines: invoicesLinestemp,
      hasOrigin,
      invoiceMinDate: minDate,
      stockLocation: stockLoc,
      isOriginStockMove: stockLoc ? true : false,
    });

    setIsLoading(false);
  };

  const getZatcaPayload = () => {
    let payload = {
      fields: ['qrCode', 'zatcaVerified', 'invoice'],
      sortby: null,
      data: {
        _domain: `self.invoice = ${id}`,
      },
    };
    return payload;
  };

  const getZatcaQRCode = async () => {
    const zatcaResponse = await api('POST', getSearchUrl(MODELS.ZATCA_QRCODE), getZatcaPayload());
    if (zatcaResponse.data.status !== 0) return;

    if (zatcaResponse?.data?.total === 1) {
      let zatcaData = zatcaResponse?.data?.data;

      if (zatcaData[0]?.invoice?.id === parseInt(id)) {
        setZatcaQRCode(zatcaData[0].qrCode);
        setShowQRCode(true);
      }
    }
  };

  const getStockMoves = async fetchedInvoice => {
    let payload;
    let invoiceType = invoiceConfig?.subFeatureChecks || null;

    payload = getInvoiceStockMovePayload(fetchedInvoice);

    let movesResponse = await api('POST', getSearchUrl(MODELS.STOCK_MOVE), payload);
    let tempLines = movesResponse.data.data;

    let stockLocation = null;
    let invoiceMinDate = moment().locale('en').format('YYYY-MM-DD');

    if (tempLines?.[0]?.origin) {
      const orderDateResponse = await api('POST', getSearchUrl(MODELS.PURCHASE_ORDER), {
        fields: ['orderDate'],
        data: {
          _domain: `self.purchaseOrderSeq='${tempLines?.[0]?.origin}'`,
          _domainContext: {
            _id: null,
            _model: MODELS.PURCHASE_ORDER,
          },
          operator: 'and',
          criteria: [],
        },
        operator: 'and',
        criteria: [],
        limit: 1,
        offset: 0,
        translate: true,
      });
      const orderDate = orderDateResponse?.data?.data?.[0]?.orderDate;
      if (orderDate) invoiceMinDate = moment(orderDate).locale('en').format('YYYY-MM-DD');
    }

    if (tempLines && tempLines.length > 0) {
      stockLocation =
        invoiceType && invoiceType.isCustomerRelated ? tempLines?.[0]?.fromStockLocation || null : tempLines?.[0]?.toStockLocation || null;
    }

    return { stockLocation, invoiceMinDate };
  };

  const getInvoiceStockMovePayload = data => {
    let fieldsIds = [];
    data &&
      data.stockMoveSet &&
      data.stockMoveSet.length > 0 &&
      data.stockMoveSet.forEach(item => {
        fieldsIds.push(item.id);
      });
    let payload = {
      fields: STOCK_MOVES_SEARCH_FIELDS,
      sortBy: ['statusSelect', '-estimatedDate'],
      data: {
        _domain: 'self.id in (:_field_ids)',
        _domainContext: { id: data.id, _model: MODELS.INVOICE, _field: 'stockMoveSet', _field_ids: fieldsIds },
        _archived: true,
      },
      limit: -1,
      offset: 0,
      translate: true,
    };
    return payload;
  };

  const viewHandler = () => {
    navigate(getFeaturePath(invoiceConfig.subFeature, 'view', { id }));
    setShowMoreActionToolbar(false);
  };

  const editHandler = () => {
    navigate(getFeaturePath(invoiceConfig.subFeature, 'edit', { id }));
    setShowMoreActionToolbar(false);
  };

  const deleteHandler = () => {
    setShowDelete(true);
  };

  const onOTPCloseHandler = () => {};

  const onOTPConfirmHandler = () => {};

  useEffect(() => {
    if (invoiceConfig.tourConfig && isTour === 'true' && !isLoading) {
      addStepsOptions(invoiceConfig.tourConfig?.addSteps);
      dispatch(tourStepsActions.setIsTour('true'));
      dispatch(tourStepsActions.setSpotlightClick(true));
      dispatch(tourStepsActions.setSteps({ steps: invoiceConfig.tourConfig?.addSteps }));
    }
  }, [isTour, isLoading]);

  useEffect(() => {
    fetchElementData();
  }, [addNew, enableEdit]);

  let isDraft = currentStatusSelect === INVSTATUS_SELECT.DRAFT;
  let isValidated = currentStatusSelect === INVSTATUS_SELECT.VALIDATED;
  let isPosted = currentStatusSelect === INVSTATUS_SELECT.POSTED;
  let isCancelled = currentStatusSelect === INVSTATUS_SELECT.CANCELLED;

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
                feature={invoiceConfig.feature}
                subFeature={invoiceConfig.subFeature}
                modeText={
                  !addNew && enableEdit
                    ? `${t('LBL_EDIT')} ${t(modelsEnum[invoiceConfig.modelsEnumKey].titleSingular)}`
                    : !addNew && !enableEdit
                      ? `${t('LBL_VIEW')} ${t(modelsEnum[invoiceConfig.modelsEnumKey].titleSingular)}`
                      : `${t('LBL_ADD_NEW')} ${t(modelsEnum[invoiceConfig.modelsEnumKey].titleSingular)}`
                }
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{addNew ? t(invoiceConfig.newLabel) : invoice.invoiceId ? invoice.invoiceId : ''}</h4>
              </div>

              <div className="reverse-page float-end">
                <BackButton disabled={isSave || isDelete} text={addNew ? 'LBL_CANCEL' : 'LBL_BACK'} />
                {enableEdit && !isPosted && (
                  <PrimaryButton theme="red" disabled={disableActionButtons} onClick={() => setShowCancelPop(true)} />
                )}
                {(addNew || enableEdit) && isDraft && (
                  <PrimaryButton
                    className={invoiceConfig.tourConfig?.stepAddSubmit || undefined}
                    disabled={disableActionButtons}
                    onClick={() => setIsSave(true)}
                  />
                )}
                {enableEdit && (isDraft || isValidated) && (
                  <PrimaryButton text="LBL_POST" disabled={disableActionButtons} onClick={() => setIsPost(true)} />
                )}
                {isPosted && invoice && parseFloat(invoice.amountRemaining) > 0.0 && enableEdit && (
                  <PrimaryButton text="LBL_PAYMENT_REGISTER" disabled={disableActionButtons} onClick={() => setShowPaymentReg(true)} />
                )}
                {isPosted && enableEdit && !invoiceConfig.subFeatureChecks.isNote && (
                  <PrimaryButton text="LBL_REFUND" disabled={disableActionButtons} onClick={() => setIsRefund(true)} />
                )}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              {!isLoading && !addNew && (
                <ActionsProgessBar
                  feature={invoiceConfig.feature}
                  subfeature={invoiceConfig.subFeature}
                  viewHandler={canView && enableEdit ? viewHandler : null}
                  editHandler={
                    (canEdit && !enableEdit && !invoiceConfig?.subFeatureChecks?.isNote && !isCancelled) ||
                    (canEdit &&
                      !enableEdit &&
                      invoiceConfig?.subFeatureChecks?.isNote &&
                      invoice &&
                      invoice.amountRemaining !== '0.00' &&
                      !isCancelled)
                      ? editHandler
                      : null
                  }
                  deleteHandler={canDelete && !isPosted && !isCancelled ? deleteHandler : null}
                  setShowMoreAction={setShowMoreActionToolbar}
                  statusBarItems={statusBarItems}
                  currentStatusLabel={INVOICE_STATUS_LABELS[currentStatusSelect]}
                />
              )}
              {showDelete && (
                <ConfirmationPopup
                  onClickHandler={() => setIsDelete(true)}
                  setConfirmationPopup={setShowDelete}
                  item={`${t(invoiceConfig.subFeatureChecks.isInvoice ? 'LBL_INVOICE' : 'LBL_NOTE')} : ${invoice?.invoiceId}`}
                />
              )}
              {showCancelPop && (
                <CancelConfirmationPopup
                  onClickHandler={() => setIsCancel(true)}
                  setConfirmationPopup={setShowCancelPop}
                  item={`${t(invoiceConfig.subFeatureChecks.isInvoice ? 'LBL_INVOICE' : 'LBL_NOTE')} : ${invoice?.invoiceId || ''}`}
                />
              )}
              {!isLoading && (
                <div className="row">
                  {(Object.keys(invoice).length > 0 || addNew) && (
                    <>
                      {!addNew && (
                        <InvoicesForm
                          enableEdit={enableEdit}
                          data={invoice}
                          isSave={isSave}
                          isPost={isPost}
                          isRefund={isRefund}
                          isCancel={isCancel}
                          isDelete={isDelete}
                          finishedActionHandler={finishedActionHandler}
                          alertHandler={alertHandler}
                          setActionInProgress={setActionInProgress}
                          currentStatus={currentStatus}
                          invoiceConfig={invoiceConfig}
                          OTPFormik={OTPFormik}
                          showOTPModal={showOTPModal}
                          setShowOTPModal={setShowOTPModal}
                          zatcaQRCode={zatcaQRCode}
                          showQRCode={showQRCode}
                          fetchElementData={fetchElementData}
                          currentStatusSelect={currentStatusSelect}
                        />
                      )}
                      {addNew && (
                        <InvoicesForm
                          data={invoice}
                          addNew={addNew}
                          isSave={isSave}
                          isPost={isPost}
                          isRefund={isRefund}
                          isCancel={isCancel}
                          isDelete={isDelete}
                          finishedActionHandler={finishedActionHandler}
                          alertHandler={alertHandler}
                          setActionInProgress={setActionInProgress}
                          currentStatus={currentStatus}
                          currentStatusSelect={currentStatusSelect}
                          invoiceConfig={invoiceConfig}
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
      {showPaymentReg && (
        <PaymentRegistration
          show={showPaymentReg}
          setShow={setShowPaymentReg}
          fetchedInvoice={invoice}
          isSupplierInvoice={invoiceConfig.subFeatureChecks.isSupplierInvoice}
          isCustomerInvoice={invoiceConfig.subFeatureChecks.isCustomerInvoice}
          isSupplierRefund={invoiceConfig.subFeatureChecks.isDebitNote}
          isCustomerRefund={invoiceConfig.subFeatureChecks.isCreditNote}
        />
      )}
      {showOTPModal && (
        <OTPModal
          formik={OTPFormik}
          showOTPModal={showOTPModal}
          setShowOTPModal={setShowOTPModal}
          onCloseHandler={onOTPCloseHandler}
          onConfirmHandler={onOTPConfirmHandler}
        />
      )}
    </>
  );
};

export default InvoicesManagement;
