import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import SearchModalAxelor from '../../../components/ui/inputs/SearchModal/SearchModalAxelor';
import FormNotes from '../../../components/ui/FormNotes';

import { useAxiosFunction } from '../../../hooks/useAxios';
import { MODELS } from '../../../constants/models';
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
} from '../../../constants/DefaultConfigDomains';

function ImportDefaultConfigForm({ data, isSave, finishedSaveHandler, setActionInProgress, alertHandler, fetchImportDefaultConfig }) {
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
  };

  const valSchema = Yup.object().shape({
    saleAccount: Yup.object().nullable().required(t('REQUIRED')),
    purchaseAccount: Yup.object().nullable().required(t('REQUIRED')),
    saleCurrency: Yup.object().nullable().required(t('REQUIRED')),
    purchaseCurrency: Yup.object().nullable().required(t('REQUIRED')),
    saleTax: Yup.object().nullable().required(t('REQUIRED')),
    purchaseTax: Yup.object().nullable().required(t('REQUIRED')),
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
    const saveModelReposnse = await api('POST', getModelUrl(MODELS.COMPANY_ACCOUNT_CONFIG), getSavePayload());
    if (saveModelReposnse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    fetchImportDefaultConfig();
    finishedSaveHandler('Success', t('CONFIGURATION.Import_DEFAULT_CONFIG_SAVED_SUCCESSULLY'));
  };

  useEffect(() => {
    if (isSave) {
      //   saveRecord();
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

  return (
    <>
      <div className="card">
        <div className="row">
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
            <SearchModalAxelor
              formik={formik}
              modelKey="SALE_CURRENCIES"
              mode="add"
              disabled={true}
              defaultValueConfig={{ payloadDomain: defaultCurrencyDomain }}
              payloadDomain={defaultCurrencyDomain}
            />
          </div>
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

export default ImportDefaultConfigForm;
