import { Routes, Route, Navigate } from 'react-router-dom';

import BankReconciliations from './BankReconciliations';
import EditBankReconciliation from './EditBankReconciliation';
import ViewBankReconciliation from './ViewBankReconciliation';

import { useFeatures } from '../../hooks/useFeatures';

const MainBankReconciliations = () => {
  const feature = 'BANKING';
  const subFeature = 'BANK_RECONCILIATIONS';

  const { canEdit, canView, featuresEnum } = useFeatures(feature, subFeature);

  return (
    <Routes>
      <Route path="/" element={<BankReconciliations feature={feature} subFeature={subFeature} />} />
      {canEdit && (
        <Route path={featuresEnum[subFeature].EDIT_ONLY} element={<EditBankReconciliation feature={feature} subFeature={subFeature} />} />
      )}
      {canView && (
        <Route path={featuresEnum[subFeature].VIEW_ONLY} element={<ViewBankReconciliation feature={feature} subFeature={subFeature} />} />
      )}
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default MainBankReconciliations;
