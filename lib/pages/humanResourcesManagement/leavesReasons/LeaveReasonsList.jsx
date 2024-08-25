import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import Spinner from '../../../components/Spinner/Spinner';
import Table from '../../../components/ListingTable/Table';
import TableRow from '../../../components/ListingTable/TableRow';
import CardsList from '../../../components/CardsList/CardsList';
import Card from '../../../components/CardsList/Card';
import NoData from '../../../components/NoData';
import Toolbar from '../../../parts/Toolbar';
import MoreAction from '../../../parts/MoreAction';
import BreadCrumb from '../../../components/ui/BreadCrumb';
import AddButton from '../../../components/ui/buttons/AddButton';
import Calendar from '../../../components/ui/Calendar';

import { MODELS } from '../../../constants/models';
import NoUnitsImg from '../../../assets/images/icons/unit.svg';
import { useAxiosFunction } from '../../../hooks/useAxios';
import { getSearchUrl } from '../../../services/getUrl';
import { useFeatures } from '../../../hooks/useFeatures';
import { alertsActions } from '../../../store/alerts';

const LeaveReasonsList = () => {
  let feature = 'HR_MANAGEMENT';
  let subFeature = 'LEAVES_REASONS';

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
  const [noData, setNoData] = useState(false);

  let searchValue = searchParams.get('search') || '';
  let currentPage = parseInt(searchParams.get('currentPage') || 1);
  let pageSize = parseInt(searchParams.get('pageSize') || 10);
  let offset = (currentPage - 1) * pageSize;

  const [searchTimeout, setSearchTimeout] = useState(0);
  const [leaveReasonsList, setLeaveReasonsList] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const fields = [
    { accessor: 'name', Header: t('LBL_NAME'), type: 'text' },
    { accessor: 'manageAccumulation', Header: t('LBL_MANAGE_ACCUMLATION'), type: 'checkbox' },
    { accessor: 'allowNegativeValue', Header: t('LBL_ALLOW_NEG_VALUE'), type: 'checkbox' },
    { accessor: 'allowInjection', Header: t('LBL_ALLOW_INJECTION'), type: 'checkbox' },
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
    ];
    return {
      fields: fetchKeys(fields),
      sortBy: ['name'],
      data: {
        _searchText: searchValue !== '' ? searchValue : null,
        _domain: null,
        _domainContext: {
          _id: null,
          _model: MODELS.LEAVE_REASON,
        },
        operator: 'or',
        criteria: searchValue !== '' ? criteria : [],
      },
      limit: pageSize,
      offset: offset,
      translate: true,
    };
  }, [searchValue, pageSize, offset]);

  const fetchLeaveReasons = () => {
    return api('POST', getSearchUrl(MODELS.LEAVE_REASON), searchPayload);
  };

  const fetchListingData = async () => {
    if (isLoading === false && searchValue === '') setIsLoading(true);

    const searchResponse = await fetchLeaveReasons();

    if (!searchResponse || !searchResponse.data || searchResponse.data.status !== 0) {
      setIsLoading(false);
      navigate('/error');
      return null;
    }

    if ((!searchResponse.data.data || !searchResponse.data.total) && searchValue === '') {
      setIsLoading(false);
      setNoData(true);
      return null;
    }

    let holidaysTemp = { ...searchResponse.data };

    setIsLoading(false);
    return setLeaveReasonsList({ ...holidaysTemp });
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
          imgSrc={NoUnitsImg}
          noDataMessage={t('NO_LEAVE_REASONS_DATA_MESSAGE')}
          addButtontext={t('LBL_ADD_LEAVE_RESSON')}
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
          data={leaveReasonsList.data || []}
          alertHandler={alertHandler}
          setActionInProgress={setActionInProgress}
          bulkActionConfig={{
            isExport: false,
            isImport: false,
            canDelete: canDelete,
            deleteSuccessMessage: 'DELETED_SUCCESSFULLY',
            modelsEnumKey: 'LEAVE_REASONS',
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
                  <h4>{t('LBL_PUBLIC_HOLIDAYS_PLANS')}</h4>
                </div>

                <div className="reverse-page float-end">
                  {canAdd && (
                    <AddButton
                      text="LBL_ADD_LEAVE_RESSON"
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
                  show={show}
                  setShow={setShow}
                  refreshData={fetchListingData}
                  setShowMoreAction={setShowMoreAction}
                  checked={checked}
                  setChecked={setChecked}
                  data={leaveReasonsList.data || []}
                  setActionInProgress={setActionInProgress}
                  bulkActionConfig={{
                    isExport: false,
                    canDelete: canDelete,
                    modelsEnumKey: 'LEAVE_REASONS',
                  }}
                  searchPayload={searchPayload}
                />
                {show === 'table' && windosSize[0] > 1200 && (
                  <Table
                    fields={fields}
                    data={leaveReasonsList.data || []}
                    total={leaveReasonsList.total || 0}
                    checked={checked}
                    setChecked={setChecked}
                    feature={feature}
                    subFeature={subFeature}
                  >
                    {leaveReasonsList.data &&
                      leaveReasonsList.data.length > 0 &&
                      leaveReasonsList.data.map(record => {
                        return (
                          <TableRow
                            key={record.id}
                            record={record}
                            fields={fields}
                            deleteModel={MODELS.LEAVE_REASON}
                            refreshData={fetchListingData}
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
                  <CardsList total={leaveReasonsList.total || 0}>
                    {leaveReasonsList.data &&
                      leaveReasonsList.data.length > 0 &&
                      leaveReasonsList.data.map(record => {
                        return (
                          <Card
                            key={record.id}
                            feature={feature}
                            subFeature={subFeature}
                            record={record}
                            title="name"
                            deleteModel={MODELS.LEAVE_REASON}
                            refreshData={fetchListingData}
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
};

export default LeaveReasonsList;
