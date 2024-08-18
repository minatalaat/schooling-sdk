import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import Toolbar from '../../parts/Toolbar';
import MoreAction from '../../parts/MoreAction';
import NoData from '../../components/NoData';
import BreadCrumb from '../../components/ui/BreadCrumb';
import Table from '../../components/ListingTable/Table';
import TableRow from '../../components/ListingTable/TableRow';
import CardsList from '../../components/CardsList/CardsList';
import Card from '../../components/CardsList/Card';
import Spinner from '../../components/Spinner/Spinner';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';
import Calendar from '../../components/ui/Calendar';

import { MODELS } from '../../constants/models';
import { checkFlashOrError } from '../../utils/helpers';
import { useAxiosFunction } from '../../hooks/useAxios';
import { getSearchUrl, getActionUrl } from '../../services/getUrl';
import { useFeatures } from '../../hooks/useFeatures';
import { MOVE_SEARCH_PAYLOAD_FIELDS } from './JournalsPayloadsFields';
import { alertsActions } from '../../store/alerts';

import NoJournalEntriesImg from '../../assets/images/icons/Journal Entries.svg';

const Journals = ({ feature, subFeature }) => {
  const { api } = useAxiosFunction();
  const { canAdd, canDelete } = useFeatures(feature, subFeature);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getFeaturePath } = useFeatures();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const statusSelected = ['', 'LBL_NEW', 'LBL_DAYBOOK', 'LBL_ACCOUNTED', 'LBL_CANCELLED', 'LBL_SIMULATED'];

  const [isLoading, setIsLoading] = useState(true);
  const [moves, setMoves] = useState([]);
  const [show, setShow] = useState('table');
  const [total, setTotal] = useState(0);

  let searchValue = searchParams.get('search') || '';
  let currentPage = parseInt(searchParams.get('currentPage') || 1);
  let pageSize = parseInt(searchParams.get('pageSize') || 10);
  let offset = (currentPage - 1) * pageSize;

  const [checked, setChecked] = useState([]);

  const [windowSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);

  const alertHandler = (title, message) => dispatch(alertsActions.initiateAlert({ title, message }));

  const fields = [
    { accessor: 'reference', Header: t('LBL_REFERENCE'), type: 'text' },
    { accessor: 'journal', Header: t('LBL_JOURNAL_TYPE'), type: 'text' },
    { accessor: 'period', Header: t('LBL_PERIOD'), type: 'text' },
    { accessor: 'date', Header: t('LBL_POSTING_DATE'), type: 'text' },
    { accessor: 'accountingDate', Header: t('LBL_TRANSACTION_DATE'), type: 'text' },
    { accessor: 'partner', Header: t('LBL_CUSTOMER_SUPPLIER'), type: 'text' },
    { accessor: 'status', Header: t('LBL_STATUS'), type: 'text', translate: true },
  ];

  const subTitles = [
    { label: 'LBL_JOURNAL_TYPE', key: 'journal' },
    { label: 'LBL_POSTING_DATE', key: 'date' },
    { label: 'LBL_TRANSACTION_DATE', key: 'accountingDate' },
  ];

  const searchPayload = useMemo(() => {
    let payload = '';

    if (searchValue && searchValue !== '') {
      payload = {
        fields: MOVE_SEARCH_PAYLOAD_FIELDS,
        sortBy: ['-id'],
        data: {
          _domain: null,
          _domainContext: {
            _isActivateSimulatedMoves: null,
            _id: null,
            _model: MODELS.MOVE,
          },
          operator: 'or',
          criteria: [
            {
              fieldName: 'reference',
              operator: 'like',
              value: searchValue,
            },
            {
              fieldName: 'journal.name',
              operator: 'like',
              value: searchValue,
            },
            {
              fieldName: 'date',
              operator: 'between',
              value: searchValue,
              value2: searchValue,
            },
            {
              fieldName: 'accountingDate',
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
    } else {
      payload = {
        fields: MOVE_SEARCH_PAYLOAD_FIELDS,
        sortBy: ['-id'],
        data: {
          _domain: null,
          _domainContext: {
            _isActivateSimulatedMoves: null,
            _id: null,
            _model: MODELS.MOVE,
          },
          operator: 'and',
          criteria: [],
        },
        limit: pageSize,
        offset: offset,
        translate: true,
      };
    }

    return payload;
  }, [searchValue, pageSize, offset]);

  const getMoves = () => {
    if (searchValue === '') {
      setMoves([]);
      setIsLoading(true);
    }

    api('POST', getSearchUrl(MODELS.MOVE), searchPayload, onSearchSuccess);
  };

  const onSearchSuccess = response => {
    let status = response.data.status;
    let data = response.data.data;
    let total = response.data.total;
    setIsLoading(false);

    if (status !== 0 || total === undefined || total === null) {
      setMoves([]);
      return alertHandler('Error', 'LBL_ERROR_LOADING_JOURNAL_ENTRIES');
    }

    setTotal(total);

    if (!data) {
      setMoves([]);
    }

    if (data) {
      let tempData = [];
      data.forEach(item => {
        let listItem = { ...item };
        listItem.name = listItem.reference;
        listItem.journal = listItem.journal?.name ?? '';
        listItem.period = listItem.period?.name ?? '';
        listItem.partner = listItem.partner?.fullName ?? '';
        listItem.company = listItem.company?.name ?? '';
        listItem.status = listItem.statusSelect >= 0 ? statusSelected[listItem.statusSelect] : '';
        tempData.push(listItem);
      });
      setMoves(tempData);
    }
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
    window.scrollTo(0, 0);
    setChecked([]);
    getMoves();
  }, [searchParams]);

  const bulkDeletePayload = () => {
    let payload = {
      model: MODELS.MOVE,
      action: 'action-move-method-delete-multiple-moves',
      data: {
        criteria: [],
        context: {
          _model: MODELS.MOVE,
          _isActivateSimulatedMoves: null,
          _id: null,
          _ids: checked.map(checked => checked.id),
        },
      },
    };
    return payload;
  };

  const bulkDeleteHandler = () => {
    if (checked.length > 0) {
      setActionInProgress(true);
      api('POST', getActionUrl(), bulkDeletePayload(), onDeleteSuccess);
    }
  };

  const deleteMovePayload = id => {
    let payload = {
      model: MODELS.MOVE,
      action: 'action-move-method-delete-move',
      data: {
        criteria: [],
        context: {
          _model: MODELS.MOVE,
          _isActivateSimulatedMoves: null,
          _id: null,
          id: id,
        },
      },
    };
    return payload;
  };

  const handleSingleDelete = id => {
    api('POST', getActionUrl(), deleteMovePayload(id), onDeleteSuccess);
  };

  const onDeleteSuccess = response => {
    setActionInProgress(false);
    let status = response.data.status;
    let data = response.data.data;
    setChecked([]);
    if (status !== 0) return alertHandler('Error', 'LBL_CANT_DELETE_MOVES');
    if (data === undefined || data === null) return alertHandler('Error', 'LBL_CANT_DELETE_MOVES');

    if (data && checkFlashOrError(data)) {
      let flash = data[0].flash;
      if (flash && flash.includes('Please select')) {
        return alertHandler('Error', 'LBL_CANT_DELETE_MOVES');
      } else if (flash && (flash.includes('Selected move') || flash.includes('Move has been removed'))) {
        alertHandler('Success', 'LBL_MOVES_DELETED');
      } else return alertHandler('Error', 'LBL_CANT_DELETE_MOVES');
    }

    setTimeout(() => {
      getMoves();
    }, 3000);
  };

  return (
    <>
      {actionInProgress && <div className="lodingpage"></div>}
      {isLoading && <Spinner />}
      {((!isLoading && searchValue !== '') || (moves && moves.length > 0)) && (
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
                  <h4>{t('LBL_JOURNAL_ENTRIES')}</h4>
                </div>

                {canAdd && (
                  <div className="reverse-page float-end">
                    <PrimaryButton
                      theme="purpleWithIcon"
                      text="LBL_ADD_JOURNAL_ENTRY"
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
                  refreshData={getMoves}
                  deleteHandler={bulkDeleteHandler}
                  setShowMoreAction={setShowMoreAction}
                  checked={checked}
                  setChecked={setChecked}
                  data={moves}
                  setActionInProgress={setActionInProgress}
                  bulkActionConfig={{
                    isExport: true,
                    canDelete: canDelete,
                    modelsEnumKey: 'JOURNAL_ENTRIES',
                  }}
                  searchPayload={searchPayload}
                />
                {!isLoading && show === 'table' && windowSize[0] > 1200 && (
                  <Table
                    fields={fields}
                    data={moves}
                    total={total}
                    checked={checked}
                    setChecked={setChecked}
                    feature={feature}
                    subFeature={subFeature}
                  >
                    {moves.length > 0 &&
                      moves.map(record => {
                        return (
                          <TableRow
                            record={record}
                            fields={fields}
                            isDeletable={record.statusSelect !== 3}
                            deleteModel={MODELS.MOVE}
                            refreshData={getMoves}
                            checked={checked}
                            setChecked={setChecked}
                            setActionInProgress={setActionInProgress}
                            feature={feature}
                            subFeature={subFeature}
                            deleteHandler={handleSingleDelete}
                            navigateToEditState={{ state: { status: record.statusSelect } }}
                            modelsEnumKey="JOURNAL_ENTRIES"
                          />
                        );
                      })}
                  </Table>
                )}
                {!isLoading && (show === 'card' || windowSize[0] <= 1200) && (
                  <CardsList total={total}>
                    {moves &&
                      moves.map(record => {
                        return (
                          <Card
                            feature={feature}
                            subFeature={subFeature}
                            record={record}
                            isDeletable={record.statusSelect !== 3}
                            title="reference"
                            subTitles={subTitles}
                            deleteModel={MODELS.MOVE}
                            refreshData={getMoves}
                            setActionInProgress={setActionInProgress}
                            checked={checked}
                            setChecked={setChecked}
                            navigateToEditState={{ state: { status: record.statusSelect } }}
                            deleteHandler={handleSingleDelete}
                            label1={record.statusSelect === 1 ? { value: statusSelected[record.statusSelect] } : null}
                            label2={record.statusSelect !== 1 ? { value: statusSelected[record.statusSelect] } : null}
                            modelsEnumKey="JOURNAL_ENTRIES"
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
          refreshData={getMoves}
          deleteHandler={bulkDeleteHandler}
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          checked={checked}
          setChecked={setChecked}
          data={moves}
          alertHandler={alertHandler}
          setActionInProgress={setActionInProgress}
          bulkActionConfig={{
            isExport: true,
            canDelete: canDelete,
            modelsEnumKey: 'JOURNAL_ENTRIES',
          }}
          searchPayload={searchPayload}
        />
      )}
      {!isLoading && moves && moves.length === 0 && searchValue === '' && (
        <NoData
          imgSrc={NoJournalEntriesImg}
          noDataMessage={t('NO_JOURNAL_ENTRIES_DATA_MESSAGE')}
          showAdd={canAdd}
          addButtontext={t('LBL_ADD_JOURNAL_ENTRY')}
          addButtonPath={getFeaturePath(subFeature, 'add')}
        />
      )}
    </>
  );
};

export default Journals;
