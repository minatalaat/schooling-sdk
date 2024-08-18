import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { useDispatch } from 'react-redux';

import Toolbar from '../../parts/Toolbar';
import NoData from '../../components/NoData';
import MoreAction from '../../parts/MoreAction';
import BreadCrumb from '../../components/ui/BreadCrumb';
import Table from '../../components/ListingTable/Table';
import TableRow from '../../components/ListingTable/TableRow';
import CardsList from '../../components/CardsList/CardsList';
import Card from '../../components/CardsList/Card';
import Spinner from '../../components/Spinner/Spinner';
import AddButton from '../../components/ui/buttons/AddButton';
import Calendar from '../../components/ui/Calendar';

import { useAxiosFunction } from '../../hooks/useAxios';
import { MODELS } from '../../constants/models';
import { getSearchUrl } from '../../services/getUrl';
import { useFeatures } from '../../hooks/useFeatures';
import { STOCK_COUNT_SEARCH_FIELDS } from './StockCountPayloadsFields';
import { STOCK_COUNT_TYPE_ENUM, STOCK_COUNT_STATUS_ENUM } from '../../constants/enums/StockCountEnum';
import { alertsActions } from '../../store/alerts';

import NoStockCountImg from '../../assets/images/icons/Products.svg';

const StockCount = () => {
  let feature = 'STOCK_MANAGEMENT';
  let subFeature = 'STOCK_COUNT';
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getFeaturePath } = useFeatures();
  const { api } = useAxiosFunction();
  const { canAdd, canDelete } = useFeatures(feature, subFeature);
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(true);
  const [stockCounts, setStockCounts] = useState([]);
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

  const alertHandler = (title, message) => dispatch(alertsActions.initiateAlert({ title, message }));

  const searchPayload = {
    fields: STOCK_COUNT_SEARCH_FIELDS,
    sortBy: ['-id'],
    data: {
      _domain: null,
      _domainContext: { _id: null, _model: MODELS.INVENTORY },
      operator: 'and',
      criteria: [],
    },
    limit: pageSize,
    offset: offset,
    translate: true,
  };

  const searchPayloadwithValue = {
    fields: STOCK_COUNT_SEARCH_FIELDS,
    sortBy: ['-id'],
    data: {
      _domain: null,
      _domainContext: { _id: null, _model: MODELS.INVENTORY },
      operator: 'or',
      criteria: [
        {
          fieldName: 'inventorySeq',
          operator: 'like',
          value: searchValue,
        },
        {
          fieldName: 'stockLocation.name',
          operator: 'like',
          value: searchValue,
        },
        {
          fieldName: 'company.name',
          operator: 'like',
          value: searchValue,
        },
      ],
    },
    limit: pageSize,
    offset: offset,
    translate: true,
  };

  const fields = [
    { accessor: 'inventorySeq', Header: t('LBL_INVENTORY_SEQ'), type: 'text' },
    { accessor: 'name', Header: t('LBL_STOCK_LOCATION'), type: 'text' },
    { accessor: 'typeSelect', Header: t('LBL_TYPE'), type: 'text', translate: true },
    { accessor: 'plannedStartDateT', Header: t('LBL_PLANNED_START_DATE'), type: 'text' },
    { accessor: 'plannedEndDateT', Header: t('LBL_PLANNED_END_DATE'), type: 'text' },
    { accessor: 'statusSelect', Header: t('LBL_STATUS'), type: 'text', translate: true },
  ];

  const subTitles = [
    { label: 'LBL_INVENTORY_SEQ', key: 'inventorySeq' },
    { label: 'LBL_PLANNED_START_DATE', key: 'plannedStartDateT' },
    { label: 'LBL_PLANNED_END_DATE', key: 'plannedEndDateT' },
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
    getStockCount();
  }, [searchParams]);

  const getStockCount = () => {
    if (searchValue === '') {
      setStockCounts([]);
      setIsLoading(true);
    }

    let payload = searchValue && searchValue !== '' ? searchPayloadwithValue : searchPayload;
    api('POST', getSearchUrl(MODELS.INVENTORY), payload, onStockCountSearchSuccess);
  };

  const onStockCountSearchSuccess = response => {
    let status = response.data.status;
    let data = response.data.data;
    let total = response.data.total;
    setIsLoading(false);

    if (status !== 0 || total === undefined || total === null) {
      setStockCounts([]);
      return alertHandler('Error', t('LBL_ERROR_LOADING_STOCK_COUNT'));
    }

    setTotal(total);

    if (data === undefined || data === null) {
      setStockCounts([]);
    }

    if (data) {
      let tempData = [];

      data.forEach(item => {
        let listItem = { ...item };
        listItem.name = listItem.stockLocation?.name ?? '';
        listItem.inventorySeq = listItem.inventorySeq ? listItem.inventorySeq : '';
        listItem.typeSelect = listItem.typeSelect ? STOCK_COUNT_TYPE_ENUM[listItem.typeSelect] : '';
        listItem.plannedStartDateT = moment(new Date(listItem.plannedStartDateT)).locale('en').format('YYYY-MM-DD hh:mm');
        listItem.plannedEndDateT = moment(new Date(listItem.plannedEndDateT)).locale('en').format('YYYY-MM-DD hh:mm');
        listItem.statusSelect = listItem.statusSelect ? STOCK_COUNT_STATUS_ENUM[listItem.statusSelect] : '';
        tempData.push(listItem);
      });
      setStockCounts(tempData);
    }
  };

  return (
    <>
      {actionInProgress && <div className="lodingpage"></div>}
      {isLoading && <Spinner />}
      {((!isLoading && searchValue !== '') || (stockCounts && stockCounts.length > 0)) && (
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
                  <h4>{t('LBL_STOCK_COUNT')}</h4>
                </div>
                {canAdd && (
                  <div className="reverse-page float-end">
                    <AddButton
                      text="LBL_ADD_STOCK_COUNT"
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
                  refreshData={getStockCount}
                  setShowMoreAction={setShowMoreAction}
                  checked={checked}
                  setChecked={setChecked}
                  data={stockCounts}
                  setActionInProgress={setActionInProgress}
                  bulkActionConfig={{
                    canDelete: canDelete,
                    deleteSuccessMessage: 'LBL_STOCK_COUNT_DELETED',
                    modelsEnumKey: 'STOCK_COUNT',
                    isExport: true,
                  }}
                  searchPayload={searchValue && searchValue !== '' ? searchPayloadwithValue : searchPayload}
                />
                {!isLoading && show === 'table' && windowSize[0] > 1200 && (
                  <Table
                    fields={fields}
                    data={stockCounts}
                    total={total}
                    checked={checked}
                    setChecked={setChecked}
                    feature={feature}
                    subFeature={subFeature}
                  >
                    {stockCounts.length > 0 &&
                      stockCounts.map(record => {
                        return (
                          <TableRow
                            key={record}
                            record={record}
                            fields={fields}
                            deleteModel={MODELS.INVENTORY}
                            refreshData={getStockCount}
                            checked={checked}
                            setChecked={setChecked}
                            setActionInProgress={setActionInProgress}
                            feature={feature}
                            subFeature={subFeature}
                            isEditable={record.statusSelect !== 'LBL_CANCELED' && record.statusSelect !== 'LBL_VALIDATED'}
                            isDeletable={record.statusSelect !== 'LBL_CANCELED' && record.statusSelect !== 'LBL_VALIDATED'}
                          />
                        );
                      })}
                  </Table>
                )}
                {!isLoading && (show === 'card' || windowSize[0] <= 1200) && (
                  <CardsList total={total}>
                    {stockCounts &&
                      stockCounts.map(record => {
                        return (
                          <Card
                            key={key}
                            feature={feature}
                            subFeature={subFeature}
                            record={record}
                            title="name"
                            subTitles={subTitles}
                            deleteModel={MODELS.INVENTORY}
                            refreshData={getStockCount}
                            setActionInProgress={setActionInProgress}
                            checked={checked}
                            setChecked={setChecked}
                            label1={{ value: record.statusSelect }}
                            isEditable={record.statusSelect !== 'LBL_CANCELED'}
                            isDeletable={true}
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
          refreshData={getStockCount}
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          checked={checked}
          setChecked={setChecked}
          data={stockCounts}
          alertHandler={alertHandler}
          setActionInProgress={setActionInProgress}
          bulkActionConfig={{
            canDelete: canDelete,
            deleteSuccessMessage: 'LBL_STOCK_COUNT_DELETED',
            modelsEnumKey: 'STOCK_COUNT',
          }}
        />
      )}
      {!isLoading && stockCounts && stockCounts.length === 0 && searchValue === '' && (
        <NoData
          imgSrc={NoStockCountImg}
          noDataMessage={t('NO_STOCK_COUNT_DATA_MESSAGE')}
          showAdd={canAdd}
          addButtontext={t('LBL_ADD_STOCK_COUNT')}
          addButtonPath={getFeaturePath(subFeature, 'add')}
        />
      )}
    </>
  );
};

export default StockCount;
