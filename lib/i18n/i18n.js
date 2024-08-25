import { initReactI18next } from 'react-i18next';
import i18n from 'i18next';

import * as AR from './locales/ar.json';
import * as EN from './locales/en.json';

import { getItem } from '../utils/localStorage';

export const languages = [
  {
    code: 'en',
    name: 'English',
    dir: 'ltr',
    country_code: 'gb',
  },
  {
    code: 'ar',
    name: 'العربية',
    dir: 'rtl',
    country_code: 'sa',
  },
];

i18n.use(initReactI18next).init(
  {
    lng: getItem('code') ? getItem('code') : 'ar',
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false,
    },
    debug: false,
    resources: {
      en: {
        translation: EN,
      },
      ar: {
        translation: AR,
      },
    },
  },
  function (err, t) {
    // initialized and ready to go!
    //
  }
);
