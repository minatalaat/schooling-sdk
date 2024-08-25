import { Routes, Route, Navigate } from 'react-router-dom';

import AddAccountLink from './addAccountLink/AddAccountLink';
import ConnectedAccounts from './ConnectedAccounts';
import ConnectedAccountDetails from './ConnectedAccountDetails';

import { useFeatures } from '../../../hooks/useFeatures';

const MainConnectedAccounts = () => {
  const feature = 'BANKING';
  const subFeature = 'BANKING_ACCOUNTS';

  const { featuresEnum } = useFeatures(feature, subFeature);

  return (
    <Routes>
      <Route path="/" element={<ConnectedAccounts />} />,
      <Route path={featuresEnum[subFeature].ADD_ONLY} element={<AddAccountLink />} />
      <Route path={featuresEnum[subFeature].VIEW_ONLY} element={<ConnectedAccountDetails />} />,
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default MainConnectedAccounts;
