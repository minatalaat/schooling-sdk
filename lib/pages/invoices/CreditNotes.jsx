import { Routes, Route, Navigate } from 'react-router-dom';
import { useMemo } from 'react';

import InvoicesManagement from './InvoicesTemplate/InvoicesManagement';
import InvoicesListing from './InvoicesTemplate/InvoicesListing';

import { useFeatures } from '../../hooks/useFeatures';

import NoCustomerRefundsImg from '../../assets/images/icons/Customer Refunds.svg';

const CreditNotes = () => {
  const { isFeatureAvailable } = useFeatures();

  const stockMangamentAvaiable = useMemo(() => {
    return isFeatureAvailable({ featureCode: '12' });
  }, []);

  const invoiceConfig = useMemo(() => {
    return {
      feature: 'INVOICES',
      subFeature: 'CUSTOMERS_REFUNDS',
      operationTypeSelect: 4,
      stockMangamentAvaiable: stockMangamentAvaiable,
      report: {
        reportType: 2,
        action: 'action-print-sales-order-invoice-report',
      },
      modelsEnumKey: 'CUSTOMER_REFUNDS',
      addLabel: 'LBL_ADD_REFUND',
      deleteSuccessMessage: 'NOTE_DELETE_MESSAGE',
      noData: {
        img: NoCustomerRefundsImg,
        noDataMessage: 'NO_CUSTOMER_REFUNDS_DATA_MESSAGE',
        startAddMessage: 'START_ADD_CUSTOMER_REFUNDS_MESSAGE',
      },
      newLabel: 'LBL_NEW_CREDIT_NOTE',
      tooltips: {
        paymentMode: 'customerRefundPaymentMode',
        paymentCondtion: 'customerRefundPaymentCondition',
      },
      onePostAction: true,
      alerts: {
        draftSuccess: 'NOTE_SAVED_AS_DRAFT_MESSAGE',
        ventilateSuccess: 'NOTE_VENTAILATION_MESSAGE',
        validateSuccess: 'NOTE_VALIDATED_MESSAGE',
      },
      subFeatureChecks: {
        isInvoice: false,
        isNote: true,
        isOutgoingPayment: true,
        isIncomingPayment: false,
        isSupplierInvoice: false,
        isCustomerInvoice: false,
        isDebitNote: false,
        isCreditNote: true,
        isCustomerRelated: true,
        isSupplierRelated: false,
      },
      partner: {
        partnerType: 'CUSTOMERS',
        partnerDomain: 'self.isCustomer=true',
      },
    };
  }, []);

  const { canEdit, canView, featuresEnum } = useFeatures(invoiceConfig.feature, invoiceConfig.subFeature);

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
      {/* {canAdd && (
        <Route
          path={featuresEnum[invoiceConfig.subFeature].ADD_ONLY}
          element={<InvoicesManagement addNew invoiceConfig={invoiceConfig} />}
        />
      )} */}
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default CreditNotes;
