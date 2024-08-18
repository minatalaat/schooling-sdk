import { Routes, Route, Navigate } from 'react-router-dom';

import ManageTimesheet from '../MainTimesheet/ManageTimeSheet';
import TimesheetToValidate from './TimesheetToValidate';

import { useFeatures } from '../../../hooks/useFeatures';

function MainTimesheetToValidate() {
  const feature = 'HR_MANAGEMENT';
  const subFeature = 'TIMESHEET_TO_VALIDATE';

  const { featuresEnum } = useFeatures(feature, subFeature);

  return (
    <Routes>
      <Route path="/" element={<TimesheetToValidate />} />
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

export default MainTimesheetToValidate;
