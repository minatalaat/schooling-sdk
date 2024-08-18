import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import Toolbar from '../../parts/Toolbar';
import Table from '../../components/ListingTable/Table';
import TableRow from '../../components/ListingTable/TableRow';
import CardsList from '../../components/CardsList/CardsList';
import Card from '../../components/CardsList/Card';
import Spinner from '../../components/Spinner/Spinner';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';
import BreadCrumb from '../../components/ui/BreadCrumb';
import MoreAction from '../../parts/MoreAction';
import NoData from '../../components/NoData';
import Calendar from '../../components/ui/Calendar';

import { checkFlashOrError } from '../../utils/helpers';
import { getSearchUrl, getActionUrl } from '../../services/getUrl';
import { STATEMENTS_FIELDS } from './StatementsPayloadsFields';
import { useFeatures } from '../../hooks/useFeatures';
import { getStatementErrorLabel } from '../../utils/statementHelpers';
import { useAxiosFunction } from '../../hooks/useAxios';
import { MODELS } from '../../constants/models';
import { alertsActions } from '../../store/alerts';

import NoBankStatementsImg from '../../assets/images/icons/Bank statements.svg';

const BankStatements = ({ feature, subFeature }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getFeaturePath } = useFeatures();
  const { api } = useAxiosFunction();
  const { canAdd, canDelete } = useFeatures(feature, subFeature);
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(true);
  const [bankStatements, setBankStatements] = useState([]);
  const [displayedStatements, setDisplayedStatements] = useState([]);
  const [show, setShow] = useState('table');
  const [checked, setChecked] = useState([]);
  const [records, setRecords] = useState([]);

  const [total, setTotal] = useState(0);
  let searchValue = searchParams.get('search') || '';
  let currentPage = parseInt(searchParams.get('currentPage') || 1);
  let pageSize = parseInt(searchParams.get('pageSize') || 10);
  let offset = (currentPage - 1) * pageSize;

  const [windowSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);

  const statementStatusSelect = ['', 'LBL_DRAFT', 'LBL_IMPORTED'];

  const alertHandler = (title, message) => dispatch(alertsActions.initiateAlert({ title, message }));

  const searchPayload = {
    fields: STATEMENTS_FIELDS,
    sortBy: ['statusSelect', '-toDate', 'name'],
    data: {
      _domain: null,
      _domainContext: {
        _id: null,
        _model: MODELS.BANK_STATEMENT,
      },
      operator: 'and',
      criteria: [],
    },
    limit: pageSize,
    offset: offset,
    translate: true,
  };

  const searchPayloadwithValue = {
    fields: STATEMENTS_FIELDS,
    sortBy: ['statusSelect', '-toDate', 'name'],
    data: {
      _domain: null,
      _domainContext: {
        _id: null,
        _model: MODELS.BANK_STATEMENT,
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
    { accessor: 'name', Header: t('LBL_NAME'), type: 'text' },
    { accessor: 'bankStatementFileFormat', Header: t('LBL_FILE_FORMAT'), type: 'text' },
    { accessor: 'fromDate', Header: t('LBL_FROM_DATE'), type: 'text' },
    { accessor: 'toDate', Header: t('LBL_TO_DATE'), type: 'text' },
    { accessor: 'status', Header: t('LBL_STATUS'), type: 'text', translate: true },
  ];

  const subTitles = [
    { label: 'LBL_FILE_FORMAT', key: 'bankStatementFileFormat' },
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
    getBankStatements();
  }, [searchParams]);

  const getBankStatements = () => {
    if (searchValue === '') {
      setBankStatements([]);
      setDisplayedStatements([]);
      setIsLoading(true);
    }

    let payload = searchValue && searchValue !== '' ? searchPayloadwithValue : searchPayload;
    api('POST', getSearchUrl(MODELS.BANK_STATEMENT), payload, onGetBankStatementsSuccess);
  };

  const onGetBankStatementsSuccess = response => {
    let status = response.data.status;
    let total = response.data.total;
    let data = response.data.data;
    setIsLoading(false);

    if (status !== 0 || total === undefined || total === null) {
      setBankStatements([]);
      setDisplayedStatements([]);
      return alertHandler('Error', t('LBL_ERROR_LOADING_BANK_STATEMENTS'));
    }

    setTotal(total);

    if (data === undefined || data === null) {
      setBankStatements([]);
      setDisplayedStatements([]);
    }

    if (data) {
      setBankStatements(data);
      let tempData = [];
      data.forEach(item => {
        let listItem = { ...item };
        listItem.bankStatementFileFormat = listItem.bankStatementFileFormat?.name ?? '';
        listItem.status = statementStatusSelect[listItem.statusSelect];
        tempData.push(listItem);
      });
      setDisplayedStatements(tempData);
    }
  };

  const bulkDeleteHandler = () => {
    if (checked.length > 0) {
      setRecords(checked.map(checked => checked.id));
    }
  };

  useEffect(() => {
    if (records && records.length > 0) bulkDeleteStatement(records);
  }, [records]);

  const getDeleteStatementPayload = id => {
    let payload = {
      model: MODELS.BANK_STATEMENT,
      action: 'action-bank-statement-remove-all',
      data: {
        context: {
          ids: id,
        },
      },
    };
    return payload;
  };

  const bulkDeleteStatement = records => {
    if (records.length > 0) {
      setActionInProgress(true);
      api('POST', getActionUrl(), getDeleteStatementPayload(records), onStatementDeleteSuccess);
    }
  };

  const deleteBankStatement = id => {
    api('POST', getActionUrl(), getDeleteStatementPayload([id]), onStatementDeleteSuccess);
  };

  const onStatementDeleteSuccess = response => {
    setActionInProgress(false);
    setChecked([]);
    let status = response.data.status;
    let data = response.data.data;

    if (status === -1) {
      if (data && checkFlashOrError(data)) {
        return alertHandler('Error', t(getStatementErrorLabel(data[0].error)));
      }

      return alertHandler('Error', t('LBL_ERROR_DELETE_BANK_STATEMENTS'));
    }

    if (status !== 0) return alertHandler('Error', t('LBL_ERROR_DELETE_BANK_STATEMENTS'));

    if (status === 0) {
      if (data && checkFlashOrError(data)) {
        return alertHandler('Error', t('LBL_ERROR_DELETE_BANK_STATEMENTS'));
      }

      alertHandler('Success', t('LBL_BANK_STATEMENTS_DELETED'));
    }

    setTimeout(() => {
      getBankStatements();
    }, 3000);
  };

  return (
    <>
      {isLoading && <Spinner />}
      {actionInProgress && <div className="lodingpage"></div>}
      {((!isLoading && searchValue !== '') || (bankStatements && bankStatements.length > 0)) && (
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
                  <h4>{t('LBL_BANK_STATEMENTS')}</h4>
                </div>

                {canAdd && (
                  <div className="reverse-page float-end">
                    <PrimaryButton
                      theme="purpleWithIcon"
                      text="LBL_ADD_BANK_STATEMENT"
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
                  refreshData={getBankStatements}
                  deleteHandler={bulkDeleteHandler}
                  setShowMoreAction={setShowMoreAction}
                  checked={checked}
                  setChecked={setChecked}
                  data={displayedStatements}
                  setActionInProgress={setActionInProgress}
                  bulkActionConfig={{
                    canDelete: canDelete,
                    isExport: true,
                    modelsEnumKey: 'BANK_STATEMENTS',
                  }}
                  searchPayload={searchValue && searchValue !== '' ? searchPayloadwithValue : searchPayload}
                />
                {!isLoading && show === 'table' && windowSize[0] > 1200 && (
                  <Table
                    fields={fields}
                    data={displayedStatements}
                    total={total}
                    checked={checked}
                    setChecked={setChecked}
                    feature={feature}
                    subFeature={subFeature}
                  >
                    {displayedStatements.length > 0 &&
                      displayedStatements.map(record => {
                        return (
                          <TableRow
                            record={record}
                            fields={fields}
                            deleteModel={MODELS.BANK_STATEMENT}
                            refreshData={getBankStatements}
                            checked={checked}
                            setChecked={setChecked}
                            setActionInProgress={setActionInProgress}
                            feature={feature}
                            subFeature={subFeature}
                            isEditable={record.statusSelect < 2}
                            deleteHandler={deleteBankStatement}
                          />
                        );
                      })}
                  </Table>
                )}
                {!isLoading && (show === 'card' || windowSize[0] <= 1200) && (
                  <CardsList total={total}>
                    {displayedStatements &&
                      displayedStatements.map(record => {
                        return (
                          <Card
                            feature={feature}
                            subFeature={subFeature}
                            record={record}
                            title="name"
                            subTitles={subTitles}
                            deleteModel={MODELS.BANK_STATEMENT}
                            refreshData={getBankStatements}
                            setActionInProgress={setActionInProgress}
                            checked={checked}
                            setChecked={setChecked}
                            isEditable={record.statusSelect < 2}
                            deleteHandler={deleteBankStatement}
                            label1={record.statusSelect === 1 ? { value: record.status } : null}
                            label2={record.statusSelect === 2 ? { value: record.status } : null}
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
          refreshData={getBankStatements}
          deleteHandler={bulkDeleteStatement}
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          checked={checked}
          setChecked={setChecked}
          data={displayedStatements}
          alertHandler={alertHandler}
          setActionInProgress={setActionInProgress}
          bulkActionConfig={{
            canDelete: canDelete,
            modelsEnumKey: 'BANK_STATEMENTS',
          }}
        />
      )}
      {!isLoading && bankStatements && bankStatements.length === 0 && searchValue === '' && (
        <NoData
          imgSrc={NoBankStatementsImg}
          noDataMessage={t('NO_BANK_STATEMENTS_DATA_MESSAGE')}
          addButtontext={t('LBL_ADD_STATEMENT')}
          addButtonPath={getFeaturePath(subFeature, 'add')}
          showAdd={canAdd}
        />
      )}
    </>
  );
};

export default BankStatements;
