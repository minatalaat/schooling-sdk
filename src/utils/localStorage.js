import { changeLanguage } from '../i18n/changeLanguage';

export const getItem = key => {
  return localStorage.getItem(key);
};

export const setItem = (key, value) => {
  localStorage.setItem(key, value);
};

export const removeItem = key => {
  localStorage.removeItem(key);
};

export const clearLocalStorage = () => {
  let appCode = getItem('code');
  localStorage.clear();
  changeLanguage(appCode || 'ar');
};

export const setToken = token => {
  setItem('checksum', token?.checksum);
};
