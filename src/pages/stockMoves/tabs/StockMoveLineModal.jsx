import { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { SpinnerCircular } from 'spinners-react';
import { useDispatch, useSelector } from 'react-redux';

import TextInput from '../../../components/ui/inputs/TextInput';
import NumberInput from '../../../components/ui/inputs/NumberInput';
import SearchModalAxelor from '../../../components/ui/inputs/SearchModal/SearchModalAxelor';
import PrimaryButton from '../../../components/ui/buttons/PrimaryButton';

import { parseFloatFixedTwo, checkFlashOrError } from '../../../utils/helpers';
import { useAxiosFunction } from '../../../hooks/useAxios';
import { getActionUrl } from '../../../services/getUrl';
import { MODELS } from '../../../constants/models';
import { stockMoveLineActions } from '../../../store/stockMoveLines';
import { VALID_TEXT_WITH_SPECIAL_CHARS, VALID_FLOAT } from '../../../constants/regex/Regex';
import { alertsActions } from '../../../store/alerts';
import { setFieldValue, setSelectedValues, handleChange } from '../../../utils/formHelpers';
import { useFormikSubmit } from '../../../hooks/useFormikSubmit';

const StockMoveLineModal = ({
  isPurchase = true,
  header,
  formik,
  data,
  show,
  setShow,
  line,
  mode,
  stockMoveLineList,
  setStockMoveLineList,
  productDomain,
  parent,
  isInternal,
  stockMoveType,
}) => {
  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  const dispatch = useDispatch();
  const errorSavingLinesEnum = {
    'customer-delivery': 'LBL_ERROR_SAVING_CUSTOMER_DELIVERY_LINES',
    'customer-return': 'LBL_ERROR_SAVING_CUSTOMER_RETURN_LINES',
    'supplier-arrival': 'LBL_ERROR_SAVING_SUPPLIER_ARRIVAL_LINES',
    'supplier-return': 'LBL_ERROR_SAVING_SUPPLIER_RETURN_LINES',
  };
  let minDecimalQty = 0.01;

  const [isLoading, setIsLoading] = useState(false);

  let exTaxTotal = useSelector(state => state.stockMoveLines.exTaxTotal);

  const getMinRealQty = () => {
    if (stockMoveLineList?.length > 0) {
      for (let l of stockMoveLineList) {
        if ((line.id && line?.id === l?.id) || (line?.lineId && line?.lineId === l?.lineId)) {
          continue;
        }

        if (Number(l.realQty) > 0.0) {
          return Number(Number(0.0).toFixed(2));
        }
      }

      return Number(Number(minDecimalQty).toFixed(2));
    } else {
      return Number(Number(minDecimalQty).toFixed(2));
    }
  };

  const getMinRealQtyMessage = () => {
    let tempMinQty = getMinRealQty();
    if (tempMinQty === minDecimalQty) return `${t('QUANTITY_VALIDATION_MESSAGE_2')}`;
    if (tempMinQty > minDecimalQty || tempMinQty === 0) return `${t('LBL_REAL_QUANTITY_MUST_NOT_BE_LESS_THAN')}${tempMinQty}`;
    return t('QUANTITY_VALIDATION_MESSAGE_2');
  };

  const initialValues = {
    product: line?.product || null,
    productName: line?.productName ?? '',
    unit: line?.unit || null,
    expectedQty: parseFloatFixedTwo(line?.qty ?? 0),
    realQty: parseFloatFixedTwo(line?.realQty ?? 0),
    invoicedQty: parseFloatFixedTwo(line?.qtyInvoiced ?? 0),
    unitPrice: parseFloatFixedTwo(line?.unitPriceUntaxed ?? 0),
    unitPriceTaxed: parseFloatFixedTwo(line?.unitPriceUntaxed ?? 0),
    purchasePrice: parseFloatFixedTwo(line?.companyPurchasePrice ?? 0),
    availableQty: parseFloatFixedTwo(0),
    isPurchase: isPurchase ?? false,
    isInternal: isInternal ?? false,
    description: line?.description ?? '',
  };

  const validationSchema = Yup.object({
    isPurchase: Yup.boolean(),
    isInternal: Yup.boolean(),
    product: Yup.object().nullable().required(t('REQUIRED')),
    productName: Yup.string(t('LBL_INVALID_VALUE')).matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')),
    unit: Yup.object().nullable().required(t('REQUIRED')),
    expectedQty: Yup.number().when('isInternal', {
      is: true,
      then: Yup.number()
        .required(t('REQUIRED'))
        .min(minDecimalQty, t('LBL_NUMBER_MUST_NOT_BE_LESS_OR_ZERO'))
        .max(Yup.ref('availableQty'), t('LBL_ERROR_EXPECTED_QTY_MORE_THAN_AVAILABLE')),
    }),
    realQty: Yup.number()
      .required(t('REQUIRED'))
      .min(getMinRealQty(), getMinRealQtyMessage())
      .when('isInternal', {
        is: true,
        then: Yup.number()
          .required(t('REQUIRED'))
          .min(getMinRealQty(), getMinRealQtyMessage())
          .max(Yup.ref('availableQty'), t('LBL_ERROR_REAL_QTY_MORE_THAN_AVAILABLE')),
      })
      .when('isInternal', {
        is: false,
        then: Yup.number(t('LBL_INVALID_NUMBER_VALUE'))
          .required(t('REQUIRED'))
          .min(getMinRealQty(), getMinRealQtyMessage())
          .max(Yup.ref('expectedQty'), t('LBL_ERROR_REAL_QTY_MORE_THAN_EXPECTED')),
      }),
    invoicedQty: Yup.string().matches(VALID_FLOAT, t('LBL_INVALID_NUMBER_VALUE')),
    unitPrice: Yup.string().matches(VALID_FLOAT, t('LBL_INVALID_NUMBER_VALUE')),
    unitPriceTaxed: Yup.string().matches(VALID_FLOAT, t('LBL_INVALID_NUMBER_VALUE')),
    purchasePrice: Yup.number().when(['isPurchase', 'isInternal'], {
      is: (isPurchase, isInternal) => isPurchase && !isInternal,
      then: Yup.number().required(t('REQUIRED')).min(minDecimalQty, t('LBL_NUMBER_MUST_NOT_BE_LESS_OR_ZERO')),
    }),
    availableQty: Yup.string(),
  });

  const lineFormik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: false,
  });

  const { validateFormForSubmit } = useFormikSubmit(lineFormik, undefined, 'modal');

  useEffect(() => {
    if (line.product) {
      onMoveLineLoad();
    }
  }, []);

  const alertHandler = (title, message) => {
    dispatch(alertsActions.initiateAlert({ title, message }));
  };

  const onProductsSuccess = response => {
    if (response.data.status === 0) {
      let data = response.data.data || [];
      let tempData = [];
      data.forEach(product => {
        let tempLine = { ...product };
        if (isInternal || !isPurchase) tempLine.availableQty = parseFloatFixedTwo(product?.$availableQty ?? '0.00');
        tempData.push(tempLine);
      });

      return { displayedData: [...tempData], total: response.data.total || 0 };
    }
  };

  const onUnitsSuccess = response => {
    if (response.data.status === 0) {
      let data = response.data.data || [];
      return { displayedData: [...data], total: response.data.total || 0 };
    }
  };

  const saveLine = async () => {
    const isValid = await validateFormForSubmit();
    if (!isValid) return null;

    let tempList = [...stockMoveLineList];
    let tempLine = {};
    let index = -1;

    if (mode !== 'add') {
      if (line.id) {
        index = stockMoveLineList.findIndex(l => l.id === line.id);
      } else {
        index = stockMoveLineList.findIndex(l => l.lineId === line.lineId);
      }

      tempLine = { ...tempList[index] };
    }

    tempLine.realQty = lineFormik.values.realQty;
    tempLine.qty = lineFormik.values.expectedQty;
    tempLine.unitPriceUntaxed = lineFormik.values.unitPrice;
    tempLine.unitPriceTaxed = lineFormik.values.unitPriceTaxed;
    tempLine.qtyInvoiced = lineFormik.values.invoicedQty;
    tempLine.companyPurchasePrice = lineFormik.values.purchasePrice;
    tempLine.unit = lineFormik.values.unit;
    tempLine.product = lineFormik.values.product;
    tempLine.productName = lineFormik.values.productName;

    if (index !== -1) tempList[index] = tempLine;
    else tempList.push(tempLine);

    setStockMoveLineList([...tempList]);
    onStockMoveLineChange(tempList);
  };

  const onMoveLineLoadPayload = () => {
    let payload = {
      model: MODELS.STOCK_MOVE_LINE,
      action: 'action-stock-move-line-group-onload,com.axelor.meta.web.MetaController:moreAttrs',
      data: {
        criteria: [],
        context: {
          _model: MODELS.STOCK_MOVE_LINE,
          productModel: null,
          isQtyRequested: false,
          productName: lineFormik.values.productName,
          realQty: lineFormik.values.realQty.toString(),
          qty: lineFormik.values.expectedQty.toString(),
          unitPriceUntaxed: data?.unitPriceUntaxed || lineFormik.values.unitPrice.toString(),
          unitPriceTaxed: data?.unitPriceTaxed || lineFormik.values.unitPriceTaxed.toString(),
          companyUnitPriceUntaxed: data?.companyUnitPriceUntaxed || lineFormik.values.unitPrice.toString(),
          lineTypeSelect: line.lineTypeSelect || 0,
          qtyInvoiced: line.qtyInvoiced || '0',
          unit: line.unit || lineFormik.values.unit,
          requestedReservedQty: '0.0000000000',
          stockMove: data
            ? {
                statusSelect: data.statusSelect,
                fromStockLocation: data.fromStockLocation,
                toStockLocation: data.toStockLocation,
                stockMoveSeq: data.stockMoveSeq,
                company: data.company,
                typeSelect: data.typeSelect,
                id: data.id,
              }
            : undefined,
          id: line.id || null,
          product: line.product,
          availableStatusSelect: 1,
          companyPurchasePrice: line.companyPurchasePrice || '0',
          version: line.version || undefined,
          _parent: data || parent,
          _source: 'form',
        },
      },
    };
    return payload;
  };

  const onMoveLineLoad = async () => {
    let loadResponse = await api('POST', getActionUrl(), onMoveLineLoadPayload());
    if (loadResponse.data.status !== 0) return alertHandler('Error', 'LBL_ERROR_LOADING_MOVELINE');
    let data = loadResponse.data.data;
    if (data && checkFlashOrError(data)) return alertHandler('Error', 'LBL_ERROR_LOADING_MOVELINE');
    let lineData = data.find(el => el.values && '$availableQty' in el.values).values;
    setFieldValue(lineFormik, 'availableQty', parseFloatFixedTwo(lineData?.$availableQty));
  };

  const onStockMoveLineChangePayload = tempStockMoveLineList => {
    let payload = {
      model: MODELS.STOCK_MOVE,
      action: 'action-stock-move-line-change-group',
      data: {
        criteria: [],
        context: {
          _model: MODELS.STOCK_MOVE,
          _isReversion: false,
          _id: null,
          _typeSelect: data?.typeSelect || 1,
          invoiceSet: data?.invoiceSet || [],
          estimatedDate: formik.values.estimatedDate,
          typeSelect: data?.typeSelect,
          toAddress: data?.toAddress,
          id: data?.id,
          isWithReturnSurplus: true,
          version: data?.version,
          isReversion: data?.isReversion,
          backorderId: data?.backorderId,
          originId: data?.originId,
          toStockLocation: data?.toStockLocation,
          company: data?.company,
          fromAddress: data?.fromAddress,
          fromStockLocation: data?.fromStockLocation,
          originTypeSelect: data?.originTypeSelect,
          exTaxTotal: exTaxTotal,
          reversionOriginStockMove: null,
          stockMoveSeq: data?.stockMoveSeq,
          stockMoveLineList: tempStockMoveLineList,
          statusSelect: data?.statusSelect,
          partner: data?.partner,
          isWithBackorder: true,
          _xFillProductAvailableQty: data?._xFillProductAvailableQty,
          _source: 'stockMoveLineList',
        },
      },
    };
    return payload;
  };

  const onStockMoveLineChange = async tempList => {
    setIsLoading(true);
    let changeResponse = await api('POST', getActionUrl(), onStockMoveLineChangePayload(tempList));
    if (changeResponse.data.status !== 0) return alertHandler('Error', errorSavingLinesEnum[stockMoveType]);
    let data = changeResponse.data.data;
    if (data && checkFlashOrError(data)) return alertHandler('Error', errorSavingLinesEnum[stockMoveType]);
    let newExTaxTotal = data.find(el => el.values && 'exTaxTotal' in el.values).values.exTaxTotal;
    dispatch(stockMoveLineActions.updateExTaxTotal({ exTaxTotal: newExTaxTotal }));
    let tempStockMoveLineList = data.find(el => el.values && 'stockMoveLineList' in el.values).values.stockMoveLineList;
    setStockMoveLineList([...tempStockMoveLineList]);
    setShow(false);
  };

  const onProductChangePayload = product => {
    let payload = {
      model: MODELS.STOCK_MOVE_LINE,
      action: 'action-stock-move-line-tracking-number-attrs,action-group-stock-stockmoveline-product-onchange',
      data: {
        criteria: [],
        context: {
          _model: MODELS.STOCK_MOVE_LINE,
          productModel: null,
          'product.productTypeSelect': 'storable',
          productName: product?.productName || undefined,
          // description: lineFormik.values.description,
          stockMove: data
            ? {
                statusSelect: data.statusSelect,
                fromStockLocation: data.fromStockLocation,
                toStockLocation: data.toStockLocation,
                stockMoveSeq: data.stockMoveSeq,
                company: data.company,
                typeSelect: data.typeSelect,
                id: data.id,
              }
            : undefined,
          id: line?.id || null,
          product: product,
          realQty: '0',
          unitPriceUntaxed: '0',
          companyUnitPriceUntaxed: '0',
          lineTypeSelect: 0,
          qtyInvoiced: '0',
          qty: '0',
          unitPriceTaxed: '0',
          companyPurchasePrice: '0',
          'stockMove.typeSelect': data?.typeSelect || undefined,
          'stockMove.statusSelect': data?.statusSelect || undefined,
          version: line?.version || undefined,
          productTypeSelect: 'storable',
          _parent: data || parent,
          _source: 'product',
        },
      },
    };
    return payload;
  };

  const onProductChange = async product => {
    let changeResponse = await api('POST', getActionUrl(), onProductChangePayload(product));
    if (changeResponse.data.status !== 0) return alertHandler('Error', 'LBL_ERROR_SAVING_PRODUCT');
    let data = changeResponse.data.data;
    if (data && checkFlashOrError(data)) return alertHandler('Error', 'LBL_ERROR_SAVING_PRODUCT');

    if (product.id !== line?.product?.id) {
      let newProductName = data.find(el => el.values && 'productName' in el.values).values.productName;
      let newCompanyPurchasePrice = data.find(el => el.values && 'companyPurchasePrice' in el.values).values.companyPurchasePrice;
      let newExpectedQty = data.find(el => el.values && 'qty' in el.values).values.qty;
      let newRealQty = data.find(el => el.values && 'realQty' in el.values).values.realQty;
      let newInvoicedQty = data.find(el => el.values && 'qtyInvoiced' in el.values).values.qtyInvoiced;
      let newUnitPrice = data.find(el => el.values && 'unitPriceUntaxed' in el.values).values.unitPriceUntaxed;
      let newUnitPriceTaxed = data.find(el => el.values && 'unitPriceTaxed' in el.values).values.unitPriceTaxed;
      let newUnit = data.find(el => el.values && 'unit' in el.values).values.unit;

      if (isInternal) {
        setSelectedValues(lineFormik, {
          productName: newProductName,
          purchasePrice: parseFloatFixedTwo(newCompanyPurchasePrice),
          unitPrice: parseFloatFixedTwo(newUnitPrice),
          unitPriceTaxed: parseFloatFixedTwo(newUnitPriceTaxed),
          unit: newUnit,
        });
      } else {
        setSelectedValues(lineFormik, {
          productName: newProductName,
          purchasePrice: parseFloatFixedTwo(newCompanyPurchasePrice),
          expectedQty: parseFloatFixedTwo(newExpectedQty),
          realQty: parseFloatFixedTwo(newRealQty),
          invoicedQty: parseFloatFixedTwo(newInvoicedQty),
          unitPrice: parseFloatFixedTwo(newUnitPrice),
          unitPriceTaxed: parseFloatFixedTwo(newUnitPriceTaxed),
          unit: newUnit,
        });
      }
    }

    if (isInternal || !isPurchase) {
      let newAvailableQty = data.find(el => el.values && 'availableQty' in el.values).values.availableQty;
      setFieldValue(lineFormik, 'availableQty', newAvailableQty);
    }
  };

  const onClose = () => {
    setShow(false);
  };

  const onRealQtyBlur = e => {
    setFieldValue(lineFormik, 'realQty', Number(Number(e.target.value).toFixed(2)));
    lineFormik.handleBlur('realQty')(e);
  };

  const onExpectedQtyBlur = e => {
    setFieldValue(lineFormik, 'expectedQty', Number(Number(e.target.value).toFixed(2)));
    lineFormik.handleBlur('expectedQty')(e);
  };

  return (
    <>
      <Modal
        id="add-new-line"
        show={show}
        onHide={onClose}
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
          {isLoading && (
            <div className="text-center">
              <SpinnerCircular
                size={70}
                thickness={120}
                speed={100}
                color="rgba(31, 79, 222, 1)"
                secondaryColor="rgba(153, 107, 229, 0.19)"
              />
            </div>
          )}
          {!isLoading && (
            <div className="container">
              <div className="row">
                <div className="col-md-6">
                  <SearchModalAxelor
                    formik={lineFormik}
                    modelKey={isInternal || !isPurchase ? 'PRODUCTS_WITH_QUANTITY' : 'PRODUCTS'}
                    mode={mode}
                    onSuccess={onProductsSuccess}
                    payloadDomain={productDomain || null}
                    defaultValueConfig={null}
                    isRequired={true}
                    selectIdentifier="fullName"
                    extraFields={['fullName', 'productTypeSelect', 'salePrice', 'unit']}
                    selectCallback={product => onProductChange(product)}
                    payloadDomainContext={
                      isInternal || !isPurchase
                        ? {
                            _parent: {
                              stockLocation: formik.values.stockLocation,
                            },
                            _xFillProductAvailableQty: true,
                            _model: MODELS.STOCK_MOVE,
                          }
                        : undefined
                    }
                  />
                </div>
                <div className="col-md-6">
                  <TextInput formik={lineFormik} label="LBL_PRODUCT_NAME" accessor="productName" mode={mode} />
                </div>
                <div className="col-md-6">
                  <NumberInput
                    formik={lineFormik}
                    label="LBL_EXPECTED_QTY"
                    accessor="expectedQty"
                    mode={mode}
                    disabled={!(isInternal && mode !== 'view')}
                    isRequired={isInternal && mode !== 'view'}
                    onChange={e => {
                      handleChange(lineFormik, e, e.target.value);
                      if (isInternal) setFieldValue(lineFormik, 'realQty', e.target.value);
                    }}
                    onBlur={onExpectedQtyBlur}
                  />
                </div>
                {(stockMoveType === 'customer-delivery' ||
                  stockMoveType === 'supplier-return' ||
                  stockMoveType === 'internal-stock-move' ||
                  isInternal) && (
                  <div className="col-md-6">
                    <NumberInput formik={lineFormik} label="LBL_AVAILABLE_QTY" accessor="availableQty" mode={mode} disabled={true} />
                  </div>
                )}
                <div className="col-md-6">
                  <NumberInput
                    formik={lineFormik}
                    label="LBL_REAL_QTY"
                    accessor="realQty"
                    mode={mode}
                    isRequired={true}
                    onBlur={onRealQtyBlur}
                  />
                </div>
                {!isInternal && (
                  <div className="col-md-6">
                    <NumberInput formik={lineFormik} label="LBL_INVOICED_QTY" accessor="invoicedQty" mode={mode} disabled={true} />
                  </div>
                )}
                <div className="col-md-6">
                  <NumberInput formik={lineFormik} label="LBL_UNIT_PRICE" accessor="unitPrice" mode={mode} disabled={true} />
                </div>
                {!isInternal && isPurchase && (
                  <div className="col-md-6">
                    <NumberInput
                      formik={lineFormik}
                      label="LBL_PURCHASE_PRICE"
                      accessor="purchasePrice"
                      mode={mode}
                      isRequired={true}
                      disabled={true}
                    />
                  </div>
                )}
                <div className="col-md-6">
                  <SearchModalAxelor
                    formik={lineFormik}
                    modelKey="UNITS"
                    mode={stockMoveType === 'supplier-return' || stockMoveType === 'customer-return' ? 'view' : mode}
                    onSuccess={onUnitsSuccess}
                    defaultValueConfig={null}
                    isRequired={true}
                    selectIdentifier="name"
                  />
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <div className="float-end">
            <PrimaryButton theme="white" onClick={onClose} />
            {mode !== 'view' && <PrimaryButton theme="purple" onClick={saveLine} />}
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default StockMoveLineModal;
