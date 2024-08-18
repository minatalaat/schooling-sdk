import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import InActivity from '../components/main/InActivity/InActivity';
import Navigation from '../components/main/Navigation/Navigation';
import AppConfig from '../pages/AppConfig';
import MyProfile from '../pages/MyProfile';
import HelpCenter from '../pages/HelpCenter';
import Landing from '../pages/Landing';
import Transactions from '../pages/Transactions';
import ErrorPage from '../pages/ErrorPage';
import NotFound from '../pages/NotFound';

export default function MainRoutes() {
  const { displayedRoutes } = useSelector(state => state.auth);

  return (
    <>
      <InActivity />
      <Navigation />
      <Routes>
        {displayedRoutes}
        <Route path="/app-config" element={<AppConfig />} />
        <Route path="/my-profile" element={<MyProfile />} />
        <Route path="/help-center" element={<HelpCenter />} />
        <Route path="/home" element={<Landing />} />
        <Route path="/transactions/*" element={<Transactions />} />
        <Route path="/error" element={<ErrorPage />} />
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/change-password" element={<Navigate to="/home" />} />
        <Route path="/login" element={<Navigate to="/home" />} />
        <Route path="/success" element={<Navigate to="/home" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
