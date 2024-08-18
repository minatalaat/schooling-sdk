import ColumnFilter from '../ColumnFilter';
export const COLUMNS = [
  { Header: 'LBL_NAME', accessor: 'name', Filter: ColumnFilter, id: 'name', operator: 'like' },
  { Header: 'LBL_USER', accessor: 'userName', Filter: ColumnFilter, id: 'user', operator: 'like' },
];
