import ColumnFilter from '../ColumnFilter';
export const COLUMNS = [
  { Header: 'LBL_CODE', accessor: 'code', Filter: ColumnFilter, id: 'code', operator: 'like' },
  { Header: 'LBL_NAME', accessor: 'fullName', Filter: ColumnFilter, id: 'fullName', operator: 'like' },
  { Header: 'LBL_ANALYTIC_AXIS', accessor: 'analyticAxis', Filter: ColumnFilter, id: 'analyticAxis.name', operator: 'like' },
  // { Header: "LBL_PARENT_ANALYTIC_AXIS", accessor: "parentAnalyticAxis", Filter: ColumnFilter },
  // { Header: "LBL_STATUS", accessor: "status", Filter: ColumnFilter }
];
