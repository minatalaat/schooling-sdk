import ColumnFilter from '../ColumnFilter';

export const COLUMNS = [
  { Header: 'LBL_NAME', accessor: 'name', Filter: ColumnFilter, id: 'name', operator: 'like' },
  { Header: 'LBL_LABEL_TO_PRINTING', accessor: 'labelToPrinting', Filter: ColumnFilter, id: 'labelToPrinting', operator: 'like' },
  {
    Header: 'LBL_UNIT_TYPE',
    accessor: 'unitTypeSelect',
    Filter: ColumnFilter,
    id: 'unitTypeSelect',
    operator: '=',
    selectionName: 'unit.unit.type.select',
    keys: { valueKey: 'value', titleKey: 'label' },
  },
];
