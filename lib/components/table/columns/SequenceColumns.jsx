import ColumnFilter from '../ColumnFilter';
export const COLUMNS = [
  { Header: 'LBL_NAME', accessor: 'fullName', id: 'fullName', Filter: ColumnFilter, operator: 'like' },
  { Header: 'LBL_CODE', accessor: 'codeSelect', id: 'codeSelect', Filter: ColumnFilter, operator: 'like' },
];
