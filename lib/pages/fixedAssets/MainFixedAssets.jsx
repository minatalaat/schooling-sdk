import { Routes, Route, Navigate } from 'react-router-dom';

import FixedAssets from './FixedAssets';
import ManageFixedAssets from './ManageFixedAssets';

import { useFeatures } from '../../hooks/useFeatures';

const MainFixedAssets = () => {
  const feature = 'FIXED_ASSETS_MANAGEMENT';
  const subFeature = 'FIXED_ASSETS';

  const { canAdd, canEdit, canView, featuresEnum } = useFeatures(feature, subFeature);

  return (
    <Routes>
      <Route path="/" element={<FixedAssets />} />
      {canEdit && <Route path={featuresEnum[subFeature].EDIT_ONLY} element={<ManageFixedAssets enableEdit={true} />} />}
      {canView && <Route path={featuresEnum[subFeature].VIEW_ONLY} element={<ManageFixedAssets enableEdit={false} />} />}
      {canAdd && <Route path={featuresEnum[subFeature].ADD_ONLY} element={<ManageFixedAssets addNew />} />}
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default MainFixedAssets;
