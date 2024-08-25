import { Routes, Route, Navigate } from 'react-router-dom';

import FixedAssetCategories from './FixedAssetCategories';
import ManageFixedAssetCategories from './ManageFixedAssetCategories';

import { useFeatures } from '../../hooks/useFeatures';

const MainFixedAssetCategories = () => {
  const feature = 'FIXED_ASSETS_MANAGEMENT';
  const subFeature = 'FIXED_ASSET_CATEGORIES';

  const { canAdd, canEdit, canView, featuresEnum } = useFeatures(feature, subFeature);

  return (
    <Routes>
      <Route path="/" element={<FixedAssetCategories />} />
      {canEdit && <Route path={featuresEnum[subFeature].EDIT_ONLY} element={<ManageFixedAssetCategories enableEdit={true} />} />}
      {canView && <Route path={featuresEnum[subFeature].VIEW_ONLY} element={<ManageFixedAssetCategories enableEdit={false} />} />}
      {canAdd && <Route path={featuresEnum[subFeature].ADD_ONLY} element={<ManageFixedAssetCategories addNew />} />}
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default MainFixedAssetCategories;
