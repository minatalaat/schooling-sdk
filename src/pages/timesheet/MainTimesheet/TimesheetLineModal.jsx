import { useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';

import SearchModalAxelor from '../../../components/ui/inputs/SearchModal/SearchModalAxelor';
import DateInput from '../../../components/ui/inputs/DateInput';
import NumberInput from '../../../components/ui/inputs/NumberInput';
import TextArea from '../../../components/ui/inputs/TextArea';
import PurpleSaveButton from '../../../components/ui/buttons/PurpleSaveButton';
import CloseButton from '../../../components/ui/buttons/CloseButton';

import { checkFlashOrError, formatFloatNumber } from '../../../utils/helpers';
import { MODELS } from '../../../constants/models';
import { timesheetLinesActions } from '../../../store/timesheetLines';
import { useAxiosFunction } from '../../../hooks/useAxios';
import { getActionUrl } from '../../../services/getUrl';
import { VALID_TEXT_WITH_SPECIAL_CHARS } from '../../../constants/regex/Regex';
import { alertsActions } from '../../../store/alerts';

function TimesheetLineModal({ show, setShow, header, mode, line, configData, parentContext, formik, showActivity }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { api } = useAxiosFunction();
  let userId = useSelector(state => state.userFeatures.id);

  const timesheetLines = useSelector(state => state.timesheetLines.timesheetLines);
  const company = useSelector(state => state.userFeatures.companyInfo.company);

  const initialValues = {
    project: line ? line.project : null,
    projectTask: line ? line.projectTask : null,
    date: line ? line.date : '',
    product: line ? line.product : null,
    duration: line ? formatFloatNumber(line.duration) : '0.01',
    comments: line ? (line.comments ? line.comments : '') : '',
    hoursDuration: line ? line.hoursDuration : '0.00',
  };

  const validationSchema = Yup.object({
    project: Yup.object().nullable(),
    projectTask: Yup.object().nullable(),
    date: Yup.date().required(t('DATE_VALIDATION_MESSAGE')),
    product: Yup.object().nullable(),
    duration: Yup.number().required(t('REQUIRED')).min(0.01, t('LBL_NUMBER_MUST_NOT_BE_ZERO')),
    comments: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')),
  });

  const lineFormik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: mode === 'add' ? true : false,
  });

  const alertHandler = (title, message) => dispatch(alertsActions.initiateAlert({ title, message }));

  const onProjectSearchSuccess = response => {
    if (response.data.status === 0) {
      let data = response.data.data;
      let projects = [];

      if (data && data.length > 0) {
        data.forEach(project => {
          let temp = {
            id: project.id,
            fullName: project ? project.fullName : '',
          };
          projects.push(temp);
        });
      }

      return { displayedData: [...projects], total: response.data.total || 0 };
    }
  };

  const onTaskSearchSuccess = response => {
    if (response.data.status === 0) {
      let data = response.data.data;
      let tasks = [];

      if (data && data.length > 0) {
        data.forEach(task => {
          let temp = {
            id: task.id,
            fullName: task ? task.fullName : '',
          };
          tasks.push(temp);
        });
      }

      return { displayedData: [...tasks], total: response.data.total || 0 };
    }
  };

  const onProductSearchSuccess = response => {
    if (response.data.status === 0) {
      let data = response.data.data;
      let products = [];

      // if (data && data.length > 0) {
      data &&
        data.forEach(product => {
          let temp = {
            id: product?.id ?? null,
            fullName: product?.fullName ?? '',
          };
          products.push(temp);
        });
      // }

      return { displayedData: [...products], total: response.data.total || 0 };
    }
  };

  const saveLine = () => {
    if (lineFormik.isValid) {
      if (mode === 'edit') {
        dispatch(
          timesheetLinesActions.editLine({
            lineId: line.lineId,
            timesheetLine: {
              id: line?.id || null,
              version: line && line.version !== null ? line.version : null,
              duration: parseFloat(lineFormik.values.duration).toFixed(2).toString(),
              hoursDuration: lineFormik
                ? lineFormik.values
                  ? lineFormik.values.hoursDuration
                    ? lineFormik.values.hoursDuration
                    : '0.00'
                  : '0.00'
                : '0.00',
              selected: false,
              projectTask: lineFormik.values.projectTask,
              product: lineFormik.values.product,
              project: lineFormik.values.project,
              employee: configData
                ? configData[0]
                  ? configData[0].values
                    ? configData[0].values.employee
                      ? configData[0].values.employee
                      : parentContext
                        ? parentContext.employee
                          ? parentContext.employee
                          : null
                        : null
                    : null
                  : null
                : null,
              comments: lineFormik.values.comments,
              date: moment(lineFormik.values.date).locale('en').format('YYYY-MM-DD'),
              timeLoggingPreferenceSelect: configData
                ? configData[0]
                  ? configData[0].values
                    ? configData[0].values.timeLoggingPreferenceSelect
                      ? configData[0].values.timeLoggingPreferenceSelect
                      : 'days'
                    : 'days'
                  : 'days'
                : 'days',
            },
          })
        );
      } else {
        dispatch(
          timesheetLinesActions.addLine({
            timesheetLine: {
              lineId: Math.floor(Math.random() * 100).toString(),
              id: null,
              duration: parseFloat(lineFormik.values.duration).toFixed(2).toString(),
              hoursDuration: lineFormik
                ? lineFormik.values
                  ? lineFormik.values.hoursDuration
                    ? lineFormik.values.hoursDuration
                    : '0.00'
                  : '0.00'
                : '0.00',
              selected: false,
              projectTask: lineFormik.values.projectTask,
              product: lineFormik.values.product,
              project: lineFormik.values.project,
              employee: configData
                ? configData[0]
                  ? configData[0].values
                    ? configData[0].values.employee
                      ? configData[0].values.employee
                      : parentContext
                        ? parentContext.employee
                          ? parentContext.employee
                          : null
                        : null
                    : null
                  : null
                : null,
              comments: lineFormik.values.comments,
              date: moment(lineFormik.values.date).locale('en').format('YYYY-MM-DD'),
              timeLoggingPreferenceSelect: configData
                ? configData[0]
                  ? configData[0].values
                    ? configData[0].values.timeLoggingPreferenceSelect
                      ? configData[0].values.timeLoggingPreferenceSelect
                      : 'days'
                    : 'days'
                  : 'days'
                : 'days',
            },
          })
        );
      }

      setShow(false);
    } else {
      alertHandler('Error', t('INVALID_FORM'));
    }
  };

  const getLineHourDurationPayload = action => {
    return {
      model: MODELS.TIMESHEET_LINE,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: MODELS.TIMESHEET_LINE,
          id: null,
          duration: parseFloat(lineFormik.values.duration).toFixed(2).toString(),
          hoursDuration: lineFormik
            ? lineFormik.values
              ? lineFormik.values.hoursDuration
                ? lineFormik.values.hoursDuration
                : '0.00'
              : '0.00'
            : '0.00',
          selected: false,
          product: lineFormik.values ? (lineFormik.values.product ? lineFormik.values.product : null) : null,
          employee: configData
            ? configData[0]
              ? configData[0].values
                ? configData[0].values.employee
                  ? configData[0].values.employee
                  : parentContext
                    ? parentContext.employee
                      ? parentContext.employee
                      : null
                    : null
                : null
              : null
            : null,
          date: lineFormik.values
            ? lineFormik.values.date
              ? moment(lineFormik.values.date).locale('en').format('YYYY-MM-DD')
              : null
            : null,
          _form: true,
          _parent: {
            'employee.timesheetImputationSelect': 1,
            isCompleted: false,
            showEditor: false,
            periodTotal: '0',
            statusSelect: parentContext?.statusSelect || 1,
            timeLoggingPreferenceSelect: configData
              ? configData[0]
                ? configData[0].values
                  ? configData[0].values.timeLoggingPreferenceSelect
                    ? configData[0].values.timeLoggingPreferenceSelect
                    : parentContext?.timeLoggingPreferenceSelect
                      ? parentContext?.timeLoggingPreferenceSelect
                      : 'days'
                  : 'days'
                : 'days'
              : 'days',
            company: company,
            employee: configData
              ? configData[0]
                ? configData[0].values
                  ? configData[0].values.employee
                    ? configData[0].values.employee
                    : parentContext
                      ? parentContext.employee
                        ? parentContext.employee
                        : null
                      : null
                  : null
                : null
              : null,
            fromDate: formik.values.fromDate,
            toDate: formik.values.toDate,
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
            _model: MODELS.TIMESHEET,
            timesheetLineList: timesheetLines,
          },
          _viewType: 'grid',
          _viewName: 'timesheet-line-timesheet-grid',
          _views: [
            { type: 'grid', name: 'timesheet-line-timesheet-grid' },
            { type: 'form', name: 'timesheet-line-timesheet-form' },
          ],
          _source: 'duration',
        },
      },
    };
  };

  const getLineHourDuration = async () => {
    let action = 'action-timesheet-line-method-set-stored-duration';
    const getLineHourDurationResponse = await api('POST', getActionUrl(), getLineHourDurationPayload(action));
    if (getLineHourDurationResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    let data = getLineHourDurationResponse.data.data;
    if (data && checkFlashOrError(data) && data[0].flash.includes('Please, configure the number of daily work hours.'))
      return alertHandler('Error', t('CONFIGURE_DAILY_WORKING_HOURS'));
    lineFormik.setFieldValue(
      'hoursDuration',
      data ? (data[0] ? (data[0].values ? data[0].values.hoursDuration : '0.00') : '0.00') : '0.00'
    );
  };

  const validateDatePayload = action => {
    return {
      model: MODELS.TIMESHEET_LINE,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: MODELS.TIMESHEET_LINE,
          id: null,
          duration: parseFloat(lineFormik.values.duration).toFixed(2).toString(),
          hoursDuration: lineFormik
            ? lineFormik.values
              ? lineFormik.values.hoursDuration
                ? lineFormik.values.hoursDuration
                : '0.00'
              : '0.00'
            : '0.00',
          selected: true,
          product: lineFormik.values ? (lineFormik.values.product ? lineFormik.values.product : null) : null,
          employee: configData
            ? configData[0]
              ? configData[0].values
                ? configData[0].values.employee
                  ? configData[0].values.employee
                  : parentContext
                    ? parentContext.employee
                      ? parentContext.employee
                      : null
                    : null
                : null
              : null
            : null,
          date: moment(lineFormik.values.date).locale('en').format('YYYY-MM-DD'),
          sequence: 0,
          _form: true,
          _parent: {
            'employee.timesheetImputationSelect': 1,
            isCompleted: false,
            showEditor: false,
            periodTotal: '0',
            statusSelect: parentContext?.statusSelect || 1,
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
            employee: configData
              ? configData[0]
                ? configData[0].values
                  ? configData[0].values.employee
                    ? configData[0].values.employee
                    : parentContext
                      ? parentContext.employee
                        ? parentContext.employee
                        : null
                      : null
                  : null
                : null
              : null,
            fromDate: formik.values.fromDate,
            toDate: formik.values.toDate,
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
            _model: MODELS.TIMESHEET,
          },
        },
      },
    };
  };

  const validateDate = async () => {
    let action = 'action-timesheet-line-validate-date';
    const validateDateResponse = await api('POST', getActionUrl(), validateDatePayload(action));
    if (validateDateResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    let data = validateDateResponse.data.data;

    if (
      data &&
      checkFlashOrError(data) &&
      data[0] &&
      data[0].error.includes("This date is invalid. It must be included in the timesheet's period.")
    ) {
      return alertHandler('Error', t('TIMESHEET_LINE_INVALID_DATE'));
    }
  };

  useEffect(() => {
    if (lineFormik.values.duration !== '0.01' && mode !== 'view') {
      getLineHourDuration();
    }
  }, [lineFormik.values.duration]);
  useEffect(() => {
    if (lineFormik.values.date !== '' && mode !== 'view') {
      validateDate();
    }
  }, [lineFormik.values.date]);

  return (
    <Modal
      id="add-new-line"
      show={show}
      onHide={() => setShow(false)}
      dialogClassName="modal-90w"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      size="xl"
    >
      <Modal.Header closeButton>
        <h5 className="modal-title" id="add-new-line">
          {t(header)}
        </h5>
      </Modal.Header>
      <Modal.Body>
        <div className="container">
          <div className="row">
            {userId && (
              <div className="col-md-6">
                <SearchModalAxelor
                  formik={lineFormik}
                  modelKey="PROJECT"
                  mode={mode}
                  isRequired={false}
                  disabled={mode === 'view'}
                  onSuccess={onProjectSearchSuccess}
                  payloadDomain={`self.isShowTimeSpent = true AND self.imputable = true AND (${userId} MEMBER OF self.membersUserSet OR self.assignedTo.id = ${userId})       `}
                  defaultValueConfig={null}
                  selectIdentifier="fullName"
                />{' '}
              </div>
            )}
            {lineFormik.values && lineFormik.values.project && (
              <div className="col-md-6">
                <SearchModalAxelor
                  formik={lineFormik}
                  modelKey="TASK"
                  mode={mode}
                  isRequired={false}
                  disabled={mode === 'view'}
                  onSuccess={onTaskSearchSuccess}
                  payloadDomain={` self.project.id = ${lineFormik.values.project.id} AND self.project.isShowTimeSpent = true `}
                  defaultValueConfig={null}
                  selectIdentifier="fullName"
                />{' '}
              </div>
            )}
          </div>
          <div className="row">
            <div className="col-md-6">
              <DateInput
                formik={lineFormik}
                label="LBL_DATE"
                accessor="date"
                mode={mode}
                isRequired={mode !== 'view'}
                disabled={mode === 'view'}
              />
            </div>
            {showActivity && (
              <div className="col-md-6">
                <SearchModalAxelor
                  formik={lineFormik}
                  modelKey="ACTIVITY"
                  mode={mode}
                  isRequired={false}
                  disabled={mode === 'view'}
                  onSuccess={onProductSearchSuccess}
                  selectIdentifier="fullName"
                  payloadDomain={
                    lineFormik.values && lineFormik.values.project
                      ? "self.isActivity = true AND EXISTS(SELECT p FROM Project p WHERE p = :project AND self MEMBER OF p.productSet) AND self.dtype = 'Product'"
                      : "self.isActivity = true AND self.dtype = 'Product'"
                  }
                  payloadDomainContext={{
                    date: lineFormik.values
                      ? lineFormik.values.date
                        ? moment(lineFormik.values.date).locale('en').format('YYYY-MM-DD')
                        : null
                      : null,
                    toInvoice: false,
                    product: lineFormik.values ? (lineFormik.values.product ? lineFormik.values.product : null) : null,
                    comments: lineFormik.values ? (lineFormik.values.comments ? lineFormik.values.comments : null) : null,
                    projectTask: lineFormik.values ? (lineFormik.values.projectTask ? lineFormik.values.projectTask : null) : null,
                    project: lineFormik.values ? (lineFormik.values.project ? lineFormik.values.project : null) : null,
                    employee: configData
                      ? configData[0]
                        ? configData[0].values
                          ? configData[0].values.employee
                            ? configData[0].values.employee
                            : parentContext
                              ? parentContext.employee
                                ? parentContext.employee
                                : null
                              : null
                          : null
                        : null
                      : null,
                    version: line && line.version && line.version !== null ? line.version : null,
                    duration: lineFormik.values
                      ? lineFormik.values.duration
                        ? parseFloat(lineFormik.values.duration).toFixed(2).toString()
                        : null
                      : null,
                    durationForCustomer: null,
                    hoursDuration: lineFormik
                      ? lineFormik.values
                        ? lineFormik.values.hoursDuration
                          ? lineFormik.values.hoursDuration
                          : '0.00'
                        : '0.00'
                      : '0.00',
                    enableEditor: null,
                    id: line ? line.id : null,
                    //   sequence: 0,
                    'timesheet.toDate': parentContext ? (parentContext.toDate ? parentContext.toDate : null) : null,
                    selected: true,
                    _parent: parentContext,
                    _model: MODELS.TIMESHEET_LINE,
                  }}
                  defaultValueConfig={null}
                />{' '}
              </div>
            )}
            <div className="col-md-6">
              <NumberInput
                step={0.01}
                formik={lineFormik}
                label="LBL_DURATION"
                accessor="duration"
                mode={mode}
                isRequired={mode !== 'view'}
                disabled={mode === 'view'}
              />
            </div>
            <div className="col-md-6">
              <TextArea
                formik={lineFormik}
                label="LBL_COMMENTS"
                accessor="comments"
                mode={mode}
                isRequired={false}
                disabled={mode === 'view'}
              />
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="float-end">
          <CloseButton onClick={() => setShow(false)} />
          {mode !== 'view' && (
            <PurpleSaveButton
              onClick={() => {
                saveLine();
              }}
            />
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default TimesheetLineModal;
