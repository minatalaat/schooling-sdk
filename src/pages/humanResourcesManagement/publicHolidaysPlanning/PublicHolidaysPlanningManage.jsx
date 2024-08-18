import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import Spinner from '../../../components/Spinner/Spinner';
import PublicHolidaysPlanningForm from './PublicHolidaysPlanningForm';
import ConfirmationPopup from '../../../components/ConfirmationPopup';
import ActionsProgessBar from '../../../parts/ActionsProgessBar';
import MoreAction from '../../../parts/MoreAction';
import BreadCrumb from '../../../components/ui/BreadCrumb';
import BackButton from '../../../components/ui/buttons/BackButton';
import Calendar from '../../../components/ui/Calendar';

import { MODELS } from '../../../constants/models';
import { useAxiosFunction } from '../../../hooks/useAxios';
import { getFetchUrl, getSearchUrl } from '../../../services/getUrl';
import { useFeatures } from '../../../hooks/useFeatures';
import { alertsActions } from '../../../store/alerts';

const PublicHolidaysPlanningManage = ({ addNew, enableEdit }) => {
  const feature = 'HR_MANAGEMENT';
  const subFeature = 'PUBLIC_HOLIDAYS_PLANNING';

  const { api } = useAxiosFunction();
  const { canView, canEdit, canDelete, getFeaturePath } = useFeatures(feature, subFeature);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [unit, setPublicHolidayPlan] = useState({});
  const [isSave, setIsSave] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [isLoading, setIsLoading] = useState(addNew ? false : true);

  const { id } = useParams();

  const fields = ['name', 'eventsPlanningLineList'];

  const alertHandler = (title, message) => {
    dispatch(alertsActions.initiateAlert({ title, message }));

    if (title !== 'Success') {
      if (isSave) setIsSave(false);
      if (isDelete) setIsDelete(false);
    }
  };

  const finshedSaveHandler = status => {
    if (status === 'success') {
      alertHandler('Success', t('PUBLIC_HOLIDAY_PLAN_SAVED_SUCCESS'));
      setTimeout(() => {
        setIsSave(false);
        navigate(getFeaturePath(subFeature));
      }, 3000);
    } else {
      alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    }
  };

  const finshedDeleteHandler = status => {
    if (status === 'success') {
      alertHandler('Success', t('PUBLIC_HOLIDAY_PLAN_DELETED_SUCCESS'));
      setTimeout(() => {
        setIsDelete(false);
        navigate(getFeaturePath(subFeature));
      }, 3000);
    } else {
      alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    }
  };

  const fetchPublicHolidaysPlan = () => {
    const payload = {
      fields: fields,
      related: {},
    };
    return api('POST', getFetchUrl(MODELS.EVENTS_PLANNING, id), payload);
  };

  const fetchPublicHolidaysPlanLines = (planId, idList) => {
    let payload = {
      fields: ['date', 'year', 'description'],
      sortBy: ['date'],
      data: {
        _archived: true,
        _domain: 'self.id in (:_field_ids)',
        _domainContext: {
          id: planId,
          _field: 'eventsPlanningLineList',
          _field_ids: idList,
          _model: MODELS.EVENTS_PLANNING_LINE,
        },
        operator: 'and',
        criteria: [],
      },
      operator: 'and',
      criteria: [],
      limit: -1,
      offset: 0,
      translate: true,
    };
    return api('POST', getSearchUrl(MODELS.EVENTS_PLANNING_LINE), payload);
  };

  const fetchElementData = async () => {
    if (isLoading === false && !addNew) setIsLoading(true);

    if (addNew) return null;

    const fetchResponse = await fetchPublicHolidaysPlan();

    if (
      !fetchResponse ||
      !fetchResponse.data ||
      fetchResponse.data.status !== 0 ||
      !fetchResponse.data.data ||
      !fetchResponse.data.data[0]
    ) {
      setIsLoading(false);
      navigate('/error');
      return null;
    }

    let fetchedPublicHoildaysPlan = { ...fetchResponse.data.data[0] };

    let idsList = fetchedPublicHoildaysPlan.eventsPlanningLineList?.map(line => line.id) || [];

    if (idsList.length === 0) {
      setIsLoading(false);
      return setPublicHolidayPlan(fetchedPublicHoildaysPlan);
    }

    const searchResponse = await fetchPublicHolidaysPlanLines(fetchedPublicHoildaysPlan.id, idsList);

    if (
      !searchResponse ||
      !searchResponse.data ||
      searchResponse.data.status !== 0 ||
      !searchResponse.data.data ||
      !searchResponse.data.total
    ) {
      setIsLoading(false);
      navigate('/error');
      return null;
    }

    let newFetchedPublicHoildaysPlan = { ...fetchedPublicHoildaysPlan, eventsPlanningLineList: [...searchResponse.data.data] };

    setPublicHolidayPlan(newFetchedPublicHoildaysPlan);
    setIsLoading(false);
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

  useEffect(() => {
    fetchElementData();
  }, [addNew, enableEdit]);

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
              <Calendar />
              <BreadCrumb
                feature={feature}
                subFeature={subFeature}
                modeText={
                  !addNew && enableEdit
                    ? `${t('LBL_EDIT')} ${t('LBL_PUBLIC_HOLIDAYS_PLAN')}`
                    : !addNew && !enableEdit
                      ? `${t('LBL_VIEW')} ${t('LBL_PUBLIC_HOLIDAYS_PLAN')}`
                      : 'LBL_ADD_PUBLIC_HOLIDAYS_PLAN'
                }
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{addNew ? t('LBL_NEW_PUBLIC_HOLIDAYS_PLAN') : unit.name ? unit.name : ''}</h4>
              </div>

              <div className="reverse-page float-end">
                <BackButton text={addNew ? t('LBL_CANCEL') : t('LBL_BACK')} disabled={isSave || isDelete} />
                {(addNew || enableEdit) && (
                  <button className="btn btn-save" onClick={() => setIsSave(true)} disabled={isSave || isDelete}>
                    {t('LBL_SAVE')}
                  </button>
                )}
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
                />
              )}
              {showDelete && (
                <ConfirmationPopup
                  item={unit.name}
                  onClickHandler={() => {
                    setIsDelete(true);
                    setShowDelete(false);
                  }}
                  setConfirmationPopup={setShowDelete}
                />
              )}
              {!isLoading && (
                <div className="card">
                  <div className="row">
                    {(Object.keys(unit).length > 0 || addNew) && (
                      <>
                        {!addNew && (
                          <PublicHolidaysPlanningForm
                            enableEdit={enableEdit}
                            data={unit}
                            isSave={isSave}
                            finshedSaveHandler={finshedSaveHandler}
                            isDelete={isDelete}
                            finshedDeleteHandler={finshedDeleteHandler}
                            alertHandler={alertHandler}
                            setActionInProgress={setActionInProgress}
                          />
                        )}
                        {addNew && (
                          <PublicHolidaysPlanningForm
                            data={unit}
                            addNew={addNew}
                            isSave={isSave}
                            finshedSaveHandler={finshedSaveHandler}
                            alertHandler={alertHandler}
                            setActionInProgress={setActionInProgress}
                          />
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PublicHolidaysPlanningManage;
