import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import Spinner from '../../components/Spinner/Spinner';
import Toolbar from '../../parts/Toolbar';
import MoreAction from '../../parts/MoreAction';
import Table from '../../components/ListingTable/Table';
import TableRow from '../../components/ListingTable/TableRow';
import CardsList from '../../components/CardsList/CardsList';
import Card from '../../components/CardsList/Card';
import NoData from '../../components/NoData';
import AddButton from '../../components/ui/buttons/AddButton';
import BreadCrumb from '../../components/ui/BreadCrumb';
import Calendar from '../../components/ui/Calendar';

import { MODELS } from '../../constants/models';
import NoFinancialAccountsImg from '../../assets/images/icons/Finical Accounts.svg';
import { useAxiosFunction } from '../../hooks/useAxios';
import { getSearchUrl } from '../../services/getUrl';
import { useFeatures } from '../../hooks/useFeatures';
import { alertsActions } from '../../store/alerts';

const FinancialAccountsList = () => {
  let feature = 'ACCOUNTING';
  let subFeature = 'FINANCIAL_ACCOUNTS';

  const navigate = useNavigate();
  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  const { canAdd, canDelete, getFeaturePath } = useFeatures(feature, subFeature);
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const [searchTimeout, setSearchTimeout] = useState(0);
  const [show, setShow] = useState('table');
  const [checked, setChecked] = useState([]);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [windosSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [accountsList, setAccountsList] = useState({});
  const [noData, setNoData] = useState(false);
  let searchValue = searchParams.get('search') || '';
  let currentPage = parseInt(searchParams.get('currentPage') || 1);
  let pageSize = parseInt(searchParams.get('pageSize') || 10);
  let offset = (currentPage - 1) * pageSize;

  const fields = [
    { accessor: 'code', Header: t('LBL_CODE'), type: 'text' },
    { accessor: 'name', Header: t('LBL_NAME'), type: 'text' },
    {
      accessor: 'accountType',
      Header: t('LBL_ACCOUNT_TYPE'),
      type: 'text',
    },
    { accessor: 'reconcileOk', Header: t('LBL_RECONCIBLE'), type: 'checkbox' },
    {
      accessor: 'parentAccount',
      Header: t('LBL_PARENT_ACCOUNT'),
      type: 'text',
    },
    {
      accessor: 'statusSelect',
      Header: t('LBL_STATUS'),
      type: 'text',
    },
  ];

  const subTitles = [
    { label: 'LBL_ACCOUNT_TYPE', key: 'accountType' },
    { label: 'LBL_PARENT_ACCOUNT', key: 'parentAccount' },
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
        fieldName: 'code',
        operator: 'like',
        value: searchValue,
      },
      {
        fieldName: 'name',
        operator: 'like',
        value: searchValue,
      },
      {
        fieldName: 'accountType.name',
        operator: 'like',
        value: searchValue,
      },
      {
        fieldName: 'parentAccount.label',
        operator: 'like',
        value: searchValue,
      },
    ];
    return {
      fields: [...fetchKeys(fields), 'label'],
      sortBy: ['code'],
      data: {
        _searchText: searchValue !== '' ? searchValue : null,
        _domain: null,
        _domainContext: {
          _id: null,
          _model: MODELS.ACCOUNT,
        },
        operator: 'or',
        criteria: searchValue !== '' ? criteria : [],
      },
      limit: pageSize,
      offset: offset,
      translate: true,
    };
  }, [searchValue, pageSize, offset]);

  const fetchFinancialAccounts = () => {
    return api('POST', getSearchUrl(MODELS.ACCOUNT), searchPayload);
  };

  const fetchListingData = async () => {
    if (isLoading === false && searchValue === '') setIsLoading(true);

    const financialAccountsResonse = await fetchFinancialAccounts();

    if (!financialAccountsResonse || !financialAccountsResonse.data || financialAccountsResonse.data.status !== 0) {
      setIsLoading(false);
      navigate('/error');
      return null;
    }

    if ((!financialAccountsResonse.data.data || !financialAccountsResonse.data.total) && searchValue === '') {
      setIsLoading(false);
      setNoData(true);
      return null;
    }

    let financialAccountTemp = { ...financialAccountsResonse.data };

    if (searchValue !== '' && !financialAccountsResonse.data.total) {
      setIsLoading(false);
      setAccountsList({ ...financialAccountTemp });
      return null;
    }

    let newFinancialAccounts = [];

    if (financialAccountTemp.data) {
      financialAccountTemp.data.forEach(account => {
        let newAccount = { ...account };

        if (newAccount.accountType !== null && newAccount.accountType !== undefined) {
          newAccount.accountType = newAccount.accountType.name;
        } else {
          newAccount.accountType = '';
        }

        if (newAccount.parentAccount !== null && newAccount.parentAccount !== undefined) {
          newAccount.parentAccount = newAccount.parentAccount.label;
        } else {
          newAccount.parentAccount = '';
        }

        if (newAccount.statusSelect !== null && newAccount.statusSelect !== undefined) {
          if (Number(newAccount.statusSelect) === 0) newAccount.statusSelect = t('LBL_INACTIVE');
          if (Number(newAccount.statusSelect) === 1) newAccount.statusSelect = t('LBL_ACTIVE');
        } else {
          newAccount.statusSelect = '';
        }

        newFinancialAccounts.push(newAccount);
      });
    }

    setIsLoading(false);
    return setAccountsList({
      ...financialAccountTemp,
      data: [...newFinancialAccounts],
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
          imgSrc={NoFinancialAccountsImg}
          noDataMessage={t('NO_FINANCIAL_ACCOUNTS_DATA_MESSAGE')}
          addButtontext={t('LBL_ADD_FINANCIAL_ACCOUNT')}
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
          data={accountsList.data || []}
          alertHandler={alertHandler}
          setActionInProgress={setActionInProgress}
          bulkActionConfig={{
            isExport: true,
            isImport: false,
            canDelete: canDelete,
            modelsEnumKey: 'FINANCIAL_ACCOUNTS',
            importConfigName: 'Account',
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
                  <h4>{t('LBL_FINANCIAL_ACCOUNTS')}</h4>
                </div>

                <div className="reverse-page float-end">
                  {canAdd && (
                    <AddButton
                      text="LBL_ADD_FINANCIAL_ACCOUNT"
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
                  data={accountsList.data || []}
                  setActionInProgress={setActionInProgress}
                  bulkActionConfig={{
                    isExport: true,
                    isImport: true,
                    subFeature: subFeature,
                    canDelete: canDelete,
                    modelsEnumKey: 'FINANCIAL_ACCOUNTS',
                  }}
                  searchPayload={searchPayload}
                />
                {show === 'table' && windosSize[0] > 1200 && (
                  <Table
                    fields={fields}
                    data={accountsList.data || []}
                    total={accountsList.total || 0}
                    checked={checked}
                    setChecked={setChecked}
                    feature={feature}
                    subFeature={subFeature}
                  >
                    {accountsList.data &&
                      accountsList.data.length > 0 &&
                      accountsList.data.map(record => {
                        return (
                          <TableRow
                            key={record.id}
                            record={record}
                            fields={fields}
                            deleteModel={MODELS.ACCOUNT}
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
                  <CardsList total={accountsList.total || 0}>
                    {accountsList.data &&
                      accountsList.data.length > 0 &&
                      accountsList.data.map(record => {
                        return (
                          <Card
                            key={record.id}
                            feature={feature}
                            subFeature={subFeature}
                            record={record}
                            title="name"
                            subTitles={subTitles}
                            deleteModel={MODELS.ACCOUNT}
                            refreshData={fetchListingData}
                            setActionInProgress={setActionInProgress}
                            checked={checked}
                            setChecked={setChecked}
                            label1={record.code ? { value: record.code } : null}
                            label2={record.statusSelect ? { value: record.statusSelect } : null}
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

export default FinancialAccountsList;
