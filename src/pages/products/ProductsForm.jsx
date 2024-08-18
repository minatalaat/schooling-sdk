import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

import SearchModalAxelor from '../../components/ui/inputs/SearchModal/SearchModalAxelor';
import TextInput from '../../components/ui/inputs/TextInput';
import BorderSection from '../../components/ui/inputs/BorderSection';
import DropDown from '../../components/ui/inputs/DropDown';
import AttachmentInput from '../../components/ui/inputs/AttachmentInput';
import FileInput from '../../components/ui/inputs/FileInput';
import CheckboxInput from '../../components/ui/inputs/CheckboxInput';
import BarcodeInput from '../../components/ui/inputs/BarcodeInput';
import NumberInput from '../../components/ui/inputs/NumberInput';
import FormNotes from '../../components/ui/FormNotes';

import useMetaFields from '../../hooks/metaFields/useMetaFields';
import {
  saleAccountDomain,
  purchaseAccountDomain,
  saleTaxDomain,
  purchaseTaxDomain,
  defaultSaleTaxDomain,
  defaultPurchaseTaxDomain,
  defaultCurrencyDomain,
  costTypeOptions,
} from './ProductsPayloadsFields';
import { MODELS } from '../../constants/models';
import { handleChange, setFieldValue } from '../../utils/formHelpers';
import { useTaxesServices } from '../../services/apis/useTaxesServices';

const ProductsForm = ({
  formik,
  mode,
  alertHandler,
  isService,
  setIsService,
  parentSaveDone,
  subFeature,
  fetchedProduct,
  isBarcodeActive,
  getCostPricePayload,
  getCostPrice,
  canChange,
  stockMangamentAvaiable,
}) => {
  const { t } = useTranslation();

  const productTypeSelect = useMetaFields('product.product.type.select');
  const { searchTaxLineService } = useTaxesServices();

  const onProductTypeChange = e => {
    let value = e.target.value;

    if (value === 'service') {
      setIsService(true);
    } else {
      setIsService(false);
    }

    handleChange(formik, e, value);
  };

  const onUnitsSuccess = response => {
    let status = response.data.status;
    let data = response.data.data || [];
    let total = response.data.total;

    if (status !== 0 || total === undefined || total === null) {
      return alertHandler('Error', 'LBL_ERROR_LOADING_UNITS');
    }

    return { displayedData: [...data], total: response?.data?.total || 0 };
  };

  const onPurchaseAccountSuccess = response => {
    let status = response.data.status;
    let data = response.data.data || [];
    let total = response.data.total;

    if (status !== 0 || total === undefined || total === null) {
      return alertHandler('Error', 'LBL_ERROR_LOADING_ACCOUNTS');
    }

    return { displayedData: [...data], total: response?.data?.total || 0 };
  };

  const onSaleAccountSuccess = response => {
    let status = response.data.status;
    let data = response.data.data || [];
    let total = response.data.total;

    if (status !== 0 || total === undefined || total === null) {
      return alertHandler('Error', 'LBL_ERROR_LOADING_ACCOUNTS');
    }

    return { displayedData: [...data], total: response?.data?.total || 0 };
  };

  const onTaxesSearchSuccess = async response => {
    let status = response.data.status;
    let data = response.data.data || [];
    let total = response.data.total;
    let tempTaxes = [];

    if (status !== 0 || total === undefined || total === null) {
      alertHandler('Error', 'LBL_ERROR_LOADING_TAXES');
      return { displayedData: tempTaxes, total: response.data.total || 0 };
    }

    if (response.data.total > 0) {
      for (let tax of data) {
        let newTax = { ...tax };

        if (newTax?.taxLineList?.length > 0) {
          const taxLineResponse = await searchTaxLineService(newTax.id, newTax.taxLineList[0].id);

          newTax.rate = taxLineResponse.data[0].value;
        }

        tempTaxes.push(newTax);
      }

      return { displayedData: tempTaxes, total: response.data.total || 0 };
    }
  };

  const checkCostType = async () => {
    let fetchedCostTypeSelect = fetchedProduct?.costTypeSelect.toString();

    if (
      mode === 'edit' &&
      fetchedProduct &&
      parseInt(formik.values.costTypeSelect) !== 0 &&
      formik.values.costTypeSelect !== fetchedCostTypeSelect
    ) {
      let checkCanChange = await canChange();

      if (!checkCanChange) {
        setFieldValue(formik, 'costTypeSelect', fetchedCostTypeSelect);
        alertHandler('Error', t('CANNOT_CHANGE_COST_TYPE'));
      }
    }

    let tempCostPrice = await getCostPrice();
    setFieldValue(formik, 'costPrice', tempCostPrice || '0.00');
  };

  useEffect(() => {
    if (stockMangamentAvaiable) {
      checkCostType();
    }
  }, [formik.values.costTypeSelect]);

  return (
    <>
      <div className="card">
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
                  options={productTypeSelect.list}
                  formik={formik}
                  isRequired={true}
                  label="LBL_PRODUCT_TYPE"
                  accessor="productTypeSelect"
                  translate={productTypeSelect.mode === 'enum'}
                  keys={{ valueKey: 'value', titleKey: 'label' }}
                  mode={mode}
                  onChange={onProductTypeChange}
                  type={productTypeSelect.data?.type}
                />
              </div>
              <div className="col-md-6">
                <SearchModalAxelor
                  formik={formik}
                  modelKey="UNITS"
                  mode={mode}
                  onSuccess={onUnitsSuccess}
                  isRequired={!isService}
                  disabled={isService}
                  defaultValueConfig={null}
                />
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
              parentId={fetchedProduct?.id}
              fileId={fetchedProduct?.picture?.id}
              tableModel={MODELS.PRODUCT}
            />
          </div>
        </div>
        {isBarcodeActive && (
          <>
            <BorderSection title="LBL_PRODUCT_BARCODE" />
            <div className="row">
              <div className="col-md-3">
                <TextInput formik={formik} label="LBL_SERIAL_NUMBER" accessor="serialNumber" mode={mode} />
              </div>
              {fetchedProduct?.serialNumber && (
                <div className="col-md-3">
                  <BarcodeInput
                    formik={formik}
                    mode={mode}
                    identifier="barCode"
                    alertHandler={alertHandler}
                    parentId={fetchedProduct?.id}
                    fileId={fetchedProduct?.barCode?.id}
                    tableModel={MODELS.PRODUCT}
                  />
                </div>
              )}
            </div>
          </>
        )}
        {(formik.values.purchasable || formik.values.sellable) && <BorderSection title="LBL_ACCOUNTING" />}

        {formik.values.sellable && (
          <>
            <div className="row step-add-product-2">
              <div className="col-md-6">
                <SearchModalAxelor
                  formik={formik}
                  modelKey="SALE_CURRENCIES"
                  mode="add"
                  disabled={true}
                  defaultValueConfig={{ payloadDomain: defaultCurrencyDomain }}
                  payloadDomain={defaultCurrencyDomain}
                />
              </div>
              <div className="col-md-6">
                <NumberInput formik={formik} label="LBL_SALE_PRICE" accessor="salePrice" mode={mode} isRequired={formik.values.sellable} />
              </div>
              <div className="col-md-6">
                <SearchModalAxelor
                  formik={formik}
                  modelKey="SALE_ACCOUNTS"
                  mode={mode}
                  onSuccess={onSaleAccountSuccess}
                  isRequired={formik.values.sellable}
                  payloadDomain={saleAccountDomain}
                  selectIdentifier="label"
                  defaultValueConfig={null}
                />
              </div>
              <div className="col-md-6">
                <SearchModalAxelor
                  formik={formik}
                  modelKey="SALE_TAXES"
                  mode={mode}
                  onSuccess={onTaxesSearchSuccess}
                  isRequired={formik.values.sellable}
                  payloadDomain={saleTaxDomain}
                  defaultValueConfig={{ payloadDomain: defaultSaleTaxDomain }}
                  extraFields={['taxLineList']}
                />
              </div>
            </div>
          </>
        )}
        {formik.values.sellable && formik.values.purchasable && <div className="border-section"></div>}
        {formik.values.purchasable && (
          <>
            <div className="row step-add-product-3">
              <div className="col-md-6">
                <SearchModalAxelor
                  formik={formik}
                  modelKey="PURCHASE_CURRENCIES"
                  mode="add"
                  disabled={true}
                  defaultValueConfig={{ payloadDomain: defaultCurrencyDomain }}
                  payloadDomain={defaultCurrencyDomain}
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
                <SearchModalAxelor
                  formik={formik}
                  modelKey="PURCHASE_ACCOUNTS"
                  mode={mode}
                  onSuccess={onPurchaseAccountSuccess}
                  isRequired={formik.values.purchasable}
                  payloadDomain={purchaseAccountDomain}
                  selectIdentifier="label"
                  defaultValueConfig={null}
                />
              </div>
              <div className="col-md-6">
                <SearchModalAxelor
                  formik={formik}
                  modelKey="PURCHASE_TAXES"
                  mode={mode}
                  onSuccess={onTaxesSearchSuccess}
                  isRequired={formik.values.purchasable}
                  payloadDomain={purchaseTaxDomain}
                  defaultValueConfig={{ payloadDomain: defaultPurchaseTaxDomain }}
                  extraFields={['taxLineList']}
                />
              </div>
            </div>
          </>
        )}
        {stockMangamentAvaiable && (
          <>
            <BorderSection title="LBL_COST_MANAGEMENT" />
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
          </>
        )}

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
      </div>
      <AttachmentInput
        mode={mode}
        modelKey={MODELS.PRODUCT}
        fetchedObj={fetchedProduct || null}
        parentSaveDone={parentSaveDone}
        feature={subFeature}
        alertHandler={alertHandler}
        successMessage="LBL_PRODUCT_SAVED"
        navigationParams={{ id: fetchedProduct?.id }}
      />
    </>
  );
};

export default ProductsForm;
