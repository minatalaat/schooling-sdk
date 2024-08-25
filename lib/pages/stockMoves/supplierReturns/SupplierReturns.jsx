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
import { MODELS } from '../../../constants/models';
import { getSearchUrl, getRemoveAllUrl } from '../../../services/getUrl';
import { useFeatures } from '../../../hooks/useFeatures';
import { STOCK_MOVES_SEARCH_FIELDS } from '../StockMovesPayloadsFields';
import { alertsActions } from '../../../store/alerts';
import { STOCK_MOVE_STATUS, AVAILABILITY_STATUS } from '../../../constants/enums/StockMoveEnums';

import NoSupplierReturnsImg from '../../../assets/images/icons/Products.svg';

const SupplierReturns = () => {
  const feature = 'STOCK_MANAGEMENT';
  const subFeature = 'SUPPLIER_RETURNS';
  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  const { canDelete } = useFeatures(feature, subFeature);
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const [supplierReturns, setSupplierReturns] = useState([]);
  const [show, setShow] = useState('table');
  const [checked, setChecked] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  let searchValue = searchParams.get('search') || '';
  let currentPage = parseInt(searchParams.get('currentPage') || 1);
  let pageSize = parseInt(searchParams.get('pageSize') || 10);
  let offset = (currentPage - 1) * pageSize;

  const [windowSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);

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
        // _newDate: '2023-07-11',
        _typeSelect: 2,
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
        // _newDate: '2023-07-11',
        _typeSelect: 2,
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
    { accessor: 'fromStockLocationName', Header: t('LBL_FROM_STOCK_LOCATION'), type: 'text' },
    { accessor: 'estimatedDate', Header: t('LBL_ESTIMATED_DATE'), type: 'text' },
    { accessor: 'origin', Header: t('LBL_ORIGIN'), type: 'text' },
    { accessor: 'originStockMove', Header: t('LBL_ORIGIN_SUPPLIER_ARRIVAL'), type: 'text' },
    { accessor: 'status', Header: t('LBL_STATUS'), type: 'text', translate: true },
    { accessor: 'availableStatus', Header: t('LBL_AVAILABILITY'), type: 'text', translate: true },
  ];

  const subTitles = [
    { label: 'LBL_SUPPLIER', key: 'partnerFullName' },
    { label: 'LBL_FROM_STOCK_LOCATION', key: 'fromStockLocationName' },
    { label: 'LBL_AVAILABILITY', key: 'availableStatus', translate: true },
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
    getSupplierReturns();
  }, [searchParams]);

  const getSupplierReturns = () => {
    if (searchValue === '') {
      setSupplierReturns([]);
      setIsLoading(true);
    }

    let payload = searchValue && searchValue !== '' ? searchPayloadwithValue : searchPayload;
    api('POST', getSearchUrl(MODELS.STOCK_MOVE), payload, onSupplierReturnsSearchSuccess);
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

  const onSupplierReturnsSearchSuccess = async response => {
    let status = response.data.status;
    let data = response.data.data;
    let total = response.data.total;

    if (status !== 0 || total === undefined || total === null) {
      setSupplierReturns([]);
      return alertHandler('Error', 'LBL_ERROR_LOADING_SUPPLIER_RETURNS');
    }

    setTotal(total);

    if (!data) {
      setSupplierReturns([]);
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
      listItem.fromStockLocationName = listItem.fromStockLocation?.name ?? '';
      listItem.status = STOCK_MOVE_STATUS[listItem.statusSelect];
      listItem.originStockMove = listItem?.reversionOriginStockMove?.stockMoveSeq ?? '';
      listItem.availableStatus = AVAILABILITY_STATUS[listItem.availableStatusSelect ?? 0];
      listItem.colorLabel = STOCK_MOVE_STATUS[listItem.statusSelect];
      tempData.push(listItem);
    }

    await getStockMoveAdditional(tempData);
    setSupplierReturns(tempData);
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
        let checkedItem = supplierReturns.filter(suppReturn => suppReturn.id === checkedMove.id)?.[0];

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
        return getSupplierReturns();
      }, [3000]);
    }
  };

  const singleDeleteHandler = async id => {
    let checkedItem = supplierReturns.filter(suppReturn => suppReturn.id === id)?.[0];

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
      return getSupplierReturns();
    }, [3000]);
  };

  return (
    <>
      {actionInProgress && <div className="lodingpage"></div>}
      {isLoading && <Spinner />}
      {((!isLoading && searchValue !== '') || (supplierReturns && supplierReturns.length > 0)) && (
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
                  <h4>{t('LBL_SUPPLIER_RETURNS')}</h4>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <Toolbar
                  show={show}
                  setShow={setShow}
                  refreshData={getSupplierReturns}
                  setShowMoreAction={setShowMoreAction}
                  checked={checked}
                  setChecked={setChecked}
                  data={supplierReturns}
                  setActionInProgress={setActionInProgress}
                  deleteHandler={bulkDeleteHandler}
                  bulkActionConfig={{
                    canDelete: canDelete,
                    deleteSuccessMessage: 'LBL_SUPPLIER_RETURN_DELETED',
                    modelsEnumKey: 'SUPPLIER_RETURNS',
                    isExport: true,
                  }}
                  searchPayload={searchValue && searchValue !== '' ? searchPayloadwithValue : searchPayload}
                />
                {!isLoading && show === 'table' && windowSize[0] > 1200 && (
                  <Table
                    fields={fields}
                    data={supplierReturns}
                    total={total}
                    checked={checked}
                    setChecked={setChecked}
                    feature={feature}
                    subFeature={subFeature}
                    infoColors={infoColors}
                  >
                    {supplierReturns.length > 0 &&
                      supplierReturns.map(record => {
                        return (
                          <TableRow
                          key={record}
                            record={record}
                            fields={fields}
                            deleteModel={MODELS.STOCK_MOVE}
                            refreshData={getSupplierReturns}
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
                    {supplierReturns &&
                      supplierReturns.map(record => {
                        return (
                          <Card
                          key={record}
                            feature={feature}
                            subFeature={subFeature}
                            record={record}
                            title="stockMoveSeq"
                            subTitles={subTitles}
                            deleteModel={MODELS.STOCK_MOVE}
                            refreshData={getSupplierReturns}
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
          refreshData={getSupplierReturns}
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          checked={checked}
          setChecked={setChecked}
          alertHandler={alertHandler}
          data={supplierReturns}
          setActionInProgress={setActionInProgress}
          deleteHandler={bulkDeleteHandler}
          bulkActionConfig={{
            canDelete: canDelete,
            deleteSuccessMessage: 'LBL_SUPPLIER_RETURN_DELETED',
            modelsEnumKey: 'SUPPLIER_RETURNS',
          }}
        />
      )}
      {!isLoading && supplierReturns && supplierReturns.length === 0 && searchValue === '' && (
        <NoData imgSrc={NoSupplierReturnsImg} noDataMessage={t('NO_SUPPLIER_RETURNS_DATA_MESSAGE')} />
      )}
    </>
  );
};

export default SupplierReturns;
