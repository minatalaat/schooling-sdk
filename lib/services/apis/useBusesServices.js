import { getBus } from '../getUrl';
import { getFilterString } from '../../utils/helpers';
import { useAxiosFunction } from '../../hooks/useAxios';

export const useBusesServices = () => {
  const { api } = useAxiosFunction();

  const fetchBuses = async (filter, successHandler) => {
    const res = await api('GET', getBus() + getFilterString(filter), null, successHandler);
    return { data: res?.data?.returnedObject?.records || {}, total: res?.data?.returnedObject?.totalRecords };
  };

  const fetchBusStudent = async (filter, id, successHandler) => {
    const res = await api('GET', getBus() + '/' + id + '/students' + getFilterString(filter), null, successHandler);
    return { data: res?.data?.returnedObject?.records || {}, total: res?.data?.returnedObject?.totalRecords };
  };

  const addBusStudent = async (id, body, successHandler) => {
    const res = await api('POST', getBus() + '/' + id + '/students', body, successHandler);
    return res?.data?.returnedObject || {};
  };

  const deleteBusStudent = async (body, successHandler) => {
    const res = await api('DELETE', getBus() + '/students', body, successHandler);
    return { data: res?.data?.returnedObject?.records || {}, total: res?.data?.returnedObject?.totalRecords };
  };

  const fetchBus = async (id, successHandler) => {
    const res = await api('GET', getBus() + '/' + id, null, successHandler);
    return res?.data?.returnedObject || {};
  };

  const deleteBus = async (body, successHandler) => {
    await api('DELETE', getBus(), body, successHandler);
  };

  const addBus = async (body, successHandler) => {
    await api('POST', getBus(), body, successHandler);
  };

  const updateBus = async (id, body, successHandler) => {
    await api('PUT', getBus() + '/' + id, body, successHandler);
  };

  return { fetchBuses, fetchBus, deleteBus, addBus, updateBus, fetchBusStudent, addBusStudent, deleteBusStudent };
};
