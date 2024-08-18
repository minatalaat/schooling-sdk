import { Routes, Route, Navigate } from 'react-router-dom';

import EmployeeMasterDataList from './EmployeeMasterDataList';
import EmployeeMasterDataManage from './EmployeeMasterDataManage';

import { useFeatures } from '../../../hooks/useFeatures';

const EmployeeMasterData = () => {
  const { canAdd, canEdit, canView, featuresEnum } = useFeatures('HR_MANAGEMENT', 'EMPLOYEE_MASTER_DATA');

  return (
    <Routes>
      <Route path="/" element={<EmployeeMasterDataList />} />
      {canEdit && <Route path={featuresEnum['EMPLOYEE_MASTER_DATA'].EDIT_ONLY} element={<EmployeeMasterDataManage enableEdit={true} />} />}
      {canView && <Route path={featuresEnum['EMPLOYEE_MASTER_DATA'].VIEW_ONLY} element={<EmployeeMasterDataManage enableEdit={false} />} />}
      {canAdd && <Route path={featuresEnum['EMPLOYEE_MASTER_DATA'].ADD_ONLY} element={<EmployeeMasterDataManage addNew />} />}
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default EmployeeMasterData;
