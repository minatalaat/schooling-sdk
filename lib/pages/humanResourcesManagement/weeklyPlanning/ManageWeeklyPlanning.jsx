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
import ActionsProgessBar from '../../../parts/ActionsProgessBar';
import WeeklyPlanningForm from './WeeklyPlanningForm';

import { useAxiosFunction } from '../../../hooks/useAxios';
import { checkFlashOrError, getTodayDate } from '../../../utils/helpers';
import { useFeatures } from '../../../hooks/useFeatures';
import { getActionUrl, getFetchUrl, getSearchUrl } from '../../../services/getUrl';
import { modelsEnum } from '../../../constants/modelsEnum/modelsEnum';
import { WEEKLY_PLANNING_FETCH_FIELDS, DAY_PLANNING_SEARCH_FIELDS } from './WeeklyPlanningPayloadsFields';
import { MODELS } from '../../../constants/models';
import { weekDaysActions } from '../../../store/weekDays';
import { alertsActions } from '../../../store/alerts';

export default function ManageWeeklyPlanning({ addNew, enableEdit }) {
  const feature = 'HR_MANAGEMENT';
  const subFeature = 'WEEKLY_PLANNING';
  const { canView, canEdit, canDelete, getFeaturePath } = useFeatures(feature, subFeature);

  const { api } = useAxiosFunction();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [weeklyPlanning, setWeeklyPlanning] = useState(null);
  const [isSave, setIsSave] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [isLoading, setIsLoading] = useState(addNew ? false : true);
  const { id } = useParams();

  const alertHandler = (title, message) => {
    if (message) {
      dispatch(alertsActions.initiateAlert({ title, message }));
      setActionInProgress(false);

      if (title !== 'Success') {
        if (isSave) setIsSave(false);
        if (isDelete) setIsDelete(false);
      }
    } else {
      if (isSave) setIsSave(false);
      if (isDelete) setIsDelete(false);
    }
  };

  const onDayPlanningSearchSuccess = response => {
    if (response.data.status === 0) {
      let data = response.data.data;

      if (data && checkFlashOrError(data)) {
        dispatch(weekDaysActions.resetWeekDays());
      } else {
        let tempWeekDays = [];
        data &&
          data.forEach(item => {
            tempWeekDays.push({
              ...item,
              lineId: Math.floor(Math.random() * 100).toString(),
            });
          });
        dispatch(weekDaysActions.setLines({ weekDays: tempWeekDays }));
      }
    }
  };

  const getDayPlanningPayload = data => {
    let fetchLineArray = [];
    data &&
      data.length > 0 &&
      data.forEach(item => {
        fetchLineArray.push(item.id);
      });

    if (fetchLineArray && fetchLineArray.length > 0) {
      let payload = {
        fields: DAY_PLANNING_SEARCH_FIELDS,
        sortBy: ['sequence'],
        data: {
          _domain: 'self.id in (:_field_ids)',
          _domainContext: {
            id: weeklyPlanning?.id,
            _model: MODELS.WEEKLY_PLANNING,
            _field: 'weekDays',
            _field_ids: fetchLineArray,
          },
          _archived: true,
        },
        limit: -1,
        offset: 0,
        translate: true,
      };
      return payload;
    } else {
      return null;
    }
  };

  const getWeekDays = async data => {
    api('POST', getSearchUrl(MODELS.DAY_PLANNING), getDayPlanningPayload(data?.weekDays || null), onDayPlanningSearchSuccess);
  };

  const fetchWeeklyPlaning = async id => {
    // if (isLoading === false) setIsLoading(true);
    const weeklyPlanningFetchResponse = await api('POST', getFetchUrl(MODELS.WEEKLY_PLANNING, id), {
      fields: WEEKLY_PLANNING_FETCH_FIELDS,
      related: {},
    });
    if (
      !weeklyPlanningFetchResponse.data ||
      weeklyPlanningFetchResponse.data.status !== 0 ||
      !weeklyPlanningFetchResponse.data.data ||
      !weeklyPlanningFetchResponse.data.data[0]
    )
      return navigate('/error');
    // let tempFetchedStockCorrection =stockCorrectionResponse.data.data[0]
    // let fetchedStockCorrection={
    //   name:tempFetchedStockCorrection?tempFetchedStockCorrection.product?tempFetchedStockCorrection.product.fullName:'':'':'',
    // }

    if (
      weeklyPlanningFetchResponse.data.data[0] &&
      weeklyPlanningFetchResponse.data.data[0].weekDays &&
      weeklyPlanningFetchResponse.data.data[0].weekDays.length > 0
    ) {
      getWeekDays(weeklyPlanningFetchResponse.data.data[0]);
    } else {
      dispatch(weekDaysActions.resetDepreciationLines());
    }

    setIsLoading(false);
    setWeeklyPlanning(weeklyPlanningFetchResponse.data.data[0]);
    return weeklyPlanningFetchResponse.data.data[0];
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

  const finishedSaveHandler = (type, message) => {
    if (type === 'Success') {
      alertHandler('Success', message);
      setTimeout(() => {
        setIsSave(false);
        navigate(getFeaturePath(subFeature));
      }, [3000]);
    } else {
      alertHandler('error', t('SOMETHING_WENT_WRONG'));
    }
  };

  const finishedDeleteHandler = (type, message) => {
    if (type === 'Success') {
      alertHandler('Success', message);
      setTimeout(() => {
        setIsDelete(false);
        navigate(getFeaturePath(subFeature));
      }, [3000]);
    } else {
      alertHandler('error', t('SOMETHING_WENT_WRONG'));
    }
  };

  const getOnNewWeeklyPlanPayload = action => {
    return {
      model: MODELS.WEEKLY_PLANNING,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: MODELS.WEEKLY_PLANNING,
          _id: null,
          weekDays: [],
          _viewType: 'form',
          _viewName: 'weekly-planning-form',
          _views: [
            {
              type: 'grid',
              name: 'weekly-planning-grid',
            },
            {
              type: 'form',
              name: 'weekly-planning-form',
            },
          ],
          _source: 'form',
        },
      },
    };
  };

  const onNewWeeklyPlan = async () => {
    let action =
      'com.axelor.apps.base.web.weeklyplanning.WeeklyPlanningController:initPlanning,com.axelor.meta.web.MetaController:moreAttrs';
    const onNewWeeklyPlanResponse = await api('POST', getActionUrl(), getOnNewWeeklyPlanPayload(action));
    if (onNewWeeklyPlanResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    let data = onNewWeeklyPlanResponse.data.data;
    if (data && checkFlashOrError(data)) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    let tempWeeklyPlanning = [];
    data[0].values.weekDays[0].weeklyPlanning.weekDays.forEach(item => {
      tempWeeklyPlanning.push({
        ...item,
        lineId: Math.floor(Math.random() * 100).toString(),
      });
    });
    dispatch(weekDaysActions.setLines({ weekDays: tempWeeklyPlanning }));
  };

  useEffect(() => {
    if (addNew) {
      onNewWeeklyPlan();
      dispatch(weekDaysActions.resetWeekDays());
    } else {
      dispatch(weekDaysActions.resetWeekDays());
      fetchWeeklyPlaning(id);
    }
  }, [addNew, enableEdit]);

  let isButtonDisabled = isSave || isDelete;
  return (
    <>
      {showMoreAction && (
        <MoreAction
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          editHandler={!enableEdit ? (canEdit ? editHandler : null) : null}
          viewHandler={enableEdit ? (canView ? viewHandler : null) : null}
          deleteHandler={canDelete ? deleteHandler : null}
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
              <BreadCrumb
                feature={feature}
                subFeature={subFeature}
                modeText={
                  !addNew && enableEdit
                    ? `${t('LBL_EDIT')} ${t(modelsEnum[subFeature].titleSingular)}`
                    : !addNew && !enableEdit
                      ? `${t('LBL_VIEW')} ${t(modelsEnum[subFeature].titleSingular)}`
                      : `${t('LBL_ADD_NEW')} ${t(modelsEnum[subFeature].titleSingular)}`
                }
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>
                  {addNew
                    ? t('LBL_NEW_WEEKLY_PLANNING')
                    : enableEdit
                      ? `${t('LBL_EDIT')} ${t(modelsEnum[subFeature].titleSingular)}`
                      : `${t('LBL_VIEW')} ${t(modelsEnum[subFeature].titleSingular)}`}
                </h4>
              </div>
              <div className="reverse-page float-end">
                <BackButton disabled={isButtonDisabled} text="LBL_BACK" />
                {(addNew || enableEdit) && <SaveButton disabled={isButtonDisabled} onClick={() => setIsSave(true)} />}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              {!isLoading && !addNew && (
                <ActionsProgessBar
                  feature={feature}
                  subfeature={subFeature}
                  editHandler={!enableEdit ? (canEdit ? editHandler : null) : null}
                  viewHandler={enableEdit ? (canView ? viewHandler : null) : null}
                  deleteHandler={canDelete ? deleteHandler : null}
                  setShowMoreAction={setShowMoreAction}
                  statusBarItems={null}
                  currentStatusLabel={null}
                />
              )}
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              {showDelete && (
                <ConfirmationPopup
                  item={weeklyPlanning?.name || ''}
                  onClickHandler={() => {
                    setIsDelete(true);
                    setShowDelete(false);
                  }}
                  setConfirmationPopup={setShowDelete}
                />
              )}
              {!isLoading && (
                <>
                  {((weeklyPlanning && Object.keys(weeklyPlanning).length > 0) || addNew) && (
                    <>
                      {!addNew && (
                        <WeeklyPlanningForm
                          enableEdit={enableEdit}
                          data={weeklyPlanning}
                          fetchFixedAsset={fetchWeeklyPlaning}
                          isSave={isSave}
                          isDelete={isDelete}
                          alertHandler={alertHandler}
                          setActionInProgress={setActionInProgress}
                          finishedSaveHandler={finishedSaveHandler}
                          finishedDeleteHandler={finishedDeleteHandler}
                        />
                      )}
                      {addNew && (
                        <WeeklyPlanningForm
                          data={weeklyPlanning}
                          fetchFixedAsset={weeklyPlanning}
                          addNew={addNew}
                          isSave={isSave}
                          isDelete={isDelete}
                          alertHandler={alertHandler}
                          setActionInProgress={setActionInProgress}
                          finishedSaveHandler={finishedSaveHandler}
                          finishedDeleteHandler={finishedDeleteHandler}
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
