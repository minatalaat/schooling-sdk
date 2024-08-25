import { Routes, Route, Navigate } from 'react-router-dom';
import { useMemo } from 'react';

import PartnersManagement from './PartnersTemplate/PartnersManagement';
import PartnersListing from './PartnersTemplate/PartnersListing';

import { useFeatures } from '../../hooks/useFeatures';

import NoSuppliersImg from '../../assets/images/icons/Suppliers.svg';

const Suppliers = () => {
  const partnerConfig = useMemo(() => {
    return {
      feature: 'PURCHASE',
      subFeature: 'SUPPLIERS',
      modelsEnumKey: 'SUPPLIERS',
      addLabel: 'LBL_ADD_SUPPLIER',
      noData: {
        img: NoSuppliersImg,
        noDataMessage: 'NO_SUPPLIERS_DATA_MESSAGE',
      },
      newLabel: 'LBL_NEW_SUPPLIER',
      messages: {
        deleteSuccessMessage: 'SUPPLIER_DELETE_MESSAGE',
        saveSuccessMessage: 'SUPPLIER_SAVED_MESSAGE',
        deleteErrorMessage: 'LBL_ERROR_DELETING_SUPPLIER',
        saveErrorMessage: 'LBL_ERROR_SAVING_SUPPLIER',
      },
      subFeatureChecks: {
        isCustomer: false,
        isSupplier: true,
      },
      partner: {
        partnerTransactionPath: '/supplier',
        partnerDomain: 'self.isContact = false AND self.isSupplier = true AND self.id != 1',
      },
      labels: {
        partner: 'LBL_SUPPLIER',
        partnerType: 'LBL_SUPPLIER_TYPE',
        partnerInfo: 'LBL_SUPPLIER_INFO',
        partnerAddress: 'LBL_SUPPLIER_ADDRESS',
      },
      modelsEnum: {
        inPaymentModes: 'IN_PAYMENT_MODES_SUPPLIER',
        outPaymentModes: 'OUT_PAYMENT_MODES_SUPPLIER',
      },
      tooltips: {
        inPaymentMode: 'supplierInPaymentMode',
        outPaymentMode: 'supplierOutPaymentMode',
        paymentCondition: 'supplierPaymentCondition',
      },
    };
  }, []);

  const { canAdd, canEdit, canView, featuresEnum } = useFeatures(partnerConfig.feature, partnerConfig.subFeature);

  return (
    <Routes>
      <Route path="/" element={<PartnersListing partnerConfig={partnerConfig} />} />
      {canEdit && (
        <Route
          path={featuresEnum[partnerConfig.subFeature].EDIT_ONLY}
          element={<PartnersManagement enableEdit={true} partnerConfig={partnerConfig} />}
        />
      )}
      {canView && (
        <Route
          path={featuresEnum[partnerConfig.subFeature].VIEW_ONLY}
          element={<PartnersManagement enableEdit={false} partnerConfig={partnerConfig} />}
        />
      )}
      {canAdd && (
        <Route
          path={featuresEnum[partnerConfig.subFeature].ADD_ONLY}
          element={<PartnersManagement addNew partnerConfig={partnerConfig} />}
        />
      )}
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default Suppliers;
