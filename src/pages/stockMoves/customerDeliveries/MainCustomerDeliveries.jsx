import { Routes, Route, Navigate } from 'react-router-dom';

import CustomerDeliveries from './CustomerDeliveries';
import ManageCustomerDeliveries from './ManageCustomerDeliveries';

import { useFeatures } from '../../../hooks/useFeatures';

const MainCustomerDeliveries = () => {
  const feature = 'STOCK_MANAGEMENT';
  const subFeature = 'CUSTOMER_DELIVERIES';

  const { canEdit, canView, featuresEnum } = useFeatures(feature, subFeature);

  return (
    <Routes>
      <Route path="/" element={<CustomerDeliveries />} />
      {canEdit && <Route path={featuresEnum[subFeature].EDIT_ONLY} element={<ManageCustomerDeliveries enableEdit={true} />} />}
      {canView && <Route path={featuresEnum[subFeature].VIEW_ONLY} element={<ManageCustomerDeliveries enableEdit={false} />} />}
      {/* {canAdd && <Route path={featuresEnum[subFeature].ADD_ONLY} element={<ManageCustomerDeliveries addNew />} />} */}
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default MainCustomerDeliveries;
