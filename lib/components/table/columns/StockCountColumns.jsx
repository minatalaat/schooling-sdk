import ColumnFilter from '../ColumnFilter';
export const COLUMNS = [
  { Header: 'LBL_INVENTORY_SEQ', accessor: 'inventorySeq', Filter: ColumnFilter, id: 'inventorySeq', operator: 'like' },
  { Header: 'LBL_STOCK_LOCATION', accessor: 'stockLocation', Filter: ColumnFilter, id: 'stockLocation.name', operator: 'like' },
  { Header: 'LBL_PLANNED_START_DATE', accessor: 'plannedStartDateT', id: 'plannedStartDateT', operator: 'between' },
  // { Header: 'LBL_DESCRIPTION', accessor: 'description', Filter: ColumnFilter, id: 'description', operator: 'like' },
];
