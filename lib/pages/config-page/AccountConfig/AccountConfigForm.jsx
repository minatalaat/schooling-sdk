import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import SearchModalAxelor from '../../../components/ui/inputs/SearchModal/SearchModalAxelor';

import { useAxiosFunction } from '../../../hooks/useAxios';
import { MODELS } from '../../../constants/models';
import { getModelUrl } from '../../../services/getUrl';
import { useFormikSubmit } from '../../../hooks/useFormikSubmit';
import FormNotes from '../../../components/ui/FormNotes';
import { useFeatures } from '../../../hooks/useFeatures';

function AccountConfigForm({ data, isSave, finishedSaveHandler, setActionInProgress, alertHandler, fetchCompanyAccountConfig }) {
  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  const { isFeatureAvailable } = useFeatures();
  const stockMangamentAvaiable = useMemo(() => {
    return isFeatureAvailable({ featureCode: '12' });
  }, []);
  const saleAccountDomain = "self.accountType.technicalTypeSelect = 'income' AND self.statusSelect = 1";
  const purchaseAccountDomain =
    " (self.accountType.technicalTypeSelect = 'charge' OR self.accountType.technicalTypeSelect = 'debt' OR self.accountType.technicalTypeSelect = 'immobilisation') AND self.statusSelect = 1";
  const inventoryAccountDomain = "self.accountType.technicalTypeSelect = 'asset' AND self.statusSelect = 1";
  const costOfGoodSoldAccountDomain = "self.accountType.technicalTypeSelect = 'charge' AND self.statusSelect = 1";
  const purchaseGainLossAccountDomain = "self.accountType.technicalTypeSelect = 'charge' AND self.statusSelect = 1";
  const stockVarianceAccountDomain = "self.accountType.technicalTypeSelect = 'charge' AND self.statusSelect = 1";

  const initialValues = {
    defaultSaleAccount: data?.defaultSaleAccount ?? null,
    defaultPurchaseAccount: data?.defaultPurchaseAccount ?? null,
    defaultInventoryAccount: data?.defaultInventoryAccount ?? null,
    defaultCostOfGoodSoldAccount: data?.defaultCostOfGoodSoldAccount ?? null,
    defaultPurchaseGainLossAccount: data?.defaultPurchaseGainLossAccount ?? null,
    defaultInventoryVarianceAccount: data?.defaultInventoryVarianceAccount ?? null,
  };

  const valSchema = Yup.object().shape({
    defaultSaleAccount: Yup.object().nullable().required(t('REQUIRED')),
    defaultPurchaseAccount: Yup.object().nullable().required(t('REQUIRED')),
    defaultInventoryAccount: Yup.object().nullable().required(t('REQUIRED')),
    defaultCostOfGoodSoldAccount: Yup.object().nullable().required(t('REQUIRED')),
    defaultPurchaseGainLossAccount: Yup.object().nullable().required(t('REQUIRED')),
    defaultInventoryVarianceAccount: Yup.object().nullable().required(t('REQUIRED')),
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
        defaultSaleAccount: formik.values.defaultSaleAccount,
        defaultPurchaseAccount: formik.values.defaultPurchaseAccount,
        defaultInventoryAccount: formik.values.defaultInventoryAccount,
        defaultCostOfGoodSoldAccount: formik.values.defaultCostOfGoodSoldAccount,
        defaultPurchaseGainLossAccount: formik.values.defaultPurchaseGainLossAccount,
        defaultInventoryVarianceAccount: formik.values.defaultInventoryVarianceAccount,
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
    fetchCompanyAccountConfig();
    finishedSaveHandler('Success', t('APP_COMPANY_ACCOUNTS_CONFIG_SAVED_SUCCESSULLY'));
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

  return (
    <>
      <div className="card">
        <div className="row">
          <div className="col-md-6">
            <SearchModalAxelor
              formik={formik}
              modelKey="DEFAULT_PURCHASE_ACCOUNTS"
              mode="edit"
              onSuccess={onAccountSuccess}
              isRequired={true}
              payloadDomain={purchaseAccountDomain}
              selectIdentifier="label"
              defaultValueConfig={null}
            />
          </div>
          <div className="row">
            <div className="col-md-6">
              <SearchModalAxelor
                formik={formik}
                modelKey="DEFAULT_SALE_ACCOUNTS"
                mode="edit"
                onSuccess={onAccountSuccess}
                isRequired={true}
                payloadDomain={saleAccountDomain}
                selectIdentifier="label"
                defaultValueConfig={null}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <SearchModalAxelor
                formik={formik}
                modelKey="DEFAULT_PURCHASE_GAIN_LOSS_ACCOUNTS"
                mode="edit"
                onSuccess={onAccountSuccess}
                isRequired={true}
                payloadDomain={purchaseGainLossAccountDomain}
                selectIdentifier="label"
                defaultValueConfig={null}
              />
            </div>
            {stockMangamentAvaiable && (
              <>
                <div className="row">
                  <div className="col-md-6">
                    <SearchModalAxelor
                      formik={formik}
                      modelKey="INVENTORY_ACCOUNTS"
                      mode="edit"
                      onSuccess={onAccountSuccess}
                      isRequired={true}
                      payloadDomain={inventoryAccountDomain}
                      selectIdentifier="label"
                      defaultValueConfig={null}
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <SearchModalAxelor
                      formik={formik}
                      modelKey="COST_OF_GOOD_SOLD_ACCOUNTS"
                      mode="edit"
                      onSuccess={onAccountSuccess}
                      isRequired={true}
                      payloadDomain={costOfGoodSoldAccountDomain}
                      selectIdentifier="label"
                      defaultValueConfig={null}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <SearchModalAxelor
                      formik={formik}
                      modelKey="DEFAULT_INVENTORY_VARIANCE_ACCOUNT"
                      mode="edit"
                      onSuccess={onAccountSuccess}
                      isRequired={true}
                      payloadDomain={stockVarianceAccountDomain}
                      selectIdentifier="label"
                      defaultValueConfig={null}
                    />
                  </div>
                </div>
              </>
            )}
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

export default AccountConfigForm;
