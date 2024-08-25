import ColumnFilter from '../ColumnFilter';

export const COLUMNS = [
  { Header: 'LBL_NAME', accessor: 'name', id: 'name', Filter: ColumnFilter, operator: 'like' },
  { Header: 'LBL_CATEGORY', accessor: 'category', id: 'fixedAssetCategory.name', Filter: ColumnFilter, operator: 'like' },
];
