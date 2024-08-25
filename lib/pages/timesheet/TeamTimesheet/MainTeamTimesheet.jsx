import { Routes, Route, Navigate } from 'react-router-dom';

import ManageTimesheet from '../MainTimesheet/ManageTimeSheet';
import TeamTimesheet from './TeamTimesheet';

import { useFeatures } from '../../../hooks/useFeatures';

function MainTeamTimesheet() {
  const feature = 'HR_MANAGEMENT';
  const subFeature = 'TEAM_TIMESHEETS';

  const { featuresEnum } = useFeatures(feature, subFeature);

  return (
    <Routes>
      <Route path="/" element={<TeamTimesheet />} />
      <Route
        path={featuresEnum[subFeature].VIEW_ONLY}
        element={<ManageTimesheet enableEdit={false} feature={feature} subFeature={subFeature} />}
      />
      <Route
        path={featuresEnum[subFeature].EDIT_ONLY}
        element={<ManageTimesheet enableEdit={true} feature={feature} subFeature={subFeature} />}
      />
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
}

export default MainTeamTimesheet;
