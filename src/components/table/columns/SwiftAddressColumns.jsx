import ColumnFilter from '../ColumnFilter';
export const COLUMNS = [
  { Header: 'LBL_SWIFT_ADDRESS', accessor: 'address', Filter: ColumnFilter, id: 'address', operator: 'like' },
  { Header: 'LBL_BANK', accessor: 'bankCode', Filter: ColumnFilter, id: 'bankCode', operator: 'like' },
];
