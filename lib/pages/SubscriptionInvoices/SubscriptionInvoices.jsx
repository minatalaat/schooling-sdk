import { Routes, Route, Navigate } from 'react-router-dom';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import ListSubscriptionInvoices from './ListSubscriptionInvoices';
import ManageSubscriptionInvoice from './ManageSubscriptionInvoice';
import SubscriptionManage from './SubscriptionManage';

import { featuresEnum } from '../../constants/featuresEnum/featuresEnum';
import { useAuthServices } from '../../services/apis/useAuthServices';
import { authActions } from '../../store/auth';

export default function SubscriptionInvoices() {
  const dispatch = useDispatch();

  const { payOnly } = useSelector(state => state.auth);
  const { logoutService } = useAuthServices();

  const mainConfig = useMemo(() => {
    return {
      feature: 'SETTINGS',
      subFeature: 'SUBSCRIPTIONS',
      redirectAfterPaymentHandler: message => {
        dispatch(authActions.redirectStart({ text: message ?? 'PAYMENT_SUCCEESS_REDIRECT' }));
        setTimeout(() => logoutService(), [5000]);
      },
    };
  }, []);

  return (
    <Routes>
      <Route path="/" element={<ListSubscriptionInvoices mainConfig={mainConfig} />} />
      <Route path={featuresEnum['SUBSCRIPTIONS'].VIEW_ONLY} element={<ManageSubscriptionInvoice mainConfig={mainConfig} />} />
      {!payOnly && <Route path={featuresEnum['SUBSCRIPTIONS'].EDIT_ONLY} element={<SubscriptionManage mainConfig={mainConfig} />} />}
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
}
