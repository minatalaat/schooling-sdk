import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { useAxiosFunction } from '../../hooks/useAxios';
import { getCancelUpdateTierRequestUrl, getCheckQaemaInvoiceUrl, getSupscriptionInfoUrl } from '../getUrl';
import useSubscriptionServices from './useSubscriptionServices';
import { userFeaturesActions } from '../../store/userFeatures';
import { authActions } from '../../store/auth';
import { useAuthServices } from './useAuthServices';

export const useUpgradeServices = () => {
  const { api } = useAxiosFunction();
  const { manageTierService } = useSubscriptionServices();
  const { logoutService } = useAuthServices();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getSupscriptionInfoService = async () => {
    const res = await api('GET', getSupscriptionInfoUrl(), {}, undefined, err => {
      if (+err?.response?.status === 504) {
        navigate('/login?isUpdating=true');
        return null;
      }
    });

    if (res?.data?.status !== 'Ok') return null;
    dispatch(userFeaturesActions.setSubInfo(res?.data?.data?.returnedObj?.[0]));
    return res?.data?.data?.returnedObj?.[0];
  };

  const updateTier = async (updateTierId, updateTierPlanPriceId, customerId, channel) => {
    const res = await manageTierService({
      updateTierId: updateTierId,
      updateTierPlanPriceId: updateTierPlanPriceId,
      customerId: customerId,
      channel,
    });
    return res;
  };

  const checkQaemaInvoicePayment = async () => {
    const res = await api(
      'GET',
      getCheckQaemaInvoiceUrl(),
      {},
      res => res,
      err => {
        if (err?.response?.status === 504) {
          dispatch(authActions.redirectStart({ text: 'UPGRADE_IN_PROGESS' }));
          setTimeout(() => logoutService(), [5000]);
        }
      }
    );
    if (res?.data?.status !== 'Ok') return null;
    return res?.data?.data?.returnedObj?.[0];
  };

  const cancelUpdateTierRequest = async () => {
    const res = await api('GET', getCancelUpdateTierRequestUrl());
    if (res?.data?.code !== 200) return false;
    return true;
  };

  return { getSupscriptionInfoService, updateTier, checkQaemaInvoicePayment, cancelUpdateTierRequest };
};
