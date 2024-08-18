import { Routes, Route, Navigate } from 'react-router-dom';
import { useMemo } from 'react';

import InvoicesManagement from './InvoicesTemplate/InvoicesManagement';
import InvoicesListing from './InvoicesTemplate/InvoicesListing';

import { useFeatures } from '../../hooks/useFeatures';

import NoSupplierRefundsImg from '../../assets/images/icons/Supplier Refunds.svg';

const DebitNotes = () => {
  const { isFeatureAvailable } = useFeatures();

  const stockMangamentAvaiable = useMemo(() => {
    return isFeatureAvailable({ featureCode: '12' });
  }, []);
  const invoiceConfig = useMemo(() => {
    return {
      feature: 'INVOICES',
      subFeature: 'SUPPLIERS_REFUNDS',
      operationTypeSelect: 2,
      stockMangamentAvaiable: stockMangamentAvaiable,

      report: {
        reportType: 2,
        action: 'action-print-purchase-order-invoice-report',
      },
      modelsEnumKey: 'SUPPLIER_REFUNDS',
      addLabel: 'LBL_ADD_DEBIT_NOTE',
      deleteSuccessMessage: 'NOTE_DELETE_MESSAGE',
      noData: {
        img: NoSupplierRefundsImg,
        noDataMessage: 'NO_SUPPLIER_REFUNDS_DATA_MESSAGE',
        startAddMessage: 'START_ADD_SUPPLIER_REFUNDS_MESSAGE',
      },
      newLabel: 'LBL_NEW_DEBIT_NOTE',
      tooltips: {
        paymentMode: 'supplierRefundPaymentMode',
        paymentCondtion: 'supplierRefundPaymentCondition',
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
        isOutgoingPayment: false,
        isIncomingPayment: true,
        isSupplierInvoice: false,
        isCustomerInvoice: false,
        isDebitNote: true,
        isCreditNote: false,
        isCustomerRelated: false,
        isSupplierRelated: true,
      },
      partner: {
        partnerType: 'SUPPLIERS',
        partnerDomain: 'self.isSupplier=true',
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

export default DebitNotes;
