import { REST_ENDPOINTS, SAAS_ENDPOINTS } from '../constants/rest';
import { MODELS } from '../constants/models';
import { useContext } from 'react';
import SchoolingContext from '../context/SchoolingContext';

export const useGetUrl = () => {
  const { env } = useContext(SchoolingContext);

  let baseUrl = import.meta.env.VITE_SCHOOLING_URL_PROD;

  if (env === 'uat') baseUrl = import.meta.env.VITE_SCHOOLING_URL_UAT;

  const getWsQaema = () => {
    return baseUrl + REST_ENDPOINTS.WS + REST_ENDPOINTS.QAEMA;
  };

  const getLoginUrl = () => {
    return baseUrl + REST_ENDPOINTS.LOGIN;
  };

  const getLogOutUrl = () => {
    return baseUrl + REST_ENDPOINTS.LOGOUT;
  };

  const getFetchUrl = (model, modelId) => {
    return baseUrl + REST_ENDPOINTS.WSREST + model + '/' + modelId + REST_ENDPOINTS.FETCH;
  };

  const getSearchUrl = model => {
    return baseUrl + REST_ENDPOINTS.WSREST + model + REST_ENDPOINTS.SEARCH;
  };

  const getActionUrl = () => {
    return baseUrl + REST_ENDPOINTS.WSACTION;
  };

  const getActionWithSlashUrl = endpoint => {
    return baseUrl + REST_ENDPOINTS.WSACTIONPLUS + endpoint;
  };

  const getModelUrl = model => {
    return baseUrl + REST_ENDPOINTS.WSREST + model;
  };

  const getRemoveAllUrl = model => {
    return baseUrl + REST_ENDPOINTS.WSREST + model + REST_ENDPOINTS.REMOVEALL;
  };

  const getVerifyUrl = model => {
    return baseUrl + REST_ENDPOINTS.WSREST + model + REST_ENDPOINTS.VERIFY;
  };

  const getUploadUrl = model => {
    return baseUrl + REST_ENDPOINTS.WSREST + model + REST_ENDPOINTS.UPLOAD;
  };

  const getModelChartUrl = model => {
    return baseUrl + REST_ENDPOINTS.WSMETACHART + model;
  };

  const getModelFieldsUrl = model => {
    return baseUrl + REST_ENDPOINTS.WSMETAFIELDS + model;
  };

  const getReportUrl = (url, tenantId) => {
    return baseUrl + url + `&tenantId=${tenantId}`;
  };

  const getImportTemplateUrl = fileName => {
    return (
      baseUrl + REST_ENDPOINTS.WSSHARED + REST_ENDPOINTS.DOWNLOAD_WITHOUT_SLASH + '?parentFolder=Import_templates' + `&filename=${fileName}`
    );
  };

  const getInitiatePaymentURL = () => {
    return baseUrl + REST_ENDPOINTS.WSACTIONPLUS + SAAS_ENDPOINTS.ACTION_PAYMENT;
  };

  const getUpdatePaymentURL = () => {
    return baseUrl + REST_ENDPOINTS.WSACTIONPLUS + SAAS_ENDPOINTS.ACTION_UPDATE_PAYMENT;
  };

  const getForgotPasswordURL = () => {
    return baseUrl + REST_ENDPOINTS.WSPUBLIC + REST_ENDPOINTS.FORGOT_PASSWORD;
  };

  const getGenerateOtpURL = () => {
    return baseUrl + REST_ENDPOINTS.WSOTP + REST_ENDPOINTS.GENERATE_OTP;
  };

  const verifyOtpURL = () => {
    return baseUrl + REST_ENDPOINTS.WSOTP + REST_ENDPOINTS.VERIFY_OTP;
  };

  const getDownloadBatchUrl = () => {
    return baseUrl + REST_ENDPOINTS.WSDMS + REST_ENDPOINTS.DOWNLOAD + REST_ENDPOINTS.BATCH;
  };

  const getDownloadUrl = () => {
    return baseUrl + REST_ENDPOINTS.WSDMS + REST_ENDPOINTS.DOWNLOAD;
  };

  const getUploadAttachmentUrl = () => {
    return baseUrl + REST_ENDPOINTS.WSFILES + REST_ENDPOINTS.UPLOAD;
  };

  const getDownloadAttachmentUrl = id => {
    return baseUrl + REST_ENDPOINTS.WSDMS + REST_ENDPOINTS.DOWNLOAD + id;
  };

  const getCheckInvoicePaymentURL = invoiceNo => {
    return import.meta.env.VITE_SCS_DIRECT_URL + SAAS_ENDPOINTS.INV + SAAS_ENDPOINTS.CHECK_INVOICE_PAYMENT + invoiceNo;
  };

  const getMetaFileUrl = (fileId, parentId, model) => {
    return baseUrl + REST_ENDPOINTS.WSREST + MODELS.METAFILE + `/${fileId}/content/download?parentId=${parentId}&parentModel=${model}`;
  };

  const getHealthCheckUrl = () => {
    return baseUrl + REST_ENDPOINTS.WSSEC + REST_ENDPOINTS.HEALTH_CHECK;
  };

  const getPublicKeyUrl = () => {
    return import.meta.env.VITE_ONBOARDING_URL + REST_ENDPOINTS.DATA_SECURITY + REST_ENDPOINTS.PUBLIC_KEY;
  };

  const getDecryptUrl = () => {
    return import.meta.env.VITE_ONBOARDING_URL + REST_ENDPOINTS.DATA_SECURITY + REST_ENDPOINTS.DECRYPT;
  };

  const getCopyUrl = (model, id) => {
    return baseUrl + REST_ENDPOINTS.WSREST + model + '/' + id + REST_ENDPOINTS.COPY;
  };

  const getTierFeaturesUrl = id => {
    return baseUrl + REST_ENDPOINTS.WS + REST_ENDPOINTS.QAEMA + REST_ENDPOINTS.TIER + id;
  };

  const updateTierURL = () => {
    return baseUrl + REST_ENDPOINTS.WS + REST_ENDPOINTS.QAEMA + REST_ENDPOINTS.SUBSCRIPTION + REST_ENDPOINTS.MANAGE;
  };

  const getCompanyProfileUrl = () => {
    return baseUrl + REST_ENDPOINTS.WS + REST_ENDPOINTS.QAEMA + REST_ENDPOINTS.PROFILE + REST_ENDPOINTS.COMPANY;
  };

  const getMyProfileUrl = () => {
    return baseUrl + REST_ENDPOINTS.WS + REST_ENDPOINTS.QAEMA + REST_ENDPOINTS.MY_PROFILE;
  };

  const getUserFavoritesUrl = () => {
    return baseUrl + REST_ENDPOINTS.WS + REST_ENDPOINTS.QAEMA + REST_ENDPOINTS.PROFILE + REST_ENDPOINTS.FAVORITE;
  };

  const getUserProfilesUrl = () => {
    return baseUrl + REST_ENDPOINTS.WS + REST_ENDPOINTS.QAEMA + REST_ENDPOINTS.USER;
  };

  const getUserProfileByIdUrl = id => {
    return baseUrl + REST_ENDPOINTS.WS + REST_ENDPOINTS.QAEMA + REST_ENDPOINTS.USER_SLASH + id;
  };

  const getUserGroupsUrl = () => {
    return baseUrl + REST_ENDPOINTS.WS + REST_ENDPOINTS.QAEMA + REST_ENDPOINTS.GROUP;
  };

  const getUserGroupByIdUrl = id => {
    return baseUrl + REST_ENDPOINTS.WS + REST_ENDPOINTS.QAEMA + REST_ENDPOINTS.GROUP_SLASH + id;
  };

  const getAssignUserPermissionsUrl = () => {
    return baseUrl + REST_ENDPOINTS.WS + REST_ENDPOINTS.QAEMA + REST_ENDPOINTS.USER_SLASH + REST_ENDPOINTS.PERMISSION;
  };

  const getAssignGroupPermissionsUrl = () => {
    return baseUrl + REST_ENDPOINTS.WS + REST_ENDPOINTS.QAEMA + REST_ENDPOINTS.GROUP_SLASH + REST_ENDPOINTS.PERMISSION;
  };

  const getAddFavoriteUrl = () => {
    return baseUrl + REST_ENDPOINTS.WS + REST_ENDPOINTS.QAEMA + REST_ENDPOINTS.PROFILE + REST_ENDPOINTS.FAVORITE;
  };

  const getRemoveFavoriteUrl = code => {
    return baseUrl + REST_ENDPOINTS.WS + REST_ENDPOINTS.QAEMA + REST_ENDPOINTS.PROFILE + REST_ENDPOINTS.FAVORITE + '/' + code;
  };

  const getSupscriptionInfoUrl = () => {
    return baseUrl + REST_ENDPOINTS.WS + REST_ENDPOINTS.QAEMA + REST_ENDPOINTS.SUBSCRIPTION + REST_ENDPOINTS.INFO;
  };

  const getCheckQaemaInvoiceUrl = () => {
    return baseUrl + REST_ENDPOINTS.WS + REST_ENDPOINTS.QAEMA + REST_ENDPOINTS.SUBSCRIPTION + REST_ENDPOINTS.CHECK_QAEMA_INVOICE_PAYMENT;
  };

  const getCancelUpdateTierRequestUrl = () => {
    return (
      baseUrl +
      REST_ENDPOINTS.WS +
      REST_ENDPOINTS.QAEMA +
      REST_ENDPOINTS.SUBSCRIPTION +
      REST_ENDPOINTS.PENDING_SUBSCRIPTION +
      REST_ENDPOINTS.DECLINE
    );
  };

  const getPublicTokenUrl = (token, tenant) => {
    return baseUrl + REST_ENDPOINTS.WSPUBLIC + REST_ENDPOINTS.TOKEN + `?token=${token}&tenantId=${tenant}`;
  };

  const getProducts = () => {
    // PRODUCTS ENDPOINT
    return baseUrl + REST_ENDPOINTS.CANTEEN_PRODUCTS;
  };

  const getCategories = () => {
    // CATEGORIES ENDPOINT
    return baseUrl + REST_ENDPOINTS.SCHOOL_CATEGORIES;
  };

  const getBus = () => {
    // Below is an example for a returned url using base url from env variables and end point from a constants file
    return baseUrl + REST_ENDPOINTS.SCHOOL_BUSES;
  };

  const getBusModels = () => {
    // Below is an example for a returned url using base url from env variables and end point from a constants file
    return baseUrl + REST_ENDPOINTS.SCHOOL_BUSES_MODELS;
  };

  const getStudents = () => {
    // Below is an example for a returned url using base url from env variables and end point from a constants file
    return baseUrl + REST_ENDPOINTS.SCHOOL_STUDENTS;
  };

  const getSchools = () => {
    // Below is an example for a returned url using base url from env variables and end point from a constants file
    return baseUrl + REST_ENDPOINTS.SCHOOLS;
  };

  const getClasses = () => {
    // Below is an example for a returned url using base url from env variables and end point from a constants file
    return baseUrl + REST_ENDPOINTS.CLASSES;
  };

  const getAttendance = () => {
    return baseUrl + REST_ENDPOINTS.ATTENDANCE;
  };

  const getLoopkups = () => {
    return baseUrl + REST_ENDPOINTS.LOOKUPS;
  };

  const getPreProducts = () => {
    // Below is an example for a returned url using base url from env variables and end point from a constants file
    return baseUrl + REST_ENDPOINTS.PREORDERS;
  };

  const getCart = () => {
    // Below is an example for a returned url using base url from env variables and end point from a constants file
    return baseUrl + REST_ENDPOINTS.CART;
  };

  const getGrades = () => {
    // Below is an example for a returned url using base url from env variables and end point from a constants file
    return baseUrl + REST_ENDPOINTS.GARDES;
  };

  // Export all functions
  return {
    getProducts,
    getBus,
    getStudents,
    getSchools,
    getClasses,
    getAttendance,
    getLoopkups,
    getPreProducts,
    getCart,
    getGrades,
    getWsQaema,
    getLoginUrl,
    getLogOutUrl,
    getFetchUrl,
    getSearchUrl,
    getActionUrl,
    getActionWithSlashUrl,
    getModelUrl,
    getRemoveAllUrl,
    getVerifyUrl,
    getUploadUrl,
    getModelChartUrl,
    getModelFieldsUrl,
    getReportUrl,
    getImportTemplateUrl,
    getInitiatePaymentURL,
    getUpdatePaymentURL,
    getForgotPasswordURL,
    getGenerateOtpURL,
    verifyOtpURL,
    getDownloadBatchUrl,
    getDownloadUrl,
    getUploadAttachmentUrl,
    getDownloadAttachmentUrl,
    getCheckInvoicePaymentURL,
    getMetaFileUrl,
    getHealthCheckUrl,
    getPublicKeyUrl,
    getDecryptUrl,
    getCopyUrl,
    getTierFeaturesUrl,
    updateTierURL,
    getCompanyProfileUrl,
    getMyProfileUrl,
    getUserFavoritesUrl,
    getUserProfilesUrl,
    getUserProfileByIdUrl,
    getUserGroupsUrl,
    getUserGroupByIdUrl,
    getAssignUserPermissionsUrl,
    getAssignGroupPermissionsUrl,
    getAddFavoriteUrl,
    getRemoveFavoriteUrl,
    getSupscriptionInfoUrl,
    getCheckQaemaInvoiceUrl,
    getCancelUpdateTierRequestUrl,
    getPublicTokenUrl,
    getCategories,
    getBusModels,
  };
};
