import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import BreadCrumb from '../../../components/ui/BreadCrumb';
import Table from '../../../components/ListingTable/Table';
import TableRow from '../../../components/ListingTable/TableRow';
import CardsList from '../../../components/CardsList/CardsList';
import Card from '../../../components/CardsList/Card';
import AddButton from '../../../components/ui/buttons/AddButton';
import Spinner from '../../../components/Spinner/Spinner';
import Toolbar from '../../../parts/Toolbar';
import NoData from '../../../components/NoData';
import MoreAction from '../../../parts/MoreAction';
import Calendar from '../../../components/ui/Calendar';

import { useAxiosFunction } from '../../../hooks/useAxios';
import { MODELS } from '../../../constants/models';
import { useFeatures } from '../../../hooks/useFeatures';
import { getSearchUrl } from '../../../services/getUrl';
import { alertsActions } from '../../../store/alerts';

import NoCostCenterImg from '../../../assets/images/icons/Customers.svg';

function CostCenters({ feature, subFeature }) {
  const navigate = useNavigate();
  const { getFeaturePath } = useFeatures();
  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  const { canAdd, canDelete } = useFeatures(feature, subFeature);
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const [costCenters, setCostCenters] = useState([]);
  const [show, setShow] = useState('table');
  const [isLoading, setIsLoading] = useState(true);

  const [total, setTotal] = useState(0);
  let searchValue = searchParams.get('search') || '';
  let currentPage = parseInt(searchParams.get('currentPage') || 1);
  let pageSize = parseInt(searchParams.get('pageSize') || 10);
  let offset = (currentPage - 1) * pageSize;

  const [windosSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [checked, setChecked] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  const fields = [
    { accessor: 'code', Header: t('LBL_CODE'), type: 'text' },
    { accessor: 'name', Header: t('LBL_NAME'), type: 'text' },
    { accessor: 'analyticAxis', Header: t('LBL_ANALYTIC_AXIS'), type: 'text' },
  ];

  const subTitles = [
    { label: 'LBL_CODE', key: 'code' },
    { label: 'LBL_ANALYTIC_AXIS', key: 'analyticAxis' },
  ];

  let payload = {
    fields: ['code', 'name', 'analyticAxis', 'statusSelect'],
    sortBy: null,
    data: {
      _domain: null,
      _domainContext: { _id: null, _model: 'com.axelor.apps.account.db.AnalyticAccount' },
      operator: 'and',
      criteria: [],
    },
    limit: 40,
    offset: 0,
    translate: true,
  };

  const alertHandler = (title, message) => dispatch(alertsActions.initiateAlert({ title, message }));

  const onCostCentersSearchSuccess = response => {
    if (response.data.status === 0) {
      let total = response.data.total;
      let data = response.data.data;
      setTotal(total);
      let costCenterCopy = [];

      if (total !== 0) {
        data.forEach(costCenter => {
          let temp = {};
          temp.name = costCenter?.name ?? '';
          temp.code = costCenter?.code ?? '';
          temp.analyticAxis = costCenter?.analyticAxis?.name ?? '';
          temp.id = costCenter?.id ?? -1;
          temp.version = costCenter?.version ?? 0;
          costCenterCopy.push(temp);
        });
        setCostCenters([...costCenterCopy]);
      } else {
        setCostCenters([]);
      }

      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setChecked([]);

    if (searchValue !== '') {
      payload = {
        fields: ['code', 'name', 'analyticAxis', 'statusSelect'],
        sortBy: null,
        data: {
          _domain: null,
          _domainContext: { _id: null, _model: 'com.axelor.apps.account.db.AnalyticAccount' },
          operator: 'or',
          criteria: [
            { fieldName: 'code', operator: 'like', value: searchValue },
            {
              fieldName: 'name',
              operator: 'like',
              value: searchValue,
            },
            {
              fieldName: 'analyticAxis.name',
              operator: 'like',
              value: searchValue,
            },
          ],
          _searchText: searchValue,
          _domains: [],
        },
        limit: pageSize,
        offset: offset,
        translate: true,
      };
    } else {
      setCostCenters([]);
      setIsLoading(true);
      payload = {
        fields: ['code', 'name', 'analyticAxis', 'statusSelect'],
        sortBy: null,
        data: {
          _domain: null,
          _domainContext: { _id: null, _model: 'com.axelor.apps.account.db.AnalyticAccount' },
          operator: 'and',
          criteria: [],
        },
        limit: pageSize,
        offset: offset,
        translate: true,
      };
    }

    api('POST', getSearchUrl(MODELS.ANALYTICACCOUNT), payload, onCostCentersSearchSuccess);
  }, [searchParams]);

  useEffect(() => {
    const handleWindowResize = () => {
      setWindowSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  });

  const refreshHandler = () => {
    setCostCenters([]);
    setIsLoading(true);
    api('POST', getSearchUrl(MODELS.ANALYTICACCOUNT), payload, onCostCentersSearchSuccess);
  };

  return (
    <>
      {actionInProgress && <div className="lodingpage"></div>}
      {isLoading && <Spinner />}
      {showMoreAction && (
        <MoreAction
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          refreshData={refreshHandler}
          data={costCenters}
          checked={checked}
          setChecked={setChecked}
          alertHandler={alertHandler}
          setActionInProgress={setActionInProgress}
          bulkActionConfig={{
            canDelete: canDelete,
            deleteSuccessMessage: 'COST_CENTER_DELETE_MESSAGE',
            modelsEnumKey: 'COST_CENTERS',
          }}
        />
      )}
      {!isLoading && costCenters && costCenters.length <= 0 && searchValue === '' && (
        <NoData
          imgSrc={NoCostCenterImg}
          noDataMessage={t('NO_COST_CENTERS_DATA_MESSAGE')}
          showAdd={canAdd}
          addButtontext={t('LBL_ADD_COST_CENTER')}
          addButtonPath={getFeaturePath(subFeature, 'add')}
        />
      )}
      {((!isLoading && searchValue !== '') || (costCenters && costCenters.length > 0)) && (
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
                  <h4>{t('LBL_COST_CENTERS')}</h4>
                </div>
                {canAdd && (
                  <div className="reverse-page float-end">
                    <AddButton
                      text="LBL_ADD_COST_CENTER"
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
                  refreshData={refreshHandler}
                  setShowMoreAction={setShowMoreAction}
                  setActionInProgress={setActionInProgress}
                  bulkActionConfig={{
                    canDelete: canDelete,
                    deleteSuccessMessage: 'COST_CENTER_DELETE_MESSAGE',
                    modelsEnumKey: 'COST_CENTERS',
                    isExport: true,
                  }}
                  data={costCenters}
                  checked={checked}
                  setChecked={setChecked}
                  searchPayload={payload}
                />
                {show === 'table' && windosSize[0] > 1200 && (
                  <Table
                    fields={fields}
                    data={costCenters}
                    total={total}
                    checked={checked}
                    setChecked={setChecked}
                    feature={feature}
                    subFeature={subFeature}
                  >
                    {costCenters.length > 0 &&
                      costCenters.map(record => {
                        return (
                          <TableRow
                            record={record}
                            fields={fields}
                            deleteModel={MODELS.ANALYTIC_AXIS}
                            refreshData={refreshHandler}
                            checked={checked}
                            setChecked={setChecked}
                            setActionInProgress={setActionInProgress}
                            feature={feature}
                            subFeature={subFeature}
                          />
                        );
                      })}
                  </Table>
                )}
                {(show === 'card' || windosSize[0] <= 1200) && (
                  <CardsList total={total}>
                    {costCenters &&
                      costCenters.map(record => {
                        return (
                          <Card
                            feature={feature}
                            subFeature={subFeature}
                            record={record}
                            title="name"
                            subTitles={subTitles}
                            deleteModel={MODELS.ANALYTIC_AXIS}
                            refreshData={refreshHandler}
                            setActionInProgress={setActionInProgress}
                            checked={checked}
                            setChecked={setChecked}
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
    </>
  );
}

export default CostCenters;
