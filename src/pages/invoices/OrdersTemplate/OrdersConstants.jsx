export const SEARCH_FIELDS = [
  'externalReference',
  'statusSelect',
  'inTaxTotal',
  'exTaxTotal',
  'supplierPartner',
  'stockLocation',
  'purchaseOrderSeq',
  'buyerUser',
  'company',
  'orderDate',
  'currency',
  'amountInvoiced',
  'tradingName',
  'orderBeingEdited',
  'saleOrderSeq',
  'deliveryState',
  'amountRemaining',
  'confirmationDateTime',
  'salespersonUser',
  'clientPartner',
  'endOfValidityDate',
];
export const soStatusEnum = {
  1: 'LBL_DRAFT',
  2: 'LBL_DRAFT',
  3: 'LBL_CONFIRMED',
  4: 'LBL_FINISHED',
  5: 'LBL_CANCELED',
};
export const poStatusEnum = {
  1: 'LBL_DRAFT',
  2: 'LBL_REQUESTED',
  3: 'LBL_VALIDATED',
  4: 'LBL_FINISHED',
  5: 'LBL_CANCELED',
};

export const ORDER_STATUS = [
  { id: 0, status: '' },
  { id: 1, status: 'Draft', label: 'LBL_DRAFT' },
  { id: 2, status: 'Requested', label: 'LBL_REQUESTED' },
  { id: 3, status: 'Confirmed', label: 'LBL_CONFIRMED' },
  { id: 4, status: 'Finished', label: 'LBL_FINISHED' },
  { id: 5, status: 'Canceled', label: 'LBL_CANCELED' },
];

export const FETCH_FIELDS = [
  'carrierPartner',
  'expectedRealisationDate',
  'periodicityTypeSelect',
  'mainInvoicingAddressStr',
  'deliveryCondition',
  'deliveryAddress',
  'nextInvoicingEndPeriodDate',
  'invoicedPartner',
  'groupProductsOnPrintings',
  'taxNumber',
  'opportunity',
  'attrs',
  'externalReference',
  'clientPartner.saleOrderInformation',
  'deliveredPartner',
  'currentContractPeriodEndDate',
  'confirmationDateTime',
  'saleOrderSeq',
  'stockLocation',
  'stockLocation.address',
  'computationDate',
  'advancePaymentList',
  'createdByInterco',
  'numberOfPeriods',
  'proformaComments',
  'contractPeriodInMonths',
  'company.currency',
  'timetableList',
  'cancelReasonStr',
  'isIspmRequired',
  'currency',
  'contactPartner',
  'deliveryDate',
  'cancelReason',
  'tradingName',
  'totalCostPrice',
  'lastReminderDate',
  'toInvoiceViaTask',
  'blockedOnCustCreditExceed',
  'subscriptionComment',
  'hideDiscount',
  'team',
  'statusSelect',
  'companyBankDetails',
  'standardDelay',
  'specificNotes',
  'manualUnblock',
  'pickingOrderComments',
  'internalNote',
  'fiscalPosition',
  'saleOrderLineTaxList',
  'orderNumber',
  'isNeedingConformityCertificate',
  'taxTotal',
  'advanceTotal',
  'project',
  'totalGrossMargin',
  'oneoffSale',
  'noticePeriodInDays',
  'productionNote',
  'invoiceComments',
  'freightCarrierMode',
  'company.tradingNameSet',
  'isTacitAgreement',
  'inTaxTotal',
  'orderBeingEdited',
  'markup',
  'contractStartDate',
  'subscriptionText',
  'nextInvoicingDate',
  'creationDate',
  'advancePaymentAmountNeeded',
  'mainInvoicingAddress',
  'saleOrderLineList',
  'clientPartner',
  'clientPartner.name',
  'saleOrderTypeSelect',
  'incoterm',
  'orderDate',
  'endOfValidityDate',
  'timetableTemplate',
  'amountToBeSpreadOverTheTimetable',
  'currency.symbol',
  'description',
  'forwarderPartner',
  'inAti',
  'priceList',
  'duration',
  'marginRate',
  'printingSettings',
  'toStockLocation',
  'directOrderLocation',
  'company',
  'deliveryAddressStr',
  'shipmentDate',
  'nextInvoicingStartPeriodDate',
  'accountedRevenue',
  'lastReminderComments',
  'specificPackage',
  'paymentMode',
  'paymentCondition',
  'contractEndDate',
  'exTaxTotal',
  'shipmentMode',
  'salespersonUser',
  'versionNumber',
  'amountInvoiced',
  'confirmedByUser',
  'advancePaymentNeeded',
  'deliveryState',
  'clientPartner.mobilePhone',
  'clientPartner.emailAddress.address',
  'clientPartner.partnerSeq',
  'clientPartner.taxNbr',
  'interco',
  'deliveryComments',
  'purchaseOrderSeq',
  'supplierPartner',
  'supplierPartner.mobilePhone',
  'supplierPartner.emailAddress.address',
  'supplierPartner.partnerSeq',
  'supplierPartner.taxNbr',
  'purchaseOrderLineList',
];

export const LINES_FIELDS = [
  'inTaxTotal',
  'reservedQty',
  'estimatedDelivDate',
  'typeSelect',
  'exTaxTotal',
  'inTaxPrice',
  'product.productTypeSelect',
  'productName',
  'saleOrder.orderBeingEdited',
  'sequence',
  'product',
  'unit',
  'availableStatus',
  'priceDiscounted',
  'deliveryState',
  'product.code',
  'qty',
  'price',
  'saleOrder.statusSelect',
  'taxLine',
  'taxLine.value',
  'taxRate',
  'analyticMoveLineList',
  'companyExTaxTotal',
  'discountAmount',
  'discountTypeSelect',
  'fixedAssets',
  'inTaxTotal',
  'budgetDistributionSumAmount',
  'exTaxTotal',
  'inTaxPrice',
  'companyInTaxTotal',
  'fixedAssets',
  'inTaxTotal',
  'budgetDistributionSumAmount',
  'exTaxTotal',
  'inTaxPrice',
  'account.analyticDistributionAuthorized',
  'taxEquiv',
  'productCode',
  'account',
  'description',
  'analyticDistributionTemplate',
  'fixedAssetCategory',
  'selected',
];
