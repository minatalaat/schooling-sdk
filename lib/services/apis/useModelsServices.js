import { useGetUrl } from '../useGetUrl';
import { getFilterString } from '../../utils/helpers';
import { useAxiosFunction } from '../../hooks/useAxios';

export const useModelsServices = () => {
  const { api } = useAxiosFunction();
  const { getBusModels } = useGetUrl();

  const fetchModels = async filter => {
    const res = await api('GET', getBusModels() + getFilterString(filter));
    return { data: res?.data?.returnedObject, total: res?.data?.returnedObject?.totalRecords || 1 };
  };

  const fetchModel = async id => {
    const res = await api('GET', getBusModels() + id);
    return res?.data?.returnedObject;
  };

  return { fetchModels, fetchModel };
};
