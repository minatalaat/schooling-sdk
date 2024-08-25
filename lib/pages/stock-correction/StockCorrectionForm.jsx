import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';

import TextInput from '../../components/ui/inputs/TextInput';
import SearchModalAxelor from '../../components/ui/inputs/SearchModal/SearchModalAxelor';
import AttachmentInput from '../../components/ui/inputs/AttachmentInput';

import { MODELS } from '../../constants/models';
import { useAxiosFunction } from '../../hooks/useAxios';
import { getVerifyUrl, getActionUrl, getModelUrl, getRemoveAllUrl } from '../../services/getUrl';
import { checkFlashOrError, formatFloatNumber } from '../../utils/helpers';
import { STOCK_CORRECTION_STATUS_REV_ENUM } from '../../constants/enums/StockCorrectionEnum';
import { setFieldValue } from '../../utils/formHelpers';
import { VALID_TEXT_WITH_SPECIAL_CHARS } from '../../constants/regex/Regex';
import { useFormikSubmit } from '../../hooks/useFormikSubmit';
import FormNotes from '../../components/ui/FormNotes';

const StockCorrectionForm = ({
  data,
  addNew,
  enableEdit,
  isSave,
  isValidate,
  isDelete,
  isShowStockMove,
  finishedSaveHandler,
  alertHandler,
  setActionInProgress,
  finishedValidateHandler,
  finishedDeleteHandler,
  finishedShowStockMoveHandler,
}) => {
  const subFeature = 'STOCK_CORRECTION';
  const { api } = useAxiosFunction();
  const { t } = useTranslation();

  const [defaultData, setDefaultData] = useState(null);
  const [parentSaveDone, setParentSaveDone] = useState(false);
  const [fetchedObject, setFetchedObject] = useState(false);
  const [onSuccessFn, setOnSuccessFn] = useState();

  const initialValues = {
    stockLocation: data?.stockLocation ?? null,
    product: data ? (data.product ? data.product.fullName : '') : '',
    stockCorrectionReason: data?.stockCorrectionReason ?? null,
    realQty: data ? (data.realQty ? formatFloatNumber(data?.realQty) : 0.0) : 0.0,
  };

  const validationSchema = Yup.object({
    stockLocation: Yup.object().nullable().required(t('REQUIRED')),
    product: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).trim().required(t('REQUIRED')),
    stockCorrectionReason: Yup.object().nullable().required(t('REQUIRED')),
    realQty: Yup.number(t('LBL_NUMBER_MUST_NOT_BE_ZERO')).required(t('REQUIRED')).min(0.0, t('LBL_NUMBER_MUST_NOT_BE_ZERO')),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: addNew ? true : false,
  });

  const { validateFormForSubmit } = useFormikSubmit(formik, alertHandler);

  useEffect(() => {
    if (isSave) {
      saveRecord();
    }

    if (isDelete) {
      deleteRecord();
    }

    if (isValidate) {
      validateRecord();
    }

    if (isShowStockMove) {
      showStockMove();
    }
  }, [isSave, isDelete, addNew, enableEdit, isValidate, isShowStockMove]);

  useEffect(() => {
    if (formik.values.stockLocation && formik.values.product) {
      if (
        data === null ||
        (data &&
          (data?.stockLocation?.name !== formik.values.stockLocation?.name || data.product?.fullName !== formik.values.product?.fullName))
      ) {
        api('POST', getActionUrl(), getBaseQtyPayload(), onGetBaseQtySuccess);
      }
    }
  }, [formik.values.stockLocation, formik.values.product]);

  const getBaseQtyPayload = () => {
    let paylaod = {
      model: MODELS.STOCK_CORRECTION,
      action: 'action-stock-correction-method-set-deault-qtys',
      data: {
        criteria: [],
        context: {
          _model: MODELS.STOCK_CORRECTION,
          _id: null,
          statusSelect: 1,
          stockLocation: formik.values.stockLocation,
          product: formik.values.product,
          _viewType: 'grid',
          _viewName: 'product-grid',
          _views: [
            { type: 'grid', name: 'product-grid' },
            { type: 'form', name: 'product-form' },
          ],
          _source: 'product',
        },
      },
    };
    return paylaod;
  };

  const onGetBaseQtySuccess = response => {
    if (response.data.status === 0) {
      let data = response.data.data;

      if (data && !checkFlashOrError(data)) {
        setDefaultData(data[0].values);
        setFieldValue(formik, 'realQty', formatFloatNumber(data[0].values.realQty));
      }
    }
  };

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
          };
          products.push(temp);
        });
      }

      return { displayedData: [...products], total: response.data.total || 0 };
    }
  };

  const getSaveModelPayload = () => {
    let payload = null;

    if (addNew) {
      payload = {
        data: {
          statusSelect: 1,
          realQty: formik.values.realQty.toString(),
          baseQty: defaultData ? defaultData.baseQty : null,
          stockLocation: formik.values.stockLocation,
          product: formik.values.product,
          stockCorrectionReason: formik.values.stockCorrectionReason,
          id: null,
        },
      };
    } else {
      payload = {
        data: {
          statusSelect: data ? STOCK_CORRECTION_STATUS_REV_ENUM[data.statusSelect] : null,
          realQty: formik.values.realQty.toString(),
          baseQty: defaultData ? defaultData.baseQty : null,
          stockLocation: formik.values.stockLocation,
          product: formik.values.product,
          stockCorrectionReason: formik.values.stockCorrectionReason,
          id: data ? data.id : null,
          version: data && data.version !== null ? data.version : null,
        },
      };
    }

    return payload;
  };

  const saveRecord = async () => {
    const isValid = await validateFormForSubmit();
    if (!isValid) return null;

    setActionInProgress(true);
    let saveActionResponse = await api('POST', getModelUrl(MODELS.STOCK_CORRECTION), getSaveModelPayload());
    if (saveActionResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    let data = saveActionResponse.data.data[0];
    if (data && checkFlashOrError(data)) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    setFetchedObject(data);
    setParentSaveDone(true);
    setOnSuccessFn('save');
  };

  const verifyPayload = () => {
    let payload = { data: { id: data.id, version: data.version } };

    return payload;
  };

  const getValidateFirstActionPayload = action => {
    let payload = {
      model: MODELS.STOCK_CORRECTION,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: 'com.axelor.apps.stock.db.StockCorrection',
          _id: null,
          validationDateT: null,
          product: formik.values.product,
        },
        stockLocation: formik.values.stockLocation,
        stockCorrectionReason: formik.values.stockCorrectionReason,
        baseQty: data ? (data.baseQty ? data.baseQty : null) : null,
        version: data && data.version !== null ? data.version : null,
        statusSelect: data ? (data.statusSelect ? data.statusSelect : null) : null,
        realQty: formik.values.realQty.toString(),
        id: data.id,
        trackingNumber: null,
        wkfStatus: null,
      },
    };
    return payload;
  };

  const getValidateSecondActionPayload = (action, data) => {
    let paylaod = {
      model: MODELS.STOCK_CORRECTION,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: MODELS.STOCK_CORRECTION,
          _id: null,
          validationDateT: null,
          product: formik.values.product,
          stockLocation: formik.values.stockLocation,
          stockCorrectionReason: formik.values.stockCorrectionReason,
          baseQty: data ? (data.baseQty ? data.baseQty : null) : null,
          version: data && data.version !== null ? data.version : null,
          statusSelect: data ? (data.statusSelect ? data.statusSelect : null) : null,
          realQty: formik.values.realQty.toString(),
          id: data.id,
          trackingNumber: null,
          wkfStatus: null,
        },
      },
    };
    return paylaod;
  };

  const validateRecord = async () => {
    const isValid = await validateFormForSubmit();
    if (!isValid) return null;

    setActionInProgress(true);
    let action = 'action-group-stock-correction-validate-click';
    let validateFirstActionResponse = await api('POST', getActionUrl(), getValidateFirstActionPayload(action));
    if (validateFirstActionResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    let data = validateFirstActionResponse.data.data;
    if (data && checkFlashOrError(data)) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    let verifyResponse = await api('POST', getVerifyUrl(MODELS.STOCK_CORRECTION), verifyPayload());
    if (verifyResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    data = verifyResponse.data.data;
    if (data && checkFlashOrError(data)) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    let saveActionResponse = await api('POST', getModelUrl(MODELS.STOCK_CORRECTION), getSaveModelPayload());
    if (saveActionResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    data = saveActionResponse.data.data[0];
    if (data && checkFlashOrError(data)) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    action = 'action-group-stock-correction-validate-click[1]';
    let validateSecondActionResponse = await api(
      'POST',
      getActionUrl(),
      getValidateSecondActionPayload(action, saveActionResponse.data.data[0])
    );
    if (validateSecondActionResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    data = validateSecondActionResponse.data.data;

    if (data && checkFlashOrError(data)) {
      return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    }

    setParentSaveDone(true);
    setOnSuccessFn('validate');
  };

  const deleteRecord = () => {
    setActionInProgress(true);
    const payload = {
      records: [{ id: data.id }],
    };
    api('POST', getRemoveAllUrl(MODELS.STOCK_CORRECTION), payload, () => {
      finishedDeleteHandler('success');
    });
  };

  const showStockMovePayload = action => {
    let payload = {
      model: 'com.axelor.apps.stock.db.StockCorrection',
      action: action,
      data: {
        criteria: [],
        context: {
          _model: 'com.axelor.apps.stock.db.StockCorrection',
          _id: null,
          validationDateT: data ? data.validationDateT : null,
          product: formik.values.product,
          stockLocation: formik.values.stockLocation,
          stockCorrectionReason: formik.values.stockCorrectionReason,
          baseQty: data ? (data.baseQty ? data.baseQty : null) : null,
          version: data.version,
          statusSelect: data ? data.statusSelect : null,
          realQty: data ? data.realQty : null,
          id: data ? data.id : null,
          trackingNumber: null,
        },
      },
    };
    return payload;
  };

  const showStockMove = async () => {
    setActionInProgress(true);
    let action = 'action-stock-correction-method-show-generated-stock-move';
    let showActionResponse = await api('POST', getActionUrl(), showStockMovePayload(action));
    if (showActionResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    let data = showActionResponse.data.data;
    if (data && checkFlashOrError(data)) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));

    finishedShowStockMoveHandler('success', data[0]?.view?.context?.['_showRecord'] ? parseInt(data[0].view.context['_showRecord']) : null);
  };

  return (
    <>
      <div className="card">
        <div className="row">
          <div className="col-md-6">
            <SearchModalAxelor
              formik={formik}
              modelKey="STOCK_LOCATIONS"
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
              defaultValueConfig={null}
              payloadDomain="self.typeSelect = '1'"
              isRequired={addNew || enableEdit}
              disabled={enableEdit === false ? true : false}
            />
          </div>
          <div className="col-md-6">
            <SearchModalAxelor
              formik={formik}
              modelKey="PRODUCTS"
              mode={enableEdit ? 'edit' : 'add'}
              isRequired={addNew || enableEdit}
              disabled={enableEdit === false ? true : false}
              onSuccess={onProductSearchSuccess}
              selectIdentifier="fullName"
              defaultValueConfig={null}
              extraFields={['fullName', 'productTypeSelect']}
              payloadDomain="self.productTypeSelect = 'storable' and self.dtype = 'Product'"
            />
          </div>
          <div className="col-md-6">
            <TextInput
              formik={formik}
              label="LBL_REAL_QTY"
              accessor="realQty"
              mode={enableEdit === false ? 'view' : 'add'}
              isRequired={addNew || enableEdit}
              disabled={enableEdit === false ? true : false}
            />
          </div>
          <div className="col-md-6">
            <SearchModalAxelor
              formik={formik}
              modelKey="STOCK_CORRECTION_REASON"
              mode={enableEdit ? 'edit' : 'add'}
              isRequired={addNew || enableEdit}
              disabled={enableEdit === false ? true : false}
              defaultValueConfig={null}
            />
          </div>
        </div>
        {(addNew || enableEdit) && (
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
        mode={addNew ? 'add' : enableEdit && data?.statusSelect < 2 ? 'edit' : 'view'}
        modelKey={MODELS.STOCK_CORRECTION}
        alertHandler={alertHandler}
        fetchedObj={fetchedObject || data || null}
        parentSaveDone={parentSaveDone}
        feature={subFeature}
        navigationParams={{ id: data?.id }}
        onSuccessFn={
          onSuccessFn === 'save'
            ? () => finishedSaveHandler('success')
            : onSuccessFn === 'validate'
              ? () => finishedValidateHandler('success')
              : null
        }
      />
    </>
  );
};

export default StockCorrectionForm;
