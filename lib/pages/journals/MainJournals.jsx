import { Routes, Route, Navigate } from 'react-router-dom';

import Journals from './journals';
import ManageJournalEntries from './ManageJournalEntries';

import { useFeatures } from '../../hooks/useFeatures';

const MainJournals = () => {
  const feature = 'ACCOUNTING';
  const subFeature = 'JOURNALS';

  const { canAdd, canEdit, canView, featuresEnum } = useFeatures(feature, subFeature);

  return (
    <Routes>
      <Route path="/" element={<Journals feature={feature} subFeature={subFeature} />} />
      {canEdit && (
        <Route
          path={featuresEnum[subFeature].EDIT_ONLY}
          element={<ManageJournalEntries enableEdit feature={feature} subFeature={subFeature} />}
        />
      )}
      {canView && (
        <Route
          path={featuresEnum[subFeature].VIEW_ONLY}
          element={<ManageJournalEntries enableEdit={false} feature={feature} subFeature={subFeature} />}
        />
      )}
      {canAdd && (
        <Route
          path={featuresEnum[subFeature].ADD_ONLY}
          element={<ManageJournalEntries addNew feature={feature} subFeature={subFeature} />}
        />
      )}
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default MainJournals;
