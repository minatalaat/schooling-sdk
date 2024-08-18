import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import ConfirmationPopup from '../../components/ConfirmationPopup';
import MoreAction from '../../parts/MoreAction';
import BreadCrumb from '../../components/ui/BreadCrumb';
import ActionsProgessBar from '../../parts/ActionsProgessBar';
import BackButton from '../../components/ui/buttons/BackButton';
import Calendar from '../../components/ui/Calendar';
import Spinner from '../../components/Spinner/Spinner';
import ProductsForm from './ProductsForm';

import { useAxiosFunction } from '../../hooks/useAxios';
import { MODELS } from '../../constants/models';
import { PRODUCTS_SEARCH_FIELDS, ACCOUNT_MANAGEMENT_SEARCH_FIELDS } from './ProductsPayloadsFields';
import { getSearchUrl, getFetchUrl, getRemoveAllUrl } from '../../services/getUrl';
import { useFeatures } from '../../hooks/useFeatures';
import { setSelectedValues } from '../../utils/formHelpers';
import { BASE_FETCH_FIELDS } from '../config-page/BaseConfig/PayloadsFields';
import { alertsActions } from '../../store/alerts';
import { STOCK_MOVE_LINES_SEARCH_FIELDS } from '../stockMoves/StockMovesPayloadsFields';
import { parseFloatFixedTwo } from '../../utils/helpers';

const ViewProduct = ({ feature, subFeature }) => {
  const mode = 'view';
  const url = window.location.href.split('/');
  const id = parseInt(url[url.length - 1]);

  const { api } = useAxiosFunction();
  const navigate = useNavigate();
  const { isFeatureAvailable, getFeaturePath } = useFeatures();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const stockMangamentAvaiable = useMemo(() => {
    return isFeatureAvailable({ featureCode: '12' });
  }, []);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [fetchedProduct, setFetchedProduct] = useState(null);
  const [isBarcodeActive, setBarcodeActive] = useState(false);
  const [buttonClicked, setButtonClicked] = useState(false);
  const [disableSave, setDisableSave] = useState(false);
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const initValues = {
    fullName: '',
    name: '',
    code: '',
    productTypeSelect: '',
    unit: null,
    sellable: false,
    purchasable: false,
    purchaseAccount: null,
    saleAccount: null,
    purchaseTax: null,
    salePrice: '0.00',
    purchasePrice: '0.00',
    saleCurrency: null,
    purchaseCurrency: null,
    picture: null,
    barCode: null,
    serialNumber: '',
    costTypeSelect: stockMangamentAvaiable ? '0' : null,
    costPrice: stockMangamentAvaiable ? parseFloatFixedTwo('1.00') : null,
  };

  const formik = useFormik({
    initialValues: initValues,
  });

  const alertHandler = (title, message) => {
    dispatch(alertsActions.initiateAlert({ title, message }));
    setButtonClicked(false);
    setDisableSave(false);
  };

  useEffect(() => {
    fetchProduct();
    checkBarcodeActivity();
  }, []);

  const checkBarcodeActivity = async () => {
    const appBaseDefaultResponse = await api('POST', getFetchUrl(MODELS.APP_BASE, 1), {
      fields: BASE_FETCH_FIELDS,
      related: {},
    });
    if (appBaseDefaultResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    setBarcodeActive(appBaseDefaultResponse.data.data[0].activateBarCodeGeneration);
  };

  const fetchProductPayload = () => {
    let payload = {
      fields: PRODUCTS_SEARCH_FIELDS,
      related: {
        picture: [],
      },
    };
    return payload;
  };

  const fetchProduct = () => {
    api('POST', getFetchUrl(MODELS.PRODUCT, id), fetchProductPayload(), onFetchSuccess);
  };

  const getCostPricePayload = () => {
    let paylaod = {
      fields: ['id', 'unitPrice', 'qty'],
      data: {
        _domain: 'self.product = :product ',
        _domainContext: {
          product: {
            id: id,
          },
          _model: MODELS.PRODUCT_COST,
        },
      },
      limit: 1,
    };
    return paylaod;
  };

  const getCostPrice = async () => {
    return fetchedProduct ? Number(fetchedProduct.costPrice).toFixed(2).toString() : '0.00';
  };

  const canChange = async () => {
    if (mode === 'add') return true;
    let payload = {
      fields: STOCK_MOVE_LINES_SEARCH_FIELDS,
      sortBy: ['sequence'],
      data: {
        _domain: `self.product =${id}`,
      },
      limit: 1,
      offset: 0,
      translate: true,
    };

    const productStockMoveResponse = await api('POST', getSearchUrl(MODELS.STOCK_MOVE_LINE), payload);
    if (productStockMoveResponse.data.status !== 0) return false;
    if (productStockMoveResponse.data.total > 0) return false;
    return true;
  };

  const onFetchSuccess = async response => {
    let status = response.data.status;
    let data = response.data.data;
    if (status !== 0 || data === undefined || data === null) navigate(getFeaturePath(subFeature));

    if (data && data[0]) {
      let product = response.data.data[0];
      setIsLoading(false);
      setFetchedProduct(product);
      let listID = product.accountManagementList && product.accountManagementList[0] ? product.accountManagementList[0].id : null;
      let accountList = null;

      if (listID !== null) {
        const searchResponse = await api('POST', getSearchUrl(MODELS.ACCOUNT_MANAGEMENT), getAccountManagementPayload(listID));
        let status = searchResponse.data.status;
        let data = searchResponse.data.data;
        if (status !== 0 || data === undefined || data === null) return alertHandler('Error', 'LBL_ERROR_LOADING_PRODUCT');
        if (data && data[0]) accountList = data[0];
      }

      let tempCostPrice = parseFloatFixedTwo(product.costPrice);

      if (product?.costTypeSelect?.toString() === '3') {
        tempCostPrice = await getCostPrice();
      }

      setSelectedValues(formik, {
        name: product.name,
        fullName: product.fullName,
        code: product.code,
        unit: product.unit ?? null,
        productTypeSelect: product.productTypeSelect,
        sellable: product.sellable,
        purchasable: product.purchasable,
        company: accountList?.company ?? null,
        purchaseAccount: accountList?.purchaseAccount ?? null,
        saleAccount: accountList?.saleAccount ?? null,
        purchaseTax: accountList?.purchaseTax ?? null,
        saleTax: accountList?.saleTax ?? null,
        salePrice: parseFloat(product.salePrice).toFixed(2),
        purchasePrice: parseFloat(product.purchasePrice).toFixed(2),
        purchaseCurrency: product.purchaseCurrency ?? null,
        saleCurrency: product.saleCurrency ?? null,
        serialNumber: product.serialNumber ?? '',
        costPrice: tempCostPrice || '0.00',
        costTypeSelect: parseInt(product.costTypeSelect).toString() ?? '',
      });
      return;
    }
  };

  const getAccountManagementPayload = listID => {
    let payload = {
      fields: ACCOUNT_MANAGEMENT_SEARCH_FIELDS,
      sortBy: null,
      data: {
        _domain: 'self.id in (:_field_ids)',
        _domainContext: {
          id: id,
          _model: MODELS.PRODUCT,
          _field: 'accountManagementList',
          _field_ids: [listID],
        },
        _archived: true,
      },
      limit: -1,
      offset: 0,
      translate: true,
    };
    return payload;
  };

  const getDeletePayload = () => {
    let payload = {
      records: [
        {
          id: id,
        },
      ],
    };
    return payload;
  };

  const deleteProductHandler = () => {
    setButtonClicked(true);
    setDisableSave(true);
    api('POST', getRemoveAllUrl(MODELS.PRODUCT), getDeletePayload(), onDeleteProductSuccess);
  };

  const onDeleteProductSuccess = response => {
    let status = response.data.status;
    let data = response.data.data;
    if (status !== 0 || data === undefined || data === null) return alertHandler('Error', 'LBL_ERROR_DELETE_PRODUCTS');

    if (data) {
      alertHandler('Success', 'LBL_PRODUCT_DELETED');
      setTimeout(() => {
        navigate(getFeaturePath(subFeature));
      }, 3000);
    }
  };

  return (
    <>
      {isLoading && <Spinner />}
      {buttonClicked && <div className="lodingpage"></div>}
      {!isLoading && (
        <div className="page-body">
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-12">
                <Calendar />
                <BreadCrumb feature={feature} subFeature={subFeature} modeText="LBL_VIEW_PRODUCT" />
              </div>
            </div>

            <div className="row">
              <div className="col-md-12 mb-4">
                <div className="info-tite-page float-start">
                  <h4>{formik.values.fullName} </h4>
                </div>

                <div className="reverse-page float-end">
                  <BackButton disabled={disableSave} />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <ActionsProgessBar
                  feature={feature}
                  subfeature={subFeature}
                  editHandler={() => {
                    navigate(getFeaturePath(subFeature, 'edit', { id: id }));
                  }}
                  deleteHandler={() => setShowDeletePopup(true)}
                  setShowMoreAction={setShowMoreAction}
                />
                <ProductsForm
                  formik={formik}
                  mode={mode}
                  alertHandler={alertHandler}
                  subFeature={subFeature}
                  fetchedProduct={fetchedProduct}
                  isBarcodeActive={isBarcodeActive}
                  stockMangamentAvaiable={stockMangamentAvaiable}
                  getCostPricePayload={getCostPricePayload}
                  getCostPrice={getCostPrice}
                  canChange={canChange}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      {showMoreAction && (
        <MoreAction
          editHandler={() => {
            navigate(getFeaturePath(subFeature, 'edit', { id: id }));
          }}
          deleteHandler={() => setShowDeletePopup(true)}
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          canSelectAll={false}
        />
      )}
      {showDeletePopup && (
        <ConfirmationPopup onClickHandler={deleteProductHandler} setConfirmationPopup={setShowDeletePopup} item={fetchedProduct.fullName} />
      )}
    </>
  );
};

export default ViewProduct;
