import ColumnFilter from '../ColumnFilter';
export const COLUMNS = [
  {
    Header: 'LBL_REFERENCE',
    accessor: 'partnerSeq',
    Filter: ColumnFilter,
    id: 'partnerSeq',
    operator: 'like',
  },
  {
    Header: 'LBL_NAME',
    accessor: 'simpleFullName',
    Filter: ColumnFilter,
    id: 'simpleFullName',
    operator: 'like',
  },
];
