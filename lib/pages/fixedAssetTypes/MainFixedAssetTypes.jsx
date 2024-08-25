import { Routes, Route, Navigate } from 'react-router-dom';

import FixedAssetTypes from './FixedAssetTypes';
import ManageFixedAssetTypes from './ManageFixedAssetTypes';

import { useFeatures } from '../../hooks/useFeatures';

const MainFixedAssetTypes = () => {
  const feature = 'FIXED_ASSETS_MANAGEMENT';
  const subFeature = 'FIXED_ASSET_TYPES';

  const { canAdd, canEdit, canView, featuresEnum } = useFeatures(feature, subFeature);

  return (
    <Routes>
      <Route path="/" element={<FixedAssetTypes />} />
      {canEdit && <Route path={featuresEnum[subFeature].EDIT_ONLY} element={<ManageFixedAssetTypes enableEdit={true} />} />}
      {canView && <Route path={featuresEnum[subFeature].VIEW_ONLY} element={<ManageFixedAssetTypes enableEdit={false} />} />}
      {canAdd && <Route path={featuresEnum[subFeature].ADD_ONLY} element={<ManageFixedAssetTypes addNew />} />}
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default MainFixedAssetTypes;
