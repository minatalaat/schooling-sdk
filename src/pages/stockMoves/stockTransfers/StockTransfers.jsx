import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import BreadCrumb from '../../../components/ui/BreadCrumb';
import Table from '../../../components/ListingTable/Table';
import TableRow from '../../../components/ListingTable/TableRow';
import CardsList from '../../../components/CardsList/CardsList';
import Card from '../../../components/CardsList/Card';
import Spinner from '../../../components/Spinner/Spinner';
import Toolbar from '../../../parts/Toolbar';
import NoData from '../../../components/NoData';
import MoreAction from '../../../parts/MoreAction';
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

import NoStockTransfersImg from '../../../assets/images/icons/Products.svg';

const StockTransfers = () => {
  const feature = 'STOCK_MANAGEMENT';
  const subFeature = 'STOCK_TRANSFERS';
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getFeaturePath } = useFeatures();
  const { api } = useAxiosFunction();
  const { canAdd, canDelete } = useFeatures(feature, subFeature);
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(true);
  const [stockTransfers, setStockTransfers] = useState([]);
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
    sortBy: ['-stockMoveSeq', '-estimatedDate'],
    data: {
      _domain: 'self.typeSelect = :_typeSelect AND self.statusSelect != :_statusSelect',
      _domainContext: {
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
    sortBy: ['-stockMoveSeq', '-estimatedDate'],
    data: {
      _domain: 'self.typeSelect = :_typeSelect AND self.statusSelect != :_statusSelect',
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
    getStockTransfers();
  }, [searchParams]);

  const getStockTransfers = () => {
    if (searchValue === '') {
      setStockTransfers([]);
      setIsLoading(true);
    }

    let payload = searchValue && searchValue !== '' ? searchPayloadwithValue : searchPayload;
    api('POST', getSearchUrl(MODELS.STOCK_MOVE), payload, onStockTransfersSearchSuccess);
  };

  const onStockTransfersSearchSuccess = response => {
    let status = response.data.status;
    let data = response.data.data;
    let total = response.data.total;
    setIsLoading(false);

    if (status !== 0 || total === undefined || total === null) {
      setStockTransfers([]);
      return alertHandler('Error', 'LBL_ERROR_LOADING_STOCK_TRANSFERS');
    }

    setTotal(total);

    if (data === undefined || data === null) {
      setStockTransfers([]);
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
      setStockTransfers(tempData);
    }
  };

  return (
    <>
      {actionInProgress && <div className="lodingpage"></div>}
      {isLoading && <Spinner />}
      {((!isLoading && searchValue !== '') || (stockTransfers && stockTransfers.length > 0)) && (
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
                  <h4>{t('LBL_STOCK_TRANSFERS')}</h4>
                </div>
                {canAdd && (
                  <div className="reverse-page float-end">
                    <PrimaryButton
                      theme="purpleWithIcon"
                      text="LBL_ADD_STOCK_TRANSFER"
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
                  refreshData={getStockTransfers}
                  setShowMoreAction={setShowMoreAction}
                  checked={checked}
                  setChecked={setChecked}
                  data={stockTransfers}
                  setActionInProgress={setActionInProgress}
                  bulkActionConfig={{
                    canDelete: canDelete,
                    deleteSuccessMessage: 'LBL_STOCK_TRANSFER_DELETED',
                    modelsEnumKey: 'STOCK_TRANSFERS',
                    isExport: true,
                  }}
                  searchPayload={searchValue && searchValue !== '' ? searchPayloadwithValue : searchPayload}
                />
                {!isLoading && show === 'table' && windowSize[0] > 1200 && (
                  <Table
                    fields={fields}
                    data={stockTransfers}
                    total={total}
                    checked={checked}
                    setChecked={setChecked}
                    feature={feature}
                    subFeature={subFeature}
                  >
                    {stockTransfers.length > 0 &&
                      stockTransfers.map(record => {
                        return (
                          <TableRow
                          key={record}
                            record={record}
                            fields={fields}
                            deleteModel={MODELS.STOCK_MOVE}
                            refreshData={getStockTransfers}
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
                    {stockTransfers &&
                      stockTransfers.map(record => {
                        return (
                          <Card
                          key={record}

                            feature={feature}
                            subFeature={subFeature}
                            record={record}
                            title="stockMoveSeq"
                            subTitles={subTitles}
                            deleteModel={MODELS.STOCK_MOVE}
                            refreshData={getStockTransfers}
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
          refreshData={getStockTransfers}
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          checked={checked}
          setChecked={setChecked}
          data={stockTransfers}
          setActionInProgress={setActionInProgress}
          alertHandler={alertHandler}
          bulkActionConfig={{
            canDelete: canDelete,
            deleteSuccessMessage: 'LBL_STOCK_TRANSFER_DELETED',
            modelsEnumKey: 'STOCK_TRANSFERS',
          }}
        />
      )}
      {!isLoading && stockTransfers && stockTransfers.length === 0 && searchValue === '' && (
        <NoData
          imgSrc={NoStockTransfersImg}
          noDataMessage={t('NO_STOCK_TRANSFERS_DATA_MESSAGE')}
          showAdd={canAdd}
          addButtontext={t('LBL_ADD_STOCK_TRANSFER')}
          addButtonPath={getFeaturePath(subFeature, 'add')}
        />
      )}
    </>
  );
};

export default StockTransfers;
