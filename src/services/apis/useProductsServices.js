import { getLoopkups, getProducts } from '../getUrl';
import { getFilterString } from '../../utils/helpers';
import { useAxiosFunction } from '../../hooks/useAxios';

export const useProductsServices = () => {
  const { api } = useAxiosFunction();

  const fetchProducts = async (filter, successHandler) => {
    const res = await api('GET', getProducts() + getFilterString(filter), null, successHandler);
    return { data: res?.data?.returnedObject?.products, total: res?.data?.returnedObject?.total_records };
  };

  const updateProduct = async (id, body, successHandler) => {
    await api('PUT', getProducts() + id, body, successHandler);
  };

  const addProduct = async (body, successHandler) => {
    await api('POST', getProducts(), body, successHandler);
  };

  const fetchProduct = async (id, successHandler) => {
    const res = await api('GET', getProducts() + '/' + id, null, successHandler);
    return res?.data?.returnedObject;
  };

  const deleteProduct = async (id, successHandler) => {
    await api('DELETE', getProducts() + '/' + id, null, successHandler);
  };

  const fetchAvailableCurrencies = async filter => {
    const res = await api('GET', getProducts() + '/products/lookups/currency' + getFilterString(filter));
    return { data: res?.data || [] };
  };

  return { fetchProducts, updateProduct, fetchProduct, addProduct, deleteProduct, fetchAvailableCurrencies };
};
