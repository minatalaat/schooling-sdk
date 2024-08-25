export const PRODUCTS_SEARCH_FIELDS = [
  'unit',
  'code',
  'name',
  'productCategory',
  'productFamily',
  'productTypeSelect',
  'purchasable',
  'sellable',
  'fullName',
  'salePrice',
  'purchasePrice',
  'saleCurrency.symbol',
  'purchaseCurrency.symbol',
  'picture',
  'startDate',
  'accountManagementList',
  'saleCurrency',
  'purchaseCurrency',
  'picture',
  'serialNumber',
  'barCode',
  'barcodeTypeConfig',
  'costPrice',
  'costTypeSelect',
  'avgPrice',
];

export const UNITS_SEARCH_FIELDS = ['name', 'labelToPrinting', 'unitTypeSelect'];

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
];

export const TAXES_SEARCH_FIELDS = ['code', 'name', 'typeSelect'];

export const ACCOUNT_MANAGEMENT_SEARCH_FIELDS = ['purchaseTax', 'saleAccount', 'saleTax', 'purchaseAccount', 'typeSelect', 'company'];

export const ACCOUNT_FETCH_FIELDS = ['label', 'id', 'code'];

export const saleAccountDomain = "self.accountType.technicalTypeSelect = 'income'  AND self.statusSelect = 1";
export const purchaseAccountDomain =
  " (self.accountType.technicalTypeSelect = 'charge' OR self.accountType.technicalTypeSelect = 'debt' OR self.accountType.technicalTypeSelect = 'immobilisation') AND self.statusSelect = 1";
export const saleTaxDomain = 'self.typeSelect in (1)';
export const purchaseTaxDomain = 'self.typeSelect in (2)';
export const defaultSaleTaxDomain = "self.typeSelect in (1) and self.code = 'KSA_SRS'";
export const defaultPurchaseTaxDomain = "self.typeSelect in (2)and self.code = 'KSA_SRP'";
export const defaultCurrencyDomain = "self.codeISO = 'SAR'";
export const costTypeOptions = [
  {
    name: 'LBL_PLEASE_SELECT',
    value: '',
  },
  {
    name: 'LBL_MANUAL',
    value: '1',
  },
  {
    name: 'LBL_WEIGHTED_AVERAGE',
    value: '3',
  },
  {
    name: 'LBL_FIFO',
    value: '5',
  },
];
