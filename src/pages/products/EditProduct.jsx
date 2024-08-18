import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSelector, useDispatch } from 'react-redux';

import MoreAction from '../../parts/MoreAction';
import BreadCrumb from '../../components/ui/BreadCrumb';
import ActionsProgessBar from '../../parts/ActionsProgessBar';
import BackButton from '../../components/ui/buttons/BackButton';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';
import Calendar from '../../components/ui/Calendar';
import ConfirmationPopup from '../../components/ConfirmationPopup';
import Spinner from '../../components/Spinner/Spinner';
import ProductsForm from './ProductsForm';

import { useAxiosFunction } from '../../hooks/useAxios';
import { MODELS } from '../../constants/models';
import { checkFlashOrError } from '../../utils/helpers';
import { PRODUCTS_SEARCH_FIELDS, UNITS_SEARCH_FIELDS, ACCOUNT_MANAGEMENT_SEARCH_FIELDS } from './ProductsPayloadsFields';
import { VALID_FLOAT } from '../../constants/regex/Regex';
import { getSearchUrl, getActionUrl, getModelUrl, getFetchUrl, getRemoveAllUrl, getUploadUrl } from '../../services/getUrl';
import { useFeatures } from '../../hooks/useFeatures';
import { addObjectToChanges, addFormikValueToChanges, addFloatToChanges } from '../../utils/comparatorHelpers';
import { setSelectedValues, setFieldValue } from '../../utils/formHelpers';
import { BASE_FETCH_FIELDS } from '../config-page/BaseConfig/PayloadsFields';
import { VALID_TEXT_WITH_SPECIAL_CHARS, VALID_CODABAR_FORMAT } from '../../constants/regex/Regex';
import { alertsActions } from '../../store/alerts';
import { STOCK_MOVE_LINES_SEARCH_FIELDS } from '../stockMoves/StockMovesPayloadsFields';
import { useFormikSubmit } from '../../hooks/useFormikSubmit';

const EditProduct = ({ feature, subFeature }) => {
  const mode = 'edit';

  const { api, uploadDocument } = useAxiosFunction();
  const navigate = useNavigate();
  const { isFeatureAvailable, getFeaturePath } = useFeatures();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const stockMangamentAvaiable = useMemo(() => {
    return isFeatureAvailable({ featureCode: '12' });
  }, []);
  const url = window.location.href.split('/');
  const id = parseInt(url[url.length - 1]);
  const company = useSelector(state => state.userFeatures.companyInfo.company);

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [fetchedProduct, setFetchedProduct] = useState(null);
  const [fetchedAccountingList, setFetchedAccountingList] = useState(null);
  const [isBarcodeActive, setBarcodeActive] = useState(false);

  const [serviceUnit, setServiceUnit] = useState(null);
  const [isService, setIsService] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [buttonClicked, setButtonClicked] = useState(false);
  const [disableSave, setDisableSave] = useState(false);
  const [showMoreAction, setShowMoreAction] = useState(false);

  const [parentSaveDone, setParentSaveDone] = useState(false);

  const initValues = {
    name: '',
    code: '',
    productTypeSelect: '',
    unit: null,
    sellable: false,
    purchasable: false,
    purchaseAccount: null,
    saleAccount: null,
    purchaseTax: null,
    saleTax: null,
    startDate: '',
    salePrice: '0.00',
    purchasePrice: '0.00',
    saleCurrency: null,
    purchaseCurrency: null,
    picture: null,
    barCode: null,
    serialNumber: '',
    costTypeSelect: stockMangamentAvaiable ? '0' : null,
    costPrice: stockMangamentAvaiable ? '0.00' : null,
  };

  let valSchema = stockMangamentAvaiable
    ? Yup.object().shape({
        code: Yup.string()
          .matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS'))
          .trim()
          .required(t('PRODUCT_CODE_VALIDATION_MESSAGE')),
        name: Yup.string()
          .matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS'))
          .trim()
          .required(t('PRODUCT_NAME_VALIDATION_MESSAGE')),
        productTypeSelect: Yup.string().required(t('PRODUCT_TYPE_VALIDATION_MESSAGE')),
        purchaseAccount: Yup.object()
          .nullable()
          .when('purchasable', {
            is: true,
            then: Yup.object().nullable().required(t('LBL_PURCHASE_ACCOUNT_REQUIRED')),
          }),
        purchaseTax: Yup.object()
          .nullable()
          .when('purchasable', {
            is: true,
            then: Yup.object().nullable().required(t('LBL_PURCHASE_TAX_REQUIRED')),
          }),
        purchasePrice: Yup.string().when('purchasable', {
          is: true,
          then: Yup.string().matches(VALID_FLOAT, t('LBL_INVALID_NUMBER_VALUE')),
        }),
        saleAccount: Yup.object()
          .nullable()
          .when('sellable', {
            is: true,
            then: Yup.object().nullable().required(t('LBL_SALE_ACCOUNT_REQUIRED')),
          }),
        saleTax: Yup.object()
          .nullable()
          .when('sellable', {
            is: true,
            then: Yup.object().nullable().required(t('LBL_SALE_TAX_REQUIRED')),
          }),
        salePrice: Yup.string().when('sellable', {
          is: true,
          then: Yup.string().matches(VALID_FLOAT, t('LBL_INVALID_NUMBER_VALUE')),
        }),
        unit: Yup.object().nullable().required(t('UNIT_VALIDATION_MESSAGE')),
        serialNumber: Yup.string().matches(VALID_CODABAR_FORMAT, t('INVALID_CODABAR_FORMAT')),
        costTypeSelect: stockMangamentAvaiable ? Yup.string().required(t('LBL_COST_TYPE_REQUIRED')) : Yup.string(),
        costPrice: stockMangamentAvaiable
          ? Yup.number().when('costTypeSelect', { is: 1, then: Yup.number().required(t('REQUIRED')) })
          : Yup.number().when('costTypeSelect', { is: 1, then: Yup.number() }),
      })
    : Yup.object().shape({
        code: Yup.string()
          .matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS'))
          .trim()
          .required(t('PRODUCT_CODE_VALIDATION_MESSAGE')),
        name: Yup.string()
          .matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS'))
          .trim()
          .required(t('PRODUCT_NAME_VALIDATION_MESSAGE')),
        productTypeSelect: Yup.string().required(t('PRODUCT_TYPE_VALIDATION_MESSAGE')),
        purchaseAccount: Yup.object()
          .nullable()
          .when('purchasable', {
            is: true,
            then: Yup.object().nullable().required(t('LBL_PURCHASE_ACCOUNT_REQUIRED')),
          }),
        purchaseTax: Yup.object()
          .nullable()
          .when('purchasable', {
            is: true,
            then: Yup.object().nullable().required(t('LBL_PURCHASE_TAX_REQUIRED')),
          }),
        purchasePrice: Yup.string().when('purchasable', {
          is: true,
          then: Yup.string().matches(VALID_FLOAT, t('LBL_INVALID_NUMBER_VALUE')),
        }),
        saleAccount: Yup.object()
          .nullable()
          .when('sellable', {
            is: true,
            then: Yup.object().nullable().required(t('LBL_SALE_ACCOUNT_REQUIRED')),
          }),
        saleTax: Yup.object()
          .nullable()
          .when('sellable', {
            is: true,
            then: Yup.object().nullable().required(t('LBL_SALE_TAX_REQUIRED')),
          }),
        salePrice: Yup.string().when('sellable', {
          is: true,
          then: Yup.string().matches(VALID_FLOAT, t('LBL_INVALID_NUMBER_VALUE')),
        }),
        unit: Yup.object().nullable().required(t('UNIT_VALIDATION_MESSAGE')),
        serialNumber: Yup.string().matches(VALID_CODABAR_FORMAT, t('INVALID_CODABAR_FORMAT')),
      });

  const submit = values => {
    if (formik.isValid) {
      setDisableSave(true);
      setButtonClicked(true);
      saveTheProduct();
    } else {
      alertHandler('Error', 'LBL_REQUIRED_FIELDS');
    }
  };

  const formik = useFormik({
    initialValues: initValues,
    validationSchema: valSchema,
    validateOnMount: false,
    onSubmit: submit,
  });

  const alertHandler = (title, message) => {
    if ((title, message)) dispatch(alertsActions.initiateAlert({ title, message }));
    setButtonClicked(false);
    setDisableSave(false);
    setIsLoading(false);
  };

  const { handleFormikSubmit } = useFormikSubmit(formik, alertHandler);

  useEffect(() => {
    setIsLoading(true);
    getServiceUnit();
    checkBarcodeActivity();
    fetchProduct();
  }, []);

  useEffect(() => {
    if (isService) {
      if (serviceUnit && serviceUnit.name && serviceUnit.name !== formik.values.unit?.name) setFieldValue(formik, 'unit', serviceUnit);
    }
  }, [isService]);

  const getServiceUnitPayload = () => {
    let payload = {
      fields: UNITS_SEARCH_FIELDS,
      sortBy: null,
      data: {
        _domainContext: {
          _model: MODELS.UNIT,
        },
        operator: 'and',
        criteria: [
          {
            fieldName: 'name',
            operator: 'like',
            value: 'each',
          },
        ],
      },
      limit: -1,
      offset: 0,
      translate: true,
    };
    return payload;
  };

  const getServiceUnit = () => {
    api('POST', getSearchUrl(MODELS.UNIT), getServiceUnitPayload(), onServiceUnitSuccess);
  };

  const onServiceUnitSuccess = response => {
    let status = response.data.status;
    let data = response.data.data;
    let total = response.data.total;

    if (status !== 0 || total === undefined || total === null || !data) {
      return alertHandler('Error', 'LBL_ERROR_LOADING_UNITS');
    }

    if (data && data[0]) {
      let unit = data[0];
      setServiceUnit({
        id: unit.id,
        name: unit.name,
      });
    }
  };

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

  const onFetchSuccess = async response => {
    let status = response.data.status;
    let data = response.data.data;
    if (status !== 0 || !data) navigate(getFeaturePath('PRODUCTS'));

    if (data && data[0]) {
      let product = response.data.data[0];
      setIsLoading(false);
      setFetchedProduct(product);
      let listID = product.accountManagementList && product.accountManagementList[0] ? product.accountManagementList[0].id : null;
      let accountList = {};

      if (listID !== null) {
        const searchResponse = await api('POST', getSearchUrl(MODELS.ACCOUNT_MANAGEMENT), getAccountManagementPayload(listID));
        let status = searchResponse.data.status;
        let data = searchResponse.data.data;
        if (status !== 0 || !data) return alertHandler('Error', 'LBL_ERROR_LOADING_PRODUCT');

        if (data && data[0]) {
          accountList = data[0];
          setFetchedAccountingList(accountList);
        } else {
          setFetchedAccountingList(null);
        }
      }

      let tempCostPrice = null;

      if (stockMangamentAvaiable) {
        tempCostPrice = Number(product?.costPrice || 0.0).toFixed(2);
        tempCostPrice = await getCostPrice();
      }

      let values = {
        name: product.name,
        code: product.code,
        productTypeSelect: product.productTypeSelect,
        sellable: product.sellable,
        purchasable: product.purchasable,
        salePrice: parseFloat(product.salePrice),
        purchasePrice: parseFloat(product.purchasePrice),
        unit: product.unit,
        saleCurrency: product.saleCurrency,
        purchaseCurrency: product.purchaseCurrency,
        purchaseTax: accountList.purchaseTax ?? null,
        saleTax: accountList.saleTax ?? null,
        purchaseAccount: accountList.purchaseAccount ?? null,
        saleAccount: accountList?.saleAccount ?? null,
        serialNumber: product.serialNumber ?? '',
        costPrice: stockMangamentAvaiable ? tempCostPrice : null,
        costTypeSelect: stockMangamentAvaiable ? parseInt(product.costTypeSelect).toString() ?? '' : null,
      };
      setSelectedValues(formik, values);
      if (product.productTypeSelect === 'service') setIsService(true);
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

  const onSaveActionPayload = () => {
    let changedFields = getChangedFields();
    let payload = {
      model: MODELS.PRODUCT,
      action: 'action-group-product-onsave',
      data: {
        criteria: [],
        context: {
          _model: MODELS.PRODUCT,
          _activeCompany: null,
          _fromSale: true,
          _id: null,
          id: fetchedProduct.id ?? null,
          version: fetchedProduct.version ?? null,
          startDate: fetchedProduct.startDate ?? null,
          purchasable: changedFields.purchasable ?? fetchedProduct.purchasable,
          sellable: changedFields.sellable ?? fetchedProduct.sellable,
          saleCurrency: changedFields.saleCurrency,
          purchaseCurrency: changedFields.purchaseCurrency,
          fullName: fetchedProduct?.fullName ?? null,
          name: changedFields.name ?? fetchedProduct.name,
          code: changedFields.code ?? fetchedProduct.code,
          productTypeSelect: changedFields.productTypeSelect ?? fetchedProduct.productTypeSelect,
          unit: changedFields.unit ?? {
            id: fetchedProduct.unit.id,
          },
          accountManagementList:
            changedFields.accountManagementList ??
            (fetchedAccountingList && fetchedAccountingList.id
              ? [
                  {
                    id: fetchedAccountingList.id,
                    selected: true,
                  },
                ]
              : null),
          salePrice: changedFields.salePrice,
          purchasePrice: changedFields.purchasePrice,
          serialNumber: formik.values.serialNumber?.length > 0 ? formik.values.serialNumber : null,
          barcodeTypeConfig: fetchedProduct.barcodeTypeConfig,
        },
      },
    };

    if (stockMangamentAvaiable) {
      payload = {
        ...payload,
        data: {
          ...payload.data,
          costPrice: Number(formik.values.costPrice).toFixed(2).toString(),
          costTypeSelect: parseInt(formik.values.costTypeSelect),
        },
      };
    }

    return payload;
  };

  const saveTheProduct = () => {
    api('POST', getActionUrl(), onSaveActionPayload(), onSaveActionSuccess);
  };

  const onSaveActionSuccess = response => {
    let status = response.data.status;
    let data = response.data.data;
    if (status !== 0) return alertHandler('Error', 'LBL_ERROR_SAVING_PRODUCT');

    if (data && checkFlashOrError(data)) {
      return alertHandler('Error', 'LBL_ERROR_SAVING_PRODUCT');
    }

    onSaveProduct();
  };

  const onSaveProductPayload = pictureData => {
    let payload = {
      data: getChangedFields(pictureData),
    };
    return payload;
  };

  const onSaveProduct = async () => {
    if (formik.values.picture && formik.values.picture instanceof File) {
      const uploadPictureResponse = await uploadDocument(getUploadUrl(MODELS.METAFILE), formik.values.picture);

      if (!uploadPictureResponse.data || uploadPictureResponse.data.status !== 0) {
        alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      }

      return api('POST', getModelUrl(MODELS.PRODUCT), onSaveProductPayload(uploadPictureResponse.data.data[0]), onSaveProductSuccess);
    } else {
      return api('POST', getModelUrl(MODELS.PRODUCT), onSaveProductPayload(), onSaveProductSuccess);
    }
  };

  const onSaveProductSuccess = response => {
    let status = response.data.status;
    let data = response.data.data;

    if (status === -1 && data?.title?.includes('Unique constraint')) {
      setDisableSave(false);
      setButtonClicked(false);
      return alertHandler('Error', 'LBL_ERROR_PRODUCT_CODE_ALREADY_EXISTS');
    }

    if (status !== 0) return alertHandler('Error', 'LBL_ERROR_SAVING_PRODUCT');
    if (!data) return alertHandler('Error', 'LBL_ERROR_SAVING_PRODUCT');
    if (data && data[0]) onSaveSuccess();
  };

  const getChangedFields = pictureData => {
    let changedFields = {};
    changedFields.id = fetchedProduct.id;
    changedFields.version = fetchedProduct.version;
    changedFields.picture = pictureData
      ? { id: pictureData.id }
      : formik.values.picture
        ? fetchedProduct.picture
          ? fetchedProduct.picture
          : null
        : null;
    changedFields.serialNumber = formik.values.serialNumber?.length > 0 ? formik.values.serialNumber : fetchedProduct.serialNumber;

    if (stockMangamentAvaiable) {
      changedFields.costPrice = Number(formik.values.costPrice).toFixed(2).toString();
      changedFields.costTypeSelect = parseInt(formik.values.costTypeSelect);
    }

    addFormikValueToChanges('code', changedFields, fetchedProduct.code, formik);
    addFormikValueToChanges('name', changedFields, fetchedProduct.name, formik);
    addFormikValueToChanges('productTypeSelect', changedFields, fetchedProduct.productTypeSelect, formik);
    addFormikValueToChanges('sellable', changedFields, fetchedProduct.sellable, formik);
    addFormikValueToChanges('purchasable', changedFields, fetchedProduct.purchasable, formik);
    addObjectToChanges('unit', changedFields, fetchedProduct.unit, formik.values.unit);

    if (formik.values.sellable) {
      addObjectToChanges('saleCurrency', changedFields, fetchedProduct.saleCurrency, formik.values.saleCurrency);
      addFloatToChanges('salePrice', changedFields, fetchedProduct.salePrice, formik);
    } else {
      changedFields.saleCurrency = null;
      changedFields.salePrice = '0.00';
    }

    if (formik.values.purchasable) {
      addObjectToChanges('purchaseCurrency', changedFields, fetchedProduct.purchaseCurrency, formik.values.purchaseCurrency);
      addFloatToChanges('purchasePrice', changedFields, fetchedProduct.purchasePrice, formik);
    } else {
      changedFields.purchasePrice = '0.00';
      changedFields.purchaseCurrency = null;
    }

    changedFields.accountManagementList = getChangedAccountingList();
    return changedFields;
  };

  const getChangedAccountingList = () => {
    if (!fetchedAccountingList && !formik.values.sellable && !formik.values.purchasable) {
      return null;
    }

    let list = {};
    list.id = fetchedAccountingList?.id ?? null;
    if (list.id) list.version = fetchedAccountingList?.version ?? 0;
    list.typeSelect = 1;
    list.company = fetchedAccountingList?.company || company;
    list.product = fetchedProduct
      ? {
          id: fetchedProduct.id,
        }
      : null;

    if (formik.values.sellable) {
      addObjectToChanges('saleAccount', list, fetchedAccountingList?.saleAccount, formik.values.saleAccount);
      addObjectToChanges('saleTax', list, fetchedAccountingList?.saleTax, formik.values.saleTax);
    } else {
      list.saleAccount = null;
      list.saleTax = null;
    }

    if (formik.values.purchasable) {
      addObjectToChanges('purchaseAccount', list, fetchedAccountingList?.purchaseAccount, formik.values.purchaseAccount);
      addObjectToChanges('purchaseTax', list, fetchedAccountingList?.purchaseTax, formik.values.purchaseTax);
    } else {
      list.purchaseAccount = null;
      list.purchaseTax = null;
    }

    return [list];
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
    if (status !== 0) return alertHandler('Error', 'LBL_ERROR_DELETE_PRODUCTS');
    if (!data) return alertHandler('Error', 'LBL_ERROR_DELETE_PRODUCTS');

    if (data) {
      alertHandler('Success', 'LBL_PRODUCT_DELETED');
      setTimeout(() => {
        navigate(getFeaturePath(subFeature));
      }, 3000);
    }
  };

  const onSaveSuccess = () => {
    setParentSaveDone(true);
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
    return fetchedProduct ? Number(fetchedProduct?.costPrice || 0.0).toFixed(2) : 0.0;
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
                <BreadCrumb feature={feature} subFeature={subFeature} modeText="LBL_EDIT_PRODUCT" />
              </div>
            </div>
            <div className="row">
              <div className="col-md-12 mb-4">
                <div className="info-tite-page float-start">
                  <h4>{fetchedProduct?.fullName} </h4>
                </div>
                <div className="reverse-page float-end">
                  <BackButton disabled={disableSave} />
                  <PrimaryButton disabled={disableSave} onClick={handleFormikSubmit} />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <ActionsProgessBar
                  feature={feature}
                  subfeature={subFeature}
                  viewHandler={() => {
                    navigate(getFeaturePath(subFeature, 'view', { id: id }));
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
                  isService={isService}
                  setIsService={setIsService}
                  parentSaveDone={parentSaveDone}
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
      {showDeletePopup && (
        <ConfirmationPopup onClickHandler={deleteProductHandler} setConfirmationPopup={setShowDeletePopup} item={fetchedProduct.fullName} />
      )}
      {showMoreAction && (
        <MoreAction
          viewHandler={() => {
            navigate(getFeaturePath(subFeature, 'view', { id: id }));
          }}
          deleteHandler={() => setShowDeletePopup(true)}
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          canSelectAll={false}
        />
      )}
    </>
  );
};

export default EditProduct;
