import ColumnFilter from '../ColumnFilter';
export const COLUMNS = [
  { Header: 'LBL_NAME', accessor: 'name', Filter: ColumnFilter, id: 'name', operator: 'like' },
  { Header: 'LBL_DESCRIPTION', accessor: 'description', Filter: ColumnFilter, id: 'description', operator: 'like' },
];
