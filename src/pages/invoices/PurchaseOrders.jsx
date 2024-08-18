import { Routes, Route, Navigate } from 'react-router-dom';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import OrdersManagement from './OrdersTemplate/OrdersManagement';
import OrdersListing from './OrdersTemplate/OrdersListing';

import { useFeatures } from '../../hooks/useFeatures';

import NoPOImg from '../../assets/images/icons/Purchase Orders.svg';
import { MODELS } from '../../constants/models';

const PurchaseOrders = () => {
  const { t } = useTranslation();
  const { isFeatureAvailable } = useFeatures();
  const stockMangamentAvaiable = useMemo(() => {
    return isFeatureAvailable({ featureCode: '12' });
  }, []);
  const orderConfig = useMemo(() => {
    return {
      feature: 'PURCHASE',
      subFeature: 'PURCHASE_ORDERS',
      operationTypeSelect: 1,
      stockMangamentAvaiable: stockMangamentAvaiable,
      tourSteps: [
        {
          target: `.step-add-purchase-order-1`,
          title: <strong>{t('LBL_ADD_PURCHASE_ORDER_1')}</strong>,
          content: t('LBL_ADD_PURCHASE_ORDER_DESC_1'),
          disableBeacon: true,
        },
        {
          target: `.step-add-purchase-order-2`,
          title: <strong>{t('LBL_ADD_PURCHASE_ORDER_2')}</strong>,
          content: t('LBL_ADD_PURCHASE_ORDER_DESC_2'),
          disableBeacon: true,
        },
        {
          target: `.step-add-customer-invoice-2`,
          title: <strong>{t('LBL_ADD_PURCHASE_ORDER_3')}</strong>,
          content: t('LBL_ADD_PURCHASE_ORDER_DESC_3'),
          disableBeacon: true,
        },
        {
          target: `.step-add-purchase-order-submit`,
          title: <strong>{t('LBL_ADD_PURCHASE_ORDER_4')}</strong>,
          content: t('LBL_ADD_PURCHASE_ORDER_DESC_4'),
          disableBeacon: true,
        },
      ],
      report: {
        reportType: 0,
        action: 'action-print-purchase-order-invoice-report',
      },
      modelsEnumKey: 'PURCHASE_ORDERS',
      noData: {
        img: NoPOImg,
        noDataMessage: 'NO_PO_DATA_MESSAGE',
        startAddMessage: 'START_ADD_PO_MESSAGE',
        stepClass: 'step-add-purchase-order',
      },
      addLabel: 'LBL_ADD_PO',
      deleteSuccessMessage: 'PURCHASE_ORDER_DELETE_MESSAGE',
      lines: {
        key: 'purchaseOrderLineList',
        model: MODELS.PURCHASEORDERLINE,
        modalName: 'LBL_PO_LINE',
      },
      newLabel: 'LBL_NEW_PURCHASE_ORDER',
      alerts: {
        generateSuccess: 'PURCHASE_ORDER_INVOICE_GENERATE_MESSAGE',
        draftSuccess: 'PURCHASE_ORDER_SAVED_AS_DRAFT_MESSAGE',
        validateSuccess: 'PURCHASE_ORDER_VALIDATE_MESSAGE',
      },
      subFeatureChecks: {
        isSO: false,
        isPO: true,
        type: 'po',
      },
      sequenceKey: 'purchaseOrderSeq',
      partner: {
        partnerType: 'SUPPLIERS',
        partnerDomain: 'self.isSupplier=true',
        infoLabel: 'LBL_SUPPLIER_INFO',
        codeLabel: 'LBL_SUPPLIER_CODE',
        identifier: 'supplierPartner',
      },
      stockLocation: {
        modelKey: 'TO_STOCK_LOCATIONS',
        domain: 'self.company = 1 AND self.typeSelect in (1,2) AND self.usableOnPurchaseOrder = true',
        dateLabel: 'LBL_ESTIMATED_DELIVERY_DATE',
      },
      invoiceSubFeature: 'SUPPLIERS_INVOICES',
      generateInvoiceActions: {
        generate: 'save,action-purchase-order-method-generate-control-invoice',
        generate1: 'action-purchase-order-method-generate-control-invoice',
        invoiceWizard: 'action-group-purchase-order-invoicing-wizard-generate, close',
        invoiceWizard1: 'action-group-purchase-order-invoicing-wizard-generate[1], close',
      },
      tourConfig: {
        stepAddClass: 'step-add-purchase-order',
        stepAddSubmit: 'step-add-purchase-order-submit',
        listSteps: [
          {
            target: `.step-add-purchase-order`,
            title: <strong>{t('LBL_ADD_PURCHASE_ORDER')}</strong>,
            content: t('LBL_ADD_PURCHASE_ORDER_DESC'),
            disableBeacon: true,
          },
          {
            target: `.step-dummy`,
            title: <strong>{t('LBL_ADD_CUSTOMER')}</strong>,
            content: t('LBL_ADD_CUSTOMER_DESC'),
            disableBeacon: true,
          },
        ],
        addSteps: [
          {
            target: `.step-add-purchase-order-1`,
            title: <strong>{t('LBL_ADD_PURCHASE_ORDER_1')}</strong>,
            content: t('LBL_ADD_PURCHASE_ORDER_DESC_1'),
            disableBeacon: true,
          },
          {
            target: `.step-add-purchase-order-2`,
            title: <strong>{t('LBL_ADD_PURCHASE_ORDER_2')}</strong>,
            content: t('LBL_ADD_PURCHASE_ORDER_DESC_2'),
            disableBeacon: true,
          },
          {
            target: `.step-add-purchase-order-3`,
            title: <strong>{t('LBL_ADD_PURCHASE_ORDER_3')}</strong>,
            content: t('LBL_ADD_PURCHASE_ORDER_DESC_3'),
            disableBeacon: true,
          },
          {
            target: `.step-add-purchase-order-submit`,
            title: <strong>{t('LBL_ADD_PURCHASE_ORDER_4')}</strong>,
            content: t('LBL_ADD_PURCHASE_ORDER_DESC_4'),
            disableBeacon: true,
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

export default PurchaseOrders;
