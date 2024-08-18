import ColumnFilter from '../ColumnFilter';
export const COLUMNS = [
  { Header: 'LBL_BIC', accessor: 'code', Filter: ColumnFilter, id: 'code', operator: 'like' },
  { Header: 'LBL_BANK_NAME', accessor: 'bankName', Filter: ColumnFilter, id: 'bankName', operator: 'like' },
  // { Header: "LBL_BUSINESS_PARTY_PREFIX", accessor: "businessPartyPrefix",Filter: ColumnFilter },
  // { Header: "LBL_BUSINESS_PARTY_SUFFIX", accessor: "businessPartySuffix",Filter: ColumnFilter },
  // { Header: "LBL_BRANCH_IDENTIFIER", accessor: "branchIdentifier", Filter: ColumnFilter},
];
