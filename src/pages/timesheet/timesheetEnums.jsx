export const TIMESHEET_STATUS_ENUMS = {
  1: 'LBL_DRAFT',
  2: 'LBL_WAITING_VALIDATION',
  3: 'LBL_APPROVED',
  4: 'LBL_REFUSED',
  5: 'LBL_CANCELED',
};
export const TIMESHEET_STATUS_REV_ENUMS = {
  LBL_DRAFT: 1,
  LBL_WAITING_VALIDATION: 2,
  LBL_APPROVED: 3,
  LBL_REFUSED: 4,
  LBL_CANCELED: 5,
};
export const SEARCH_TIMESHEET_LINES_FIELDS = [
  'date',
  'duration',
  'sequence',
  'toInvoice',
  'product',
  'comments',
  'projectTask',
  'hoursDuration',
  'enableEditor',
  'timesheet.toDate',
  'project',
  'employee',
  'task',
];

export const APP_TIMESHEET_FETCH_FIELDS = [
  'keepProject',
  'displayTaskColumnInPrinting',
  'needValidation',
  'consolidateTSLine',
  'timesheetEditor',
  'displayTimesheetLineNumber',
  'invoicingTypeLogTimesSelect',
  'enableTimer',
  'defaultEndFormat',
  'displayActivityColumnInPrinting',
  'enableActivity',
  'createLinesForHolidays',
  'editModeTSTimer',
  'createLinesForLeaves',
  'timesheetReminderTemplate',
  'isAlertManufOrderFinish',
];
