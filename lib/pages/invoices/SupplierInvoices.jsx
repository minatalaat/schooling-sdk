// import { Routes, Route, Navigate } from 'react-router-dom';
// import { useMemo } from 'react';

// import InvoicesManagement from './InvoicesTemplate/InvoicesManagement';
// import InvoicesListing from './InvoicesTemplate/InvoicesListing';

// import { useFeatures } from '../../hooks/useFeatures';
// // import { useCheckFeatureServices } from '../../services/apis/useCheckFeatureServices';

// const SupplierInvoices = () => {
//   const { isStockManagementAvailable } = useCheckFeatureServices();
//   const invoiceConfig = useMemo(() => {
//     return {
//       feature: 'INVOICES',
//       subFeature: 'SUPPLIERS_INVOICES',
//       operationTypeSelect: 1,
//       stockMangamentAvaiable: isStockManagementAvailable,
//       report: {
//         reportType: 1,
//         action: 'action-print-purchase-order-invoice-report',
//       },
//       translationKey: "SUPPLIER_INVOICES",
//       modelsEnumKey: 'SUPPLIER_INVOICES',
//       addLabel: 'SUPPLIER_INVOICES.CREATE',
//       deleteSuccessMessage: 'INVOICE_DELETE_MESSAGE',
//       noData: {
//         noDataMessage: 'NO_SUPPLIER_INVOICES_DATA_MESSAGE',
//         startAddMessage: 'START_ADD_SUPPLIER_INVOICES_MESSAGE',
//       },
//       newLabel: 'SUPPLIER_INVOICES.NEW',
//       tooltips: {
//         paymentMode: 'supplierInvoicePaymentMode',
//         paymentCondtion: 'supplierInvoicePaymentCondition',
//       },
//       onePostAction: true,
//       alerts: {
//         draftSuccess: 'INVOICE_SAVED_AS_DRAFT_MESSAGE',
//         ventilateSuccess: 'INVOICE_VENTAILATION_MESSAGE',
//         validateSuccess: 'INVOICE_VALIDATED_MESSAGE',
//       },
//       subFeatureChecks: {
//         isInvoice: true,
//         isNote: false,
//         isOutgoingPayment: true,
//         isIncomingPayment: false,
//         isSupplierInvoice: true,
//         isCustomerInvoice: false,
//         isDebitNote: false,
//         isCreditNote: false,
//         isCustomerRelated: false,
//         isSupplierRelated: true,
//       },
//       refundSubFeature: 'SUPPLIERS_REFUNDS',
//       partner: {
//         partnerType: 'SUPPLIERS',
//         partnerDomain: 'self.isSupplier=true',
//       },
//       labels: {
//         partnerDetails: 'INVOICES.SUPPLIER_DETAILS',
//         productDetails: 'LBL_SUPPLIER_INVOICE_DETAILS',
//       },
//     };
//   }, []);

//   const { canAdd, canEdit, canView, featuresEnum } = useFeatures(invoiceConfig.feature, invoiceConfig.subFeature);

//   return (
//     <Routes>
//       <Route path="/" element={<InvoicesListing invoiceConfig={invoiceConfig} />} />
//       {canEdit && (
//         <Route
//           path={featuresEnum[invoiceConfig.subFeature].EDIT_ONLY}
//           element={<InvoicesManagement enableEdit={true} invoiceConfig={invoiceConfig} />}
//         />
//       )}
//       {canView && (
//         <Route
//           path={featuresEnum[invoiceConfig.subFeature].VIEW_ONLY}
//           element={<InvoicesManagement enableEdit={false} invoiceConfig={invoiceConfig} />}
//         />
//       )}
//       {canAdd && (
//         <Route
//           path={featuresEnum[invoiceConfig.subFeature].ADD_ONLY}
//           element={<InvoicesManagement addNew invoiceConfig={invoiceConfig} />}
//         />
//       )}
//       <Route path="*" element={<Navigate replace to="/dashboard" />} />
//     </Routes>
//   );
// };

// export default SupplierInvoices;
