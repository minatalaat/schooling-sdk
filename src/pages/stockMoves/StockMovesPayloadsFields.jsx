export const STOCK_MOVES_SEARCH_FIELDS = [
  'tradingName',
  'origin',
  'estimatedDate',
  'supplierShipmentRef',
  'stockMoveSeq',
  'typeSelect',
  'statusSelect',
  'toAddressStr',
  'partner',
  'toStockLocation',
  'fromAddressStr',
  'company',
  'realDate',
  'fromStockLocation',
  'availableStatusSelect',
  'invoicingStatusSelect',
  'isReversion',
  'reversionOriginStockMove',
  'reversionOriginStockMove.id',
];

export const STOCK_MOVES_FETCH_FIELDS = [
  'grossMass',
  'invoiceSet',
  'numOfPalettes',
  'availabilityRequest',
  'isNeedingConformityCertificate',
  'estimatedDate',
  'carrierPartner',
  'modeOfTransport',
  'typeSelect',
  'toAddress',
  'pickingEditDate',
  'realStockMoveMessageTemplate',
  'toAddressStr',
  'invoiceBlockingReason',
  'deliveryCondition',
  'availableStatusSelect',
  'trackingNumber',
  'freightCarrierMode',
  'toStockLocation.typeSelect',
  'filterOnAvailableProducts',
  'invoicedPartner',
  'groupProductsOnPrintings',
  'invoicingStatusSelect',
  'invoiceBlocking',
  'isWithReturnSurplus',
  'company.accountConfig.isManagePassedForPayment',
  'electronicSignature',
  'incoterm',
  'isReversion',
  'fromAddressStr',
  'pfpValidateStatusSelect',
  'plannedStockMoveMessageTemplate',
  'plannedStockMoveAutomaticMail',
  'fullySpreadOverLogisticalFormsFlag',
  'invoiceBlockedToDate',
  'note',
  'supplierShipmentDate',
  'backorderId',
  'conformitySelect',
  'supplierShipmentRef',
  'forwarderPartner',
  'originId',
  'printingSettings',
  'toStockLocation',
  'isIspmRequired',
  'company',
  'fromAddress',
  'cancelReason',
  'signatoryUser',
  'realDate',
  'tradingName',
  'fromStockLocation',
  'invoiceBlockedByUser',
  'originTypeSelect',
  'stockMoveSeq',
  'exTaxTotal',
  'shipmentMode',
  'reversionOriginStockMove',
  'stockMoveLineList',
  'pickingIsEdited',
  'numOfPackages',
  'statusSelect',
  'company.accountConfig',
  'partner',
  'isWithBackorder',
  'isConformityCertifSigned',
  'pickingOrderComments',
  'realStockMoveAutomaticMail',
];

export const STOCK_MOVE_LINES_SEARCH_FIELDS = [
  'productModel',
  'conformitySelect',
  'product.productTypeSelect',
  'productName',
  'realQty',
  'requestedReservedQty',
  'stockMove',
  'trackingNumber',
  'wapPrice',
  'product.trackingNumberConfiguration.isPurchaseTrackingManaged',
  'product',
  'stockMove.pickingIsEdited',
  'saleOrderLine',
  'unitPriceUntaxed',
  'companyUnitPriceUntaxed',
  'lineTypeSelect',
  'reservedQty',
  'stockMove.toStockLocation.typeSelect',
  'purchaseOrderLine',
  'stockMove.fromStockLocation.typeSelect',
  'product.trackingNumberConfiguration.isProductionTrackingManaged',
  'qtyInvoiced',
  'unit',
  'availableStatus',
  'product.trackingNumberConfiguration.isSaleTrackingManaged',
  'qty',
  'stockMove.typeSelect',
  'unitPriceTaxed',
  'stockMove.statusSelect',
  'netMass',
  'sequence',
  'companyPurchasePrice',
  'description',
];

export const INVOICES_SEARCH_FIELDS = [
  'tradingName',
  'paymentDelay',
  'inTaxTotal',
  'operationSubTypeSelect',
  'dueDate',
  'exTaxTotal',
  'invoiceDate',
  'debtRecoveryBlockingOk',
  'statusSelect',
  'partner',
  'amountRemaining',
  'invoiceId',
  'company',
  'currency',
  'operationTypeSelect',
];
