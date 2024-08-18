import ColumnFilter from '../ColumnFilter';

export const COLUMNS = [
  { Header: 'LBL_NAME', accessor: 'name', Filter: ColumnFilter, id: 'name', operator: 'like' },
  { Header: 'LBL_HEIGHT', accessor: 'height', Filter: ColumnFilter, id: 'height', operator: '=' },
  { Header: 'LBL_WIDTH', accessor: 'width', Filter: ColumnFilter, id: 'width', operator: '=' },
];
