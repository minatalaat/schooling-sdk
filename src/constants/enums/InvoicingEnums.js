//free-text
export const invoiceTypeEnum = {
  CLASSIC_INVOICE: '1',
  FREE_TEXT: '8',
};

export const poStatusEnum = {
  1: 'LBL_DRAFT',
  2: 'LBL_REQUESTED',
  3: 'LBL_VALIDATED',
  4: 'LBL_FINISHED',
  5: 'LBL_CANCELED',
};

export const poStatusEnEnum = {
  LBL_DRAFT: 'Draft',
  LBL_FINISHED: 'Finished',
  LBL_REQUESTED: 'Requested',
  LBL_VALIDATED: 'Validated',
  LBL_CANCELED: 'Canceled',
};

export const soStatusEnum = {
  1: 'LBL_DRAFT',
  2: 'LBL_DRAFT',
  3: 'LBL_CONFIRMED',
  4: 'LBL_FINISHED',
  5: 'LBL_CANCELED',
};

export const soStatusEnEnum = {
  LBL_DRAFT: 'Draft',
  LBL_FINISHED: 'Finished',
  LBL_REQUESTED: 'Requested',
  LBL_CONFIRMED: 'Confirmed',
  LBL_COMPLETED: 'Completed',
  LBL_CANCELED: 'Canceled',
};

export const customerDocumentTypesOptions = [
  {
    name: 'LBL_PLEASE_SELECT',
    value: '',
  },
  {
    name: 'LBL_CUSTOMER_SALE',
    value: '3',
  },
  {
    name: 'LBL_CUSTOMER_REFUND',
    value: '4',
  },
];

export const supplierDocumentTypesOptions = [
  {
    name: 'LBL_PLEASE_SELECT',
    value: '',
  },
  {
    name: 'LBL_SUPPLIER_INVOICE',
    value: '1',
  },
  {
    name: 'LBL_SUPPLIER_REFUND',
    value: '2',
  },
  {
    name: 'LBL_CUSTOMER_SALE',
    value: '3',
  },
  {
    name: 'LBL_CUSTOMER_REFUND',
    value: '4',
  },
];

export const documentSubTypesOptions = [
  {
    name: 'Please Select',
    value: '',
  },
  {
    name: 'Classic Invoice',
    value: '1',
  },
  {
    name: 'Subscription',
    value: '6',
  },
  {
    name: 'Contract Invoice',
    value: '4',
  },
  {
    name: 'Advance Payment Invoice',
    value: '2',
  },
  {
    name: 'Contract Closing Invoice',
    value: '5',
  },
  {
    name: 'Balance Invoice',
    value: '3',
  },
  {
    name: 'Periodic Contract',
    value: '7',
  },
];

export const zatcaStatusEnum = {
  REPORTED: 'LBL_REPORTED',
  NOT_REPORTED: 'LBL_NOT_REPORTED',
};

export const paymentStatusSelectEnum = {
  1: 'LBL_VALIDATED',
};

export const refundStatusEnum = {
  1: 'LBL_DRAFT',
  2: 'LBL_VALIDATED',
  3: 'LBL_POSTED',
  4: 'LBL_CANCELED',
};

export const unitTypeSelectEnum = {
  0: '',
  1: 'Mass Unit',
  2: 'length Unit',
  3: 'Time Unit',
};

export const invoiceStatusEnum = {
  1: 'Draft',
  2: 'Validated',
  3: 'Posted',
  4: 'Canceled',
};

export const refundDocumentSubTypeEnums = {
  1: 'Classic Invoice',
  8: 'Free Text',
};

export const invoiceOperationTypeSelectEnum = {
  1: 'LBL_SUPPLIER_INVOICE',
  2: 'LBL_SUPPLIER_REFUND',
  3: 'LBL_CUSTOMER_INVOICE',
  4: 'LBL_CUSTOMER_REFUND',
};
