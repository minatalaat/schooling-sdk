export const getStatementErrorLabel = error => {
  switch (error) {
    case 'BS-001':
      return 'LBL_ERROR_BANK_STATEMENT_IMPORTED';
    case 'BS-002':
      return 'LBL_ERROR_INITIAL_BALANCE_MISMATCH';
    case 'BS-003':
      return 'LBL_ERROR_START_DATE_VALIDATION';
    case 'BR-001':
      return 'LBL_ERROR_ENDING_BALANCE_VALIDATION';
    case 'BS-004':
      return 'LBL_ERROR_LOADING_FINAL_BALANCE';
    case 'BS-005':
      return 'LBL_ERROR_WRONG_IBAN_IMPORTED';
    case 'SBS-013':
      return 'LBL_ERROR_STATEMENT_HAS_RECONCILIATION';
    case 'SBS-014':
      return 'LBL_ERROR_STATEMENT_HAS_DEPENDENCY';
    case 'SBS-015':
      return 'LBL_ERROR_STATEMENT_FAIL_REMOVE_ALL';
    default:
      return 'LBL_ERROR_IMPORT_BANK_STATEMENT';
  }
};
