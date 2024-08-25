import ColumnFilter from '../ColumnFilter';
export const COLUMNS = [
  { Header: 'LBL_NAME', accessor: 'name', Filter: ColumnFilter, id: 'name', operator: 'like' },
  { Header: 'LBL_ISO_CODE', accessor: 'codeISO', Filter: ColumnFilter, id: 'codeISO', operator: 'like' },
];
