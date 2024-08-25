import { useNavigate } from 'react-router-dom';

import { getIntegratorAuthorizeURL, getIntegratorStatusURL } from '../../services/getUrl';
import { useAxiosFunction } from '../../hooks/useAxios';
import { INTEGRATOR_CODE } from '../../constants/enums/IntegrationEnum';

export const useIntegrationServices = ({ integrationItem, setActionInProgress, alertHandler }) => {
  const { api } = useAxiosFunction();
  const navigate = useNavigate();

  const navigateToIntegrationAuthorize = async () => {
    setActionInProgress(true);

    const response = await api('GET', getIntegratorAuthorizeURL(integrationItem.authEndpoint.substring(1)));

    if (
      response?.data?.code !== 200 ||
      response?.data?.status !== 'Ok' ||
      !response?.data?.data ||
      !response?.data?.data?.returnedObj ||
      response?.data?.data?.returnedObj?.length <= 0
    ) {
      setActionInProgress(false);
      alertHandler('Error', 'INTEGRATIONS.LBL_ERROR_UNAUTHORIZED');
      return false;
    }

    if (integrationItem.code === INTEGRATOR_CODE.FOODICS) {
      window.open(response?.data?.data?.returnedObj?.[0]?.redirectUrl);
    }

    if (integrationItem.code === INTEGRATOR_CODE.SALLA) {
      window.open(response?.data?.data?.returnedObj?.[0]?.redirectUrl);
    }

    return true;
  };

  const getIntegratorStatus = async () => {
    let status = integrationItem.status;
    setActionInProgress(true);
    const response = await api('GET', getIntegratorStatusURL(integrationItem?.code));
    if (response?.data?.code !== 200 || response?.data?.status !== 'Ok' || !response?.data?.data || !response?.data?.data?.returnedObj)
      return alertHandler('Error', 'INTEGRATIONS.LBL_ERROR_FETCHING_INTEGRATOR_STATUS');
    status = response?.data?.data?.returnedObj?.[0].status;
    return status;
  };

  const navigateToIntegrationDetails = async () => {
    return navigate('/integration/details', { state: { integrationItem } });
  };

  const navigateToIntegrationList = async () => {
    return navigate('/integration/list');
  };

  return {
    navigateToIntegrationAuthorize,
    navigateToIntegrationDetails,
    navigateToIntegrationList,
    getIntegratorStatus,
  };
};
