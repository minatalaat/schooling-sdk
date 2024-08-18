import { Routes, Route, Navigate } from 'react-router-dom';

import TransferRequests from './TransferRequests';
import ManageTransferRequests from './ManageTransferRequests';

import { useFeatures } from '../../../hooks/useFeatures';

const MainTransferRequests = () => {
  const feature = 'STOCK_MANAGEMENT';
  const subFeature = 'TRANSFER_REQUESTS';

  const { canAdd, canEdit, canView, featuresEnum } = useFeatures(feature, subFeature);

  return (
    <Routes>
      <Route path="/" element={<TransferRequests />} />
      {canEdit && <Route path={featuresEnum[subFeature].EDIT_ONLY} element={<ManageTransferRequests enableEdit={true} />} />}
      {canView && <Route path={featuresEnum[subFeature].VIEW_ONLY} element={<ManageTransferRequests enableEdit={false} />} />}
      {canAdd && <Route path={featuresEnum[subFeature].ADD_ONLY} element={<ManageTransferRequests addNew />} />}
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default MainTransferRequests;
