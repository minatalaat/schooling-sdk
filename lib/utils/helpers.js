import { parse as parseDate, isDate } from 'date-fns';
import { getItem, setItem } from './localStorage';
import _ from 'lodash';

export const getTodayDate = () => {
  const today = new Date();
  const formatParams = { val: { year: 'numeric', month: 'short', day: 'numeric' } };
  const dateFormat = { val: today, formatParams: formatParams };
  return dateFormat;
};

export const replaceCommas = str => {
  return str.replace(/,/g, '');
};

export const formatFloatNumber = str => {
  if (!str) return '0.00';
  const num = parseFloat(str.toString().replace(/,/g, ''));
  let formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
  }).format(Number(num));
  return formatted;
};

export const parseFloatFixedTwo = str => {
  return parseFloat(str).toFixed(2);
};

export const checkIfPointExists = str => {
  let parts = str.split('.');
  if (parts.length > 2) return true;
  return false;
};

export const checkFlashOrError = obj => {
  if (!obj || obj.length === 0) return false;

  for (let i = 0; i < obj.length; i++) {
    if (
      obj[i].hasOwnProperty('flash') ||
      obj[i].hasOwnProperty('errors') ||
      obj[i].hasOwnProperty('error') ||
      obj[i].hasOwnProperty('alert')
    )
      return true;
  }

  return false;
};

export const deleteProperty = (obj, property) => {
  if (obj.hasOwnProperty(property)) delete obj[property];
};

export const getLastYearDate = () => {
  const lastYearDate = new Date(new Date().getFullYear() - 1, 0, 1);
  return lastYearDate;
};

export const getNextYearDate = () => {
  const nextYearDate = new Date(new Date().getFullYear() + 1, 11, 31);
  return nextYearDate;
};

export const getLastDayOfYearFromDate = date => {
  let now = new Date(date);
  let lastDay = new Date(now);
  lastDay.setDate(now.getDate() + 364);
  return lastDay.toISOString().split('T')[0];
};

export const getYearFromDateString = date => {
  let newDate = new Date(date);
  return newDate.getFullYear().toString();
};

export const isObjEmpty = obj => {
  return Object.keys(obj).length === 0;
};

export const parseDateString = (value, originalValue) => {
  const parsedDate = isDate(originalValue) ? originalValue : parseDate(originalValue, 'yyyy-MM-dd', new Date());
  return parsedDate;
};

export const getDateAfterXDays = x => {
  const curr = new Date();
  let newDate = new Date(curr.setDate(curr.getDate() + x));
  newDate = newDate.toISOString().split('T')[0];
  return newDate;
};

export const getAppLang = () => {
  return getItem('code') ? getItem('code') : null;
};

export const forceFeatures = (features, subFeaturesList = []) => {
  if (!(features?.length > 0)) return [];
  let tempFeatures = [...features];
  subFeaturesList.forEach(subFeature => {
    const featureCode = subFeature?.subFeatureCode?.split('.')[0];
    let featureIndex = tempFeatures.findIndex(tempFeature => tempFeature?.featureCode === featureCode);

    if (featureIndex !== -1) {
      tempFeatures[featureIndex] = {
        ...tempFeatures[featureIndex],
        subFeatureList: [
          ...tempFeatures[featureIndex].subFeatureList,
          { subFeatureCode: subFeature?.subFeatureCode || '', actions: subFeature?.actions || [] },
        ],
      };
    } else {
      tempFeatures.push({
        featureCode,
        subFeatureList: [{ subFeatureCode: subFeature?.subFeatureCode || '', actions: subFeature?.actions || [] }],
      });
    }
  });
  return tempFeatures;
};

export const convertKeysToCamelCase = obj => {
  let newObj = _.mapKeys(obj, (v, k) => _.camelCase(k));
  return newObj;
};

export const convertArrKeysToCamelCase = arr => {
  let temp = arr.map(obj => convertKeysToCamelCase(obj));
  return temp;
};

export const checkIfDifferentObj = (param1, param2) => {
  if (!param1 && !param2) return false;
  if (!param1 && param2 && param2.id !== null) return true;
  if (param1 && param1.id !== null && !param2) return true;
  if (param1 && param2 && param1.id !== param2.id) return true;
  else return false;
};

export const checkIfDifferentStr = (param1, param2) => {
  if (param1 === null && (param2 === null || (param2 && param2.length === '') || param2 === undefined)) return false;
  if (param1 === null && param2 && param2.length > 0) return true;
  if (param1 && param1.length > 0 && param2 === null) return true;
  if (param1 && param2 && param1 !== param2) return true;
  else return false;
};

export const changeSystemLanguage = language => {
  setItem('code', language);
  window.location.reload(true);
};

export const captilazeFirstWord = value => {
  let sepratedValue = value.split(' ');

  if (sepratedValue && typeof sepratedValue === 'array' && sepratedValue.length > 0) {
    let remainingValue = sepratedValue?.shift();

    if (remainingValue && remainingValue.length > 0) {
      return sepratedValue?.[0]?.charAt(0)?.toUpperCase() + sepratedValue?.[0]?.substring(1)?.toLowerCase() + remainingValue?.toLowerCase();
    } else {
      return sepratedValue?.[0]?.charAt(0)?.toUpperCase() + sepratedValue?.[0]?.substring(1)?.toLowerCase();
    }
  } else {
    return value?.charAt(0)?.toUpperCase() + value?.substring(1)?.toLowerCase();
  }
};

export function getFilterString(filter_obj) {
  var filterString = '?';
  Object.keys(filter_obj).map(function (key) {
    if (filter_obj[key] !== undefined && filter_obj[key] !== null) {
      filterString += key + '=' + filter_obj[key] + '&';
    }
  });

  if (filterString.substr(filterString.length - 1) === '&') {
    filterString = filterString.slice(0, -1);
  }

  return filterString;
}

export const hasValue = val => {
  return val !== '' && val !== undefined && val !== null;
};
