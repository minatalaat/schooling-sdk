import { Routes, Route, Navigate } from 'react-router-dom';

import { useFeatures } from '../../hooks/useFeatures';
import ProductActivity from './ProductActivity';
import ManageProductActivity from './ManageProductActivity';

const MainProductActivity = () => {
  const feature = 'HR_MANAGEMENT';
  const subFeature = 'PRODUCT_ACTIVITY';

  const { canAdd, canEdit, canView, featuresEnum } = useFeatures(feature, subFeature);

  return (
    <Routes>
      <Route path="/" element={<ProductActivity />} />
      {canEdit && <Route path={featuresEnum[subFeature].EDIT_ONLY} element={<ManageProductActivity enableEdit={true} />} />}
      {canView && <Route path={featuresEnum[subFeature].VIEW_ONLY} element={<ManageProductActivity enableEdit={false} />} />}
      {canAdd && <Route path={featuresEnum[subFeature].ADD_ONLY} element={<ManageProductActivity addNew />} />}
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default MainProductActivity;
