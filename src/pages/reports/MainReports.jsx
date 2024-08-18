import { Routes, Route, Navigate } from 'react-router-dom';

import { featuresEnum } from '../../constants/featuresEnum/featuresEnum';

import ReportsCards from './ReportsCards';
import CustomerAgingReport from './CustomerAgingReport';
import SupplierAgingReport from './SupplierAgingReport';
import CustomerSalesReport from './CustomerSalesReport';
import SupplierPurchaseReport from './SupplierPurchaseReport';
import TransactionsReport from './TransactionsReport';
import AccountTransactionsReport from './AccountTransactionReport';
import VATReport from './VATReport';
import PLReport from './PLReport';
import BalanceSheetReport from './BalanceSheetReport';
import TrailBalanceReport from './TrailBalanceReport';
import ProductSaleReport from './ProductSaleReport';
import ProductPurchaseReport from './ProductPurchaseReport';
import PayableInvoiceReport from './PayableInvoiceReport';
import ReceivableInvoiceReport from './ReceivableInvoiceReport';
import NonReceivedPurchaseOrdersReport from './NonReceiedPurchaseOrdersReport';
import NonReceivedSalesOrdersReport from './NonReceivedSalesOrdersReport';
import GeneralLedgerReport from './GeneralLedgerReport';
import SupplierArrivalReport from './SupplierArrivalReport';
import PendingCustomerDelivery from './PendingCustomerDelivery';
import CostCenterTotalsReport from './CostCenterTotalsReport';
import CostCenterDetailsReport from './CostCenterDetailsReport';
import CostCenterInvoiceDetailsReport from './CostCenterInvoiceDetailsReport';
import InventoryStatusReport from './InventoryStatusReport';
import InventoryCountReport from './InventoryCountReport';
import InventoryTransactionsReport from './InventoryTransactionsReport';
import ProductDetails from './ProductDetails';
// import InventoryDetailsReport from './InventoryDetailsReport';
// import InventoryValuationManualWAGReport from './InventoryValuationManualWAGReport';
// import InventoryValuationFIFOReport from './InventoryValuationFIFOReport';
import { useFeatures } from '../../hooks/useFeatures';

const MainReports = () => {
  const feature = 'REPORTS';
  const { checkPrivilegeBySubFeatureCode } = useFeatures();
  return (
    <Routes>
      <Route path="/" element={<ReportsCards feature={feature} />} />
      {checkPrivilegeBySubFeatureCode('view', featuresEnum['CUSTOMER_AGING_REPORT']?.id) && (
        <Route
          path={featuresEnum['CUSTOMER_AGING_REPORT'].PATH}
          element={<CustomerAgingReport feature={feature} subFeature="CUSTOMER_AGING_REPORT" />}
        />
      )}
      {checkPrivilegeBySubFeatureCode('view', featuresEnum['SUPPLIER_AGING_REPORT']?.id) && (
        <Route
          path={featuresEnum['SUPPLIER_AGING_REPORT'].PATH}
          element={<SupplierAgingReport feature={feature} subFeature="SUPPLIER_AGING_REPORT" />}
        />
      )}
      {checkPrivilegeBySubFeatureCode('view', featuresEnum['CUSTOMER_SALES_REPORT']?.id) && (
        <Route
          path={featuresEnum['CUSTOMER_SALES_REPORT'].PATH}
          element={<CustomerSalesReport feature={feature} subFeature="CUSTOMER_SALES_REPORT" />}
        />
      )}
      {checkPrivilegeBySubFeatureCode('view', featuresEnum['SUPPLIER_PURCHASE_REPORT']?.id) && (
        <Route
          path={featuresEnum['SUPPLIER_PURCHASE_REPORT'].PATH}
          element={<SupplierPurchaseReport feature={feature} subFeature="SUPPLIER_PURCHASE_REPORT" />}
        />
      )}
      {checkPrivilegeBySubFeatureCode('view', featuresEnum['TRANSACTIONS_REPORT']?.id) && (
        <Route
          path={featuresEnum['TRANSACTIONS_REPORT'].PATH}
          element={<TransactionsReport feature={feature} subFeature="TRANSACTIONS_REPORT" />}
        />
      )}
      {checkPrivilegeBySubFeatureCode('view', featuresEnum['ACCOUNT_TRANSACTIONS_REPORT']?.id) && (
        <Route
          path={featuresEnum['ACCOUNT_TRANSACTIONS_REPORT'].PATH}
          element={<AccountTransactionsReport feature={feature} subFeature="ACCOUNT_TRANSACTIONS_REPORT" />}
        />
      )}
      {checkPrivilegeBySubFeatureCode('view', featuresEnum['VAT_REPORT']?.id) && (
        <Route path={featuresEnum['VAT_REPORT'].PATH} element={<VATReport feature={feature} subFeature="VAT_REPORT" />} />
      )}
      {checkPrivilegeBySubFeatureCode('view', featuresEnum['PL_REPORT']?.id) && (
        <Route path={featuresEnum['PL_REPORT'].PATH} element={<PLReport feature={feature} subFeature="PL_REPORT" />} />
      )}
      {checkPrivilegeBySubFeatureCode('view', featuresEnum['BALANCE_SHEET_REPORT']?.id) && (
        <Route
          path={featuresEnum['BALANCE_SHEET_REPORT'].PATH}
          element={<BalanceSheetReport feature={feature} subFeature="BALANCE_SHEET_REPORT" />}
        />
      )}
      {checkPrivilegeBySubFeatureCode('view', featuresEnum['TRAIL_BALANCE_REPORT']?.id) && (
        <Route
          path={featuresEnum['TRAIL_BALANCE_REPORT'].PATH}
          element={<TrailBalanceReport feature={feature} subFeature="TRAIL_BALANCE_REPORT" />}
        />
      )}
      {checkPrivilegeBySubFeatureCode('view', featuresEnum['PRODUCT_SALE_REPORT']?.id) && (
        <Route
          path={featuresEnum['PRODUCT_SALE_REPORT'].PATH}
          element={<ProductSaleReport feature={feature} subFeature="PRODUCT_SALE_REPORT" />}
        />
      )}
      {checkPrivilegeBySubFeatureCode('view', featuresEnum['PRODUCT_PURCHASE_REPORT']?.id) && (
        <Route
          path={featuresEnum['PRODUCT_PURCHASE_REPORT'].PATH}
          element={<ProductPurchaseReport feature={feature} subFeature="PRODUCT_PURCHASE_REPORT" />}
        />
      )}
      {checkPrivilegeBySubFeatureCode('view', featuresEnum['PAYABLE_INVOICE_REPORT']?.id) && (
        <Route
          path={featuresEnum['PAYABLE_INVOICE_REPORT'].PATH}
          element={<PayableInvoiceReport feature={feature} subFeature="PAYABLE_INVOICE_REPORT" />}
        />
      )}
      {checkPrivilegeBySubFeatureCode('view', featuresEnum['RECEIVABLE_INVOICE_REPORT']?.id) && (
        <Route
          path={featuresEnum['RECEIVABLE_INVOICE_REPORT'].PATH}
          element={<ReceivableInvoiceReport feature={feature} subFeature="RECEIVABLE_INVOICE_REPORT" />}
        />
      )}
      {checkPrivilegeBySubFeatureCode('view', featuresEnum['NONRECEIVED_PURCHASEORDERS_REPORT']?.id) && (
        <Route
          path={featuresEnum['NONRECEIVED_PURCHASEORDERS_REPORT'].PATH}
          element={<NonReceivedPurchaseOrdersReport feature={feature} subFeature="NONRECEIVED_PURCHASEORDERS_REPORT" />}
        />
      )}
      {checkPrivilegeBySubFeatureCode('view', featuresEnum['NONRECEIVED_SALEORDERS_REPORT']?.id) && (
        <Route
          path={featuresEnum['NONRECEIVED_SALEORDERS_REPORT'].PATH}
          element={<NonReceivedSalesOrdersReport feature={feature} subFeature="NONRECEIVED_SALEORDERS_REPORT" />}
        />
      )}
      {checkPrivilegeBySubFeatureCode('view', featuresEnum['GENERAL_LEDGER']?.id) && (
        <Route path={featuresEnum['GENERAL_LEDGER'].PATH} element={<GeneralLedgerReport feature={feature} subFeature="GENERAL_LEDGER" />} />
      )}
      {checkPrivilegeBySubFeatureCode('view', featuresEnum['SUPPLIER_ARRIVAL_REPORT']?.id) && (
        <Route
          path={featuresEnum['SUPPLIER_ARRIVAL_REPORT'].PATH}
          element={<SupplierArrivalReport feature={feature} subFeature="SUPPLIER_ARRIVAL_REPORT" />}
        />
      )}
      {checkPrivilegeBySubFeatureCode('view', featuresEnum['PENDING_CUSTOMER_DELIVERY_REPORT']?.id) && (
        <Route
          path={featuresEnum['PENDING_CUSTOMER_DELIVERY_REPORT'].PATH}
          element={<PendingCustomerDelivery feature={feature} subFeature="PENDING_CUSTOMER_DELIVERY_REPORT" />}
        />
      )}
      {checkPrivilegeBySubFeatureCode('view', featuresEnum['COST_CENTER_DETAILS_REPORT']?.id) && (
        <Route
          path={featuresEnum['COST_CENTER_DETAILS_REPORT'].PATH}
          element={<CostCenterDetailsReport feature={feature} subFeature="COST_CENTER_DETAILS_REPORT" />}
        />
      )}
      {checkPrivilegeBySubFeatureCode('view', featuresEnum['COST_CENTER_TOTALS_REPORT']?.id) && (
        <Route
          path={featuresEnum['COST_CENTER_TOTALS_REPORT'].PATH}
          element={<CostCenterTotalsReport feature={feature} subFeature="COST_CENTER_TOTALS_REPORT" />}
        />
      )}
      {checkPrivilegeBySubFeatureCode('view', featuresEnum['COST_CENTERS_INVOICE_DETAILS_REPORT']?.id) && (
        <Route
          path={featuresEnum['COST_CENTERS_INVOICE_DETAILS_REPORT'].PATH}
          element={<CostCenterInvoiceDetailsReport feature={feature} subFeature="COST_CENTERS_INVOICE_DETAILS_REPORT" />}
        />
      )}
      {checkPrivilegeBySubFeatureCode('view', featuresEnum['INVENTORY_TRANSACTIONS_REPORT']?.id) && (
        <Route
          path={featuresEnum['INVENTORY_TRANSACTIONS_REPORT'].PATH}
          element={<InventoryTransactionsReport feature={feature} subFeature="INVENTORY_TRANSACTIONS_REPORT" />}
        />
      )}
      ,
      {/* {checkPrivilegeBySubFeatureCode('view', featuresEnum['INVENTORY_VALUATION_MANUAL_WAV_REPORT']?.id) && (
        <Route
          path={featuresEnum['INVENTORY_VALUATION_MANUAL_WAV_REPORT'].PATH}
          element={<InventoryValuationManualWAGReport feature={feature} subFeature="INVENTORY_VALUATION_MANUAL_WAV_REPORT" />}
        />
      )}
      ,
      {checkPrivilegeBySubFeatureCode('view', featuresEnum['INVENTORY_VALUATION_FIFO_REPORT']?.id) && (
        <Route
          path={featuresEnum['INVENTORY_VALUATION_FIFO_REPORT'].PATH}
          element={<InventoryValuationFIFOReport feature={feature} subFeature="INVENTORY_VALUATION_FIFO_REPORT" />}
        />
      )} */}
      ,
      {checkPrivilegeBySubFeatureCode('view', featuresEnum['INVENTORY_STATUS_REPORT']?.id) && (
        <Route
          path={featuresEnum['INVENTORY_STATUS_REPORT'].PATH}
          element={<InventoryStatusReport feature={feature} subFeature="INVENTORY_STATUS_REPORT" />}
        />
      )}
      {checkPrivilegeBySubFeatureCode('view', featuresEnum['INVENTORY_COUNT_REPORT']?.id) && (
        <Route
          path={featuresEnum['INVENTORY_COUNT_REPORT'].PATH}
          element={<InventoryCountReport feature={feature} subFeature="INVENTORY_COUNT_REPORT" />}
        />
      )}
      {checkPrivilegeBySubFeatureCode('view', featuresEnum['INVENTORY_TRANSACTIONS_REPORT']?.id) && (
        <Route
          path={featuresEnum['INVENTORY_TRANSACTIONS_REPORT'].PATH}
          element={<InventoryTransactionsReport feature={feature} subFeature="INVENTORY_TRANSACTIONS_REPORT" />}
        />
      )}
      {/* {checkPrivilegeBySubFeatureCode('view', featuresEnum['INVENTORY_VALUATION_REPORT']?.id) && (
        <Route
          path={featuresEnum['INVENTORY_VALUATION_REPORT'].PATH}
          element={<InventoryDetailsReport feature={feature} subFeature="INVENTORY_VALUATION_REPORT" />}
        />
      )} */}
      {checkPrivilegeBySubFeatureCode('view', featuresEnum['PRDOUCT_DETAILS']?.id) && (
        <Route path={featuresEnum['PRDOUCT_DETAILS'].PATH} element={<ProductDetails feature={feature} subFeature="PRDOUCT_DETAILS" />} />
      )}
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default MainReports;
