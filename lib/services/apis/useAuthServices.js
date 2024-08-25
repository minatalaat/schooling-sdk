import { useDispatch } from 'react-redux';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';

import { getPublicTokenUrl } from '../getUrl';
import { getItem, setItem } from '../../utils/localStorage';
import { alertsActions } from '../../store/alerts';

export const useAuthServices = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const authenticated = getItem('checksum');

  const [searchParams, setSearchParams] = useSearchParams();

  const logoutService = async () => {
    window.open(import.meta.env.VITE_QAEMA_APP_DOMAIN, '_blank', 'noopener,noreferrer');
    window.close();
  };

  const checkAutoAuthenticationService = async () => {
    if (authenticated) return null;

    const queryTenantId = searchParams.get('tenantId');
    const queryToken = searchParams.get('token');

    setSearchParams('');

    if (!queryTenantId || !queryToken) return navigate('/login', { replace: true });

    try {
      const res = await axios.get(getPublicTokenUrl(queryToken, queryTenantId), {
        headers: {
          apikey: import.meta.env.VITE_QAEMA_API_KEY,
        },
      });

      const jwt = res?.data?.data?.[0]?.jwt;

      if (!jwt) {
        dispatch(
          alertsActions.initiateAlert({ title: 'Error', message: 'ERROR_FAIL_AUTHOMATIC_LOGIN', dissappearOnLocationChange: false })
        );
        return null;
      }

      setItem('checksum', jwt);
      window.location.reload(true);
      return jwt;
    } catch (err) {
      dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'ERROR_FAIL_AUTHOMATIC_LOGIN', dissappearOnLocationChange: false }));
      return null;
    }
  };

  return { logoutService, checkAutoAuthenticationService };
};
