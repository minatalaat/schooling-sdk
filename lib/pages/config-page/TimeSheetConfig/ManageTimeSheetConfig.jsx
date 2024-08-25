import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import Spinner from '../../../components/Spinner/Spinner';
import MoreAction from '../../../parts/MoreAction';
import BreadCrumb from '../../../components/ui/BreadCrumb';
import BackButton from '../../../components/ui/buttons/BackButton';
import SaveButton from '../../../components/ui/buttons/SaveButton';
import ActionsProgessBar from '../../../parts/ActionsProgessBar';

import { useAxiosFunction } from '../../../hooks/useAxios';
import { getTodayDate } from '../../../utils/helpers';
import TimeSheetConfigForm from './TimeSheetConfigForm';
import { getFetchUrl } from '../../../services/getUrl';
import { MODELS } from '../../../constants/models';
import { TIMESHEET_FETCH_FIELDS } from './payloadsFields';
import { alertsActions } from '../../../store/alerts';

export default function ManageTimeSheetConfig({ addNew, enableEdit }) {
  const feature = 'APP_CONFIG';
  const subFeature = 'CONFIG';

  const { api } = useAxiosFunction();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [isSave, setIsSave] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timesheetData, setTimesheetData] = useState(null);

  const alertHandler = (title, message) => {
    if (message) {
      dispatch(alertsActions.initiateAlert({ title, message }));
      setActionInProgress(false);
    } else {
      if (isSave) setIsSave(false);
    }
  };

  const finishedSaveHandler = (type, message) => {
    if (type === 'Success') {
      alertHandler('Success', message);
      setTimeout(() => {
        setIsSave(false);
      }, [3000]);
    } else {
      alertHandler('error', t('SOMETHING_WENT_WRONG'));
    }
  };

  const getFetchPayload = () => {
    return {
      fields: TIMESHEET_FETCH_FIELDS,
      related: {},
    };
  };

  const fetchAppTimeSheet = async () => {
    const appTimesheetDefaultResponse = await api('POST', getFetchUrl(MODELS.APP_TIMESHEET, 2), getFetchPayload());
    if (appTimesheetDefaultResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    setTimesheetData(appTimesheetDefaultResponse.data.data[0]);
    setIsLoading(false);
    return appTimesheetDefaultResponse.data.data[0];
  };

  const getAppTimeSheetDefaults = async () => {
    fetchAppTimeSheet();
  };

  useEffect(() => {
    getAppTimeSheetDefaults();
  }, [addNew]);

  let isButtonDisabled = isSave;
  return (
    <>
      {showMoreAction && (
        <MoreAction
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          editHandler={null}
          viewHandler={null}
          deleteHandler={null}
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
              <BreadCrumb feature={feature} subFeature={subFeature} modeText={t('LBL_APP_TIME_SHEET')} />
            </div>
          </div>
          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{t('LBL_APP_TIME_SHEET')}</h4>
              </div>
              <div className="reverse-page float-end">
                <BackButton disabled={isButtonDisabled} text="LBL_BACK" />
                <SaveButton disabled={isButtonDisabled} onClick={() => setIsSave(true)} />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              {!isLoading && !addNew && (
                <ActionsProgessBar
                  feature={feature}
                  subfeature={subFeature}
                  editHandler={null}
                  viewHandler={null}
                  deleteHandler={null}
                  setShowMoreAction={setShowMoreAction}
                  statusBarItems={null}
                  currentStatusLabel={null}
                />
              )}
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              {!isLoading && (
                <>
                  {addNew && (
                    <TimeSheetConfigForm
                      data={timesheetData}
                      isSave={isSave}
                      finishedSaveHandler={finishedSaveHandler}
                      setActionInProgress={setActionInProgress}
                      alertHandler={alertHandler}
                      fetchAppTimeSheet={fetchAppTimeSheet}
                    />
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
