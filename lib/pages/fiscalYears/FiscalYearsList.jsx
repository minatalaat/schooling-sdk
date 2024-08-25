import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import Spinner from '../../components/Spinner/Spinner';
import Table from '../../components/ListingTable/Table';
import TableRow from '../../components/ListingTable/TableRow';
import CardsList from '../../components/CardsList/CardsList';
import Card from '../../components/CardsList/Card';
import Toolbar from '../../parts/Toolbar';
import NoData from '../../components/NoData';
import MoreAction from '../../parts/MoreAction';
import BreadCrumb from '../../components/ui/BreadCrumb';
import AddButton from '../../components/ui/buttons/AddButton';
import Calendar from '../../components/ui/Calendar';

import { MODELS } from '../../constants/models';
import NoFiscalYearsImg from '../../assets/images/icons/fiscal year.svg';
import { useAxiosFunction } from '../../hooks/useAxios';
import { getSearchUrl } from '../../services/getUrl';
import { useFeatures } from '../../hooks/useFeatures';
import { alertsActions } from '../../store/alerts';

const FiscalYearsList = ({ statusSelect }) => {
  let feature = 'APP_CONFIG';
  let subFeature = 'FISCAL_YEARS';

  const navigate = useNavigate();
  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  const { canAdd, canDelete, getFeaturePath } = useFeatures(feature, subFeature);
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const [show, setShow] = useState('table');
  const [checked, setChecked] = useState([]);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [windosSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [fiscalYearsList, setFiscalYearsList] = useState({});
  const [noData, setNoData] = useState(false);

  let searchValue = searchParams.get('search') || '';
  let currentPage = parseInt(searchParams.get('currentPage') || 1);
  let pageSize = parseInt(searchParams.get('pageSize') || 10);
  let offset = (currentPage - 1) * pageSize;

  const [searchTimeout, setSearchTimeout] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fields = [
    { accessor: 'name', Header: t('LBL_NAME'), type: 'text' },
    { accessor: 'code', Header: t('LBL_CODE'), type: 'text' },
    {
      accessor: 'fromDate',
      Header: t('LBL_FROM'),
      type: 'text',
    },
    {
      accessor: 'toDate',
      Header: t('LBL_TO'),
      type: 'text',
    },
    {
      accessor: 'reportedBalanceDate',
      Header: t('LBL_REPORTED_BALANCE_DATE'),
      type: 'text',
    },
    {
      accessor: 'statusSelect',
      Header: t('LBL_STATUS'),
      type: 'text',
    },
  ];

  const subTitles = [
    { label: 'LBL_FROM', key: 'fromDate' },
    { label: 'LBL_TO', key: 'toDate' },
  ];

  const alertHandler = (title, message) => dispatch(alertsActions.initiateAlert({ title, message }));

  const fetchKeys = arr => {
    let keysArray = [];
    arr.map(obj => keysArray.push(obj.accessor));
    return keysArray;
  };

  const searchPayload = useMemo(() => {
    const criteria = [
      {
        fieldName: 'name',
        operator: 'like',
        value: searchValue,
      },
      {
        fieldName: 'code',
        operator: 'like',
        value: searchValue,
      },
      {
        fieldName: 'fromDate',
        operator: 'between',
        value: searchValue,
        value2: searchValue,
      },
      {
        fieldName: 'toDate',
        operator: 'between',
        value: searchValue,
        value2: searchValue,
      },
      {
        fieldName: 'reportedBalanceDate',
        operator: 'between',
        value: searchValue,
        value2: searchValue,
      },
    ];
    return {
      fields: fetchKeys(fields),
      sortBy: ['name'],
      data: {
        _searchText: searchValue !== '' ? searchValue : null,
        _domain: 'self.typeSelect = 1',
        _domainContext: {
          _id: null,
          _model: MODELS.FISCALYEAR,
        },
        operator: 'or',
        criteria: searchValue !== '' ? criteria : [],
      },
      limit: pageSize,
      offset: offset,
      translate: true,
    };
  }, [searchValue, pageSize, offset]);

  const fetchFiscalYears = () => {
    return api('POST', getSearchUrl(MODELS.FISCALYEAR), searchPayload);
  };

  const fetchListingData = async () => {
    if (isLoading === false && searchValue === '') setIsLoading(true);

    let statusList = statusSelect.data;

    if (!statusList) {
      const metaDataResponse = await statusSelect.fetchData();

      if (
        !metaDataResponse ||
        !metaDataResponse.data ||
        metaDataResponse.data.status !== 0 ||
        !metaDataResponse.data.data ||
        !metaDataResponse.data.data.fields
      ) {
        setIsLoading(false);
        navigate('/error');
        return null;
      }

      statusList = metaDataResponse.data.data.fields.find(field => field.selection === 'base.year.status.select');

      if (!statusList) {
        setIsLoading(false);
        navigate('/error');
        return null;
      }

      statusList = [...statusList.selectionList];
      statusSelect.setData(statusList);
    }

    const fiscalYearsResponse = await fetchFiscalYears();

    if (!fiscalYearsResponse || !fiscalYearsResponse.data || fiscalYearsResponse.data.status !== 0) {
      setIsLoading(false);
      navigate('/error');
      return null;
    }

    if ((!fiscalYearsResponse.data.data || !fiscalYearsResponse.data.total) && searchValue === '') {
      setIsLoading(false);
      setNoData(true);
      return null;
    }

    let fiscalYearTemp = { ...fiscalYearsResponse.data };

    if (searchValue !== '' && !fiscalYearsResponse.data.total) {
      setIsLoading(false);
      setFiscalYearsList({ ...fiscalYearTemp });
      return null;
    }

    let newFiscalYears = [];

    if (fiscalYearTemp.data) {
      fiscalYearTemp.data.forEach(fiscalyear => {
        let newFiscalYear = { ...fiscalyear };

        if (newFiscalYear.statusSelect !== null && newFiscalYear.statusSelect !== undefined && newFiscalYear.statusSelect !== 0) {
          let typeObj = statusList.find(type => Number(type.value) === Number(newFiscalYear.statusSelect));
          if (typeObj) newFiscalYear.statusSelect = typeObj.title;
          if (!typeObj) newFiscalYear.statusSelect = '';
        } else {
          newFiscalYear.statusSelect = '';
        }

        newFiscalYears.push(newFiscalYear);
      });
    }

    setIsLoading(false);
    return setFiscalYearsList({
      ...fiscalYearTemp,
      data: [...newFiscalYears],
    });
  };

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
    clearTimeout(searchTimeout);

    if (searchValue !== '') {
      setSearchTimeout(
        setTimeout(() => {
          fetchListingData();
        }, 1500)
      );
    } else {
      fetchListingData();
    }
  }, [offset, pageSize, searchValue]);

  return (
    <>
      {actionInProgress && <div className="lodingpage"></div>}
      {isLoading && <Spinner />}
      {!isLoading && noData && (
        <NoData
          imgSrc={NoFiscalYearsImg}
          noDataMessage={t('NO_FISCAL_YEARS_DATA_MESSAGE')}
          addButtontext={t('LBL_ADD_FISCAL_YEAR')}
          addButtonPath={getFeaturePath(subFeature, 'add')}
          showAdd={canAdd}
        />
      )}
      {showMoreAction && (
        <MoreAction
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          refreshData={fetchListingData}
          checked={checked}
          setChecked={setChecked}
          data={fiscalYearsList.data || []}
          alertHandler={alertHandler}
          setActionInProgress={setActionInProgress}
          bulkActionConfig={{
            canDelete: canDelete,
            modelsEnumKey: 'FISCAL_YEARS',
          }}
        />
      )}
      {!isLoading && !noData && (
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
                  <h4>{t('LBL_FISCAL_YEARS')}</h4>
                </div>

                <div className="reverse-page float-end">
                  {canAdd && (
                    <AddButton
                      text="LBL_ADD_FISCAL_YEAR"
                      onClick={() => {
                        navigate(getFeaturePath(subFeature, 'add'));
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <Toolbar
                  refreshData={fetchListingData}
                  show={show}
                  setShow={setShow}
                  setShowMoreAction={setShowMoreAction}
                  checked={checked}
                  setChecked={setChecked}
                  data={fiscalYearsList.data || []}
                  setActionInProgress={setActionInProgress}
                  bulkActionConfig={{
                    canDelete: canDelete,
                    modelsEnumKey: 'FISCAL_YEARS',
                    isExport: true,
                  }}
                  searchPayload={searchPayload}
                />

                {show === 'table' && windosSize[0] > 1200 && (
                  <Table
                    fields={fields}
                    data={fiscalYearsList.data || []}
                    total={fiscalYearsList.total || 0}
                    checked={checked}
                    setChecked={setChecked}
                    feature={feature}
                    subFeature={subFeature}
                  >
                    {fiscalYearsList.data &&
                      fiscalYearsList.data.length > 0 &&
                      fiscalYearsList.data.map(record => {
                        return (
                          <TableRow
                            key={record.id}
                            record={record}
                            fields={fields}
                            deleteModel={MODELS.FISCALYEAR}
                            refreshData={fetchListingData}
                            checked={checked}
                            setChecked={setChecked}
                            setActionInProgress={setActionInProgress}
                            feature={feature}
                            subFeature={subFeature}
                            isEditable={!(record.statusSelect && record.statusSelect === 'Closed')}
                          />
                        );
                      })}
                  </Table>
                )}
                {(show === 'card' || windosSize[0] <= 1200) && (
                  <CardsList total={fiscalYearsList.total || 0}>
                    {fiscalYearsList.data &&
                      fiscalYearsList.data.length > 0 &&
                      fiscalYearsList.data.map(record => {
                        return (
                          <Card
                            key={record.id}
                            feature={feature}
                            subFeature={subFeature}
                            record={record}
                            title="name"
                            subTitles={subTitles}
                            deleteModel={MODELS.FISCALYEAR}
                            refreshData={fetchListingData}
                            setActionInProgress={setActionInProgress}
                            checked={checked}
                            setChecked={setChecked}
                            label1={record.statusSelect ? { value: record.statusSelect } : null}
                            isEditable={!(record.statusSelect && record.statusSelect === 'Closed')}
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
};

export default FiscalYearsList;
