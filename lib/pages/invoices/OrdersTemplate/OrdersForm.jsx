import { useEffect, useMemo, useState } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

import TextInput from '../../../components/ui/inputs/TextInput';
import SearchModalAxelor from '../../../components/ui/inputs/SearchModal/SearchModalAxelor';
import DateInput from '../../../components/ui/inputs/DateInput';
import Tabs from '../../../components/ui/inputs/Tabs';
import InvoiceLines from '../components/InvoiceLines';
import AttachmentInput from '../../../components/ui/inputs/AttachmentInput';
import MoreAction from '../../../parts/MoreAction';
import OrdersTaxTotals from './OrdersTaxTotals';
import BorderSection from '../../../components/ui/inputs/BorderSection';
import PhoneInputField from '../../../components/ui/inputs/PhoneInputField';
import DeliveryTab from '../../stockMoves/DeliveryTab';

import { MODELS } from '../../../constants/models';
import { useAxiosFunction } from '../../../hooks/useAxios';
import { getModelUrl, getRemoveAllUrl, getActionUrl, getVerifyUrl, getSearchUrl } from '../../../services/getUrl';
import { useTabs } from '../../../hooks/useTabs';
import { invoiceLinesActions } from '../../../store/invoiceLines';
import { checkFlashOrError } from '../../../utils/helpers';
import { setFieldValue, setSelectedValues } from '../../../utils/formHelpers';
import { modelsEnum } from '../../../constants/modelsEnum/modelsEnum';
import { useFeatures } from '../../../hooks/useFeatures';
import { useFormikSubmit } from '../../../hooks/useFormikSubmit';
import { STOCK_MOVES_SEARCH_FIELDS } from '../../stockMoves/StockMovesPayloadsFields';

const OrdersForm = ({
  enableEdit,
  data,
  addNew,
  isSave,
  isConfirm,
  isDelete,
  finishedActionHandler,
  finishedFinishActionHandler,
  alertHandler,
  setActionInProgress,
  currentStatus,
  orderConfig,
  disableActionButtons,
  setIsGenerate,
}) => {
  const { api } = useAxiosFunction();
  const { t } = useTranslation();
  const tabsProps = useTabs();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isFeatureAvailable, getFeaturePath } = useFeatures();
  const stockMangamentAvaiable = useMemo(() => {
    return isFeatureAvailable({ featureCode: '12' });
  }, []);
  const invoiceLines = useSelector(state => state.invoiceLines.invoiceLines);
  const company = useSelector(state => state.userFeatures.companyInfo.company);

  const [deletedLine, setDeletedLine] = useState({});
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [show, setShow] = useState(false);
  const [edit, setEdit] = useState(false);
  const [parentSaveDone, setParentSaveDone] = useState(false);
  const [fetchedObject, setFetchedObject] = useState(data ?? null);

  const initialValues = {
    purchaseOrderSeq: data?.purchaseOrderSeq || '',
    saleOrderSeq: data?.saleOrderSeq || '',
    currency: data?.currency || null,
    partner: data?.[orderConfig.partner.identifier] || null,
    partnerSeq: data?.[orderConfig.partner.identifier]?.partnerSeq || '',
    taxNbr: data?.[orderConfig.partner.identifier]?.taxNbr || '',
    emailAddress: data?.[orderConfig.partner.identifier]?.emailAddress?.address || '',
    mobilePhone: data?.[orderConfig.partner.identifier]?.mobilePhone || '',
    paymentCondition: data?.paymentCondition || null,
    paymentMode: data?.paymentMode || null,
    address: orderConfig.subFeatureChecks.isPO ? data?.stockLocation?.address || null : data?.mainInvoicingAddress || null,
    printingSettings: data?.printingSettings || null,
    stockLocation: data?.stockLocation || null,
    deliveryDate: data?.deliveryDate || '',
    orderDate: data?.orderDate || '',
  };

  const validationSchema = Yup.object({
    currency: Yup.object().nullable().required(t('CUSTOMER_CURRENCY_VALIDATION_MESSAGE')),
    orderDate: Yup.date(t('VALID_DATE_FORMAT')).required(t('REQUIRED')),
    partner: Yup.object().nullable().required(t('CUSTOMER_VALIDATION_MESSAGE')),
    stockLocation: stockMangamentAvaiable
      ? Yup.object().nullable().required(t('STOCK_LOCATION_VALIDATION_MESSAGE'))
      : Yup.object().nullable(),
    deliveryDate: stockMangamentAvaiable
      ? Yup.date().required(t('LBL_DATE_REQUIRED')).min(Yup.ref('orderDate'), t('SHIPPING_ORDER_DATE_VALIDATION'))
      : Yup.date().min(Yup.ref('orderDate'), t('SHIPPING_ORDER_DATE_VALIDATION')),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: addNew ? true : false,
  });

  const { validateFormForSubmit } = useFormikSubmit(formik, alertHandler);

  const { totalWithoutTax, totalTax, totalWithTax } = useMemo(() => {
    let totalWithoutTax = 0;
    let totalTax = 0;
    let totalWithTax = 0;

    if (invoiceLines?.length > 0) {
      invoiceLines.forEach(line => {
        totalWithoutTax = totalWithoutTax + parseFloat(line.exTaxTotal);
        totalWithTax = totalWithTax + parseFloat(line.inTaxTotal);
        totalTax = totalWithTax - totalWithoutTax;
      });
    }

    return { totalWithoutTax, totalTax, totalWithTax };
  }, [invoiceLines]);

  let orderDataContext = {
    taxTotal: parseFloat(totalTax)?.toString() || undefined,
    validationDate: data ? (data.validationDate ? data.validationDate : undefined) : undefined,
    displayPriceOnQuotationRequest: false,
    supplierPartner: orderConfig.subFeatureChecks.isPO ? formik.values.partner || undefined : undefined,
    purchaseOrderSeq: orderConfig.subFeatureChecks.isPO ? data?.purchaseOrderSeq || undefined : undefined,
    purchaseOrderLineList: orderConfig.subFeatureChecks.isPO ? invoiceLines || undefined : undefined,
    saleOrderSeq: orderConfig.subFeatureChecks.isSO ? data?.saleOrderSeq || undefined : undefined,
    saleOrderLineList: orderConfig.subFeatureChecks.isSO ? invoiceLines || undefined : undefined,
    clientPartner: orderConfig.subFeatureChecks.isSO ? formik.values.partner || undefined : undefined,
    inTaxTotal: parseFloat(totalWithTax)?.toString() || undefined,
    receiptState: data ? data.receiptState : undefined,
    orderDate: formik.values.orderDate || undefined,
    stockLocation: formik.values.stockLocation || undefined,
    printingSettings: formik.values.printingSettings ? { id: formik.values.printingSettings?.id } : undefined,
    company: company,
    currency: formik.values.currency || undefined,
    deliveryDate: formik.values.deliveryDate,
    paymentCondition: formik.values.paymentCondition || undefined,
    paymentMode: formik.values.paymentMode || undefined,
    exTaxTotal: parseFloat(totalWithoutTax)?.toString() || undefined,
    statusSelect: data ? (data.statusSelect ? data.statusSelect : undefined) : undefined,
    creationDate: data?.creationDate || moment(new Date()).locale('en').format('YYYY-MM-DD'),
    deliveryAddress: orderConfig.subFeatureChecks.isSO ? formik.values.address || undefined : undefined,
    deliveryState: orderConfig.subFeatureChecks.isSO ? 1 : undefined,
    mainInvoicingAddress: orderConfig.subFeatureChecks.isSO ? formik.values.address || undefined : undefined,
    versionNumber: 1,
    saleOrderTypeSelect: orderConfig.subFeatureChecks.isSO ? 1 : undefined,
    companyExTaxTotal: parseFloat(totalWithoutTax)?.toString() || undefined,
    companyInTaxTotal: parseFloat(totalWithTax)?.toString() || undefined,
    id: data?.id,
  };

  const onSaveOrder = async () => {
    const isValid = await validateFormForSubmit();
    if (!isValid) return null;

    if (!invoiceLines?.length > 0) return finishedActionHandler('Error', 'INVOICE_LINES_ERROR_MESSAGE');

    setActionInProgress(true);

    if (orderConfig.subFeatureChecks.isSO) {
      let supplyChainSave = {
        model: modelsEnum[orderConfig.modelsEnumKey].name,
        action: 'action-supplychain-saleorder-onsave',
        data: {
          criteria: [],
          context: {
            ...orderDataContext,
            statusSelect: 1,
          },
        },
      };
      const supplyChainResponse = await api('POST', getActionUrl(), supplyChainSave);

      if (!(supplyChainResponse.data.status === 0)) return finishedActionHandler('Error', 'SOMETHING_WENT_WRONG');

      let supplyChainData = supplyChainResponse.data.data;

      if (checkFlashOrError(supplyChainData)) return finishedActionHandler('Error', 'SOMETHING_WENT_WRONG');
    }

    let saveOrderPayload = {
      data: {
        ...orderDataContext,
        statusSelect: 1,
      },
    };

    if (data.id) {
      saveOrderPayload = { data: { ...saveOrderPayload.data, id: data.id, version: data.version } };
    }

    const saveOrderResponse = await api('POST', getModelUrl(modelsEnum[orderConfig.modelsEnumKey].name), saveOrderPayload);

    if (!(saveOrderResponse?.data?.status === 0)) return finishedActionHandler('Error', 'SOMETHING_WENT_WRONG');

    setFetchedObject(saveOrderResponse?.data?.data?.[0]);
    setParentSaveDone(true);
  };

  const onValidateOrder = async () => {
    const isValid = await validateFormForSubmit();
    if (!isValid) return null;

    if (!invoiceLines?.length > 0) return finishedActionHandler('Error', 'INVOICE_LINES_ERROR_MESSAGE');

    setActionInProgress(true);

    let saveOrderPayload = {
      data: {
        ...orderDataContext,
      },
    };

    if (data.id) {
      saveOrderPayload = { data: { ...saveOrderPayload.data, id: data.id, version: data.version } };
    }

    const saveOrderResponse = await api('POST', getModelUrl(modelsEnum[orderConfig.modelsEnumKey].name), saveOrderPayload);

    if (!(saveOrderResponse?.data?.status === 0) || !(saveOrderResponse?.data?.data?.length > 0))
      return finishedActionHandler('Error', 'SOMETHING_WENT_WRONG');

    const savedData = saveOrderResponse?.data?.data?.[0];

    if (orderConfig.subFeatureChecks.isPO) {
      let requestPayload = {
        model: modelsEnum[orderConfig.modelsEnumKey].name,
        action: 'save,action-purchase-order-method-requested',
        data: {
          criteria: [],
          context: {
            ...orderDataContext,
            id: savedData.id,
            version: savedData.version,
            _id: null,
            _status: [1, 2],
            purchaseOrderSeq: undefined,
          },
        },
      };
      const requestResponse = await api('POST', getActionUrl(), requestPayload);

      if (!(requestResponse.data.status === 0) || !requestResponse?.data?.data)
        return finishedActionHandler('Error', 'SOMETHING_WENT_WRONG');

      let requestData = requestResponse.data.data;

      if (checkFlashOrError(requestData)) return finishedActionHandler('Error', 'SOMETHING_WENT_WRONG');

      const verifyResponse = await api('POST', getVerifyUrl(modelsEnum[orderConfig.modelsEnumKey].name), {
        data: {
          id: savedData.id,
          version: savedData.version,
        },
      });
      if (!(verifyResponse.data.status === 0)) return finishedActionHandler('Error', 'SOMETHING_WENT_WRONG');

      let validateActionPayload = {
        model: modelsEnum[orderConfig.modelsEnumKey].name,
        action: 'action-group-purchase-order-on-validate-actions',
        data: {
          criteria: [],
          context: {
            ...orderDataContext,
            id: savedData.id,
            version: savedData.version,
            _id: null,
            _status: [1, 2],
          },
        },
      };
      const validateActionResponse = await api('POST', getActionUrl(), validateActionPayload);

      if (!(validateActionResponse.data.status === 0) || !validateActionResponse?.data?.data)
        return finishedActionHandler('Error', 'SOMETHING_WENT_WRONG');
      let requestPayload2 = {
        model: modelsEnum[orderConfig.modelsEnumKey].name,
        action: 'action-purchase-order-method-requested',
        data: {
          criteria: [],
          context: {
            ...orderDataContext,
            id: savedData.id,
            version: savedData.version,
            _id: null,
            _status: [1, 2],
            purchaseOrderSeq: undefined,
          },
        },
      };
      const requestResponse2 = await api('POST', getActionUrl(), requestPayload2);

      if (!(requestResponse2.data.status === 0) || !requestResponse2?.data?.data)
        return finishedActionHandler('Error', 'SOMETHING_WENT_WRONG');

      let requestData2 = requestResponse2.data.data;

      if (checkFlashOrError(requestData2)) return finishedActionHandler('Error', 'SOMETHING_WENT_WRONG');

      let validatePayload2 = {
        model: modelsEnum[orderConfig.modelsEnumKey].name,
        action: 'action-group-purchase-order-on-validate-actions',
        data: {
          criteria: [],
          context: {
            ...orderDataContext,
            id: savedData.id,
            version: savedData.version,
            _id: null,
            _status: [1, 2],
          },
        },
      };
      const validate2Response = await api('POST', getActionUrl(), validatePayload2);

      if (!(validate2Response.data.status === 0) || !validate2Response?.data?.data)
        return finishedActionHandler('Error', 'SOMETHING_WENT_WRONG');

      let validatePayload3 = {
        model: modelsEnum[orderConfig.modelsEnumKey].name,
        action: 'action-group-purchase-order-on-validate-actions[4]',
        data: {
          criteria: [],
          context: {
            ...orderDataContext,
            id: savedData.id,
            version: savedData.version,
            _id: null,
            _status: [1, 2],
          },
        },
      };
      const validate3Response = await api('POST', getActionUrl(), validatePayload3);

      if (!(validate3Response.data.status === 0) || !validate3Response?.data?.data)
        return finishedActionHandler('Error', 'SOMETHING_WENT_WRONG');

      setParentSaveDone(true);
    }

    if (orderConfig.subFeatureChecks.isSO) {
      let finalizePayload = {
        model: modelsEnum[orderConfig.modelsEnumKey].name,
        action: 'action-group-sale-order-finalize-quotation',
        data: {
          criteria: [],
          context: {
            ...savedData,
          },
        },
      };
      const finalizeResponse = await api('POST', getActionUrl(), finalizePayload);

      if (!(finalizeResponse.data.status === 0) || !finalizeResponse?.data?.data)
        return finishedActionHandler('Error', 'SOMETHING_WENT_WRONG');

      let finalizeData = finalizeResponse.data.data;

      if (checkFlashOrError(finalizeData)) return finishedActionHandler('Error', 'SOMETHING_WENT_WRONG');

      let finalizePayload2 = {
        model: modelsEnum[orderConfig.modelsEnumKey].name,
        action: 'action-group-sale-order-finalize-quotation[1]',
        data: {
          criteria: [],
          context: {
            ...savedData,
          },
        },
      };
      const finalizeResponse2 = await api('POST', getActionUrl(), finalizePayload2);

      if (!(finalizeResponse2.data.status === 0) || !finalizeResponse2?.data?.data)
        return finishedActionHandler('Error', 'SOMETHING_WENT_WRONG');

      let finalizeData2 = finalizeResponse2.data.data;

      if (finalizeData2?.error?.includes('You must configure a customer virtual stock location for the company')) {
        return alertHandler('Error', 'ERROR_CONFIRM_SO_VIRTUAL_LOCATION');
      }

      if (checkFlashOrError(finalizeData2)) return finishedActionHandler('Error', 'SOMETHING_WENT_WRONG');

      let confirmPayload = {
        model: modelsEnum[orderConfig.modelsEnumKey].name,
        action: 'action-sale-group-confirmed',
        data: {
          criteria: [],
          context: {
            ...savedData,
          },
        },
      };
      const confirmResponse = await api('POST', getActionUrl(), confirmPayload);

      if (!(confirmResponse.data.status === 0) || !confirmResponse?.data?.data)
        return finishedActionHandler('Error', 'SOMETHING_WENT_WRONG');

      let confirmData = confirmResponse.data.data;

      if (confirmData[0].error && confirmData[0].error.includes('are not in sufficient quantity to realize the delivery')) {
        return alertHandler('Error', 'NO_QUANTITY_AVAIABLE_TO_DELIVERY');
      }

      if (checkFlashOrError(confirmData)) return finishedActionHandler('Error', 'SOMETHING_WENT_WRONG');

      let confirmPayload2 = {
        model: modelsEnum[orderConfig.modelsEnumKey].name,
        action: 'action-sale-group-confirmed[3]',
        data: {
          criteria: [],
          context: {
            ...savedData,
          },
        },
      };
      const confirmResponse2 = await api('POST', getActionUrl(), confirmPayload2);

      if (!(confirmResponse2.data.status === 0)) return finishedActionHandler('Error', 'SOMETHING_WENT_WRONG');

      let confirmData2 = confirmResponse2.data.data;

      if (checkFlashOrError(confirmData2)) return finishedActionHandler('Error', 'SOMETHING_WENT_WRONG');
      setParentSaveDone(true);
    }
  };

  const deleteRecord = async () => {
    setActionInProgress(true);
    const payload = {
      records: [{ id: data.id }],
    };
    const deleteResponse = await api('POST', getRemoveAllUrl(MODELS.INVOICES), payload);
    if (!(deleteResponse?.data?.status === 0)) return finishedActionHandler('Error', 'SOMETHING_WENT_WRONG');

    finishedActionHandler('Success', 'INVOICE_DELETE_MESSAGE');
  };

  const onPartnerChangeHandler = async partner => {
    if (!partner) return;
    const partnerResponse = await api('POST', getActionUrl(), {
      model: MODELS.INVOICE,
      action: 'action-group-cash-management-invoice-partner-onchange',
      data: {
        criteria: [],
        context: {
          _model: MODELS.INVOICE,
          _id: null,
          todayDate: moment(new Date()).locale('en').format('YYYY-MM-DD'),
          operationTypeSelect: orderConfig.operationTypeSelect,
          company: company || null,
          paymentMode: null,
          paymentCondition: null,
          partner: partner ?? null,
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
      partnerSeq: partner.partnerSeq,
      mobilePhone: partner.mobilePhone,
      address: data?.[0]?.values?.address || null,
      taxNbr: partner.taxNbr,
      emailAddress: partner['emailAddress.address'] || '',
      paymentMode: data?.[1]?.values?.paymentMode || null,
      paymentCondition: data?.[1]?.values?.paymentCondition || null,
    });
  };

  const onGenerateInvoice = async () => {
    if (!formik.isValid) return finishedActionHandler('Error', 'PLEASE_FILL_REQUIRED_ERROR_MESSAGE');
    if (!invoiceLines?.length > 0) return finishedActionHandler('Error', 'INVOICE_LINES_ERROR_MESSAGE');

    setIsGenerate(true);

    let generatePayload = {
      model: modelsEnum[orderConfig.modelsEnumKey].name,
      action: orderConfig.generateInvoiceActions.generate,
      data: {
        criteria: [],
        context: {
          ...orderDataContext,
          _status: 3,
          versionNumber: 1,
          statusSelect: 1,
        },
      },
    };

    const generateControlResponse = await api('POST', getActionUrl(), generatePayload);

    if (!(generateControlResponse?.data?.status === 0) || checkFlashOrError(generateControlResponse?.data?.data))
      return finishedActionHandler('Error', 'SOMETHING_WENT_WRONG');
    generatePayload.action = orderConfig.generateInvoiceActions.generate1;

    const generateControl1Response = await api('POST', getActionUrl(), generatePayload);

    if (
      orderConfig?.subFeatureChecks?.isSO &&
      checkFlashOrError(generateControl1Response?.data?.data) &&
      generateControl1Response?.data?.data?.[0]?.flash.includes('All invoices have been generated for this sale order.')
    ) {
      return finishedActionHandler('Error', 'SALE_ORDER_ALREADY_INVOICED');
    }

    let invoiceWizardPayload = {
      model: modelsEnum[orderConfig.modelsEnumKey].name,
      action: orderConfig.generateInvoiceActions.invoiceWizard,
      data: {
        criteria: [],
        context: {
          ...orderDataContext,
          _status: 3,
          amountToInvoice: '0',
          operationSelect: '1',
          versionNumber: 1,
          statusSelect: orderDataContext?.statusSelect,
        },
      },
    };
    const invoicingWizardResponse = await api('POST', getActionUrl(), invoiceWizardPayload);

    if (
      orderConfig?.subFeatureChecks?.isPO &&
      checkFlashOrError(invoicingWizardResponse?.data?.data) &&
      invoicingWizardResponse?.data?.data?.[0]?.flash.includes('invoiced amount cannot be greater than its total amount')
    ) {
      return finishedActionHandler('Error', 'PURCHASE_ORDER_ALREADY_INVOICED');
    }

    let responseData = invoicingWizardResponse?.data?.data?.[0];
    let invoiceId = responseData?.view?.context?.['_showRecord'];

    if (orderConfig?.subFeatureChecks?.isPo) {
      let invoicingWizardPayload2 = {
        model: modelsEnum[orderConfig.modelsEnumKey].name,
        action: orderConfig.generateInvoiceActions.invoiceWizard1,
        data: {
          criteria: [],
          context: {
            ...orderDataContext,
            _status: 3,
            operationSelect: '1',
            versionNumber: 1,
            statusSelect: 1,
          },
        },
      };
      responseData = invoicingWizardResponse?.data?.data?.[0];
      invoiceId = responseData?.view?.context?.['_showRecord'];
      const invoicingWizardResponse2 = await api('POST', getActionUrl(), invoicingWizardPayload2);
      if (!(invoicingWizardResponse2?.data?.status === 0) || checkFlashOrError(invoicingWizardResponse2?.data?.data))
        return finishedActionHandler('Error', 'SOMETHING_WENT_WRONG');
    }

    alertHandler('Success', orderConfig.alerts.generateSuccess);
    setTimeout(() => {
      if (invoiceId) {
        navigate(getFeaturePath(orderConfig.invoiceSubFeature, 'edit', { id: invoiceId }));
      } else {
        navigate(getFeaturePath(orderConfig.invoiceSubFeature));
      }
    }, 3000);
  };

  const onStockLocationChangeHandler = value => {
    setFieldValue(formik, 'address', value?.address || null);
  };

  const getPOStockMovePayload = () => {
    let payload = {
      fields: STOCK_MOVES_SEARCH_FIELDS,
      sortBy: ['statusSelect', '-estimatedDate'],
      data: {
        _domain: orderConfig?.subFeatureChecks?.isPO
          ? "self.originTypeSelect LIKE 'com.axelor.apps.purchase.db.PurchaseOrder' AND self.originId\n    = :purchaseOrder"
          : "self.originTypeSelect LIKE 'com.axelor.apps.sale.db.SaleOrder' AND self.originId\n    = :saleOrder",
        _domainContext: {
          saleOrder: data?.id,
          purchaseOrder: data?.id,
          id: data?.id,
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

  const onFinishPo = async () => {
    let validatePayload = {
      model: MODELS.PURCHASE_ORDER,
      action: 'save,action-purchase-order-method-finish-purchase-order',
      data: {
        criteria: [],
        context: {
          _model: MODELS.PURCHASE_ORDER,
          _id: data?.id,
          _internalUser: 1,
          _status: 3,
          taxTotal: parseFloat(totalTax).toFixed(2).toString(),
          generatedSaleOrderId: 0,
          operationSelect: '1',
          supplierPartner: formik.values.partner || null,
          purchaseOrderSeq: data?.purchaseOrderSeq,
          purchaseOrderLineList: data?.purchaseOrderLineList,
          id: data?.id,
          inTaxTotal: parseFloat(totalWithTax).toString(),
          version: data && data.version ? data.version : null,
          receiptState: data?.receiptState,
          stockLocation: formik.values.stockLocation || null,
          company: company ? company : null,
          currency: formik.values.currency || null,
          deliveryDate: moment(formik.values.deliveryDate).locale('en').format('YYYY-MM-DD'),
          orderDate: moment(formik.values.orderDate).locale('en').format('YYYY-MM-DD'),
          paymentCondition: formik.values.paymentCondition || null,
          paymentMode: formik.values.paymentMode || null,
          exTaxTotal: parseFloat(totalWithoutTax).toString(),
          pritingSettings: formik.values.printingSetting || null,
          versionNumber: 1,
          statusSelect: 1,
        },
      },
    };

    const response = await api('POST', getActionUrl(), validatePayload);

    if (response.data.status === 0) {
      if (response.data.data && checkFlashOrError(response.data.data)) {
        alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      } else {
        validatePayload = {
          model: MODELS.PURCHASE_ORDER,
          action: 'action-purchase-order-method-finish-purchase-order',
          data: {
            criteria: [],
            context: {
              _model: MODELS.PURCHASE_ORDER,
              _id: data?.id,
              _internalUser: 1,
              _status: 3,
              taxTotal: parseFloat(totalTax).toFixed(2).toString(),
              generatedSaleOrderId: 0,
              operationSelect: '1',
              supplierPartner: formik.values.partner || null,
              purchaseOrderSeq: data?.purchaseOrderSeq,
              purchaseOrderLineList: data?.purchaseOrderLineList,
              id: data?.id,
              inTaxTotal: parseFloat(totalWithTax).toString(),
              version: data && data.version ? data.version : null,
              receiptState: data?.receiptState,
              stockLocation: formik.values.stockLocation || null,
              company: company ? company : null,
              currency: formik.values.currency || null,
              deliveryDate: moment(formik.values.deliveryDate).locale('en').format('YYYY-MM-DD'),
              orderDate: moment(formik.values.orderDate).locale('en').format('YYYY-MM-DD'),
              paymentCondition: formik.values.paymentCondition || null,
              paymentMode: formik.values.paymentMode || null,
              exTaxTotal: parseFloat(totalWithoutTax).toString(),
              pritingSettings: formik.values.printingSetting || null,
              versionNumber: 1,
              statusSelect: 1,
            },
          },
        };

        const response = await api('POST', getActionUrl(), validatePayload);

        if (response.data.status === 0) {
          if (response.data.data && checkFlashOrError(response.data.data)) {
            alertHandler('Error', t('SOMETHING_WENT_WRONG'));
          }

          if (data?.statusSelect === 1) {
            // setParentSaveDone(true);
            finishedFinishActionHandler('Success', t('PURCHASE_ORDER_FINISH_MESSAGE'));
          } else {
            finishedFinishActionHandler('Success', t('PURCHASE_ORDER_FINISH_MESSAGE'));
          }
        } else {
          setActionInProgress(false);
          alertHandler('Error', t('SOMETHING_WENT_WRONG'));
        }
      }
    }
  };

  const checkCanFinish = async () => {
    const stockMoves = await getStockMoves();
    let isNotConfirmedOrCanceled = false;
    stockMoves &&
      stockMoves.length > 0 &&
      stockMoves.forEach(move => {
        if (move && move.statusSelect !== 3 && move.statusSelect !== 4) {
          isNotConfirmedOrCanceled = true;
        }
      });

    if (!isNotConfirmedOrCanceled) {
      onFinishPo();
    } else {
      alertHandler('Error', t('FINISHING_PO_REQUIRES_CONFIRMING_OR_CANCELING_STOCK_MOVES'));
    }
  };

  useEffect(() => {
    if (isSave) onSaveOrder();
    if (isConfirm) onValidateOrder();
    if (isDelete) deleteRecord();
  }, [isSave, isConfirm, isDelete, addNew, enableEdit]);

  useEffect(() => {
    tabsProps.setShowTabsContent(true);
  }, []);

  useEffect(() => {
    if (formik.values.operationSubTypeSelect !== '') {
      if (formik.values.operationSubTypeSelect === '1') {
        alertHandler('Warning', 'CLASSIC_INVOICE_WARNING');
      }
    }
  }, [formik.values.operationSubTypeSelect]);

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
      <div className="col-md-9">
        <div className="card">
          {formik.values[orderConfig.sequenceKey] && (
            <div className="row">
              <div className="col-md-4">
                <TextInput
                  formik={formik}
                  label="LBL_REFERENCE"
                  accessor={orderConfig.sequenceKey}
                  mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                  disabled={true}
                />
              </div>
            </div>
          )}
          <div className="row mt-3 step-add-purchase-order-1">
            <BorderSection title={orderConfig.partner.infoLabel} withBorder={false} />
            <div className="row">
              <div className="col-md-4">
                <SearchModalAxelor
                  formik={formik}
                  modelKey={orderConfig.partner.partnerType}
                  mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                  isRequired={currentStatus.status !== 'Confirmed' && currentStatus.status !== 'Finished'}
                  disabled={currentStatus.status === 'Confirmed' || currentStatus.status === 'Finished'}
                  selectIdentifier="fullName"
                  payloadDomain={`self.isContact = false AND ${company !== null ? company.id : -1} member of self.companySet AND ${
                    orderConfig.partner.partnerDomain
                  } And self.id != 1`}
                  defaultValueConfig={false}
                  extraFields={[
                    'fullName',
                    'fixedPhone',
                    'emailAddress.address',
                    'mobilePhone',
                    'registrationCode',
                    'address',
                    'companyStr',
                    'taxNbr',
                  ]}
                  selectCallback={onPartnerChangeHandler}
                />
              </div>
              <div className="col-md-4">
                <DateInput
                  formik={formik}
                  isRequired={currentStatus.status !== 'Confirmed' && currentStatus.status !== 'Finished'}
                  disabled={currentStatus.status === 'Confirmed' || currentStatus.status === 'Finished'}
                  mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                  label="LBL_ORDER_DATE"
                  accessor="orderDate"
                />
              </div>
              {formik.values.partner && (
                <>
                  <div className="col-md-4"></div>
                  {formik.values.partner && (
                    <>
                      <div className="col-md-4">
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
                      {formik.values.partner?.partnerSeq && formik.values.partner.partnerSeq !== '' && (
                        <div className="col-md-4">
                          <TextInput
                            formik={formik}
                            label={orderConfig.partner.codeLabel}
                            accessor="partnerSeq"
                            mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                            disabled={true}
                          />
                        </div>
                      )}
                      {formik.values.partner?.mobilePhone && formik.values.partner.mobilePhone !== '' && (
                        <div className="col-md-4">
                          <PhoneInputField
                            formik={formik}
                            label="LBL_MOBILE_NUMBER"
                            identifier="mobilePhone"
                            mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                            disabled={true}
                          />
                        </div>
                      )}

                      {formik.values.emailAddress && (
                        <div className="col-md-4">
                          <TextInput
                            formik={formik}
                            label="LBL_EMAIL_ADDRESS"
                            accessor="emailAddress"
                            mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                            disabled={true}
                          />
                        </div>
                      )}
                      {formik.values.partner?.taxNbr && formik.values.partner.taxNbr !== '' && (
                        <div className="col-md-4">
                          <TextInput
                            formik={formik}
                            label="LBL_TAX_NUMBER"
                            accessor="taxNbr"
                            mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                            disabled={true}
                          />
                        </div>
                      )}
                      {orderConfig.subFeatureChecks.isSO && (
                        <div className="col-md-4">
                          <SearchModalAxelor
                            formik={formik}
                            modelKey="PARTNER_ADDRESS"
                            mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                            disabled={true}
                            selectIdentifier="fullName"
                            payloadDomain={`self.partner = ${formik.values.partner.id}`}
                            extraFields={['address.fullName', 'id', 'address.addressL4', 'address.addressL7Country']}
                            defaultValueConfig={false}
                          />
                        </div>
                      )}

                      <div className="col-md-4">
                        <SearchModalAxelor
                          formik={formik}
                          modelKey="PAYMENT_MODES"
                          mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                          defaultValueConfig={null}
                          disabled={currentStatus.status === 'Confirmed' || currentStatus.status === 'Finished'}
                          payloadDomain={orderConfig.subFeatureChecks.isPO ? 'self.inOutSelect = 2' : 'self.inOutSelect = 1'}
                        />
                      </div>
                      <div className="col-md-4">
                        <SearchModalAxelor
                          formik={formik}
                          modelKey="PAYMENT_CONDITIONS"
                          mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                          disabled={currentStatus.status === 'Confirmed' || currentStatus.status === 'Finished'}
                        />
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        {stockMangamentAvaiable && (
          <div className={`card ${addNew && orderConfig.subFeatureChecks.isPO ? 'step-add-purchase-order-2' : ''}`}>
            <div className="row">
              <BorderSection title="LBL_DELIVERY" withBorder={false} />
            </div>
            <div className="row">
              <div className="col-md-4">
                <SearchModalAxelor
                  formik={formik}
                  modelKey={orderConfig.stockLocation.modelKey}
                  mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                  payloadDomain={orderConfig.stockLocation.domain}
                  isRequired={currentStatus.status !== 'Confirmed' && currentStatus.status !== 'Finished'}
                  defaultValueConfig={null}
                  disabled={currentStatus.status === 'Confirmed' || currentStatus.status === 'Finished'}
                  selectCallback={onStockLocationChangeHandler}
                  extraFields={['address']}
                />
              </div>
              <div className="col-md-4">
                <DateInput
                  formik={formik}
                  isRequired={currentStatus.status !== 'Confirmed' && currentStatus.status !== 'Finished'}
                  mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                  label={orderConfig.stockLocation.dateLabel}
                  accessor="deliveryDate"
                  disabled={currentStatus.status === 'Confirmed' || currentStatus.status === 'Finished'}
                />
              </div>
              {orderConfig.subFeatureChecks.isPO && formik.values.stockLocation && (
                <div className="col-md-4">
                  <SearchModalAxelor
                    formik={formik}
                    modelKey="ADDRESSES"
                    mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                    disabled={true}
                    defaultValueConfig={false}
                    selectIdentifier="fullName"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        <>
          <Tabs
            {...tabsProps}
            tabsList={[
              { accessor: 'content', label: orderConfig.subFeatureChecks.isPO ? 'LBL_PO_DETAILS' : 'LBL_SO_DETAILS' },
              { accessor: 'delivery', label: 'LBL_DELIVERY', isHidden: addNew },
            ]}
            formik={formik}
            submitFlag={isSave || isConfirm}
            // className={addNew && orderConfig.subFeatureChecks.isPO ? 'step-add-purchase-order-3' : ''}
          >
            <InvoiceLines
              accessor="content"
              formik={formik}
              company={company}
              setShowMoreAction={setShowMoreAction}
              setDeletedLine={setDeletedLine}
              purchase={orderConfig.subFeatureChecks.isPO || false}
              isOrder={true}
              hasOriginal={false}
              setShow={setShow}
              show={show}
              setEdit={setEdit}
              edit={edit}
              status={currentStatus.status}
              invoiceType="1"
              operationTypeSelect={orderConfig.operationTypeSelect}
              operationSubTypeSelect={parseInt('1')}
              errorMessage="INVALID_FORM"
              modalTitle={orderConfig.lines.modalName}
              stockLocation={formik.values.stockLocation || null}
              parentModel={orderConfig.lines.model}
              fetchedInvoicelines={invoiceLines}
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
            />
            <DeliveryTab
              accessor="delivery"
              fetchedObject={data || null}
              isTabRequired={false}
              isPurchase={orderConfig.subFeatureChecks.isPO}
            />
          </Tabs>
          <AttachmentInput
            mode={addNew ? 'add' : !enableEdit ? 'view' : data?.statusSelect === 1 ? 'edit' : 'view'}
            modelKey={modelsEnum[orderConfig.modelsEnumKey].name}
            alertHandler={alertHandler}
            fetchedObj={fetchedObject || null}
            parentSaveDone={parentSaveDone}
            feature={orderConfig.subFeature}
            navigationParams={{ id: data?.id }}
            onSuccessFn={() =>
              finishedActionHandler('Success', isSave ? orderConfig.alerts.draftSuccess : orderConfig.alerts.validateSuccess)
            }
          />
        </>
      </div>
      <div className="col-md-3">
        <OrdersTaxTotals
          mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
          type={orderConfig.subFeatureChecks.type}
          totalWithoutTax={totalWithoutTax}
          totalTax={totalTax}
          totalWithTax={totalWithTax}
          status={currentStatus.status}
          fetchedObject={data}
          onFinishClick={checkCanFinish}
          onGenerateInvoiceClick={onGenerateInvoice}
          onCancelClick={null}
          isBtnDisabled={disableActionButtons}
          stockMangamentAvaiable={orderConfig?.stockMangamentAvaiable}
        />
      </div>
    </>
  );
};

export default OrdersForm;
