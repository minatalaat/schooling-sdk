import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import Spinner from '../../components/Spinner/Spinner';
import FiscalYearForm from './FiscalYearForm';
import ConfirmationPopup from '../../components/ConfirmationPopup';
import MoreAction from '../../parts/MoreAction';
import BreadCrumb from '../../components/ui/BreadCrumb';
import BackButton from '../../components/ui/buttons/BackButton';
import Calendar from '../../components/ui/Calendar';
import ActionsProgessBar from '../../parts/ActionsProgessBar';

import { MODELS } from '../../constants/models';
import { useAxiosFunction } from '../../hooks/useAxios';
import { getFetchUrl, getSearchUrl } from '../../services/getUrl';
import { useFeatures } from '../../hooks/useFeatures';
import { alertsActions } from '../../store/alerts';

const FiscalYearsEdit = ({ addNew, enableEdit }) => {
  const feature = 'APP_CONFIG';
  const subFeature = 'FISCAL_YEARS';

  const { api } = useAxiosFunction();
  const { canView, canDelete, canEdit, getFeaturePath } = useFeatures(feature, subFeature);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [fiscalYear, setFiscalYear] = useState({});
  const [isSave, setIsSave] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [periodList, setPeriodList] = useState(null);
  const [periodLoading, setPeriodLoading] = useState(true);
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [closeFYStart, setCloseFYStart] = useState(false);
  const [isLoading, setIsLoading] = useState(addNew ? false : true);

  const { id } = useParams();

  const fields = [
    'name',
    'code',
    'fromDate',
    'toDate',
    'reportedBalanceDate',
    'company',
    'periodList',
    'statusSelect',
    'periodDurationSelect',
    'typeSelect',
    'closureDateTime',
  ];

  const alertHandler = (title, message) => {
    if (message) dispatch(alertsActions.initiateAlert({ title, message }));
    if (isSave) setIsSave(false);
    if (isDelete) setIsDelete(false);
  };

  const finshedSaveHandler = status => {
    if (status === 'success') {
      alertHandler('Success', t('FISCAL_YEAR_SAVED_SUCCESS'));
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
      alertHandler('Success', t('FISCAL_YEAR_DELETED_SUCCESS'));
      setTimeout(() => {
        setIsDelete(false);
        navigate(getFeaturePath(subFeature));
      }, 3000);
    } else {
      alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    }
  };

  const fetchFiscalYear = () => {
    setIsLoading(true);
    const payload = {
      fields: fields,
      related: {},
    };
    return api('POST', getFetchUrl(MODELS.FISCALYEAR, id), payload);
  };

  const fetchPeriods = data => {
    let idList = [];
    data.periodList.map(period => idList.push(period.id));
    let payload = {
      data: {
        _archived: true,
        _domain: 'self.id in (:_field_ids)',
        _domainContext: {
          id: data.id,
          _field: 'periodList',
          _field_ids: idList,
          _model: MODELS.FISCALYEAR,
        },
      },
      fields: ['fromDate', 'year.company', 'statusSelect', 'code', 'year', 'toDate', 'name', 'closureDateTime'],
      limit: -1,
      offset: 0,
      sortBy: ['fromDate'],
      translate: true,
    };
    return api('POST', getSearchUrl(MODELS.PERIOD), payload);
  };

  const fetchElementData = async () => {
    if (isLoading === false && !addNew) setIsLoading(true);

    if (addNew) return null;

    const fiscalYearResponse = await fetchFiscalYear();

    if (
      !fiscalYearResponse ||
      !fiscalYearResponse.data ||
      fiscalYearResponse.data.status !== 0 ||
      !fiscalYearResponse.data.data ||
      !fiscalYearResponse.data.data[0]
    ) {
      setIsLoading(false);
      navigate('/error');
      return null;
    }

    let fiscalYearData = fiscalYearResponse.data.data[0];

    if (fiscalYearData?.periodList?.length > 0 || false) {
      setPeriodLoading(true);
      const periodsResponse = await fetchPeriods(fiscalYearData);

      if (!periodsResponse || !periodsResponse.data || periodsResponse.data.status !== 0 || !periodsResponse.data.data) {
        setIsLoading(false);
        setPeriodLoading(false);
        navigate('/error');
        return null;
      }

      setPeriodList([...periodsResponse.data.data]);
      setFiscalYear({ ...fiscalYearData });
      setIsLoading(false);
      setPeriodLoading(false);
      return null;
    }

    setFiscalYear({ ...fiscalYearData });
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
                feature="APP_CONFIG"
                subFeature="FISCAL_YEARS"
                modeText={
                  !addNew && enableEdit
                    ? `${t('LBL_EDIT')} ${t('LBL_FISCAL_YEAR')}`
                    : !addNew && !enableEdit
                      ? `${t('LBL_VIEW')} ${t('LBL_FISCAL_YEAR')}`
                      : 'LBL_ADD_FISCAL_YEAR'
                }
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{addNew ? t('LBL_NEW_FISCAL_YEAR') : fiscalYear.name ? fiscalYear.name : ''}</h4>
              </div>

              <div className="reverse-page float-end">
                <BackButton disabled={isSave || isDelete} text={addNew ? 'LBL_CANCEL' : 'LBL_BACK'} />
                {(addNew || enableEdit) && !closeFYStart && (
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
                  editHandler={
                    !enableEdit ? (canEdit && !(fiscalYear.statusSelect && fiscalYear.statusSelect === 2) ? editHandler : null) : null
                  }
                  deleteHandler={canDelete ? deleteHandler : null}
                  viewHandler={enableEdit ? (canView ? viewHandler : null) : null}
                  setShowMoreAction={setShowMoreAction}
                />
              )}
              {showDelete && (
                <ConfirmationPopup
                  item={fiscalYear.name}
                  onClickHandler={() => {
                    setIsDelete(true);
                    setShowDelete(false);
                  }}
                  setConfirmationPopup={setShowDelete}
                />
              )}
              <div className="row">
                {(Object.keys(fiscalYear).length > 0 || addNew) && (
                  <>
                    {!addNew && (
                      <FiscalYearForm
                        enableEdit={enableEdit}
                        data={fiscalYear}
                        isSave={isSave}
                        finshedSaveHandler={finshedSaveHandler}
                        isDelete={isDelete}
                        finshedDeleteHandler={finshedDeleteHandler}
                        alertHandler={alertHandler}
                        setActionInProgress={setActionInProgress}
                        refreshData={fetchFiscalYear}
                        periodList={periodList}
                        setPeriodList={setPeriodList}
                        periodLoading={periodLoading}
                        closeFYStart={closeFYStart}
                        setCloseFYStart={setCloseFYStart}
                      />
                    )}
                    {addNew && (
                      <FiscalYearForm
                        data={fiscalYear}
                        addNew={addNew}
                        isSave={isSave}
                        finshedSaveHandler={finshedSaveHandler}
                        alertHandler={alertHandler}
                        setActionInProgress={setActionInProgress}
                        periodList={periodList}
                        setPeriodList={setPeriodList}
                        periodLoading={periodLoading}
                        closeFYStart={closeFYStart}
                        setCloseFYStart={setCloseFYStart}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FiscalYearsEdit;
