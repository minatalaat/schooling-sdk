import { Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

import InvoicesManagement from './InvoicesTemplate/InvoicesManagement';
import InvoicesListing from './InvoicesTemplate/InvoicesListing';

import { useFeatures } from '../../hooks/useFeatures';

import NoCustomerInvoicesImg from '../../assets/images/icons/Customer Invoices.svg';

const CustomerInvoices = () => {
  const { t } = useTranslation();
  const { isFeatureAvailable } = useFeatures();

  const stockMangamentAvaiable = useMemo(() => {
    return isFeatureAvailable({ featureCode: '12' });
  }, []);
  const invoiceConfig = useMemo(() => {
    return {
      feature: 'INVOICES',
      subFeature: 'CUSTOMERS_INVOICES',
      stockMangamentAvaiable: stockMangamentAvaiable,
      tourSteps: [
        {
          target: `.step-add-customer-invoice-1`,
          title: <strong>{t('LBL_ADD_CUSTOMER_INVOICE')}</strong>,
          content: t('LBL_ADD_CUSTOMER_INVOICE_DESC'),
          disableBeacon: true,
        },
        {
          target: `.step-dummy`,
          title: <strong>{t('LBL_ADD_CUSTOMER')}</strong>,
          content: t('LBL_ADD_CUSTOMER_DESC'),
          disableBeacon: true,
        },
      ],
      operationTypeSelect: 3,
      report: {
        reportType: 1,
        action: 'action-print-sales-order-invoice-report',
      },
      modelsEnumKey: 'CUSTOMER_INVOICES',
      addLabel: 'LBL_ADD_INVOICE',
      deleteSuccessMessage: 'INVOICE_DELETE_MESSAGE',
      noData: {
        img: NoCustomerInvoicesImg,
        noDataMessage: 'NO_CUSTOMER_INVOICES_DATA_MESSAGE',
        startAddMessage: 'START_ADD_CUSTOMER_INVOICES_MESSAGE',
        stepClass: 'step-add-customer-invoice',
      },
      isZATCA: true,
      newLabel: 'LBL_NEW_CUSTOMER_INVOICE',
      tooltips: {
        paymentMode: 'customerInvoicePaymentMode',
        paymentCondtion: 'customerInvoicePaymentCondition',
      },
      onePostAction: true,
      alerts: {
        draftSuccess: 'INVOICE_SAVED_AS_DRAFT_MESSAGE',
        ventilateSuccess: 'INVOICE_VENTAILATION_MESSAGE',
        validateSuccess: 'INVOICE_VALIDATED_MESSAGE',
      },
      subFeatureChecks: {
        isInvoice: true,
        isNote: false,
        isOutgoingPayment: false,
        isIncomingPayment: true,
        isSupplierInvoice: false,
        isCustomerInvoice: true,
        isDebitNote: false,
        isCreditNote: false,
        isCustomerRelated: true,
        isSupplierRelated: false,
      },
      refundSubFeature: 'CUSTOMERS_REFUNDS',
      partner: {
        partnerType: 'CUSTOMERS',
        partnerDomain: 'self.isCustomer=true',
      },
      tourConfig: {
        stepAddClass: 'step-add-customer-invoice',
        stepAddSubmit: 'step-add-customer-invoice-submit',
        listSteps: [
          {
            target: `.step-add-customer-invoice`,
            title: <strong>{t('LBL_ADD_CUSTOMER_INVOICE')}</strong>,
            content: t('LBL_ADD_CUSTOMER_INVOICE_DESC'),
            disableBeacon: true,
          },
          {
            target: `.step-dummy`,
            title: <strong>{t('LBL_ADD_CUSTOMER_INVOICE')}</strong>,
            content: t('LBL_ADD_CUSTOMER_INVOICE_DESC'),
            disableBeacon: true,
          },
        ],
        addSteps: [
          {
            target: `.step-add-customer-invoice-1`,
            title: <strong>{t('LBL_ADD_CUSTOMER_INVOICE_1')}</strong>,
            content: t('LBL_ADD_CUSTOMER_INVOICE_DESC_1'),
            disableBeacon: true,
          },
          {
            target: `.step-add-customer-invoice-2`,
            title: <strong>{t('LBL_ADD_CUSTOMER_INVOICE_2')}</strong>,
            content: t('LBL_ADD_CUSTOMER_INVOICE_DESC_2'),
            disableBeacon: true,
          },
          {
            target: `.step-add-customer-invoice-submit`,
            title: <strong>{t('LBL_ADD_CUSTOMER_INVOICE_3')}</strong>,
            content: t('LBL_ADD_CUSTOMER_INVOICE_DESC_3'),
            disableBeacon: true,
          },
        ],
      },
      printOptions: {
        showOptions: true,
        options: [
          {
            type: 'toggle',
            defaultValue: false,
            accessor: 'Description',
            label: 'LBL_SHOW_DESCRIPTION',
          },
        ],
      },
    };
  }, []);

  const { canAdd, canEdit, canView, featuresEnum } = useFeatures(invoiceConfig.feature, invoiceConfig.subFeature);

  return (
    <Routes>
      <Route path="/" element={<InvoicesListing invoiceConfig={invoiceConfig} />} />
      {canEdit && (
        <Route
          path={featuresEnum[invoiceConfig.subFeature].EDIT_ONLY}
          element={<InvoicesManagement enableEdit={true} invoiceConfig={invoiceConfig} />}
        />
      )}
      {canView && (
        <Route
          path={featuresEnum[invoiceConfig.subFeature].VIEW_ONLY}
          element={<InvoicesManagement enableEdit={false} invoiceConfig={invoiceConfig} />}
        />
      )}
      {canAdd && (
        <Route
          path={featuresEnum[invoiceConfig.subFeature].ADD_ONLY}
          element={<InvoicesManagement addNew invoiceConfig={invoiceConfig} />}
        />
      )}
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default CustomerInvoices;
