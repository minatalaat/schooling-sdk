import ColumnFilter from '../ColumnFilter';
export const COLUMNS = [
  { Header: 'LBL_NAME', accessor: 'name', Filter: ColumnFilter, id: 'name', operator: 'like' },

  { Header: 'LBL_META_MODEL', accessor: 'fileTabList', Filter: ColumnFilter, id: 'fileTabList', operator: 'like' },
];
