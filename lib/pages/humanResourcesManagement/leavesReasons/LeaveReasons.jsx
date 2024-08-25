import { Routes, Route, Navigate } from 'react-router-dom';

import LeaveReasonsList from './LeaveReasonsList';
import LeaveReasonsManage from './LeaveReasonsManage';

import { useFeatures } from '../../../hooks/useFeatures';

const LeaveReasons = () => {
  const { canAdd, canEdit, canView, featuresEnum } = useFeatures('HR_MANAGEMENT', 'LEAVES_REASONS');

  return (
    <Routes>
      <Route path="/" element={<LeaveReasonsList />} />
      {canEdit && <Route path={featuresEnum['PUBLIC_HOLIDAYS_PLANNING'].EDIT_ONLY} element={<LeaveReasonsManage enableEdit={true} />} />}
      {canView && <Route path={featuresEnum['PUBLIC_HOLIDAYS_PLANNING'].VIEW_ONLY} element={<LeaveReasonsManage enableEdit={false} />} />}
      {canAdd && <Route path={featuresEnum['PUBLIC_HOLIDAYS_PLANNING'].ADD_ONLY} element={<LeaveReasonsManage addNew />} />}
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default LeaveReasons;
