import ColumnFilter from '../ColumnFilter';

export const COLUMNS = [
  { Header: 'LBL_NAME', accessor: 'name', Filter: ColumnFilter, id: 'name', operator: 'like' },
  { Header: 'LBL_CODE', accessor: 'code', Filter: ColumnFilter, id: 'code', operator: 'like' },
  {
    Header: 'LBL_TAX_TYPE',
    accessor: 'typeSelect',
    Filter: ColumnFilter,
    id: 'typeSelect',
    operator: '=',
    selectionName: 'account.tax.type.select',
    keys: { valueKey: 'value', titleKey: 'label' },
  },
  { Header: 'LBL_RATE', accessor: 'rate', Filter: ColumnFilter, id: 'rate', operator: 'like' },
];
