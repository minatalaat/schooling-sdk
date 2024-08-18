import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import Table from '../../components/ListingTable/Table';
import ProductStockRow from './ProductStockRow';

import { getSearchUrl } from '../../services/getUrl';
import { MODELS } from '../../constants/models';
import { formatFloatNumber } from '../../utils/helpers';
import useMetaFields from '../../hooks/metaFields/useMetaFields';
import { PRODUCTS_SEARCH_FIELDS } from '../products/ProductsPayloadsFields';
import { alertsActions } from '../../store/alerts';

function ProductStocksList({ buttonClicked, setButtonClicked, api, formik }) {
  const { t } = useTranslation();
  const productTypeSelect = useMetaFields('product.product.type.select');
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [displayedProducts, setDisplayedProducts] = useState();
  const [stockLines, setStockLines] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const [total, setTotal] = useState(0);
  let currentPage = parseInt(searchParams.get('currentPage') || 1);
  let pageSize = parseInt(searchParams.get('pageSize') || 10);
  let offset = (currentPage - 1) * pageSize;
  let location = useLocation();
  let params = new URLSearchParams(location.search);

  const SEARCH_FIELDS = ['stockLocation', 'currentQty', 'reservedQty', 'futureQty', 'unit'];
  const [showRows, setShowRows] = useState([]);

  const fields = [
    { accessor: 'expand', Header: '', type: 'text' },
    { accessor: 'code', Header: t('LBL_PRODUCT_CODE'), type: 'text' },
    { accessor: 'name', Header: t('LBL_PRODUCT_NAME'), type: 'text' },
    { accessor: 'unitName', Header: t('LBL_UNIT'), type: 'text' },
    { accessor: 'salePrice', Header: t('LBL_SALE_PRICE'), type: 'text' },
    {
      accessor: 'purchasePrice',
      Header: t('LBL_PURCHASE_PRICE'),
      type: 'text',
    },
  ];

  const collapsableFieldsOne = [
    { accessor: 'stockLocation', Header: t('LBL_STOCK_LOCATION'), type: 'text' },
    { accessor: 'currentQty', Header: t('LBL_CURRENT_REALIZED_QTY'), type: 'text' },
    { accessor: 'futureQty', Header: t('LBL_FUTURE_QTY'), type: 'text' },
  ];

  const alertHandler = (title, message) => dispatch(alertsActions.initiateAlert({ title, message }));

  const onProductsSearchSuccess = async response => {
    let status = response.data.status;
    let data = response.data.data;
    let total = response.data.total;
    setButtonClicked(false);

    if (status !== 0 || total === undefined || total === null) {
      setDisplayedProducts([]);
      return alertHandler('Error', t('LBL_ERROR_LOADING_PRODUCTS'));
    }

    setTotal(total);

    if (data === undefined || data === null) {
      setDisplayedProducts([]);
    }

    if (data) {
      let tempData = [];
      data.forEach(item => {
        let listItem = { ...item };
        listItem.unitName = listItem.unit?.name ?? '';
        listItem.expand = '';

        if (listItem.sellable) {
          listItem.salePrice = formatFloatNumber(listItem.salePrice);
          if (listItem['saleCurrency.symbol']) listItem.salePrice += ' ' + listItem['saleCurrency.symbol'];
        } else {
          listItem.salePrice = '';
        }

        if (listItem.purchasable) {
          listItem.purchasePrice = formatFloatNumber(listItem.purchasePrice);
          if (listItem['purchaseCurrency.symbol']) listItem.purchasePrice += ' ' + listItem['purchaseCurrency.symbol'];
        } else {
          listItem.purchasePrice = '';
        }

        tempData.push(listItem);
      });
      let temp = await productTypeSelect.convertValues(tempData);
      setDisplayedProducts(temp);
    }
  };

  const onProductStocksSearchSuccess = response => {
    if (response.data.status === 0) {
      let total = response.data.total;
      let data = response.data.data;
      // setTotal(total);

      if (total === 0) {
        setStockLines([]);
        setButtonClicked(false);
      } else {
        let temoStockLocationsLines = [];

        if (data) {
          data.forEach(stockLocationLine => {
            let temp = {};
            temp.stockLocation = stockLocationLine?.stockLocation?.name || '';
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

  const getProductPayload = ids => {
    let searchIds = [];
    ids &&
      ids.length > 0 &&
      ids.forEach(product => {
        searchIds.push(product.id);
      });
    let productPayload = {
      fields: PRODUCTS_SEARCH_FIELDS,
      sortBy: ['code', 'name'],
      data: {
        _domain:
          searchIds.length > 0
            ? `self.id in (${searchIds}) AND self.isModel = false AND self.dtype = 'Product' AND self.isActivity = false`
            : "self.isModel = false AND self.dtype = 'Product' AND self.isActivity = false",
        _domainContext: {
          _activeCompany: null,
          _id: null,
        },
      },
      limit: pageSize,
      offset: offset,
      translate: true,
    };
    return productPayload;
  };

  const getStocLocationsPayload = id => {
    let stocLocationsPayload = {
      fields: SEARCH_FIELDS,
      sortBy: ['product'],
      data: {
        _domain: `self.product = ${id} AND (self.currentQty!=0 OR self.futureQty !=0)  AND self.stockLocation.typeSelect != 3`,

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
      params.set('currentPage', 1);
      setDisplayedProducts([]);

      if (formik.values.product === null || formik.values.product === undefined || formik.values.product?.length === 0) {
        api('POST', getSearchUrl(MODELS.PRODUCT), getProductPayload(null), onProductsSearchSuccess);
      } else {
        if (formik.values.product?.length < 10) {
          searchParams.set('currentPage', '1');
          setSearchParams(searchParams, { replace: true });
        }

        api('POST', getSearchUrl(MODELS.PRODUCT), getProductPayload(formik.values.product), onProductsSearchSuccess);
      }
    }
  }, [buttonClicked, formik.values.product]);

  useEffect(() => {
    setButtonClicked(true);
    api('POST', getSearchUrl(MODELS.PRODUCT), getProductPayload(formik.values.product), onProductsSearchSuccess);
  }, [offset]);

  useEffect(() => {
    if (showRows && showRows.length > 0) {
      setIsLoading(true);
      api('POST', getSearchUrl(MODELS.STOCK_LOCATION_LINES), getStocLocationsPayload(showRows[0]), onProductStocksSearchSuccess);
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
      {displayedProducts && displayedProducts.length > 0 && (
        <div className="row">
          <div className="col-md-12 mb-4">
            <div className="info-tite-page float-start">
              <h4>{t('PRODUCTS')}</h4>
            </div>
          </div>
          <div className="col-md-12">
            <Table
              fields={fields}
              data={displayedProducts}
              total={total}
              feature="PRODUCT_MASTER_DATA"
              subFeature="PRODUCTS"
              isCollapsable={true}
              hasBulkActions={false}
              hasActions={false}
              isPagination={formik.values.product?.length > 10 || formik.values.product?.length === 0 || formik.values.product === null}
            >
              {displayedProducts &&
                displayedProducts.length > 0 &&
                displayedProducts.map(record => {
                  return (
                    <ProductStockRow
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

export default ProductStocksList;
