import ColumnFilter from '../ColumnFilter';
export const COLUMNS = [
  { Header: 'LBL_CODE', accessor: 'code', Filter: ColumnFilter, id: 'code', operator: 'like' },
  { Header: 'LBL_DESCRIPTION', accessor: 'description', Filter: ColumnFilter, id: 'description', operator: 'like' },
];
