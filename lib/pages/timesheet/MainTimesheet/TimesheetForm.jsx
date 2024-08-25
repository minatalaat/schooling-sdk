import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import moment from 'moment';

import SearchModalAxelor from '../../../components/ui/inputs/SearchModal/SearchModalAxelor';
import DateInput from '../../../components/ui/inputs/DateInput';
import TimesheetLines from './TimesheetLines';
import TotalPeriod from './TotalPeriod';

import { TIMESHEET_STATUS_REV_ENUMS } from '../timesheetEnums';
import { MODELS } from '../../../constants/models';
import { useAxiosFunction } from '../../../hooks/useAxios';
import { getActionUrl, getModelUrl, getRemoveAllUrl } from '../../../services/getUrl';
import { useTabs } from '../../../hooks/useTabs';
import { checkFlashOrError } from '../../../utils/helpers';

const TimesheetForm = ({
  enableEdit,
  data,
  configData,
  addNew,
  isSave,
  isDelete,
  isConfirm,
  isComplete,
  isValidate,
  isRefuse,
  isCancel,
  finishedSaveHandler,
  finishedDeleteHandler,
  finishedConfirmHandler,
  finishedCompleteHandler,
  finishedValidateHandler,
  finishedRefuseHandler,
  finishedCancelHandler,
  alertHandler,
  setActionInProgress,
  fromDate,
  fromDateReadOnly,
  fetchTimesheet,
}) => {
  const { api } = useAxiosFunction();
  const tabsProps = useTabs();
  const { t } = useTranslation();
  const [totalPeriod, setTotalPeriod] = useState('0.00');
  let userId = useSelector(state => state.userFeatures.id);
  const company = useSelector(state => state.userFeatures.companyInfo.company);

  const timesheetLines = useSelector(state => state.timesheetLines.timesheetLines);
  const initialValues = {
    employee: data?.employee || null,
    fromDate: fromDate,
    toDate: data?.toDate || '',
  };

  const validationSchema = Yup.object({
    employee: Yup.object().required(t('REQUIRED')).nullable(),
    fromDate: Yup.date().required(t('REPORT_FROM_DATE_VALIDATION_MESSAGE')),
    toDate: Yup.date().required(t('REPORT_TO_DATE_VALIDATION_MESSAGE')).min(Yup.ref('fromDate'), t('LBL_ERROR_TO_DATE_LARGER_FROM_DATE')),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: false,
  });

  const onEmployeeSearchSuccess = response => {
    if (response.data.status === 0) {
      let data = response.data.data;
      let employees = [];
      data.forEach(employee => {
        let temp = {
          id: employee.id,
          name: employee?.name ?? '',
          userName: employee ? (employee.user ? employee.user.name : '') : '',
          user: employee?.user,
        };
        employees.push(temp);
      });

      return { displayedData: [...employees], total: response.data.total || 0 };
    }
  };

  const getSaveActionPayload = action => {
    return {
      model: MODELS.TIMESHEET,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: MODELS.TIMESHEET,
          'employee.timesheetImputationSelect': 1,
          isCompleted: false,
          showEditor: false,
          periodTotal: totalPeriod,
          statusSelect: data?.statusSelect || 1,
          timeLoggingPreferenceSelect: configData
            ? configData[0]
              ? configData[0].values
                ? configData[0].values.timeLoggingPreferenceSelect
                  ? configData[0].values.timeLoggingPreferenceSelect
                  : 'days'
                : 'days'
              : 'days'
            : 'days',
          company: company,
          employee: formik.values.employee,
          fromDate: moment(formik.values.fromDate).locale('en').format('YYYY-MM-DD'),
          toDate: moment(formik.values.toDate).locale('en').format('YYYY-MM-DD'),
          timesheetLineList: timesheetLines,
          attrs: '{}',
          showActivity: configData
            ? configData[1]
              ? configData[1].values
                ? configData[1].values['$showActivity']
                : configData[0]
                  ? configData[0].values
                    ? configData[0].values['$showActivity']
                    : false
                  : false
              : false
            : false,
        },
      },
    };
  };

  const getSaveModelPayload = totalPeriod => {
    let payload = {
      data: {
        'employee.timesheetImputationSelect': 1,
        isCompleted: false,
        showEditor: false,
        periodTotal: parseFloat(totalPeriod).toFixed(2).toString(),
        statusSelect: data?.statusSelect || 1,
        timeLoggingPreferenceSelect: configData
          ? configData[0]
            ? configData[0].values
              ? configData[0].values.timeLoggingPreferenceSelect
                ? configData[0].values.timeLoggingPreferenceSelect
                : 'days'
              : 'days'
            : 'days'
          : 'days',
        company: company,
        employee: formik.values.employee,
        fromDate: moment(formik.values.fromDate).locale('en').format('YYYY-MM-DD'),
        toDate: moment(formik.values.toDate).locale('en').format('YYYY-MM-DD'),
        timesheetLineList: timesheetLines,
      },
    };

    if (data) {
      payload.data.id = data ? parseInt(data.id) : null;
      payload.data.version = data && data.version !== null ? data.version : null;
    }

    return payload;
  };

  const saveRecord = async () => {
    if (formik.isValid && timesheetLines && timesheetLines.length > 0) {
      setActionInProgress(true);
      let action = 'action-timesheet-group-onsave';
      const saveActionResponse = await api('POST', getActionUrl(), getSaveActionPayload(action));
      if (saveActionResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      let totalPeriod = null;

      if (saveActionResponse.data.data && saveActionResponse.data.data[0]) {
        let data = saveActionResponse.data.data[0];
        totalPeriod = data
          ? data.attrs
            ? data.attrs.periodTotal
              ? data.attrs.periodTotal.value
                ? data.attrs.periodTotal.value
                : '0.00'
              : '0.00'
            : '0.00'
          : '0.00';
        setTotalPeriod(totalPeriod);
      }

      const saveModelResponse = await api('POST', getModelUrl(MODELS.TIMESHEET), getSaveModelPayload(totalPeriod));
      if (saveModelResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      finishedSaveHandler('success');
    } else {
      alertHandler('Error', t('INVALID_FORM'));
    }
  };

  const getFirstActionPayload = action => {
    return {
      model: MODELS.TIMESHEET,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: MODELS.TIMESHEET,
          timesheetLineList: timesheetLines,
          toDate: moment(formik.values.toDate).locale('en').format('YYYY-MM-DD'),
          refusalDate: null,
          showEditor: false,
          groundForRefusal: null,
          validationDate: null,
          periodTotal: data?.periodTotal || '0.00',
          employee: formik.values.employee,
          version: data && data.version !== null ? data.version : null,
          attrs: '{}',
          fromDate: formik.values.fromDate,
          statusSelect: data?.statusSelect || 1,
          refusedBy: null,
          sentDate: null,
          timeLoggingPreferenceSelect: configData
            ? configData[0]
              ? configData[0].values
                ? configData[0].values.timeLoggingPreferenceSelect
                  ? configData[0].values.timeLoggingPreferenceSelect
                  : 'days'
                : 'days'
              : 'days'
            : 'days',
          company: company,
          validatedBy: null,
          id: data?.id || null,
          isCompleted: false,
          wkfStatus: null,
          showActivity: configData
            ? configData[1]
              ? configData[1].values
                ? configData[1].values['$showActivity']
                : configData[0]
                  ? configData[0].values
                    ? configData[0].values['$showActivity']
                    : false
                  : false
              : false
            : false,
        },
      },
    };
  };

  const getSecondActionPayload = (action, data) => {
    return {
      model: MODELS.TIMESHEET,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: MODELS.TIMESHEET,
          timesheetLineList: timesheetLines,
          toDate: moment(formik.values.toDate).locale('en').format('YYYY-MM-DD'),
          refusalDate: null,
          showEditor: false,
          groundForRefusal: null,
          validationDate: null,
          periodTotal: data?.periodTotal || '0.00',
          employee: formik.values.employee,
          version: data && data.version !== null ? data.version : null,
          attrs: '{}',
          fromDate: formik.values.fromDate,
          statusSelect: data?.statusSelect || 1,
          refusedBy: null,
          sentDate: null,
          timeLoggingPreferenceSelect: configData
            ? configData[0]
              ? configData[0].values
                ? configData[0].values.timeLoggingPreferenceSelect
                  ? configData[0].values.timeLoggingPreferenceSelect
                  : 'days'
                : 'days'
              : 'days'
            : 'days',
          company: company,
          validatedBy: null,
          id: data?.id || null,
          isCompleted: false,
          wkfStatus: null,
          showActivity: configData
            ? configData[1]
              ? configData[1].values
                ? configData[1].values['$showActivity']
                : configData[0]
                  ? configData[0].values
                    ? configData[0].values['$showActivity']
                    : false
                  : false
              : false
            : false,
        },
      },
    };
  };

  const getThirdActionPayload = (action, data) => {
    return {
      model: MODELS.TIMESHEET,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: MODELS.TIMESHEET,
          timesheetLineList: timesheetLines,
          toDate: moment(formik.values.toDate).locale('en').format('YYYY-MM-DD'),
          refusalDate: null,
          showEditor: false,
          groundForRefusal: null,
          validationDate: null,
          periodTotal: data?.periodTotal || '0.00',
          employee: formik.values.employee,
          version: data && data.version !== null ? data.version : null,
          attrs: '{}',
          fromDate: formik.values.fromDate,
          statusSelect: data?.statusSelect || 1,
          refusedBy: null,
          sentDate: null,
          timeLoggingPreferenceSelect: configData
            ? configData[0]
              ? configData[0].values
                ? configData[0].values.timeLoggingPreferenceSelect
                  ? configData[0].values.timeLoggingPreferenceSelect
                  : 'days'
                : 'days'
              : 'days'
            : 'days',
          company: company,
          validatedBy: null,
          id: data?.id || null,
          isCompleted: false,
          wkfStatus: null,
          showActivity: configData
            ? configData[1]
              ? configData[1].values
                ? configData[1].values['$showActivity']
                : configData[0]
                  ? configData[0].values
                    ? configData[0].values['$showActivity']
                    : false
                  : false
              : false
            : false,
        },
      },
    };
  };

  const confirmRecord = async () => {
    if (formik.isValid && timesheetLines && timesheetLines.length > 0) {
      setActionInProgress(true);
      let action = 'action-timesheet-group-confirm';
      const confirmFirstActionResponse = await api('POST', getActionUrl(), getFirstActionPayload(action));
      if (confirmFirstActionResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      let data = confirmFirstActionResponse.data.data;
      if (data && checkFlashOrError(data)) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      action = 'action-timesheet-group-onsave';
      const saveActionResponse = await api('POST', getActionUrl(), getSaveActionPayload(action));
      if (saveActionResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      let totalPeriod = null;

      if (saveActionResponse.data.data && saveActionResponse.data.data[0]) {
        let data = saveActionResponse.data.data[0];
        totalPeriod = data
          ? data.attrs
            ? data.attrs.periodTotal
              ? data.attrs.periodTotal.value
                ? data.attrs.periodTotal.value
                : '0.00'
              : '0.00'
            : '0.00'
          : '0.00';
        setTotalPeriod(totalPeriod);
      }

      const saveModelResponse = await api('POST', getModelUrl(MODELS.TIMESHEET), getSaveModelPayload(totalPeriod));
      if (saveModelResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      let fetchTimesheetData = await fetchTimesheet(saveModelResponse.data.data[0].id);
      action = 'action-timesheet-group-confirm[1]';
      const confirmSecondActionResponse = await api('POST', getActionUrl(), getSecondActionPayload(action, fetchTimesheetData));
      if (confirmSecondActionResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      data = confirmSecondActionResponse.data.data;
      if (data && checkFlashOrError(data)) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));

      fetchTimesheetData = await fetchTimesheet(saveModelResponse.data.data[0].id);
      action = 'action-timesheet-group-confirm[2]';
      const confirmThirdActionResponse = await api('POST', getActionUrl(), getThirdActionPayload(action, fetchTimesheetData));
      if (confirmThirdActionResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      data = confirmThirdActionResponse.data.data;
      if (data && checkFlashOrError(data)) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      return finishedConfirmHandler('success');
    } else {
      alertHandler('Error', t('INVAILD_FORM'));
    }
  };

  const getCompleteFirstAction = action => {
    return {
      model: MODELS.TIMESHEET,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: MODELS.TIMESHEET,
          _user: {
            id: userId,
          },
          timesheetLineList: timesheetLines,
          toDate: moment(formik.values.toDate).locale('en').format('YYYY-MM-DD'),
          refusalDate: null,
          showEditor: false,
          groundForRefusal: null,
          validationDate: null,
          periodTotal: data ? (data.periodTotal ? data.periodTotal : totalPeriod) : totalPeriod,
          employee: formik.values.employee,
          version: data && data.version !== null ? data.version : null,
          attrs: '{}',
          fromDate: moment(formik.values.fromDate).locale('en').format('YYYY-MM-DD'),
          statusSelect: data?.statusSelect || null,
          refusedBy: null,
          sentDate: data?.sentDate || null,
          timeLoggingPreferenceSelect: configData
            ? configData[0]
              ? configData[0].values
                ? configData[0].values.timeLoggingPreferenceSelect
                  ? configData[0].values.timeLoggingPreferenceSelect
                  : 'days'
                : 'days'
              : 'days'
            : 'days',
          company: company,
          validatedBy: null,
          id: data?.id || null,
          isCompleted: false,
          wkfStatus: null,
          showActivity: configData
            ? configData[1]
              ? configData[1].values
                ? configData[1].values['$showActivity']
                : configData[0]
                  ? configData[0].values
                    ? configData[0].values['$showActivity']
                    : false
                  : false
              : false
            : false,
          periodTotalConvert: data?.periodTotalConvert || null,
        },
      },
    };
  };

  const getCompleteSecondAction = (action, data) => {
    return {
      model: MODELS.TIMESHEET,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: MODELS.TIMESHEET,
          _user: {
            id: userId,
          },
          timesheetLineList: timesheetLines,
          toDate: moment(formik.values.toDate).locale('en').format('YYYY-MM-DD'),
          refusalDate: null,
          showEditor: false,
          groundForRefusal: null,
          validationDate: null,
          periodTotal: data ? (data.periodTotal ? data.periodTotal : totalPeriod) : totalPeriod,
          employee: formik.values.employee,
          version: data && data.version !== null ? data.version : null,
          attrs: '{}',
          fromDate: moment(formik.values.fromDate).locale('en').format('YYYY-MM-DD'),
          statusSelect: data?.statusSelect || null,
          refusedBy: null,
          sentDate: data?.sentDate || null,
          timeLoggingPreferenceSelect: configData
            ? configData[0]
              ? configData[0].values
                ? configData[0].values.timeLoggingPreferenceSelect
                  ? configData[0].values.timeLoggingPreferenceSelect
                  : 'days'
                : 'days'
              : 'days'
            : 'days',
          company: company,
          validatedBy: null,
          id: data?.id || null,
          isCompleted: false,
          wkfStatus: null,
          showActivity: configData
            ? configData[1]
              ? configData[1].values
                ? configData[1].values['$showActivity']
                : configData[0]
                  ? configData[0].values
                    ? configData[0].values['$showActivity']
                    : false
                  : false
              : false
            : false,
          periodTotalConvert: data?.periodTotalConvert || null,
        },
      },
    };
  };

  const completeRecord = async () => {
    if (formik.isValid && timesheetLines && timesheetLines.length > 0) {
      setActionInProgress(true);
      let action = 'save,action-timesheet-method-complete';
      const completeFirstAction = await api('POST', getActionUrl(), getCompleteFirstAction(action));
      if (completeFirstAction.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      let data = completeFirstAction.data.data;

      if (data && checkFlashOrError(data)) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      action = 'action-timesheet-group-onsave';
      const saveActionResponse = await api('POST', getActionUrl(), getSaveActionPayload(action));
      if (saveActionResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      let totalPeriod = null;

      if (saveActionResponse.data.data && saveActionResponse.data.data[0]) {
        let data = saveActionResponse.data.data[0];
        totalPeriod = data
          ? data.attrs
            ? data.attrs.periodTotal
              ? data.attrs.periodTotal.value
                ? data.attrs.periodTotal.value
                : '0.00'
              : '0.00'
            : '0.00'
          : '0.00';
        setTotalPeriod(totalPeriod);
      }

      const saveModelResponse = await api('POST', getModelUrl(MODELS.TIMESHEET), getSaveModelPayload(totalPeriod));
      if (saveModelResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      let fetchTimesheetData = await fetchTimesheet(saveModelResponse.data.data[0].id);
      action = 'action-timesheet-method-complete';
      const completeSecondAction = await api('POST', getActionUrl(), getCompleteSecondAction(action, fetchTimesheetData));
      if (completeSecondAction.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      data = completeSecondAction.data.data;
      if (data && checkFlashOrError(data) && data[0].flash.includes('is missing.')) return alertHandler('Error', data[0].flash);
      finishedCompleteHandler('success');
    } else {
      return alertHandler('Error', t('INVALID_FORM'));
    }
  };

  const getValidateFirstActionPayload = action => {
    return {
      model: MODELS.TIMESHEET,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: MODELS.TIMESHEET,
          _statusSelect: data?.statusSelect || 2,
          _user: {
            id: userId,
          },
          todayDate: moment(new Date()).locale('en').format('YYYY-MM-DD'),
          timesheetLineList: timesheetLines,
          toDate: moment(formik.values.toDate).locale('en').format('YYYY-MM-DD'),
          refusalDate: null,
          showEditor: false,
          groundForRefusal: null,
          validationDate: null,
          periodTotal: data ? (data.periodTotal ? data.periodTotal : totalPeriod) : totalPeriod,
          employee: formik.values.employee,
          version: data & (data.version !== null) ? data.version : null,
          attrs: '{}',
          fromDate: moment(formik.values.fromDate).locale('en').format('YYYY-MM-DD'),
          statusSelect: data?.statusSelect || 2,
          refusedBy: null,
          sentDate: data?.sentDate || null,
          timeLoggingPreferenceSelect: configData
            ? configData[0]
              ? configData[0].values
                ? configData[0].values.timeLoggingPreferenceSelect
                  ? configData[0].values.timeLoggingPreferenceSelect
                  : 'days'
                : 'days'
              : 'days'
            : 'days',
          company: company,
          validatedBy: null,
          id: data?.id || null,
          isCompleted: false,
          wkfStatus: null,
          showActivity: configData
            ? configData[1]
              ? configData[1].values
                ? configData[1].values['$showActivity']
                : configData[0]
                  ? configData[0].values
                    ? configData[0].values['$showActivity']
                    : false
                  : false
              : false
            : false,
          periodTotalConvert: data?.periodTotalConvert || null,
        },
      },
    };
  };

  const getValidateSecondActionPayload = (action, data) => {
    return {
      model: MODELS.TIMESHEET,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: MODELS.TIMESHEET,
          _statusSelect: data?.statusSelect || 2,
          _user: {
            id: userId,
          },
          todayDate: moment(new Date()).locale('en').format('YYYY-MM-DD'),
          timesheetLineList: timesheetLines,
          toDate: moment(formik.values.toDate).locale('en').format('YYYY-MM-DD'),
          refusalDate: null,
          showEditor: false,
          groundForRefusal: null,
          validationDate: null,
          periodTotal: data ? (data.periodTotal ? data.periodTotal : totalPeriod) : totalPeriod,
          employee: formik.values.employee,
          version: data & (data.version !== null) ? data.version : null,
          attrs: '{}',
          fromDate: moment(formik.values.fromDate).locale('en').format('YYYY-MM-DD'),
          statusSelect: data?.statusSelect || 2,
          refusedBy: null,
          sentDate: data?.sentDate || null,
          timeLoggingPreferenceSelect: configData
            ? configData[0]
              ? configData[0].values
                ? configData[0].values.timeLoggingPreferenceSelect
                  ? configData[0].values.timeLoggingPreferenceSelect
                  : 'days'
                : 'days'
              : 'days'
            : 'days',
          company: company,
          validatedBy: null,
          id: data?.id || null,
          isCompleted: false,
          wkfStatus: null,
          showActivity: configData
            ? configData[1]
              ? configData[1].values
                ? configData[1].values['$showActivity']
                : configData[0]
                  ? configData[0].values
                    ? configData[0].values['$showActivity']
                    : false
                  : false
              : false
            : false,
          periodTotalConvert: data?.periodTotalConvert || null,
        },
      },
    };
  };

  const validateRecord = async (key, actions) => {
    if (formik.isValid && timesheetLines && timesheetLines.length > 0) {
      setActionInProgress(true);
      let action = actions[0];
      const validateFirstActionResponse = await api('POST', getActionUrl(), getValidateFirstActionPayload(action));
      if (validateFirstActionResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      let data = validateFirstActionResponse.data.data;
      if (data && checkFlashOrError(data) && data[0].flash.includes('please configure employee'))
        return alertHandler('Error', t('PLEASE_CONFIGURE_WEEKLY_PLAN'));
      action = 'action-timesheet-group-onsave';
      const saveActionResponse = await api('POST', getActionUrl(), getSaveActionPayload(action));
      if (saveActionResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      let totalPeriod = null;

      if (saveActionResponse.data.data && saveActionResponse.data.data[0]) {
        let data = saveActionResponse.data.data[0];
        totalPeriod = data
          ? data.attrs
            ? data.attrs.periodTotal
              ? data.attrs.periodTotal.value
                ? data.attrs.periodTotal.value
                : '0.00'
              : '0.00'
            : '0.00'
          : '0.00';
        setTotalPeriod(totalPeriod);
      }

      const saveModelResponse = await api('POST', getModelUrl(MODELS.TIMESHEET), getSaveModelPayload(totalPeriod));
      if (saveModelResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      let fetchTimesheetData = await fetchTimesheet(saveModelResponse.data.data[0].id);

      action = actions[1];
      const validateSecondActionResponse = await api('POST', getActionUrl(), getValidateSecondActionPayload(action, fetchTimesheetData));
      if (validateSecondActionResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      data = validateSecondActionResponse.data.data;
      if (data && checkFlashOrError(data)) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      fetchTimesheetData = await fetchTimesheet(saveModelResponse.data.data[0].id);

      action = actions[2];

      const validateThirdActionResponse = await api('POST', getActionUrl(), getValidateSecondActionPayload(action, fetchTimesheetData));
      if (validateThirdActionResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      data = validateThirdActionResponse.data.data;
      if (data && checkFlashOrError(data)) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));

      if (key === 'validate') {
        finishedValidateHandler('success');
      } else if ('refuse') {
        finishedRefuseHandler('success');
      } else if ('cancel') {
        finishedCancelHandler('success');
      }
    } else {
      return alertHandler('Error', t('INVALID_FORM'));
    }
  };

  const deleteRecord = () => {
    setActionInProgress(true);
    const payload = {
      records: [{ id: data.id }],
    };
    api('POST', getRemoveAllUrl(MODELS.TIMESHEET), payload, () => {
      setActionInProgress(false);
      finishedDeleteHandler('success');
    });
  };

  const disableField = () => {
    if (!enableEdit) {
      return true;
    }

    if (data) {
      return data ? (data.statusSelect < TIMESHEET_STATUS_REV_ENUMS['LBL_WAITING_VALIDATION'] ? false : true) : true;
    }
  };

  const disableTimesheetLinesList = conData => {
    if (enableEdit === false && data === null) {
      return true;
    }

    if (data) {
      return conData
        ? conData[1]
          ? conData[1].attrs
            ? conData[1].attrs.timesheetLineList
              ? conData[1].attrs.timesheetLineList.readonly
              : false
            : false
          : false
        : false;
    } else {
      return conData
        ? conData[2]
          ? conData[2].attrs
            ? conData[2].attrs.timesheetLineList
              ? conData[2].attrs
                ? conData[2].attrs.timesheetLineList.readonly
                : false
              : false
            : false
          : false
        : false;
    }
  };

  const getValidateTodatePayload = (action, date) => {
    return {
      model: MODELS.TIMESHEET,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: MODELS.TIMESHEET,
          user_id: userId,
          _id: null,
          timesheetLineList: timesheetLines,
          toDate: moment(formik.values.toDate).locale('en').format('YYYY-MM-DD'),
          refusalDate: null,
          showEditor: false,
          groundForRefusal: null,
          validationDate: null,
          periodTotal: data ? (data.periodTotal ? data.periodTotal : totalPeriod) : totalPeriod,
          employee: formik.values.employee,
          version: data && data.version !== null ? data.version : null,
          attrs: '{}',
          fromDate: moment(formik.values.fromDate).locale('en').format('YYYY-MM-DD'),
          statusSelect: data?.statusSelect || null,
          refusedBy: null,
          sentDate: data?.sentDate || null,
          timeLoggingPreferenceSelect: configData
            ? configData[0]
              ? configData[0].values
                ? configData[0].values.timeLoggingPreferenceSelect
                  ? configData[0].values.timeLoggingPreferenceSelect
                  : 'days'
                : 'days'
              : 'days'
            : 'days',
          company: company,
          validatedBy: null,
          id: data?.id || null,
          isCompleted: false,
          wkfStatus: null,
          showActivity: configData
            ? configData[1]
              ? configData[1].values
                ? configData[1].values['$showActivity']
                : configData[0]
                  ? configData[0].values
                    ? configData[0].values['$showActivity']
                    : false
                  : false
              : false
            : false,
          periodTotalConvert: data?.periodTotalConvert || null,
          _source: 'toDate',
        },
      },
    };
  };

  const valdateTodate = async date => {
    let action = 'action-timesheet-group-to-date-onchange';
    const validateToDateResponse = await api('POST', getActionUrl(), getValidateTodatePayload(action, date));
    if (validateToDateResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    let data = validateToDateResponse.data.data;
    if (data && checkFlashOrError(data) && data[0].error && data[0].error.includes('Invalid date'))
      return alertHandler('Error', t('LBL_ERROR_INVALID_DATE'));
  };

  useEffect(() => {
    if (isSave) {
      saveRecord();
    }

    if (isCancel) {
      let actions = [
        'save,action-timesheet-method-cancel,action-timesheet-group-buttons',
        'action-timesheet-method-cancel,action-timesheet-group-buttons',
        'action-timesheet-group-buttons',
      ];
      validateRecord('cancel', actions);
    }

    if (isConfirm) {
      confirmRecord();
    }

    if (isComplete) {
      completeRecord();
    }

    if (isValidate) {
      let actions = ['action-timesheet-group-validate', 'action-timesheet-group-validate[1]', 'action-timesheet-group-validate[2]'];
      validateRecord('valdiate', actions);
    }

    if (isRefuse) {
      let actions = ['action-timesheet-group-refuse', 'action-timesheet-group-refuse[1]', 'action-timesheet-group-refuse[2]'];
      validateRecord('refuse', actions);
    }

    if (isDelete) {
      deleteRecord();
    }
  }, [isSave, isDelete, isCancel, isConfirm, isComplete, isValidate, isRefuse, enableEdit]);

  useEffect(() => {
    tabsProps.setShowTabsContent(true);
    // dispatch(timesheetLinesActions.resetTimesheetLines());
  }, []);

  useEffect(() => {
    if (formik.values.toDate !== '') {
      valdateTodate(formik.values.toDate);
    }
  }, [formik.values.toDate]);

  return (
    <>
      <div className="card">
        <div className="row">
          {userId && (
            <div className="col-md-6">
              <SearchModalAxelor
                formik={formik}
                modelKey="EMPLOYEES"
                mode="add"
                isRequired={false}
                disabled={true}
                onSuccess={onEmployeeSearchSuccess}
                payloadDomain={`self.user.id = ${userId}`}
                selectIdentifier="name"
                defaultValueConfig={true}
              />
            </div>
          )}
          <div className="col-md-6">
            <DateInput
              formik={formik}
              label="LBL_FROM_DATE"
              accessor="fromDate"
              mode={enableEdit ? 'edit' : 'view'}
              isRequired={enableEdit && data && data.statusSelect === TIMESHEET_STATUS_REV_ENUMS['LBL_DRAFT']}
              disabled={fromDateReadOnly}
            />{' '}
          </div>
          <div className="col-md-6">
            <DateInput
              formik={formik}
              label="LBL_TO_DATE"
              accessor="toDate"
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
              isRequired={addNew || (enableEdit && data && data.statusSelect === TIMESHEET_STATUS_REV_ENUMS['LBL_DRAFT'])}
              disabled={disableField()}
            />{' '}
          </div>
        </div>
        {formik.isValid && (
          <>
            <TimesheetLines
              tableTitle="LBL_TIMESHEET_LINES"
              pageMode={enableEdit ? 'edit' : 'view'}
              configData={configData}
              parentContext={data}
              formik={formik}
              disableTimesheetLinesList={configData !== null ? disableTimesheetLinesList(configData) : false}
              alertHandler={alertHandler}
            />
            <TotalPeriod totalPeriod={data ? (data.periodTotal ? data.periodTotal : totalPeriod) : totalPeriod} />
          </>
        )}
      </div>
    </>
  );
};

export default TimesheetForm;
