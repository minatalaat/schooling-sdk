import { Routes, Route, Navigate } from 'react-router-dom';
import { useMemo } from 'react';

import OrdersManagement from './OrdersTemplate/OrdersManagement';
import OrdersListing from './OrdersTemplate/OrdersListing';

import { useFeatures } from '../../hooks/useFeatures';

import NoSalesOrderImg from '../../assets/images/icons/Sales Order.svg';
import { MODELS } from '../../constants/models';

const SaleOrders = () => {
  const { isFeatureAvailable } = useFeatures();

  const stockMangamentAvaiable = useMemo(() => {
    return isFeatureAvailable({ featureCode: '12' });
  }, []);

  const orderConfig = useMemo(() => {
    return {
      feature: 'SALES',
      subFeature: 'SALESORDER',
      operationTypeSelect: 3,
      stockMangamentAvaiable: stockMangamentAvaiable,
      report: {
        reportType: 0,
        action: 'action-print-sales-order-invoice-report',
      },
      modelsEnumKey: 'SALE_ORDERS',
      noData: {
        img: NoSalesOrderImg,
        noDataMessage: 'NO_SO_DATA_MESSAGE',
        startAddMessage: 'START_ADD_SO_MESSAGE',
      },
      addLabel: 'LBL_ADD_SALE_ORDER',
      deleteSuccessMessage: 'SALE_ORDER_DELETE_MESSAGE',
      lines: {
        key: 'saleOrderLineList',
        model: MODELS.SALE_ORDER_LINE,
        modalName: 'LBL_SO_LINE',
      },
      newLabel: 'LBL_NEW_SALE_ORDER',
      tooltips: {
        paymentMode: 'supplierInvoicePaymentMode',
        paymentCondtion: 'supplierInvoicePaymentCondition',
      },
      alerts: {
        generateSuccess: 'PURCHASE_ORDER_INVOICE_GENERATE_MESSAGE',
        draftSuccess: 'SALE_ORDER_SAVED_AS_DRAFT_MESSAGE',
        validateSuccess: 'SALE_ORDER_CONFIRM_MESSAGE',
      },
      subFeatureChecks: {
        isSO: true,
        isPO: false,
        type: 'so',
      },
      sequenceKey: 'saleOrderSeq',
      partner: {
        partnerType: 'CUSTOMERS',
        partnerDomain: 'self.isCustomer=true',
        infoLabel: 'LBL_CUSTOMER_INFO',
        codeLabel: 'LBL_CUSTOMER_CODE',
        identifier: 'clientPartner',
      },
      stockLocation: {
        modelKey: 'FROM_STOCK_LOCATIONS',
        domain: 'self.company = 1 AND self.typeSelect in (1,2) AND self.usableOnSaleOrder = true',
        dateLabel: 'LBL_ESTIMATED_DELIVERY_DATE',
      },
      invoiceSubFeature: 'CUSTOMERS_INVOICES',
      generateInvoiceActions: {
        generate: 'action-supplychain-sale-order-group-generate-invoice',
        generate1: 'action-supplychain-sale-order-group-generate-invoice[1]',
        invoiceWizard: 'action-group-sale-order-invoicing-wizard-generate',
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

  const { canAdd, canEdit, canView, featuresEnum } = useFeatures(orderConfig.feature, orderConfig.subFeature);

  return (
    <Routes>
      <Route path="/" element={<OrdersListing orderConfig={orderConfig} />} />
      {canEdit && (
        <Route
          path={featuresEnum[orderConfig.subFeature].EDIT_ONLY}
          element={<OrdersManagement enableEdit={true} orderConfig={orderConfig} />}
        />
      )}
      {canView && (
        <Route
          path={featuresEnum[orderConfig.subFeature].VIEW_ONLY}
          element={<OrdersManagement enableEdit={false} orderConfig={orderConfig} />}
        />
      )}
      {canAdd && (
        <Route path={featuresEnum[orderConfig.subFeature].ADD_ONLY} element={<OrdersManagement addNew orderConfig={orderConfig} />} />
      )}
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default SaleOrders;
