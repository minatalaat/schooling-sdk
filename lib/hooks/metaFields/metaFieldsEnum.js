import { MODELS } from '../../constants/models';

export const MetaFieldsEnum = [
  {
    selection: 'unit.unit.type.select',
    name: 'unitTypeSelect',
    type: 'INTEGER',
    model: MODELS.UNIT,
    list: [
      {
        value: '1',
        title: 'Mass unit',
        label: 'LBL_MASS_UNIT',
      },
      {
        value: '2',
        title: 'Length unit',
        label: 'LBL_LENGTH_UNIT',
      },
      {
        value: '3',
        title: 'Time unit',
        label: 'LBL_TIME_UNIT',
      },
    ],
  },
  {
    selection: 'hr.leave.reason.unit.select',
    name: 'unitSelect',
    model: MODELS.LEAVE_REASON,
    type: 'INTEGER',
    list: [
      {
        value: '1',
        title: 'Days',
        label: 'LBL_DAYS',
      },
      {
        value: '2',
        title: 'Hours',
        label: 'LBL_HOURS',
      },
    ],
  },
  {
    selection: 'appTimeSheet.invoicingTypeLogTimesSelect',
    name: 'invoicingTypeLogTimesSelect',
    model: MODELS.APP_TIMESHEET,
    list: [
      {
        value: '1',
        title: 'Use Line Activity',
        label: 'LBL_USE_LINE_ACTIVITY',
      },
      {
        value: '2',
        title: 'Use Empliyee Activity',
        label: 'LBL_USE_EMPLOYEE_ACTIVITY',
      },
    ],
  },

  {
    selection: 'appTimeSheet.timeSheetDefaultEndDateFormat',
    name: 'defaultEndFormat',
    model: MODELS.APP_TIMESHEET,
    list: [
      {
        value: '0',
        title: 'none',
        label: 'LBL_NONE',
      },
      {
        value: '1',
        title: 'End Of Week',
        label: 'LBL_END_OF_WEEK',
      },
      {
        value: '2',
        title: 'End Of Month',
        label: 'LBL_END_OF_MONTH',
      },
    ],
  },
  {
    selection: 'account.tax.type.select',
    name: 'typeSelect',
    type: 'INTEGER',
    list: [
      {
        value: '1',
        title: 'Collection',
        label: 'LBL_COLLECTION',
      },
      {
        value: '2',
        title: 'Debit',
        label: 'LBL_DEBIT_TAX_TYPE',
      },
    ],
  },
  {
    selection: 'hr.employee.marital.status',
    name: 'maritalStatus',
    model: MODELS.EMPLOYEE,
    type: 'INTEGER',
    list: [
      {
        value: '1',
        title: 'Married',
        label: 'LBL_MARRIED',
      },
      {
        value: '2',
        title: 'Single',
        label: 'LBL_SINGLE',
      },
    ],
  },
  {
    selection: 'stock.stock.location.type.select',
    name: 'typeSelect',
    type: 'INTEGER',
    list: [
      {
        value: '1',
        title: 'Internal',
        label: 'LBL_INTERNAL',
      },
      {
        value: '2',
        title: 'External',
        label: 'LBL_EXTERNAL',
      },
      {
        value: '3',
        title: 'Virtual',
        label: 'LBL_VIRTUAL',
      },
    ],
  },
  {
    selection: 'employee.hr.sex.select',
    name: 'sexSelect',
    model: MODELS.EMPLOYEE,
    type: 'STRING',
    list: [
      {
        value: 'F',
        title: 'F',
        label: 'LBL_FEMALE',
      },
      {
        value: 'M',
        title: 'M',
        label: 'LBL_MALE',
      },
    ],
  },
  {
    selection: 'hr.employment.contract.executiveStatus.select',
    name: 'executiveStatusSelect',
    model: MODELS.EMPLOYEE,
    type: 'INTEGER',
    list: [
      {
        value: '1',
        title: 'Executive',
        label: 'LBL_EXECUTIVE',
      },
      {
        value: '2',
        title: 'Non-Executive',
        label: 'LBL_NON_EXECUTIVE',
      },
    ],
  },
  {
    selection: 'stock.move.type.select',
    name: 'stockMove.typeSelect',
    type: 'INTEGER',
    selectionList: [
      {
        value: '1',
        title: 'Internal move',
        label: 'LBL_INTERNAL_MOVE',
      },
      {
        value: '2',
        title: 'Outgoing move',
        label: 'LBL_OUTGOING_MOVE',
      },
      {
        value: '3',
        title: 'Incoming move',
        label: 'LBL_INCOMING_MOVE',
      },
    ],
  },
  {
    selection: 'account.payment.condition.type.select',
    name: 'typeSelect',
    type: 'INTEGER',
    list: [
      {
        value: '1',
        title: 'Net',
        label: 'NET',
      },
      {
        value: '2',
        title: 'End of month + n days / month',
        label: 'END_OF_MONTH_N_DAYS',
      },
      {
        value: '3',
        title: 'N days / month + end of month',
        label: 'N_DAYS_MONTH_END_OF_MONTH',
      },
      {
        value: '4',
        title: 'N days / month + end of month at',
        label: 'N_DAYS_MONTH_END_OF_MONTH_AT',
      },
    ],
  },
  {
    selection: 'product.product.type.select',
    name: 'productTypeSelect',
    type: 'STRING',
    list: [
      {
        value: 'service',
        title: 'Service',
        label: 'LBL_SERVICE',
      },
      {
        value: 'storable',
        title: 'Product',
        label: 'LBL_PRODUCT_AR',
      },
    ],
  },
  {
    selection: 'account.fixed.asset.technical.type.select',
    name: 'technicalTypeSelect',
    type: 'INTEGER',
    list: [
      {
        value: '2',
        title: 'Tangible asset',
        label: 'LBL_TANGIBLE_ASSET',
      },
      {
        value: '3',
        title: 'Intangible asset',
        label: 'LBL_INTANGIBLE_ASSET',
      },
    ],
  },
  {
    selection: 'printing.setting.address.position',
    name: 'addressPositionSelect',
    type: 'INTEGER',
    list: [
      {
        value: '0',
        title: 'Right',
        label: 'LBL_RIGHT',
      },
      {
        value: '1',
        title: 'Left',
        label: 'LBL_LEFT',
      },
    ],
  },
  {
    selection: 'hrs.timesheet.status.select',
    name: 'statusSelect',
    type: 'INTEGER',
    model: MODELS.TIMESHEET,
    list: [
      {
        value: '1',
        title: 'Draft',
        label: 'LBL_DRAFT',
      },
      {
        value: '2',
        title: 'Waiting validation',
        label: 'LBL_WAITING_VALIDATION',
      },
      {
        value: '3',
        title: 'Validated',
        label: 'LBL_VALIDATED',
      },
      {
        value: '4',
        title: 'Refused',
        label: 'LBL_REFUSED',
      },
      {
        value: '5',
        title: 'Canceled',
        label: 'LBL_CANCELED',
      },
    ],
  },
  {
    selection: 'printing.setting.logo.position',
    name: 'logoPositionSelect',
    type: 'INTEGER',
    list: [
      {
        value: '0',
        title: 'None',
        label: 'LBL_NONE',
      },
      {
        value: '1',
        title: 'Left',
        label: 'LBL_LEFT',
      },
      {
        value: '2',
        title: 'Center',
        label: 'LBL_CENTER',
      },
      {
        value: '3',
        title: 'Right',
        label: 'LBL_RIGHT',
      },
    ],
  },

  {
    selection: 'partner.partner.type.select',
    name: 'partnerTypeSelect',
    type: 'INTEGER',
    model: MODELS.PARTNER,
    list: [
      {
        value: '1',
        title: 'Company',
        label: 'LBL_COMPANY_ONE',
      },
      {
        value: '2',
        title: 'Individual',
        label: 'LBL_INDIVIDUAL',
      },
    ],
  },
  {
    selection: 'company.partner.type.select',
    name: 'defaultPartnerTypeSelect',
    type: 'INTEGER',
    model: MODELS.COMPANY,
    list: [
      {
        value: '1',
        title: 'Company',
        label: 'LBL_COMPANY_ONE',
      },
      {
        value: '2',
        title: 'Individual',
        label: 'LBL_INDIVIDUAL',
      },
    ],
  },
  {
    selection: 'company.partner.category.select',
    name: 'defaultPartnerCategorySelect',
    type: 'INTEGER',
    model: MODELS.COMPANY,
    list: [
      {
        value: '1',
        title: 'Customer',
        label: 'LBL_CUSTOMER',
      },
      {
        value: '2',
        title: 'Supplier',
        label: 'LBL_SUPPLIER',
      },
    ],
  },
  {
    selection: 'company.timezone.select',
    name: 'timezone',
    type: 'STRING',
    model: MODELS.COMPANY,
    list: [
      {
        value: 'Europe/Paris',
        title: 'Europe/Paris',
        label: 'Europe/Paris',
      },
      {
        value: 'America/New_York',
        title: 'America/New_York',
        label: 'America/New_York',
      },
    ],
  },
  {
    selection: 'account.account.common.position.select',
    name: 'commonPosition',
    type: 'INTEGER',
    model: MODELS.ACCOUNT,
    list: [
      {
        value: '0',
        title: 'None',
        label: 'LBL_NONE',
      },
      {
        value: '1',
        title: 'Credit',
        label: 'LBL_CREDIT',
      },
      {
        value: '2',
        title: 'Debit',
        label: 'LBL_DEBIT',
      },
    ],
  },
  {
    selection: 'base.year.period.duration.select',
    name: 'periodDurationSelect',
    type: 'INTEGER',
    model: MODELS.FISCALYEAR,
    list: [
      {
        value: '1',
        title: '1 Month',
        label: 'LBL_1_MONTH',
      },
      {
        value: '2',
        title: '2 Months',
        label: 'LBL_2_MONTHS',
      },
      {
        value: '3',
        title: '3 Months',
        label: 'LBL_3_MONTHS',
      },
      {
        value: '6',
        title: '6 Months',
        label: 'LBL_6_MONTHS',
      },
      {
        value: '12',
        title: '1 Year',
        label: 'LBL_1_YEAR',
      },
    ],
  },
  {
    selection: 'base.period.status.select',
    name: 'statusSelect',
    type: 'INTEGER',
    model: MODELS.PERIOD,
    list: [
      {
        value: '1',
        title: 'Opened',
        label: 'LBL_OPENED',
      },
      {
        value: '2',
        title: 'Permanently Closed',
        label: 'LBL_CLOSED',
      },
      {
        value: '3',
        title: 'Adjusting',
        label: 'LBL_ADJUSTING',
      },
      {
        value: '4',
        title: 'Temporarily Closed',
        label: 'LBL_TEMPORARILY_CLOSED',
      },
    ],
  },
  {
    selection: 'account.payment.condition.type.select',
    name: 'typeSelect',
    type: 'INTEGER',
    model: MODELS.PAYMENTCONDITION,
    list: [
      {
        value: '1',
        title: 'Net',
        label: 'NET',
      },
      {
        value: '2',
        title: 'End of month + n days / month',
        label: 'END_OF_MONTH_N_DAYS',
      },
      {
        value: '3',
        title: 'N days / month + end of month',
        label: 'N_DAYS_MONTH_END_OF_MONTH',
      },
      {
        value: '4',
        title: 'N days / month + end of month at',
        label: 'N_DAYS_MONTH_END_OF_MONTH_AT',
      },
    ],
  },
  {
    selection: 'account.payment.condition.period.type.select',
    name: 'periodTypeSelect',
    type: 'INTEGER',
    model: MODELS.PAYMENTCONDITION,
    list: [
      {
        value: '1',
        title: 'Days',
        label: 'LBL_DAYS',
      },
      {
        value: '2',
        title: 'Month',
        label: 'LBL_MONTH',
      },
    ],
  },
  {
    selection: 'iaccount.payment.mode.type.select',
    name: 'typeSelect',
    type: 'INTEGER',
    model: MODELS.PAYMENTMODES,
    list: [
      {
        value: '1',
        title: 'Other',
        label: 'LBL_OTHER',
      },
      {
        value: '2',
        title: 'Direct debit',
        label: 'LBL_DIRECT_DEBIT',
      },
      {
        value: '3',
        title: 'IPO',
        label: 'LBL_IPO',
      },
      {
        value: '4',
        title: 'IPO + Cheque',
        label: 'LBL_IPO_CHEQUE',
      },
      {
        value: '5',
        title: 'Cash',
        label: 'CASH',
      },
      {
        value: '6',
        title: 'Bank card',
        label: 'LBL_BANK_CARD',
      },
      {
        value: '7',
        title: 'Cheque',
        label: 'LBL_CHEQUE',
      },
      {
        value: '8',
        title: 'Web',
        label: 'LBL_WEB',
      },
      {
        value: '9',
        title: 'Transfer',
        label: 'LBL_TRANSFER',
      },
      {
        value: '10',
        title: 'Exchanges',
        label: 'LBL_EXCHANGES',
      },
    ],
  },
  {
    selection: 'iaccount.payment.mode.in.out.select',
    name: 'inOutSelect',
    type: 'INTEGER',
    model: MODELS.PAYMENTMODES,
    list: [
      {
        value: '1',
        title: 'In',
        label: 'LBL_IN',
      },
      {
        value: '2',
        title: 'Out',
        label: 'LBL_OUT',
      },
    ],
  },
  {
    selection: 'account.tax.type.select',
    name: 'typeSelect',
    type: 'INTEGER',
    model: MODELS.TAXES,
    list: [
      {
        value: '1',
        title: 'Collection',
        label: 'LBL_COLLECTION',
      },
      {
        value: '2',
        title: 'Debit',
        label: 'LBL_DEBIT',
      },
    ],
  },
  {
    selection: 'hr.time.logging.preference.select',
    name: 'timeLoggingPreferenceSelect',
    model: MODELS.EMPLOYEE,
    type: 'STRING',
    list: [
      {
        value: 'days',
        title: 'Days',
        label: 'LBL_DAYS',
      },
      {
        value: 'hours',
        title: 'Hours',
        label: 'LBL_HOURS',
      },
    ],
  },
];
