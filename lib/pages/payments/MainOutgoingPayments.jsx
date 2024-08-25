import { Routes, Route, Navigate } from 'react-router-dom';

import OutgoingPayments from './outgoingPayments';
import ViewOutgoingPayment from './ViewOutgoingPayment';

import { useFeatures } from '../../hooks/useFeatures';

const MainOutgoingPayments = () => {
  const feature = 'INVOICES';
  const subFeature = 'OUTGOING_PAYMENTS';

  const { canView, featuresEnum } = useFeatures(feature, subFeature);

  return (
    <Routes>
      <Route path="/" element={<OutgoingPayments feature={feature} subFeature={subFeature} />} />
      {canView && (
        <Route path={featuresEnum[subFeature].VIEW_ONLY} element={<ViewOutgoingPayment feature={feature} subFeature={subFeature} />} />
      )}
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default MainOutgoingPayments;
