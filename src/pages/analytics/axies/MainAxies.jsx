import { Routes, Route, Navigate } from 'react-router-dom';

import Axies from './Axies';
import EditAxis from './EditAxis';
import ViewAxis from './ViewAxis';
import AddAxis from './AddAxis';

import { useFeatures } from '../../../hooks/useFeatures';

const MainAxies = () => {
  const feature = 'ANALYTICS';
  const subFeature = 'DIMENSIONS';

  const { canAdd, canEdit, canView, featuresEnum } = useFeatures(feature, subFeature);

  return (
    <Routes>
      <Route path="/" element={<Axies feature={feature} subFeature={subFeature} />} />
      {canEdit && <Route path={featuresEnum[subFeature].EDIT_ONLY} element={<EditAxis feature={feature} subFeature={subFeature} />} />}
      {canView && <Route path={featuresEnum[subFeature].VIEW_ONLY} element={<ViewAxis feature={feature} subFeature={subFeature} />} />}
      {canAdd && <Route path={featuresEnum[subFeature].ADD_ONLY} element={<AddAxis feature={feature} subFeature={subFeature} />} />}
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default MainAxies;
