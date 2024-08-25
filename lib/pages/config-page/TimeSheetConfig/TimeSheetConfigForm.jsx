import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';

import DropDown from '../../../components/ui/inputs/DropDown';
import ToggleSwitch from '../../../components/ui/inputs/ToggleSwitch';
import SearchModalAxelor from '../../../components/ui/inputs/SearchModal/SearchModalAxelor';

import { useAxiosFunction } from '../../../hooks/useAxios';
import { MODELS } from '../../../constants/models';
import useMetaFields from '../../../hooks/metaFields/useMetaFields';
import { getActionUrl, getModelUrl } from '../../../services/getUrl';
import FormNotes from '../../../components/ui/FormNotes';

function TimeSheetConfigForm({ data, isSave, finishedSaveHandler, setActionInProgress, alertHandler, fetchAppTimeSheet }) {
  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  const invoicingTypesOptions = useMetaFields('appTimeSheet.invoicingTypeLogTimesSelect');
  const timeSheetDefaultEndDateFormatOptions = useMetaFields('appTimeSheet.timeSheetDefaultEndDateFormat');
  //commenting Start & Stop timer for timesheet config
  const initialValues = {
    invoicingTypeLogTimesSelect: data ? data.invoicingTypeLogTimesSelect.toString() : '1',
    needValidation: data ? data.needValidation : false,
    enableActivity: data ? data.enableActivity : false,
    // enableTimer: data ? data.enableTimer : false,
    // editModeTSTimer: data ? data.editModeTSTimer : false,
    // keepProject: data ? data.keepProject : false,
    defaultEndFormat: data ? data.defaultEndFormat.toString() : '0',
    createLinesForHolidays: data ? data.createLinesForHolidays : false,
    createLinesForLeaves: data ? data.createLinesForLeaves : false,
    timesheetReminderTemplate: data ? data.timesheetReminderTemplate : null,
    displayTaskColumnInPrinting: data ? data.displayTaskColumnInPrinting : false,
    displayActivityColumnInPrinting: data ? data.displayActivityColumnInPrinting : false,
  };
  const formik = useFormik({
    initialValues,
    validateOnMount: true,
  });

  const getSavePayload = () => {
    let payload = {
      data: {
        // keepProject: formik.values.keepProject,
        displayTaskColumnInPrinting: formik.values.displayTaskColumnInPrinting,
        needValidation: formik.values.needValidation,
        consolidateTSLine: false,
        version: data && data.version !== null ? data.version : null,
        timesheetEditor: false,
        displayTimesheetLineNumber: false,
        // enableTimer: formik.values.enableTimer,
        invoicingTypeLogTimesSelect: parseInt(formik.values.invoicingTypeLogTimesSelect),
        defaultEndFormat: parseInt(formik.values.defaultEndFormat),
        displayActivityColumnInPrinting: formik.values.displayActivityColumnInPrinting,
        createLinesForHolidays: formik.values.createLinesForHolidays,
        enableActivity: formik.values.enableActivity,
        createLinesForLeaves: formik.values.createLinesForLeaves,
        id: data?.id || null,
        timesheetReminderTemplate: formik.values.timesheetReminderTemplate,
        // editModeTSTimer: formik.values.editModeTSTimer,
        isAlertManufOrderFinish: false,
        $attachments: 0,
        $wkfStatus: null,
        $processInstanceId: null,
      },
    };
    return payload;
  };

  const onTimesheetTemplateSuccess = response => {
    if (response.data.status === 0) {
      let data = response.data.data;
      let temp4 = [];

      if (data && data.length > 0) {
        data.forEach(template => {
          let obj = {
            subject: template.subject,
            name: template.name,
          };

          temp4.push(obj);
        });
      }

      return { displayedData: temp4, total: response?.data?.total || 0 };
    }
  };

  const getFirstActionPayload = action => {
    return {
      model: MODELS.APP_TIMESHEET,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: MODELS.APP_TIMESHEET,
          // keepProject: formik.values.keepProject,
          displayTaskColumnInPrinting: formik.values.displayTaskColumnInPrinting,
          needValidation: formik.values.needValidation,
          consolidateTSLine: false,
          version: data && data.version !== null ? data.version : null,
          timesheetEditor: false,
          displayTimesheetLineNumber: false,
          // enableTimer: formik.values.enableTimer,
          invoicingTypeLogTimesSelect: parseInt(formik.values.invoicingTypeLogTimesSelect),
          defaultEndFormat: parseInt(formik.values.defaultEndFormat),
          displayActivityColumnInPrinting: formik.values.displayActivityColumnInPrinting,
          createLinesForHolidays: formik.values.createLinesForHolidays,
          enableActivity: formik.values.enableActivity,
          createLinesForLeaves: formik.values.createLinesForLeaves,
          id: data?.id || null,
          timesheetReminderTemplate: formik.values.timesheetReminderTemplate,
          // editModeTSTimer: formik.values.editModeTSTimer,
          isAlertManufOrderFinish: false,
          wkfStatus: null,
        },
      },
    };
  };

  const saveRecord = async () => {
    if (formik.isValid) {
      setActionInProgress(true);
      let action = 'action-app-timesheet-method-switch-timesheet-editors';
      const firstActionResponse = await api('POST', getActionUrl(), getFirstActionPayload(action));
      if (firstActionResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      const saveModelReposnse = await api('POST', getModelUrl(MODELS.APP_TIMESHEET), getSavePayload());
      if (saveModelReposnse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      fetchAppTimeSheet();
      finishedSaveHandler('Success', t('APP_TIMESHEET_CONFIG_SAVED_SUCCESSULLY'));
    }
  };

  useEffect(() => {
    if (isSave) {
      saveRecord();
    }
  }, [isSave]);

  // useEffect(() => {
  //   setFieldValue(formik, 'editModeTSTimer', false);
  //   setFieldValue(formik, 'keepProject', false);
  // }, [formik.values.enableTimer]);

  return (
    <>
      <div className="card">
        <div className="row">
          <div className="col-md-6">
            <DropDown
              options={invoicingTypesOptions.list}
              formik={formik}
              isRequired={false}
              label="LBL_INVOICING_TYPE_LOG_TIMES"
              accessor="invoicingTypeLogTimesSelect"
              translate={invoicingTypesOptions.mode === 'enum'}
              keys={{ valueKey: 'value', titleKey: 'label' }}
              mode="add"
            />{' '}
          </div>
          <div className="col-md-6">
            <ToggleSwitch formik={formik} label="LBL_NEED_VALIDATION" accessor="needValidation" mode="add" />
          </div>
          <div className="col-md-6">
            <ToggleSwitch formik={formik} label="LBL_ENABLE_ACTIVITY" accessor="enableActivity" mode="add" />
          </div>
          {/* <div className="col-md-6">
            <ToggleSwitch formik={formik} label="LBL_START_AND_STOP" accessor="enableTimer" mode={'add'} />
          </div>
          {formik.values.enableTimer && (
            <>
              <div className="col-md-6">
                <ToggleSwitch formik={formik} label="LBL_EDIT_START_AND_STOP_ON_STOP" accessor="editModeTSTimer" mode={'add'} />
              </div>
              <div className="col-md-6">
                <ToggleSwitch formik={formik} label="LBL_KEEP_PROJECT_FOR_START_AND_STOP_TIMER" accessor="keepProject" mode={'add'} />
              </div>
            </>
          )} */}

          <div className="col-md-6">
            <ToggleSwitch formik={formik} label="LBL_CREATE_LINES_FOR_LEAVES" accessor="createLinesForLeaves" mode="add" />
          </div>
          <div className="col-md-6">
            <ToggleSwitch formik={formik} label="LBL_CREATE_LINES_FOR_HOLIDAYS" accessor="createLinesForHolidays" mode="add" />
          </div>
          <div className="col-md-6">
            <DropDown
              formik={formik}
              mode="add"
              label="LBL_TIMESHEET_DEFAULT_END_DATE_FORMAT"
              accessor="defaultEndFormat"
              options={timeSheetDefaultEndDateFormatOptions.list}
              isRequired={false}
              translate={timeSheetDefaultEndDateFormatOptions.mode === 'enum'}
              keys={{ valueKey: 'value', titleKey: 'label' }}
            />{' '}
          </div>
          <div className="col-md-6">
            <SearchModalAxelor
              formik={formik}
              modelKey="TIMESHEET_REMINDER_TEMPLATE"
              mode="add"
              onSuccess={onTimesheetTemplateSuccess}
              isRequired={false}
              payloadDomain={`self.metaModel.name = 'TimesheetReminder'`}
              payloadDomainContext={{
                // keepProject: formik.values.keepProject,
                displayTaskColumnInPrinting: formik.values.displayTaskColumnInPrinting,
                needValidation: formik.values.needValidation,
                consolidateTSLine: false,
                version: data && data.version !== null ? data.version : null,
                timesheetEditor: false,
                displayTimesheetLineNumber: false,
                // enableTimer: formik.values.enableTimer,
                invoicingTypeLogTimesSelect: formik.values.invoicingTypeLogTimesSelect,
                defaultEndFormat: formik.values.defaultEndFormat,
                displayActivityColumnInPrinting: formik.values.displayActivityColumnInPrinting,
                createLinesForHolidays: formik.values.createLinesForHolidays,
                enableActivity: formik.values.enableActivity,
                createLinesForLeaves: formik.values.createLinesForLeaves,
                id: data ? data.id : null,
                timesheetReminderTemplate: formik.values.timesheetReminderTemplate,
                // editModeTSTimer: formik.values.editModeTSTimer,
                isAlertManufOrderFinish: false,
                wkfStatus: null,
                _model: MODELS.APP_TIMESHEET,
              }}
            />
          </div>
          <div className="col-md-6">
            <ToggleSwitch formik={formik} label="LBL_DISPLAY_TASK_COLUMN_IN_PRINTING" accessor="displayTaskColumnInPrinting" mode="add" />
          </div>
          <div className="col-md-6">
            <ToggleSwitch
              formik={formik}
              label="LBL_DISPLAY_ACTIVITY_COLUMN_IN_PRINTING"
              accessor="displayActivityColumnInPrinting"
              mode="add"
            />
          </div>
        </div>
        <FormNotes
          notes={[
            {
              title: 'LBL_REQUIRED_NOTIFY',
              type: 3,
            },
          ]}
        />
      </div>
    </>
  );
}

export default TimeSheetConfigForm;
