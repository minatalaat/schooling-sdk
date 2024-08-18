import { Routes, Route, Navigate } from 'react-router-dom';

import PublicHolidaysPlanningList from './PublicHolidaysPlanningList';
import PublicHolidaysPlanningManage from './PublicHolidaysPlanningManage';

import { useFeatures } from '../../../hooks/useFeatures';

const PublicHolidaysPlanning = () => {
  const { canAdd, canEdit, canView, featuresEnum } = useFeatures('HR_MANAGEMENT', 'PUBLIC_HOLIDAYS_PLANNING');

  return (
    <Routes>
      <Route path="/" element={<PublicHolidaysPlanningList />} />
      {canEdit && (
        <Route path={featuresEnum['PUBLIC_HOLIDAYS_PLANNING'].EDIT_ONLY} element={<PublicHolidaysPlanningManage enableEdit={true} />} />
      )}
      {canView && (
        <Route path={featuresEnum['PUBLIC_HOLIDAYS_PLANNING'].VIEW_ONLY} element={<PublicHolidaysPlanningManage enableEdit={false} />} />
      )}
      {canAdd && <Route path={featuresEnum['PUBLIC_HOLIDAYS_PLANNING'].ADD_ONLY} element={<PublicHolidaysPlanningManage addNew />} />}
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default PublicHolidaysPlanning;
