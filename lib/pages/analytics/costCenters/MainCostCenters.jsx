import { Routes, Route, Navigate } from 'react-router-dom';

import CostCenters from './CostCenters';
import EditCostCenter from './EditCostCenter';
import ViewCostCenter from './ViewCostCenter';
import AddCostCenter from './AddCostCenter';

import { useFeatures } from '../../../hooks/useFeatures';

const MainCostCenters = () => {
  const feature = 'ANALYTICS';
  const subFeature = 'COST_CENTERS';

  const { canAdd, canEdit, canView, featuresEnum } = useFeatures(feature, subFeature);

  return (
    <Routes>
      <Route path="/" element={<CostCenters feature={feature} subFeature={subFeature} />} />
      {canEdit && (
        <Route path={featuresEnum[subFeature].EDIT_ONLY} element={<EditCostCenter feature={feature} subFeature={subFeature} />} />
      )}
      {canView && (
        <Route path={featuresEnum[subFeature].VIEW_ONLY} element={<ViewCostCenter feature={feature} subFeature={subFeature} />} />
      )}
      {canAdd && <Route path={featuresEnum[subFeature].ADD_ONLY} element={<AddCostCenter feature={feature} subFeature={subFeature} />} />}
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default MainCostCenters;
