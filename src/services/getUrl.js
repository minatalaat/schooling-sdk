import { REST_ENDPOINTS, SAAS_ENDPOINTS } from '../constants/rest';
import { MODELS } from '../constants/models';

const provider = import.meta.env.VITE_PROVIDER;

export const getWsQaema = () => {
  return import.meta.env.VITE_BASE_URL + REST_ENDPOINTS.WS + REST_ENDPOINTS.QAEMA;
};

export const getLoginUrl = () => {
  return import.meta.env.VITE_BASE_URL + REST_ENDPOINTS.LOGIN;
};

export const getLogOutUrl = () => {
  return import.meta.env.VITE_BASE_URL + REST_ENDPOINTS.LOGOUT;
};

export const getFetchUrl = (model, modelId) => {
  return import.meta.env.VITE_BASE_URL + REST_ENDPOINTS.WSREST + model + '/' + modelId + REST_ENDPOINTS.FETCH;
};

export const getSearchUrl = model => {
  return import.meta.env.VITE_BASE_URL + REST_ENDPOINTS.WSREST + model + REST_ENDPOINTS.SEARCH;
};

export const getActionUrl = () => {
  return import.meta.env.VITE_BASE_URL + REST_ENDPOINTS.WSACTION;
};

export const getActionWithSlashUrl = endpoint => {
  return import.meta.env.VITE_BASE_URL + REST_ENDPOINTS.WSACTIONPLUS + endpoint;
};

export const getModelUrl = model => {
  return import.meta.env.VITE_BASE_URL + REST_ENDPOINTS.WSREST + model;
};

export const getRemoveAllUrl = model => {
  return import.meta.env.VITE_BASE_URL + REST_ENDPOINTS.WSREST + model + REST_ENDPOINTS.REMOVEALL;
};

export const getVerifyUrl = model => {
  return import.meta.env.VITE_BASE_URL + REST_ENDPOINTS.WSREST + model + REST_ENDPOINTS.VERIFY;
};

export const getUploadUrl = model => {
  return import.meta.env.VITE_BASE_URL + REST_ENDPOINTS.WSREST + model + REST_ENDPOINTS.UPLOAD;
};

export const getModelChartUrl = model => {
  return import.meta.env.VITE_BASE_URL + REST_ENDPOINTS.WSMETACHART + model;
};

export const getModelFieldsUrl = model => {
  return import.meta.env.VITE_BASE_URL + REST_ENDPOINTS.WSMETAFIELDS + model;
};

export const getReportUrl = (url, tenantId) => {
  return import.meta.env.VITE_BASE_URL + url + `&tenantId=${tenantId}`;
};

export const getImportTemplateUrl = fileName => {
  return (
    import.meta.env.VITE_BASE_URL +
    REST_ENDPOINTS.WSSHARED +
    REST_ENDPOINTS.DOWNLOAD_WITHOUT_SLASH +
    '?parentFolder=Import_templates' +
    `&filename=${fileName}`
  );
};

export const getSubscribtionInvoicesListURL = () => {
  if (provider === 'gateway' || provider === 'nonprod')
    return import.meta.env.VITE_SCS_URL + REST_ENDPOINTS.INVOICING + REST_ENDPOINTS.invoice + REST_ENDPOINTS.lstInvoices;
  return import.meta.env.VITE_SCS_URL + REST_ENDPOINTS.INVOICING + `0.1/` + REST_ENDPOINTS.invoice + REST_ENDPOINTS.lstInvoices;
};

export const getSubscribtionInvoiceDetailsURL = id => {
  if (provider === 'gateway' || provider === 'nonprod')
    return import.meta.env.VITE_SCS_URL + REST_ENDPOINTS.INVOICING + SAAS_ENDPOINTS.INVOICE_DETAILS + id;
  return import.meta.env.VITE_SCS_URL + REST_ENDPOINTS.INVOICING + `0.1/` + SAAS_ENDPOINTS.INVOICE_DETAILS + id;
};

export const getInitiatePaymentURL = () => {
  return import.meta.env.VITE_BASE_URL + REST_ENDPOINTS.WSACTIONPLUS + SAAS_ENDPOINTS.ACTION_PAYMENT;
};

export const getUpdatePaymentURL = () => {
  return import.meta.env.VITE_BASE_URL + REST_ENDPOINTS.WSACTIONPLUS + SAAS_ENDPOINTS.ACTION_UPDATE_PAYMENT;
};

export const getForgotPasswordURL = () => {
  return import.meta.env.VITE_BASE_URL + REST_ENDPOINTS.WSPUBLIC + REST_ENDPOINTS.FORGOT_PASSWORD;
};

export const getGenerateOtpURL = () => {
  return import.meta.env.VITE_BASE_URL + REST_ENDPOINTS.WSOTP + REST_ENDPOINTS.GENERATE_OTP;
};

export const verifyOtpURL = () => {
  return import.meta.env.VITE_BASE_URL + REST_ENDPOINTS.WSOTP + REST_ENDPOINTS.VERIFY_OTP;
};

export const getDownloadBatchUrl = () => {
  return import.meta.env.VITE_BASE_URL + REST_ENDPOINTS.WSDMS + REST_ENDPOINTS.DOWNLOAD + REST_ENDPOINTS.BATCH;
};

export const getDownloadUrl = () => {
  return import.meta.env.VITE_BASE_URL + REST_ENDPOINTS.WSDMS + REST_ENDPOINTS.DOWNLOAD;
};

export const getUploadAttachmentUrl = () => {
  return import.meta.env.VITE_BASE_URL + REST_ENDPOINTS.WSFILES + REST_ENDPOINTS.UPLOAD;
};

export const getDownloadAttachmentUrl = id => {
  return import.meta.env.VITE_BASE_URL + REST_ENDPOINTS.WSDMS + REST_ENDPOINTS.DOWNLOAD + id;
};

export const getCheckInvoicePaymentURL = invoiceNo => {
  return import.meta.env.VITE_SCS_DIRECT_URL + SAAS_ENDPOINTS.INV + SAAS_ENDPOINTS.CHECK_INVOICE_PAYMENT + invoiceNo;
  // return import.meta.env.VITE_SCS_URL + SAAS_ENDPOINTS.CHECK_INVOICE_PAYMENT + invoiceNo;
};

export const getMetaFileUrl = (fileId, parentId, model) => {
  return (
    import.meta.env.VITE_BASE_URL +
    REST_ENDPOINTS.WSREST +
    MODELS.METAFILE +
    `/${fileId}/content/download?parentId=${parentId}&parentModel=${model}`
  );
};

export const getHealthCheckUrl = () => {
  return import.meta.env.VITE_BASE_URL + REST_ENDPOINTS.WSSEC + REST_ENDPOINTS.HEALTH_CHECK;
};

export const getPublicKeyUrl = () => {
  return import.meta.env.VITE_ONBOARDING_URL + REST_ENDPOINTS.DATA_SECURITY + REST_ENDPOINTS.PUBLIC_KEY;
};

export const getDecryptUrl = () => {
  return import.meta.env.VITE_ONBOARDING_URL + REST_ENDPOINTS.DATA_SECURITY + REST_ENDPOINTS.DECRYPT;
};

export const getCopyUrl = (model, id) => {
  return import.meta.env.VITE_BASE_URL + REST_ENDPOINTS.WSREST + model + '/' + id + REST_ENDPOINTS.COPY;
};

export const getTierFeaturesUrl = id => {
  return import.meta.env.VITE_BASE_URL + REST_ENDPOINTS.WS + REST_ENDPOINTS.QAEMA + REST_ENDPOINTS.TIER + id;
};

export const getSubscriptionModelsUrl = productId => {
  // Will be used again later
  // let url = import.meta.env.VITE_SCS_URL + REST_ENDPOINTS.PROD_SUB + productId + REST_ENDPOINTS.SUBSCRIPTION_MODELS;
  let url = import.meta.env.VITE_SCS_DIRECT_URL + SAAS_ENDPOINTS.PROD_SUB + productId + SAAS_ENDPOINTS.SUBSCRIPTION_MODELS;

  if (provider === 'gateway' || provider === 'nonprod') {
    url =
      import.meta.env.VITE_SCS_DIRECT_URL +
      SAAS_ENDPOINTS.PRODUCT +
      // REST_ENDPOINTS.PROD_SUB +
      productId +
      SAAS_ENDPOINTS.SUBSCRIPTION_MODELS;
  }

  return url;
};

export const updateTierURL = () => {
  return import.meta.env.VITE_BASE_URL + REST_ENDPOINTS.WS + REST_ENDPOINTS.QAEMA + REST_ENDPOINTS.SUBSCRIPTION + REST_ENDPOINTS.MANAGE;
};

export const getCompanyProfileUrl = () => {
  return import.meta.env.VITE_BASE_URL + REST_ENDPOINTS.WS + REST_ENDPOINTS.QAEMA + REST_ENDPOINTS.PROFILE + REST_ENDPOINTS.COMPANY;
};

export const getMyProfileUrl = () => {
  return import.meta.env.VITE_BASE_URL + REST_ENDPOINTS.WS + REST_ENDPOINTS.QAEMA + REST_ENDPOINTS.MY_PROFILE;
};

export const getUserFavoritesUrl = () => {
  return import.meta.env.VITE_BASE_URL + REST_ENDPOINTS.WS + REST_ENDPOINTS.QAEMA + REST_ENDPOINTS.PROFILE + REST_ENDPOINTS.FAVORITE;
};

export const getUserProfilesUrl = () => {
  return import.meta.env.VITE_BASE_URL + REST_ENDPOINTS.WS + REST_ENDPOINTS.QAEMA + REST_ENDPOINTS.USER;
};

export const getUserProfileByIdUrl = id => {
  return import.meta.env.VITE_BASE_URL + REST_ENDPOINTS.WS + REST_ENDPOINTS.QAEMA + REST_ENDPOINTS.USER_SLASH + id;
};

export const getUserGroupsUrl = () => {
  return import.meta.env.VITE_BASE_URL + REST_ENDPOINTS.WS + REST_ENDPOINTS.QAEMA + REST_ENDPOINTS.GROUP;
};

export const getUserGroupByIdUrl = id => {
  return import.meta.env.VITE_BASE_URL + REST_ENDPOINTS.WS + REST_ENDPOINTS.QAEMA + REST_ENDPOINTS.GROUP_SLASH + id;
};

export const getAssignUserPermissionsUrl = () => {
  return import.meta.env.VITE_BASE_URL + REST_ENDPOINTS.WS + REST_ENDPOINTS.QAEMA + REST_ENDPOINTS.USER_SLASH + REST_ENDPOINTS.PERMISSION;
};

export const getAssignGroupPermissionsUrl = () => {
  return import.meta.env.VITE_BASE_URL + REST_ENDPOINTS.WS + REST_ENDPOINTS.QAEMA + REST_ENDPOINTS.GROUP_SLASH + REST_ENDPOINTS.PERMISSION;
};

export const getAddFavoriteUrl = () => {
  return import.meta.env.VITE_BASE_URL + REST_ENDPOINTS.WS + REST_ENDPOINTS.QAEMA + REST_ENDPOINTS.PROFILE + REST_ENDPOINTS.FAVORITE;
};

export const getRemoveFavoriteUrl = code => {
  return (
    import.meta.env.VITE_BASE_URL + REST_ENDPOINTS.WS + REST_ENDPOINTS.QAEMA + REST_ENDPOINTS.PROFILE + REST_ENDPOINTS.FAVORITE + '/' + code
  );
};

export const getSupscriptionInfoUrl = () => {
  return import.meta.env.VITE_BASE_URL + REST_ENDPOINTS.WS + REST_ENDPOINTS.QAEMA + REST_ENDPOINTS.SUBSCRIPTION + REST_ENDPOINTS.INFO;
};

export const getCheckQaemaInvoiceUrl = () => {
  return (
    import.meta.env.VITE_BASE_URL +
    REST_ENDPOINTS.WS +
    REST_ENDPOINTS.QAEMA +
    REST_ENDPOINTS.SUBSCRIPTION +
    REST_ENDPOINTS.CHECK_QAEMA_INVOICE_PAYMENT
  );
};

export const getCancelUpdateTierRequestUrl = () => {
  return (
    import.meta.env.VITE_BASE_URL +
    REST_ENDPOINTS.WS +
    REST_ENDPOINTS.QAEMA +
    REST_ENDPOINTS.SUBSCRIPTION +
    REST_ENDPOINTS.PENDING_SUBSCRIPTION +
    REST_ENDPOINTS.DECLINE
  );
};

export const getInvoiceDetailsUrl = customerId => {
  if (provider === 'gateway' || provider === 'nonprod')
    return (
      import.meta.env.VITE_SCS_URL +
      REST_ENDPOINTS.INVOICING +
      REST_ENDPOINTS.invoice +
      REST_ENDPOINTS.lstInvoices +
      `?pageOffset=0&customerId=${customerId}&pageSize=1`
    );
  return (
    import.meta.env.VITE_SCS_URL +
    REST_ENDPOINTS.INVOICING +
    `0.1/` +
    REST_ENDPOINTS.invoice +
    REST_ENDPOINTS.lstInvoices +
    `?pageOffset=0&customerId=${customerId}&pageSize=1`
  );
};

export const getPublicTokenUrl = (token, tenant) => {
  return import.meta.env.VITE_BASE_URL + REST_ENDPOINTS.WSPUBLIC + REST_ENDPOINTS.TOKEN + `?token=${token}&tenantId=${tenant}`;
};

export const getIntegratorsURL = () => {
  return getWsQaema() + REST_ENDPOINTS.INTEGRATOR;
};

export const getIntegratorsConfigURL = code => {
  let url = getWsQaema() + REST_ENDPOINTS.INTEGRATOR_CONFIG;
  if (code) url = url + '/' + code;
  return url;
};

export const getIntegratorAuthorizeURL = authEndPoint => {
  return import.meta.env.VITE_BASE_URL + REST_ENDPOINTS.WS + authEndPoint;
};

export const getIntegratorStatusURL = code => {
  return getIntegratorsURL() + '/' + code;
};

export const getSyncURL = () => {
  let url = import.meta.env.VITE_BASE_URL;
  url = url.substring(0, url.length - 1);
  return url;
};

export const getSyncAllURL = code => {
  let url = getWsQaema() + REST_ENDPOINTS.INTEGRATOR + '/' + code + REST_ENDPOINTS.SYNC;
  return url;
};

export const geSubscriptionDetailsUrl = (customerId, subscriptionId) => {
  if (provider === 'gateway' || provider === 'nonprod')
    return (
      import.meta.env.VITE_SCS_URL +
      SAAS_ENDPOINTS.QUOTATION +
      SAAS_ENDPOINTS.SUBSCRIPTIONS_LIST +
      `?customerId=${customerId}&pageOffset=0&pageSize=1&subscriptionId=${subscriptionId}`
    );
  return (
    import.meta.env.VITE_SCS_URL +
    SAAS_ENDPOINTS.QUOTATION +
    `0.1/` +
    SAAS_ENDPOINTS.SUBSCRIPTIONS_LIST +
    `?customerId=${customerId}&pageOffset=0&pageSize=1&subscriptionId=${subscriptionId}`
  );
};

export const getUpdateSubscriptionRenewalUrl = () => {
  return import.meta.env.VITE_SCS_URL + SAAS_ENDPOINTS.SUBSCRIPTION + SAAS_ENDPOINTS.UPDATE_SUBSCRIPTION_RENEWAL;
};

export const getUpdateSubscriptionRecurringUrl = () => {
  return import.meta.env.VITE_SCS_URL + SAAS_ENDPOINTS.SUBSCRIPTION + SAAS_ENDPOINTS.UPDATE_SUBSCRIPTION_RECURRING;
};

export const getIntegratorDisconnectUrl = code => {
  let url =
    import.meta.env.VITE_BASE_URL +
    REST_ENDPOINTS.WS +
    REST_ENDPOINTS.QAEMA +
    REST_ENDPOINTS.INTEGRATOR +
    '/' +
    code +
    REST_ENDPOINTS.DISCONNECT;
  return url;
};

export const getReactivateSubscriptionUrl = () => {
  return import.meta.env.VITE_BASE_URL + REST_ENDPOINTS.WS + REST_ENDPOINTS.QAEMA + REST_ENDPOINTS.SUBSCRIPTION + REST_ENDPOINTS.REACTIVATE;
};

export const getCancelSubscriptionUrl = () => {
  return import.meta.env.VITE_BASE_URL + REST_ENDPOINTS.WS + REST_ENDPOINTS.QAEMA + REST_ENDPOINTS.SUBSCRIPTION + REST_ENDPOINTS.CANCEL;
};

export const getProducts = () => {
  // PRODUCTS ENDPOINT
  return import.meta.env.VITE_SCHOOLING_URL + REST_ENDPOINTS.CANTEEN_PRODUCTS;
};

export const getCategories = () => {
  // CATEGORIES ENDPOINT
  return import.meta.env.VITE_SCHOOLING_URL + REST_ENDPOINTS.SCHOOL_CATEGORIES;
};

export const getBus = () => {
  // Below is an example for a returned url using base url from env variables and end point from a constants file
  return import.meta.env.VITE_SCHOOLING_URL + REST_ENDPOINTS.SCHOOL_BUSES;
};

export const getBusModels = () => {
  // Below is an example for a returned url using base url from env variables and end point from a constants file
  return import.meta.env.VITE_SCHOOLING_URL + REST_ENDPOINTS.SCHOOL_BUSES_MODELS;
};

export const getStudents = () => {
  // Below is an example for a returned url using base url from env variables and end point from a constants file
  return import.meta.env.VITE_SCHOOLING_URL + REST_ENDPOINTS.SCHOOL_STUDENTS;
};

export const getSchools = () => {
  // Below is an example for a returned url using base url from env variables and end point from a constants file
  return import.meta.env.VITE_SCHOOLING_URL + REST_ENDPOINTS.SCHOOLS;
};

export const getClasses = () => {
  // Below is an example for a returned url using base url from env variables and end point from a constants file
  return import.meta.env.VITE_SCHOOLING_URL + REST_ENDPOINTS.CLASSES;
};

export const getAttendance = () => {
  return import.meta.env.VITE_SCHOOLING_URL + REST_ENDPOINTS.ATTENDANCE;
};

export const getLoopkups = () => {
  return import.meta.env.VITE_SCHOOLING_URL + REST_ENDPOINTS.LOOKUPS;
};

export const getPreProducts = () => {
  // Below is an example for a returned url using base url from env variables and end point from a constants file
  return import.meta.env.VITE_SCHOOLING_URL + REST_ENDPOINTS.PREORDERS;
};

export const getCart = () => {
  // Below is an example for a returned url using base url from env variables and end point from a constants file
  return import.meta.env.VITE_SCHOOLING_URL + REST_ENDPOINTS.CART;
};

export const getGrades = () => {
  // Below is an example for a returned url using base url from env variables and end point from a constants file
  return import.meta.env.VITE_SCHOOLING_URL + REST_ENDPOINTS.GARDES;
};
