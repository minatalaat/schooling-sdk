import { useNavigate } from 'react-router-dom';

import { getActionUrl, getFetchUrl, getModelUrl, getSearchUrl } from '../getUrl';

import { useAxiosFunction } from '../../hooks/useAxios';

export const useMainAxelorServices = () => {
  const { api } = useAxiosFunction();
  const navigate = useNavigate();

  const searchService = async (model, payload) => {
    const res = await api('POST', getSearchUrl(model), payload);

    if (!res || !res.data || res.data.status !== 0) {
      navigate('/error');
      return null;
    }

    return res.data;
  };

  const fetchService = async (model, id, payload) => {
    const res = await api('POST', getFetchUrl(model, id), payload);

    if (!res || !res.data || res.data.status !== 0 || !res.data.data || !res.data.data[0]) {
      navigate('/error');
      return null;
    }

    return res.data;
  };

  const actionService = async payload => {
    const res = await api('POST', getActionUrl(), payload);
    return res?.data;
  };

  const saveService = async (model, payload) => {
    const res = await api('POST', getModelUrl(model), payload);

    return res?.data;
  };

  return { searchService, fetchService, actionService, saveService };
};
