import ColumnFilter from '../ColumnFilter';
export const COLUMNS = [
  { Header: 'LBL_CODE', accessor: 'code', Filter: ColumnFilter, id: 'code', operator: 'like' },
  { Header: 'LBL_NAME', accessor: 'name', Filter: ColumnFilter, id: 'name', operator: 'like' },
  { Header: 'LBL_SERIAL_NUMBER', accessor: 'serialNumber', Filter: ColumnFilter, id: 'serialNumber', operator: 'like' },
  { Header: 'LBL_AVAILABLE_QTY', accessor: 'availableQty', Filter: ColumnFilter, id: '$availableQty', operator: 'like' },
];
