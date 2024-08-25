import { Routes, Route, Navigate } from 'react-router-dom';

import IncomingPayments from './incomingPayments';
import ViewIncomingPayment from './ViewIncomingPayment';

import { useFeatures } from '../../hooks/useFeatures';

const MainIncomingPayments = () => {
  const feature = 'INVOICES';
  const subFeature = 'INCOMING_PAYMENTS';

  const { canView, featuresEnum } = useFeatures(feature, subFeature);

  return (
    <Routes>
      <Route path="/" element={<IncomingPayments feature={feature} subFeature={subFeature} />} />
      {canView && (
        <Route path={featuresEnum[subFeature].VIEW_ONLY} element={<ViewIncomingPayment feature={feature} subFeature={subFeature} />} />
      )}
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default MainIncomingPayments;
