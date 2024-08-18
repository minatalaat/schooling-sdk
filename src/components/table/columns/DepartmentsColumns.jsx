import ColumnFilter from '../ColumnFilter';
export const COLUMNS = [
  { Header: 'LBL_NAME', accessor: 'name', Filter: ColumnFilter, id: 'name', operator: 'like' },
  { Header: 'LBL_CODE', accessor: 'code', Filter: ColumnFilter, id: 'code', operator: 'like' },
];
