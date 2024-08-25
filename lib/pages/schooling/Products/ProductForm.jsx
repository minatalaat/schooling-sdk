import { useFormik } from 'formik';
import TextInput from '../../../components/ui/inputs/TextInput';
import DropDown from '../../../components/ui/inputs/DropDown';
import AttachmentInput from '../../../components/ui/inputs/AttachmentInput';
import FileInput from '../../../components/ui/inputs/FileInput';
import CheckboxInput from '../../../components/ui/inputs/CheckboxInput';
import NumberInput from '../../../components/ui/inputs/NumberInput';
import FormNotes from '../../../components/ui/inputs/FormNotes';
import { VALID_CODABAR_FORMAT, VALID_FLOAT, VALID_TEXT_WITH_SPECIAL_CHARS } from './../../../constants/regex/Regex';
import * as Yup from 'yup';
import Card from '../../../components/Card/Card';

import { costTypeOptions} from './ProductsPayloadsFields';
import { useProductsServices } from '../../../services/apis/useProductsServices';
import { useCategoriesServices } from '../../../services/apis/useCategoriesServices';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ProductsForm = ({ mode, data, alertHandler, isService, parentSaveDone, subFeature, fetchedProduct, btnRef }) => {
  const { updateProduct, addProduct, fetchAvailableCurrencies } = useProductsServices();
  const { fetchCategories } = useCategoriesServices();
  const navigate = useNavigate();
  const [fetchedCategories, setFetchedCategories] = useState([]);
  const [fetchedCurrencies, setFetchedCurrencies] = useState([]);
  const { t } = useTranslation();
  const productTypeSelect = null;

  const initValues = {
    name: data?.name,
    code: data?.code,
    productTypeSelect: data?.product_type_select?.name_ar,
    unit: data?.unit || 'each/وحدة',
    sellable: data?.sellable || false,
    purchasable: data?.purchasable || false,
    purchaseAccount: data?.saleAccount?.id || { id: undefined },
    saleAccount: data?.saleAccount?.id || { id: undefined },
    purchaseVAT: data?.purchaseVAT?.id || { id: undefined },
    saleVAT: data?.saleVAT?.id || { id: undefined },
    salePrice: data?.sale_price,
    purchasePrice: data?.purchase_price || '',
    saleCurrency: data?.saleCurrency?.id || { id: undefined },
    purchaseCurrency: data?.purchaseCurrency?.id || { id: undefined },
    picture: data?.image,
    serialNumber: '',
    costTypeSelect: data?.cost_type,
    costPrice: data?.cost_price,
    category_id: data?.category?.id || { id: undefined },
    calories: '',
  };

  const valSchema = Yup.object().shape({
    code: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).trim().required(t('REQUIRED')),
    name: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).trim().required(t('REQUIRED')),
    productTypeSelect: Yup.string().required(t('REQUIRED')),
    purchaseAccount: Yup.object()
      .nullable()
      .when('purchasable', {
        is: true,
        then: Yup.object().shape({
          id: Yup.number().required(`* ${t('REQUIRED')}`),
        }),
      }),
    purchaseVAT: Yup.object()
      .nullable()
      .when('purchasable', {
        is: true,
        then: Yup.object().shape({
          id: Yup.number().required(`* ${t('REQUIRED')}`),
        }),
      }),
    purchasePrice: Yup.string().when('purchasable', {
      is: true,
      then: Yup.string().matches(VALID_FLOAT, t('LBL_INVALID_NUMBER_VALUE')).required(t('REQUIRED')),
    }),
    saleAccount: Yup.object()
      .nullable()
      .when('sellable', {
        is: true,
        then: Yup.object().shape({
          id: Yup.number().required(`* ${t('REQUIRED')}`),
        }),
      }),
    saleVAT: Yup.object()
      .nullable()
      .when('sellable', {
        is: true,
        then: Yup.object().shape({
          id: Yup.number().required(`* ${t('REQUIRED')}`),
        }),
      }),
    salePrice: Yup.string().when('sellable', {
      is: true,
      then: Yup.string().matches(VALID_FLOAT, t('LBL_INVALID_NUMBER_VALUE')).required(t('REQUIRED')),
    }),
    unit: Yup.string().required(t('REQUIRED')),
    serialNumber: Yup.string().matches(VALID_CODABAR_FORMAT, t('INVALID_CODABAR_FORMAT')),
    costTypeSelect: Yup.string().required(t('REQUIRED')),
    costPrice: Yup.number().when('costTypeSelect', { is: '1', then: Yup.number().required(t('REQUIRED')) }),
    calories: Yup.string().required(t('REQUIRED')),
    category_id: Yup.object().shape({
      id: Yup.number().required(`* ${t('REQUIRED')}`),
    }),
    saleCurrency: Yup.object()
      .nullable()
      .when('sellable', {
        is: true,
        then: Yup.object().shape({
          id: Yup.number().required(`* ${t('REQUIRED')}`),
        }),
      }),
    purchaseCurrency: Yup.object()
      .nullable()
      .when('purchasable', {
        is: true,
        then: Yup.object().shape({
          id: Yup.number().required(`* ${t('REQUIRED')}`),
        }),
      }),
  });

  const prepareSubmitValues = values => {
    const submitValues = { ...values };

    if (!submitValues.sellable) {
      ['saleAccount', 'saleVAT', 'salePrice', 'saleCurrency'].forEach(field => delete submitValues[field]);
    }

    if (!submitValues.purchasable) {
      ['purchaseAccount', 'purchaseVAT', 'purchasePrice', 'purchaseCurrency'].forEach(field => delete submitValues[field]);
    }

    // Other transformations if needed...

    return submitValues;
  };

  const submit = values => {
    delete values.unit; //for test
    const submitValues = prepareSubmitValues(values);

    if (data?.id) {
      updateProduct(4, submitValues, () => {
        navigate(-1);
      });
    } else {
      addProduct(submitValues, () => {
        navigate(-1);
      });
    }
  };

  const formik = useFormik({
    initialValues: initValues,
    validationSchema: valSchema,
    validateOnMount: true,
    enableReinitialize: true,
    onSubmit: submit,
  });

  const importCategoriesData = async () => {
    const data = await fetchCategories({
      size: 100,
    });
    setFetchedCategories(data);
  };

  useEffect(() => {
    importCategoriesData();
  }, []);

  return (
    <form onSubmit={formik.handleSubmit}>
      <Card>
        <div className="row step-add-product-1">
          <div className="col-md-9">
            <div className="row">
              <div className="col-md-6">
                <TextInput formik={formik} label="LBL_PRODUCT_CODE" accessor="code" isRequired={true} mode={mode} />
              </div>
              <div className="col-md-6">
                <TextInput formik={formik} label="LBL_PRODUCT_NAME" accessor="name" isRequired={true} mode={mode} />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <DropDown
                  options={[
                    {
                      id: 1,
                      label: 'Product',
                      name_ar: 'منتج',
                    },
                    {
                      id: 2,
                      label: 'Service',
                      name_ar: 'خدمة',
                    },
                  ]}
                  formik={formik}
                  isRequired={true}
                  label="LBL_PRODUCT_TYPE"
                  accessor="productTypeSelect"
                  translate={productTypeSelect?.mode === 'enum'}
                  keys={{ valueKey: 'value', titleKey: 'label' }}
                  mode={mode}
                  // onChange={onProductTypeChange}
                  type={productTypeSelect?.data?.type}
                />
              </div>
              <div className="col-md-6">
                {/* <SearchModalContainer
                  formik={formik}
                  modelKey="UNITS"
                  mode={mode}
                  isRequired={!isService}
                  selectIdentifier="unit"
                  label="LBL_UNITS"
                  disabled={isService}
                  defaultValueConfig={null}
                /> */}
                <TextInput formik={formik} label="LBL_UNITS" accessor="unit" mode={mode} isRequired={true} />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <DropDown
                  options={fetchedCategories?.data}
                  formik={formik}
                  isRequired={true}
                  label="LBL_PRODUCT_CATEGORY_NAME"
                  accessor="category_id.id"
                  translate={productTypeSelect?.mode === 'enum'}
                  keys={{ valueKey: 'id', titleKey: 'name' }}
                  mode={mode}
                  type="STRING"
                />
              </div>
              <div className="col-md-6">
                <TextInput formik={formik} label="LBL_PRODUCT_CALORIES" accessor="calories" isRequired={true} mode={mode} />
              </div>
            </div>
            <div className="col-md-6 checkbox-container">
              <CheckboxInput formik={formik} label="LBL_SELLABLE" accessor="sellable" mode={mode} isOnlyCheckboxesInRow={true} />
              <CheckboxInput formik={formik} label="LBL_PURCHASABLE" accessor="purchasable" mode={mode} isOnlyCheckboxesInRow={true} />
            </div>
          </div>
          <div className="col-md-3">
            <FileInput
              formik={formik}
              identifier="picture"
              label="LBL_PRODUCT_PICTURE"
              alertHandler={alertHandler}
              mode={mode}
              parentId={data?.id}
              fileId={data?.picture?.id}
            />
          </div>
        </div>
        </Card>
        {formik?.values?.sellable && (
          <>
    <Card title="LBL_ACCOUNTING" >
          {/* <Card></Card> */}
            <div className="row step-add-product-2">
              <div className="col-md-6">
                
                <DropDown
                  options={[
                    {
                      id: 123,
                      name: 'Saudi Riyal',
                      name_ar: 'ريال سعودي',
                      code: 'SAR',
                    },
                  ]}
                  formik={formik}
                  isRequired={true}
                  disabled={false}
                  label="LBL_SALE_CURRENCY"
                  accessor="saleCurrency.id"
                  keys={{ valueKey: 'id', titleKey: 'name' }}
                  mode={mode}
                />
              </div>
              <div className="col-md-6">
                <NumberInput formik={formik} label="LBL_SALE_PRICE" accessor="salePrice" mode={mode} isRequired={formik.values.sellable} />
              </div>
              <div className="col-md-6">
             
                <DropDown
                  options={[
                    {
                      id: 110,
                      name: 'Revenues - ايرادات المبيعات',
                      label: '41110001 - Revenues - ايرادات المبيعات',
                      code: '41110001',
                    },
                  ]}
                  formik={formik}
                  isRequired={true}
                  disabled={false}
                  label="LBL_SALE_ACCOUNT"
                  accessor="saleAccount.id"
                  keys={{ valueKey: 'id', titleKey: 'name' }}
                  mode={mode}
                />
              </div>
              <div className="col-md-6">
             
                <DropDown
                  options={[
                    {
                      id: 3,
                      name: 'Standard rate sale - ضريبة القيمة المضافة للمبيعات ',
                      code: 'KSA_SRS',
                    },
                  ]}
                  formik={formik}
                  isRequired={true}
                  disabled={false}
                  label="LBL_SALE_TAX"
                  accessor="saleVAT.id"
                  keys={{ valueKey: 'id', titleKey: 'name' }}
                  mode={mode}
                />
              </div>
            </div>
        </Card>
          </>
        )}
        {formik.values.purchasable && (
          <>
          <Card title=''>
            <div className="row step-add-product-3">
              <div className="col-md-6">
             
                <DropDown
                  options={[
                    {
                      id: 123,
                      name: 'Saudi Riyal',
                      name_ar: 'ريال سعودي',
                      code: 'SAR',
                    },
                  ]}
                  formik={formik}
                  isRequired={formik.values.purchasable}
                  disabled={false}
                  label="LBL_PURCHASE_CURRENCY"
                  accessor="purchaseCurrency.id"
                  keys={{ valueKey: 'id', titleKey: 'name' }}
                  mode={mode}
                />
              </div>
              <div className="col-md-6">
                <NumberInput
                  formik={formik}
                  label="LBL_PURCHASE_PRICE"
                  accessor="purchasePrice"
                  mode={mode}
                  isRequired={formik.values.purchasable}
                />
              </div>
              <div className="col-md-6">
               
                <DropDown
                  // placeholder={formik.values.grade?.name}
                  options={[
                    {
                      id: 126,
                      name: 'Goods Received not Invoiced Account - حساب مقاصة بضائع مستلمة غير مفوترة',
                      code: '21120001',
                      label: '21120001 - Goods Received not Invoiced Account - حساب مقاصة بضائع مستلمة غير مفوترة',
                      analyticDistributionRequiredOnInvoiceLines: false,
                      analyticDistributionRequiredOnMoveLines: false,
                      analyticDistributionAuthorized: false,
                      statusSelect: 0,
                    },
                  ]}
                  formik={formik}
                  isRequired={formik.values.purchasable}
                  disabled={false}
                  label="LBL_PURCHASE_ACCOUNT"
                  accessor="purchaseAccount.id"
                  keys={{ valueKey: 'id', titleKey: 'name' }}
                  mode={mode}
                />
              </div>
              <div className="col-md-6">
               
                <DropDown
                  options={[
                    {
                      id: 4,
                      name: 'Standard rate purchase - ضريبة القيمة المضافة للمشتريات',
                      code: 'KSA_SRP',
                    },
                  ]}
                  formik={formik}
                  isRequired={formik.values.purchasable}
                  disabled={false}
                  label="LBL_PURCHASE_TAX"
                  accessor="purchaseVAT.id"
                  keys={{ valueKey: 'id', titleKey: 'name' }}
                  mode={mode}
                />
              </div>
            </div>
            </Card>
          </>
        )}
        <>
          <Card title="LBL_COST_MANAGEMENT" >
          <div className="row step-add-product-3">
            <div className="col-md-6">
              <DropDown
                options={costTypeOptions}
                formik={formik}
                isRequired={mode !== 'view'}
                disabled={mode === 'view'}
                label="LBL_COST_TYPE"
                accessor="costTypeSelect"
                // translate={unitTypeSelect.mode === 'enum'}
                keys={{ valueKey: 'value', titleKey: 'name' }}
                mode={mode}
              />
            </div>
            {formik.values.costTypeSelect !== '5' && formik.values.costTypeSelect !== 5 && (
              <div className="col-md-6">
                <NumberInput
                  formik={formik}
                  label="LBL_COST_PRICE"
                  accessor="costPrice"
                  mode={mode}
                  isRequired={mode !== 'view'}
                  disabled={formik.values.costTypeSelect !== '1' || mode === 'view'}
                />
              </div>
            )}
          </div>
          </Card>
        </>
        {mode !== 'view' && (
          <FormNotes
            notes={[
              {
                title: 'LBL_REQUIRED_NOTIFY',
                type: 3,
              },
            ]}
          />
        )}
      
      <AttachmentInput
        mode={mode}
        fetchedObj={data || null}
        parentSaveDone={parentSaveDone}
        feature={subFeature}
        alertHandler={alertHandler}
        successMessage="LBL_PRODUCT_SAVED"
        navigationParams={{ id: data?.id }}
      />

      <button type="submit" ref={btnRef} hidden></button>
    </form>
  );
};

export default ProductsForm;
