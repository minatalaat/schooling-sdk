import { Routes, Route, Navigate } from 'react-router-dom';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import ManageDefaultConfigurations from './DefaultConfigurationsTemplate/ManageDefaultConfigurations';

import { appConfigEnum } from '../../constants/appConfigEnum/appConfigEnum';
import { useFeatures } from '../../hooks/useFeatures';
import { MODELS } from '../../constants/models';

const ImportConfig = () => {
  let company = useSelector(state => state.userFeatures.companyInfo.company);

  const importConfig = useMemo(() => {
    return {
      feature: 'APP_CONFIG',
      subFeature: 'CONFIG',
      path: appConfigEnum['IMPORT_DEFAULT_CONFIG'].PATH,
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
        'integratorCode',
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
        // inPaymentMode: true,
        // outPaymentMode: true,
        // paymentCondition: true,
        integratorCode: 'IMPORT',
      },
      messages: {
        saveSuccessMessage: 'CONFIGURATION.IMPORT_DEFAULT_CONFIG_SAVED_SUCCESSULLY',
        saveErrorMessage: 'CONFIGURATION.ERROR_SAVING_IMPORT_DEFAULT_CONFIG',
      },
      labels: {
        modeText: 'CONFIGURATION.IMPORT_DEFAULT_CONFIG',
        title: 'CONFIGURATION.IMPORT_DEFAULT_CONFIG',
      },
      modelName: MODELS.DEFAULT_CONFIG,
      domains: {
        searchDomain: `self.integratorCode = 'IMPORT'`,
        customerAccountDomain: `self.statusSelect = 1 AND self.company = ${company.id} AND self.accountType.technicalTypeSelect ='receivable'`,
        supplierAccountDomain: `self.statusSelect = 1 AND self.company = ${company.id} AND self.accountType.technicalTypeSelect ='payable'`,
      },
    };
  }, []);

  const { canEdit } = useFeatures(importConfig.feature, importConfig.subFeature);

  return (
    <Routes>
      {canEdit && <Route path="/" element={<ManageDefaultConfigurations defaultConfig={importConfig} addNew={false}/>} />}
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default ImportConfig;
