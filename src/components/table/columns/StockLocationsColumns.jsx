import ColumnFilter from '../ColumnFilter';
export const COLUMNS = [
  { Header: 'LBL_NAME', accessor: 'name', Filter: ColumnFilter, id: 'name', operator: 'like' },
  {
    Header: 'LBL_TYPE',
    accessor: 'typeSelect',
    Filter: ColumnFilter,
    id: 'typeSelect',
    operator: '=',
    selectionName: 'stock.stock.location.type.select',
    keys: { valueKey: 'value', titleKey: 'label' },
  },
];
