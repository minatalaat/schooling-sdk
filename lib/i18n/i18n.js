import { initReactI18next } from 'react-i18next';
import i18n from 'i18next';

import * as AR from './locales/ar.json';
import * as EN from './locales/en.json';

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

export const i18nInit = lang =>
  i18n.use(initReactI18next).init(
    {
      lng: lang,
      fallbackLng: 'en',
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