import ColumnFilter from '../ColumnFilter';
export const COLUMNS = [
  { Header: 'LBL_NAME', accessor: 'name', Filter: ColumnFilter, id: 'name', operator: 'like' },
  // { Header: "LBL_PRINTING_CODE", accessor: "printingcode", Filter: ColumnFilter},
  // { Header: "LBL_SYMBOL", accessor: "symbol",Filter: ColumnFilter },
  { Header: 'LBL_ISO_CODE', accessor: 'isocode', Filter: ColumnFilter, id: 'codeISO', operator: 'like' },
];
