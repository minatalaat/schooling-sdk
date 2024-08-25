import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import Spinner from '../../../components/Spinner/Spinner';
import ConfirmationPopup from '../../../components/ConfirmationPopup';
import MoreAction from '../../../parts/MoreAction';
import BreadCrumb from '../../../components/ui/BreadCrumb';
import BackButton from '../../../components/ui/buttons/BackButton';
import SaveButton from '../../../components/ui/buttons/SaveButton';
import CancelButton from '../../../components/ui/buttons/CancelButton';
import TimesheetForm from './TimesheetForm';
import ActionsProgessBar from '../../../parts/ActionsProgessBar';

import { useAxiosFunction } from '../../../hooks/useAxios';
import { getTodayDate } from '../../../utils/helpers';
import { useFeatures } from '../../../hooks/useFeatures';
import { getActionUrl, getFetchUrl, getSearchUrl } from '../../../services/getUrl';
import { MODELS } from '../../../constants/models';
import { FETCH_TIMESHEET_FIELDS } from './payloadsFields';
import { TIMESHEET_STATUS_REV_ENUMS, SEARCH_TIMESHEET_LINES_FIELDS } from '../timesheetEnums';
import { timesheetLinesActions } from '../../../store/timesheetLines';
import useMetaFields from '../../../hooks/metaFields/useMetaFields';
import { alertsActions } from '../../../store/alerts';

export default function ManageTimesheet({ enableEdit, feature, subFeature }) {
  const { canView, canEdit, canDelete, getFeaturePath } = useFeatures(feature, subFeature);
  const { api } = useAxiosFunction();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const statusSelect = useMetaFields('hrs.timesheet.status.select').list;

  const [timesheet, setTimesheet] = useState(null);
  const [configData, setConfigData] = useState(null);
  const [isSave, setIsSave] = useState(false);
  const [isConfirm, setIsConfirm] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isValidate, setIsValidate] = useState(false);
  const [isRefuse, setIsRefuse] = useState(false);
  const [isCancel, setIsCancel] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { id } = useParams();

  const [statusBarItems, setStatusBarItems] = useState(null);

  const checkShowStatusBar = configData => {
    if (
      (configData[2] && configData[2].attrs && configData[2].attrs.validateBtn) ||
      (configData[1] && configData[1].attrs && configData[1].attrs.validateBtn)
    ) {
      return true;
    }
  };

  const getStatusBarItems = configData => {
    if (checkShowStatusBar(configData)) {
      let statusBarItems = [
        {
          label: statusSelect[0].label,
          className: 'done',
        },
        {
          label: statusSelect[1].label,
          className: timesheet && timesheet.statusSelect >= TIMESHEET_STATUS_REV_ENUMS['LBL_WAITING_VALIDATION'] ? 'done' : 'default',
        },
      ];

      if (timesheet && timesheet.statusSelect === TIMESHEET_STATUS_REV_ENUMS['LBL_APPROVED']) {
        statusBarItems.push({
          label: statusSelect[2].label,
          className: 'done',
        });
      } else if (timesheet && timesheet.statusSelect === TIMESHEET_STATUS_REV_ENUMS['LBL_REFUSED']) {
        statusBarItems.push({
          label: statusSelect[3].label,
          className: 'done',
        });
      } else if (timesheet && timesheet.statusSelect === TIMESHEET_STATUS_REV_ENUMS['LBL_CANCELED']) {
        statusBarItems.push({
          label: statusSelect[5].label,
          className: 'done',
        });
      }

      setStatusBarItems(statusBarItems);
    }
  };

  const alertHandler = (title, message) => {
    dispatch(alertsActions.initiateAlert({ title, message }));
    setActionInProgress(false);

    if (title !== 'Success') {
      if (isSave) setIsSave(false);
      if (isConfirm) setIsConfirm(false);
      if (isComplete) setIsComplete(false);
      if (isValidate) setIsValidate(false);
      if (isRefuse) setIsRefuse(false);
      if (isDelete) setIsDelete(false);
      if (isCancel) setIsCancel(false);
    }
  };

  const finishedSaveHandler = status => {
    if (status === 'success') {
      alertHandler('Success', t('LBL_TIMESHEET_SAVED_SUCCESS'));
      setTimeout(() => {
        setIsSave(false);
        navigate(getFeaturePath(subFeature));
      }, 3000);
    } else {
      alertHandler('Error', t('SOMETHING_WENT_WORNG'));
    }
  };

  const finishedDeleteHandler = status => {
    if (status === 'success') {
      alertHandler('Success', t('LBL_TIMESHEET_DELETED_SUCCESS'));
      setTimeout(() => {
        setIsDelete(false);
      }, 3000);
    } else {
      alertHandler('Error', t('SOME_THING_WENT_WORNG'));
    }
  };

  const finishedCancelHandler = status => {
    if (status === 'success') {
      alertHandler('Success', t('LBL_TIMESHEET_CANCELED_SUCCESS'));
      setTimeout(() => {
        setIsCancel(false);
        navigate(getFeaturePath(subFeature));
      }, 3000);
    } else {
      alertHandler('Error', t('SOMETHING_WENT_WORNG'));
    }
  };

  const finishedConfirmHandler = status => {
    if (status === 'success') {
      alertHandler('Success', t('LBL_TIMESHEET_CONFIRMED_SUCCESS'));
      setTimeout(() => {
        setIsConfirm(false);
        navigate(getFeaturePath(subFeature));
      }, 3000);
    } else {
      alertHandler('Error', t('SOMETHING_WENT_WORNG'));
    }
  };

  const finishedCompleteHandler = status => {
    if (status === 'success') {
      alertHandler('Success', t('LBL_TIMESHEET_COMPLETED_SUCCESS'));
      setTimeout(() => {
        setIsComplete(false);
        navigate(getFeaturePath(subFeature));
      }, 3000);
    } else {
      alertHandler('Error', t('SOMETHING_WENT_WORNG'));
    }
  };

  const finishedValidateHandler = status => {
    if (status === 'success') {
      alertHandler('Success', t('LBL_TIMESHEET_VALIDATED_SUCCESS'));
      setTimeout(() => {
        setIsValidate(false);
        navigate(getFeaturePath(subFeature));
      }, 3000);
    } else {
      alertHandler('Error', t('SOMETHING_WENT_WORNG'));
    }
  };

  const finishedRefuseHandler = status => {
    if (status === 'success') {
      alertHandler('Success', t('LBL_TIMESHEET_REFUSED_SUCCESS'));
      setTimeout(() => {
        setIsRefuse(false);
        navigate(getFeaturePath(subFeature));
      }, 3000);
    } else {
      alertHandler('Error', t('SOMETHING_WENT_WORNG'));
    }
  };

  const getFetchTimesheetLinesPayload = ids => {
    return {
      fields: SEARCH_TIMESHEET_LINES_FIELDS,
      sortBy: ['sequence'],
      data: {
        _domain: 'self.id in (:_field_ids)',
        _domainContext: {
          id: id,
          _model: MODELS.TIMESHEET,
          _field: 'timesheetLineList',
          _field_ids: ids,
        },
        _archived: true,
      },
      limit: -1,
      offset: 0,
      translate: true,
    };
  };

  const fetchTimeSheetLines = async data => {
    let fieldIds = [];
    data &&
      data.forEach(item => {
        fieldIds.push(item.id);
      });

    if (fieldIds && fieldIds.length > 0) {
      const fetchTimesheetLinesResponse = await api('POST', getSearchUrl(MODELS.TIMESHEET_LINE), getFetchTimesheetLinesPayload(fieldIds));
      if (fetchTimesheetLinesResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      let data = fetchTimesheetLinesResponse.data.data;
      let tempLines = [];
      data &&
        data.forEach(item => {
          item.lineId = Math.floor(Math.random() * 100).toString();
          tempLines.push(item);
        });
      dispatch(timesheetLinesActions.setLines({ timesheetLines: tempLines }));
    }
  };

  const fetchTimesheet = async id => {
    // if (isLoading === false) setIsLoading(true);
    const timeSheetResponse = await api('POST', getFetchUrl(MODELS.TIMESHEET, id), {
      fields: FETCH_TIMESHEET_FIELDS,
      related: {},
    });
    if (!timeSheetResponse.data || timeSheetResponse.data.status !== 0 || !timeSheetResponse.data.data || !timeSheetResponse.data.data[0])
      return navigate('/error');
    setTimesheet(timeSheetResponse.data.data[0]);

    if (
      timeSheetResponse.data.data &&
      timeSheetResponse.data.data[0] &&
      timeSheetResponse.data.data[0].timesheetLineList &&
      timeSheetResponse.data.data[0].timesheetLineList.length > 0
    ) {
      fetchTimeSheetLines(timeSheetResponse.data.data[0].timesheetLineList);
    } else {
      dispatch(timesheetLinesActions.resetTimesheetLines());
    }

    getOnLoadConfigData(timeSheetResponse.data.data[0]);

    setIsLoading(false);
    return timeSheetResponse.data.data[0];
  };

  const viewHandler = () => {
    navigate(getFeaturePath(subFeature, 'view', { id }));
    setShowMoreAction(false);
  };

  const editHandler = () => {
    navigate(getFeaturePath(subFeature, 'edit', { id }));
    setShowMoreAction(false);
  };

  const deleteHandler = () => {
    setShowDelete(true);
  };

  const getDefaultConfigDataActionPayload = (action, data) => {
    return {
      model: MODELS.TIMESHEET,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: MODELS.TIMESHEET,
          // user_id: userId,
          _id: null,
          timesheetLineList: data?.timesheetLineList || null,
          toDate: data?.toDate || null,
          refusalDate: data?.refusalDate || null,
          showEditor: data?.showEditor || null,
          groundForRefusal: data?.groundForRefusal || null,
          validationDate: data?.validationDate || null,
          periodTotal: data?.periodTotal || null,
          employee: data?.employee || null,
          version: data && data.version !== null ? data.version : null,
          attrs: '{}',
          fromDate: data?.fromDate || null,
          statusSelect: data?.statusSelect || null,
          refusedBy: null,
          sentDate: null,
          timeLoggingPreferenceSelect: data?.timeLoggingPreferenceSelect || null,
          company: data?.company || null,
          validatedBy: null,
          id: data?.id || null,
          isCompleted: data ? data.isCompleted : false,
        },
      },
    };
  };

  const getOnNewConfigData = async data => {
    let action = 'action-group-timesheet-onnew,com.axelor.meta.web.MetaController:moreAttrs';
    const defaultConfigDataResponse = await api('POST', getActionUrl(), getDefaultConfigDataActionPayload(action, data));
    if (defaultConfigDataResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    setConfigData(defaultConfigDataResponse.data.data);
  };

  const getOnLoadConfigDataActionPayload = (action, data) => {
    return {
      model: MODELS.TIMESHEET,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: MODELS.TIMESHEET,
          // user_id: userId,
          _id: null,
          timesheetLineList: data?.timesheetLineList || null,
          toDate: data?.toDate || null,
          refusalDate: data?.refusalDate || null,
          showEditor: data?.showEditor || null,
          groundForRefusal: data?.groundForRefusal || null,
          validationDate: data?.validationDate || null,
          periodTotal: data?.periodTotal || null,
          employee: data?.employee || null,
          version: data && data.version !== null ? data.version : null,
          attrs: '{}',
          fromDate: data?.fromDate || null,
          statusSelect: data?.statusSelect || null,
          refusedBy: null,
          sentDate: null,
          timeLoggingPreferenceSelect: data?.timeLoggingPreferenceSelect || null,
          company: data?.company || null,
          validatedBy: null,
          id: data?.id || null,
          isCompleted: data ? data.isCompleted : false,
        },
      },
    };
  };

  const getOnLoadConfigData = async data => {
    let action = 'action-timesheet-group-onload,com.axelor.meta.web.MetaController:moreAttrs';
    const defaultConfigDataResponse = await api('POST', getActionUrl(), getOnLoadConfigDataActionPayload(action, data));
    if (defaultConfigDataResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    setConfigData(defaultConfigDataResponse.data.data);
  };

  const getFromDate = data => {
    if (id !== '0') {
      return timesheet?.fromDate || null;
    } else {
      return data[5] ? (data[5].values ? data[5].values.fromDate : '') : '';
    }
  };

  const readOnlyFromDate = data => {
    if (id !== '0') {
      return data[5] ? (data[5].attrs ? (data[5].attrs.fromDate ? data[5].attrs.fromDate.readonly : false) : false) : false;
    } else {
      return data[8] ? (data[8].attrs ? (data[8].attrs.fromDate ? data[8].attrs.fromDate.readonly : false) : false) : false;
    }
  };

  const findBtn = (data, key) => {
    return data ? (data.attrs ? (data.attrs[key] ? true : false) : false) : false;
  };

  const showBtn = (data, key) => {
    return data.attrs ? (data.attrs[key] ? !data.attrs[key].hidden : false) : false;
  };

  useEffect(() => {
    if (id && id !== '0') {
      fetchTimesheet(id);
    } else {
      setIsLoading(false);
      getOnNewConfigData();
      dispatch(timesheetLinesActions.resetTimesheetLines());
    }
  }, [id]);

  useEffect(() => {
    if (configData !== null) {
      getStatusBarItems(configData);
      getFromDate(configData);
    }
  }, [configData]);

  let isButtonDisabled = isSave || isDelete || isConfirm || isComplete || isValidate || isRefuse || isCancel;
  return (
    <>
      {showMoreAction && (
        <MoreAction
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          editHandler={!enableEdit && id !== null ? (canEdit ? editHandler : null) : null}
          viewHandler={enableEdit && id !== null ? (canView ? viewHandler : null) : null}
          deleteHandler={canDelete && id !== null ? deleteHandler : null}
          canSelectAll={false}
        />
      )}
      {actionInProgress && <div className="lodingpage"></div>}
      {isLoading && <Spinner />}
      <div className="page-body">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <div className="info-date-page float-end">
                <i className="calender-i"></i>
                <p>{t('DATE', getTodayDate())}</p>
              </div>
              <BreadCrumb feature={feature} subFeature={subFeature} modeText={t('LBL_COMPLETE_MY_TIMESHEET')} />
            </div>
          </div>
          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{t('LBL_COMPLETE_MY_TIMESHEET')}</h4>
              </div>
              <div className="reverse-page float-end">
                <BackButton disabled={isButtonDisabled} text="LBL_BACK" />
                {enableEdit &&
                  (timesheet === null || (timesheet && timesheet.statusSelect < TIMESHEET_STATUS_REV_ENUMS['LBL_WAITING_VALIDATION'])) && (
                    <SaveButton disabled={isButtonDisabled} onClick={() => setIsSave(true)} />
                  )}
                {enableEdit &&
                  configData &&
                  !findBtn(id !== '0' ? configData[1] : configData[2], 'completeBtn') &&
                  (timesheet === null || (timesheet && timesheet.statusSelect < TIMESHEET_STATUS_REV_ENUMS['LBL_WAITING_VALIDATION'])) && (
                    <SaveButton disabled={isButtonDisabled} text="LBL_CONFIRM" onClick={() => setIsConfirm(true)} />
                  )}
                {enableEdit && configData && findBtn(id !== '0' ? configData[1] : configData[2], 'completeBtn') && (
                  <SaveButton disabled={isButtonDisabled} text="LBL_COMPLETE" onClick={() => setIsComplete(true)} />
                )}
                {enableEdit && configData && showBtn(id !== '0' ? configData[1] : configData[2], 'validateBtn') && (
                  <SaveButton disabled={isButtonDisabled} text="LBL_APPROVE" onClick={() => setIsValidate(true)} />
                )}
                {enableEdit && configData && showBtn(id !== '0' ? configData[1] : configData[2], 'refuseBtn') && (
                  <CancelButton disabled={isButtonDisabled} text="LBL_REFUSE" onClick={() => setIsRefuse(true)} />
                )}
                {enableEdit && configData && showBtn(id !== '0' ? configData[1] : configData[2], 'cancelBtn') && (
                  <CancelButton disabled={isButtonDisabled} text="LBL_CANCEL" onClick={() => setIsCancel(true)} />
                )}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              {!isLoading && (
                <ActionsProgessBar
                  feature={feature}
                  subfeature={subFeature}
                  setShowMoreAction={setShowMoreAction}
                  editHandler={
                    !enableEdit && id !== '0' && timesheet && timesheet.statusSelect < TIMESHEET_STATUS_REV_ENUMS['LBL_APPROVED']
                      ? canEdit
                        ? editHandler
                        : null
                      : null
                  }
                  viewHandler={enableEdit && id !== '0' ? (canView ? viewHandler : null) : null}
                  deleteHandler={
                    canDelete && id !== '0' && timesheet && timesheet.statusSelect < TIMESHEET_STATUS_REV_ENUMS['LBL_APPROVED']
                      ? deleteHandler
                      : null
                  }
                  statusBarItems={statusBarItems}
                  currentStatusLabel={
                    (timesheet && t(TIMESHEET_STATUS_REV_ENUMS[timesheet.statusSelect])) || t(TIMESHEET_STATUS_REV_ENUMS[1])
                  }
                />
              )}
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              {showDelete && (
                <ConfirmationPopup
                  item={timesheet.fromDate}
                  onClickHandler={() => {
                    setIsDelete(true);
                    setShowDelete(false);
                  }}
                  setConfirmationPopup={setShowDelete}
                />
              )}
              {!isLoading && (
                <>
                  {configData && (
                    <>
                      {(enableEdit === true || enableEdit === false) && (
                        <TimesheetForm
                          enableEdit={enableEdit}
                          data={timesheet}
                          configData={configData}
                          isSave={isSave}
                          isCancel={isCancel}
                          isConfirm={isConfirm}
                          isComplete={isComplete}
                          isValidate={isValidate}
                          isRefuse={isRefuse}
                          finishedSaveHandler={finishedSaveHandler}
                          isDelete={false}
                          finishedDeleteHandler={finishedDeleteHandler}
                          finishedConfirmHandler={finishedConfirmHandler}
                          finishedCompleteHandler={finishedCompleteHandler}
                          finishedValidateHandler={finishedValidateHandler}
                          finishedRefuseHandler={finishedRefuseHandler}
                          finishedCancelHandler={finishedCancelHandler}
                          alertHandler={alertHandler}
                          setActionInProgress={setActionInProgress}
                          fromDate={configData !== null ? getFromDate(configData) : null}
                          fromDateReadOnly={configData !== null ? readOnlyFromDate(configData) : false}
                          fetchTimesheet={fetchTimesheet}
                        />
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
