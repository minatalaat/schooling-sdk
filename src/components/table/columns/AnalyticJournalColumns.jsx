import ColumnFilter from '../ColumnFilter';
export const COLUMNS = [
  { Header: 'LBL_NAME', accessor: 'name', Filter: ColumnFilter, id: 'name', operator: 'like' },
  { Header: 'LBL_TYPE', accessor: 'type', Filter: ColumnFilter, id: 'type.name', operator: 'like' },
  { Header: 'LBL_COMPANY', accessor: 'company', Filter: ColumnFilter, id: 'company.name', operator: 'like' },
  // { Header: "LBL_STATUS", accessor: "status", Filter: ColumnFilter },
];
