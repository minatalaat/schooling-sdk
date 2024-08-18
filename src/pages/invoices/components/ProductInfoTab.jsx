import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { roundTo } from 'round-to';

import SearchModalAxelor from '../../../components/ui/inputs/SearchModal/SearchModalAxelor';
import TextInput from '../../../components/ui/inputs/TextInput';
import TextArea from '../../../components/ui/inputs/TextArea';
import NumberInput from '../../../components/ui/inputs/NumberInput';
import ToggleSwitch from '../../../components/ui/inputs/ToggleSwitch';

import { parseFloatFixedTwo, formatFloatNumber } from '../../../utils/helpers';
import { setFieldValue } from '../../../utils/formHelpers';
import { useFeatures } from '../../../hooks/useFeatures';

const ProductInfoTab = ({ formik, edit, currentLine, calculateAmountWithoutTax, defaultUnit, stockLocation, parentModel, fromPO_SO }) => {
  const { t } = useTranslation();
  const { isFeatureAvailable } = useFeatures();

  const invoicesLines = useSelector(state => state.invoiceLines.invoiceLines);

  const purchasableProductDomain =
    "self.isModel = false AND self.dtype = 'Product' AND self.purchasable = true AND self.isActivity = false";
  const sellableProductDomain = "self.isModel = false AND self.dtype = 'Product' AND self.sellable = true AND self.isActivity = false";
  const depreciationAccountDomain = "self.accountType.technicalTypeSelect = 'immobilisation' AND self.statusSelect = 1";
  const purchaseTaxDomain = 'self.tax.typeSelect in (2)';
  const saleTaxDomain = 'self.tax.typeSelect in (1)';

  const fixedAssetAvailable = useMemo(() => {
    return isFeatureAvailable({ featureCode: '14' });
  }, []);

  const onProductSearchSuccess = response => {
    if (response.data.status === 0) {
      let data = response.data.data;
      let products = [];

      if (data) {
        data.forEach(product => {
          let temp = {
            id: product?.id ?? null,
            picture: product?.picture ?? '',
            code: product?.code ?? '',
            name: product?.name ?? '',
            fullName: product?.fullName ?? '',
            type: 'Product',
            productCode: product?.code ?? '',
            productName: product?.name ?? '',
            productCategory: product?.productCategory ?? '',
            accountingFamily: product?.accountingFamily ?? '',
            salePrice: product?.salePrice ?? '',
            unit: product?.unit?.name ?? '',
            internalDescription: product?.internalDescription ?? '',
            productTypeSelect: product?.productTypeSelect ?? '',
            serialNumber: product?.serialNumber ?? '',
            availableQty: product && product.$availableQty ? parseFloat(product.$availableQty).toFixed(2).toString() : '0.00',
          };
          products.push(temp);
        });
      }

      return { displayedData: [...products], total: response.data.total || 0 };
    }
  };

  const onUnitSearchsSuccess = response => {
    if (response.data.status === 0) {
      let data = response.data.data;
      let units = [];

      if (data) {
        data.forEach(unit => {
          let temp = {
            id: unit?.id ?? null,
            name: unit?.name ?? '',
            labelToPrinting: unit?.labelToPrinting ?? '',
            unitTypeSelect: unit?.unitTypeSelect,
          };
          units.push(temp);
        });
      }

      return { displayedData: [...units], total: response.data.total || 0 };
    }
  };

  const onTaxLinesSearchsSuccess = response => {
    if (response.data.status === 0) {
      let data = response.data.data;
      let taxLines = [];

      if (data) {
        data.forEach(taxLine => {
          let temp = {
            id: taxLine?.id ?? -1,
            name: taxLine?.name ?? '',
            value: taxLine?.value ?? '',
            startDate: taxLine?.startDate ?? '',
            endDate: taxLine?.endDate ?? '',
          };
          taxLines.push(temp);
        });
      }

      return { displayedData: [...taxLines], total: response.data.total || 0 };
    }
  };

  const onAccountsSearchSuccess = response => {
    if (response.data.status === 0) {
      let responseData = response.data.data || [];
      return { displayedData: [...responseData], total: response.data.total || 0 };
    }
  };

  const onFixedAssetCategorySuccess = response => {
    if (response.data.status === 0) {
      let responseData = response.data.data || [];
      let tempData = [];

      if (responseData) {
        responseData.forEach(item => {
          let listItem = { ...item };
          listItem.fixedAssetType = listItem?.fixedAssetType?.name;
          tempData.push(listItem);
        });
      }

      return { displayedData: [...tempData], total: response.data.total || 0 };
    }
  };

  const onFixedAssetsClick = async e => {
    if (e.target.checked) {
      setFieldValue(formik, 'quantity', parseFloatFixedTwo(1));
      setFieldValue(formik, 'unit', defaultUnit || null);
    }
  };

  const formatTaxFloatNumber = useMemo(() => {
    if (!formik.values.tax) return '';

    const amountWithoutTax = roundTo(+calculateAmountWithoutTax(), 2);
    const tax = parseFloat(formik.values.tax.name.split(':')[1]);
    const taxAmount = roundTo(+amountWithoutTax * (tax > 0 ? tax : 0), 2);

    return formatFloatNumber(roundTo(+amountWithoutTax + +taxAmount, 2));
  }, [formik.values.tax, formik.values.quantity, formik.values.unitPrice]);

  const formatWithoutTaxFloatNumber = useMemo(() => {
    return formatFloatNumber(calculateAmountWithoutTax());
  }, [formik.values.quantity, formik.values.unitPrice]);

  return (
    <div className="container">
      <div className="row">
        {formik.values.isClassic && (stockLocation === null || stockLocation === undefined) && (
          <div className="col-md-6">
            <SearchModalAxelor
              formik={formik}
              modelKey="PRODUCTS"
              mode={edit ? 'edit' : 'add'}
              isRequired={formik.values.isClassic && !fromPO_SO}
              disabled={formik.values.hasOriginal || fromPO_SO}
              onSuccess={onProductSearchSuccess}
              selectIdentifier="fullName"
              originalData={
                !formik.values.isClassic ? null : edit && invoicesLines && invoicesLines.length > 0 ? currentLine.product : null
              }
              tooltip={formik.values.isPurchase ? 'purchasableProduct' : 'sellableProduct'}
              payloadDomain={formik.values.isPurchase ? purchasableProductDomain : sellableProductDomain}
              defaultValueConfig={null}
              extraFields={['fullName', 'productTypeSelect']}
            />
          </div>
        )}
        {formik.values.isClassic && stockLocation && (
          <div className="col-md-6">
            <SearchModalAxelor
              formik={formik}
              modelKey="PRODUCTS_WITH_QUANTITY"
              mode={edit ? 'edit' : 'add'}
              isRequired={formik.values.isClassic && !fromPO_SO}
              disabled={formik.values.hasOriginal || fromPO_SO}
              onSuccess={onProductSearchSuccess}
              selectIdentifier="fullName"
              originalData={
                !formik.values.isClassic ? null : edit && invoicesLines && invoicesLines.length > 0 ? currentLine?.product ?? null : null
              }
              tooltip={formik.values.isPurchase ? 'purchasableProduct' : 'sellableProduct'}
              payloadDomain={formik.values.isPurchase ? purchasableProductDomain : sellableProductDomain}
              payloadDomainContext={{
                _parent: {
                  stockLocation: stockLocation,
                },
                _xFillProductAvailableQty: true,
                _model: parentModel,
              }}
              defaultValueConfig={null}
              extraFields={['fullName', 'productTypeSelect']}
            />
          </div>
        )}
        <div className="col-md-6">
          <TextInput
            formik={formik}
            label="LBL_PRODUCT_NAME"
            accessor="productName"
            mode={edit ? 'edit' : 'add'}
            disabled={formik.values.hasOriginal || fromPO_SO}
            isRequired={!formik.values.isClassic && !fromPO_SO}
          />
        </div>
        {formik.values.isPurchase && !formik.values.isClassic && fixedAssetAvailable && (
          <div className="col-md-6">
            <ToggleSwitch
              formik={formik}
              label="LBL_FIXED_ASSETS"
              accessor="fixedAssets"
              mode={edit ? 'edit' : 'add'}
              onChange={onFixedAssetsClick}
            />
          </div>
        )}

        <div className="row">
          <div className="col-md-4">
            <NumberInput
              formik={formik}
              step={0.01}
              label="LBL_QUANTITY"
              accessor="quantity"
              mode={edit ? 'edit' : 'add'}
              isRequired={!formik.values.fixedAssets}
              onBlur={event => {
                setFieldValue(formik, 'quantity', Number(Number(event.target.value).toFixed(2)));
              }}
            />
          </div>
          <div className="col-md-4">
            <SearchModalAxelor
              formik={formik}
              modelKey="UNITS"
              mode={edit ? 'edit' : 'add'}
              isRequired={!formik.values.hasOriginal && !formik.values.fixedAssets && !fromPO_SO}
              disabled={formik.values.hasOriginal || formik.values.fixedAssets || fromPO_SO}
              onSuccess={onUnitSearchsSuccess}
              defaultValueConfig={null}
            />
          </div>
          <div className="col-md-4">
            <NumberInput
              formik={formik}
              label="LBL_UNIT_PRICE"
              accessor="unitPrice"
              mode={edit ? 'edit' : 'add'}
              isRequired={!fromPO_SO}
              tooltip={formik.values.isPurchase ? 'purchasingPrice' : 'sellingPrice'}
              step={0.01}
              disabled={formik.values.hasOriginal || fromPO_SO}
            />
          </div>
          <div className="col-md-6">
            <SearchModalAxelor
              formik={formik}
              modelKey="TAX_LINES"
              mode={edit ? 'edit' : 'add'}
              isRequired={!formik.values.hasOriginal && !fromPO_SO}
              disabled={formik.values.hasOriginal || fromPO_SO}
              onSuccess={onTaxLinesSearchsSuccess}
              payloadDomain={formik.values.isPurchase ? purchaseTaxDomain : saleTaxDomain}
              defaultValueConfig={null}
              extraFields={['name']}
            />
          </div>
          <div className="col-md-3">
            <div className="info-total-ex">
              <p>{t('LBL_TOTAL_WITHOUT_TAX')}</p>
              <h4>{formatWithoutTaxFloatNumber}</h4>
            </div>
          </div>
          <div className="col-md-3">
            <div className="info-total-ex">
              <p>{t('LBL_TOTAL_WITH_TAX')}</p>
              <h4>{formatTaxFloatNumber}</h4>
            </div>
          </div>
          {!formik.values.isPurchase && !formik.values.fixedAssets && (
            <div className="col-md-6">
              <SearchModalAxelor
                formik={formik}
                modelKey="ACCOUNTS"
                mode={edit ? 'edit' : 'add'}
                isRequired={!formik.values.isClassic}
                disabled={formik.values.isClassic}
                onSuccess={onAccountsSearchSuccess}
                tooltip="customerInvoiceAccount"
                defaultValueConfig={true}
                payloadDomain={`self.accountType.technicalTypeSelect IN ('income') AND self.statusSelect = 1`}
                selectIdentifier="label"
                extraFields={['analyticDistributionAuthorized']}
              />
            </div>
          )}
          {formik.values.isPurchase && !formik.values.fixedAssets && (
            <div className="col-md-6">
              <SearchModalAxelor
                formik={formik}
                modelKey="ACCOUNTS"
                mode={edit ? 'edit' : 'add'}
                isRequired={!formik.values.isClassic}
                disabled={formik.values.isClassic}
                onSuccess={onAccountsSearchSuccess}
                tooltip="supplierInvoiceAccount"
                payloadDomain={`self.accountType.technicalTypeSelect IN ('charge') AND self.statusSelect = 1`}
                selectIdentifier="label"
                defaultValueConfig={true}
              />
            </div>
          )}
          {formik.values.isPurchase && formik.values.fixedAssets && (
            <>
              <div className="row">
                <div className="col-md-6">
                  <SearchModalAxelor
                    formik={formik}
                    modelKey="ACCOUNTS"
                    mode={edit ? 'edit' : 'add'}
                    onSuccess={onAccountsSearchSuccess}
                    selectIdentifier="label"
                    isRequired={true}
                    payloadDomain={depreciationAccountDomain}
                    defaultValueConfig={true}
                  />
                </div>
                <div className="col-md-6">
                  <SearchModalAxelor
                    formik={formik}
                    modelKey="FIXED_ASSET_CATEGORIES"
                    mode={edit ? 'edit' : 'add'}
                    onSuccess={onFixedAssetCategorySuccess}
                    defaultValueConfig={true}
                    selectIdentifier="name"
                    isRequired={true}
                  />
                </div>
              </div>
            </>
          )}
          <div className="col-md-12">
            <TextArea formik={formik} label="LBL_DESCRIPTION" accessor="desc" mode={edit ? 'edit' : 'add'} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductInfoTab;
