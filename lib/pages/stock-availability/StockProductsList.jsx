import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import Table from '../../components/ListingTable/Table';
import StockProductRow from './StockProductRow';

import { getSearchUrl } from '../../services/getUrl';
import { MODELS } from '../../constants/models';
import { alertsActions } from '../../store/alerts';

function StockProductsList({ buttonClicked, setButtonClicked, api, formik }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [displayedStockLocations, setDisplayedStockLocations] = useState();
  const [stockLines, setStockLines] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const [total, setTotal] = useState(0);
  let currentPage = parseInt(searchParams.get('currentPage') || 1);
  let pageSize = parseInt(searchParams.get('pageSize') || 10);
  let offset = (currentPage - 1) * pageSize;

  const SEARCH_FIELDS = ['product', 'currentQty', 'reservedQty', 'futureQty', 'unit'];
  const [showRows, setShowRows] = useState([]);

  const fields = [
    { accessor: 'expand', Header: null, type: 'text' },
    { accessor: 'name', Header: t('LBL_NAME'), type: 'text' },
    { accessor: 'address', Header: t('LBL_ADDRESS'), type: 'text', translate: true },
    { accessor: 'typeSelect', Header: t('LBL_TYPE'), type: 'text', translate: true },
  ];

  const collapsableFieldsOne = [
    { accessor: 'product', Header: t('LBL_PRODUCT'), type: 'text' },
    { accessor: 'unit', Header: t('LBL_UNIT'), type: 'text' },
    { accessor: 'currentQty', Header: t('LBL_CURRENT_REALIZED_QTY'), type: 'text' },
    { accessor: 'futureQty', Header: t('LBL_FUTURE_QTY'), type: 'text' },
  ];

  const alertHandler = (title, message) => dispatch(alertsActions.initiateAlert({ title, message }));

  const typeSelectEnum = {
    1: 'LBL_INTERNAL',
    2: 'LBL_EXTERNAL',
    3: 'LBL_VIRTUAL',
  };

  const onStockLocationsSearchSuccess = response => {
    let status = response.data.status;
    let data = response.data.data || [];
    let total = response.data.total;
    setButtonClicked(false);

    if (status !== 0 || total === undefined || total === null) {
      return alertHandler('Error', t('LBL_ERROR_LOADING_STOCK_LOCATIONS'));
    }

    setTotal(total);

    if (data) {
      let tempData = [];
      data.forEach(item => {
        let listItem = { ...item };
        listItem.address = listItem.address?.fullName ?? '';
        listItem.typeSelect = typeSelectEnum[listItem.typeSelect];
        tempData.push(listItem);
      });
      setDisplayedStockLocations(tempData);
    }
  };

  const onProductStocksSearchSuccess = response => {
    if (response.data.status === 0) {
      let total = response.data.total;
      let data = response.data.data;

      if (total === 0) {
        setStockLines([]);
        setButtonClicked(false);
      } else {
        let temoStockLocationsLines = [];

        if (data) {
          data.forEach(stockLocationLine => {
            let temp = {};
            temp.product = stockLocationLine?.product?.fullName || '';
            temp.currentQty = stockLocationLine
              ? stockLocationLine.currentQty
                ? parseFloat(stockLocationLine.currentQty).toFixed(2).toString()
                : ''
              : '';
            temp.reservedQty = stockLocationLine
              ? stockLocationLine.reservedQty
                ? parseFloat(stockLocationLine.reservedQty).toFixed(2).toString()
                : ''
              : '';
            temp.futureQty = stockLocationLine
              ? stockLocationLine.futureQty
                ? parseFloat(stockLocationLine.futureQty).toFixed(2).toString()
                : ''
              : '';
            temp.unit = stockLocationLine?.unit?.name || '';
            temoStockLocationsLines.push(temp);
          });
        }

        setStockLines(temoStockLocationsLines);
        setButtonClicked(false);
      }

      setIsLoading(false);
    } else {
      setButtonClicked(false);
      setIsLoading(false);
    }
  };

  const STOCK_LOCATION_SEARCH_FIELDS = [
    'address',
    'serialNumber',
    'partner',
    'name',
    'parentStockLocation',
    'stockLocationValue',
    'company',
    'typeSelect',
  ];

  const getStocklocationsPayload = ids => {
    let searchIds = [];
    ids &&
      ids.length > 0 &&
      ids.forEach(product => {
        searchIds.push(product.id);
      });

    const searchPayload = {
      fields: STOCK_LOCATION_SEARCH_FIELDS,
      sortBy: null,
      data: {
        _domain: searchIds?.length > 0 ? `self.id in(${searchIds}) AND self.typeSelect in (1,2) ` : `self.typeSelect in (1,2)`,
        _domainContext: {
          _id: null,
          _model: MODELS.STOCK_LOCATION,
        },
      },
      limit: pageSize,
      offset: offset,
      translate: true,
    };
    return searchPayload;
  };

  const getStockLocationsLinesPayload = id => {
    let stocLocationsPayload = {
      fields: SEARCH_FIELDS,
      sortBy: ['product'],
      data: {
        _domain: `self.stockLocation = ${id} AND (self.currentQty!=0 OR self.futureQty !=0)  AND self.stockLocation.typeSelect != 3`,

        operator: 'and',
        criteria: [],
      },
      limit: -1,
      offset: 0,
      translate: true,
    };
    return stocLocationsPayload;
  };

  useEffect(() => {
    if (buttonClicked) {
      setDisplayedStockLocations([]);

      if (formik.values.stockLocation === null || formik.values.stockLocation === undefined || formik.values.stockLocation?.length === 0) {
        api('POST', getSearchUrl(MODELS.STOCK_LOCATION), getStocklocationsPayload(null), onStockLocationsSearchSuccess);
      } else {
        if (formik.values.stockLocation?.length < 10) {
          searchParams.set('currentPage', '1');
          setSearchParams(searchParams, { replace: true });
        }

        api(
          'POST',
          getSearchUrl(MODELS.STOCK_LOCATION),
          getStocklocationsPayload(formik.values.stockLocation),
          onStockLocationsSearchSuccess
        );
      }
    }
  }, [buttonClicked, formik.values.stockLocation]);

  useEffect(() => {
    setButtonClicked(true);

    api('POST', getSearchUrl(MODELS.STOCK_LOCATION), getStocklocationsPayload(formik.values.stockLocation), onStockLocationsSearchSuccess);
  }, [offset]);

  useEffect(() => {
    if (showRows && showRows.length > 0) {
      setIsLoading(true);
      api('POST', getSearchUrl(MODELS.STOCK_LOCATION_LINES), getStockLocationsLinesPayload(showRows[0]), onProductStocksSearchSuccess);
    }
  }, [showRows]);

  useEffect(() => {
    if (total > 0) {
      if (total / 10 < searchParams.get('currentPage')) {
        searchParams.set('currentPage', '1');
        setSearchParams(searchParams, { replace: true });
      }
    }
  }, [total]);

  return (
    <>
      {displayedStockLocations && displayedStockLocations.length > 0 && (
        <div className="row">
          <div className="col-md-12 mb-4">
            <div className="info-tite-page float-start">
              <h4>{t('LBL_STOCK_LOCATIONS')}</h4>
            </div>
          </div>
          <div className="col-md-12">
            <Table
              fields={fields}
              data={displayedStockLocations}
              total={total}
              feature="STOCK_MANAGEMENT"
              subFeature="STOCK_LOCATIONS"
              isCollapsable={true}
              hasBulkActions={false}
              hasActions={false}
              isPagination={
                formik.values.stockLocation?.length > 10 ||
                formik.values.stockLocation?.length === 0 ||
                formik.values.stockLocation === null
              }
            >
              {displayedStockLocations &&
                displayedStockLocations.length > 0 &&
                displayedStockLocations.map(record => {
                  return (
                    <StockProductRow
                      record={record}
                      fields={fields}
                      showRows={showRows}
                      setShowRows={setShowRows}
                      isLoading={isLoading}
                      setIsLoading={setIsLoading}
                      collapsableFieldsOne={collapsableFieldsOne}
                      collapsableData={stockLines}
                      setCollapsableData={setStockLines}
                    />
                  );
                })}
            </Table>
          </div>
        </div>
      )}
    </>
  );
}

export default StockProductsList;
