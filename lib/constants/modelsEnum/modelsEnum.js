import Model from './tablesModel';
import { MODELS } from '../models';

import { COLUMNS as unitsModalColumns } from '../../components/table/columns/UnitsColumns';
import { COLUMNS as accountTypesModalColumns } from '../../components/table/columns/AccountTypesColumns';
import { COLUMNS as accountsModalColumns } from '../../components/table/columns/AccountsColumns';
import { COLUMNS as taxesModalColumns } from '../../components/table/columns/TaxesColumns';
import { COLUMNS as companyModalColumns } from '../../components/table/columns/CompanyColumns';
import { COLUMNS as countryModalColumns } from '../../components/table/columns/CountriesColumns';
import { COLUMNS as partnersModalColumns } from '../../components/table/columns/PartnersColums';
import { COLUMNS as currenciesModalColumns } from '../../components/table/columns/CurrenciesColumns';
import { COLUMNS as languagesModalColumns } from '../../components/table/columns/LanguagesColumns';
import { COLUMNS as bankdetailsModalColumns } from '../../components/table/columns/BankDetailsColumns';
import { COLUMNS as journalsModalColumns } from '../../components/table/columns/JournalsColumns';
import { COLUMNS as sequencesModalColumns } from '../../components/table/columns/SequenceColumns';
import { COLUMNS as templatesModalColumns } from '../../components/table/columns/BirtTemplatesColumns';
import { COLUMNS as paymentModesModalColumns } from '../../components/table/columns/PaymentModes';
import { COLUMNS as fileFormatsModalColumns } from '../../components/table/columns/FileFormatColumns';
import { COLUMNS as paymentConditionModalColumns } from '../../components/table/columns/PaymentConditionColumns';
import { COLUMNS as printingSettingsColumns } from '../../components/table/columns/PrintingSettingsColumns';
import { COLUMNS as partnerAddressColumns } from '../../components/table/columns/PartnerAddressColumns';
import { COLUMNS as productsColumns } from '../../components/table/columns/ProductsColumns';
import { COLUMNS as productsWithQuanityColumns } from '../../components/table/columns/ProductsWithQuantityColumns';
import { COLUMNS as taxLinesColumns } from '../../components/table/columns/TaxLinesColumns';
import { COLUMNS as AnalyticJournalsColumns } from '../../components/table/columns/AnalyticJournalColumns';
import { COLUMNS as AnalyticAxisColumns } from '../../components/table/columns/AnalyticAxisColumns';
import { COLUMNS as AnalyticAccountsCOLUMNS } from '../../components/table/columns/AnalyticAccountsColumns';
import { COLUMNS as StockLocationsColumns } from '../../components/table/columns/StockLocationsColumns';
import { COLUMNS as addressColumns } from '../../components/table/columns/AddressColumns';
import { COLUMNS as advancedExportColumns } from '../../components/table/columns/AdvancedExportColumns';
import { COLUMNS as advancedImportColumns } from '../../components/table/columns/AdvancedImportColumns';
import { COLUMNS as stockCorrectionReasonColumns } from '../../components/table/columns/StockCorrectionReasonsColumns';
import { COLUMNS as fixedAssetsColumns } from '../../components/table/columns/FixedAssetsColumns';
import { COLUMNS as costCentersColumns } from '../../components/table/columns/CostCentersColumns';
import { COLUMNS as analyticTemplateColumns } from '../../components/table/columns/AnalyticTemplateColumns';
import { COLUMNS as fixedAssetTypesColumns } from '../../components/table/columns/FixedAssetTypesColumns';
import { COLUMNS as fixedAssetCategoriesColumns } from '../../components/table/columns/FixedAssetCategoriesColumns';
import { COLUMNS as PublicHolidaysPlanningColumns } from '../../components/table/columns/PublicHolidaysPlanningColumns';
import { COLUMNS as WeeklyPlanningColumns } from '../../components/table/columns/WeeklyPlanningColumns';
import { COLUMNS as productFamilyColumns } from '../../components/table/columns/ProductFamilyColumns';
import { COLUMNS as productCategoryColumns } from '../../components/table/columns/ProductCategoryColumns';
import { COLUMNS as employeeColumns } from '../../components/table/columns/EmployeeColumns';
import { COLUMNS as projectColumns } from '../../components/table/columns/ProjectColumns';
import { COLUMNS as taskColumns } from '../../components/table/columns/TaskColumns';
import { COLUMNS as activityColumns } from '../../components/table/columns/ActivityColumns';
import { COLUMNS as timeSheetReminderTemplateColumns } from '../../components/table/columns/TimeSheetReminderTemplateColumns';
import { COLUMNS as EmployeesColumns } from '../../components/table/columns/EmployeesColumns';
import { COLUMNS as DepartmentsColumns } from '../../components/table/columns/DepartmentsColumns';
import { COLUMNS as ContractTypesColumns } from '../../components/table/columns/ContractTypesColumns';
import { COLUMNS as ContractSubTypesColumns } from '../../components/table/columns/ContractSubTypesColumns';
import { COLUMNS as EndOfContractReasonsColumns } from '../../components/table/columns/EndOfContractReasonsColumns';
import { COLUMNS as ContractTemplatesColumns } from '../../components/table/columns/ContractTemplatesColumns';
import { COLUMNS as stockCountColumns } from '../../components/table/columns/StockCountColumns';
import { COLUMNS as barcodeTypeConfigurationsColumns } from '../../components/table/columns/BarcodeTypeConfigurationsColumns';
import { COLUMNS as BICColumns } from '../../components/table/columns/BICColumns';
import { COLUMNS as swiftAddressesColumns } from '../../components/table/columns/SwiftAddressColumns';
import { COLUMNS as userCloumns } from '../../components/table/columns/UsersColumns';
import { COLUMNS as productActivityColumns } from '../../components/table/columns/ProductActivityColumns';
import { COLUMNS as citiesColumns } from '../../components/table/columns/CitiesColumns';
import { COLUMNS as citizenshipsColumns } from '../../components/table/columns/CitizenshipsColumns';
import { COLUMNS as YearsColumns } from '../../components/table/columns/YearsColumns';
import { COLUMNS as PeriodsColumns } from '../../components/table/columns/PeriodsColumns';

export const modelsEnum = {
  // model name, accessor, singular title, plural title, modal columns
  UNITS: new Model(MODELS.UNIT, 'unit', 'LBL_UNIT', 'LBL_UNITS', unitsModalColumns),
  ACCOUNT_TYPES: new Model(MODELS.ACCOUNTTYPE, 'accountType', 'LBL_ACCOUNT_TYPE', 'LBL_ACCOUNT_TYPES', accountTypesModalColumns),
  PARENT_ACCOUNTS: new Model(MODELS.ACCOUNT, 'parentAccount', 'LBL_PARENT_ACCOUNT', 'LBL_ACCOUNTS', accountsModalColumns),
  DEFAULT_TAX: new Model(MODELS.TAXES, 'defaultTax', 'LBL_DEFAULT_TAX', 'LBL_TAXES', taxesModalColumns),
  COMPATIABLE_ACCOUNTS: new Model(MODELS.ACCOUNT, 'compatibleAccountSet', 'LBL_COMPATIABLE_ACCOUNTS', 'LBL_ACCOUNTS', accountsModalColumns),
  PARENT_COMPANY: new Model(MODELS.COMPANY, 'parent', 'LBL_PARENT_COMPANY', 'LBL_COMPANIES', companyModalColumns),
  PARTNERS: new Model(MODELS.PARTNER, 'partner', 'LBL_CUSTOMER_SUPPLIER', 'LBL_CUSTOMERS_SUPPLIERS', partnersModalColumns),
  CUSTOMERS: new Model(MODELS.PARTNER, 'partner', 'LBL_CUSTOMER', 'LBL_CUSTOMERS', partnersModalColumns),
  SUPPLIERS: new Model(MODELS.PARTNER, 'partner', 'LBL_SUPPLIER', 'LBL_SUPPLIER', partnersModalColumns),
  ACCOUNTS: new Model(MODELS.ACCOUNT, 'account', 'LBL_ACCOUNT', 'LBL_ACCOUNTS', accountsModalColumns),
  COMPANIES: new Model(MODELS.COMPANY, 'company', 'LBL_COMPANY', 'LBL_COMPANY', companyModalColumns),
  COUNTRIES: new Model(MODELS.COUNTRY, 'country', 'LBL_COUNTRY', 'LBL_COUNTRIES', countryModalColumns),
  CURRENCIES: new Model(MODELS.CURRENCY, 'currency', 'LBL_CURRENCY', 'LBL_CURRENCIES', currenciesModalColumns),
  LANGUAGES: new Model(MODELS.LANGUAGE, 'language', 'LBL_LANGUAGE', 'LBL_LANGUAGES', languagesModalColumns),
  DEFAULT_BANK_DETAILS: new Model(
    MODELS.BANK_DETAILS,
    'defaultBankDetails',
    'LBL_DEFAULT_BANK_ACCOUNT',
    'BANK_ACCOUNTS',
    bankdetailsModalColumns
  ),
  BANK_DETAILS: new Model(MODELS.BANK_DETAILS, 'bankDetails', 'LBL_BANK_DETAILS', 'BANK_ACCOUNTS', bankdetailsModalColumns),
  JOURNALS: new Model(MODELS.JOURNAL, 'journal', 'LBL_JOURNAL', 'LBL_JOURNALS', journalsModalColumns),
  CASH_ACCOUNTS: new Model(MODELS.ACCOUNT, 'cashAccount', 'LBL_CASH_ACCOUNT', 'LBL_CASH_ACCOUNTS', accountsModalColumns),
  SEQUENCES: new Model(MODELS.SEQUENCE, 'sequence', 'LBL_SEQUENCE', 'LBL_SEQUENCES', sequencesModalColumns),
  IN_PAYMENT_MODES_CUSTOMER: new Model(
    MODELS.PAYMENTMODES,
    'inPaymentMode',
    'LBL_IN_PAYMENT_MODE_CUSTOMER',
    'LBL_IN_PAYMENT_MODE_CUSTOMER',
    paymentModesModalColumns
  ),
  IN_PAYMENT_MODES_SUPPLIER: new Model(
    MODELS.PAYMENTMODES,
    'inPaymentMode',
    'LBL_IN_PAYMENT_MODE_SUPPLIER',
    'LBL_IN_PAYMENT_MODE_SUPPLIER',
    paymentModesModalColumns
  ),

  OUT_PAYMENT_MODES_CUSTOMER: new Model(
    MODELS.PAYMENTMODES,
    'outPaymentMode',
    'LBL_OUT_PAYMENT_MODE_CUSTOMER',
    'LBL_OUT_PAYMENT_MODE_CUSTOMER',
    paymentModesModalColumns
  ),
  OUT_PAYMENT_MODES_SUPPLIER: new Model(
    MODELS.PAYMENTMODES,
    'outPaymentMode',
    'LBL_OUT_PAYMENT_MODE_SUPPLIER',
    'LBL_OUT_PAYMENT_MODE_SUPPLIER',
    paymentModesModalColumns
  ),
  PAYMENT_CONDITIONS: new Model(
    MODELS.PAYMENTCONDITION,
    'paymentCondition',
    'LBL_PAYMENT_CONDITION',
    'LBL_PAYMENT_CONDITIONS',
    paymentConditionModalColumns
  ),
  PL_ACCOUNTS: new Model(MODELS.ACCOUNT, 'plAccounts', 'LBL_PL_ACCOUNTS', 'LBL_ACCOUNTS', accountsModalColumns),
  PERIOD_END_CLOSING_ACCOUNT: new Model(
    MODELS.ACCOUNT,
    'closingAccount',
    'LBL_PERIOD_END_CLOSING_ACCOUNT',
    'LBL_ACCOUNTS',
    accountsModalColumns
  ),
  RETAINED_EARNINGS_ACCOUNT: new Model(
    MODELS.ACCOUNT,
    'retainedAccount',
    'LBL_RETAINED_EARNINGS_ACCOUNT',
    'LBL_ACCOUNTS',
    accountsModalColumns
  ),
  CUSTOMER_ACCOUNTS: new Model(MODELS.ACCOUNT, 'customerAccount', 'LBL_CUSTOMER_ACCOUNT', 'LBL_ACCOUNTS', accountsModalColumns),
  SUPPLIER_ACCOUNTS: new Model(MODELS.ACCOUNT, 'supplierAccount', 'LBL_SUPPLIER_ACCOUNT', 'LBL_ACCOUNTS', accountsModalColumns),
  PRINTING_SETTINGS: new Model(
    MODELS.PRINTING_SETTINGS,
    'printingSettings',
    'LBL_PRINTING_SETTINGS',
    'LBL_PRINTING_SETTINGS',
    printingSettingsColumns
  ),
  SALE_ACCOUNTS: new Model(MODELS.ACCOUNT, 'saleAccount', 'LBL_SALE_ACCOUNT', 'LBL_SALE_ACCOUNTS', accountsModalColumns),
  PURCHASE_ACCOUNTS: new Model(MODELS.ACCOUNT, 'purchaseAccount', 'LBL_PURCHASE_ACCOUNT', 'LBL_PURCHASE_ACCOUNTS', accountsModalColumns),
  PURCHASE_FIXED_ASSET_ACCOUNTS: new Model(
    MODELS.ACCOUNT,
    'purchFixedAssetsAccount',
    'LBL_PURCHASE_FIXED_ASSET_ACCOUNT',
    'LBL_PURCHASE_FIXED_ASSET_ACCOUNT',
    accountsModalColumns
  ),
  SALE_TAXES: new Model(MODELS.TAXES, 'saleTax', 'LBL_SALE_TAX', 'LBL_SALE_TAXES', taxesModalColumns),
  PURCHASE_TAXES: new Model(MODELS.TAXES, 'purchaseTax', 'LBL_PURCHASE_TAX', 'LBL_PURCHASE_TAXES', taxesModalColumns),
  BIRT_TEMPLATES: new Model(
    MODELS.BIRT_TEMPLATE,
    'defaultMailBirtTemplate',
    'LBL_BIRT_TEMPLATE',
    'LBL_BIRT_TEMPLATES',
    templatesModalColumns
  ),
  PAYMENT_MODES: new Model(MODELS.PAYMENTMODES, 'paymentMode', 'LBL_PAYMENT_MODE', 'LBL_PAYMENT_MODES', paymentModesModalColumns),
  FILE_FORMATS: new Model(MODELS.BANK_STATEMENT_FILE_FORMAT, 'fileFormat', 'LBL_FILE_FORMAT', 'LBL_FILE_FORMATS', fileFormatsModalColumns),
  SALE_CURRENCIES: new Model(MODELS.CURRENCY, 'saleCurrency', 'LBL_SALE_CURRENCY', 'LBL_CURRENCIES', currenciesModalColumns),
  PURCHASE_CURRENCIES: new Model(MODELS.CURRENCY, 'purchaseCurrency', 'LBL_PURCHASE_CURRENCY', 'LBL_CURRENCIES', currenciesModalColumns),
  PARTNER_ADDRESS: new Model(MODELS.PARTNER_ADDRESS, 'address', 'LBL_ADDRESS', 'LBL_ADDRESS', partnerAddressColumns),
  PRODUCTS: new Model(MODELS.PRODUCT, 'product', 'LBL_PRODUCT', 'LBL_PRODUCTS', productsColumns),
  PRODUCTS_WITH_QUANTITY: new Model(MODELS.PRODUCT, 'product', 'LBL_PRODUCT', 'LBL_PRODUCTS', productsWithQuanityColumns),
  TAX_LINES: new Model(MODELS.TAXLINE, 'tax', 'LBL_TAX', 'LBL_TAXES', taxLinesColumns),
  ANALYTIC_JOURNALS: new Model(
    MODELS.ANALYTICJOURNAL,
    'analyticJournal',
    'LBL_ANALYTIC_JOURNAL',
    'LBL_ANALYTIC_JOURNAL',
    AnalyticJournalsColumns
  ),
  ANALYTIC_AXIS: new Model(MODELS.ANALYTIC_AXIS, 'axis', 'LBL_AXIS', 'LBL_AXIS', AnalyticAxisColumns),
  ANALYTIC_ACCOUNTS: new Model(
    MODELS.ANALYTICACCOUNT,
    'analyticAccount',
    'LBL_ANALYTIC_ACCOUNT',
    'LBL_ANALYTIC_ACCOUNT',
    AnalyticAccountsCOLUMNS
  ),
  TO_STOCK_LOCATIONS: new Model(
    MODELS.STOCK_LOCATION,
    'stockLocation',
    'LBL_TO_STOCK_LOCATION',
    'LBL_STOCK_LOCATIONS',
    StockLocationsColumns
  ),
  FROM_STOCK_LOCATIONS: new Model(
    MODELS.STOCK_LOCATION,
    'stockLocation',
    'LBL_FROM_STOCK_LOCATION',
    'LBL_STOCK_LOCATIONS',
    StockLocationsColumns
  ),
  STOCK_LOCATIONS: new Model(MODELS.STOCK_LOCATION, 'stockLocation', 'LBL_STOCK_LOCATION', 'LBL_STOCK_LOCATIONS', StockLocationsColumns),
  SUPPLIER_ARRIVALS: new Model(MODELS.STOCK_MOVE, 'stockLocation', 'LBL_SUPPLIER_ARRIVAL', 'LBL_SUPPLIER_ARRIVALS'),
  SUPPLIER_RETURNS: new Model(MODELS.STOCK_MOVE, 'stockLocation', 'LBL_SUPPLIER_RETURN', 'LBL_SUPPLIER_RETURNS'),
  CUSTOMER_DELIVERIES: new Model(MODELS.STOCK_MOVE, 'stockLocation', 'LBL_CUSTOMER_DELIVERY', 'LBL_CUSTOMER_DELIVERIES'),
  CUSTOMER_RETURNS: new Model(MODELS.STOCK_MOVE, 'stockLocation', 'LBL_CUSTOMER_RETURN', 'LBL_CUSTOMER_RETURNS'),
  ADDRESSES: new Model(MODELS.ADDRESS, 'address', 'LBL_ADDRESS', 'LBL_ADDRESSES', addressColumns),
  FROM_ADDRESSES: new Model(MODELS.ADDRESS, 'fromAddress', 'LBL_FROM_ADDRESS', 'LBL_ADDRESSES', addressColumns),
  TO_ADDRESSES: new Model(MODELS.ADDRESS, 'toAddress', 'LBL_TO_ADDRESS', 'LBL_ADDRESSES', addressColumns),
  ADVANCED_EXPORT: new Model(MODELS.ADVANCED_EXPORT, 'exportModel', 'LBL_EXPORT_MODEL', 'LBL_EXPORT_MODEL', advancedExportColumns),
  ADVANCED_IMPORT: new Model(MODELS.ADVANCED_IMPORT, 'importModel', 'LBL_IMPORT_MODEL', 'LBL_IMPORT_MODEL', advancedImportColumns),
  TO_INTERNAL_STOCK_LOCATIONS: new Model(
    MODELS.STOCK_LOCATION,
    'toStockLocation',
    'LBL_TO_STOCK_LOCATION',
    'LBL_STOCK_LOCATIONS',
    StockLocationsColumns
  ),
  TRANSFER_REQUESTS: new Model(MODELS.STOCK_MOVE, 'stockMove', 'LBL_TRANSFER_REQUEST', 'LBL_TRANSFER_REQUESTS'),
  STOCK_TRANSFERS: new Model(MODELS.STOCK_MOVE, 'stockMove', 'LBL_STOCK_TRANSFER', 'LBL_STOCK_TRANSFERS'),
  STOCK_COUNT: new Model(MODELS.INVENTORY, 'stockCount', 'LBL_STOCK_COUNT', 'LBL_STOCK_COUNT', stockCountColumns),
  STOCK_CORRECTION: new Model(MODELS.STOCK_CORRECTION, 'stockCorrection', 'LBL_STOCK_CORRECTION', 'LBL_STOCK_CORRECTION'),
  STOCK_CORRECTION_REASON: new Model(
    MODELS.STOCK_CORRECTION_REASON,
    'stockCorrectionReason',
    'LBL_STOCK_CORRECTION_REASON',
    'LBL_STOCK_CORRECTION_REASON',
    stockCorrectionReasonColumns
  ),
  FINANCIAL_ACCOUNTS: new Model(MODELS.ACCOUNT, 'account', 'LBL_FINANCIAL_ACCOUNT', 'LBL_FINANCIAL_ACCOUNTS'),
  CUSTOMER_INVOICES: new Model(MODELS.INVOICES, 'invoice', 'LBL_CUSTOMER_INVOICE', 'LBL_CUSTOMERS_INVOICES'),
  SUPPLIER_INVOICES: new Model(MODELS.INVOICES, 'invoice', 'LBL_SUPPLIER_INVOICE', 'LBL_SUPPLIERS_INVOICES'),
  CUSTOMER_REFUNDS: new Model(MODELS.INVOICES, 'invoice', 'LBL_CUSTOMER_REFUND', 'LBL_CUSTOMERS_REFUNDS'),
  SUPPLIER_REFUNDS: new Model(MODELS.INVOICES, 'invoice', 'LBL_SUPPLIER_REFUND', 'LBL_SUPPLIERS_REFUNDS'),
  TAXES: new Model(MODELS.TAXES, 'tax', 'LBL_TAX', 'LBL_TAXES'),
  PURCHASE_ORDERS: new Model(MODELS.PURCHASE_ORDER, 'purchaseOrder', 'LBL_PURCHASE_ORDER', 'LBL_PURCHASE_ORDERS'),
  SALE_ORDERS: new Model(MODELS.SALE_ORDER, 'saleOrder', 'LBL_SALE_ORDER', 'LBL_SALE_ORDERS'),
  JOURNAL_ENTRIES: new Model(MODELS.MOVE, 'move', 'LBL_JOURNAL_ENTRY', 'LBL_JOURNAL_ENTRIES'),
  JOURNAL_TYPES: new Model(MODELS.JOURNALTYPES, 'move', 'LBL_JOURNAL_TYPE', 'LBL_JOURNALTYPES'),
  TRANSACTIONS: new Model(MODELS.MOVELINE, 'transaction', 'LBL_TRANSACTION', 'LBL_TRANSACTIONS'),
  BANK_RECONCILIATIONS: new Model(MODELS.BANK_RECONCILIATION, 'bankReconciliation', 'LBL_BANK_RECONCILIATION', 'LBL_BANK_RECONCILIATIONS'),
  BANK_STATEMENTS: new Model(MODELS.BANK_STATEMENT, 'bankStatement', 'LBL_BANK_STATEMENT', 'LBL_BANK_STATEMENTS'),
  USERS: new Model(MODELS.USER, 'user', 'LBL_USER', 'LBL_USERS', userCloumns),
  COST_CENTERS: new Model(MODELS.ANALYTICACCOUNT, 'costCenter', 'LBL_ANALYTIC_ACCOUNT', 'LBL_ANALYTIC_ACCOUNT', AnalyticAccountsCOLUMNS),
  FISCAL_YEARS: new Model(MODELS.FISCALYEAR, 'fiscalYear', 'LBL_FISCAL_YEAR', 'LBL_FISCAL_YEARS'),
  FIXED_ASSETS: new Model(MODELS.FIXED_ASSET, 'fixedAsset', 'LBL_FIXED_ASSET', 'LBL_FIXED_ASSET', fixedAssetsColumns),
  TRANSFER_LOCATION_TO: new Model(
    MODELS.STOCK_LOCATION,
    'newLocation',
    'LBL_TRANSFER_LOCATION_TO',
    'LBL_STOCK_LOCATIONS',
    StockLocationsColumns
  ),
  TRANSFER_LOCATION_CURRENT: new Model(MODELS.STOCK_LOCATION, 'currentLocation', 'LBL_CURRENT_LOCATION', 'LBL_CURRENT_LOCATION'),
  TRANSFER_COST_CENTER_TO: new Model(
    MODELS.ANALYTICDISTRIBUTION,
    'newCostCenter',
    'LBL_TRANSFER_COST_CENTER_TO',
    'LBL_COST_CENTERS',
    costCentersColumns
  ),
  TRANSFER_COST_CENTER_CURRENT: new Model(
    MODELS.ANALYTICDISTRIBUTION,
    'currentCostCenter',
    'LBL_CURRENT_COST_CENTER',
    'LBL_CURRENT_COST_CENTER'
  ),
  FIXED_ASSET_CATEGORY: new Model(
    MODELS.FIXED_ASSET_CATEGORY,
    'fixedAssetCategory',
    'LBL_FIXED_ASSET_CATEGORY',
    'LBL_FIXED_ASSET_CATEGORY',
    fixedAssetCategoriesColumns
  ),
  ANALYTIC_DISTRIBUTION_TEMPLATE: new Model(
    MODELS.ANALYTICDISTRIBUTION,
    'analyticDistributionTemplate',
    'LBL_ANALYTIC_DISTRIBUTION_TEMPLATE',
    'LBL_ANALYTIC_DISTRIBUTION_TEMPLATE',
    analyticTemplateColumns
  ),
  FIXED_ASSET_TYPES: new Model(
    MODELS.FIXED_ASSET_TYPE,
    'fixedAssetType',
    'LBL_FIXED_ASSET_TYPE',
    'LBL_FIXED_ASSET_TYPES',
    fixedAssetTypesColumns
  ),
  FIXED_ASSET_CATEGORIES: new Model(
    MODELS.FIXED_ASSET_CATEGORY,
    'fixedAssetCategory',
    'LBL_FIXED_ASSET_CATEGORY',
    'LBL_FIXED_ASSET_CATEGORIES',
    fixedAssetCategoriesColumns
  ),
  CATEGORIES: new Model(MODELS.FIXED_ASSET_CATEGORY, 'fixedAssetCategory', 'LBL_CATEGORY', 'LBL_CATEGORIES', fixedAssetCategoriesColumns),
  CHARGE_ACCOUNTS: new Model(MODELS.ACCOUNT, 'chargeAccount', 'LBL_DEPRECIATION_ACCOUNT', 'LBL_ACCOUNTS', accountsModalColumns),
  DEPRECIATION_ACCOUNTS: new Model(
    MODELS.ACCOUNT,
    'depreciationAccount',
    'LBL_ACC_DEPRECIATION_ACCOUNT',
    'LBL_ACCOUNTS',
    accountsModalColumns
  ),
  DEBT_RECEIVABLE_ACCOUNTS: new Model(
    MODELS.ACCOUNT,
    'debtReceivableAccount',
    'LBL_DEBT_RECEIVABLE_ACCOUNT',
    'LBL_ACCOUNTS',
    accountsModalColumns
  ),
  REALIZED_ASSETS_VALUE_ACCOUNTS: new Model(
    MODELS.ACCOUNT,
    'realisedAssetsValueAccount',
    'LBL_REALIZED_ASSETS_VALUE_ACCOUNT',
    'LBL_ACCOUNTS',
    accountsModalColumns
  ),
  REALIZED_ASSETS_INCOME_ACCOUNTS: new Model(
    MODELS.ACCOUNT,
    'realisedAssetsIncomeAccount',
    'LBL_REALIZED_ASSETS_INCOME_ACCOUNT',
    'LBL_ACCOUNTS',
    accountsModalColumns
  ),
  WEEKLY_PLANNING: new Model(MODELS.WEEKLY_PLANNING, 'weeklyPlanning', 'LBL_WEEKLY_PLANNING', 'LBL_WEEKLY_PLANNING', WeeklyPlanningColumns),
  PUBLIC_HOLIDAYS_PLAN: new Model(
    MODELS.EVENTS_PLANNING,
    'publicHolidayEventsPlanning',
    'LBL_PUBLIC_HOLIDAYS_PLAN',
    'LBL_PUBLIC_HOLIDAYS_PLANS',
    PublicHolidaysPlanningColumns
  ),
  END_OF_CONTRACT_REASONS: new Model(
    MODELS.END_OF_CONTRACT_REASON,
    'reason',
    'LBL_END_OF_CONTRACT_REASON',
    'LBL_END_OF_CONTRACT_REASONS',
    EndOfContractReasonsColumns
  ),
  EMPLOYMENT_CONTRACT_TYPES: new Model(
    MODELS.EMPLOYMENT_CONTRACT_TYPE,
    'contractType',
    'LBL_EMPLOYMENT_CONTRACT_TYPE',
    'LBL_EMPLOYMENT_CONTRACT_TYPES',
    ContractTypesColumns
  ),
  EMPLOYMENT_CONTRACTS: new Model(MODELS.EMPLOYMENT_CONTRACT, 'contract', 'LBL_EMPLOYMENT_CONTRACT', 'LBL_EMPLOYMENT_CONTRACTS'),
  EMPLOYEES_CONTRACTS: new Model(MODELS.EMPLOYEE, 'employee', 'LBL_EMPLOYEE', 'LBL_EMPLOYEES', EmployeesColumns),
  PAY_COMPANIES: new Model(MODELS.COMPANY, 'payCompany', 'LBL_PAY_COMPANY', 'LBL_COMPANIES', companyModalColumns),
  COMPANY_DEPARTMENTS: new Model(
    MODELS.COMPANY_DEPARTMENT,
    'companyDepartment',
    'LBL_COMPANY_DEPARTMENT',
    'LBL_COMPANY_DEPARTMENTS',
    DepartmentsColumns
  ),
  EMPLOYMENT_CONTRACT_SUBTYPES: new Model(
    MODELS.EMPLOYMENT_CONTRACT_SUBTYPE,
    'employmentContractSubType',
    'LBL_CONTRACT_SUBTYPE',
    'LBL_CONTRACT_SUBTYPES',
    ContractSubTypesColumns
  ),
  EMPLOYMENT_CONTRACT_TEMPLATES: new Model(
    MODELS.EMPLOYMENT_CONTRACT_TEMPLATE,
    'employmentContractTemplate',
    'LBL_EMPLOYMENT_CONTRACT_TEMPLATE',
    'LBL_CONTRACT_TEMPLATES',
    ContractTemplatesColumns
  ),
  LEAVE_REASONS: new Model(MODELS.LEAVE_REASON, 'leaveReason', 'LBL_LEAVE_REASON', 'LBL_LEAVE_REASONS'),
  PRODUCT_ACTIVITY: new Model(MODELS.PRODUCT, 'productaAtivity', 'LBL_PRODUCT_ACTIVITY', 'LBL_PRODUCT_ACTIVITY'),
  ACCOUNTING_FAMILY: new Model(
    MODELS.PRODUCT_FAMILY,
    'productFamily',
    'LBL_ACCOUNTING_FAMILY',
    'LBL_ACCOUNTING_FAMILY',
    productFamilyColumns
  ),
  PRODUCT_CATEGORY: new Model(
    MODELS.PRODUCT_CATEGORY,
    'productCategory',
    'LBL_PRODUCT_CATEGORY',
    'LBL_PRODUCT_CATEGORY',
    productCategoryColumns
  ),
  TIMESHEET: new Model(MODELS.TIMESHEET, 'timesheet', 'LBL_TIMESHEET', 'LBL_TIMESHEET'),
  EMPLOYEES: new Model(MODELS.EMPLOYEE, 'employee', 'LBL_EMPLOYEE', 'LBL_EMPLOYEE', employeeColumns),
  PROJECT: new Model(MODELS.PROJECT, 'project', 'LBL_PROJECT', 'LBL_PROJECT', projectColumns),
  TASK: new Model(MODELS.TASK, 'projectTask', 'LBL_TASK', 'LBL_TASK', taskColumns),
  ACTIVITY: new Model(MODELS.PRODUCT, 'product', 'LBL_ACTIVITY', 'LBL_ACTIVITY', activityColumns),
  TIMESHEET_REMINDER_TEMPLATE: new Model(
    MODELS.TEMPLATE_MODEL,
    'timesheetReminderTemplate',
    'LBL_TIMESHEET_REMINDER_TEMPLATE',
    'LBL_TIMESHEET_REMINDER_TEMPLATE',
    timeSheetReminderTemplateColumns
  ),
  BARCODE_TYPE_CONFIGURATIONS: new Model(
    MODELS.BARCODE_TYPE_CONFIG,
    'barcodeTypeConfig',
    'LBL_BARCODE_TYPE_CONFIGURATION',
    'LBL_BARCODE_TYPE_CONFIGURATIONS',
    barcodeTypeConfigurationsColumns
  ),
  BIC: new Model(MODELS.BANK, 'bic', 'LBL_BIC_IDENTIFIER', 'LBL_BANK_IDENTIFIER_CODES', BICColumns),
  BANK_ACCOUNTING_ACCOUNTS: new Model(MODELS.ACCOUNT, 'bankAccount', 'LBL_ACCOUNT', 'LBL_ACCOUNTS', accountsModalColumns),
  SWIFT_ADDRESSES: new Model(MODELS.BANK_ADDRESS, 'bankAddress', 'LBL_SWIFT_ADDRESS', 'LBL_ADDRESSES', swiftAddressesColumns),
  PERIODS: new Model(MODELS.PERIOD, 'period', 'LBL_PERIOD', 'LBL_PERIODS', PeriodsColumns),
  EMPLOYEE_MASTER_DATA: new Model(MODELS.EMPLOYEE, 'Employee Data', 'LBL_DATA_EMPLOYEE_MASTER', 'LBL_DATA_EMPLOYEES_MASTER'),
  COUNTRY_OF_BIRTH: new Model(MODELS.COUNTRY, 'countryOfBirth', 'LBL_COUNTRY_OF_BIRTH', 'LBL_COUNTRIES', countryModalColumns),
  MANAGER_USERS: new Model(MODELS.USER, 'managerUser', 'LBL_THE_MANAGER', 'LBL_USERS', userCloumns),
  IMPOSED_HOLIDAYS_PLAN: new Model(
    MODELS.EVENTS_PLANNING,
    'imposedDayEventsPlanning',
    'LBL_IMPOSED_HOLIDAYS_PLAN',
    'LBL_IMPOSED_HOLIDAYS_PLANS',
    PublicHolidaysPlanningColumns
  ),
  DEFAULT_ACTIVITY_PRODUCT: new Model(MODELS.PRODUCT, 'product', 'LBL_DEFAULT_PRODUCT_ACTIVITY', 'LBL_PRODUCTS', productActivityColumns),
  DEPARTMENT_OF_BIRTH: new Model(MODELS.DEPARTMENT, 'departmentOfBirth', 'LBL_DEPARTMENT_OF_BIRTH', 'LBL_DEPARTMENTS', DepartmentsColumns),
  CITY_OF_BIRTH: new Model(MODELS.CITY, 'cityOfBirth', 'LBL_CITY_OF_BIRTH', 'LBL_CITIES', citiesColumns),
  CITIZENSHIP: new Model(MODELS.CITIZENSHIP, 'citizenship', 'LBL_CITIZENSHIP', 'LBL_NATIONALITIES', citizenshipsColumns),
  INVOICE_PAYMENT: new Model(MODELS.INVOICE_PAYMENT),
  DEPRECIATIONS: new Model(MODELS.FIXED_ASSET_LINE),
  INVENTORY_ACCOUNTS: new Model(MODELS.ACCOUNT, 'defaultInventoryAccount', 'LBL_INVENTORY_ACCOUNT', 'LBL_ACCOUNTS', accountsModalColumns),
  COST_OF_GOOD_SOLD_ACCOUNTS: new Model(
    MODELS.ACCOUNT,
    'defaultCostOfGoodSoldAccount',
    'LBL_COST_OF_GOOD_SOLD_ACCOUNT',
    'LBL_ACCOUNTS',
    accountsModalColumns
  ),
  DEFAULT_PURCHASE_ACCOUNTS: new Model(
    MODELS.ACCOUNT,
    'defaultPurchaseAccount',
    'LBL_PURCHASE_ACCOUNT',
    'LBL_PURCHASE_ACCOUNTS',
    accountsModalColumns
  ),
  DEFAULT_SALE_ACCOUNTS: new Model(MODELS.ACCOUNT, 'defaultSaleAccount', 'LBL_SALE_ACCOUNT', 'LBL_SALE_ACCOUNTS', accountsModalColumns),
  DEFAULT_PURCHASE_GAIN_LOSS_ACCOUNTS: new Model(
    MODELS.ACCOUNT,
    'defaultPurchaseGainLossAccount',
    'LBL_PURCHASE_GAIN_LOSS_ACCOUNT',
    'LBL_ACCOUNTS',
    accountsModalColumns
  ),
  DEFAULT_INVENTORY_VARIANCE_ACCOUNT: new Model(
    MODELS.ACCOUNT,
    'defaultInventoryVarianceAccount',
    'LBL_INVENTORY_VARIANCE_ACCOUNT',
    'LBL_ACCOUNTS',
    accountsModalColumns
  ),
  YEARS: new Model(MODELS.FISCALYEAR, 'year', 'LBL_YEAR', 'LBL_YEARS', YearsColumns),
  CITY: new Model(MODELS.CITY, 'city', 'LBL_CITY', 'LBL_CITIES', citiesColumns),
  IN_PAYMENT_MODES: new Model(
    MODELS.PAYMENTMODES,
    'inPaymentMode',
    'LBL_IN_PAYMENT_MODE',
    'LBL_IN_PAYMENT_MODES',
    paymentModesModalColumns
  ),
  OUT_PAYMENT_MODES: new Model(
    MODELS.PAYMENTMODES,
    'outPaymentMode',
    'LBL_OUT_PAYMENT_MODE',
    'LBL_OUT_PAYMENT_MODES',
    paymentModesModalColumns
  ),
  CUSTOMER_ADDRESS: new Model(MODELS.ADDRESS, 'customerAddress', 'LBL_CUSTOMER_ADDRESS', 'LBL_ADDRESSES', addressColumns),
  SUPPLIER_ADDRESS: new Model(MODELS.ADDRESS, 'supplierAddress', 'LBL_SUPPLIER_ADDRESS', 'LBL_ADDRESSES', addressColumns),
};
