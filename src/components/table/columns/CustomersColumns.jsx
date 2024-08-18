import ColumnFilter from '../ColumnFilter';
export const COLUMNS = [
  { Header: 'LBL_REFERENCE', accessor: 'ref', Filter: ColumnFilter, id: 'partnerSeq', operator: 'like' },
  { Header: 'LBL_NAME', accessor: 'name', Filter: ColumnFilter, id: 'simpleFullName', operator: 'like' },
  { Header: 'LBL_FIXED_PHONE', accessor: 'fixedphone', Filter: ColumnFilter, id: 'fixedPhone', operator: 'like' },
  { Header: 'LBL_EMAIL_ADDRESS', accessor: 'email', Filter: ColumnFilter, id: 'emailAddress.address', operator: 'like' },
  // { Header: "LBL_CATEGORY", accessor: "category",Filter: ColumnFilter },
  // { Header: "LBL_FISCAL_POSITION", accessor: "fiscalposition",Filter: ColumnFilter },
  // { Header: "LBL_REGISTRATION_CODE", accessor: "registrationcode",Filter: ColumnFilter },
  // { Header: "LBL_ZIP_CODE", accessor: "zipcode",Filter: ColumnFilter },
  // { Header: "LBL_CITY", accessor: "city",Filter: ColumnFilter },
  // { Header: "LBL_COMPANY", accessor: "companies",Filter: ColumnFilter },
];
