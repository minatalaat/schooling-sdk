import { Routes, Route, Navigate } from 'react-router-dom';

import EmploymentContractTypes from './EmploymentContractTypes';
import ManageEmploymentContractTypes from './ManageEmploymentContractTypes';

import { useFeatures } from '../../../hooks/useFeatures';

const MainEmploymentContractTypes = () => {
  const feature = 'HR_MANAGEMENT';
  const subFeature = 'EMPLOYMENT_CONTRACT_TYPES';

  const { canAdd, canEdit, canView, featuresEnum } = useFeatures(feature, subFeature);

  return (
    <Routes>
      <Route path="/" element={<EmploymentContractTypes />} />
      {canEdit && <Route path={featuresEnum[subFeature].EDIT_ONLY} element={<ManageEmploymentContractTypes enableEdit={true} />} />}
      {canView && <Route path={featuresEnum[subFeature].VIEW_ONLY} element={<ManageEmploymentContractTypes enableEdit={false} />} />}
      {canAdd && <Route path={featuresEnum[subFeature].ADD_ONLY} element={<ManageEmploymentContractTypes addNew />} />}
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default MainEmploymentContractTypes;
