export const STATEMENTS_FIELDS = [
  'name',
  'fromDate',
  'statusSelect',
  'toDate',
  'ebicsPartner.ebicsBank',
  'ebicsPartner',
  'id',
  'bankStatementFileFormat',
  'bankStatementFile',
  'bankStatementFileFormat.statementFileFormatSelect',
];

export const BANK_DETAILS_FIELDS = ['id', 'fullName', 'ownerName', 'code', 'iban', 'bankAddress', 'bank', 'bankAccount'];

export const STATEMENT_LINES_FIELDS = [
  'operationDate',
  'lineTypeSelect',
  'origin',
  'amountRemainToReconcile',
  'description',
  'valueDate',
  'bankDetails.code',
  'reference',
  'sequence',
  'bankDetails',
  'currency',
  'currency.code',
  'debit',
  'credit',
];

export const MOVELINES_FIELDS = [
  'date',
  'move.period',
  'move.company',
  'account.analyticDistributionRequiredOnMoveLines',
  'taxLine',
  'origin',
  'dueDate',
  'description',
  'move.statusSelect',
  'analyticMoveLineList',
  'partner',
  'amountRemaining',
  'name',
  'reconcileGroup',
  'move.journal',
  'debit',
  'credit',
  'analyticDistributionTemplate',
  'account',
  'account.analyticDistributionAuthorized',
];
