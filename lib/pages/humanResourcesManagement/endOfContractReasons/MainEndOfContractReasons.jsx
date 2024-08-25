import { Routes, Route, Navigate } from 'react-router-dom';

import EndOfContractReasons from './EndOfContractReasons';
import ManageEndOfContractReasons from './ManageEndOfContractReasons';

import { useFeatures } from '../../../hooks/useFeatures';

const MainEndOfContractReasons = () => {
  const feature = 'HR_MANAGEMENT';
  const subFeature = 'END_OF_CONTRACT_REASONS';

  const { canAdd, canEdit, canView, featuresEnum } = useFeatures(feature, subFeature);

  return (
    <Routes>
      <Route path="/" element={<EndOfContractReasons />} />
      {canEdit && <Route path={featuresEnum[subFeature].EDIT_ONLY} element={<ManageEndOfContractReasons enableEdit={true} />} />}
      {canView && <Route path={featuresEnum[subFeature].VIEW_ONLY} element={<ManageEndOfContractReasons enableEdit={false} />} />}
      {canAdd && <Route path={featuresEnum[subFeature].ADD_ONLY} element={<ManageEndOfContractReasons addNew />} />}
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default MainEndOfContractReasons;
