import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';
import { useFormik } from 'formik';

import TextInput from '../../components/ui/inputs/TextInput';
import SearchModalAxelor from '../../components/ui/inputs/SearchModal/SearchModalAxelor';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';

import { inventoryLinesActions } from '../../store/inventoryLines';
import { formatFloatNumber } from '../../utils/helpers';
import { useAxiosFunction } from '../../hooks/useAxios';
import { getActionUrl } from '../../services/getUrl';
import { MODELS } from '../../constants/models';
import { setFieldValue } from '../../utils/formHelpers';
import { SpinnerCircular } from 'spinners-react';
import FormNotes from '../../components/ui/FormNotes';

function InventoryLineModal({ show, setShow, header, line, mode, stockLocation, parentContext, alertHandler }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { api } = useAxiosFunction();
  const [isLoading, setIsLoading] = useState(false);
  const initialValues = {
    product: line?.product || null,
    stockLocation: stockLocation ? stockLocation?.name : line?.stockLocation?.name || null,
    currentQty: line ? (line.currentQty ? Number(line.currentQty).toFixed() : 0.0) : 0.0,
    realQty: line ? (line.realQty ? Number(line.realQty).toFixed() : null) : null,
    unit: line?.unit || null,
    gap: line ? (line.gap ? Number(line.gap).toFixed() : 0.0) : 0.0,
    gapValue: line ? (line.gapValue ? Number(line.gapValue).toFixed() : 0.0) : 0.0,
    realValue: line ? (line.realValue ? Number(line.realValue) : null) : null,
  };
  const validationSchema = Yup.object({
    product: Yup.object().nullable().required(t('REQUIRED')),
    stockLocation: Yup.object().nullable(),
    currentQty: Yup.number().nullable().required(t('REQUIRED')).min(0.0, t('LBL_NUMBER_MUST_NOT_BE_ZERO')),
    realQty: Yup.number().nullable().required(t('REQUIRED')).min(0.0, t('LBL_NUMBER_MUST_NOT_BE_ZERO')),
    gap: Yup.number().nullable().required(t('REQUIRED')),
    gapValue: Yup.number().nullable().required(t('REQUIRED')),
  });

  const lineFormik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: false,
  });

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
          };
          products.push(temp);
        });
      }

      return { displayedData: [...products], total: response.data.total || 0 };
    }
  };

  const defaultProductDataPayload = () => {
    let payload = {
      model: MODELS.INVENTORY_LINE,
      action: 'action-inventory-line-method-on-change-product,action-inventory-line-method-compute',
      data: {
        criteria: [],
        context: {
          _model: MODELS.INVENTORY_LINE,
          product: lineFormik.values.product,
          rack: null,
          stockLocation: { name: 'Internal SL', id: 4 },
          description: null,
          currentQty: '0.0000000000',
          // version: 0,
          realQty: null,
          unit: { name: 'each/وحدة', id: 1 },
          id: line?.id || null,
          trackingNumber: null,
          _parent: parentContext,
          wkfStatus: null,
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
    return payload;
  };

  const getDefaultProductData = async () => {
    let defaultProductDataResponse = await api('POST', getActionUrl(), defaultProductDataPayload());
    let data = defaultProductDataResponse
      ? defaultProductDataResponse.data
        ? defaultProductDataResponse.data.data
          ? defaultProductDataResponse.data.data
          : null
        : null
      : null;

    if (data) {
      setFieldValue(lineFormik, 'unit', data[1].values.unit);
    } else {
      setFieldValue(lineFormik, 'unit', null);
    }
  };

  const getDefaultCurrentQtyPayload = action => {
    let payload = {
      model: MODELS.INVENTORY_LINE,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: MODELS.INVENTORY_LINE,
          product: lineFormik?.values?.product || null,
          rack: null,
          stockLocation: stockLocation,
          description: null,
          currentQty: formatFloatNumber(lineFormik.values.currentQty).toString(),
          // version: 0,
          realQty: formatFloatNumber(lineFormik.values.realQty).toString(),
          unit: lineFormik.values.unit,
          // id: 239,
          trackingNumber: null,
          _parent: parentContext,
          wkfStatus: null,
          _source: 'stockLocation',
        },
      },
    };
    return payload;
  };

  const saveLine = () => {
    if (lineFormik.isValid) {
      dispatch(
        inventoryLinesActions.editLine({
          lineId: line.lineId,
          inventoryLine: {
            id: line?.id || null,
            lineId: line.lineId,
            version: line && line.version !== null ? line.version : null,
            currentQty: parseFloat(lineFormik.values.currentQty).toFixed(2).toString(),
            gap: Number(lineFormik.values.gap).toFixed(2).toString(),
            gapValue:
              line?.['product.costTypeSelect'] === 5 &&
              Number(lineFormik?.values?.realQty || -1) > Number(lineFormik?.values?.currentQty || -1)
                ? Math.sign(Number(lineFormik.values.gapValue)) === -1
                  ? Number(lineFormik.values.gapValue).toFixed(2).toString()
                  : (-1 * Number(lineFormik.values.gapValue).toFixed(2)).toString()
                : Number(lineFormik.values.gapValue).toFixed(2).toString(),
            realValue: '0.00',
            selected: false,
            product: lineFormik?.values?.product || null,
            rack: null,
            unit: lineFormik.values.unit,
            stockLocation: stockLocation,
            realQty: Number(lineFormik.values.realQty).toFixed(2).toString(),
            'product.costTypeSelect': line?.['product.costTypeSelect'] || null,
          },
        })
      );

      setShow(false);
    } else {
      alertHandler('Error', t('INVALID_FORM'));
    }
  };

  const getGapPayload = action => {
    let payload = {
      model: MODELS.INVENTORY_LINE,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: MODELS.INVENTORY_LINE,
          product: lineFormik.values.product,
          rack: null,
          stockLocation: lineFormik.values.stockLocation,
          description: null,
          currentQty: lineFormik.values.currentQty,
          version: line ? (line.version ? (line.version !== 0 ? line.version : null) : null) : null,
          realQty: parseFloat(lineFormik.values.realQty).toFixed(2).toString(),
          unit: lineFormik.values.unit,
          id: line?.id || null,
          trackingNumber: null,
          _parent: parentContext,
        },
      },
    };
    return payload;
  };

  const getGap = async () => {
    setIsLoading(true);
    let action = 'action-inventory-line-method-compute';
    const getGapResponse = await api('POST', getActionUrl(), getGapPayload(action));

    if (getGapResponse.data.status !== 0) {
      setIsLoading(false);
      return -1;
    }

    let data = getGapResponse.data.data[0].values;
    setFieldValue(lineFormik, 'gap', data?.gap || '');
    setFieldValue(lineFormik, 'realValue', data?.realValue || '');

    if (Number(data?.realValue) === -1 && Number(lineFormik?.values?.realQty) === Number(line?.realQty)) {
      setFieldValue(lineFormik, 'gapValue', line?.gapValue || '');
    } else {
      setFieldValue(lineFormik, 'gapValue', data?.gapValue || '');
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (lineFormik.values.product) {
      getDefaultProductData();
    }
  }, [lineFormik.values.product]);
  // useEffect(() => {
  //   getDefaultCurrentQty();
  // }, [lineFormik.values.stockLocation]);

  useEffect(() => {
    if (lineFormik.values.realQty !== null) {
      getGap();
    }
  }, [lineFormik.values.product, lineFormik.values.currentQty, lineFormik.values.realQty]);
  return (
    <Modal
      id="add-new-line"
      show={show}
      onHide={() => setShow(false)}
      dialogClassName="modal-90w"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      size="xl"
    >
      <Modal.Header closeButton>
        <h5 className="modal-title" id="add-new-line">
          {t(header)}
        </h5>
      </Modal.Header>
      <Modal.Body>
        {/* {isLoading && (
          <div className="text-center">
            <SpinnerCircular
              size={71}
              thickness={138}
              speed={100}
              color="rgba(31, 79, 222, 1)"
              secondaryColor="rgba(153, 107, 229, 0.19)"
            />
          </div>
        )} */}
        {/* {!isLoading && ( */}
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <SearchModalAxelor
                formik={lineFormik}
                modelKey="PRODUCTS"
                mode={mode}
                isRequired={mode !== 'view'}
                disabled={mode === 'view'}
                onSuccess={onProductSearchSuccess}
                selectIdentifier="fullName"
                payloadDomain={
                  "self.expense = false and self.productTypeSelect = 'storable' and self.stockManaged = true and self.dtype = 'Product'"
                }
                extraFields={['fullName', 'productTypeSelect']}
              />{' '}
            </div>
            <div className="col-md-6">
              <TextInput formik={lineFormik} label="LBL_STOCK_LOCATION" accessor="stockLocation" mode="view" disabled={true} />
            </div>
            <div className="col-md-6">
              <TextInput formik={lineFormik} label="LBL_CURRENT_QTY" accessor="currentQty" mode={mode} disabled={mode !== 'add'} />
            </div>
            <div className="col-md-6">
              <TextInput
                formik={lineFormik}
                label="LBL_REAL_QTY"
                accessor="realQty"
                mode={mode}
                isRequired={mode !== 'view'}
                disabled={mode === 'view'}
              />
            </div>
            <div className="col-md-6">
              <SearchModalAxelor
                formik={lineFormik}
                modelKey="UNITS"
                mode="view"
                isRequired={false}
                disabled={true}
                selectIdentifier="name"
              />
            </div>
            <div className="col-md-6">
              <TextInput formik={lineFormik} label="LBL_GAP" accessor="gap" mode="view" disabled={true} />
            </div>

            <div className="col-md-6">
              <TextInput
                formik={lineFormik}
                label="LBL_GAP_VALUE"
                accessor="gapValue"
                mode={mode}
                disabled={
                  mode === 'view' ||
                  (mode === 'edit' && line['product.costTypeSelect'] && line['product.costTypeSelect'] === 1) ||
                  (mode === 'edit' && line['product.costTypeSelect'] && line['product.costTypeSelect'] === 3) ||
                  (mode === 'edit' &&
                    line['product.costTypeSelect'] &&
                    line['product.costTypeSelect'] === 5 &&
                    Number(lineFormik.values.realQty) < Number(lineFormik.values.currentQty)) ||
                  (mode === 'add' && lineFormik?.values?.product?.['product.costTypeSelect'] !== 5) ||
                  (mode === 'add' &&
                    lineFormik?.values?.product?.['product.costTypeSelect'] === 5 &&
                    Number(lineFormik.values.realQty) < Number(lineFormik.values.currentQty))
                }
              />
            </div>
          </div>
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
        {/* )} */}
      </Modal.Body>
      <Modal.Footer>
        <div className="float-end">
          <PrimaryButton theme="white" onClick={() => setShow(false)} />
          {mode !== 'view' && (
            <PrimaryButton
              theme="purple"
              onClick={() => {
                saveLine();
              }}
              disabled={isLoading}
            />
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default InventoryLineModal;
