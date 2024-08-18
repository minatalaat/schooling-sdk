import ColumnFilter from '../ColumnFilter';
export const COLUMNS = [
  { Header: 'LBL_NAME', accessor: 'name', Filter: ColumnFilter, id: 'name', operator: 'like' },
  { Header: 'LBL_CODE', accessor: 'code', Filter: ColumnFilter, id: 'code', operator: 'like' },
  // { Header: 'LBL_JOURNAL_TYPE', accessor: 'journaltype', Filter: ColumnFilter, id: 'journalType.name', operator: 'like' },
  // { Header: "LBL_EXPORT_CODE", accessor: "exportcode", Filter: ColumnFilter},
  // { Header: "LBL_STATUS", accessor: "status",Filter: ColumnFilter },
  // { Header: "LBL_COMPANY", accessor: "company",Filter: ColumnFilter },
];
