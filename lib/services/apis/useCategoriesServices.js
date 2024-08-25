import { getCategories } from '../getUrl';
import { getFilterString } from '../../utils/helpers';
import { useAxiosFunction } from '../../hooks/useAxios';

export const useCategoriesServices = () => {
  const { api } = useAxiosFunction();

  const fetchCategories = async (filter, successHandler) => {
    const res = await api('GET', getCategories() + getFilterString(filter), null, successHandler);
    return { data: res?.data?.returnedObject?.records || {}, total: res?.data?.returnedObject?.total_records || 1 };
  };

  const fetchCategory = async (id, successHandler) => {
    const res = await api('GET', getCategories() + '/' + id, null, successHandler);
    return res?.data?.returnedObject || {};
  };

  const deleteCategory = async (body, successHandler) => {
    await api('DELETE', getCategories(), body, successHandler);
  };

  const addCategory = async (body, successHandler) => {
    await api('POST', getCategories(), body, successHandler);
  };

  const updateCategory = async (id, body, successHandler) => {
    await api('PUT', getCategories() + '/' + id, body, successHandler);
  };

  return { fetchCategories, fetchCategory, deleteCategory, addCategory, updateCategory };
};
