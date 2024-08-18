export const PARTNERS_SEARCH_FIELDS = ['partnerCategory', 'simpleFullName', 'fullName', 'partnerSeq', 'name'];

export const JOURNALS_SEARCH_FIELDS = ['statusSelect', 'exportCode', 'code', 'journalType', 'name', 'company', 'notExportOk'];

export const PERIODS_SEARCH_FIELD = ['fromDate', 'year.company', 'statusSelect', 'code', 'year', 'toDate', 'name'];

export const MOVELINES_SEARCH_FIELDS = [
  'name',
  'id',
  'dueDate',
  'date',
  'axis3AnalyticAccount',
  'account.isTaxAuthorizedOnMoveLine',
  'origin',
  'currencyAmount',
  'description',
  'axis4AnalyticAccount',
  'analyticMoveLineList',
  'axis2AnalyticAccount',
  'amountPaid',
  'amountRemaining',
  'account.isTaxRequiredOnMoveLine',
  'reconcileGroup',
  'move.company.accountConfig.isDescriptionRequired',
  'debit',
  'credit',
  'account.analyticDistributionRequiredOnMoveLines',
  'taxLine',
  'isOtherCurrency',
  'counter',
  'partner',
  'currencyRate',
  'axis1AnalyticAccount',
  'analyticDistributionTemplate',
  'account',
  'account.analyticDistributionAuthorized',
  'axis5AnalyticAccount',
];

export const MOVES_SEARCH_FIELDS = [
  'date',
  'accountingOk',
  'origin',
  'paymentVoucher',
  'description',
  'ignoreInDebtRecoveryOk',
  'reference',
  'journal',
  'stockMove',
  'companyCurrency',
  'company',
  'currency',
  'originDate',
  'functionalOriginSelect',
  'tradingName',
  'rejectOk',
  'period',
  'adjustingMove',
  'accountingDate',
  'journal.authorizeSimulatedMove',
  'fecImport',
  'paymentMode',
  'getInfoFromFirstMoveLineOk',
  'statusSelect',
  'ignoreInAccountingOk',
  'journal.authorizedFunctionalOriginSelect',
  'exportDate',
  'exportNumber',
  'partner',
  'technicalOriginSelect',
  'moveLineList',
  'period.statusSelect',
  'invoice',
  'fiscalPosition',
  'currencyCode',
  'accountingReport',
];

export const CURRENCIES_SEARCH_FIELDS = ['symbol', 'code', 'name', 'codeISO'];

export const PAYMENT_MODES_SEARCH_FIELDS = ['code', 'name', 'id'];

export const ACCOUNTS_SEARCH_FIELDS = [
  'statusSelect',
  'commonPosition',
  'code',
  'accountType',
  'name',
  'reconcileOk',
  'defaultTax',
  'company',
  'parentAccount',
  'id',
  'isTaxAuthorizedOnMoveLine',
  'isTaxRequiredOnMoveLine',
  'analyticDistributionAuthorized',
  'analyticDistributionRequiredOnMoveLines',
  'label',
];

export const ACCOUNTS_FETCH_FIELDS = [
  'isTaxRequiredOnMoveLine',
  'isTaxAuthorizedOnMoveLine',
  'analyticDistributionAuthorized',
  'analyticDistributionRequiredOnMoveLines',
  'label',
];

export const MOVE_SEARCH_PAYLOAD_FIELDS = [
  'id',
  'reference',
  'date',
  'accountingDate',
  'tradingName',
  'statusSelect',
  'period',
  'journal',
  'partner',
  'company',
  'invoice',
  'functionalOriginSelect',
];
