export const transactionStatusEnum = {
  BOOKED: {
    label: 'LBL_BOOKED',
    value: 'KSAOB.Booked',
    color: '#51bb25',
  },
  PENDING: {
    label: 'LBL_PENDING',
    value: 'KSAOB.Pending',
    color: '#f8d62b',
  },
  REJECTED: {
    label: 'LBL_REJECTED',
    value: 'KSAOB.Rejected',
    color: '#dc3545',
  },
};

export const transactionPaymentModeEnum = {
  ONLINE: {
    label: 'LBL_ONLINE',
    value: 'KSAOB.Online',
    color: '#51bb25',
  },
  OFFLINE: {
    label: 'LBL_OFFLINE',
    value: 'KSAOB.Offline',
    color: '#f8d62b',
  },
  BATCH: {
    label: 'LBL_BATCH',
    value: 'KSAOB.Batch',
    color: '#dc3545',
  },
};

export const transactionTypeEnum = {
  POS: {
    label: 'LBL_POS',
    value: 'KSAOB.POS',
    color: '#51bb25',
  },
  ECOMMERCE: {
    label: 'LBL_ECOMMERCE',
    value: 'KSAOB.ECommerce',
    color: '#f8d62b',
  },
  ATM: {
    label: 'LBL_ATM',
    value: 'KSAOB.ATM',
    color: '#dc3545',
  },
  BILL_PAYMENTS: {
    label: 'LBL_BILL_PAYMENTS',
    value: 'KSAOB.BillPayments',
    color: '#a927f9',
  },
  LOCAL_BANK_TRANSFER: {
    label: 'LBL_LOCAL_BANK_TRANSFER',
    value: 'KSAOB.LocalBankTransfer',
    color: 'rgb(74 165 150 / 34%)',
  },
  SAME_BANK_TRANSFER: {
    label: 'LBL_SAME_BANK_TRANSFER',
    value: 'KSAOB.SameBankTransfer',
    color: '#fe8a7d',
  },
  INTERNATIONAL_TRANSFER: {
    label: 'LBL_INTERNATIONAL_TRANSFER',
    value: 'KSAOB.InternationalTransfer',
    color: '#4c5667',
  },
  TELLER: {
    label: 'LBL_TELLER',
    value: 'KSAOB.Teller',
    color: '#000',
  },
};

export const transactionInstrumentTypeEnum = {
  APPLE_PAY: {
    label: 'LBL_APPLE_PAY',
    value: 'KSAOB.ApplePay',
    color: '#51bb25',
  },
  MADA_PAY: {
    label: 'LBL_MADA_PAY',
    value: 'KSAOB.madaPay',
    color: '#f8d62b',
  },
  CONTACT_LESS: {
    label: 'LBL_CONTACT_LESS',
    value: 'KSAOB.Contactless',
    color: '#dc3545',
  },
  MAG_STRIPE: {
    label: 'LBL_MAG_STRIPE',
    value: 'KSAOB.MagStripe',
    color: '#a927f9',
  },
  CHIP: {
    label: 'LBL_CHIP',
    value: 'KSAOB.Chip',
    color: 'rgb(74 165 150 / 34%)',
  },
  OTHERS: {
    label: 'LBL_OTHERS',
    value: 'KSAOB.Other',
    color: '#fe8a7d',
  },
};

export const options = {
  rtl: true,
  responsive: true,
  // radius: 70,
  // maintainAspectRatio: true,
  plugins: {
    legend: {
      position: 'bottom',
      responsive: true,
      display: true,
      labels: {
        // This more specific font property overrides the global property
        font: {
          size: 20,
        },
      },
    },
  },
};
