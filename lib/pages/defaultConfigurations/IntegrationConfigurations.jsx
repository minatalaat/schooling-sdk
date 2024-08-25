import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import ManageDefaultConfigurations from './DefaultConfigurationsTemplate/ManageDefaultConfigurations';

import { MODELS } from '../../constants/models';

const IntegrationConfigurations = ({ feature }) => {
  let company = useSelector(state => state.userFeatures.companyInfo.company);
  let { state } = useLocation();
  let { integratorCode } = state;

  const integrationConfig = useMemo(() => {
    return {
      feature: feature,
      searchFields: [
        'saleAccount',
        'purchaseAccount',
        'saleCurrency',
        'purchaseCurrency',
        'inPaymentMode',
        'outPaymentMode',
        'saleTax',
        'purchaseTax',
        'paymentCondition',
        'customerAccount',
        'supplierAccount',
        'customerAddress',
        'supplierAddress',
      ],
      fields: {
        saleAccount: true,
        purchaseAccount: true,
        saleTax: true,
        purchaseTax: true,
        saleCurrency: true,
        purchaseCurrency: true,
        customerAccount: true,
        supplierAccount: true,
        customerAddress: true,
        supplierAddress: true,
        inPaymentMode: true,
        outPaymentMode: true,
        paymentCondition: true,
        integratorCode: integratorCode,
      },
      messages: {
        saveSuccessMessage: 'INTEGRATIONS.INTEGRATOR_CONFIG_SAVED_SUCCESSULLY',
        saveErrorMessage: 'INTEGRATIONS.ERROR_SAVING_INTEGRATOR_CONFIG',
      },
      labels: {
        modeText: 'INTEGRATIONS.LBL_INTEGRATOR_CONFIG',
        title: 'INTEGRATIONS.LBL_INTEGRATOR_CONFIG',
      },
      modelName: MODELS.DEFAULT_CONFIG,
      domains: {
        searchDomain: `self.integratorCode = ${integratorCode}`,
        customerAccountDomain: `self.statusSelect = 1 AND self.company = ${company.id} AND self.accountType.technicalTypeSelect ='receivable'`,
        supplierAccountDomain: `self.statusSelect = 1 AND self.company = ${company.id} AND self.accountType.technicalTypeSelect ='payable'`,
      },
    };
  }, []);

  return (
    <Routes>
      {<Route path="/" element={<ManageDefaultConfigurations defaultConfig={integrationConfig} />} />}
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default IntegrationConfigurations;
