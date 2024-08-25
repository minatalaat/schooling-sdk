import { useEffect, useMemo } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useSelector } from 'react-redux';
import i18next from 'i18next';

import ToastAccent from './components/ui/ToastAccent/ToastAccent';
import InitializeApp from './components/main/InitializeApp/InitializeApp';
import ScrollToTop from './components/main/ScrollToTop/ScrollToTop';
import ConfirmationPopup from './components/popups/ConfirmationPopup/ConfirmationPopup';
import UpgradeConfirmationPopup from './components/popups/UpgradeConfirmationPopup';
import AppLoading from './components/Spinner/AppLoading';

import AuthenticationRoutes from './routes/AuthenticationRoutes';
import SubscriptionRoutes from './routes/SubscriptionRoutes';
import FirstLoginRoutes from './routes/FirstLoginRoutes';
import MainRoutes from './routes/MainRoutes';

import { getItem } from './utils/localStorage';
import { changeLanguage } from './i18n/changeLanguage';

function App() {
  const { authLoading, firstLogin, changePassword } = useSelector(state => state.auth);
  const { companyInfo, subInfo } = useSelector(state => state.userFeatures);

  const url = new URL(window.location.href);

  // Check for the token query parameter
  const token = url.searchParams.get('token');

  if (token) {
    // Store the token in localStorage as 'checksum'
    localStorage.setItem('checksum', token);

    // Remove the token query parameter from the URL
    url.searchParams.delete('token');

    // Update the browser's address bar without reloading the page
    window.history.replaceState({}, document.title, url.toString());
  }

  const authenticated = getItem('checksum') || token;
  const notAuthenticatedScreens = !authenticated || (authenticated && !companyInfo);
  const subscriptionScreens = authenticated && companyInfo && firstLogin && !changePassword && subInfo?.status === 'PFP';
  const firstLoginScreens = authenticated && companyInfo && firstLogin && !changePassword && subInfo?.status !== 'PFP';
  const mainScreens = authenticated && companyInfo && !firstLogin && !changePassword;
  const appLoading = authLoading || !i18next.isInitialized;

  const DisplayedRoutes = useMemo(() => {
    if (subscriptionScreens) return <SubscriptionRoutes />;
    if (notAuthenticatedScreens) return <AuthenticationRoutes />;
    if (firstLoginScreens) return <FirstLoginRoutes />;
    if (mainScreens) return <MainRoutes />;
    return <AppLoading />;
  }, [notAuthenticatedScreens, subscriptionScreens, firstLoginScreens, mainScreens]);

  useEffect(() => {
    changeLanguage(getItem('code') || 'ar');
  }, []);

  return (
    <div className="page-wrapper compact-wrapper" id="pageWrapper">
      <div className="page-body-wrapper sidebar-icon">
        <Router>
          <AppLoading />
          <InitializeApp />
          <ScrollToTop />
          <ToastAccent />
          <ConfirmationPopup />
          <UpgradeConfirmationPopup />
          {!appLoading && DisplayedRoutes}
        </Router>
      </div>
    </div>
  );
}

export default App;
