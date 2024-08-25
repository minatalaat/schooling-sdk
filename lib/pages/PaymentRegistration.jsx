import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { parse, isDate } from 'date-fns';
import { useDispatch } from 'react-redux';

import SearchModalAxelor from '../components/ui/inputs/SearchModal/SearchModalAxelor';
import TextInput from '../components/ui/inputs/TextInput';
import DateInput from '../components/ui/inputs/DateInput';
import TextArea from '../components/ui/inputs/TextArea';

import { MODELS } from '../constants/models';
import { useAxiosFunction } from '../hooks/useAxios';
import { getActionUrl, getModelUrl, getSearchUrl } from '../services/getUrl';
import { useFeatures } from '../hooks/useFeatures';
import { setFieldValue } from '../utils/formHelpers';
import { VALID_TEXT_WITH_SPECIAL_CHARS } from '../constants/regex/Regex';
import { alertsActions } from '../store/alerts';
import FormNotes from '../components/ui/FormNotes';

function PaymentRegistration({ show, setShow, fetchedInvoice, isCustomerInvoice, isCustomerRefund, isSupplierInvoice, isSupplierRefund }) {
  const { t } = useTranslation();
  const { getFeaturePath } = useFeatures();
  const dispatch = useDispatch();

  const today = new Date();

  const parseDateString = (value, originalValue) => {
    const parsedDate = isDate(originalValue) ? originalValue : parse(originalValue, 'yyyy-MM-dd', new Date());

    return parsedDate;
  };

  const { api } = useAxiosFunction();
  const navigate = useNavigate();
  const [bankDetailsDomain, setBankDetailsDomain] = useState(null);
  const [disableActionButton, setDisableActionButton] = useState(false);

  const defaultMinDate = fetchedInvoice?.invoiceDate || moment(new Date()).locale('en').format('YYYY-MM-DD');

  const initVals = {
    amount: 1.0,
    currency: null,
    paymentMode: null,
    date: defaultMinDate,
    companyBankDetails: null,
    desc: '',
  };

  const valSchema = Yup.object().shape({
    amount: Yup.number()
      .required(t('AMOUNT_VALIDATION_MESSAGE'))
      .moreThan(0.0, t('AMOUNT_VALIDATION_MESSAGE_2'))
      .max(parseFloat(fetchedInvoice.amountRemaining), t('AMOUNT_MORETHAN_REMAINING')),
    currency: Yup.object().required(t('CUSTOMER_CURRENCY_VALIDATION_MESSAGE')).nullable(),
    paymentMode: Yup.object().required(t('PAYMENT_MODE_VALIDATION_MESSAGE')).nullable(),
    date: Yup.date()
      .transform(parseDateString)
      .typeError(t('VALID_DATE_FORMAT'))
      .required(t('ORIGIN_DATE_VALIDATION_MESSAGE'))
      .min(defaultMinDate, t('VALIDATION_PAYMENT_MIN_DATE')),
    desc: Yup.string()
      .matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS'))
      .trim()
      .min(1, t('SPACES_ONLY_VALIDATION_MESSAGE')),
  });

  const formik = useFormik({
    initialValues: initVals,
    validationSchema: valSchema,
    validateOnMount: true,
    validateOnChange: true,
  });

  const onCurrencySuccess = response => {
    if (response.data.status === 0) {
      let data = response.data.data;
      let temp4 = [];

      if (data) {
        data.forEach(currency => {
          let obj = {
            id: currency.id,
            name: currency.name,
            prinitingcode: currency.code,
            symbol: currency.symbol,
            isocode: currency.codeISO,
          };

          temp4.push(obj);
        });
      }

      return { displayedData: [...temp4], total: response.data.total || 0 };
    }
  };

  const onPaymentModesDatasSuccess = response => {
    if (response.data.status === 0) {
      let data = response.data.data;
      let temp3 = [];

      if (data) {
        data.forEach(paymentMode => {
          let obj = {
            id: paymentMode.id,
            name: paymentMode.name,
            label: paymentMode.name,
            code: paymentMode.code,
          };

          temp3.push(obj);
        });
      }

      return { displayedData: [...temp3], total: response.data.total || 0 };
    }
  };

  const onCompanyBankDetailsSuccess = response => {
    if (response.data.status === 0) {
      let data = response.data.data;
      let temp4 = [];

      if (data) {
        data.forEach(BankDetail => {
          let obj = {
            bic: BankDetail ? (BankDetail['bank.code'] ? BankDetail['bank.code'] : '') : '',
            fullName: BankDetail ? (BankDetail.fullName ? BankDetail.fullName : '') : '',
            iban: BankDetail ? (BankDetail.iban ? BankDetail.iban : '') : '',
          };
          temp4.push(obj);
        });
      }

      return { displayedData: [...temp4], total: response.data.total || 0 };
    }
  };

  const onFirstActionSuccess = response => {
    if (response.data.status === 0) {
      api(
        'POST',
        getActionUrl(),
        {
          model: 'com.axelor.apps.account.db.Invoice',
          action: 'action-invoice-group-add-invoice-payment[1]',
          data: {
            criteria: [],
            context: {
              _model: 'com.axelor.apps.account.db.Invoice',
              _operationTypeSelect: fetchedInvoice.operationTypeSelect ? fetchedInvoice.operationTypeSelect : -1,
              _id: null,
              todayDate: moment(today).locale('en').format('YYYY-MM-DD'),
              partnerAccount: fetchedInvoice.partnerAccount ? fetchedInvoice.partnerAccount : {},
              billOfExchangeBlockingByUser: null,
              partnerTaxNbr: null,
              invoicesCopySelect: fetchedInvoice.invoicesCopySelect ? fetchedInvoice.invoicesCopySelect : -1,
              debtRecoveryBlockingReason: null,
              deliveryAddress: null,
              amountRemaining: parseFloat(fetchedInvoice.amountRemaining).toFixed(2).toString(),
              invoiceLineTaxList: fetchedInvoice.invoiceLineTaxList ? fetchedInvoice.invoiceLineTaxList : [],
              billOfExchangeBlockingOk: false,
              paymentSchedule: null,
              debitBlockingOk: false,
              operationTypeSelect: fetchedInvoice.operationTypeSelect ? fetchedInvoice.operationTypeSelect : -1,
              id: fetchedInvoice.id ? fetchedInvoice.id : -1,
              invoiceMessageTemplateOnValidate: null,
              doubtfulCustomerOk: false,
              invoiceMessageTemplate: null,
              groupProductsOnPrintings: false,
              decisionPfpTakenDate: null,
              legalNotice: null,
              version: fetchedInvoice.version ? fetchedInvoice.version : -1,
              externalReference: null,
              remainingAmountAfterFinDiscount: '0.00',
              displayStockMoveOnInvoicePrinting: false,
              reasonOfRefusalToPay: null,
              companyTaxTotal: fetchedInvoice.companyTaxTotal ? fetchedInvoice.companyTaxTotal : '0.00',
              pfpValidateStatusSelect: 0,
              commentOnExchangeBlocking: null,
              advancePaymentInvoiceSet: [],
              createdByInterco: false,
              nextActionDate: null,
              proformaComments: null,
              pfpValidatorUser: null,
              subscriptionToDate: null,
              lcrAccounted: false,
              journal: fetchedInvoice.journal ? fetchedInvoice.journal : {},
              amountPaid: fetchedInvoice.amountPaid ? fetchedInvoice.amountPaid : '0.00',
              displayTimesheetOnPrinting: false,
              currency: fetchedInvoice.currency ? fetchedInvoice.currency : {},
              companyInTaxTotalRemaining: fetchedInvoice.companyInTaxTotalRemaining ? fetchedInvoice.companyInTaxTotalRemaining : '0.00',
              contactPartner: null,
              oldMove: null,
              originDate: null,
              debitBlockingToDate: null,
              tradingName: null,
              commentOnRecoveryBlocking: null,
              address: fetchedInvoice.address ? fetchedInvoice.address : {},
              refundInvoiceList: fetchedInvoice.refundInvoiceList ? fetchedInvoice.refundInvoiceList : [],
              invoiceLineList: fetchedInvoice.invoiceLineList ? fetchedInvoice.invoiceLineList : [],
              estimatedPaymentDate: fetchedInvoice.estimatedPaymentDate ? fetchedInvoice.estimatedPaymentDate : '',
              hideDiscount: false,
              originalInvoice: fetchedInvoice?.originalInvoice || null,
              debtRecoveryBlockingOk: false,
              companyBankDetails: formik.values.companyBankDetails ? formik.values.companyBankDetails : null,
              headOfficeAddress: null,
              invoiceAutomaticMail: false,
              statusSelect: fetchedInvoice.statusSelect ? fetchedInvoice.statusSelect : 3,
              companyInTaxTotal: fetchedInvoice.companyInTaxTotal ? fetchedInvoice.companyInTaxTotal : '0.00',
              addressStr: '877\n1008-SOLYMIYAH-RIYADAH-951753\nSAUDI ARABIA',
              specificNotes: '',
              partner: fetchedInvoice.partner ? fetchedInvoice.partner : {},
              billOfExchangeBlockingToDate: null,
              validatedDate: fetchedInvoice.validatedDate ? fetchedInvoice.validatedDate : '',
              invoiceId: fetchedInvoice.invoiceId ? fetchedInvoice.invoiceId : '',
              fiscalPosition: null,
              paymentDelayReason: null,
              supplierInvoiceNb: null,
              operationSubTypeSelect: fetchedInvoice.operationSubTypeSelect ? fetchedInvoice.operationSubTypeSelect : '',
              reasonOfRefusalToPayStr: null,
              companyExTaxTotal: fetchedInvoice.companyExTaxTotal ? fetchedInvoice.companyExTaxTotal : '0.00',
              dueDate: fetchedInvoice.dueDate ? fetchedInvoice.dueDate : '',
              taxTotal: fetchedInvoice.taxTotal ? fetchedInvoice.taxTotal : '0.00',
              project: null,
              debitBlockingByUser: null,
              financialDiscountDeadlineDate: fetchedInvoice.dueDate ? fetchedInvoice.dueDate : '',
              subrogationRelease: null,
              bankDetails: null,
              irrecoverableStatusSelect: 0,
              financialDiscount: null,
              subrogationReleaseMove: null,
              inTaxTotal: fetchedInvoice.inTaxTotal ? fetchedInvoice.inTaxTotal : '0.00',
              debtRecoveryBlockingByUser: null,
              paymentDelayReasonComments: null,
              commentOnDebitBlocking: null,
              incoterm: null,
              paymentDelay: 0,
              managementObject: null,
              note: '',
              validatedByUser: { code: 'admin', fullName: 'Admin', id: 1 },
              debitBlockingReason: null,
              financialDiscountTotalAmount: '0.00',
              inAti: false,
              priceList: null,
              schedulePaymentOk: false,
              ventilatedByUser: { code: 'admin', fullName: 'Admin', id: 1 },
              printingSettings: { name: 'Company Print setting', id: 1 },
              invoicePaymentList: fetchedInvoice.invoicePaymentList ? fetchedInvoice.invoicePaymentList : [],
              company: fetchedInvoice.company
                ? {
                    code: fetchedInvoice.company.code ? fetchedInvoice.company.code : '',
                    name: fetchedInvoice.company.name ? fetchedInvoice.company.name : '',
                    currency: fetchedInvoice.company.currency ? fetchedInvoice.company.currency : {},
                    id: fetchedInvoice.company.id ? fetchedInvoice.company.id : -1,
                    tradingNameSet: [],
                  }
                : {},
              billOfExchangeBlockingReason: null,
              deliveryAddressStr: null,
              move: fetchedInvoice.move ? fetchedInvoice.move : {},
              paymentCondition: fetchedInvoice.paymentCondition ? fetchedInvoice.paymentCondition : {},
              paymentMode: fetchedInvoice.paymentMode ? fetchedInvoice.paymentMode : {},
              subscriptionFromDate: null,
              stockMoveSet: [],
              exTaxTotal: fetchedInvoice.exTaxTotal ? fetchedInvoice.exTaxTotal : '0.00',
              internalReference: null,
              usherPassageOk: false,
              invoiceDate: fetchedInvoice.invoiceDate ? fetchedInvoice.invoiceDate : '',
              invoiceAutomaticMailOnValidate: false,
              displayExpenseOnPrinting: false,
              ventilatedDate: fetchedInvoice.ventilatedDate ? fetchedInvoice.ventilatedDate : '',
              hasPendingPayments: false,
              financialDiscountRate: '0.00',
              debtRecoveryBlockingToDate: null,
              interco: false,
              wkfStatus: null,
              duplicateInvoiceNbrSameYear: false,
              language: { code: 'en', name: 'English', id: 1 },
              paymentVouchersOnInvoice: false,
              _viewType: 'form',
              _viewName: 'invoice-form',
              _views: [
                { type: 'grid', name: 'invoice-grid' },
                { type: 'form', name: 'invoice-form' },
              ],
              _signal: 'addPaymentBtn',
              _source: 'addPaymentBtn',
            },
          },
        },
        onSecondActionSuccess,
        {}
      );
    } else {
    }
  };

  const onSecondActionSuccess = response => {
    if (response.data.status === 0) {
      api(
        'POST',
        getActionUrl(),

        {
          model: 'com.axelor.apps.account.db.InvoicePayment',
          action: 'action-invoice-payment-group-new,com.axelor.meta.web.MetaController:moreAttrs',
          data: {
            criteria: [],
            context: {
              _model: 'com.axelor.apps.account.db.InvoicePayment',
              _invoice: {
                partnerAccount: fetchedInvoice.partnerAccount ? fetchedInvoice.partnerAccount : {},
                billOfExchangeBlockingByUser: null,
                partnerTaxNbr: null,
                invoicesCopySelect: fetchedInvoice.invoicesCopySelect ? fetchedInvoice.invoicesCopySelect : -1,
                debtRecoveryBlockingReason: null,
                deliveryAddress: null,
                amountRemaining: fetchedInvoice.amountRemaining ? fetchedInvoice.amountRemaining : -1,
                invoiceLineTaxList: fetchedInvoice.invoiceLineTaxList ? fetchedInvoice.invoiceLineTaxList : [],
                billOfExchangeBlockingOk: false,
                paymentSchedule: null,
                debitBlockingOk: false,
                operationTypeSelect: fetchedInvoice.operationTypeSelect ? fetchedInvoice.operationTypeSelect : -1,
                id: fetchedInvoice.id ? fetchedInvoice.id : -1,
                invoiceMessageTemplateOnValidate: null,
                doubtfulCustomerOk: false,
                invoiceMessageTemplate: null,
                groupProductsOnPrintings: false,
                decisionPfpTakenDate: null,
                legalNotice: null,
                version: fetchedInvoice.version ? fetchedInvoice.version : -1,
                externalReference: null,
                remainingAmountAfterFinDiscount: '0.00',
                displayStockMoveOnInvoicePrinting: false,
                reasonOfRefusalToPay: null,
                companyTaxTotal: fetchedInvoice.companyTaxTotal ? fetchedInvoice.companyTaxTotal : '0.00',
                pfpValidateStatusSelect: 0,
                commentOnExchangeBlocking: null,
                advancePaymentInvoiceSet: [],
                createdByInterco: false,
                nextActionDate: null,
                proformaComments: null,
                pfpValidatorUser: null,
                subscriptionToDate: null,
                lcrAccounted: false,
                journal: fetchedInvoice.journal ? fetchedInvoice.journal : {},
                amountPaid: fetchedInvoice.amountPaid ? fetchedInvoice.amountPaid : '0.00',
                displayTimesheetOnPrinting: false,
                currency: fetchedInvoice.currency ? fetchedInvoice.currency : {},
                companyInTaxTotalRemaining: fetchedInvoice.companyInTaxTotalRemaining ? fetchedInvoice.companyInTaxTotalRemaining : '0.00',
                contactPartner: null,
                oldMove: null,
                originDate: null,
                debitBlockingToDate: null,
                tradingName: null,
                commentOnRecoveryBlocking: null,
                address: fetchedInvoice.address ? fetchedInvoice.address : {},
                refundInvoiceList: fetchedInvoice.refundInvoiceList ? fetchedInvoice.refundInvoiceList : [],
                invoiceLineList: fetchedInvoice.invoiceLineList ? fetchedInvoice.invoiceLineList : [],
                estimatedPaymentDate: fetchedInvoice.estimatedPaymentDate ? fetchedInvoice.estimatedPaymentDate : '',
                hideDiscount: false,
                originalInvoice: fetchedInvoice?.originalInvoice || null,
                debtRecoveryBlockingOk: false,
                companyBankDetails: formik.values.companyBankDetails ? formik.values.companyBankDetails : null,
                headOfficeAddress: null,
                invoiceAutomaticMail: false,
                statusSelect: fetchedInvoice.statusSelect ? fetchedInvoice.statusSelect : '',
                companyInTaxTotal: fetchedInvoice.companyInTaxTotal ? fetchedInvoice.companyInTaxTotal : '0.00',
                addressStr: '877\n1008-SOLYMIYAH-RIYADAH-951753\nSAUDI ARABIA',
                specificNotes: '',
                partner: fetchedInvoice.partner ? fetchedInvoice.partner : '',
                billOfExchangeBlockingToDate: null,
                validatedDate: fetchedInvoice.validatedDate ? fetchedInvoice.validatedDate : '',
                invoiceId: fetchedInvoice.invoiceId ? fetchedInvoice.invoiceId : '',
                fiscalPosition: null,
                paymentDelayReason: null,
                supplierInvoiceNb: null,
                operationSubTypeSelect: fetchedInvoice.operationSubTypeSelect ? fetchedInvoice.operationSubTypeSelect : -1,
                reasonOfRefusalToPayStr: null,
                companyExTaxTotal: fetchedInvoice.companyExTaxTotal ? fetchedInvoice.companyExTaxTotal : '0.00',
                dueDate: fetchedInvoice.dueDate ? fetchedInvoice.dueDate : '',
                taxTotal: fetchedInvoice.taxTotal ? fetchedInvoice.taxTotal : '0.00',
                project: null,
                debitBlockingByUser: null,
                financialDiscountDeadlineDate: fetchedInvoice.dueDate ? fetchedInvoice.dueDate : '',
                subrogationRelease: null,
                bankDetails: null,
                irrecoverableStatusSelect: 0,
                financialDiscount: null,
                subrogationReleaseMove: null,
                inTaxTotal: fetchedInvoice.inTaxTotal ? fetchedInvoice.inTaxTotal : '0.00',
                debtRecoveryBlockingByUser: null,
                paymentDelayReasonComments: null,
                commentOnDebitBlocking: null,
                incoterm: null,
                paymentDelay: 0,
                managementObject: null,
                note: '',
                validatedByUser: { code: 'admin', fullName: 'Admin', id: 1 },
                debitBlockingReason: null,
                financialDiscountTotalAmount: '0.00',
                inAti: false,
                priceList: null,
                schedulePaymentOk: false,
                ventilatedByUser: { code: 'admin', fullName: 'Admin', id: 1 },
                printingSettings: { name: 'Company Print setting', id: 1 },
                // printedPDF: {
                //   fileName: "Invoice SI00052 - 20230111.pdf",
                //   id: 251,
                // },
                invoicePaymentList: fetchedInvoice.invoicePaymentList ? fetchedInvoice.invoicePaymentList : {},
                company: fetchedInvoice.company ? fetchedInvoice.company : {},
                billOfExchangeBlockingReason: null,
                deliveryAddressStr: null,
                move: fetchedInvoice.move ? fetchedInvoice.move : {},
                paymentCondition: fetchedInvoice.paymentCondition ? fetchedInvoice.paymentCondition : {},
                paymentMode: fetchedInvoice.paymentMode ? fetchedInvoice.paymentMode : {},
                subscriptionFromDate: null,
                stockMoveSet: [],
                exTaxTotal: fetchedInvoice.exTaxTotal ? fetchedInvoice.exTaxTotal : '0.00',
                internalReference: null,
                usherPassageOk: false,
                invoiceDate: fetchedInvoice.invoiceDate ? fetchedInvoice.invoiceDate : '',
                invoiceAutomaticMailOnValidate: false,
                displayExpenseOnPrinting: false,
                ventilatedDate: fetchedInvoice.ventilatedDate ? fetchedInvoice.ventilatedDate : '',
                hasPendingPayments: false,
                financialDiscountRate: '0.00',
                debtRecoveryBlockingToDate: null,
                interco: false,
              },
              _id: fetchedInvoice.id ? fetchedInvoice.id : -1,
              _viewType: 'form',
              _viewName: 'invoice-payment-form',
              _views: [{ type: 'form', name: 'invoice-payment-form' }],
              _source: 'form',
            },
          },
        },
        onThirdActionSuccess,
        {}
      );
    } else {
    }
  };

  const onThirdActionSuccess = response => {
    if (response.data.status === 0) {
      let fetchedDefaultData = response.data.data[3] ? (response.data.data[3].values ? response.data.data[3].values : {}) : {};
      //   formik.setFieldError("amount", "");
      setFieldValue(
        formik,
        'amount',
        fetchedDefaultData
          ? fetchedDefaultData
            ? fetchedDefaultData.amount
              ? parseFloat(fetchedDefaultData.amount).toFixed(2)
              : 0.0
            : 0.0
          : 0.0
      );
      setFieldValue(formik, 'paymentMode', fetchedDefaultData ? (fetchedDefaultData ? fetchedDefaultData.paymentMode : null) : null);
      setFieldValue(
        formik,
        'companyBankDetails',
        fetchedDefaultData ? (fetchedDefaultData ? fetchedDefaultData.companyBankDetails : null) : null
      );
    }
  };

  const getBankDetailsDomain = () => {
    let payload = {
      model: 'com.axelor.apps.account.db.InvoicePayment',
      action: 'action-invoice-payment-method-bank-details-domain',
      data: {
        criteria: [],
        context: {
          _model: 'com.axelor.apps.account.db.InvoicePayment',
          _invoice: {
            id: fetchedInvoice.id,
          },
          _id: fetchedInvoice.id,
          'paymentMode.typeSelect': 1,
          paymentMode: formik.values.paymentMode ? formik.values.paymentMode : null,
          _source: 'companyBankDetails',
        },
      },
    };

    api('POST', getActionUrl(), payload, onBankDetailsDomainSuccess);
  };

  useEffect(() => {
    getBankDetails();
  }, [bankDetailsDomain]);

  useEffect(() => {
    if (formik.values.paymentMode) {
      setFieldValue(formik, 'companyBankDetails', null);
      getBankDetailsDomain();
    }
  }, [formik.values.paymentMode]);

  const onBankDetailsDomainSuccess = response => {
    if (response.data.status === 0) {
      let data = response.data.data[0].attrs.companyBankDetails.domain;
      setBankDetailsDomain(data);
    }
  };

  const getBankDetails = data => {
    api(
      'POST',
      getSearchUrl(MODELS.BANK_DETAILS),
      {
        fields: ['bank.code', 'ownerName', 'iban', 'active', 'bankAddress', 'fullName', 'swiftAddress'],
        sortBy: null,
        data: {
          _domain: bankDetailsDomain ? bankDetailsDomain : '',
          _domainContext: {
            _invoice: fetchedInvoice,
            _id: fetchedInvoice.id,
            amount: fetchedInvoice.amountRemaining,
            typeSelect: fetchedInvoice.operationTypeSelect,
            'move.statusSelect': fetchedInvoice.move ? (fetchedInvoice.move.statusSelect ? fetchedInvoice.move.statusSelect : null) : null,
            statusSelect: fetchedInvoice.statusSelect,
            paymentMode: fetchedInvoice ? (fetchedInvoice.paymentMode ? fetchedInvoice.paymentMode : null) : null,
            currency: fetchedInvoice ? (fetchedInvoice.currency ? fetchedInvoice.currency : null) : null,
            invoice: fetchedInvoice,
            paymentDate: null,
            _model: 'com.axelor.apps.account.db.InvoicePayment',
          },
          operator: 'and',
          criteria: [],
        },
        limit: -1,
        offset: 0,
        translate: true,
      },
      onCompanyBankDetailsSuccess,
      {}
    );
  };

  const onPaymentRegisteration = () => {
    if (formik.isValid) {
      setDisableActionButton(true);

      let payload = {
        data: {
          financialDiscountAmount: '0.00',
          amount: parseFloat(formik.values.amount).toFixed(2).toString(),
          financialDiscountTaxAmount: '0.00',
          applyFinancialDiscount: false,
          typeSelect: 2,
          'move.statusSelect': 1,
          statusSelect: 0,
          'paymentMode.typeSelect': 1,
          companyBankDetails: formik.values.companyBankDetails ? formik.values.companyBankDetails : null,
          paymentMode: formik.values.paymentMode ? formik.values.paymentMode : null,
          currency: formik.values.currency ? formik.values.currency : null,
          invoice: fetchedInvoice
            ? {
                standardInvoice: null,
                partnerAccount: fetchedInvoice.partnerAccount ? fetchedInvoice.partnerAccount : null,
                billOfExchangeBlockingByUser: null,
                partnerTaxNbr: null,
                invoicesCopySelect: 1,
                debtRecoveryBlockingReason: null,
                deliveryAddress: null,
                amountRemaining: fetchedInvoice.amountRemaining ? fetchedInvoice.amountRemaining : null,
                invoiceLineTaxList: fetchedInvoice.invoiceLineTaxList ? fetchedInvoice.invoiceLineTaxList : null,
                billOfExchangeBlockingOk: false,
                paymentSchedule: null,
                debitBlockingOk: false,
                operationTypeSelect: fetchedInvoice.operationTypeSelect ? fetchedInvoice.operationTypeSelect : null,
                id: fetchedInvoice.id ? fetchedInvoice.id : null,
                invoiceMessageTemplateOnValidate: null,
                doubtfulCustomerOk: false,
                invoiceMessageTemplate: null,
                groupProductsOnPrintings: false,
                contract: null,
                decisionPfpTakenDate: null,
                updatedOn: null,
                legalNotice: null,
                attrs: null,
                externalReference: null,
                remainingAmountAfterFinDiscount: '0.00',
                displayStockMoveOnInvoicePrinting: false,
                interbankCodeLine: null,
                reasonOfRefusalToPay: null,
                companyTaxTotal: fetchedInvoice.companyTaxTotal ? fetchedInvoice.companyTaxTotal : null,
                pfpValidateStatusSelect: 0,
                commentOnExchangeBlocking: null,
                advancePaymentInvoiceSet: [],
                createdByInterco: false,
                nextActionDate: null,
                createdOn: null,
                proformaComments: null,
                pfpValidatorUser: null,
                subscriptionToDate: null,
                lcrAccounted: false,
                journal: fetchedInvoice.journal ? fetchedInvoice.journal : null,
                amountPaid: fetchedInvoice.amountPaid ? fetchedInvoice.amountPaid : null,
                displayTimesheetOnPrinting: false,
                currency: fetchedInvoice.currency
                  ? {
                      code: fetchedInvoice.currency.code ? fetchedInvoice.currency.code : null,
                      name: fetchedInvoice.currency.name ? fetchedInvoice.currency.name : null,
                      id: fetchedInvoice.currency.id ? fetchedInvoice.currency.id : null,
                    }
                  : null,
                companyInTaxTotalRemaining: fetchedInvoice.companyInTaxTotalRemaining ? fetchedInvoice.companyInTaxTotalRemaining : null,
                contactPartner: null,
                oldMove: null,
                originDate: null,
                saleOrder: null,
                debitBlockingToDate: null,
                rejectMoveLine: null,
                tradingName: null,
                commentOnRecoveryBlocking: null,
                address: fetchedInvoice.address ? fetchedInvoice.address : null,
                refundInvoiceList: [],
                invoiceLineList: fetchedInvoice.invoiceLineList ? fetchedInvoice.invoiceLineList : null,
                estimatedPaymentDate: fetchedInvoice.estimatedPaymentDate ? fetchedInvoice.estimatedPaymentDate : null,
                hideDiscount: false,
                originalInvoice: fetchedInvoice?.originalInvoice || null,
                debtRecoveryBlockingOk: false,
                companyBankDetails: formik.values.companyBankDetails ? formik.values.companyBankDetails : null,
                headOfficeAddress: null,
                invoiceAutomaticMail: false,
                statusSelect: fetchedInvoice.statusSelect ? fetchedInvoice.statusSelect : null,
                companyInTaxTotal: fetchedInvoice.companyInTaxTotal ? fetchedInvoice.companyInTaxTotal : null,
                addressStr: null,
                amountRejected: '0',
                importId: null,
                specificNotes: '',
                partner: fetchedInvoice.partner ? fetchedInvoice.partner : null,
                billOfExchangeBlockingToDate: null,
                validatedDate: fetchedInvoice.validatedDate ? fetchedInvoice.validatedDate : null,
                invoiceId: fetchedInvoice.invoiceId ? fetchedInvoice.invoiceId : null,
                fiscalPosition: null,
                paymentDelayReason: null,
                supplierInvoiceNb: null,
                operationSubTypeSelect: fetchedInvoice.operationSubTypeSelect ? fetchedInvoice.operationSubTypeSelect : null,
                reasonOfRefusalToPayStr: null,
                companyExTaxTotal: fetchedInvoice.companyExTaxTotal ? fetchedInvoice.companyExTaxTotal : null,
                dueDate: fetchedInvoice.dueDate ? fetchedInvoice.dueDate : null,
                taxTotal: fetchedInvoice.taxTotal ? fetchedInvoice.taxTotal : null,
                project: null,
                debitBlockingByUser: null,
                financialDiscountDeadlineDate: fetchedInvoice.financialDiscountDeadlineDate
                  ? fetchedInvoice.financialDiscountDeadlineDate
                  : null,
                subrogationRelease: null,
                bankDetails: null,
                alreadyPrintedOk: true,
                irrecoverableStatusSelect: 0,
                financialDiscount: null,
                selected: false,
                subrogationReleaseMove: null,
                inTaxTotal: fetchedInvoice.inTaxTotal ? fetchedInvoice.inTaxTotal : null,
                processInstanceId: null,
                updatedBy: null,
                debtRecoveryBlockingByUser: null,
                paymentDelayReasonComments: null,
                commentOnDebitBlocking: null,
                incoterm: null,
                debitNumber: null,
                paymentDelay: 0,
                canceledPaymentSchedule: null,
                managementObject: null,
                note: null,
                importOrigin: null,
                validatedByUser: {
                  code: 'admin',
                  fullName: null,
                  id: 1,
                },
                debitBlockingReason: null,
                financialDiscountTotalAmount: '0.00',
                inAti: false,
                batchSet: null,
                priceList: null,
                schedulePaymentOk: false,
                ventilatedByUser: {
                  code: 'admin',
                  fullName: null,
                  id: 1,
                },
                printingSettings: {
                  name: '',
                  id: 154,
                },
                rejectDate: null,
                invoicePaymentList: [],
                company: fetchedInvoice.company
                  ? {
                      code: fetchedInvoice.company.code ? fetchedInvoice.company.code : null,
                      name: fetchedInvoice.company.name ? fetchedInvoice.company.name : null,
                      id: fetchedInvoice.company.id ? fetchedInvoice.company.id : null,
                    }
                  : null,
                billOfExchangeBlockingReason: null,
                deliveryAddressStr: null,
                paymentMove: null,
                move: fetchedInvoice.move ? fetchedInvoice.move : null,
                paymentCondition: fetchedInvoice.paymentCondition ? fetchedInvoice.paymentCondition : null,
                paymentMode: fetchedInvoice.paymentMode ? fetchedInvoice.paymentMode : null,
                subscriptionFromDate: null,
                stockMoveSet: [],
                exTaxTotal: fetchedInvoice.exTaxTotal ? fetchedInvoice.exTaxTotal : null,
                internalReference: null,
                usherPassageOk: false,
                invoiceDate: fetchedInvoice.invoiceDate ? fetchedInvoice.invoiceDate : null,
                invoiceAutomaticMailOnValidate: false,
                directDebitAmount: '0',
                createdBy: null,
                displayExpenseOnPrinting: false,
                purchaseOrder: null,
                ventilatedDate: fetchedInvoice.ventilatedDate ? fetchedInvoice.ventilatedDate : null,
                hasPendingPayments: false,
                financialDiscountRate: '0.00',
                debtRecoveryBlockingToDate: null,
                paymentDate: null,
                interco: false,
              }
            : null,
          paymentDate: moment(formik.values.date).locale('en').format('YYYY-MM-DD'),
          financialDiscountTotalAmount: '0.00',
          financialDiscountDeadlineDate: fetchedInvoice.financialDiscountDeadlineDate ? fetchedInvoice.financialDiscountDeadlineDate : null,
          _original: {},
        },
      };
      api('POST', getModelUrl(MODELS.INVOICE_PAYMENT), payload, onSaveActionSuccess, {});
    } else {
      dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'PLEASE_FILL_REQUIRED_ERROR_MESSAGE' }));
    }
  };

  const onSaveActionSuccess = response => {
    if (response.data.status === 0) {
      dispatch(alertsActions.initiateAlert({ title: 'Success', message: 'PAYMENT_REGISTRATION_SUCCESS_MESSAGE' }));

      setTimeout(() => {
        setShow(false);

        if (isCustomerInvoice) {
          setDisableActionButton(false);
          navigate(getFeaturePath('CUSTOMERS_INVOICES'));
        }

        if (isCustomerRefund) {
          setDisableActionButton(false);
          navigate(getFeaturePath('CUSTOMERS_REFUNDS'));
        }

        if (isSupplierInvoice) {
          setDisableActionButton(false);
          navigate(getFeaturePath('SUPPLIERS_INVOICES'));
        }

        if (isSupplierRefund) {
          setDisableActionButton(false);
          navigate(getFeaturePath('SUPPLIERS_REFUNDS'));
        }
      }, 3000);
    } else if (
      response.data.status === -1 &&
      response.data.data &&
      response.data.data.message &&
      response.data.data.message.includes('No period found or it has been closed')
    ) {
      setDisableActionButton(false);
      dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'NO_PERIOD_FOUND' }));
    } else {
      setDisableActionButton(false);
      dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'SOMETHING_WENT_WRONG' }));
    }
  };

  useEffect(() => {
    api(
      'POST',
      getSearchUrl(MODELS.PAYMENTMODES),
      {
        fields: ['id', 'name', 'code', 'typeSelect'],
        sortBy: null,
        data: {
          _domain: isCustomerInvoice
            ? 'self.inOutSelect = 1'
            : isCustomerRefund
              ? 'self.inOutSelect = 2'
              : isSupplierInvoice
                ? 'self.inOutSelect = 2'
                : isSupplierRefund
                  ? 'self.inOutSelect = 1'
                  : '',
        },
        limit: -1,
        offset: 0,
        translate: true,
      },
      onPaymentModesDatasSuccess
    );
    api(
      'POST',
      getActionUrl(),
      {
        model: 'com.axelor.apps.account.db.Invoice',
        action: 'action-invoice-group-add-invoice-payment',
        data: {
          criteria: [],
          context: {
            _model: 'com.axelor.apps.account.db.Invoice',
            _operationTypeSelect: fetchedInvoice.operationTypeSelect ? fetchedInvoice.operationTypeSelect : -1,
            _id: null,
            todayDate: moment(today).locale('en').format('YYYY-MM-DD'),
            partnerAccount: fetchedInvoice.partnerAccount ? fetchedInvoice.partnerAccount : {},
            billOfExchangeBlockingByUser: null,
            partnerTaxNbr: null,
            invoicesCopySelect: fetchedInvoice.invoicesCopySelect ? fetchedInvoice.invoicesCopySelect : -1,
            debtRecoveryBlockingReason: null,
            deliveryAddress: null,
            amountRemaining: parseFloat(fetchedInvoice.amountRemaining).toFixed(2).toString(),
            invoiceLineTaxList: fetchedInvoice.invoiceLineTaxList ? fetchedInvoice.invoiceLineTaxList : [],
            billOfExchangeBlockingOk: false,
            paymentSchedule: null,
            debitBlockingOk: false,
            operationTypeSelect: fetchedInvoice.operationTypeSelect ? fetchedInvoice.operationTypeSelect : -1,
            id: fetchedInvoice.id ? fetchedInvoice.id : -1,
            invoiceMessageTemplateOnValidate: null,
            doubtfulCustomerOk: false,
            invoiceMessageTemplate: null,
            groupProductsOnPrintings: false,
            decisionPfpTakenDate: null,
            legalNotice: null,
            version: fetchedInvoice.version ? fetchedInvoice.version : -1,
            externalReference: null,
            remainingAmountAfterFinDiscount: '0.00',
            displayStockMoveOnInvoicePrinting: false,
            reasonOfRefusalToPay: null,
            companyTaxTotal: fetchedInvoice.companyTaxTotal ? fetchedInvoice.companyTaxTotal : '0.00',
            pfpValidateStatusSelect: 0,
            commentOnExchangeBlocking: null,
            advancePaymentInvoiceSet: [],
            createdByInterco: false,
            nextActionDate: null,
            proformaComments: null,
            pfpValidatorUser: null,
            subscriptionToDate: null,
            lcrAccounted: false,
            journal: fetchedInvoice.journal ? fetchedInvoice.journal : {},
            amountPaid: fetchedInvoice.amountPaid ? fetchedInvoice.amountPaid : '0.00',
            displayTimesheetOnPrinting: false,
            currency: fetchedInvoice.currency ? fetchedInvoice.currency : {},
            companyInTaxTotalRemaining: fetchedInvoice.companyInTaxTotalRemaining ? fetchedInvoice.companyInTaxTotalRemaining : '0.00',
            contactPartner: null,
            oldMove: null,
            originDate: null,
            debitBlockingToDate: null,
            tradingName: null,
            commentOnRecoveryBlocking: null,
            address: fetchedInvoice.address ? fetchedInvoice.address : {},
            refundInvoiceList: fetchedInvoice.refundInvoiceList ? fetchedInvoice.refundInvoiceList : [],
            invoiceLineList: fetchedInvoice.invoiceLineList ? fetchedInvoice.invoiceLineList : [],
            estimatedPaymentDate: fetchedInvoice.estimatedPaymentDate ? fetchedInvoice.estimatedPaymentDate : '',
            hideDiscount: false,
            originalInvoice: fetchedInvoice?.originalInvoice || null,
            debtRecoveryBlockingOk: false,
            companyBankDetails: formik.values.companyBankDetails ? formik.values.companyBankDetails : null,
            headOfficeAddress: null,
            invoiceAutomaticMail: false,
            statusSelect: fetchedInvoice.statusSelect ? fetchedInvoice.statusSelect : 3,
            companyInTaxTotal: fetchedInvoice.companyInTaxTotal ? fetchedInvoice.companyInTaxTotal : '0.00',
            addressStr: '877\n1008-SOLYMIYAH-RIYADAH-951753\nSAUDI ARABIA',
            specificNotes: '',
            partner: fetchedInvoice.partner ? fetchedInvoice.partner : {},
            billOfExchangeBlockingToDate: null,
            validatedDate: fetchedInvoice.validatedDate ? fetchedInvoice.validatedDate : '',
            invoiceId: fetchedInvoice.invoiceId ? fetchedInvoice.invoiceId : '',
            fiscalPosition: null,
            paymentDelayReason: null,
            supplierInvoiceNb: null,
            operationSubTypeSelect: fetchedInvoice.operationSubTypeSelect ? fetchedInvoice.operationSubTypeSelect : '',
            reasonOfRefusalToPayStr: null,
            companyExTaxTotal: fetchedInvoice.companyExTaxTotal ? fetchedInvoice.companyExTaxTotal : '0.00',
            dueDate: fetchedInvoice.dueDate ? fetchedInvoice.dueDate : '',
            taxTotal: fetchedInvoice.taxTotal ? fetchedInvoice.taxTotal : '0.00',
            project: null,
            debitBlockingByUser: null,
            financialDiscountDeadlineDate: fetchedInvoice.dueDate ? fetchedInvoice.dueDate : '',
            subrogationRelease: null,
            bankDetails: null,
            irrecoverableStatusSelect: 0,
            financialDiscount: null,
            subrogationReleaseMove: null,
            inTaxTotal: fetchedInvoice.inTaxTotal ? fetchedInvoice.inTaxTotal : '0.00',
            debtRecoveryBlockingByUser: null,
            paymentDelayReasonComments: null,
            commentOnDebitBlocking: null,
            incoterm: null,
            paymentDelay: 0,
            managementObject: null,
            note: '',
            validatedByUser: { code: 'admin', fullName: 'Admin', id: 1 },
            debitBlockingReason: null,
            financialDiscountTotalAmount: '0.00',
            inAti: false,
            priceList: null,
            schedulePaymentOk: false,
            ventilatedByUser: { code: 'admin', fullName: 'Admin', id: 1 },
            printingSettings: { name: 'Company Print setting', id: 1 },
            //printedPDF: { fileName: "Invoice SI00052 - 20230111.pdf", id: 251 },
            invoicePaymentList: fetchedInvoice.invoicePaymentList ? fetchedInvoice.invoicePaymentList : [],
            company: fetchedInvoice.company
              ? {
                  code: fetchedInvoice.company.code ? fetchedInvoice.company.code : '',
                  name: fetchedInvoice.company.name ? fetchedInvoice.company.name : '',
                  currency: fetchedInvoice.company.currency ? fetchedInvoice.company.currency : {},
                  id: fetchedInvoice.company.id ? fetchedInvoice.company.id : -1,
                  tradingNameSet: [],
                }
              : {},
            billOfExchangeBlockingReason: null,
            deliveryAddressStr: null,
            move: fetchedInvoice.move ? fetchedInvoice.move : {},
            paymentCondition: fetchedInvoice.paymentCondition ? fetchedInvoice.paymentCondition : {},
            paymentMode: fetchedInvoice.paymentMode ? fetchedInvoice.paymentMode : {},
            subscriptionFromDate: null,
            stockMoveSet: [],
            exTaxTotal: fetchedInvoice.exTaxTotal ? fetchedInvoice.exTaxTotal : '0.00',
            internalReference: null,
            usherPassageOk: false,
            invoiceDate: fetchedInvoice.invoiceDate ? fetchedInvoice.invoiceDate : '',
            invoiceAutomaticMailOnValidate: false,
            displayExpenseOnPrinting: false,
            ventilatedDate: fetchedInvoice.ventilatedDate ? fetchedInvoice.ventilatedDate : '',
            hasPendingPayments: false,
            financialDiscountRate: '0.00',
            debtRecoveryBlockingToDate: null,
            interco: false,
            wkfStatus: null,
            duplicateInvoiceNbrSameYear: false,
            language: { code: 'en', name: 'English', id: 1 },
            paymentVouchersOnInvoice: false,
            _viewType: 'form',
            _viewName: 'invoice-form',
            _views: [
              { type: 'grid', name: 'invoice-grid' },
              { type: 'form', name: 'invoice-form' },
            ],
            _signal: 'addPaymentBtn',
            _source: 'addPaymentBtn',
          },
        },
      },
      onFirstActionSuccess,
      {}
    );
  }, []);

  return (
    <>
      <Modal
        id="add-new-line"
        show={show}
        onHide={() => setShow(false)}
        dialogClassName="modal-90w"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        size="xl"
      >
        <Modal.Header closeButton>
          <h5 className="modal-title" id="add-new-line">
            {t('LBL_PAYMENT_REGISTRATION')}
          </h5>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            <div className="tab-content" id="pills-tabContent">
              <div className="tab-pane fade show active" id="pills-information" role="tabpanel" aria-labelledby="pills-information-tab">
                <div className="row">
                  <div className="col-md-6">
                    <TextInput formik={formik} label="LBL_AMOUNT" accessor="amount" mode="add" disabled={false} isRequired={true} />{' '}
                  </div>
                  <div className="col-md-6">
                    <SearchModalAxelor
                      formik={formik}
                      modelKey="CURRENCIES"
                      mode="add"
                      isRequired={false}
                      disabled={true}
                      onSuccess={onCurrencySuccess}
                      defaultValueConfig={{
                        payloadDomain: "self.codeISO = 'SAR'",
                      }}
                    />
                  </div>
                  <div className="col-md-6">
                    <SearchModalAxelor
                      formik={formik}
                      modelKey="PAYMENT_MODES"
                      mode="add"
                      isRequired={true}
                      defaultValueConfig={null}
                      onSuccess={onPaymentModesDatasSuccess}
                      selectCallback={getBankDetailsDomain}
                      payloadDomain={
                        isCustomerInvoice
                          ? 'self.inOutSelect = 1'
                          : isCustomerRefund
                            ? 'self.inOutSelect = 2'
                            : isSupplierInvoice
                              ? 'self.inOutSelect = 2'
                              : isSupplierRefund
                                ? 'self.inOutSelect = 1'
                                : ''
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <DateInput
                      formik={formik}
                      label="LBL_DATE"
                      accessor="date"
                      mode="add"
                      isRequired={true}
                      disabled={false}
                      min={defaultMinDate}
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <SearchModalAxelor
                        formik={formik}
                        modelKey="BANK_DETAILS"
                        mode="add"
                        isRequired={false}
                        onSuccess={onCompanyBankDetailsSuccess}
                        payloadDomain={bankDetailsDomain ? bankDetailsDomain : null}
                        extraFields={['bankAccount', 'bankAccount.label']}
                        tooltip="paymentRegisBankDetails"
                        selectIdentifier="fullName"
                        defaultValueConfig={null}
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <TextArea formik={formik} label="LBL_DESCRIPTION" accessor="desc" mode="add" />
                  </div>
                </div>
              </div>
              <FormNotes
                notes={[
                  {
                    title: 'LBL_REQUIRED_NOTIFY',
                    type: 3,
                  },
                ]}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="float-end">
            <button type="button" className="btn cancel-act" data-bs-dismiss="modal" onClick={() => setShow(false)}>
              {t('LBL_CLOSE')}
            </button>
            <button
              type="button"
              className="btn add-btn"
              onClick={() => {
                onPaymentRegisteration();
              }}
              disabled={disableActionButton}
            >
              {t('LBL_OK')}
            </button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default PaymentRegistration;
