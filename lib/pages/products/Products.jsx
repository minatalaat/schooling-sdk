import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import BreadCrumb from '../../components/ui/BreadCrumb';
import Table from '../../components/ListingTable/Table';
import TableRow from '../../components/ListingTable/TableRow';
import CardsList from '../../components/CardsList/CardsList';
import Card from '../../components/CardsList/Card';
import Spinner from '../../components/Spinner/Spinner';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';
import MoreAction from '../../parts/MoreAction';
import NoData from '../../components/NoData';
import Toolbar from '../../parts/Toolbar';
import Calendar from '../../components/ui/Calendar';

import { useAxiosFunction } from '../../hooks/useAxios';
import { MODELS } from '../../constants/models';
import { formatFloatNumber } from '../../utils/helpers';
import { PRODUCTS_SEARCH_FIELDS } from './ProductsPayloadsFields';
import { getSearchUrl, getFetchUrl } from '../../services/getUrl';
import { useFeatures } from '../../hooks/useFeatures';
import { tourStepsActions } from '../../store/tourSteps';
import useMetaFields from '../../hooks/metaFields/useMetaFields';
import { BASE_FETCH_FIELDS } from '../config-page/BaseConfig/PayloadsFields';
import { alertsActions } from '../../store/alerts';
import { useTourServices } from '../../services/useTourServices';

import NoProductsImg from '../../assets/images/icons/Products.svg';

const Products = ({ feature, subFeature, productConfig }) => {
  const isTour = useSelector(state => state.tourSteps.isTour);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { getFeaturePath } = useFeatures();
  const { api } = useAxiosFunction();
  const { canAdd, canDelete } = useFeatures(feature, subFeature);
  const [searchParams] = useSearchParams();
  const { addStepsOptions } = useTourServices();

  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  let searchValue = searchParams.get('search') || '';
  let currentPage = parseInt(searchParams.get('currentPage') || 1);
  let pageSize = parseInt(searchParams.get('pageSize') || 10);
  let offset = (currentPage - 1) * pageSize;

  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [show, setShow] = useState('table');
  const [checked, setChecked] = useState([]);
  const [windowSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [isBarcodeActive, setBarcodeActive] = useState(false);

  const productTypeSelect = useMetaFields('product.product.type.select');

  const alertHandler = (title, message) => dispatch(alertsActions.initiateAlert({ title, message }));

  const searchPayload = {
    fields: PRODUCTS_SEARCH_FIELDS,
    sortBy: ['code', 'name'],
    data: {
      _domain: "self.isModel = false AND self.dtype = 'Product' AND self.isActivity = false",
      _domainContext: {
        _activeCompany: null,
        _id: null,
      },
    },
    limit: pageSize,
    offset: offset,
    translate: true,
  };

  const searchPayloadwithValue = {
    fields: PRODUCTS_SEARCH_FIELDS,
    sortBy: ['code', 'name'],
    data: {
      _domain: "self.isModel = false AND self.dtype = 'Product' AND self.isActivity = false",
      _domainContext: {
        _activeCompany: null,
        _id: null,
        _model: MODELS.PRODUCT,
      },
      operator: 'or',
      criteria: [
        {
          fieldName: 'code',
          operator: 'like',
          value: searchValue,
        },
        {
          fieldName: 'name',
          operator: 'like',
          value: searchValue,
        },
        {
          fieldName: 'serialNumber',
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
    { accessor: 'code', Header: t('LBL_PRODUCT_CODE'), type: 'text' },
    { accessor: 'name', Header: t('LBL_PRODUCT_NAME'), type: 'text' },
    { accessor: 'productTypeSelect', Header: t('LBL_PRODUCT_TYPE'), type: 'text', translate: true },
    { accessor: 'unitName', Header: t('LBL_UNIT'), type: 'text' },
    { accessor: 'salePrice', Header: t('LBL_SALE_PRICE'), type: 'text' },
    {
      accessor: 'purchasePrice',
      Header: t('LBL_PURCHASE_PRICE'),
      type: 'text',
    },
    isBarcodeActive ? { accessor: 'serialNumber', Header: t('LBL_SERIAL_NUMBER'), type: 'text' } : undefined,
  ];

  const subTitles = [
    { label: 'LBL_SALE_PRICE', key: 'salePrice' },
    { label: 'LBL_PURCHASE_PRICE', key: 'purchasePrice' },
    isBarcodeActive ? { label: 'LBL_SERIAL_NUMBER', key: 'serialNumber' } : undefined,
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
    checkBarcodeActivity();
  }, [searchParams]);

  useEffect(() => {
    if (productConfig.tourConfig && isTour === 'true' && !isLoading) {
      addStepsOptions(productConfig.tourConfig?.listSteps);
      dispatch(tourStepsActions.setIsTour('true'));
      dispatch(tourStepsActions.setSpotlightClick(true));
      dispatch(tourStepsActions.setSteps({ steps: productConfig.tourConfig?.listSteps }));
    }
  }, [isTour, isLoading]);

  const checkBarcodeActivity = async () => {
    const appBaseDefaultResponse = await api('POST', getFetchUrl(MODELS.APP_BASE, 1), {
      fields: BASE_FETCH_FIELDS,
      related: {},
    });
    if (appBaseDefaultResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    setBarcodeActive(appBaseDefaultResponse.data.data[0].activateBarCodeGeneration);
    searchProducts();
  };

  const searchProducts = () => {
    if (searchValue === '') {
      setDisplayedProducts([]);
    }

    setIsLoading(true);
    let payload = searchValue && searchValue !== '' ? searchPayloadwithValue : searchPayload;
    api('POST', getSearchUrl(MODELS.PRODUCT), payload, onProductsSearchSuccess);
  };

  const onProductsSearchSuccess = async response => {
    let status = response.data.status;
    let data = response.data.data;
    let total = response.data.total;
    setIsLoading(false);

    if (status !== 0 || total === undefined || total === null) {
      setDisplayedProducts([]);
      return alertHandler('Error', 'LBL_ERROR_LOADING_PRODUCTS');
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

  return (
    <>
      {actionInProgress && <div className="lodingpage"></div>}
      {isLoading && <Spinner />}
      {((!isLoading && searchValue !== '') || (displayedProducts && displayedProducts.length > 0)) && (
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
                  <h4>{t('LBL_PRODUCTS')}</h4>
                </div>

                {canAdd && (
                  <div className="reverse-page float-end">
                    <PrimaryButton
                      theme="purpleWithIcon"
                      className="step-add-product"
                      text="LBL_ADD_PRODUCT"
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
                  refreshData={searchProducts}
                  setShowMoreAction={setShowMoreAction}
                  checked={checked}
                  setChecked={setChecked}
                  data={displayedProducts}
                  setActionInProgress={setActionInProgress}
                  bulkActionConfig={{
                    isExport: true,
                    isImport: true,
                    subFeature: subFeature,
                    canDelete: canDelete,
                    deleteSuccessMessage: 'LBL_PRODUCT_DELETED',
                    modelsEnumKey: 'PRODUCTS',
                  }}
                  searchPayload={searchValue && searchValue !== '' ? searchPayloadwithValue : searchPayload}
                />
                {!isLoading && show === 'table' && windowSize[0] > 1200 && (
                  <Table
                    fields={fields}
                    data={displayedProducts}
                    total={total}
                    checked={checked}
                    setChecked={setChecked}
                    feature={feature}
                    subFeature={subFeature}
                  >
                    {displayedProducts.length > 0 &&
                      displayedProducts.map(record => {
                        return (
                          <TableRow
                            key={record.id}
                            record={record}
                            fields={fields}
                            deleteModel={MODELS.PRODUCT}
                            refreshData={searchProducts}
                            checked={checked}
                            setChecked={setChecked}
                            setActionInProgress={setActionInProgress}
                            feature={feature}
                            subFeature={subFeature}
                          />
                        );
                      })}
                  </Table>
                )}
                {!isLoading && (show === 'card' || windowSize[0] <= 1200) && (
                  <CardsList total={total}>
                    {displayedProducts &&
                      displayedProducts.map(record => {
                        return (
                          <Card
                            key={record.id}
                            feature={feature}
                            subFeature={subFeature}
                            record={record}
                            title="fullName"
                            subTitles={subTitles}
                            deleteModel={MODELS.PRODUCT}
                            refreshData={searchProducts}
                            setActionInProgress={setActionInProgress}
                            checked={checked}
                            setChecked={setChecked}
                            label1={record.sellable ? { value: 'LBL_SELLABLE' } : null}
                            label2={record.purchasable ? { value: 'LBL_PURCHASABLE' } : null}
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
          refreshData={searchProducts}
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          checked={checked}
          setChecked={setChecked}
          data={displayedProducts}
          alertHandler={alertHandler}
          setActionInProgress={setActionInProgress}
          bulkActionConfig={{
            isExport: true,
            canDelete: canDelete,
            deleteSuccessMessage: 'LBL_PRODUCT_DELETED',
            modelsEnumKey: 'PRODUCTS',
          }}
        />
      )}
      {!isLoading && displayedProducts && displayedProducts.length === 0 && searchValue === '' && (
        <NoData
          imgSrc={NoProductsImg}
          noDataMessage={t('NO_PRODUCTS_DATA_MESSAGE')}
          showAdd={canAdd}
          addButtontext={t('LBL_ADD_PRODUCT')}
          addButtonPath={getFeaturePath(subFeature, 'add')}
          stepClass="step-add-product"
        />
      )}
    </>
  );
};

export default Products;
