import { useContext } from 'react';
import { getItem } from '../utils/localStorage';
import SchoolingContext from '../context/SchoolingContext';

//Accept changed to be * as it causes error with export

export const useGetHeaders = () => {
  const { env } = useContext(SchoolingContext);

  let apikey = import.meta.env.VITE_SCHOOLING_API_KEY_PROD;

  if (env === 'uat') apikey = import.meta.env.VITE_SCHOOLING_API_KEY_UAT;

  const getHeaders = (url, extraHeaders) => {
    let headers = {};

    if (url.includes(import.meta.env.VITE_SCHOOLING_URL_PROD) || url.includes(import.meta.env.VITE_SCHOOLING_URL_UAT)) {
      headers = {
        apikey,
        checksum: getItem('checksum'),
      };
    }

    if (extraHeaders) headers = { ...headers, ...extraHeaders };

    return headers;
  };

  return { getHeaders };
};
