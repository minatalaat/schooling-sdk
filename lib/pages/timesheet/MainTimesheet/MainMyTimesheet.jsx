import { Routes, Route, Navigate } from 'react-router-dom';

import ManageTimesheet from './ManageTimeSheet';
import Timesheet from './Timesheet';

import { useFeatures } from '../../../hooks/useFeatures';

function MainMyTimesheet() {
  const feature = 'HR_MANAGEMENT';
  const subFeature = 'MY_TIMESHEETS';

  const { canView, canEdit, featuresEnum } = useFeatures(feature, subFeature);

  return (
    <Routes>
      <Route path="/" element={<Timesheet />} />
      {canView && (
        <Route
          path={featuresEnum[subFeature].VIEW_ONLY}
          element={<ManageTimesheet enableEdit={false} feature={feature} subFeature={subFeature} />}
        />
      )}
      {canEdit && (
        <Route
          path={featuresEnum[subFeature].EDIT_ONLY}
          element={<ManageTimesheet enableEdit={true} feature={feature} subFeature={subFeature} />}
        />
      )}
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
}

export default MainMyTimesheet;
