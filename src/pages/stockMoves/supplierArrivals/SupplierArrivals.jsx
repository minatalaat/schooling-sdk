import { useState, useEffect } from 'react';
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
import Calendar from '../../../components/ui/Calendar';

import { useAxiosFunction } from '../../../hooks/useAxios';
import { getSearchUrl } from '../../../services/getUrl';
import { useFeatures } from '../../../hooks/useFeatures';
import { getDateAfterXDays } from '../../../utils/helpers';
import { MODELS } from '../../../constants/models';
import { STOCK_MOVE_STATUS, INVOICING_STATUS_ENUM } from '../../../constants/enums/StockMoveEnums';
import { STOCK_MOVES_SEARCH_FIELDS } from '../StockMovesPayloadsFields';
import { alertsActions } from '../../../store/alerts';

import NoSupplierArrivalsImg from '../../../assets/images/icons/Products.svg';

const SupplierArrivals = () => {
  const feature = 'STOCK_MANAGEMENT';
  const subFeature = 'SUPPLIER_ARRIVALS';
  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  const { canDelete } = useFeatures(feature, subFeature);
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(true);
  const [supplierArrivals, setSupplierArrivals] = useState([]);
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
      _domain: 'self.typeSelect = :_typeSelect AND self.isReversion = FALSE',
      _domainContext: {
        _isReversion: false,
        _id: null,
        _newDate: newDate,
        _typeSelect: 3,
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
      _domain: 'self.typeSelect = :_typeSelect AND self.isReversion = FALSE',
      _domainContext: {
        _isReversion: false,
        _id: null,
        _newDate: newDate,
        _typeSelect: 3,
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
          fieldName: 'origin',
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
    { accessor: 'partnerFullName', Header: t('LBL_SUPPLIER'), type: 'text' },
    { accessor: 'toStockLocationName', Header: t('LBL_TO_STOCK_LOCATION'), type: 'text' },
    { accessor: 'estimatedDate', Header: t('LBL_ESTIMATED_DATE'), type: 'text' },
    { accessor: 'origin', Header: t('LBL_ORIGIN'), type: 'text' },
    { accessor: 'status', Header: t('LBL_STATUS'), type: 'text', translate: true },
    { accessor: 'invoicingStatus', Header: t('LBL_INVOICING_STATUS'), type: 'text', translate: true },
  ];

  const subTitles = [
    { label: 'LBL_SUPPLIER', key: 'partnerFullName' },
    { label: 'LBL_TO_STOCK_LOCATION', key: 'toStockLocationName' },
    { label: 'LBL_INVOICING_STATUS', key: 'invoicingStatus', translate: true },
  ];

  const infoColors = {
    field: 'colorLabel',
    data: [
      { colorId: '4', label: 'LBL_DRAFT' },
      { colorId: '1', label: 'LBL_PLANNED' },
      { colorId: '2', label: 'LBL_CONFIRMED' },
      { colorId: '3', label: 'LBL_CANCELED' },
    ],
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
    getSupplierArrivals();
  }, [searchParams]);

  const getSupplierArrivals = () => {
    if (searchValue === '') {
      setSupplierArrivals([]);
      setIsLoading(true);
    }

    let payload = searchValue && searchValue !== '' ? searchPayloadwithValue : searchPayload;
    api('POST', getSearchUrl(MODELS.STOCK_MOVE), payload, onSupplierArrivalsSearchSuccess);
  };

  const onSupplierArrivalsSearchSuccess = response => {
    let status = response.data.status;
    let data = response.data.data;
    let total = response.data.total;
    setIsLoading(false);

    if (status !== 0 || total === undefined || total === null) {
      setSupplierArrivals([]);
      return alertHandler('Error', 'LBL_ERROR_LOADING_SUPPLIER_ARRIVALS');
    }

    setTotal(total);

    if (data === undefined || data === null) {
      setSupplierArrivals([]);
    }

    if (data) {
      let tempData = [];
      data.forEach(item => {
        let listItem = { ...item };
        listItem.name = listItem.stockMoveSeq;
        listItem.origin = listItem.origin ?? '';
        listItem.partnerFullName = listItem.partner?.fullName ?? '';
        listItem.toStockLocationName = listItem.toStockLocation?.name ?? '';
        listItem.status = STOCK_MOVE_STATUS[listItem.statusSelect];
        listItem.invoicingStatus = INVOICING_STATUS_ENUM[listItem.invoicingStatusSelect ?? 0];
        listItem.colorLabel = STOCK_MOVE_STATUS[listItem.statusSelect];
        tempData.push(listItem);
      });
      setSupplierArrivals(tempData);
    }
  };

  return (
    <>
      {actionInProgress && <div className="lodingpage"></div>}
      {isLoading && <Spinner />}
      {((!isLoading && searchValue !== '') || (supplierArrivals && supplierArrivals.length > 0)) && (
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
                  <h4>{t('LBL_SUPPLIER_ARRIVALS')}</h4>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <Toolbar
                  show={show}
                  setShow={setShow}
                  refreshData={getSupplierArrivals}
                  setShowMoreAction={setShowMoreAction}
                  checked={checked}
                  setChecked={setChecked}
                  data={supplierArrivals}
                  setActionInProgress={setActionInProgress}
                  bulkActionConfig={{
                    canDelete: canDelete,
                    deleteSuccessMessage: 'LBL_SUPPLIER_ARRIVAL_DELETED',
                    modelsEnumKey: 'SUPPLIER_ARRIVALS',
                    isExport: true,
                  }}
                  searchPayload={searchValue && searchValue !== '' ? searchPayloadwithValue : searchPayload}
                />
                {!isLoading && show === 'table' && windowSize[0] > 1200 && (
                  <Table
                    fields={fields}
                    data={supplierArrivals}
                    total={total}
                    checked={checked}
                    setChecked={setChecked}
                    feature={feature}
                    subFeature={subFeature}
                    infoColors={infoColors}
                  >
                    {supplierArrivals.length > 0 &&
                      supplierArrivals.map(record => {
                        return (
                          <TableRow
                          key={record}

                            record={record}
                            fields={fields}
                            deleteModel={MODELS.STOCK_MOVE}
                            refreshData={getSupplierArrivals}
                            checked={checked}
                            setChecked={setChecked}
                            setActionInProgress={setActionInProgress}
                            feature={feature}
                            subFeature={subFeature}
                            isEditable={record.statusSelect < 4}
                            isDeletable={record.statusSelect === 1}
                            infoColors={infoColors}
                          />
                        );
                      })}
                  </Table>
                )}
                {!isLoading && (show === 'card' || windowSize[0] <= 1200) && (
                  <CardsList total={total}>
                    {supplierArrivals &&
                      supplierArrivals.map(record => {
                        return (
                          <Card
                          key={record}
                            feature={feature}
                            subFeature={subFeature}
                            record={record}
                            title="stockMoveSeq"
                            subTitles={subTitles}
                            deleteModel={MODELS.STOCK_MOVE}
                            refreshData={getSupplierArrivals}
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
          refreshData={getSupplierArrivals}
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          checked={checked}
          setChecked={setChecked}
          data={supplierArrivals}
          alertHandler={alertHandler}
          setActionInProgress={setActionInProgress}
          bulkActionConfig={{
            canDelete: canDelete,
            deleteSuccessMessage: 'LBL_SUPPLIER_ARRIVAL_DELETED',
            modelsEnumKey: 'SUPPLIER_ARRIVALS',
          }}
        />
      )}
      {!isLoading && supplierArrivals && supplierArrivals.length === 0 && searchValue === '' && (
        <NoData imgSrc={NoSupplierArrivalsImg} noDataMessage={t('NO_SUPPLIER_ARRIVALS_DATA_MESSAGE')} />
      )}
    </>
  );
};

export default SupplierArrivals;
