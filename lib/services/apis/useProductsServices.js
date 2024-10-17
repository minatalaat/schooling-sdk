import { useGetUrl } from '../useGetUrl';
import { getFilterString } from '../../utils/helpers';
import { useAxiosFunction } from '../../hooks/useAxios';

export const useProductsServices = () => {
  const { api } = useAxiosFunction();
  const { getProducts } = useGetUrl();

  const fetchProducts = async (filter, successHandler) => {
    const res = await api('GET', getProducts() + getFilterString(filter), null, successHandler);
    return { data: res?.data?.returnedObject?.products, total: res?.data?.returnedObject?.total_records };
  };

  const updateProduct = async (id, body, successHandler,errorHandler) => {
    await api('POST', getProducts() + id + '/update', body, successHandler,errorHandler);
  };

  const addProduct = async (body, successHandler, errorHandler) => {
    await api('POST', getProducts(), body, successHandler,errorHandler);
  };

  const fetchProduct = async (id, successHandler) => {
    const res = await api('GET', getProducts() + '/' + id, null, successHandler);
    return res?.data?.returnedObject;
  };

  const deleteProduct = async (id, successHandler) => {
    await api('POST', getProducts() + '/' + id + '/delete', null, successHandler);
  };

  const fetchAvailableCurrencies = async filter => {
    const res = await api('GET', getProducts() + '/products/lookups/currency' + getFilterString(filter));
    return { data: res?.data || [] };
  };

  return { fetchProducts, updateProduct, fetchProduct, addProduct, deleteProduct, fetchAvailableCurrencies };
};
