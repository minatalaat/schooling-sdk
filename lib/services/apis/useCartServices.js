import { useGetUrl } from '../useGetUrl';
import { useAxiosFunction } from '../../hooks/useAxios';

export const useCartServices = () => {
  const { api } = useAxiosFunction();
  const { getCart, getProducts } = useGetUrl();

  const cartCheckout = async body => {
    const res = await api('POST', getCart() + '/checkout', body);
    return { data: res?.data?.returnedObject, total: res?.data?.returnedObject?.totalRecords || 1 };
  };

  const fetchProduct = async barCode => {
    const res = await api('GET', getProducts() + '/barcode/' + barCode);
    return res?.data?.returnedObject || {};
  };

  return { cartCheckout, fetchProduct };
};
