import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import ToggleSwitch from '../../../components/ui/inputs/ToggleSwitch';

import { useAxiosFunction } from '../../../hooks/useAxios';
import { MODELS } from '../../../constants/models';
import { getModelUrl } from '../../../services/getUrl';

function StockConfigForm({ data, isSave, finishedSaveHandler, setActionInProgress, alertHandler, fetchStockConfig }) {
  const { t } = useTranslation();
  const { api } = useAxiosFunction();

  const initialValues = {
    authRedirectPurchaseOrderToStockMove: data?.authRedirectPurchaseOrderToStockMove ?? null,
    authRedirectSaleOrderToStockMove: data?.authRedirectSaleOrderToStockMove ?? null,
  };

  const valSchema = Yup.object().shape({
    authRedirectPurchaseOrderToStockMove: Yup.boolean().nullable().required(t('REQUIRED')),
    authRedirectSaleOrderToStockMove: Yup.boolean().nullable().required(t('REQUIRED')),
  });

  const formik = useFormik({
    initialValues,
    validationSchema: valSchema,
    validateOnMount: true,
  });

  const getSavePayload = () => {
    let payload = {
      data: {
        authRedirectPurchaseOrderToStockMove: formik.values.authRedirectPurchaseOrderToStockMove,
        authRedirectSaleOrderToStockMove: formik.values.authRedirectSaleOrderToStockMove,
        version: data?.version ?? undefined,
        id: data?.id || null,
      },
    };
    return payload;
  };

  const saveRecord = async () => {
    if (formik.isValid) {
      setActionInProgress(true);
      const saveModelReposnse = await api('POST', getModelUrl(MODELS.COMPANY_STOCK_CONFIG), getSavePayload());
      if (saveModelReposnse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      fetchStockConfig();
      finishedSaveHandler('Success', t('APP_COMPANY_STOCK_CONFIG_SAVED_SUCCESSULLY'));
    } else {
      alertHandler('Error', t('LBL_REQUIRED_FIELDS'));
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
              label="LBL_PO_VENDOR_ARRIVAL_REDIRECT"
              accessor="authRedirectPurchaseOrderToStockMove"
              mode="add"
            />
          </div>
          <div className="col-md-6">
            <ToggleSwitch
              formik={formik}
              label="LBL_SO_CUSTOMER_DELIVERY_REDIRECT"
              accessor="authRedirectSaleOrderToStockMove"
              mode="add"
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default StockConfigForm;
