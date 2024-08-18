import i18n from 'i18next';

import { setItem } from '../utils/localStorage';

export const changeLanguage = code => {
  i18n.changeLanguage(code);
  document.dir = i18n.dir();
  setItem('code', code);
};
