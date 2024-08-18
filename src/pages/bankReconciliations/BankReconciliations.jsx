import { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import BreadCrumb from '../../components/ui/BreadCrumb';
import Table from '../../components/ListingTable/Table';
import TableRow from '../../components/ListingTable/TableRow';
import CardsList from '../../components/CardsList/CardsList';
import Card from '../../components/CardsList/Card';
import Spinner from '../../components/Spinner/Spinner';
import MoreAction from '../../parts/MoreAction';
import NoData from '../../components/NoData';
import Toolbar from '../../parts/Toolbar';
import Calendar from '../../components/ui/Calendar';

import { useAxiosFunction } from '../../hooks/useAxios';
import { MODELS } from '../../constants/models';
import { formatFloatNumber } from '../../utils/helpers';
import { RECONCILIATION_SEARCH_FIELDS } from './ReconciliationsPayloadsFields';
import { getSearchUrl } from '../../services/getUrl';
import { useFeatures } from '../../hooks/useFeatures';
import { alertsActions } from '../../store/alerts';

import NoBankReconciliationImg from '../../assets/images/icons/Bank reconciliations.svg';

const BankReconciliations = ({ feature, subFeature }) => {
  const { getFeaturePath } = useFeatures();
  const { state } = useLocation();
  const { canAdd, canDelete } = useFeatures(feature, subFeature);
  let domain = state && state.domain ? state.domain : null;
  const { api } = useAxiosFunction();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(true);
  const [bankReconciliations, setBankReconciliations] = useState([]);
  const [displayedReconciliations, setDisplayedReconciliations] = useState([]);
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

  const STATUS_SELECT = ['', 'LBL_DRAFT', 'LBL_VALIDATED', 'LBL_DRAFT'];

  const alertHandler = (title, message) => dispatch(alertsActions.initiateAlert({ title, message }));

  const searchPayload = {
    fields: RECONCILIATION_SEARCH_FIELDS,
    sortBy: ['-fromDate', '-toDate', 'company.code', 'bankDetails.iban'],
    data: {
      _domain: domain ? domain : null,
      _domainContext: {
        _id: null,
        _model: MODELS.BANK_RECONCILIATION,
      },
      operator: 'and',
      criteria: [],
    },
    limit: pageSize,
    offset: offset,
    translate: true,
  };

  const searchPayloadwithValue = {
    fields: RECONCILIATION_SEARCH_FIELDS,
    sortBy: ['-fromDate', '-toDate', 'company.code', 'bankDetails.iban'],
    data: {
      _domain: domain ? domain : null,
      _domainContext: {
        _id: null,
        _model: MODELS.BANK_RECONCILIATION,
      },
      operator: 'or',
      criteria: [
        {
          fieldName: 'name',
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
      ],
      _searchText: searchValue,
      _domains: [],
    },
    limit: pageSize,
    offset: offset,
    translate: true,
  };

  const fields = [
    { accessor: 'name', Header: t('LBL_LABEL_NAME'), type: 'text' },
    { accessor: 'fromDate', Header: t('LBL_FROM_DATE'), type: 'text' },
    { accessor: 'toDate', Header: t('LBL_TO_DATE'), type: 'text' },
    { accessor: 'bankDetails', Header: t('LBL_BANK_DETAILS'), type: 'text' },
    { accessor: 'currency', Header: t('LBL_CURRENCY'), type: 'text' },
    { accessor: 'startingBalance', Header: t('LBL_BANK_STARTING_BALANCE'), type: 'number' },
    { accessor: 'endingBalance', Header: t('LBL_BANK_ENDING_BALANCE'), type: 'number' },
    { accessor: 'status', Header: t('LBL_STATUS'), type: 'text', translate: true },
  ];

  const subTitles = [
    { label: 'LBL_BANK_DETAILS', key: 'bankDetails' },
    { label: 'LBL_FROM_DATE', key: 'fromDate' },
    { label: 'LBL_TO_DATE', key: 'toDate' },
  ];

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
    getBankReconciliations();
  }, [searchParams]);

  const getBankReconciliations = () => {
    if (searchValue === '') {
      setBankReconciliations([]);
      setDisplayedReconciliations([]);
      setIsLoading(true);
    }

    let payload = searchValue && searchValue !== '' ? searchPayloadwithValue : searchPayload;
    api('POST', getSearchUrl(MODELS.BANK_RECONCILIATION), payload, onGetBankReconciliationsSuccess);
  };

  const onGetBankReconciliationsSuccess = response => {
    let status = response.data.status;
    let total = response.data.total;
    let data = response.data.data;
    setIsLoading(false);

    if (status !== 0 || total === undefined || total === null) {
      setBankReconciliations([]);
      setDisplayedReconciliations([]);
      setIsLoading(false);
      return alertHandler('Error', t('LBL_ERROR_LOADING_BANK_RECONCILIATIONS'));
    }

    setTotal(total);

    if (data === undefined || data === null) {
      setBankReconciliations([]);
      setDisplayedReconciliations([]);
    }

    if (data) {
      setBankReconciliations(data);
      let tempData = [];

      if (data) {
        data.forEach(item => {
          let listItem = { ...item };
          listItem.bankDetails = listItem.bankDetails?.fullName ?? '';
          listItem.currency = listItem['currency.code'] ?? '';
          listItem.startingBalance = formatFloatNumber(listItem.startingBalance);
          listItem.endingBalance = formatFloatNumber(listItem.endingBalance);
          listItem.status = STATUS_SELECT[listItem.statusSelect];
          tempData.push(listItem);
        });
      }

      setDisplayedReconciliations(tempData);
    }
  };

  return (
    <>
      {isLoading && <Spinner />}
      {actionInProgress && <div className="lodingpage"></div>}
      {((!isLoading && searchValue !== '') || (bankReconciliations && bankReconciliations.length > 0)) && (
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
                  <h4>{t('LBL_BANK_RECONCILIATIONS')}</h4>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <Toolbar
                  show={show}
                  setShow={setShow}
                  refreshData={getBankReconciliations}
                  setShowMoreAction={setShowMoreAction}
                  checked={checked}
                  setChecked={setChecked}
                  data={displayedReconciliations}
                  setActionInProgress={setActionInProgress}
                  bulkActionConfig={{
                    canDelete: canDelete,
                    deleteSuccessMessage: 'LBL_BANK_RECONCILIATIONS_DELETED',
                    modelsEnumKey: 'BANK_RECONCILIATIONS',
                    isExport: true,
                  }}
                  searchPayload={searchValue && searchValue !== '' ? searchPayloadwithValue : searchPayload}
                />
                {!isLoading && show === 'table' && windowSize[0] > 1200 && (
                  <Table
                    fields={fields}
                    data={displayedReconciliations}
                    total={total}
                    checked={checked}
                    setChecked={setChecked}
                    feature={feature}
                    subFeature={subFeature}
                  >
                    {displayedReconciliations.length > 0 &&
                      displayedReconciliations.map(record => {
                        return (
                          <TableRow
                            record={record}
                            fields={fields}
                            deleteModel={MODELS.BANK_RECONCILIATION}
                            refreshData={getBankReconciliations}
                            checked={checked}
                            setChecked={setChecked}
                            setActionInProgress={setActionInProgress}
                            feature={feature}
                            subFeature={subFeature}
                            navigateToEditState={{ state: { status: record.statusSelect } }}
                            isEditable={record.statusSelect !== 2}
                            isDeletable={record.statusSelect !== 2}
                          />
                        );
                      })}
                  </Table>
                )}
                {!isLoading && (show === 'card' || windowSize[0] <= 1200) && (
                  <CardsList total={total}>
                    {displayedReconciliations &&
                      displayedReconciliations.map(record => {
                        return (
                          <Card
                            feature={feature}
                            subFeature={subFeature}
                            record={record}
                            title="name"
                            subTitles={subTitles}
                            deleteModel={MODELS.BANK_RECONCILIATION}
                            refreshData={getBankReconciliations}
                            setActionInProgress={setActionInProgress}
                            checked={checked}
                            setChecked={setChecked}
                            navigateToEditState={{ state: { status: record.statusSelect } }}
                            isEditable={record.statusSelect !== 2}
                            isDeletable={record.statusSelect !== 2}
                            label1={record.statusSelect === 2 ? { value: record.status } : null}
                            label2={record.statusSelect === 1 || record.statusSelect === 3 ? { value: record.status } : null}
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
          refreshData={getBankReconciliations}
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          checked={checked}
          setChecked={setChecked}
          data={displayedReconciliations}
          alertHandler={alertHandler}
          setActionInProgress={setActionInProgress}
          bulkActionConfig={{
            canDelete: canDelete,
            deleteSuccessMessage: 'LBL_BANK_RECONCILIATIONS_DELETED',
            modelsEnumKey: 'BANK_RECONCILIATIONS',
          }}
        />
      )}
      {!isLoading && bankReconciliations && bankReconciliations.length === 0 && searchValue === '' && (
        <NoData
          imgSrc={NoBankReconciliationImg}
          noDataMessage={t('NO_BANK_RECONCILIATIONS_DATA_MESSAGE')}
          addButtontext={t('LBL_ADD_STATEMENT')}
          addButtonPath={getFeaturePath('BANK_STATEMENTS', 'add')}
          showAdd={canAdd}
        />
      )}
    </>
  );
};

export default BankReconciliations;
