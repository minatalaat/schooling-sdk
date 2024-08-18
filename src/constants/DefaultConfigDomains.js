export const saleAccountDomain = "self.accountType.technicalTypeSelect = 'income'  AND self.statusSelect = 1";
export const purchaseAccountDomain =
  " (self.accountType.technicalTypeSelect = 'charge' OR self.accountType.technicalTypeSelect = 'debt' OR self.accountType.technicalTypeSelect = 'immobilisation') AND self.statusSelect = 1";
export const saleTaxDomain = 'self.typeSelect in (1)';
export const purchaseTaxDomain = 'self.typeSelect in (2)';
export const defaultSaleTaxDomain = "self.typeSelect in (1) and self.code = 'KSA_SRS'";
export const defaultPurchaseTaxDomain = "self.typeSelect in (2)and self.code = 'KSA_SRP'";
export const defaultCurrencyDomain = "self.codeISO = 'SAR'";
export const inPaymentModeDomain = 'self.inOutSelect = 1';
export const outPaymentModeDomain = 'self.inOutSelect = 2';
