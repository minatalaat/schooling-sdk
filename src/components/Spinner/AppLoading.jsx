import { useSelector } from 'react-redux';
import i18next from 'i18next';

import RedirectingScreen from './RedirectingScreen';
import Spinner from './Spinner';

export default function AppLoading() {
  const searchParams = new URLSearchParams(window.location.search);

  const { authLoading, redirect } = useSelector(state => state.auth);

  const queryTenantId = searchParams.get('tenantId');
  const queryToken = searchParams.get('token');

  if (!i18next.isInitialized) return <Spinner />;

  if (redirect?.isRedirect || (queryTenantId && queryToken)) return <RedirectingScreen />;

  if (authLoading) return <Spinner />;

  return null;
}
