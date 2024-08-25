import { Routes, Route, Navigate } from 'react-router-dom';

import ManageWeeklyPlanning from './ManageWeeklyPlanning';
import WeeklyPlanning from './WeeklyPlanning';

import { useFeatures } from '../../../hooks/useFeatures';

const MainWeeklyPlanning = () => {
  const feature = 'HR_MANAGEMENT';
  const subFeature = 'WEEKLY_PLANNING';

  const { canAdd, canEdit, canView, featuresEnum } = useFeatures(feature, subFeature);

  return (
    <Routes>
      <Route path="/" element={<WeeklyPlanning />} />
      {canEdit && <Route path={featuresEnum[subFeature].EDIT_ONLY} element={<ManageWeeklyPlanning enableEdit={true} />} />}
      {canView && <Route path={featuresEnum[subFeature].VIEW_ONLY} element={<ManageWeeklyPlanning enableEdit={false} />} />}
      {canAdd && <Route path={featuresEnum[subFeature].ADD_ONLY} element={<ManageWeeklyPlanning addNew />} />}
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default MainWeeklyPlanning;
