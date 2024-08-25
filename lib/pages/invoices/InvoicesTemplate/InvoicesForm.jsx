import { useEffect, useMemo, useState } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

import TextInput from '../../../components/ui/inputs/TextInput';
import DropDown from '../../../components/ui/inputs/DropDown';
import InvoicesTaxTotalsTop from '../../../components/TotalsCards/InvoicesTaxTotalsTop';
import SearchModalAxelor from '../../../components/ui/inputs/SearchModal/SearchModalAxelor';
import BorderSection from '../../../components/ui/inputs/BorderSection';
import DateInput from '../../../components/ui/inputs/DateInput';
import Tabs from '../../../components/ui/inputs/Tabs';
import InvoiceLines from '../components/InvoiceLines';
import PaymentLines from './PaymentLines';
import RefundInvoiceList from './RefundInvoiceList';
import InvoicesTaxTotals from '../../../components/TotalsCards/InvoicesTaxTotals';
import AttachmentInput from '../../../components/ui/inputs/AttachmentInput';
import InvoiceDeliveryTab from '../components/InvoiceDeliveryTab';
import MoreAction from '../../../parts/MoreAction';
import FormNotes from '../../../components/ui/FormNotes';

import { MODELS } from '../../../constants/models';
import { useAxiosFunction } from '../../../hooks/useAxios';
import { getModelUrl, getRemoveAllUrl, getActionUrl } from '../../../services/getUrl';
import { VALID_TEXT_WITH_SPECIAL_CHARS } from '../../../constants/regex/Regex';
import { useTabs } from '../../../hooks/useTabs';
import { invoiceLinesActions } from '../../../store/invoiceLines';
import { checkFlashOrError } from '../../../utils/helpers';
import { getVerifyUrl } from '../../../services/getUrl';
import { useFeatures } from '../../../hooks/useFeatures';
import { setSelectedValues } from '../../../utils/formHelpers';
import { useFormikSubmit } from '../../../hooks/useFormikSubmit';
import { INVSTATUS_SELECT } from './InvoicesConstants';

const InvoicesForm = ({
  enableEdit,
  data,
  addNew,
  isSave,
  isPost,
  isRefund,
  isCancel,
  isDelete,
  finishedActionHandler,
  alertHandler,
  setActionInProgress,
  currentStatus,
  invoiceConfig,
  OTPFormik,
  setShowOTPModal,
  showQRCode,
  zatcaQRCode,
  fetchElementData,
  currentStatusSelect,
}) => {
  const { api } = useAxiosFunction();
  const { t } = useTranslation();
  const tabsProps = useTabs();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { getFeaturePath } = useFeatures(invoiceConfig.feature, invoiceConfig.subFeature);

  const invoiceLines = useSelector(state => state.invoiceLines.invoiceLines);
  const companyMainData = useSelector(state => state.userFeatures.companyInfo.mainData);

  const company = useSelector(state => state.userFeatures.companyInfo.company);
  const zatcaIsEnabled = useSelector(state => state.userFeatures.companyInfo.companyInfoProvision.zatca_is_enabled);

  const [deletedLine, setDeletedLine] = useState({});
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [show, setShow] = useState(false);
  const [edit, setEdit] = useState(false);
  const [showRows, setShowRows] = useState([]);
  const [parentSaveDone, setParentSaveDone] = useState(false);
  const [isPaymentDetailsFetched, setIsPaymentDetailsFetched] = useState(false);
  const [fetchedObject, setFetchedObject] = useState(data ?? null);

  const initialValues = {
    invoiceId: data?.invoiceId || '',
    operationTypeSelect: data?.operationTypeSelect || '',
    operationSubTypeSelect: data?.operationSubTypeSelect || '',
    printingSettings: data?.printingSettings || null,
    currency: data?.currency || null,
    partner: data?.partner || null,
    paymentMode: data?.paymentMode?.id?.toString() || '',
    paymentCondition: data?.paymentCondition?.id?.toString() || '',
    address: data?.address || null,
    supplierInvoiceNb: data?.supplierInvoiceNb || '',
    invoiceDate: data?.invoiceDate || '',
    deliveryAddressStr: data?.deliveryAddressStr || '',
    stockLocation:
      invoiceConfig?.stockMangamentAvaiable && invoiceConfig.subFeatureChecks.isNote && data?.originalInvoice
        ? data?.originalInvoice?.invoiceStockLocation?.stockLocation || null
        : data?.invoiceStockLocation?.stockLocation
          ? data?.invoiceStockLocation?.stockLocation
          : data?.stockLocation || null,
  };

  const validationSchema = Yup.object({
    operationSubTypeSelect: Yup.string()
      .matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS'))
      .trim()
      .required(t('DOCUMENT_TYPE_VALIDATION_MESSAGE')),
    printingSettings: Yup.object().nullable(),
    currency: Yup.object().required(t('CUSTOMER_CURRENCY_VALIDATION_MESSAGE')).nullable(),
    partner: Yup.object().required(t('PARTNER_VALIDATION_MESSAGE')).nullable(),
    paymentMode: Yup.string()
      .matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS'))
      .trim()
      .required(t('CUSTOMER_PAYMENT_VALIDATION_MESSAGE')),
    paymentCondition: Yup.string()
      .matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS'))
      .trim()
      .required(t('PAYMENT_CONDITION_VALIDATION_MESSAGE')),
    address: Yup.object().required(t('ADDRESS_VALIDATION_MESSAGE')).nullable(),
    supplierInvoiceNb: Yup.string().when([], {
      is: () => invoiceConfig.subFeatureChecks.isSupplierRelated,
      then: Yup.string()
        .matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS'))
        .trim()
        .required(t('SUPPLIER_INVOICE_NUMBER_VALIDATION_MESSAGE')),
    }),
    invoiceDate: data?.isOriginStockMove
      ? Yup.date()
          .required(t('ORIGIN_DATE_VALIDATION_MESSAGE'))
          .min(
            data?.invoiceMinDate,
            t(invoiceConfig.subFeatureChecks.isInvoice ? 'VALIDATION_INVOICE_MIN_DATE_ORDER' : 'VALIDATION_NOTE_MIN_DATE_ORDER')
          )
      : invoiceConfig.subFeatureChecks?.isNote && data?.originalInvoice?.invoiceDate
        ? Yup.date()
            .required(t('ORIGIN_DATE_VALIDATION_MESSAGE'))
            .min(moment(data?.originalInvoice?.invoiceDate).locale('en').format('YYYY-MM-DD'), t('VALIDATION_INVOICE_MIN_DATE_INVOICE'))
        : Yup.date().required(t('ORIGIN_DATE_VALIDATION_MESSAGE')),
    deliveryAddressStr: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).trim(),
    stockLocation: invoiceConfig?.stockMangamentAvaiable
      ? Yup.object().required(t('STOCK_LOCATION_VALIDATION_MESSAGE')).nullable()
      : Yup.object().nullable(),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: true,
  });

  const { validateFormForSubmit } = useFormikSubmit(formik, alertHandler);

  const { totalWithoutTax, totalTax, totalWithTax } = useMemo(() => {
    let totalWithoutTax = 0;
    let totalTax = 0;
    let totalWithTax = 0;

    if (invoiceLines?.length > 0) {
      invoiceLines.forEach(line => {
        totalWithoutTax = totalWithoutTax + parseFloat(line.companyExTaxTotal);
        totalWithTax = totalWithTax + parseFloat(line.companyInTaxTotal);
        totalTax = totalWithTax - totalWithoutTax;
      });
    }

    return { totalWithoutTax, totalTax, totalWithTax };
  }, [invoiceLines]);

  let invoiceDataContext = {
    todayDate: moment().locale('en').format('YYYY-MM-DD'),
    invoicesCopySelect: 1,
    amountRemaining: parseFloat(totalWithTax).toFixed(2).toString(),
    operationTypeSelect: invoiceConfig?.operationTypeSelect,
    supplierInvoiceNb: formik.values.supplierInvoiceNb,
    originDate: moment(formik.values.invoiceDate).locale('en').format('YYYY-MM-DD'),
    invoiceDate: moment(formik.values.invoiceDate).locale('en').format('YYYY-MM-DD'),
    debitBlockingOk: false,
    doubtfulCustomerOk: false,
    groupProductsOnPrintings: false,
    'partner.factorizedCustomer': false,
    remainingAmountAfterFinDiscount: '0',
    displayStockMoveOnInvoicePrinting: false,
    companyTaxTotal: parseFloat(totalTax).toFixed(2).toString(),
    pfpValidateStatusSelect: 0,
    amountPaid: '0',
    companyInTaxTotalRemaining: parseFloat(totalWithTax).toFixed(2).toString(),
    statusSelect: 1,
    companyInTaxTotal: parseFloat(totalWithTax).toFixed(2).toString(),
    operationSubTypeSelect: !addNew
      ? data?.operationSubTypeSelect !== 8 && data?.operationSubTypeSelect !== 1
        ? data?.operationSubTypeSelect
        : parseInt(formik.values.operationSubTypeSelect)
      : parseInt(formik.values.operationSubTypeSelect),
    companyExTaxTotal: parseFloat(totalWithoutTax).toFixed(2).toString(),
    taxTotal: parseFloat(totalTax).toFixed(2).toString(),
    inTaxTotal: parseFloat(totalWithTax).toFixed(2).toString(),
    exTaxTotal: parseFloat(totalWithoutTax).toFixed(2).toString(),
    currency: formik.values.currency ? formik.values.currency : null,
    company: company || null,
    paymentMode: formik.values.paymentMode
      ? {
          id: parseInt(formik.values.paymentMode),
        }
      : null,
    paymentCondition: formik.values.paymentCondition
      ? {
          id: parseInt(formik.values.paymentCondition),
        }
      : null,
    partner: formik.values.partner || null,
    address: formik.values.address || null,
    invoiceLineList: invoiceLines || [],
    printingSettings: formik.values.printingSettings || null,
    deliveryAddressStr: invoiceConfig?.stockMangamentAvaiable ? formik.values.deliveryAddressStr || null : null,
    validatedDate: data?.validatedDate || undefined,
    invoiceStockLocation: invoiceConfig?.stockMangamentAvaiable
      ? {
          stockLocation: formik.values.stockLocation,
        }
      : null,
    language: {
      code: 'en',
      name: 'English',
      id: 1,
    },
  };

  const onAddressSearchSuccess = response => {
    if (response.data.status === 0) {
      let addresses = [];
      let data = response?.data?.data || [];

      if (data) {
        data.forEach(address => {
          let temp = {
            name: address ? (address['address.fullName'] ? address['address.fullName'] : '') : '',
            id: address ? (address.id ? address.id : '') : '',
            addressL4: address ? (address['address.addressL4'] ? address['address.addressL4'] : '') : '',
            addressL7Country: address ? (address['address.addressL7Country'] ? address['address.addressL7Country'] : '') : '',
          };
          addresses.push(temp);
        });
      }

      return { displayedData: [...addresses], total: response.data.total || 0 };
    }
  };

  const onSaveInvoice = async () => {
    const isValid = await validateFormForSubmit();
    if (!isValid) return null;

    if (!invoiceLines?.length > 0) return finishedActionHandler('Error', 'INVOICE_LINES_ERROR_MESSAGE');

    if (formik.values.operationSubTypeSelect === '1') {
      let productIsNull = invoiceLines?.filter(item => item.product === null)?.length > 0 ? true : false;

      if (productIsNull) return finishedActionHandler('Warning', 'CLASSIC_INVOICE_WARNING');
    }

    setActionInProgress(true);
    let actionPayload = {
      model: MODELS.INVOICE,
      action: 'action-validate-invoice-ckeck-duplicate-same-nbr-year-partner',
      data: {
        criteria: [],
        context: enableEdit
          ? {
              ...invoiceDataContext,
              id: data.id,
              version: data.version,
              invoiceStockLocation: invoiceConfig?.stockMangamentAvaiable
                ? {
                    stockLocation: formik.values.stockLocation,
                    id: data?.invoiceStockLocation?.id || null,
                    version: data?.invoiceStockLocation?.$version ?? undefined,
                  }
                : null,
            }
          : invoiceDataContext,
      },
    };

    const validateInvoiceResponse = await api('POST', getActionUrl(), actionPayload);

    if (!(validateInvoiceResponse?.data?.status === 0)) return finishedActionHandler('Error', 'SOMETHING_WENT_WRONG');

    if (
      validateInvoiceResponse?.data?.status === -1 &&
      validateInvoiceResponse?.data?.data?.message === '    &#8226; [analyticJournal] - may not be null\n'
    )
      return finishedActionHandler('Error', 'LBL_MISSING_ANALYTIC_JOURNAL');

    let savePayload = { data: { ...invoiceDataContext } };
    if (enableEdit)
      savePayload = {
        data: {
          ...invoiceDataContext,
          id: data.id,
          version: data.version,
          invoiceStockLocation: invoiceConfig?.stockMangamentAvaiable
            ? {
                stockLocation: formik.values.stockLocation,
                id: data?.invoiceStockLocation?.id || null,
                version: data?.invoiceStockLocation?.$version ?? undefined,
              }
            : null,
        },
      };

    const saveResponse = await api('POST', getModelUrl(MODELS.INVOICE), savePayload);
    if (!(saveResponse.data.status === 0)) return finishedActionHandler('Error', 'SOMETHING_WENT_WRONG');

    setFetchedObject(saveResponse?.data?.data?.[0]);
    setParentSaveDone(true);
  };

  const onValidateInvoice = async () => {
    const isValid = await validateFormForSubmit();
    if (!isValid) return null;

    if (!invoiceLines?.length > 0) return finishedActionHandler('Error', 'INVOICE_LINES_ERROR_MESSAGE');

    if (formik.values.operationSubTypeSelect === '1') {
      let productIsNull = invoiceLines?.filter(item => item.product === null)?.length > 0 ? true : false;

      if (productIsNull) return finishedActionHandler('Warning', 'CLASSIC_INVOICE_WARNING');
    }

    setActionInProgress(true);
    let savePayload = {
      data: {
        ...invoiceDataContext,
        id: data.id,
        version: data.version,
        invoiceStockLocation: invoiceConfig?.stockMangamentAvaiable
          ? {
              stockLocation: formik.values.stockLocation,
              id: data?.invoiceStockLocation?.id || null,
              version: data?.invoiceStockLocation?.$version ?? undefined,
            }
          : null,
      },
    };

    const saveInvoiceResponse = await api('POST', getModelUrl(MODELS.INVOICE), savePayload);
    if (!(saveInvoiceResponse?.data?.status === 0)) return finishedActionHandler('Error', 'SOMETHING_WENT_WRONG');

    let validatePayload = {
      model: MODELS.INVOICE,
      action: 'action-invoice-method-validate',
      data: {
        criteria: [],
        context: {
          ...invoiceDataContext,
          id: data.id,
          version: data.version,
          invoiceStockLocation: invoiceConfig?.stockMangamentAvaiable
            ? {
                stockLocation: formik.values.stockLocation,
                id: data?.invoiceStockLocation?.id || null,
                version: data?.invoiceStockLocation?.$version ?? undefined,
              }
            : null,
          invoiceId: `#${data.id}`,
          _source: 'validateBtn',
        },
      },
    };
    const validateResponse = await api('POST', getActionUrl(), validatePayload);

    if (!(validateResponse.data.status === 0) || !validateResponse?.data?.data)
      return finishedActionHandler('Error', 'SOMETHING_WENT_WRONG');

    let validateData = validateResponse.data.data;

    if (checkFlashOrError(validateData)) {
      if (validateData[0]?.flash?.includes('SMI-003') || validateData[0]?.error?.includes('SMI-003'))
        return finishedActionHandler('Error', 'LBL_NO_REMAINING_QTY_TO_POST');

      if (validateData[0].flash && validateData[0].flash.includes('IR1'))
        return finishedActionHandler('Error', 'INVOICE_REFUND_PRODUCT_NOT_EXIST_MESSAGE');

      if (validateData[0].flash && validateData[0].flash.includes('IR2'))
        return finishedActionHandler('Error', 'INVOICE_REFUND_PRODUCT_NO_REMAINING_QUANTITIES_MESSAGE');

      if (validateData[0].flash && validateData[0].flash.includes('IR3'))
        return finishedActionHandler('Error', 'INVOICE_REFUND_PRODUCT_MORE_THAN_EXISTING_IN_INVOICE_MESSAGE');

      return finishedActionHandler('Error', 'SOMETHING_WENT_WRONG');
    }

    if (!invoiceConfig.onePostAction) return setParentSaveDone(true);

    await onVentilateInvoice();
  };

  const onVentilateInvoice = async () => {
    const isValid = await validateFormForSubmit();
    if (!isValid) return null;

    if (!invoiceLines?.length > 0) return finishedActionHandler('Error', 'INVOICE_LINES_ERROR_MESSAGE');
    let saveVentilatePayload = {
      model: MODELS.INVOICE,
      action:
        'save,action-invoice-method-check-not-lettered-advance-payment-move-lines,action-invoice-method-check-not-imputed-refunds,action-invoice-method-ventilate',
      data: {
        criteria: [],
        context: {
          ...invoiceDataContext,
          id: data.id,
          version: data.version,
          invoiceStockLocation: invoiceConfig?.stockMangamentAvaiable
            ? {
                stockLocation: formik.values.stockLocation,
                id: data?.invoiceStockLocation?.id || null,
                version: data?.invoiceStockLocation?.$version ?? undefined,
              }
            : null,
          statusSelect: 2,
        },
      },
    };
    const saveVentilateResponse = await api('POST', getActionUrl(), saveVentilatePayload);
    if (!(saveVentilateResponse.data.status === 0) || !saveVentilateResponse?.data?.data)
      return finishedActionHandler('Error', 'SOMETHING_WENT_WRONG');

    let saveVentilatedData = saveVentilateResponse.data.data;

    if (
      checkFlashOrError(saveVentilatedData) &&
      saveVentilatedData[0].flash &&
      saveVentilatedData[0].flash.includes('Note: there are existing not imputed')
    )
      alertHandler('Warning', 'EXISTING_NOTES');

    if (
      checkFlashOrError(saveVentilatedData) &&
      saveVentilatedData[0].flash &&
      saveVentilatedData[0].flash.includes('No period found or it has been closed')
    ) {
      alertHandler('Error', 'LBL_NO_PERIOD_FOUND_OR_CLOSED');
      return fetchElementData();
    }

    let ventilatePayload = {
      model: MODELS.INVOICE,
      action:
        'action-invoice-method-check-not-lettered-advance-payment-move-lines,action-invoice-method-check-not-imputed-refunds,action-invoice-method-ventilate',
      data: {
        criteria: [],
        context: {
          ...invoiceDataContext,
          id: data.id,
          version: data.version,
          invoiceStockLocation: invoiceConfig?.stockMangamentAvaiable
            ? {
                stockLocation: formik.values.stockLocation,
                id: data?.invoiceStockLocation?.id || null,
                version: data?.invoiceStockLocation?.$version ?? undefined,
              }
            : null,
          statusSelect: 2,
        },
      },
    };
    const ventilateResponse = await api('POST', getActionUrl(), ventilatePayload);
    if (!(ventilateResponse.data.status === 0) || !ventilateResponse?.data?.data)
      return finishedActionHandler('Error', 'SOMETHING_WENT_WRONG');

    let ventilatedData = ventilateResponse.data.data;

    if (
      checkFlashOrError(ventilatedData) &&
      ventilatedData[0].flash &&
      ventilatedData[0].flash.includes('Note: there are existing not imputed')
    )
      alertHandler('Warning', 'EXISTING_NOTES');

    if (
      checkFlashOrError(ventilatedData) &&
      ventilatedData[0].flash &&
      ventilatedData[0].flash.includes('No period found or it has been closed')
    ) {
      alertHandler('Error', 'LBL_NO_PERIOD_FOUND_OR_CLOSED');
      return fetchElementData();
    }

    if (
      invoiceConfig.subFeatureChecks.isCustomerInvoice ||
      invoiceConfig.subFeatureChecks.isCreditNote ||
      invoiceConfig.subFeatureChecks.isDebitNote ||
      invoiceConfig.subFeatureChecks.isSupplierInvoice
    ) {
      if (companyMainData?.taxNumberList?.length > 0 && companyMainData?.taxNumberList?.[0]?.taxNbr?.length > 0) {
        await checkAndGenerateZatca();
      } else {
        if (zatcaIsEnabled) {
          zatcaV2Reporting();
        } else {
          setParentSaveDone(true);
          sendInvoiceEmail();
        }
      }
    } else {
      setParentSaveDone(true);
      sendInvoiceEmail();
    }
  };

  const zatcaV2Reporting = async () => {
    let payload =
      OTPFormik.values.otp !== undefined && OTPFormik.values.otp !== ''
        ? {
            action: 'action-zatca-otp',
            data: {
              OTP: parseInt(OTPFormik.values.otp),
            },
          }
        : {
            action: 'action-zatca-otp',
          };

    const zatcaResponse = await api('POST', getActionUrl(), payload);
    setShowOTPModal(false);

    if (zatcaResponse.data.status === -1) {
      alertHandler('Error', t('PLEASE_ENTER_A_VALID_OTP'));
      setTimeout(() => {
        setShowOTPModal(true);
      }, [3000]);
    } else {
      // reportInvoice();
    }
  };

  const checkAndGenerateZatca = async () => {
    const zatcaResponse = await api('POST', getActionUrl(), {
      action: 'action-zatca-qr-creation',
      data: {
        invoiceId: parseInt(data.id),
      },
    });

    if (zatcaResponse.data.status !== 0) return finishedActionHandler('Error', 'SOMETHING_WENT_WRONG');

    if (!zatcaIsEnabled) {
      setParentSaveDone(true);
      sendInvoiceEmail();
    } else {
      zatcaV2Reporting();
    }
  };

  const sendInvoiceEmail = async () => {
    const emailResponse = await api('POST', getActionUrl(), {
      action: 'action-notification-email',
      data: {
        context: {
          type: 'invoice',
          resourceId: parseInt(data.id),
        },
      },
    });

    if (!(emailResponse?.data?.status === 0)) {
      if (emailResponse?.data?.data?.[0]?.error === 'NOT-006') return alertHandler('Error', 'ERROR_INVOICE_NOT_POSTED');
      alertHandler('Error', 'ERROR_INVOICE_FAILED_TO_GEN_REPORT');
    }
  };

  const onCancelInvoice = async () => {
    setActionInProgress(true);

    let cancelPayload = {
      model: MODELS.INVOICE,
      action: 'action-invoice-method-cancel',
      data: {
        criteria: [],
        context: {
          ...invoiceDataContext,
          id: data.id,
          version: data.version,
          invoiceStockLocation: invoiceConfig?.stockMangamentAvaiable
            ? {
                stockLocation: formik.values.stockLocation,
                id: data?.invoiceStockLocation?.id || null,
                version: data?.invoiceStockLocation?.$version ?? undefined,
              }
            : null,
          statusSelect: 2,
        },
      },
    };
    const cancelResponse = await api('POST', getActionUrl(), cancelPayload);

    if (!(cancelResponse?.data?.status === 0) || !cancelResponse?.data?.data) return finishedActionHandler('Error', 'SOMETHING_WENT_WRONG');

    if (checkFlashOrError(cancelResponse.data.data)) {
      let flash = cancelResponse.data.data[0].flash;
      if (flash && flash.includes('Invoice canceled')) {
        return finishedActionHandler('Success', 'INVOICE_CANCELED_MESSAGE');
      } else return finishedActionHandler('Error', 'SOMETHING_WENT_WRONG');
    }

    return finishedActionHandler('Success', 'INVOICE_CANCELED_MESSAGE');
  };

  const onRefundInvoice = async () => {
    const isValid = await validateFormForSubmit();
    if (!isValid) return null;

    if (!invoiceLines?.length > 0) return finishedActionHandler('Error', 'INVOICE_LINES_ERROR_MESSAGE');
    setActionInProgress(true);
    let refundPayload = {
      model: MODELS.INVOICE,
      action: 'action-invoice-method-create-refund',
      data: {
        criteria: [],
        context: {
          ...invoiceDataContext,
          id: data.id,
          version: data.version,
          statusSelect: 2,
          invoiceStockLocation: invoiceConfig?.stockMangamentAvaiable
            ? {
                stockLocation: formik.values.stockLocation,
                id: data?.invoiceStockLocation?.id || null,
                version: data?.invoiceStockLocation?.$version ?? undefined,
              }
            : null,
        },
      },
    };
    const refundResponse = await api('POST', getActionUrl(), refundPayload);
    setActionInProgress(false);
    if (!(refundResponse?.data?.status === 0) || !refundResponse?.data?.data) return finishedActionHandler('Error', 'SOMETHING_WENT_WRONG');

    let refundData = refundResponse.data.data;

    if (checkFlashOrError(refundData)) {
      if (refundData[0].flash && refundData[0].flash.includes('IR0'))
        return finishedActionHandler('Error', 'INVOICE_REFUND_NO_REMAINING_UNREFUNDED_PRODUCT_MESSAGE');

      if (refundData[0].flash && refundData[0].flash.includes('IR1'))
        return finishedActionHandler('Error', 'INVOICE_REFUND_PRODUCT_NOT_EXIST_MESSAGE');

      if (refundData[0].flash && refundData[0].flash.includes('IR2'))
        return finishedActionHandler('Error', 'INVOICE_REFUND_PRODUCT_NO_REMAINING_QUANTITIES_MESSAGE');

      if (refundData[0].flash && refundData[0].flash.includes('IR3'))
        return finishedActionHandler('Error', 'INVOICE_REFUND_PRODUCT_MORE_THAN_EXISTING_IN_INVOICE_MESSAGE');

      return finishedActionHandler('Error', 'SOMETHING_WENT_WRONG');
    }

    let verfiyRefundPaylaod = {
      data: {
        id: data.id,
        version: data.version,
      },
    };
    const verifyRefundResponse = await api('POST', getVerifyUrl(MODELS.INVOICE), verfiyRefundPaylaod);
    if (!(verifyRefundResponse.data.status === 0)) return finishedActionHandler('Error', 'SOMETHING_WENT_WRONG');

    let refundId = refundData?.[0]?.view?.context?.['_showRecord'] || -1;
    alertHandler('Success', 'INVOICE_REFUNDED_MESSAGE');

    setTimeout(() => {
      if (refundId && parseInt(refundId) !== -1) {
        navigate(getFeaturePath(invoiceConfig.refundSubFeature, 'edit', { id: refundId }));
      } else {
        navigate(getFeaturePath(invoiceConfig.refundSubFeature));
      }
    }, [3000]);
  };

  const deleteRecord = async () => {
    setActionInProgress(true);
    const payload = {
      records: [{ id: data.id }],
    };
    const deleteResponse = await api('POST', getRemoveAllUrl(MODELS.INVOICES), payload);
    if (!(deleteResponse?.data?.status === 0)) return finishedActionHandler('Error', 'SOMETHING_WENT_WRONG');

    finishedActionHandler('Success', invoiceConfig.deleteSuccessMessage);
  };

  const onPartnerChangeHandler = async () => {
    if (!formik.values.partner) return;
    let partnerObj = formik.values.partner;
    const partnerResponse = await api('POST', getActionUrl(), {
      model: MODELS.INVOICE,
      action: 'action-group-cash-management-invoice-partner-onchange',
      data: {
        criteria: [],
        context: {
          _model: MODELS.INVOICE,
          _id: null,
          todayDate: moment().locale('en').format('YYYY-MM-DD'),
          operationTypeSelect: invoiceConfig?.operationTypeSelect,
          company: company || null,
          paymentMode: null,
          paymentCondition: null,
          partner: {
            id: partnerObj.id || -1,
            fullName: `${partnerObj.partnerSeq} - ${partnerObj.simpleFullName}`,
            factorizedCustomer: false,
          },
          language: {
            code: 'en',
            name: 'English',
            id: 1,
          },
          _source: 'partner',
        },
      },
    });
    if (!(partnerResponse?.data?.status === 0) || checkFlashOrError(partnerResponse?.data?.data))
      return alertHandler('Error', 'SOMETHING_WENT_WRONG');
    let data = partnerResponse.data.data;

    setSelectedValues(formik, {
      paymentMode: data?.[1]?.values?.paymentMode?.id?.toString() || '',
      paymentCondition: data?.[1]?.values?.paymentCondition?.id?.toString() || '',
      address: data?.[0]?.values?.address || '',
    });
  };

  useEffect(() => {
    if (isSave) onSaveInvoice();
    if (isPost) onValidateInvoice();
    if (isRefund) onRefundInvoice();
    if (isCancel) onCancelInvoice();
    if (isDelete) deleteRecord();
  }, [isSave, isPost, isRefund, isCancel, isDelete, addNew, enableEdit]);

  useEffect(() => {
    tabsProps.setShowTabsContent(true);

    const taxNumber = companyMainData?.taxNumberList?.[0]?.taxNbr;

    if (!taxNumber && (addNew || (enableEdit && currentStatusSelect === INVSTATUS_SELECT.DRAFT))) alertHandler('Warning', 'NO_TAX_NUMBER');
  }, []);

  useEffect(() => {
    if (formik.values.operationSubTypeSelect !== '') {
      if (formik.values.operationSubTypeSelect === '1' && (addNew || enableEdit)) {
        alertHandler('Warning', 'CLASSIC_INVOICE_WARNING');
      }
    }
  }, [formik.values.operationSubTypeSelect]);

  useEffect(() => {
    if (isPaymentDetailsFetched) onPartnerChangeHandler();
    if (!isPaymentDetailsFetched) setIsPaymentDetailsFetched(true);
  }, [formik.values.partner]);

  let isValidated = currentStatusSelect === INVSTATUS_SELECT.VALIDATED;
  let isPosted = currentStatusSelect === INVSTATUS_SELECT.POSTED;
  let hasMinDate = data?.originalInvoice || data?.stockMoveSet?.length > 0 || data?.saleOrder || data?.purchaseOrder;

  const getFirstRowStructure = () => {
    if (showQRCode && zatcaQRCode)
      return (
        <>
          <div className="row">
            <div className="col-md-9 order-1">
              <div className="row">
                {formik.values.invoiceId && (
                  <>
                    <div className="col-md-6">
                      <TextInput formik={formik} label="LBL_REFERENCE" accessor="invoiceId" mode="view" />
                    </div>
                    <div className="col-md-6"></div>
                  </>
                )}
                {/* <div className="col-md-6">
                  <DropDown
                    options={DOCUMENT_TYPE_OPTIONS}
                    formik={formik}
                    isRequired={false}
                    disabled={true}
                    label="LBL_DOCUMENT_TYPE"
                    accessor="operationTypeSelect"
                    translate={true}
                    keys={{ valueKey: 'value', titleKey: 'name' }}
                    mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                  />
                </div> */}
                <div className="col-md-3">
                  <DropDown
                    options={data?.documentSubTypesOptions}
                    formik={formik}
                    isRequired={!isPosted && !isValidated}
                    disabled={isValidated || isPosted}
                    label="LBL_DOCUMENT_TYPE"
                    accessor="operationSubTypeSelect"
                    translate={true}
                    keys={{ valueKey: 'value', titleKey: 'name' }}
                    mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                  />
                </div>
                <div className="col-md-6">
                  <SearchModalAxelor
                    formik={formik}
                    modelKey="PRINTING_SETTINGS"
                    mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                    disabled={true}
                    tooltip="printingSettings"
                  />
                </div>
                <div className="col-md-6">
                  <SearchModalAxelor
                    formik={formik}
                    modelKey="CURRENCIES"
                    mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                    disabled={true}
                    defaultValueConfig={{
                      payloadDomain: "self.codeISO = 'SAR'",
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="col-md-3 order-md-1">
              <div className="row">
                <div className="col-md-12">
                  <div className="d-flex justify-content-center">
                    <img src={`data:image/jpeg;base64,${zatcaQRCode}`} alt="ZatcaQRCode" style={{ width: '200px' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      );

    return (
      <>
        {formik.values.invoiceId && (
          <div className="row">
            <div className="col-md-3">
              <TextInput formik={formik} label="LBL_REFERENCE" accessor="invoiceId" mode="view" />
            </div>
          </div>
        )}
        <div className="row">
          {/* <div className="col-md-3">
            <DropDown
              options={DOCUMENT_TYPE_OPTIONS}
              formik={formik}
              isRequired={false}
              disabled={true}
              label="LBL_DOCUMENT_TYPE"
              accessor="operationTypeSelect"
              translate={true}
              keys={{ valueKey: 'value', titleKey: 'name' }}
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
            />
          </div> */}
          <div className="col-md-3">
            <DropDown
              options={data?.documentSubTypesOptions}
              formik={formik}
              isRequired={!isPosted && !isValidated}
              disabled={isValidated || isPosted}
              label="LBL_DOCUMENT_TYPE"
              accessor="operationSubTypeSelect"
              translate={true}
              keys={{ valueKey: 'value', titleKey: 'name' }}
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
            />
          </div>
          <div className="col-md-3">
            <SearchModalAxelor
              formik={formik}
              modelKey="PRINTING_SETTINGS"
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
              disabled={true}
              tooltip="printingSettings"
            />
          </div>
          <div className="col-md-3">
            <SearchModalAxelor
              formik={formik}
              modelKey="CURRENCIES"
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
              disabled={true}
              defaultValueConfig={{
                payloadDomain: "self.codeISO = 'SAR'",
              }}
            />
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      {showMoreAction && (
        <MoreAction
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          editHandler={() => {
            setEdit(true);
            setShow(true);
          }}
          deleteHandler={() => dispatch(invoiceLinesActions.deleteLine(deletedLine))}
          canSelectAll={false}
        />
      )}
      {!addNew && <InvoicesTaxTotalsTop totalWithTax={totalWithTax} fetchedInvoice={data} amountRemaining={data.amountRemaining} />}
      <div className={`card ${addNew ? 'step-add-customer-invoice-1' : ''}`}>
        {getFirstRowStructure()}
        <div className="row">
          <BorderSection
            title={
              invoiceConfig.subFeatureChecks.isNote
                ? invoiceConfig.subFeatureChecks.isCreditNote
                  ? 'LBL_CREDIT_NOTE_DETAILS'
                  : 'LBL_DEBIT_NOTE_DETAILS'
                : 'LBL_INVOICING_DETAILS'
            }
          />
          <div className="row">
            {invoiceConfig.subFeatureChecks.isSupplierRelated && !invoiceConfig.subFeatureChecks.isNote && (
              <div className="col-md-3">
                <TextInput
                  formik={formik}
                  label="LBL_SUPPLIER_INVOICE_NUMBER"
                  accessor="supplierInvoiceNb"
                  mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                  isRequired={!isValidated && !isPosted}
                  disabled={isValidated || isPosted || data?.originalInvoice}
                />
              </div>
            )}
            {invoiceConfig.subFeatureChecks.isSupplierRelated && invoiceConfig.subFeatureChecks.isNote && (
              <div className="col-md-3">
                <TextInput
                  formik={formik}
                  label="LBL_SUPPLIER_REFUND_NUMBER"
                  accessor="supplierInvoiceNb"
                  mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                  isRequired={!isValidated && !isPosted}
                  disabled={isValidated || isPosted || data?.originalInvoice}
                />
              </div>
            )}
            <div className="col-md-3">
              <DateInput
                formik={formik}
                label={
                  invoiceConfig.subFeatureChecks.isNote
                    ? invoiceConfig.subFeatureChecks.isCreditNote
                      ? 'LBL_CREDIT_NOTE_DATE'
                      : 'LBL_DEBIT_NOTE_DATE'
                    : 'LBL_INVOICE_DATE'
                }
                accessor="invoiceDate"
                mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                isRequired={!isPosted && !isValidated}
                disabled={isValidated || isPosted || (enableEdit && invoiceConfig.subFeatureChecks.isNote && !data?.originalInvoice)}
                min={hasMinDate ? data?.invoiceMinDate : false}
              />
            </div>
            {invoiceConfig?.stockMangamentAvaiable && (
              <div className="col-md-3">
                <SearchModalAxelor
                  formik={formik}
                  modelKey="STOCK_LOCATIONS"
                  mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                  payloadDomain="self.company = 1 AND self.typeSelect in (1,2)"
                  defaultValueConfig={null}
                  isRequired={!isValidated && !isPosted && !data?.originalInvoice && !data?.isOriginStockMove}
                  disabled={isValidated || isPosted || data?.originalInvoice || data?.isOriginStockMove}
                />
              </div>
            )}
          </div>
          <div className="row">
            <div className="col-md-3">
              <SearchModalAxelor
                formik={formik}
                modelKey={invoiceConfig.partner.partnerType}
                mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                isRequired={!isValidated && !isPosted && !data?.originalInvoice}
                selectIdentifier="fullName"
                payloadDomain={`self.isContact = false AND ${company.id} member of self.companySet AND ${invoiceConfig.partner.partnerDomain} AND self.id!=1`}
                disabled={isValidated || isPosted || data?.originalInvoice || data?.originalInvoice}
                defaultValueConfig={false}
                extraFields={['fullName']}
              />
            </div>
            <div className="col-md-3">
              <DropDown
                options={data.paymentModesOptions || []}
                formik={formik}
                isRequired={!isPosted}
                disabled={isValidated || isPosted}
                label="LBL_PAYMENT_MODE"
                accessor="paymentMode"
                keys={{ valueKey: 'id', titleKey: 'name' }}
                mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                tooltip={invoiceConfig.tooltips.paymentMode}
              />
            </div>
            <div className="col-md-3">
              <DropDown
                options={data.paymentConditionsOptions || []}
                formik={formik}
                isRequired={!isPosted}
                disabled={isValidated || isPosted}
                label="LBL_PAYMENT_CONDITION"
                accessor="paymentCondition"
                keys={{ valueKey: 'id', titleKey: 'name' }}
                mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                tooltip={invoiceConfig.tooltips.paymentCondition}
              />
            </div>
            {formik.values.partner && (
              <div className="col-md-3">
                <SearchModalAxelor
                  formik={formik}
                  modelKey="PARTNER_ADDRESS"
                  mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                  isRequired={!isValidated && !isPosted}
                  disabled={isValidated || isPosted}
                  onSuccess={onAddressSearchSuccess}
                  selectIdentifier="fullName"
                  payloadDomain={`self.partner = ${formik.values.partner.id}`}
                  extraFields={['address.fullName', 'id', 'address.addressL4', 'address.addressL7Country']}
                />
              </div>
            )}
          </div>
        </div>
        {(addNew || enableEdit) && (
          <FormNotes
            notes={[
              {
                title: 'LBL_REQUIRED_NOTIFY',
                type: 3,
              },
            ]}
          />
        )}
      </div>

      <>
        <Tabs
          {...tabsProps}
          tabsList={[
            {
              accessor: 'content',
              label:
                invoiceConfig.subFeatureChecks.isInvoice && invoiceConfig.subFeatureChecks.isCustomerRelated
                  ? 'LBL_CUSTOMER_INVOICE_DETAILS'
                  : invoiceConfig.subFeatureChecks.isInvoice && invoiceConfig.subFeatureChecks.isSupplierRelated
                    ? 'LBL_SUPPLIER_INVOICE_DETAILS'
                    : invoiceConfig.subFeatureChecks.isCreditNote
                      ? 'LBL_CREDIT_NOTE_DETAILS'
                      : 'LBL_DEBIT_NOTE_DETAILS',
            },
            { accessor: 'delivery', label: 'LBL_DELIVERY', isHidden: !invoiceConfig?.stockMangamentAvaiable },
            {
              accessor: 'payments',
              label: 'LBL_PAYMENTS_DETAILS',
              isHidden: !(data.invoicePaymentList && data.invoicePaymentList.filter(payment => payment.typeSelect === 2).length > 0),
            },
            {
              accessor: 'refunds',
              label:
                invoiceConfig.subFeatureChecks.isCustomerRelated && invoiceConfig.subFeatureChecks.isInvoice
                  ? 'LBL_INVOICE_CREDIT_NOTES_LIST'
                  : 'LBL_INVOICE_DEBIT_NOTES_LIST',
              isHidden: !(
                data.refundInvoiceList &&
                data.refundInvoiceList.filter(line => line.statusSelect === 3).length > 0 &&
                invoiceConfig.subFeatureChecks.isInvoice
              ),
            },
          ]}
        >
          <InvoiceLines
            accessor="content"
            formik={formik}
            invoiceType={formik.values.operationSubTypeSelect.toString()}
            operationTypeSelect={invoiceConfig?.operationTypeSelect}
            operationSubTypeSelect={
              addNew
                ? parseInt(formik.values.operationSubTypeSelect.toString())
                : data?.operationSubTypeSelect !== 8 && data?.operationSubTypeSelect !== 1
                  ? data.operationSubTypeSelect.toString()
                  : parseInt(formik.values.operationSubTypeSelect).toString()
            }
            setShowMoreAction={setShowMoreAction}
            setDeletedLine={setDeletedLine}
            purchase={invoiceConfig.subFeatureChecks.isSupplierInvoice}
            po={false}
            hasOriginal={data && data.originalInvoice !== undefined && data.originalInvoice !== null}
            setShow={setShow}
            show={show}
            setEdit={setEdit}
            edit={edit}
            status={currentStatus.status}
            errorMessage="INVALID_FORM"
            stockLocation={formik.values.stockLocation || null}
            parentModel={invoiceConfig.subFeatureChecks.isSupplierRelated ? MODELS.PURCHASEORDERLINE : MODELS.SALE_ORDER_LINE}
            modalTitle={
              invoiceConfig.subFeatureChecks.isInvoice
                ? 'LBL_INVOICING_DETAILS'
                : invoiceConfig.subFeatureChecks.isCreditNote
                  ? 'LBL_CREDIT_NOTE_DETAILS'
                  : 'LBL_DEBIT_NOTE_DETAILS'
            }
            fromPO_SO={data?.originalInvoice}
            fetchedInvoicelines={!addNew ? invoiceLines : null}
            mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
          />
          <InvoiceDeliveryTab
            accessor="delivery"
            formik={formik}
            fetchedObject={data}
            isTabRequired={false}
            mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
            isDisabled={isValidated || isPosted}
            isPurchase={invoiceConfig.subFeatureChecks.isSupplierRelated}
            isInvoice={invoiceConfig.subFeatureChecks.isInvoice}
          />
          <PaymentLines accessor="payments" fetchedInvoice={data} showRows={showRows} setShowRows={setShowRows} />
          <RefundInvoiceList
            accessor="refunds"
            fetchedInvoice={data}
            showRows={showRows}
            setShowRows={setShowRows}
            type={invoiceConfig.subFeature}
          />
        </Tabs>
        <InvoicesTaxTotals totalWithoutTax={totalWithoutTax} totalTax={totalTax} totalWithTax={totalWithTax} />
        <AttachmentInput
          mode={addNew ? 'add' : !enableEdit ? 'view' : data?.statusSelect === 1 ? 'edit' : 'view'}
          modelKey={MODELS.INVOICES}
          alertHandler={alertHandler}
          fetchedObj={fetchedObject || null}
          parentSaveDone={parentSaveDone}
          feature={invoiceConfig.subFeature}
          navigationParams={{ id: data?.id }}
          onSuccessFn={() =>
            finishedActionHandler(
              'Success',
              isSave
                ? invoiceConfig.alerts.draftSuccess
                : invoiceConfig.onePostAction
                  ? invoiceConfig.alerts.ventilateSuccess
                  : invoiceConfig.alerts.validateSuccess
            )
          }
        />
      </>
    </>
  );
};

export default InvoicesForm;
