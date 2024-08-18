import ColumnFilter from '../ColumnFilter';
export const COLUMNS = [
  { Header: 'LBL_NAME', accessor: 'name', Filter: ColumnFilter, id: 'name', operator: 'like' },
  { Header: 'LBL_FIXED_ASSET_TYPE', accessor: 'fixedAssetType', Filter: ColumnFilter, id: 'fixedAssetType', operator: 'like' },
];
