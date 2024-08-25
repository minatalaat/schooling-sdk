import { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { roundTo } from 'round-to';

import PrimaryButton from '../../../components/ui/buttons/PrimaryButton';
import Tabs from '../../../components/ui/inputs/Tabs';
import AnalyticLines from './AnalyticLines';
import ProductInfoTab from './ProductInfoTab';

import { useTabs } from '../../../hooks/useTabs';
import { useAxiosFunction } from '../../../hooks/useAxios';
import { invoiceLinesActions } from '../../../store/invoiceLines';
import { analyticDistributionLinesActions } from '../../../store/analyticDistrbution';
import { getActionUrl, getSearchUrl } from '../../../services/getUrl';
import { checkFlashOrError } from '../../../utils/helpers';
import { invoiceTypeEnum } from '../../../constants/enums/InvoicingEnums';
import { MODELS } from '../../../constants/models';
import { setAllValues, setFieldValue } from '../../../utils/formHelpers';
import { VALID_TEXT_WITH_SPECIAL_CHARS } from '../../../constants/regex/Regex';
import { alertsActions } from '../../../store/alerts';
import { useFormikSubmit } from '../../../hooks/useFormikSubmit';
import { useFinancialAccountsServices } from '../../../services/apis/useFinancialAccountsServices';

function AddProduct({
  show,
  setShow,
  parentContext,
  edit,
  lineId,
  id,
  version,
  purchase,
  isOrder,
  hasOriginal,
  invoiceType,
  modalTitle,
  stockLocation,
  parentModel,
  fromPO_SO,
  fetchedInvoicelines,
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { api } = useAxiosFunction();
  const tabsProps = useTabs();
  const { fetchFinancialAccountService } = useFinancialAccountsServices();

  const [isAdd, setIsAdd] = useState(false);

  let minDecimalQty = 0.01;

  const analyticDistributionLines = useSelector(state => state.analyticDistributionLines.analyticDistributionLines);
  const invoicesLines = useSelector(state => state.invoiceLines.invoiceLines);
  let currentLine =
    edit && invoicesLines && invoicesLines.length > 0 ? invoicesLines.filter(line => line.lineId && line.lineId === lineId)[0] : null;
  let currentFetchedLine =
    edit && fetchedInvoicelines && fetchedInvoicelines.length > 0
      ? fetchedInvoicelines.filter(line => line.lineId && line.lineId === lineId)[0]
      : null;
  const [validateError, setValidateError] = useState(false);
  const [defaultUnit, setDefaultUnit] = useState(null);

  const getMinQty = () => {
    if (isOrder) {
      return Number(Number(1.0).toFixed(2));
    } else if (invoicesLines && invoicesLines.length > 0) {
      for (let line of invoicesLines) {
        if (currentLine && currentLine.lineId === line.lineId) {
          continue;
        }

        if (Number(line.qty) > 0.0) {
          return Number(Number(0.0).toFixed(2));
        }
      }

      return Number(Number(minDecimalQty).toFixed(2));
    } else {
      return Number(Number(minDecimalQty).toFixed(2)).toFixed(2);
    }
  };

  const getMinQtyMessage = () => {
    let tempMinQty = getMinQty();
    if (tempMinQty === minDecimalQty) return `${t('QUANTITY_VALIDATION_MESSAGE_2')}`;
    if (tempMinQty > minDecimalQty || tempMinQty === 0) return `${t('LBL_QUANTITY_MUST_NOT_BE_LESS_THAN')}${tempMinQty}`;
    return t('QUANTITY_VALIDATION_MESSAGE_2');
  };

  const initVals = {
    product: null,
    productName: '',
    quantity: 1.0,
    unit: null,
    unitPrice: 0.0,
    tax: null,
    desc: '',
    isPurchase: purchase,
    fixedAssets: false,
    account: null,
    fixedAssetCategory: null,
    hasOriginal: hasOriginal,
    isClassic: invoiceType !== invoiceTypeEnum['FREE_TEXT'],
    analyticDistributionLines: [],
  };

  let maxQty = invoicesLines.filter(line => line.id && line.id === id)?.[0]?.maxQty ?? 0;

  let valSchema = Yup.object().shape({
    isClassic: Yup.boolean(),
    isPurchase: Yup.boolean(),
    hasOriginal: Yup.boolean(),
    product: Yup.object()
      .nullable()
      .when('isClassic', {
        is: true,
        then: Yup.object().nullable().required(t('PRODUCT_VALIDATION_MESSAGE')),
      }),
    productName: Yup.string()
      .matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS'))
      .trim()
      .required(t('PRODUCT_NAME_VALIDATION_MESSAGE')),
    unit: Yup.object().nullable().required(t('UNIT_VALIDATION_MESSAGE')),
    unitPrice: Yup.number().required(t('UNIT_PRICE_VALIDATION_MESSAGE')).moreThan(0.0, t('UNIT_PRICE_VALIDATION_MESSAGE_2')),
    tax: Yup.object().nullable().required(t('TAX_VALIDATION_MESSAGE')),
    desc: Yup.string()
      .matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS'))
      .trim()
      .min(1, t('SPACES_ONLY_VALIDATION_MESSAGE')),
    quantity:
      fromPO_SO && edit
        ? Yup.number()
            .required(t('QUANTITY_VALIDATION_MESSAGE'))
            .min(getMinQty(), getMinQtyMessage())
            .max(Number(Number(currentFetchedLine?.qty || 0.0).toFixed(2)), t('QUANTIRY_MORE_THAN_MAX'))
        : Yup.number()
            .required(t('QUANTITY_VALIDATION_MESSAGE'))
            .min(getMinQty(), getMinQtyMessage())
            .when('hasOriginal', {
              is: true,
              then: Yup.number()
                .required(t('QUANTITY_VALIDATION_MESSAGE'))
                .min(getMinQty(), getMinQtyMessage())
                .max(Number(Number(maxQty).toFixed(2)), t('QUANTIRY_MORE_THAN_MAX')),
            }),
    fixedAssets: Yup.boolean(),
    account: Yup.object().nullable().required(t('LBL_ACCOUNT_REQUIRED')),
    fixedAssetCategory: Yup.object()
      .nullable()
      .when('fixedAssets', {
        is: true,
        then: Yup.object().nullable().required(t('LBL_FIXED_ASSET_CATEGORY_REQUIRED')),
      }),
    analyticDistributionLines: Yup.array().when('account', {
      is: () => formik.values.account?.analyticDistributionAuthorized,
      then: Yup.array()
        .required('Field is required')
        .test('nonEmpty', 'Field must not be empty', value => {
          return value && value.length > 0;
        }),
    }),
  });

  const formik = useFormik({
    initialValues: initVals,
    validationSchema: valSchema,
    validateOnMount: true,
  });

  const alertHandler = (title, message) => {
    if (message) dispatch(alertsActions.initiateAlert({ title, message }));
  };

  const { validateFormForSubmit } = useFormikSubmit(formik, alertHandler, 'modal');

  const onDefaultProductData = async response => {
    if (response.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));

    if (response?.data?.data && checkFlashOrError(response?.data?.data)) {
      if (response?.data?.data?.[0]?.flash?.includes('Tax configuration is missing for Product')) {
        return alertHandler('Error', t('ERROR_PRODUCT_MISSING_VAT_CONFIGURATION'));
      }

      return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    }

    if (response.data.data && response.data.data.length > 0) {
      let data = response.data.data;

      const account = await fetchAccount(data[0]?.values?.account);

      const setFetchedValues = async () => {
        setAllValues(formik, {
          product: formik.values.product,
          productName: data[1]?.values?.product?.fullName.split(']')[1] ?? '',
          quantity: Number(Number(formik.values.quantity).toFixed(2)),
          unit: data[0]?.values?.unit || null,
          unitPrice: data[0]?.values?.price ? parseFloat(data[0].values.price).toFixed(2) : '',
          tax: data[0]?.values?.taxLine || null,
          desc: formik.values.desc,
          isPurchase: formik.values.isPurchase,
          fixedAssets: formik.values.fixedAssets,
          account: account || null,
          fixedAssetCategory: formik.values.fixedAssetCategory,
          hasOriginal: formik.values.hasOriginal,
          isClassic: formik.values.isClassic,
        });
      };

      if (!currentLine || (edit && currentLine.product.id !== formik.values.product.id)) {
        setFetchedValues();
      } else {
        setFieldValue(formik, 'account', account || null);
      }
    }
  };

  const fetchAccount = async account => {
    if (!account || !account.id) return null;
    const accountResponseData = await fetchFinancialAccountService(account.id);
    return accountResponseData?.data[0] || null;
  };

  const calculateAmountWithoutTax = () => {
    let amountWithoutTax = parseFloat(formik.values.quantity) * parseFloat(formik.values.unitPrice);

    analyticDistributionLines &&
      analyticDistributionLines.length > 0 &&
      analyticDistributionLines.forEach(line => {
        if (line && line.lineId) {
          dispatch(
            analyticDistributionLinesActions.editLine({
              id: line.lineId,
              analyticDistributionLine: {
                ...line,
                amount: ((line.percentage / 100.0) * parseFloat(formik.values.quantity) * parseFloat(formik.values.unitPrice))
                  .toFixed(2)
                  .toString(),
              },
            })
          );
        }
      });
    return amountWithoutTax > 0 ? amountWithoutTax : 0.0;
  };

  const onAddProductHandler = async () => {
    setIsAdd(true);

    const isValid = await validateFormForSubmit();
    if (!isValid) return null;

    if (formik.isValid && validateError === false) {
      const amountWithoutTax = roundTo(+calculateAmountWithoutTax(), 2);
      const tax = parseFloat(formik.values.tax.name.split(':')[1]);
      const taxAmount = roundTo(+amountWithoutTax * (tax > 0 ? tax : 0), 2);
      const amountWithTax = roundTo(+amountWithoutTax + +taxAmount, 2);

      let payload = {
        companyExTaxTotal: amountWithoutTax.toString(),
        discountAmount: '0.0000000000',
        maxQty: formik.values.hasOriginal ? maxQty : null,
        typeSelect: 0,
        discountTypeSelect: 0,
        price: formik.values.unitPrice,
        fixedAssets: formik.values.fixedAssets,
        inTaxTotal: amountWithTax.toString(),
        budgetDistributionSumAmount: '0',
        exTaxTotal: amountWithoutTax.toString(),
        inTaxPrice: `${(
          parseFloat(formik.values.unitPrice) * parseFloat(formik.values.tax?.name?.split(':')[1] ?? formik.values.tax?.taxRate ?? null)
        ).toFixed(2)}`,
        companyInTaxTotal: amountWithTax.toString(),
        priceDiscounted: formik.values.unitPrice,
        qty: `${formik.values.quantity}`,
        'account.analyticDistributionAuthorized': false,
        product: formik.values.product ? formik.values.product : null,
        taxEquiv: null,
        taxLine: formik.values.tax,
        productName: formik.values.productName,
        productTypeSelect: formik.values.product?.productTypeSelect ?? '',
        taxRate: formik.values.tax?.name?.split(':')[1].trim() ?? formik.values.tax.taxRate.trim() ?? null,
        unit: formik.values.unit ? formik.values.unit : null,
        account: formik.values.account ? formik.values.account : null,
        description: formik.values.desc,
        analyticMoveLineList: analyticDistributionLines,
        sequence: 0,
        analyticDistributionTemplate: null,
        fixedAssetCategory: formik.values.fixedAssetCategory,
        selected: true,
        'product.code': formik.values.product && formik.values.product.productCode ? `${formik.values.product.productCode}` : '',
        id: id !== null ? id : null,
        version: version !== null ? version : null,
      };

      if (edit) {
        dispatch(
          invoiceLinesActions.editLine({
            id: lineId,
            invoiceLine: {
              lineId: lineId,
              ...payload,
            },
          })
        );
        setShow(false);
      } else {
        dispatch(
          invoiceLinesActions.addLine({
            invoiceLine: {
              lineId: Math.floor(Math.random() * 100).toString(),
              ...payload,
            },
          })
        );
        setShow(false);
      }
    } else {
      alertHandler('Error', t('َADD_PRODUCT_ERROR_MESSAGE'));
    }
  };

  const onProductChange = () => {
    api(
      'POST',
      getActionUrl(),
      {
        model: 'com.axelor.apps.account.db.InvoiceLine',
        action: 'action-group-account-invoice-line-product-onchange',
        data: {
          criteria: [],
          context: {
            _model: 'com.axelor.apps.account.db.InvoiceLine',
            product: formik.values.product,
            _parent: parentContext,
            _source: 'product',
          },
        },
      },
      onDefaultProductData
    );
  };

  const getDefaultUnitPayload = () => {
    let payload = {
      fields: ['name', 'labelToPrinting', 'unitTypeSelect'],
      sortBy: null,
      data: {
        _domainContext: {
          _model: MODELS.UNIT,
        },
        operator: 'and',
        criteria: [
          {
            fieldName: 'name',
            operator: 'like',
            value: 'each',
          },
        ],
      },
      limit: -1,
      offset: 0,
      translate: true,
    };
    return payload;
  };

  const getDefaultUnit = async () => {
    let searchRes = await api('POST', getSearchUrl(MODELS.UNIT), getDefaultUnitPayload());
    let total = searchRes?.data?.total;
    let data = searchRes?.data?.data;
    if (!searchRes || searchRes.data.status !== 0 || total === undefined || total === null || !data)
      return alertHandler('Error', 'LBL_ERROR_LOADING_UNIT');

    if (data) {
      setDefaultUnit(data[0]);
    }
  };

  useEffect(() => {
    if (formik.values.product && Object.keys(formik.values.product) && Object.keys(formik.values.product).length > 0) {
      let currentLine = invoicesLines.filter(line => line.lineId === lineId);

      if (
        edit &&
        invoicesLines &&
        invoicesLines.length > 0 &&
        currentLine &&
        currentLine.length > 0
        // &&
        // formik.values.product.id !== currentLine[0].product.id
      ) {
        if (formik.values.product) {
          onProductChange();
        }
      } else if (!edit || (invoicesLines && invoicesLines.length === 0)) {
        if (formik.values.product) {
          onProductChange();
        }
      }
    }
  }, [formik.values.product]);

  useEffect(() => {
    tabsProps.setShowTabsContent(true);

    if (!formik.values.isClassic) {
      getDefaultUnit();
    }

    if (edit) {
      let invoiceLine = invoicesLines.filter(line => line.lineId !== null && line.lineId === lineId)[0];

      const setFetchedValues = async () => {
        setAllValues(formik, {
          product: invoiceLine?.product || null,
          productName: invoiceLine?.product?.fullName?.split(']')[1] ?? invoiceLine?.productName ?? '',
          quantity: Number(Number(invoiceLine.qty).toFixed(2)),
          unit: invoiceLine?.unit || null,
          unitPrice: Number(Number(invoiceLine.price).toFixed(2)),
          tax: invoiceLine?.taxLine || null,
          desc: invoiceLine?.description ?? '',
          isPurchase: purchase,
          fixedAssets: invoiceLine?.fixedAssets,
          account: invoiceLine?.account || null,
          fixedAssetCategory: invoiceLine?.fixedAssetCategory || null,
          hasOriginal: formik.values.hasOriginal,
          isClassic: formik.values.isClassic,
          analyticDistributionLines: analyticDistributionLines,
        });
      };

      setFetchedValues();

      let tempAnalyticLines = [];
      invoiceLine.analyticMoveLineList.forEach(line => {
        let tempLine = {
          lineId: uuidv4(),
          ...line,
        };
        tempAnalyticLines.push(tempLine);
      });
    } else {
      dispatch(
        analyticDistributionLinesActions.setLines({
          analyticDistributionLines: [],
        })
      );
    }
  }, []);

  let isAnalyticsEnabled = () => {
    return !Object.keys(formik.errors)?.filter(field => field !== 'analyticDistributionLines')?.length > 0;
  };

  const analyticsTabDisabledFn = async () => {
    const isValid = await validateFormForSubmit();
    if (!isValid) return null;

    let tempMinQty = getMinQty();

    if (formik.values.isClassic && formik.values.product === '') {
      return alertHandler('Error', t('َPRODUCT_FIRST_ERROR_MESSAGE'));
    } else if (parseFloat(formik.values.quantity) < minDecimalQty) {
      if (tempMinQty === minDecimalQty) return alertHandler('Error', t('QUANTITY_VALIDATION_MESSAGE_2'));
      if (tempMinQty > minDecimalQty || tempMinQty === 0)
        return alertHandler('Error', t('LBL_QUANTITY_MUST_NOT_BE_LESS_THAN') + tempMinQty);
    } else if (parseFloat(formik.values.unitPrice) <= 0.0) {
      return alertHandler('Error', t('UNIT_PRICE_MORETHAN_ERROR_MESSAGE'));
    } else {
      return alertHandler('Error', t('PLEASE_FILL_REQUIRED_ERROR_MESSAGE'));
    }
  };

  useEffect(() => {
    if (isAdd) setIsAdd(false);
  }, [isAdd]);

  return (
    <>
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
            {t(modalTitle)}
          </h5>
        </Modal.Header>
        <Modal.Body>
          <Tabs
            {...tabsProps}
            tabsList={[
              { accessor: 'info', label: 'LBL_INFORMATION', relatedFields: ['product', 'quantity', 'unit', 'unitPrice', 'tax', 'desc'] },
              {
                accessor: 'analytics',
                label: 'LBL_ANALYTICS',
                isConditional: true,
                isHidden: !formik.values.account || !formik.values.account?.analyticDistributionAuthorized,
                isEnabled: isAnalyticsEnabled(),
                isDisabledFn: analyticsTabDisabledFn,
                relatedFields: ['analyticDistributionLines'],
              },
            ]}
            isModal={true}
            formik={formik}
            submitFlag={isAdd}
          >
            <ProductInfoTab
              accessor="info"
              formik={formik}
              edit={edit}
              currentLine={currentLine}
              calculateAmountWithoutTax={calculateAmountWithoutTax}
              defaultUnit={defaultUnit}
              stockLocation={stockLocation}
              parentModel={parentModel}
              fromPO_SO={fromPO_SO}
            />
            <AnalyticLines
              accessor="analytics"
              hasOriginal={formik.values.hasOriginal}
              formik={formik}
              po={isOrder}
              type="invoice"
              parentContext={parentContext}
              validateError={validateError}
              setValidateError={setValidateError}
              alertHandler={alertHandler}
              showDistrubuteByQty={true}
              qty={formik.values.quantity}
            />
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <div className="float-end">
            <PrimaryButton theme="white" onClick={() => setShow(false)} />
            <PrimaryButton theme="purple" text={edit ? 'LBL_OK' : 'LBL_ADD'} onClick={onAddProductHandler} />
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AddProduct;
