import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import Toolbar from '../../../parts/Toolbar';
import NoData from '../../../components/NoData';
import NoStockCountImg from '../../../assets/images/icons/Products.svg';
import MoreAction from '../../../parts/MoreAction';
import BreadCrumb from '../../../components/ui/BreadCrumb';
import Table from '../../../components/ListingTable/Table';
import TableRow from '../../../components/ListingTable/TableRow';
import CardsList from '../../../components/CardsList/CardsList';
import Card from '../../../components/CardsList/Card';
import Spinner from '../../../components/Spinner/Spinner';
import AddButton from '../../../components/ui/buttons/AddButton';
import Calendar from '../../../components/ui/Calendar';
import { getSearchUrl } from '../../../services/getUrl';
import { useFeatures } from '../../../hooks/useFeatures';
import { useAxiosFunction } from '../../../hooks/useAxios';
import { MODELS } from '../../../constants/models';
import { WEEKLY_PLANNING_SEARCH_FIELDS } from './WeeklyPlanningPayloadsFields';
import { alertsActions } from '../../../store/alerts';

const WeeklyPlanning = () => {
  const feature = 'HR_MANAGEMENT';
  const subFeature = 'WEEKLY_PLANNING';
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getFeaturePath } = useFeatures();
  const { api } = useAxiosFunction();
  const { canAdd, canDelete } = useFeatures(feature, subFeature);
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(true);
  const [weeklyPlanning, setWeeklyPlanning] = useState([]);
  const [show, setShow] = useState('table');
  const [checked, setChecked] = useState([]);
  const [total, setTotal] = useState(0);

  let searchValue = searchParams.get('search') || '';
  let currentPage = parseInt(searchParams.get('currentPage') || 1);
  let pageSize = parseInt(searchParams.get('pageSize') || 10);
  let offset = (currentPage - 1) * pageSize;

  const [windowSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);

  const alertHandler = (title, message) => dispatch(alertsActions.initiateAlert({ title, message }));

  const searchPayload = {
    fields: WEEKLY_PLANNING_SEARCH_FIELDS,
    sortBy: null,
    data: {
      _domain: null,
      _domainContext: { _id: null, _model: MODELS.WEEKLY_PLANNING },
      operator: 'and',
      criteria: [],
    },
    limit: pageSize,
    offset: offset,
    translate: true,
  };

  const searchPayloadwithValue = {
    fields: WEEKLY_PLANNING_SEARCH_FIELDS,
    sortBy: ['-id'],
    data: {
      _domain: null,
      _domainContext: { _id: null, _model: MODELS.WEEKLY_PLANNING },
      operator: 'or',
      criteria: [
        {
          fieldName: 'name',
          operator: 'like',
          value: searchValue,
        },
      ],
    },
    limit: pageSize,
    offset: offset,
    translate: true,
  };

  const fields = [{ accessor: 'name', Header: t('LBL_NAME'), type: 'text' }];

  const subTitles = [];

  useEffect(() => {
    const handleWindowResize = () => {
      setWindowSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    setChecked([]);
    getWeeklyPlanning();
  }, [searchParams]);

  const getWeeklyPlanning = () => {
    if (searchValue === '') {
      setWeeklyPlanning([]);
      setIsLoading(true);
    }

    let payload = searchValue && searchValue !== '' ? searchPayloadwithValue : searchPayload;
    api('POST', getSearchUrl(MODELS.WEEKLY_PLANNING), payload, onWeeklyPlanningSearchSuccess);
  };

  const onWeeklyPlanningSearchSuccess = response => {
    let status = response.data.status;
    let data = response.data.data;
    let total = response.data.total;
    setIsLoading(false);

    if (status !== 0 || total === undefined || total === null) {
      setWeeklyPlanning([]);
      return alertHandler('Error', t('LBL_ERROR_LOADING_FIXED_ASSETS'));
    }

    setTotal(total);

    if (data === undefined || data === null) {
      setWeeklyPlanning([]);
    }

    if (data) {
      let tempData = [];
      data.forEach(item => {
        let listItem = { ...item };
        listItem.name = listItem?.name || '';
        tempData.push(listItem);
      });
      setWeeklyPlanning(tempData);
    }
  };

  return (
    <>
      {actionInProgress && <div className="lodingpage"></div>}
      {isLoading && <Spinner />}
      {((!isLoading && searchValue !== '') || (weeklyPlanning && weeklyPlanning.length > 0)) && (
        <div className="page-body">
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-12">
                <Calendar />
                <BreadCrumb feature={feature} subFeature={subFeature} />
              </div>
            </div>
            <div className="row">
              <div className="col-md-12 mb-4">
                <div className="info-tite-page float-start">
                  <h4>{t('LBL_WEEKLY_PLANNING')}</h4>
                </div>
                {canAdd && (
                  <div className="reverse-page float-end">
                    <AddButton
                      text="LBL_ADD_WEEKLY_PLANNING"
                      onClick={() => {
                        navigate(getFeaturePath(subFeature, 'add'));
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <Toolbar
                  show={show}
                  setShow={setShow}
                  refreshData={getWeeklyPlanning}
                  setShowMoreAction={setShowMoreAction}
                  checked={checked}
                  setChecked={setChecked}
                  data={weeklyPlanning}
                  setActionInProgress={setActionInProgress}
                  bulkActionConfig={{
                    canDelete: canDelete,
                    deleteSuccessMessage: 'LBL_WEEKLY_PLANNING_DELETED',
                    modelsEnumKey: 'WEEKLY_PLANNING',
                  }}
                />
                {!isLoading && show === 'table' && windowSize[0] > 1200 && (
                  <Table
                    fields={fields}
                    data={weeklyPlanning}
                    total={total}
                    checked={checked}
                    setChecked={setChecked}
                    feature={feature}
                    subFeature={subFeature}
                  >
                    {weeklyPlanning.length > 0 &&
                      weeklyPlanning.map(record => {
                        return (
                          <TableRow
                            record={record}
                            fields={fields}
                            deleteModel={MODELS.WEEKLY_PLANNING}
                            refreshData={getWeeklyPlanning}
                            checked={checked}
                            setChecked={setChecked}
                            setActionInProgress={setActionInProgress}
                            feature={feature}
                            subFeature={subFeature}
                            isEditable={true}
                            isDeletable={true}
                          />
                        );
                      })}
                  </Table>
                )}
                {!isLoading && (show === 'card' || windowSize[0] <= 1200) && (
                  <CardsList total={total}>
                    {weeklyPlanning &&
                      weeklyPlanning.map(record => {
                        return (
                          <Card
                            feature={feature}
                            subFeature={subFeature}
                            record={record}
                            title="name"
                            subTitles={subTitles}
                            deleteModel={MODELS.WEEKLY_PLANNING}
                            refreshData={getWeeklyPlanning}
                            setActionInProgress={setActionInProgress}
                            checked={checked}
                            setChecked={setChecked}
                            isEditable={true}
                            isDeletable={true}
                          />
                        );
                      })}
                  </CardsList>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {showMoreAction && (
        <MoreAction
          show={show}
          setShow={setShow}
          refreshData={getWeeklyPlanning}
          checked={checked}
          setChecked={setChecked}
          data={weeklyPlanning}
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          setActionInProgress={setActionInProgress}
          alertHandler={alertHandler}
          bulkActionConfig={{
            canDelete: canDelete,
            deleteSuccessMessage: 'LBL_WEEKLY_PLANNING_DELETED',
            modelsEnumKey: 'WEEKLY_PLANNING',
          }}
        />
      )}
      {!isLoading && weeklyPlanning && weeklyPlanning.length === 0 && searchValue === '' && (
        <NoData
          imgSrc={NoStockCountImg}
          noDataMessage={t('NO_WEEKLY_PLANNING_DATA_MESSAGE')}
          showAdd={canAdd}
          addButtontext={t('LBL_ADD_WEEKLY_PLANNING')}
          addButtonPath={getFeaturePath(subFeature, 'add')}
        />
      )}
    </>
  );
};

export default WeeklyPlanning;
