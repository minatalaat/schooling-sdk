import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import ToggleSwitch from '../../../components/ui/inputs/ToggleSwitch';

import { useAxiosFunction } from '../../../hooks/useAxios';
import { MODELS } from '../../../constants/models';
import { getActionUrl, getModelUrl } from '../../../services/getUrl';
import SearchModalAxelor from '../../../components/ui/inputs/SearchModal/SearchModalAxelor';
import FormNotes from '../../../components/ui/FormNotes';

function BaseConfigForm({ data, isSave, finishedSaveHandler, setActionInProgress, alertHandler, fetchAppBase }) {
  const { t } = useTranslation();
  const { api } = useAxiosFunction();

  const initialValues = {
    activateBarCodeGeneration: data?.activateBarCodeGeneration ?? false,
    barcodeTypeConfig: data?.barcodeTypeConfig ?? null,
  };

  const valSchema = Yup.object().shape({
    activateBarCodeGeneration: Yup.boolean(),
    barcodeTypeConfig: Yup.object()
      .nullable()
      .when('activateBarCodeGeneration', {
        is: true,
        then: Yup.object().nullable().required(t('REQUIRED')),
      }),
  });

  const formik = useFormik({
    initialValues,
    validationSchema: valSchema,
    validateOnMount: true,
  });

  const getSavePayload = () => {
    let payload = {
      data: {
        activateBarCodeGeneration: formik.values.activateBarCodeGeneration,
        barcodeTypeConfig: formik.values.barcodeTypeConfig,
        version: data?.version ?? undefined,
        id: data?.id || null,
      },
    };
    return payload;
  };

  const getFirstActionPayload = action => {
    return {
      model: MODELS.APP_BASE,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: MODELS.APP_BASE,
          activateBarCodeGeneration: formik.values.activateBarCodeGeneration,
          barcodeTypeConfig: formik.values.barcodeTypeConfig,
          version: data?.version ?? undefined,
          id: data?.id || null,
        },
      },
    };
  };

  const saveRecord = async () => {
    if (formik.isValid) {
      setActionInProgress(true);
      let action = 'action-base-method-model-email-link-onsave';
      const firstActionResponse = await api('POST', getActionUrl(), getFirstActionPayload(action));
      if (firstActionResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      const saveModelReposnse = await api('POST', getModelUrl(MODELS.APP_BASE), getSavePayload());
      if (saveModelReposnse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      fetchAppBase();
      finishedSaveHandler('Success', t('APP_BASE_CONFIG_SAVED_SUCCESSULLY'));
    } else {
      alertHandler('Error', t('LBL_REQUIRED_FIELDS'));
    }
  };

  const onBarcodeTypesSearch = response => {
    let status = response.data.status;
    let data = response.data.data || [];
    let total = response.data.total;

    if (status === 0 && total !== null && total !== undefined) {
      return { displayedData: [...data], total: total || 0 };
    }
  };

  useEffect(() => {
    if (isSave) {
      saveRecord();
    }
  }, [isSave]);

  return (
    <>
      <div className="card">
        <div className="row">
          <div className="col-md-6">
            <ToggleSwitch
              formik={formik}
              label="LBL_ACTIVATE_BARCODE_GENERATION_FOR_PRODUCTS"
              accessor="activateBarCodeGeneration"
              mode="add"
            />
          </div>
          {formik.values.activateBarCodeGeneration && (
            <div className="col-md-6">
              <SearchModalAxelor
                formik={formik}
                modelKey="BARCODE_TYPE_CONFIGURATIONS"
                mode="add"
                onSuccess={onBarcodeTypesSearch}
                isRequired={formik.values.activateBarCodeGeneration}
                defaultValueConfig={null}
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

export default BaseConfigForm;
