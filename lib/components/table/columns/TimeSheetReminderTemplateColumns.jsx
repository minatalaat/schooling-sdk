import ColumnFilter from '../ColumnFilter';
export const COLUMNS = [
  { Header: 'LBL_SUBJECT', accessor: 'subject', Filter: ColumnFilter, id: 'subject', operator: 'like' },
  { Header: 'LBL_NAME', accessor: 'name', Filter: ColumnFilter, id: 'name', operator: 'like' },
];
