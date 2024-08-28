import Feature from "./featureModel"

export const FEATURES = {
  CANTEEN_PRODUCTS:new Feature ({
    BASE_PATH: '/products',
    LABEL: 'LBL_PRODUCTS',
    SUB_PATHS: { VIEW: '/view/:id', ADD: '/add', EDIT: '/edit/:id' },
    IS_SEARCHABLE:true,
    IS_PAGINATED:true
  }),
  BUSES: new Feature ({
    BASE_PATH:  '/buses',
    LABEL:  'LBL_BUSES',
    SUB_PATHS: { VIEW: '/view/:id', ADD: '/add', EDIT: '/edit/:id' },
    IS_SEARCHABLE:true,
    IS_PAGINATED:true
  }),
  CANTEEN_CATEGORIES: new Feature ({
    BASE_PATH:'/categories',
    LABEL: 'LBL_CANTEEN_CATEGORIES',
    SUB_PATHS: { VIEW: '/view/:id/', EDIT: '/edit' },
    IS_SEARCHABLE:true,
    IS_PAGINATED:true,
  }),
  STUDENTS: new Feature ({
    BASE_PATH:'/students',
    LABEL: 'LBL_STUDENTS',
    SUB_PATHS: { VIEW: '/view/:id', ADD: '/add', EDIT: '/edit/:id' },
  }),
  CLASSES: new Feature ({
    BASE_PATH: '/classes',
    LABEL: 'LBL_CLASSES',
    SUB_PATHS: { VIEW: '/view/:classId', ADD: '/add', EDIT: '/edit/:classId',LIST: '/student-list/:schoolId/:classId',  ATTENDANCE: '/attendance/:studentId/:classId' },
  }),
  PRE_ORDERS:new Feature ({
    BASE_PATH: '/pre-order',
    LABEL: 'LBL_PRE_ORDERS',
    SUB_PATHS: { VIEW: '/view/:id', ADD: '/add', EDIT: '/edit/:id' },
  }),
  CART: new Feature ({
    BASE_PATH:  '/cart',
    LABEL: 'LBL_CART',
    SUB_PATHS: { VIEW: '/view/:id', ADD: '/add', EDIT: '/edit/:id' },
    IS_SEARCHABLE:true,
    IS_PAGINATED:true,
  }),
  SUPERVISORS: new Feature ({
    BASE_PATH: '/supervisors',
    LABEL: 'LBL_SUPERVISORS',
    SUB_PATHS: { VIEW: '/view/:id', ADD: '/add', EDIT: '/edit/:id' },
    IS_SEARCHABLE:true,
    IS_PAGINATED:true,
  }),
  GRADES: new Feature ({
    BASE_PATH: '/grades',
    LABEL: 'LBL_GRADES',
    SUB_PATHS: { VIEW: '/view/:id', ADD: '/add', EDIT: '/edit/:id' },
    IS_SEARCHABLE:true,
    IS_PAGINATED:true,
  }),
 
};