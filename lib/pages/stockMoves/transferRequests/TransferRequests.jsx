import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import BreadCrumb from '../../../components/ui/BreadCrumb';
import Table from '../../../components/ListingTable/Table';
import TableRow from '../../../components/ListingTable/TableRow';
import CardsList from '../../../components/CardsList/CardsList';
import Card from '../../../components/CardsList/Card';
import Spinner from '../../../components/Spinner/Spinner';
import Toolbar from '../../../parts/Toolbar';
import MoreAction from '../../../parts/MoreAction';
import NoData from '../../../components/NoData';
import PrimaryButton from '../../../components/ui/buttons/PrimaryButton';
import Calendar from '../../../components/ui/Calendar';

import { useAxiosFunction } from '../../../hooks/useAxios';
import { MODELS } from '../../../constants/models';
import { getDateAfterXDays } from '../../../utils/helpers';
import { getSearchUrl } from '../../../services/getUrl';
import { useFeatures } from '../../../hooks/useFeatures';
import { STOCK_MOVES_SEARCH_FIELDS } from '../StockMovesPayloadsFields';
import { STOCK_MOVE_STATUS } from '../../../constants/enums/StockMoveEnums';
import { alertsActions } from '../../../store/alerts';

import NoTransferRequestsImg from '../../../assets/images/icons/Products.svg';

const TransferRequests = () => {
  const feature = 'STOCK_MANAGEMENT';
  const subFeature = 'TRANSFER_REQUESTS';
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getFeaturePath } = useFeatures();
  const { api } = useAxiosFunction();
  const { canAdd, canDelete } = useFeatures(feature, subFeature);
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(true);
  const [transferRequests, setTransferRequests] = useState([]);
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

  const newDate = getDateAfterXDays(7);

  const alertHandler = (title, message) => dispatch(alertsActions.initiateAlert({ title, message }));

  const searchPayload = {
    fields: STOCK_MOVES_SEARCH_FIELDS,
    sortBy: ['-estimatedDate'],
    data: {
      _domain: 'self.typeSelect = :_typeSelect AND self.statusSelect = :_statusSelect',
      _domainContext: {
        // _isReversion: false,
        _id: null,
        _newDate: newDate,
        _typeSelect: 1,
        _statusSelect: 1,
        _model: MODELS.STOCK_MOVE,
      },
      operator: 'and',
      criteria: [],
    },
    limit: pageSize,
    offset: offset,
    translate: true,
  };

  const searchPayloadwithValue = {
    fields: STOCK_MOVES_SEARCH_FIELDS,
    sortBy: ['-estimatedDate'],
    data: {
      _domain: 'self.typeSelect = :_typeSelect AND self.statusSelect = :_statusSelect',
      _domainContext: {
        // _isReversion: false,
        _id: null,
        _newDate: newDate,
        _typeSelect: 1,
        _statusSelect: 1,
        _model: MODELS.STOCK_MOVE,
      },
      operator: 'or',
      criteria: [
        {
          fieldName: 'stockMoveSeq',
          operator: 'like',
          value: searchValue,
        },
        {
          fieldName: 'estimatedDate',
          operator: 'between',
          value: searchValue,
          value2: searchValue,
        },
      ],
    },
    limit: pageSize,
    offset: offset,
    translate: true,
  };

  const fields = [
    { accessor: 'stockMoveSeq', Header: t('LBL_REFERENCE'), type: 'text' },
    { accessor: 'fromStockLocationName', Header: t('LBL_FROM_STOCK_LOCATION'), type: 'text' },
    { accessor: 'toStockLocationName', Header: t('LBL_TO_STOCK_LOCATION'), type: 'text' },
    { accessor: 'estimatedDate', Header: t('LBL_ESTIMATED_DATE'), type: 'text' },
    { accessor: 'status', Header: t('LBL_STATUS'), type: 'text', translate: true },
  ];

  const subTitles = [
    { label: 'LBL_FROM_STOCK_LOCATION', key: 'fromStockLocationName' },
    { label: 'LBL_TO_STOCK_LOCATION', key: 'toStockLocationName' },
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
    getTransferRequests();
  }, [searchParams]);

  const getTransferRequests = () => {
    if (searchValue === '') {
      setTransferRequests([]);
      setIsLoading(true);
    }

    let payload = searchValue && searchValue !== '' ? searchPayloadwithValue : searchPayload;
    api('POST', getSearchUrl(MODELS.STOCK_MOVE), payload, onTransferRequestsSearchSuccess);
  };

  const onTransferRequestsSearchSuccess = response => {
    let status = response.data.status;
    let data = response.data.data;
    let total = response.data.total;
    setIsLoading(false);

    if (status !== 0 || total === undefined || total === null) {
      setTransferRequests([]);
      return alertHandler('Error', 'LBL_ERROR_LOADING_TRANSFER_REQUESTS');
    }

    setTotal(total);

    if (data === undefined || data === null) {
      setTransferRequests([]);
    }

    if (data) {
      let tempData = [];
      data.forEach(item => {
        let listItem = { ...item };
        listItem.name = listItem.stockMoveSeq;

        listItem.fromStockLocationName = listItem.fromStockLocation?.name ?? '';
        listItem.toStockLocationName = listItem.toStockLocation?.name ?? '';
        listItem.status = STOCK_MOVE_STATUS[listItem.statusSelect];
        tempData.push(listItem);
      });
      setTransferRequests(tempData);
    }
  };

  return (
    <>
      {actionInProgress && <div className="lodingpage"></div>}
      {isLoading && <Spinner />}
      {((!isLoading && searchValue !== '') || (transferRequests && transferRequests.length > 0)) && (
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
                  <h4>{t('LBL_TRANSFER_REQUESTS')}</h4>
                </div>
                {canAdd && (
                  <div className="reverse-page float-end">
                    <PrimaryButton
                      theme="purpleWithIcon"
                      text="LBL_ADD_TRANSFER_REQUEST"
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
                  refreshData={getTransferRequests}
                  setShowMoreAction={setShowMoreAction}
                  checked={checked}
                  setChecked={setChecked}
                  data={transferRequests}
                  setActionInProgress={setActionInProgress}
                  bulkActionConfig={{
                    canDelete: canDelete,
                    deleteSuccessMessage: 'LBL_TRANSFER_REQUEST_DELETED',
                    modelsEnumKey: 'TRANSFER_REQUESTS',
                    isExport: true,
                  }}
                  searchPayload={searchValue && searchValue !== '' ? searchPayloadwithValue : searchPayload}
                />
                {!isLoading && show === 'table' && windowSize[0] > 1200 && (
                  <Table
                    fields={fields}
                    data={transferRequests}
                    total={total}
                    checked={checked}
                    setChecked={setChecked}
                    feature={feature}
                    subFeature={subFeature}
                  >
                    {transferRequests.length > 0 &&
                      transferRequests.map(record => {
                        return (
                          <TableRow
                          key={record}
                            record={record}
                            fields={fields}
                            deleteModel={MODELS.STOCK_MOVE}
                            refreshData={getTransferRequests}
                            checked={checked}
                            setChecked={setChecked}
                            setActionInProgress={setActionInProgress}
                            feature={feature}
                            subFeature={subFeature}
                            isEditable={record.statusSelect < 4}
                            isDeletable={record.statusSelect === 1}
                          />
                        );
                      })}
                  </Table>
                )}
                {!isLoading && (show === 'card' || windowSize[0] <= 1200) && (
                  <CardsList total={total}>
                    {transferRequests &&
                      transferRequests.map(record => {
                        return (
                          <Card
                          key={record}
                            feature={feature}
                            subFeature={subFeature}
                            record={record}
                            title="stockMoveSeq"
                            subTitles={subTitles}
                            deleteModel={MODELS.STOCK_MOVE}
                            refreshData={getTransferRequests}
                            setActionInProgress={setActionInProgress}
                            checked={checked}
                            setChecked={setChecked}
                            label1={{ value: record.estimatedDate }}
                            label2={{ value: record.status }}
                            isEditable={record.statusSelect < 4}
                            isDeletable={record.statusSelect === 1}
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
          refreshData={getTransferRequests}
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          checked={checked}
          setChecked={setChecked}
          data={transferRequests}
          alertHandler={alertHandler}
          setActionInProgress={setActionInProgress}
          bulkActionConfig={{
            canDelete: canDelete,
            deleteSuccessMessage: 'LBL_TRANSFER_REQUEST_DELETED',
            modelsEnumKey: 'TRANSFER_REQUESTS',
          }}
        />
      )}
      {!isLoading && transferRequests && transferRequests.length === 0 && searchValue === '' && (
        <NoData
          imgSrc={NoTransferRequestsImg}
          noDataMessage={t('NO_TRANSFER_REQUESTS_DATA_MESSAGE')}
          showAdd={canAdd}
          addButtontext={t('LBL_ADD_TRANSFER_REQUEST')}
          addButtonPath={getFeaturePath(subFeature, 'add')}
        />
      )}
    </>
  );
};

export default TransferRequests;
