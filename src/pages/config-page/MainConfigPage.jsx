import { Routes, Route, Navigate } from 'react-router-dom';

import ConfigPage from './ConfigPage';
// import ManageTimeSheetConfig from './TimeSheetConfig/ManageTimeSheetConfig';
import ManageBaseConfig from './BaseConfig/ManageBaseConfig';
import ManageCompanyAccountConfig from './AccountConfig/ManageCompanyAccountConfig';
import ImportConfig from '../../pages/defaultConfigurations/ImportConfigurations'

import { appConfigEnum } from '../../constants/appConfigEnum/appConfigEnum';
import { useFeatures } from '../../hooks/useFeatures';
import ManageCompanyStockConfig from './StockConfig/ManageCompanyStockConfig';

const MainConfigPage = () => {
  const feature = 'APP_CONFIG';
  const subFeature = 'CONFIG';
  const { isFeatureAvailable, canEdit } = useFeatures(feature, subFeature);
  const stockManagmentAvailable = isFeatureAvailable({ featureCode: '12' });
  return (
    <Routes>
      <Route path="/" element={<ConfigPage />} />
      {/* {canEdit && <Route path={appConfigEnum['TIMESHEET'].PATH} element={<ManageTimeSheetConfig addNew={true} />} />} */}
      {canEdit && <Route path={appConfigEnum['BASE'].PATH} element={<ManageBaseConfig addNew={true} />} />}
      {canEdit && <Route path={appConfigEnum['COMPANY_ACCOUNTS_CONFIG'].PATH} element={<ManageCompanyAccountConfig addNew={true} />} />}
      {stockManagmentAvailable && canEdit && (
        <Route path={appConfigEnum['COMPANY_STOCK_CONFIG'].PATH} element={<ManageCompanyStockConfig addNew={true} />} />
      )}
      {canEdit && <Route path={appConfigEnum['IMPORT_DEFAULT_CONFIG'].PATH} element={<ImportConfig addNew={true} />} />}

      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default MainConfigPage;
