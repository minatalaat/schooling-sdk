import { SAAS_ENDPOINTS } from '../constants/rest';
import { getItem } from '../utils/localStorage';

//Accept changed to be * as it causes error with export

export const getHeaders = (url, extraHeaders, company) => {
  const headersDirect = {
    Accept: '*',
    checksum: getItem('checksum'),
  };

  const loginHeadersWSO2 = {
    apikey: import.meta.env.VITE_QAEMA_API_KEY,
  };

  const headersWSO2 = {
    Accept: '*',
    checksum: getItem('checksum'),
    apikey: import.meta.env.VITE_QAEMA_API_KEY,
  };

  const headersSCS = {
    apikey: import.meta.env.VITE_SCS_API_KEY,
  };

  const mode = import.meta.env.VITE_PROVIDER;
  let headers = {};

  if (url && !url.includes('login')) {
    headers = headersDirect;
    if (url?.includes(import.meta.env.VITE_SCS_URL)) headers = headersSCS;
  }

  if (mode === 'wso2' || mode === 'gateway') {
    headers = loginHeadersWSO2;
    if (url && !url.includes('login')) headers = headersWSO2;
  }

  if (url.includes(import.meta.env.VITE_OB_QAEMA_BASE_URL)) {
    headers = {
      ...headers,
      tenantId: company ? company : null,
    };
  }

  if (url.includes('/download')) {
    if (mode === 'wso2' || mode === 'gateway' || mode === 'nonprod') {
      headers = {
        apikey: import.meta.env.VITE_QAEMA_API_KEY,
      };
    } else {
      headers = {};
    }
  }

  if (url.includes(import.meta.env.VITE_SCS_DIRECT_URL)) {
    headers = {
      apikey: import.meta.env.VITE_SCS_DIRECT_API_KEY,
    };

    if (url.includes(SAAS_ENDPOINTS.PRODUCT)) {
      headers = {
        apikey: import.meta.env.VITE_SCS_DIRECT_API_KEY,
        Channel: 'qaema',
      };
    }
  }

  if (url.includes(import.meta.env.VITE_SCS_URL)) {
    headers = {
      apikey: import.meta.env.VITE_SCS_API_KEY,
      // To be returned on qaema/scs
      // Channel: 'qaema',
    };

    if (mode === 'nonprod' || mode === 'wso2' || mode === 'gateway') {
      headers = {
        apikey: import.meta.env.VITE_SCS_API_KEY,
      };
    }
  }

  if (url.includes(import.meta.env.VITE_SCHOOLING_URL)) {
    headers = {
      apikey: import.meta.env.VITE_SCHOOLING_API_KEY,
      checksum: getItem('checksum'),
    };
  }

  if (extraHeaders) headers = { ...headers, ...extraHeaders };

  return headers;
};

export const getTempTokenHeaders = (url, tempToken) => {
  const mode = import.meta.env.VITE_PROVIDER;
  const headersDirect = {
    Accept: '*',
    checksum: tempToken?.checksum || null,
  };
  const headersWSO2 = {
    Accept: '*',
    checksum: tempToken?.checksum || null,
    apikey: import.meta.env.VITE_QAEMA_API_KEY,
  };

  const loginHeadersWSO2 = {
    apikey: import.meta.env.VITE_QAEMA_API_KEY,
  };
  const headersSCS = {
    apikey: import.meta.env.VITE_SCS_API_KEY,
  };
  let headers = {};

  if (url && !url.includes('login')) {
    headers = headersDirect;
    if (url?.includes(import.meta.env.VITE_SCS_URL)) headers = headersSCS;
  }

  if (mode === 'wso2' || mode === 'gateway') {
    headers = loginHeadersWSO2;
    if (url && !url.includes('login')) headers = headersWSO2;
    if (url?.includes(import.meta.env.VITE_SCS_URL)) headers = headersSCS;
  }

  return {
    headers: headers,
  };
};
