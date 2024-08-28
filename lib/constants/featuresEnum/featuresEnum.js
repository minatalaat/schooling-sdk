import Feature from './featuresModel';

import SettingsImg from '../../assets/images/icons/streamline_interface-setting-slider-horizontal-adjustment-adjust-controls-fader-horizontal-settings-slider.svg';
import NoSubscriptionsImg from '../../assets/images/icons/subscribtion.svg';

export const featuresEnum = {
  SCHOOLING: new Feature('15', '', 'LBL_SCHOOLING', {}, SettingsImg, null, 'LBL_SETTINGS_DESC'),
  CANTEEN_PRODUCTS: new Feature(
    '15.1',
    '/products',
    'LBL_PRODUCTS',
    { VIEW: '/view/:id', ADD: '/add', EDIT: '/edit/:id' },
    null,
    NoSubscriptionsImg,
    'LBL_SUBFEATURE_DESC'
  ),

  BUSES: new Feature(
    '15.2',
    '/buses',
    'LBL_BUSES',
    { VIEW: '/view/:id', ADD: '/add', EDIT: '/edit/:id', LIST: '/student-list/:id' },
    null,
    NoSubscriptionsImg,
    'LBL_SUBFEATURE_DESC'
  ),
  CANTEEN_CATEGORIES: new Feature(
    '15.3',
    '/categories',
    'LBL_CANTEEN_CATEGORIES',
    { VIEW: '/view/:id', ADD: '/add', EDIT: '/edit/:id' },
    null,
    NoSubscriptionsImg,
    'LBL_SUBFEATURE_DESC'
  ),
  STUDENTS: new Feature(
    '15.4',
    '/students',
    'LBL_STUDENTS',
    { VIEW: '/view/:id', ADD: '/add', EDIT: '/edit/:id', LIST: '/attendance/:id/:classId' },
    null,
    NoSubscriptionsImg,
    'LBL_SUBFEATURE_DESC'
  ),
  CLASSES: new Feature(
    '15.5',
    '/classes',
    'LBL_CLASSES',
    {
      VIEW: '/view/:classId',
      ADD: '/add',
      EDIT: '/edit/:classId',
      LIST: '/student-list/:schoolId/:classId',
      ATTENDANCE: '/attendance/:studentId/:classId',
    },
    null,
    NoSubscriptionsImg,
    'LBL_SUBFEATURE_DESC'
  ),
  PRE_ORDERS: new Feature(
    '15.6',
    '/pre-order',
    'LBL_PRE_ORDERS',
    { VIEW: '/view/:id', ADD: '/add', EDIT: '/edit/:id' },
    null,
    NoSubscriptionsImg,
    'LBL_SUBFEATURE_DESC'
  ),
  CART: new Feature(
    '15.7',
    '/cart',
    'LBL_CART',
    { VIEW: '/view/:id', ADD: '/add', EDIT: '/edit/:id' },
    null,
    NoSubscriptionsImg,
    'LBL_SUBFEATURE_DESC'
  ),
  SUPERVISORS: new Feature(
    '15.8',
    '/supervisors',
    'LBL_SUPERVISORS',
    { VIEW: '/view/:id', ADD: '/add', EDIT: '/edit/:id' },
    null,
    NoSubscriptionsImg,
    'LBL_SUBFEATURE_DESC'
  ),
  GRADES: new Feature(
    '15.9',
    '/grades',
    'LBL_GRADES',
    { VIEW: '/view/:id', ADD: '/add', EDIT: '/edit/:id' },
    null,
    NoSubscriptionsImg,
    'LBL_SUBFEATURE_DESC'
  ),
};
