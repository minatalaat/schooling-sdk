import { Routes, Route, Navigate } from 'react-router-dom';

import CustomerReturns from './CustomerReturns';
import ManageCustomerReturns from './ManageCustomerReturns';

import { useFeatures } from '../../../hooks/useFeatures';

const MainCustomerReturns = () => {
  const feature = 'STOCK_MANAGEMENT';
  const subFeature = 'CUSTOMER_RETURNS';

  const {  canEdit, canView, featuresEnum } = useFeatures(feature, subFeature);

  return (
    <Routes>
      <Route path="/" element={<CustomerReturns />} />
      {canEdit && <Route path={featuresEnum[subFeature].EDIT_ONLY} element={<ManageCustomerReturns enableEdit={true} />} />}
      {canView && <Route path={featuresEnum[subFeature].VIEW_ONLY} element={<ManageCustomerReturns enableEdit={false} />} />}
      {/* {canAdd && <Route path={featuresEnum[subFeature].ADD_ONLY} element={<ManageCustomerReturns addNew />} />} */}
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default MainCustomerReturns;
