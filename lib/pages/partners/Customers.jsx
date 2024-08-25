import { Routes, Route, Navigate } from 'react-router-dom';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import PartnersManagement from './PartnersTemplate/PartnersManagement';
import PartnersListing from './PartnersTemplate/PartnersListing';

import { useFeatures } from '../../hooks/useFeatures';

import NoCustomersImg from '../../assets/images/icons/Customers.svg';

const Customers = () => {
  const { t } = useTranslation();
  const partnerConfig = useMemo(() => {
    return {
      feature: 'SALES',
      subFeature: 'CUSTOMERS',
      modelsEnumKey: 'CUSTOMERS',
      addLabel: 'LBL_ADD_CUSTOMER',
      noData: {
        img: NoCustomersImg,
        noDataMessage: 'NO_CUSTOMERS_DATA_MESSAGE',
      },
      newLabel: 'LBL_NEW_CUSTOMER',
      messages: {
        deleteSuccessMessage: 'CUSTOMER_DELETE_MESSAGE',
        saveSuccessMessage: 'CUSTOMER_SAVED_MESSAGE',
        deleteErrorMessage: 'LBL_ERROR_DELETING_CUSTOMER',
        saveErrorMessage: 'LBL_ERROR_SAVING_CUSTOMER',
      },
      subFeatureChecks: {
        isCustomer: true,
        isSupplier: false,
      },
      partner: {
        partnerTransactionPath: '/customer',
        partnerDomain: 'self.isContact = false AND (self.isCustomer = true OR self.isProspect = true) AND self.id != 1',
      },
      labels: {
        partner: 'LBL_CUSTOMER',
        partnerType: 'LBL_CUSTOMER_TYPE',
        partnerInfo: 'LBL_CUSTOMER_INFO',
        partnerAddress: 'LBL_CUSTOMER_ADDRESS',
      },
      modelsEnum: {
        inPaymentModes: 'IN_PAYMENT_MODES_CUSTOMER',
        outPaymentModes: 'OUT_PAYMENT_MODES_CUSTOMER',
      },
      tooltips: {
        inPaymentMode: 'customerInPaymentMode',
        outPaymentMode: 'customerOutPaymentMode',
        paymentCondition: 'customerPaymentCondition',
      },
      tourConfig: {
        stepAddClass: 'step-add-customer',
        stepAddSubmit: 'step-add-customer-submit',
        listSteps: [
          {
            target: `.step-add-customer`,
            title: <strong>{t('LBL_ADD_CUSTOMER')}</strong>,
            content: t('LBL_ADD_CUSTOMER_DESC'),
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
            target: `.step-add-customer-1`,
            title: <strong>{t('LBL_ADD_CUSTOMER_1')}</strong>,
            content: t('LBL_ADD_CUSTOMER_1_DESC'),
            disableBeacon: true,
          },
          {
            target: `.step-add-customer-2`,
            title: <strong>{t('LBL_ADD_CUSTOMER_2')}</strong>,
            content: t('LBL_ADD_CUSTOMER_2_DESC'),
            disableBeacon: true,
          },
          {
            target: `.step-add-customer-3`,
            title: <strong>{t('LBL_ADD_CUSTOMER_3')}</strong>,
            content: t('LBL_ADD_CUSTOMER_3_DESC'),
            disableBeacon: true,
          },

          {
            target: `.step-add-customer-4`,
            title: <strong>{t('LBL_ADD_CUSTOMER_4')}</strong>,
            content: t('LBL_ADD_CUSTOMER_4_DESC'),
            disableBeacon: true,
          },
          {
            target: `.step-add-customer-5`,
            title: <strong>{t('LBL_ADD_CUSTOMER_5')}</strong>,
            content: t('LBL_ADD_CUSTOMER_5_DESC'),
            disableBeacon: true,
          },
          {
            target: `.step-add-customer-6`,
            title: <strong>{t('LBL_ADD_CUSTOMER_6')}</strong>,
            content: t('LBL_ADD_CUSTOMER_6_DESC'),
            disableBeacon: true,
          },
          {
            target: `.step-add-customer-submit`,
            title: <strong>{t('LBL_ADD_CUSTOMER_7')}</strong>,
            content: t('LBL_ADD_CUSTOMER_7_DESC'),
            disableBeacon: true,
          },
        ],
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

export default Customers;
