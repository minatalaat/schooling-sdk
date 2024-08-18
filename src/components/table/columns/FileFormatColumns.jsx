import ColumnFilter from '../ColumnFilter';
export const COLUMNS = [
  { Header: 'LBL_NAME', accessor: 'name', Filter: ColumnFilter, id: 'name', operator: 'like' },
  // {
  //   Header: 'LBL_FILE_FORMAT',
  //   accessor: 'statementFileFormatSelect',
  //   Filter: ColumnFilter,
  //   id: 'statementFileFormatSelect',
  //   operator: '=',
  //   typeSelect: STATEMENT_FILE_FORMAT_SELECT,
  //   selectionName: 'bankpayment.bank.statement.file.format.statement.file.format.select',
  //   keys: { valueKey: 'value', titleKey: 'label' },
  //   isString: true,
  // },
];
