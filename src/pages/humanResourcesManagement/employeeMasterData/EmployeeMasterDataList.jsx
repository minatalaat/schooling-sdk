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

const EmployeeMasterDataList = () => {
  let feature = 'HR_MANAGEMENT';
  let subFeature = 'EMPLOYEE_MASTER_DATA';

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
  const [employeeMasterList, setEmployeeMaster] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const fields = [
    { accessor: 'contactPartner.partnerSeq', Header: t('LBL_REFERENCE'), type: 'text' },
    { accessor: 'contactPartner.simpleFullName', Header: t('LBL_NAME'), type: 'text' },
    { accessor: 'contactPartner.mobilePhone', Header: t('LBL_MOBILE_NUMBER'), type: 'text' },
    { accessor: 'contactPartner.fixedPhone', Header: t('LBL_FIXED_MOBILE_NUMBER'), type: 'text' },
    { accessor: 'managerUser.fullName', Header: t('LBL_MANAGER'), type: 'text' },
    { accessor: 'mainEmploymentContract.companyDepartment.name', Header: t('LBL_COMPANY_DEPARTMENT'), type: 'text' },
    { accessor: 'mainEmploymentContract.payCompany.name', Header: t('LBL_PAY_COMPANY'), type: 'text' },
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
        fieldName: 'contactPartner.simpleFullName',
        operator: 'like',
        value: searchValue,
      },
      {
        fieldName: 'contactPartner.partnerSeq',
        operator: 'like',
        value: searchValue,
      },
      {
        fieldName: 'contactPartner.fixedPhone',
        operator: 'like',
        value: searchValue,
      },
      {
        fieldName: 'contactPartner.mobilePhone',
        operator: 'like',
        value: searchValue,
      },
      {
        fieldName: 'managerUser',
        operator: 'like',
        value: searchValue,
      },
    ];
    return {
      fields: fetchKeys(fields),
      sortBy: ['contactPartner.simpleFullName'],
      data: {
        _searchText: searchValue !== '' ? searchValue : null,
        _domain: null,
        _domainContext: {
          _id: null,
          _model: MODELS.EMPLOYEE,
        },
        operator: 'or',
        criteria: searchValue !== '' ? criteria : [],
      },
      limit: pageSize,
      offset: offset,
      translate: true,
    };
  }, [searchValue, pageSize, offset]);

  const fetchEmployeeMasterData = () => {
    return api('POST', getSearchUrl(MODELS.EMPLOYEE), searchPayload);
  };

  const fetchListingData = async () => {
    if (isLoading === false && searchValue === '') setIsLoading(true);

    const EmployeeMasterDataResponse = await fetchEmployeeMasterData();

    if (!EmployeeMasterDataResponse || !EmployeeMasterDataResponse.data || EmployeeMasterDataResponse.data.status !== 0) {
      setIsLoading(false);
      navigate('/error');
      return null;
    }

    if ((!EmployeeMasterDataResponse.data.data || !EmployeeMasterDataResponse.data.total) && searchValue === '') {
      setIsLoading(false);
      setNoData(true);
      return null;
    }

    let employeeTemp = { ...EmployeeMasterDataResponse.data };

    setIsLoading(false);
    return setEmployeeMaster({ ...employeeTemp });
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
          noDataMessage={t('NO_DATA_EMPLOYEE_MASTER_MESSAGE')}
          addButtontext={t('LBL_ADD_DATA_EMPLOYEE_MASTER')}
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
          data={employeeMasterList.data || []}
          alertHandler={alertHandler}
          setActionInProgress={setActionInProgress}
          bulkActionConfig={{
            isExport: false,
            isImport: false,
            canDelete: canDelete,
            deleteSuccessMessage: 'DELETED_SUCCESSFULLY',
            modelsEnumKey: 'LBL_DATA_EMPLOYEE_MASTER',
          }}
        />
      )}
      {!isLoading && !noData && (
        <div className="page-body">
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-12 mb-4">
                <Calendar />
                <BreadCrumb feature={feature} subFeature={subFeature} />
              </div>
            </div>
            <div className="row">
              <div className="col-md-12 mb-4">
                <div className="info-tite-page float-start">
                  <h4>{t('LBL_DATA_EMPLOYEES_MASTER')}</h4>
                </div>

                <div className="reverse-page float-end">
                  {canAdd && (
                    <AddButton
                      text="LBL_ADD_DATA_EMPLOYEE_MASTER"
                      onClick={() => {
                        navigate(getFeaturePath(subFeature, 'add'));
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12 mb-4">
                <Toolbar
                  show={show}
                  setShow={setShow}
                  refreshData={fetchListingData}
                  setShowMoreAction={setShowMoreAction}
                  checked={checked}
                  setChecked={setChecked}
                  data={employeeMasterList.data || []}
                  setActionInProgress={setActionInProgress}
                  bulkActionConfig={{
                    isExport: false,
                    canDelete: canDelete,
                    modelsEnumKey: 'EMPLOYEE_MASTER_DATA',
                  }}
                  searchPayload={searchPayload}
                />
                {show === 'table' && windosSize[0] > 1200 && (
                  <Table
                    fields={fields}
                    data={employeeMasterList.data || []}
                    total={employeeMasterList.total || 0}
                    checked={checked}
                    setChecked={setChecked}
                    feature={feature}
                    subFeature={subFeature}
                  >
                    {employeeMasterList.data &&
                      employeeMasterList.data.length > 0 &&
                      employeeMasterList.data.map(record => {
                        return (
                          <TableRow
                            key={record.id}
                            record={record}
                            fields={fields}
                            deleteModel={MODELS.EMPLOYEE}
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
                  <CardsList total={employeeMasterList.total || 0}>
                    {employeeMasterList.data &&
                      employeeMasterList.data.length > 0 &&
                      employeeMasterList.data.map(record => {
                        return (
                          <Card
                            key={record.id}
                            feature={feature}
                            subFeature={subFeature}
                            record={record}
                            title="contactPartner.simpleFullName"
                            label1={{ value: record['contactPartner.partnerSeq'] }}
                            deleteModel={MODELS.EVENTS_PLANNING}
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

export default EmployeeMasterDataList;
