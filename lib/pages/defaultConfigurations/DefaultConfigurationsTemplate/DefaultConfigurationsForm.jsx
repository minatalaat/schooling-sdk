import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import SearchModalAxelor from '../../../components/ui/inputs/SearchModal/SearchModalAxelor';
import FormNotes from '../../../components/ui/FormNotes';

import { useAxiosFunction } from '../../../hooks/useAxios';
import { getModelUrl } from '../../../services/getUrl';
import { useFormikSubmit } from '../../../hooks/useFormikSubmit';
import { useTaxesServices } from '../../../services/apis/useTaxesServices';
import {
  saleAccountDomain,
  purchaseAccountDomain,
  saleTaxDomain,
  purchaseTaxDomain,
  defaultSaleTaxDomain,
  defaultPurchaseTaxDomain,
  defaultCurrencyDomain,
  inPaymentModeDomain,
  outPaymentModeDomain,
} from '../../../constants/DefaultConfigDomains';

function DefaultConfigurationsForm({
  defaultConfig,
  data,
  isSave,
  finishedSaveHandler,
  setActionInProgress,
  alertHandler,
  getDefaultConfiguration,
}) {
  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  const { searchTaxLineService } = useTaxesServices();

  const initialValues = {
    saleAccount: data?.saleAccount ?? null,
    purchaseAccount: data?.purchaseAccount ?? null,
    saleCurrency: data?.saleCurrency ?? null,
    purchaseCurrency: data?.purchaseCurrency ?? null,
    saleTax: data?.saleTax ?? null,
    purchaseTax: data?.purchaseTax ?? null,
    inPaymentMode: data?.inPaymentMode ?? null,
    outPaymentMode: data?.outPaymentMode ?? null,
    paymentCondition: data?.paymentCondition ?? null,
    customerAccount: data?.customerAccount ?? null,
    supplierAccount: data?.supplierAccount ?? null,
    customerAddress: data?.customerAddress ?? null,
    supplierAddress: data?.supplierAddress ?? null,
    integratorCode: defaultConfig.fields?.integratorCode,
  };

  const valSchema = Yup.object().shape({
    saleAccount: Yup.object()
      .nullable()
      .when([], {
        is: () => defaultConfig.fields.saleAccount,
        then: Yup.object().nullable().required(t('REQUIRED')),
      }),
    purchaseAccount: Yup.object()
      .nullable()
      .when([], {
        is: () => defaultConfig.fields.purchaseAccount,
        then: Yup.object().nullable().required(t('REQUIRED')),
      }),
    saleCurrency: Yup.object().nullable(),
    purchaseCurrency: Yup.object().nullable(),
    saleTax: Yup.object()
      .nullable()
      .when([], {
        is: () => defaultConfig.fields.saleTax,
        then: Yup.object().nullable().required(t('REQUIRED')),
      }),
    purchaseTax: Yup.object()
      .nullable()
      .when([], {
        is: () => defaultConfig.fields.purchaseTax,
        then: Yup.object().nullable().required(t('REQUIRED')),
      }),
    inPaymentMode: Yup.object()
      .nullable()
      .when([], {
        is: () => defaultConfig.fields.inPaymentMode,
        then: Yup.object().nullable().required(t('REQUIRED')),
      }),
    outPaymentMode: Yup.object()
      .nullable()
      .when([], {
        is: () => defaultConfig.fields.outPaymentMode,
        then: Yup.object().nullable().required(t('REQUIRED')),
      }),
    paymentCondition: Yup.object()
      .nullable()
      .when([], {
        is: () => defaultConfig.fields.paymentCondition,
        then: Yup.object().nullable().required(t('REQUIRED')),
      }),
    customerAccount: Yup.object()
      .nullable()
      .when([], {
        is: () => defaultConfig.fields.customerAccount,
        then: Yup.object().nullable().required(t('REQUIRED')),
      }),
    supplierAccount: Yup.object()
      .nullable()
      .when([], {
        is: () => defaultConfig.fields.supplierAccount,
        then: Yup.object().nullable().required(t('REQUIRED')),
      }),
    customerAddress: Yup.object()
      .nullable()
      .when([], {
        is: () => defaultConfig.fields.customerAddress,
        then: Yup.object().nullable().required(t('REQUIRED')),
      }),
    supplierAddress: Yup.object()
      .nullable()
      .when([], {
        is: () => defaultConfig.fields.supplierAddress,
        then: Yup.object().nullable().required(t('REQUIRED')),
      }),
  });

  const formik = useFormik({
    initialValues,
    validationSchema: valSchema,
    validateOnMount: true,
  });

  const { validateFormForSubmit } = useFormikSubmit(formik, alertHandler);

  const getSavePayload = () => {
    let payload = {
      data: {
        saleAccount: formik.values.saleAccount ?? null,
        purchaseAccount: formik.values.purchaseAccount ?? null,
        saleCurrency: formik.values.saleCurrency ?? null,
        purchaseCurrency: formik.values.purchaseCurrency ?? null,
        saleTax: formik.values.saleTax ?? null,
        purchaseTax: formik.values.purchaseTax ?? null,
        inPaymentMode: formik.values.inPaymentMode ?? null,
        outPaymentMode: formik.values.outPaymentMode ?? null,
        paymentCondition: formik.values.paymentCondition ?? null,
        customerAccount: formik.values.customerAccount ?? null,
        supplierAccount: formik.values.supplierAccount ?? null,
        customerAddress: formik.values.customerAddress ?? null,
        supplierAddress: formik.values.supplierAddress ?? null,
        integratorCode: formik.values.integratorCode,
        version: data?.version ?? undefined,
        id: data?.id || null,
      },
    };
    return payload;
  };

  const saveRecord = async () => {
    const isValid = await validateFormForSubmit();
    if (!isValid) return null;
    setActionInProgress(true);
    const saveModelReposnse = await api('POST', getModelUrl(defaultConfig.modelName), getSavePayload());
    if (saveModelReposnse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    getDefaultConfiguration();
    finishedSaveHandler('Success', t(defaultConfig.messages.saveSuccessMessage));
  };

  useEffect(() => {
    if (isSave) {
      saveRecord();
    }
  }, [isSave]);

  const onAccountSuccess = response => {
    let status = response.data.status;
    let data = response.data.data || [];
    let total = response.data.total;

    if (status !== 0 || total === undefined || total === null) {
      return alertHandler('Error', t('LBL_ERROR_LOADING_ACCOUNTS'));
    }

    return { displayedData: [...data], total: response?.data?.total || 0 };
  };

  const onTaxesSearchSuccess = async response => {
    let status = response.data.status;
    let data = response.data.data || [];
    let total = response.data.total;

    if (status !== 0 || total === undefined || total === null) {
      return alertHandler('Error', t('LBL_ERROR_LOADING_TAXES'));
    }

    let tempTaxes = [];

    for (let tax of data) {
      let newTax = { ...tax };

      if (newTax?.taxLineList?.length > 0) {
        const taxLineResponse = await searchTaxLineService(newTax.id, newTax.taxLineList[0].id);

        newTax.rate = taxLineResponse.data[0].value;
      }

      tempTaxes.push(newTax);
    }

    return { displayedData: tempTaxes, total: response.data.total || 0 };
  };

  const onPaymentConditionSuccess = response => {
    let status = response.data.status;
    let data = response.data.data || [];
    let total = response.data.total;

    if (status !== 0 || total === undefined || total === null) {
      return alertHandler('Error', t('LBL_ERROR_LOADING_PAYMENT_CONDITIONS'));
    }

    let paymentConditions = [];

    if (data) {
      data.forEach(paymentCondition => {
        paymentConditions.push({
          id: paymentCondition.id,
          name: paymentCondition.name,
          code: paymentCondition.code,
          type: paymentCondition.typeSelect,
        });
      });
    }

    return { displayedData: [...paymentConditions], total: response.data.total || 0 };
  };
  
  return (
    <>
      <div className="card">
        <div className="row">
          {defaultConfig.fields.purchaseAccount && (
            <div className="col-md-6">
              <SearchModalAxelor
                formik={formik}
                modelKey="PURCHASE_ACCOUNTS"
                mode="edit"
                onSuccess={onAccountSuccess}
                isRequired={true}
                payloadDomain={purchaseAccountDomain}
                selectIdentifier="label"
                defaultValueConfig={null}
              />
            </div>
          )}
          {defaultConfig.fields.saleAccount && (
            <div className="col-md-6">
              <SearchModalAxelor
                formik={formik}
                modelKey="SALE_ACCOUNTS"
                mode="edit"
                onSuccess={onAccountSuccess}
                isRequired={true}
                payloadDomain={saleAccountDomain}
                selectIdentifier="label"
                defaultValueConfig={null}
              />
            </div>
          )}
          {defaultConfig.fields.purchaseTax && (
            <div className="col-md-6">
              <SearchModalAxelor
                formik={formik}
                modelKey="PURCHASE_TAXES"
                mode="edit"
                onSuccess={onTaxesSearchSuccess}
                isRequired={true}
                payloadDomain={purchaseTaxDomain}
                defaultValueConfig={{ payloadDomain: defaultPurchaseTaxDomain }}
                extraFields={['taxLineList']}
              />
            </div>
          )}
          {defaultConfig.fields.saleTax && (
            <div className="col-md-6">
              <SearchModalAxelor
                formik={formik}
                modelKey="SALE_TAXES"
                mode="edit"
                onSuccess={onTaxesSearchSuccess}
                isRequired={true}
                payloadDomain={saleTaxDomain}
                defaultValueConfig={{ payloadDomain: defaultSaleTaxDomain }}
                extraFields={['taxLineList']}
              />
            </div>
          )}
          {defaultConfig.fields.purchaseCurrency && (
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
          )}
          {defaultConfig.fields.saleCurrency && (
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
          )}
          {defaultConfig.fields.inPaymentMode && (
            <div className="col-md-6">
              <SearchModalAxelor
                formik={formik}
                modelKey="IN_PAYMENT_MODES"
                mode="edit"
                isRequired={true}
                payloadDomain={inPaymentModeDomain}
                extraFields={['inOutSelect']}
              />
            </div>
          )}
          {defaultConfig.fields.outPaymentMode && (
            <div className="col-md-6">
              <SearchModalAxelor
                formik={formik}
                modelKey="OUT_PAYMENT_MODES"
                mode="edit"
                isRequired={true}
                payloadDomain={outPaymentModeDomain}
                extraFields={['inOutSelect']}
              />
            </div>
          )}
          {defaultConfig.fields.paymentCondition && (
            <div className="col-md-6">
              <SearchModalAxelor
                formik={formik}
                modelKey="PAYMENT_CONDITIONS"
                mode="edit"
                onSuccess={onPaymentConditionSuccess}
                isRequired={true}
              />
            </div>
          )}
          {defaultConfig.fields.customerAccount && (
            <div className="col-md-6">
              <SearchModalAxelor
                formik={formik}
                modelKey="CUSTOMER_ACCOUNTS"
                mode="edit"
                isRequired={true}
                onSuccess={onAccountSuccess}
                tooltip="customerAccount"
                payloadDomain={defaultConfig.domains?.customerAccountDomain}
                selectIdentifier="label"
              />
            </div>
          )}
          {defaultConfig.fields.supplierAccount && (
            <div className="col-md-6">
              <SearchModalAxelor
                formik={formik}
                modelKey="SUPPLIER_ACCOUNTS"
                mode="edit"
                isRequired={true}
                onSuccess={onAccountSuccess}
                tooltip="supplierAccount"
                payloadDomain={defaultConfig.domains?.supplierAccountDomain}
                selectIdentifier="label"
              />
            </div>
          )}
          {defaultConfig.fields.customerAddress && (
            <div className="col-md-6">
              <SearchModalAxelor
                formik={formik}
                modelKey="CUSTOMER_ADDRESS"
                mode="edit"
                isRequired={true}
                defaultValueConfig={false}
                selectIdentifier="fullName"
              />
            </div>
          )}
          {defaultConfig.fields.supplierAddress && (
            <div className="col-md-6">
              <SearchModalAxelor
                formik={formik}
                modelKey="SUPPLIER_ADDRESS"
                mode="edit"
                isRequired={true}
                defaultValueConfig={false}
                selectIdentifier="fullName"
              />
            </div>
          )}
        </div>
        <FormNotes
          notes={[
            {
              title: 'LBL_REQUIRED_NOTIFY',
              type: 3,
            },
          ]}
        />
      </div>
    </>
  );
}

export default DefaultConfigurationsForm;
