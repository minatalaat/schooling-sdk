import { Routes, Route, Navigate } from 'react-router-dom';

import BankStatements from './BankStatements';
import AddBankStatement from './AddBankStatement';
import EditBankStatement from './EditBankStatement';
import ViewBankStatement from './ViewBankStatement';

import { useFeatures } from '../../hooks/useFeatures';

const MainBankStatements = () => {
  const feature = 'BANKING';
  const subFeature = 'BANK_STATEMENTS';

  const { canAdd, canEdit, canView, featuresEnum } = useFeatures(feature, subFeature);

  return (
    <Routes>
      <Route path="/" element={<BankStatements feature={feature} subFeature={subFeature} />} />
      {canEdit && (
        <Route path={featuresEnum[subFeature].EDIT_ONLY} element={<EditBankStatement feature={feature} subFeature={subFeature} />} />
      )}
      {canView && (
        <Route path={featuresEnum[subFeature].VIEW_ONLY} element={<ViewBankStatement feature={feature} subFeature={subFeature} />} />
      )}
      {canAdd && (
        <Route path={featuresEnum[subFeature].ADD_ONLY} element={<AddBankStatement feature={feature} subFeature={subFeature} />} />
      )}
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default MainBankStatements;
