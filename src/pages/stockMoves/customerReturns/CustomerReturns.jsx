import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import Toolbar from '../../../parts/Toolbar';
import NoData from '../../../components/NoData';
import MoreAction from '../../../parts/MoreAction';
import BreadCrumb from '../../../components/ui/BreadCrumb';
import Table from '../../../components/ListingTable/Table';
import TableRow from '../../../components/ListingTable/TableRow';
import CardsList from '../../../components/CardsList/CardsList';
import Card from '../../../components/CardsList/Card';
import Spinner from '../../../components/Spinner/Spinner';
import Calendar from '../../../components/ui/Calendar';

import { useAxiosFunction } from '../../../hooks/useAxios';
import { getSearchUrl, getRemoveAllUrl } from '../../../services/getUrl';
import { useFeatures } from '../../../hooks/useFeatures';
import { MODELS } from '../../../constants/models';
import { STOCK_MOVES_SEARCH_FIELDS } from '../StockMovesPayloadsFields';
import { STOCK_MOVE_STATUS } from '../../../constants/enums/StockMoveEnums';
import { alertsActions } from '../../../store/alerts';

import NoCustomerReturnsImg from '../../../assets/images/icons/Products.svg';

const CustomerReturns = () => {
  const feature = 'STOCK_MANAGEMENT';
  const subFeature = 'CUSTOMER_RETURNS';
  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  const { canDelete } = useFeatures(feature, subFeature);
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const [customerReturns, setCustomerReturns] = useState([]);
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
  const [isLoading, setIsLoading] = useState(true);

  const alertHandler = (title, message) => {
    setActionInProgress(false);
    setIsLoading(false);
    dispatch(alertsActions.initiateAlert({ title, message }));
  };

  const searchPayload = {
    fields: STOCK_MOVES_SEARCH_FIELDS,
    sortBy: ['-estimatedDate'],
    data: {
      _domain: 'self.typeSelect = :_typeSelect AND self.isReversion = TRUE',
      _domainContext: {
        _isReversion: false,
        _id: null,
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
      _domain: 'self.typeSelect = :_typeSelect AND self.isReversion = TRUE',
      _domainContext: {
        _isReversion: false,
        _id: null,
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
    { accessor: 'partnerFullName', Header: t('LBL_CUSTOMER'), type: 'text' },
    { accessor: 'toStockLocationName', Header: t('LBL_TO_STOCK_LOCATION'), type: 'text' },
    { accessor: 'estimatedDate', Header: t('LBL_ESTIMATED_DATE'), type: 'text' },
    { accessor: 'origin', Header: t('LBL_ORIGIN'), type: 'text' },
    { accessor: 'originStockMove', Header: t('LBL_ORIGIN_CUSTOMER_DELIVERY'), type: 'text' },
    { accessor: 'status', Header: t('LBL_STATUS'), type: 'text', translate: true },
  ];

  const subTitles = [
    { label: 'LBL_CUSTOMER', key: 'partnerFullName' },
    { label: 'LBL_TO_STOCK_LOCATION', key: 'toStockLocationName' },
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
    getCustomerReturns();
  }, [searchParams]);

  const getCustomerReturns = () => {
    if (searchValue === '') {
      setCustomerReturns([]);
      setIsLoading(true);
    }

    let payload = searchValue && searchValue !== '' ? searchPayloadwithValue : searchPayload;
    api('POST', getSearchUrl(MODELS.STOCK_MOVE), payload, onCustomerReturnsSearchSuccess);
  };

  const getStockMoveAdditionalDataPayload = ids => {
    let payload = {
      fields: ['stockMove', 'stockMoveDate'],
      sortBy: ['stockMove'],
      data: {
        _domain: 'self.stockMove.id in :_stockMove',
        _domainContext: {
          _stockMove: ids,
        },
        operator: 'and',
        criteria: [],
      },
      limit: pageSize,
      offset: 0,
      translate: true,
    };
    return payload;
  };

  const onCustomerReturnsSearchSuccess = async response => {
    let status = response.data.status;
    let data = response.data.data;
    let total = response.data.total;

    if (status !== 0 || total === undefined || total === null) {
      setCustomerReturns([]);
      return alertHandler('Error', 'LBL_ERROR_LOADING_CUSTOMER_RETURNS');
    }

    setTotal(total);

    if (!data) {
      setCustomerReturns([]);
      setIsLoading(false);
    }

    if (data) {
      await setStockMoves(data);
    }
  };

  const setStockMoves = async data => {
    let tempData = [];

    for await (let item of data) {
      let listItem = { ...item };
      listItem.name = listItem.stockMoveSeq;
      listItem.partnerFullName = listItem.partner?.fullName ?? '';
      listItem.toStockLocationName = listItem.toStockLocation?.name ?? '';
      listItem.status = STOCK_MOVE_STATUS[listItem.statusSelect];
      listItem.originStockMove = listItem?.reversionOriginStockMove?.stockMoveSeq ?? '';
      listItem.colorLabel = STOCK_MOVE_STATUS[listItem.statusSelect];
      tempData.push(listItem);
    }

    await getStockMoveAdditional(tempData);
    setCustomerReturns(tempData);
    setIsLoading(false);
  };

  const getStockMoveAdditional = async tempData => {
    let ids = tempData.map(listItem => listItem.id);
    const stockMoveDateResponse = await api(
      'POST',
      getSearchUrl(MODELS.STOCK_MOVE_ADDITIONAL_DATA),
      getStockMoveAdditionalDataPayload(ids)
    );
    let stockMoveDateStatus = stockMoveDateResponse.data.status;
    let stockMoveDateTotal = stockMoveDateResponse.data.total;
    let stockMoveDateData = stockMoveDateResponse.data.data;

    if (stockMoveDateStatus !== 0 || stockMoveDateTotal === undefined || stockMoveDateTotal === null) {
      return alertHandler('Error', 'LBL_ERROR_LOADING_SUPPLIER_RETURNS');
    }

    if (stockMoveDateData) {
      stockMoveDateData.forEach(stockData => {
        let index = tempData.findIndex(stockMove => stockMove.id === stockData.stockMove.id);
        tempData[index].fetchedStockMoveAdditionalID = stockData.id;
      });
    }
  };

  const bulkDeleteHandler = async () => {
    let additionalChecked = [];
    let tempChecked = [];

    if (checked.length > 0) {
      checked.forEach(checkedMove => {
        let checkedItem = customerReturns.filter(suppReturn => suppReturn.id === checkedMove.id)?.[0];

        if (checkedItem?.statusSelect === 1) {
          tempChecked.push({ id: checkedItem.id });
          if (checkedItem?.fetchedStockMoveAdditionalID) additionalChecked.push({ id: checkedItem.fetchedStockMoveAdditionalID });
        }
      });

      if (additionalChecked?.length > 0) {
        const removeAdditionalResponse = await api('POST', getRemoveAllUrl(MODELS.STOCK_MOVE_ADDITIONAL_DATA), {
          records: additionalChecked,
        });

        if (!removeAdditionalResponse || removeAdditionalResponse.data.status !== 0 || !removeAdditionalResponse.data.data) {
          return alertHandler('Error', 'SOMETHING_WENT_WRONG');
        }
      }

      if (tempChecked?.length > 0) {
        const removeResponse = await api('POST', getRemoveAllUrl(MODELS.STOCK_MOVE), {
          records: tempChecked,
        });
        setActionInProgress(false);
        setChecked([]);

        if (!removeResponse || removeResponse.data.status !== 0 || !removeResponse.data.data) {
          return alertHandler('Error', 'SOMETHING_WENT_WRONG');
        }

        alertHandler('Success', 'DELETED_SUCCESSFULLY');
      } else {
        return alertHandler('Error', 'CANT_DELETE_A_CONFIRMED_STOCK_MOVE');
      }

      setActionInProgress(false);
      setTimeout(() => {
        return getCustomerReturns();
      }, [3000]);
    }
  };

  const singleDeleteHandler = async id => {
    let checkedItem = customerReturns.filter(suppReturn => suppReturn.id === id)?.[0];

    if (checkedItem?.statusSelect === 1) {
      if (checkedItem?.fetchedStockMoveAdditionalID) {
        const removeAdditionalResponse = await api('POST', getRemoveAllUrl(MODELS.STOCK_MOVE_ADDITIONAL_DATA), {
          records: [{ id: checkedItem.fetchedStockMoveAdditionalID }],
        });

        if (!removeAdditionalResponse || removeAdditionalResponse.data.status !== 0 || !removeAdditionalResponse.data.data) {
          return alertHandler('Error', 'SOMETHING_WENT_WRONG');
        }
      }

      const removeResponse = await api('POST', getRemoveAllUrl(MODELS.STOCK_MOVE), {
        records: [{ id: checkedItem.id }],
      });
      setActionInProgress(false);
      setChecked([]);

      if (!removeResponse || removeResponse.data.status !== 0 || !removeResponse.data.data) {
        return alertHandler('Error', 'SOMETHING_WENT_WRONG');
      }

      alertHandler('Success', 'DELETED_SUCCESSFULLY');
    } else {
      return alertHandler('Error', 'CANT_DELETE_A_CONFIRMED_STOCK_MOVE');
    }

    setActionInProgress(false);
    setTimeout(() => {
      return getCustomerReturns();
    }, [3000]);
  };

  return (
    <>
      {actionInProgress && <div className="lodingpage"></div>}
      {isLoading && <Spinner />}
      {((!isLoading && searchValue !== '') || (customerReturns && customerReturns.length > 0)) && (
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
                  <h4>{t('LBL_CUSTOMER_RETURNS')}</h4>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <Toolbar
                  show={show}
                  setShow={setShow}
                  refreshData={getCustomerReturns}
                  setShowMoreAction={setShowMoreAction}
                  checked={checked}
                  setChecked={setChecked}
                  data={customerReturns}
                  setActionInProgress={setActionInProgress}
                  deleteHandler={bulkDeleteHandler}
                  bulkActionConfig={{
                    canDelete: canDelete,
                    deleteSuccessMessage: 'LBL_CUSTOMER_RETURN_DELETED',
                    modelsEnumKey: 'CUSTOMER_RETURNS',
                    isExport: true,
                  }}
                  searchPayload={searchValue && searchValue !== '' ? searchPayloadwithValue : searchPayload}
                />
                {!isLoading && show === 'table' && windowSize[0] > 1200 && (
                  <Table
                    fields={fields}
                    data={customerReturns}
                    total={total}
                    checked={checked}
                    setChecked={setChecked}
                    feature={feature}
                    subFeature={subFeature}
                    infoColors={infoColors}
                  >
                    {customerReturns.length > 0 &&
                      customerReturns.map(record => {
                        return (
                          <TableRow
                            key={record}
                            record={record}
                            fields={fields}
                            deleteModel={MODELS.STOCK_MOVE}
                            refreshData={getCustomerReturns}
                            checked={checked}
                            setChecked={setChecked}
                            setActionInProgress={setActionInProgress}
                            feature={feature}
                            subFeature={subFeature}
                            isEditable={record.statusSelect < 3}
                            isDeletable={record.statusSelect === 1}
                            deleteHandler={singleDeleteHandler}
                            infoColors={infoColors}
                          />
                        );
                      })}
                  </Table>
                )}
                {!isLoading && (show === 'card' || windowSize[0] <= 1200) && (
                  <CardsList total={total}>
                    {customerReturns &&
                      customerReturns.map(record => {
                        return (
                          <Card
                            key={record}
                            feature={feature}
                            subFeature={subFeature}
                            record={record}
                            title="stockMoveSeq"
                            subTitles={subTitles}
                            deleteModel={MODELS.STOCK_MOVE}
                            refreshData={getCustomerReturns}
                            setActionInProgress={setActionInProgress}
                            checked={checked}
                            setChecked={setChecked}
                            deleteHandler={singleDeleteHandler}
                            label1={{ value: record.estimatedDate }}
                            label2={{ value: record.status }}
                            isEditable={record.statusSelect < 3}
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
          refreshData={getCustomerReturns}
          alertHandler={alertHandler}
          data={customerReturns}
          checked={checked}
          setChecked={setChecked}
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          setActionInProgress={setActionInProgress}
          deleteHandler={bulkDeleteHandler}
          bulkActionConfig={{
            canDelete: canDelete,
            deleteSuccessMessage: 'LBL_CUSTOMER_RETURN_DELETED',
            modelsEnumKey: 'CUSTOMER_RETURNS',
          }}
        />
      )}
      {!isLoading && customerReturns && customerReturns.length === 0 && searchValue === '' && (
        <NoData imgSrc={NoCustomerReturnsImg} noDataMessage={t('NO_CUSTOMER_RETURNS_DATA_MESSAGE')} />
      )}
    </>
  );
};

export default CustomerReturns;
