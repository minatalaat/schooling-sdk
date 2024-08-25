import ColumnFilter from '../ColumnFilter';
export const COLUMNS = [
  { Header: 'LBL_TAX', accessor: 'name', Filter: ColumnFilter, id: 'name', operator: 'like' },
  { Header: 'LBL_RATE', accessor: 'value', Filter: ColumnFilter, id: 'value', operator: '=' },
];
