import ColumnFilter from '../ColumnFilter';

export const COLUMNS = [
  { Header: 'LBL_NAME', accessor: 'fullName', Filter: ColumnFilter, id: 'fullName', operator: 'like' },
  { Header: 'LBL_BIC', accessor: 'bic', Filter: ColumnFilter, id: 'bank.code', operator: 'like' },
  { Header: 'LBL_ACCOUNT', accessor: 'bankAccount.label', Filter: ColumnFilter, id: 'bankAccount', operator: 'like' },
  { Header: 'LBL_IBAN_BBAN', accessor: 'iban', Filter: ColumnFilter, id: 'iban', operator: 'like' },
];
