import ColumnFilter from '../ColumnFilter';
export const COLUMNS = [
  { Header: 'LBL_NAME', accessor: 'name', Filter: ColumnFilter, id: 'name', operator: 'like' },
  { Header: 'LBL_TEMPLATE_FILE_NAME', accessor: 'templateFileName', Filter: ColumnFilter, id: 'templateLink', operator: 'like' },
];
