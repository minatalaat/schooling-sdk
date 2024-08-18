import axios from 'axios';
import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { OB_REST_ENDPOINTS } from '../constants/rest';

export const useAxiosFunctionOB = () => {
  const methods = ['GET', 'PUT', 'POST', 'DELETE', 'PATCH'];
  const OBToken = useSelector(state => state.openBanking.OBToken);

  const apiOB = (method, url, body, onSuccess, onError, contentType) => {
    if (
      (onSuccess === '' || onSuccess === null || onSuccess === undefined || Object.keys(onSuccess).length === 0) &&
      typeof onSuccess !== 'function'
    ) {
      onSuccess = null;
    }

    if (
      (onError === '' || onError === null || onError === undefined || Object.keys(onError).length === 0) &&
      typeof onError !== 'function'
    ) {
      onError = null;
    }

    const defaultOnSuccess = res => {
      if (onSuccess && typeof onSuccess === 'function') return onSuccess(res);
      return res;
    };

    const defaultOnError = error => {
      if (onError && typeof onError === 'function') return onError(error);
      throw error;
    };

    if (!methods.includes(method)) return onError();

    let headers = {
      apiKey: import.meta.env.VITE_WSO2_API_KEY,
    };

    let isGenerateToken = url.includes(OB_REST_ENDPOINTS.OBAUTH);

    if (!isGenerateToken && OBToken) {
      headers['Authorization'] = 'Bearer ' + OBToken;
      headers['x-request-id'] = uuidv4();
    }

    return axios({
      method: method,
      withCredentials: false,
      url: url,
      contentType: contentType ? contentType : 'application/json',
      data: body,
      headers: headers,
    })
      .then(defaultOnSuccess)
      .catch(defaultOnError);
  };

  return { apiOB };
};
