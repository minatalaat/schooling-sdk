import { Routes, Route, Navigate } from 'react-router-dom';

import SupplierArrivals from './SupplierArrivals';
import ManageSupplierArrivals from './ManageSupplierArrivals';

import { useFeatures } from '../../../hooks/useFeatures';

const MainSupplierArrivals = () => {
  const feature = 'STOCK_MANAGEMENT';
  const subFeature = 'SUPPLIER_ARRIVALS';

  const {  canEdit, canView, featuresEnum } = useFeatures(feature, subFeature);

  return (
    <Routes>
      <Route path="/" element={<SupplierArrivals />} />
      {canEdit && <Route path={featuresEnum[subFeature].EDIT_ONLY} element={<ManageSupplierArrivals enableEdit={true} />} />}
      {canView && <Route path={featuresEnum[subFeature].VIEW_ONLY} element={<ManageSupplierArrivals enableEdit={false} />} />}
      {/* {canAdd && <Route path={featuresEnum[subFeature].ADD_ONLY} element={<ManageSupplierArrivals addNew />} />} */}
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default MainSupplierArrivals;
