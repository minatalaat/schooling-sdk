import { Routes, Route, Navigate } from 'react-router-dom';

import Navigation from '../components/main/Navigation/Navigation';
import ErrorPage from '../pages/ErrorPage';
import SubscriptionInvoices from '../pages/SubscriptionInvoices/SubscriptionInvoices';
import InActivity from '../components/main/InActivity/InActivity';

import { featuresEnum } from '../constants/featuresEnum/featuresEnum';

export default function SubscriptionRoutes() {
  return (
    <>
      <Navigation />
      <InActivity />
      <Routes>
        <Route path="/error" element={<ErrorPage />} />
        <Route path={featuresEnum['SUBSCRIPTIONS'].PATH + '/*'} element={<SubscriptionInvoices />} />
        <Route path="*" element={<Navigate to={featuresEnum['SUBSCRIPTIONS'].PATH} />} />
      </Routes>
    </>
  );
}
