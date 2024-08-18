import { Routes, Route, Navigate } from 'react-router-dom';

import SupplierReturns from './SupplierReturns';
import ManageSupplierReturns from './ManageSupplierReturns';

import { useFeatures } from '../../../hooks/useFeatures';

const MainSupplierReturns = () => {
  const feature = 'STOCK_MANAGEMENT';
  const subFeature = 'SUPPLIER_RETURNS';

  const { canEdit, canView, featuresEnum } = useFeatures(feature, subFeature);

  return (
    <Routes>
      <Route path="/" element={<SupplierReturns />} />
      {canEdit && <Route path={featuresEnum[subFeature].EDIT_ONLY} element={<ManageSupplierReturns enableEdit={true} />} />}
      {canView && <Route path={featuresEnum[subFeature].VIEW_ONLY} element={<ManageSupplierReturns enableEdit={false} />} />}
      {/* {canAdd && <Route path={featuresEnum[subFeature].ADD_ONLY} element={<ManageSupplierReturns addNew />} />} */}
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default MainSupplierReturns;
