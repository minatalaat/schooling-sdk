export const BIC_FIELDS = [
  'code',
  'branchIdentifier',
  'country',
  'country.alpha2Code',
  'bankName',
  'businessPartyPrefix',
  'businessPartySuffix',
  'bankDetailsTypeSelect',
  'fullName',
];
export const SWIFT_ADD_FIELDS = ['bank', 'code', 'address', 'label', 'fullAddress'];
export const RELATED_FIELDS = ['code', 'address', 'label', 'fullAddress'];
export const PARTNER_FIELDS = ['id', 'fullName'];

export const ACCOUNTS_FIELDS = ['code', 'name', 'id', 'label'];

export const CURRENCY_FIELDS = ['id', 'name', 'codeISO'];

export const BANK_FIELDS = [
  'code',
  'branchIdentifier',
  'bankAddressList',
  'bankDetailsTypeSelect',
  'fullName',
  'country.alpha2Code',
  'bankName',
];

export const FETCH_ACCOUNT_FIELDS = ['label', 'code'];

export const BANK_DETAILS_FIELDS = [
  'bank.code',
  'ownerName',
  'iban',
  'active',
  'bankAddress',
  'bankAccount',
  'code',
  'label',
  'partner',
  'journal',
  'bank.bankDetailsTypeSelect',
  'bank',
  'bank.country',
  'bank.country.alpha2Code',
  'company',
  'currency',
  'balance',
];
