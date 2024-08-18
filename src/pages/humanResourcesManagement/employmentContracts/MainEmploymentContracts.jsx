import { Routes, Route, Navigate } from 'react-router-dom';

import EmploymentContracts from './EmploymentContracts';
import ManageEmploymentContracts from './ManageEmploymentContracts';

import { useFeatures } from '../../../hooks/useFeatures';

const MainEmploymentContracts = () => {
  const feature = 'HR_MANAGEMENT';
  const subFeature = 'EMPLOYMENT_CONTRACTS';

  const { canAdd, canEdit, canView, featuresEnum } = useFeatures(feature, subFeature);

  return (
    <Routes>
      <Route path="/" element={<EmploymentContracts />} />
      {canEdit && <Route path={featuresEnum[subFeature].EDIT_ONLY} element={<ManageEmploymentContracts enableEdit={true} />} />}
      {canView && <Route path={featuresEnum[subFeature].VIEW_ONLY} element={<ManageEmploymentContracts enableEdit={false} />} />}
      {canAdd && <Route path={featuresEnum[subFeature].ADD_ONLY} element={<ManageEmploymentContracts addNew />} />}
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default MainEmploymentContracts;
