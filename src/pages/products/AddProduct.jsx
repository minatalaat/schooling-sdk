import { useState, useEffect, useMemo } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import BreadCrumb from '../../components/ui/BreadCrumb';
import BackButton from '../../components/ui/buttons/BackButton';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';
import Calendar from '../../components/ui/Calendar';
import ProductsForm from './ProductsForm';

import { useAxiosFunction } from '../../hooks/useAxios';
import { MODELS } from '../../constants/models';
import { checkFlashOrError } from '../../utils/helpers';
import { UNITS_SEARCH_FIELDS } from './ProductsPayloadsFields';
import { VALID_FLOAT } from '../../constants/regex/Regex';
import { getSearchUrl, getActionUrl, getModelUrl, getUploadUrl, getFetchUrl } from '../../services/getUrl';
import { tourStepsActions } from '../../store/tourSteps';
import { getItem, setItem } from '../../utils/localStorage';
import { setFieldValue } from '../../utils/formHelpers';
import { BASE_FETCH_FIELDS } from '../config-page/BaseConfig/PayloadsFields';
import { VALID_TEXT_WITH_SPECIAL_CHARS, VALID_CODABAR_FORMAT } from '../../constants/regex/Regex';
import { alertsActions } from '../../store/alerts';
import { useFormikSubmit } from '../../hooks/useFormikSubmit';
import { useFeatures } from '../../hooks/useFeatures';
import { useTourServices } from '../../services/useTourServices';

const AddProduct = ({ feature, subFeature, productConfig }) => {
  const mode = 'add';

  const { api, uploadDocument } = useAxiosFunction();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isFeatureAvailable } = useFeatures();
  const stockMangamentAvaiable = useMemo(() => {
    return isFeatureAvailable({ featureCode: '12' });
  }, []);
  const { addStepsOptions } = useTourServices();

  const company = useSelector(state => state.userFeatures.companyInfo.company);
  const isTour = useSelector(state => state.tourSteps.isTour);

  const today = new Date();
  const [serviceUnit, setServiceUnit] = useState(null);
  const [barcodeTypeConfig, setBarcodeTypeConfig] = useState(null);
  const [isBarcodeActive, setBarcodeActive] = useState(false);

  const [isService, setIsService] = useState(false);
  const [buttonClicked, setButtonClicked] = useState(false);
  const [disableSave, setDisableSave] = useState(false);

  const [parentSaveDone, setParentSaveDone] = useState(false);
  const [fetchedProduct, setFetchedProduct] = useState(null);

  const initValues = {
    name: '',
    code: '',
    productTypeSelect: '',
    unit: null,
    sellable: true,
    purchasable: true,
    purchaseAccount: null,
    saleAccount: null,
    purchaseTax: null,
    saleTax: null,
    salePrice: '0.00',
    purchasePrice: '0.00',
    saleCurrency: null,
    purchaseCurrency: null,
    picture: null,
    serialNumber: '',
    costTypeSelect: stockMangamentAvaiable ? '0' : null,
    costPrice: stockMangamentAvaiable ? 1.0 : null,
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

  const submit = () => {
    if (getItem('isTour') === 'true') {
      setItem('isTour', 'false');
      dispatch(tourStepsActions.setIsTour('false'));
    }

    setDisableSave(true);
    setButtonClicked(true);

    if (formik.values.picture && formik.values.picture instanceof File) {
      uploadPicture();
    } else {
      return saveProductAction();
    }
  };

  const alertHandler = (title, message) => {
    if (message) dispatch(alertsActions.initiateAlert({ title, message }));
    setButtonClicked(false);
  };

  const formik = useFormik({
    initialValues: initValues,
    validationSchema: valSchema,
    validateOnMount: true,
    onSubmit: submit,
  });

  const { handleFormikSubmit } = useFormikSubmit(formik, alertHandler);

  const getFields = () => {
    let fields = {};
    let accountManagementObject = { id: null, typeSelect: 1 };

    if (formik.values.sellable || formik.values.purchasable) {
      accountManagementObject.company = company;

      if (formik.values.sellable) {
        if (formik.values.saleAccount) {
          accountManagementObject.saleAccount = formik.values.saleAccount;
        }

        if (formik.values.saleTax) {
          accountManagementObject.saleTax = formik.values.saleTax;
        }
      }

      if (formik.values.purchasable) {
        if (formik.values.purchaseAccount) {
          accountManagementObject.purchaseAccount = formik.values.purchaseAccount;
        }

        if (formik.values.purchaseTax) {
          accountManagementObject.purchaseTax = formik.values.purchaseTax;
        }
      }

      fields.accountManagementList = [accountManagementObject];
    }

    fields.startDate = moment(today).locale('en').format('YYYY-MM-DD');
    return fields;
  };

  useEffect(() => {
    setButtonClicked(true);
    getServiceUnit();
    fetchCompanyAccountConfig();
    getOnNewProduct();
    checkBarcodeActivity();
  }, []);

  useEffect(() => {
    if (productConfig?.tourConfig && isTour === 'true' && (formik.values.purchasable || formik.values.sellable)) {
      addStepsOptions(productConfig?.tourConfig?.addSteps);
      dispatch(tourStepsActions.setIsTour('true'));
      dispatch(tourStepsActions.setSpotlightClick(true));
      dispatch(tourStepsActions.setSteps({ steps: productConfig?.tourConfig?.addSteps }));
    }
  }, [isTour, formik.values.purchasable, formik.values.sellable]);

  useEffect(() => {
    if (isService && serviceUnit) setFieldValue(formik, 'unit', serviceUnit);
  }, [isService]);

  const fetchCompanyAccountConfig = async () => {
    const companyAccountConfigDefaultResponse = await api('POST', getFetchUrl(MODELS.COMPANY_ACCOUNT_CONFIG, 1), {
      fields: ['defaultSaleAccount', 'defaultPurchaseAccount', 'defaultInventoryAccount', 'defaultCostOfGoodSoldAccount'],
      related: {},
    });
    if (companyAccountConfigDefaultResponse.data.status !== 0 || !companyAccountConfigDefaultResponse?.data?.data)
      return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    let config = companyAccountConfigDefaultResponse?.data?.data[0];
    setFieldValue(formik, 'purchaseAccount', config?.defaultPurchaseAccount || null);
    setFieldValue(formik, 'saleAccount', config?.defaultSaleAccount || null);
  };

  const getOnNewPayload = () => {
    let payload = {
      model: MODELS.PRODUCT,
      action: 'action-group-base-product-onnew,com.axelor.meta.web.MetaController:moreAttrs',
      data: {
        criteria: [],
        context: {
          _model: MODELS.PRODUCT,
          _activeCompany: null,
          _productTypeSelect: 'storable',
          _id: null,
          _isModel: 'false',
          attrs: '{}',
          productAttrs: '{}',
          complementaryProductList: [],
          accountManagementList: [],
          _source: 'form',
        },
      },
    };
    return payload;
  };

  const getOnNewProduct = () => {
    api('POST', getActionUrl(), getOnNewPayload(), onNewProductSuccess);
  };

  const onNewProductSuccess = response => {
    let status = response.data.status;
    let data = response.data.data;
    setButtonClicked(false);
    if (status !== 0 || data === undefined || data === null) return alertHandler('Error', 'LBL_ERROR_LOADING_NEW_PRODUCT');

    if (data && checkFlashOrError(data)) {
      return alertHandler('Error', 'LBL_ERROR_LOADING_NEW_PRODUCT');
    }

    let productTypeSelect = data.find(el => el.values && 'productTypeSelect' in el.values);

    if (productTypeSelect) {
      productTypeSelect = productTypeSelect.values.productTypeSelect;
      setFieldValue(formik, 'productTypeSelect', productTypeSelect);
    }

    let barcodeTypeConfig = data.find(el => el.values && 'barcodeTypeConfig' in el.values);

    if (barcodeTypeConfig) {
      barcodeTypeConfig = barcodeTypeConfig.values.barcodeTypeConfig;
      setBarcodeTypeConfig(barcodeTypeConfig);
    }
  };

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

    if (status !== 0 || total === undefined || total === null || data === undefined || data === null) {
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

  const uploadPicture = async () => {
    const response = await uploadDocument(getUploadUrl(MODELS.METAFILE), formik.values.picture);
    let status = response.data.status;
    let data = response.data.data;

    if (!response.data || status !== 0 || !data) {
      setDisableSave(false);
      setButtonClicked(false);
      return alertHandler('Error', 'LBL_ERROR_UPLOADING_PRODUCT_PICTURE');
    }

    saveProductAction(data[0].id);
  };

  const onSaveProductActionPayload = pictureID => {
    let fields = getFields();
    let payload = {
      model: MODELS.PRODUCT,
      action: 'action-group-product-onsave',
      data: {
        criteria: [],
        context: {
          _model: MODELS.PRODUCT,
          salePrice: formik.values.sellable ? formik.values.salePrice : null,
          purchasePrice: formik.values.purchasable ? formik.values.purchasePrice : null,
          startDate: fields.startDate,
          purchasable: formik.values.purchasable,
          sellable: formik.values.sellable,
          unit: formik.values.unit || null,
          productTypeSelect: formik.values.productTypeSelect,
          code: formik.values.code,
          name: formik.values.name,
          purchaseCurrency: formik.values.purchaseCurrency || null,
          saleCurrency: formik.values.saleCurrency || null,
          accountManagementList: formik.values.purchasable || formik.values.sellable ? fields.accountManagementList : null,
          picture: pictureID ? { id: pictureID } : null,
          serialNumber: formik.values.serialNumber?.length > 0 ? formik.values.serialNumber : null,
          barcodeTypeConfig: barcodeTypeConfig,
          costPrice: formik.values.costPrice,
          costTypeSelect: parseInt(formik.values.costTypeSelect),
        },
      },
    };
    return payload;
  };

  const saveProductAction = async pictureID => {
    const response = await api('POST', getActionUrl(), onSaveProductActionPayload(pictureID));

    if (!response.data || response.data.status !== 0) {
      setDisableSave(false);
      setButtonClicked(false);
      return alertHandler('Error', 'LBL_ERROR_SAVING_PRODUCT');
    }

    let data = response.data.data || null;

    if (data && checkFlashOrError(data)) {
      setDisableSave(false);
      setButtonClicked(false);
      return alertHandler('Error', 'LBL_ERROR_SAVING_PRODUCT');
    }

    api('POST', getModelUrl(MODELS.PRODUCT), onSaveProductPayload(pictureID), onSaveProductSuccess);
  };

  const onSaveProductPayload = pictureID => {
    let fields = getFields();
    let payload = {
      data: {
        salePrice: formik.values.sellable ? formik.values.salePrice : null,
        purchasePrice: formik.values.purchasable ? formik.values.purchasePrice : null,
        accountManagementList: formik.values.purchasable || formik.values.sellable ? fields.accountManagementList : null,
        startDate: fields.startDate,
        purchasable: formik.values.purchasable,
        sellable: formik.values.sellable,
        unit: formik.values.unit || null,
        productTypeSelect: formik.values.productTypeSelect,
        code: formik.values.code,
        name: formik.values.name,
        purchaseCurrency: formik.values.purchaseCurrency || null,
        saleCurrency: formik.values.saleCurrency || null,
        picture: pictureID ? { id: pictureID } : null,
        serialNumber: formik.values.serialNumber?.length > 0 ? formik.values.serialNumber : null,
        barcodeTypeConfig: barcodeTypeConfig,
      },
    };

    if (stockMangamentAvaiable) {
      payload = {
        ...payload,
        data: { ...payload.data, costPrice: formik.values.costPrice, costTypeSelect: parseInt(formik.values.costTypeSelect) },
      };
    }

    return payload;
  };

  const onSaveProductSuccess = response => {
    let status = response.data.status;
    let data = response.data.data;

    if (status === -1 && data?.title?.includes('Unique constraint')) {
      setDisableSave(false);
      setButtonClicked(false);
      return alertHandler('Error', 'LBL_ERROR_PRODUCT_CODE_ALREADY_EXISTS');
    }

    if (status !== 0 || data === undefined || data === null) {
      setDisableSave(false);
      setButtonClicked(false);
      return alertHandler('Error', 'LBL_ERROR_SAVING_PRODUCT');
    }

    if (data && data[0]) {
      setParentSaveDone(true);
      setFetchedProduct(data[0]);
    }
  };

  const getCostPricePayload = action => {
    let paylaod = {
      model: MODELS.PRODUCT,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: MODELS.PRODUCT,
          _activeCompany: company,
          _fromPurchase: true,
          _id: null,
          grossMass: fetchedProduct ? fetchedProduct.grossMass : null,
          accountManagementList: fetchedProduct ? fetchedProduct.accountManagementList : null,
          avgPrice: fetchedProduct ? fetchedProduct.avgPrice : null,
          salePrice: formik.values.salePrice,
          costPrice: formik.values.costPrice,
          costTypeSelect: formik.values.costTypeSelect ? parseInt(formik.values.costTypeSelect) : null,
          sellable: formik.values.sellable,
          purchaseCurrency: fetchedProduct ? fetchedProduct.purchaseCurrency : null,
          saleCurrency: fetchedProduct ? fetchedProduct.saleCurrency : null,
          unit: fetchedProduct ? fetchedProduct.unit : null,
          productTypeSelect: formik.values.productTypeSelect,
        },
      },
    };
    return paylaod;
  };

  const getCostPrice = async () => {
    const action = 'action-product-group-cost-type-select-onchange';
    const getCostPriceReponse = await api('POST', getActionUrl(), getCostPricePayload(action));

    if (getCostPriceReponse.data.status !== 0) {
      alertHandler('Error', t('SOME_THING_WENT_WRONG'));
      return 0.0;
    }

    let responseData = getCostPriceReponse?.data?.data;
    return Number(responseData?.[0]?.attrs?.costPrice?.value || 0.0).toFixed(2);
  };

  return (
    <>
      {buttonClicked && <div className="lodingpage"></div>}
      <div className="page-body">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <Calendar />
              <BreadCrumb feature={feature} subFeature={subFeature} modeText="LBL_ADD_PRODUCT" />
            </div>
          </div>

          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{t('LBL_NEW_PRODUCT')}</h4>
              </div>
              <div className="reverse-page float-end">
                <BackButton text={t('LBL_CANCEL')} disabled={disableSave} />
                <PrimaryButton disabled={disableSave} className="step-add-product-submit" onClick={handleFormikSubmit} />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <ProductsForm
                formik={formik}
                mode={mode}
                alertHandler={alertHandler}
                isService={isService}
                setIsService={setIsService}
                parentSaveDone={parentSaveDone}
                subFeature={subFeature}
                fetchedProduct={fetchedProduct}
                isBarcodeActive={isBarcodeActive}
                stockMangamentAvaiable={stockMangamentAvaiable}
                getCostPricePayload={getCostPricePayload}
                getCostPrice={getCostPrice}
                canChange={() => {
                  return true;
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddProduct;
