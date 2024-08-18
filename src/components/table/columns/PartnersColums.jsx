import ColumnFilter from '../ColumnFilter';
export const COLUMNS = [
  { Header: 'LBL_REFERENCE', accessor: 'partnerSeq', Filter: ColumnFilter, id: 'partnerSeq', operator: 'like' },
  { Header: 'LBL_NAME', accessor: 'simpleFullName', Filter: ColumnFilter, id: 'simpleFullName', operator: 'like' },
  /* 	{ Header: "LBL_FIXED_PHONE", accessor: "fixedphone", Filter: ColumnFilter },
	{
		Header: "LBL_EMAIL_ADDRESS",
		accessor: "emailAddress.address",
		Filter: ColumnFilter,
	}, */
  // { Header: "LBL_CATEGORY", accessor: "category",Filter: ColumnFilter },
  // { Header: "LBL_FISCAL_POSITION", accessor: "fiscalposition",Filter: ColumnFilter },
  // { Header: "LBL_REGISTRATION_CODE", accessor: "registrationcode",Filter: ColumnFilter },
  // { Header: "LBL_ADDRESS", accessor: "address",Filter: ColumnFilter },
  // { Header: "LBL_COMPANY", accessor: "companies",Filter: ColumnFilter },
];
