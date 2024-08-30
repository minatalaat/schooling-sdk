import { useGetUrl } from '../useGetUrl';
import { getFilterString } from '../../utils/helpers';
import { useAxiosFunction } from '../../hooks/useAxios';

export const usePreOrderServices = () => {
  const { api } = useAxiosFunction();
  const { getPreProducts } = useGetUrl();

  const fetchPreOrders = async (filter, successHandler) => {
    const res = await api('GET', getPreProducts() + getFilterString(filter), null, successHandler);
    return { data: res?.data?.returnedObject?.records || [], total: res?.data?.returnedObject?.total_records || 1 };
  };

  const fetchPreOrder = async (id, successHandler) => {
    const res = await api('GET', getPreProducts() + '/' + id, null, successHandler);
    return res?.data?.returnedObject;
  };

  const collectPreorder = async (id, successHandler) => {
    const res = await api('POST', getPreProducts() + '/' + id + '/collect', null, successHandler);
    return res?.data?.returnedObject;
  };

  return { fetchPreOrders, fetchPreOrder, collectPreorder };
};
