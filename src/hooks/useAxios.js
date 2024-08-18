import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { getModelUrl } from '../services/getUrl';
import { MODELS } from '../constants/models';
import { getHeaders } from '../services/getHeaders';
import { useAuthServices } from '../services/apis/useAuthServices';
import { getItem } from '../utils/localStorage';
import { alertsActions } from '../store/alerts';
// import { encryptServiceData } from '../utils/security';

export const useAxiosFunction = () => {
  const navigate = useNavigate();
  const { logoutService } = useAuthServices();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const methods = ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'];

  const tenantId = useSelector(state => state.userFeatures.companyInfo?.companyInfoProvision?.tenantId);

  const navigateToError = errorCode => {
    // navigate('/error', { state: { status: errorCode } });
    dispatch(alertsActions.initiateAlert({ title: 'Error', message: errorCode, dissappearOnLocationChange: false }));
  };

  const encryptPayloadHandler = async (body, contentType) => {
    // Encryption is also decrypted temperoraily till the server is ready to decrypt the payload from its end.
    // Commented lines will be used when server is ready

    if (!body || !(Object.keys(body)?.length > 0)) return { payload: body, modifiedContentType: contentType };

    // const encryptPayload = encryptServiceData(body, publicKey);
    let decryptedPayload = null;

    // if (import.meta.env.VITE_PROVIDER !== 'wso2') {
    // const decrptionResponse = await axios
    //   .post(getDecryptUrl(), encryptPayload, {
    //     headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    //   })
    //   .then(res => res)
    //   .catch(err => err);
    // if (!(decrptionResponse?.data?.code === '0') && Object.keys(decrptionResponse?.data?.returnedObject || {}).length > 0)
    //   decryptedPayload = JSON.parse(decrptionResponse.data.returnedObject);
    // }

    // const payload = import.meta.env.VITE_PROVIDER === 'wso2' ? encryptPayload : decryptedPayload;
    // const modifiedContentType =
    //   import.meta.env.VITE_PROVIDER === 'wso2' ? 'application/x-www-form-urlencoded' : contentType || 'application/json';

    const payload = decryptedPayload || body;
    const modifiedContentType = contentType || 'application/json';

    return { payload, modifiedContentType };
  };

  const api = async (method, url, body, onSuccess, onError, contentType, customHeaders = null) => {
    if (
      (onSuccess === '' || onSuccess === null || onSuccess === undefined || Object.keys(onSuccess).length === 0) &&
      typeof onSuccess !== 'function'
    ) {
      onSuccess = null;
    }

    const defaultOnSuccess = res => {
      setIsLoading(false);
      if (!onSuccess || typeof onSuccess !== 'function') return res;
      onSuccess(res);
      return res;
    };

    const defaultOnError = error => {
      setIsLoading(false);

      if (error && error.response) {
        if (error.response.status === 401) {
          logoutService();
        } else if (error.response.status === 500) {
          navigateToError(error?.response?.data?.description);
        } else {
          navigateToError();
        }
      } else {
        navigateToError();
      }
    };

    if (
      (onError === '' || onError === null || onError === undefined || Object.keys(onError).length === 0) &&
      typeof onError !== 'function' &&
      !url.includes('login')
    )
      onError = defaultOnError;

    if (!methods.includes(method)) return onError();

    const { payload, modifiedContentType } = await encryptPayloadHandler(body, contentType);
    return axios({
      method: method,
      withCredentials: false,
      url: url,
      contentType: modifiedContentType,
      data: payload,
      headers: getHeaders(url, customHeaders, tenantId),
    })
      .then(defaultOnSuccess)
      .catch(error => {
        onError(error);
      });
  };

  const uploadDocument = async (url, file, onSuccess = res => res, onError) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('field', undefined);
    formData.append(
      'request',
      `{"data":{"fileName":"${file.name}","fileType":"${file.type}","fileSize":${file.size},"$upload":{"file":{}}}}`
    );
    const { payload, modifiedContentType } = await encryptPayloadHandler(formData, 'multipart/form-data');

    return axios
      .post(url, payload, {
        headers: getHeaders(url, null, tenantId),
        'Content-Type': modifiedContentType,
      })
      .then(onSuccess)
      .catch(onError);
  };

  const downloadDocument = (parentId, imageId, tableModel, onSuccess, onError) => {
    const imageUrl =
      getModelUrl(MODELS.METAFILE) + `/${imageId}/content/download?parentId=${parentId}&parentModel=${tableModel}&tenantId=${tenantId}`;

    return fetch(imageUrl, {
      method: 'GET',
      headers: getHeaders(imageUrl, null, tenantId),
    })
      .then(data => {
        if (data) {
          return data.blob();
        } else {
          onError();
        }
      })
      .then(data => {
        if (data) {
          if (onSuccess) onSuccess(data);
          return data;
        } else {
          onError();
        }
      })
      .catch(onError);
  };

  const downloadDocumentWithFileId = async (imageId, onSuccess, onError) => {
    const imageUrl = getModelUrl(MODELS.METAFILE) + `/${imageId}/content/download?tenantId=${tenantId}`;

    return fetch(imageUrl, {
      method: 'GET',
      headers: getHeaders(imageUrl, null, tenantId),
    })
      .then(data => {
        if (data?.ok) {
          return data.blob();
        } else {
          return onError();
        }
      })
      .then(data => {
        if (data) {
          if (onSuccess) onSuccess(data);
          return data;
        } else {
          return onError();
        }
      })
      .catch(() => onError());
  };

  const downloadFile = async (url, fileName, onSuccess = () => {}, onError) => {
    return axios({
      url: `${url}&tenantId=${tenantId}`,
      method: 'GET',
      responseType: 'blob',
      headers: getHeaders(url, null, tenantId),
    })
      .then(response => {
        const href = window.URL.createObjectURL(response.data);

        const anchorElement = document.createElement('a');

        anchorElement.href = href;
        anchorElement.download = fileName;

        document.body.appendChild(anchorElement);
        anchorElement.click();

        document.body.removeChild(anchorElement);
        window.URL.revokeObjectURL(href);
        onSuccess();
      })
      .catch(() => {
        onError();
      });
  };

  const uploadAttachment = async (url, file) => {
    const { payload, modifiedContentType } = await encryptPayloadHandler(file.data, 'application/octet-stream');
    return fetch(url, {
      method: 'POST',
      headers: getHeaders(
        url,
        {
          'Content-Length': file.fileSize,
          'Content-Type': modifiedContentType,
          'X-File-Name': file.fileName,
          'X-File-Offset': 0,
          'X-File-Size': file.fileSize,
          'X-File-Type': file.fileType,
        },
        tenantId
      ),
      body: payload,
    }).then(data => data.json());
  };

  const downloadAttachment = async (url, AcceptContent) => {
    return fetch(url, {
      method: 'GET',
      headers: getHeaders(url, { Accept: AcceptContent, checksum: getItem('checksum') }, tenantId),
    })
      .then(data => data.blob())
      .catch(() => null);
  };

  return {
    isLoading,
    setIsLoading,
    api,
    uploadAttachment,
    uploadDocument,
    downloadDocument,
    downloadDocumentWithFileId,
    downloadFile,
    downloadAttachment,
  };
};
