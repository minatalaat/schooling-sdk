import { Navigate, Route, Routes } from 'react-router-dom';

import IntegratedAppsListing from './IntegratedAppsListing';
import ManageIntegrator from './ManageIntegrator';
import IntegrationConfigurations from '../defaultConfigurations/IntegrationConfigurations';

function IntegrationMain() {
  const feature = 'INTEGRATION';

  return (
    <Routes>
      <Route path="/" element={<IntegratedAppsListing feature={feature} />} />
      <Route path="/list" element={<IntegratedAppsListing feature={feature} />} />
      <Route path="/details" element={<ManageIntegrator feature={feature} />} />
      <Route path="/configuration" element={<IntegrationConfigurations feature={feature} />} />
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
}

export default IntegrationMain;
