// import { useEffect, useState, useMemo } from 'react';
// import { useTranslation } from 'react-i18next';
// import { useDispatch, useSelector } from 'react-redux';
// import { roundTo } from 'round-to';
// import moment from 'moment';
// import { v4 as uuidv4 } from 'uuid';

// import InteractiveTable from '../../../components/InteractiveTable/InteractiveTable';
// import AddProductModal from '../../../containers/formModals/productModals/AddProductModal';
// // import AnalyticLines from './AnalyticLines';

// import { checkFlashOrError } from '../../../utils/helpers';
// import { useAxiosFunction } from '../../../hooks/useAxios';
// import { getActionUrl, getSearchUrl } from '../../../services/getUrl';
// import { MODELS } from '../../../constants/models';
// import { setAllValues, setFieldValue, setSelectedValues } from '../../../utils/formHelpers';
// import { useInvoiceLinesServices } from '../../../services/apis/useInvoiceLinesServices';
// import { invoiceTypeEnum } from '../../../constants/enums/InvoicingEnums';
// import { useFinancialAccountsServices } from '../../../services/apis/useFinancialAccountsServices';
// import { useFeatures } from '../../../hooks/useFeatures';
// import { alertsActions } from '../../../store/alerts';
// import { useAnalyticLinesServices } from '../../../services/apis/useAnalyticLinesServices';
// import { getInvoiceLineValidationSchema } from '../../../validations/InvoiceValidation';

// function InvoiceLines({
//   formik,
//   // setShowMoreAction,
//   // setDeletedLine,
//   purchase,
//   isOrder,
//   hasOriginal,
//   edit,
//   status,
//   invoiceType,
//   operationTypeSelect,
//   operationSubTypeSelect,
//   // modalTitle,
//   // stockLocation,
//   // parentModel,
//   fromPO_SO = false,
//   // fetchedInvoicelines,
//   mode,
//   title = 'INVOICE_PRODUCT_DETAILS',
//   config,
// }) {
//   const { t } = useTranslation();
//   const dispatch = useDispatch();
//   const { api } = useAxiosFunction();
//   const { fetchFinancialAccountService } = useFinancialAccountsServices();
//   const { isFeatureAvailable } = useFeatures();
//   const isCostCenterFeatureAvailable = isFeatureAvailable({ featureCode: '13' });

//   const [isFixedAsset, setIsFixedAsset] = useState(false);
//   const { onProductSearchSuccess, onFixedAssetCategorySuccess, onTaxLinesSearchsSuccess, onUnitSearchSuccess, onAccountsSearchSuccess } =
//     useInvoiceLinesServices();
//   const { onAnalyticAccountSuccess } = useAnalyticLinesServices();
//   let company = useSelector(state => state.userFeatures.companyInfo.company);

//   const alertHandler = (title, message) => {
//     if (message) dispatch(alertsActions.initiateAlert({ title, message }));
//   };

//   const today = new Date();
//   const [parentContext, setParentContext] = useState({});
//   const fixedAssetAvailable = useMemo(() => {
//     return isFeatureAvailable({ featureCode: '14' });
//   }, []);

//   // const editLine = ({ lineId, line }) => {
//   //   // let currentInvoiceLineIndex = formik.values?.invoiceLines.findIndex(line => line.lineId && line.lineId === lineId);
//   //   // let tempLines = formik.values?.invoiceLines ? [...formik.values.invoiceLines] : [];
//   //   // tempLines[currentInvoiceLineIndex] = line;
//   //   // setFieldValue(formik, 'invoiceLines', [...tempLines]);
//   // };

//   const purchasableProductDomain =
//     "self.isModel = false AND self.dtype = 'Product' AND self.purchasable = true AND self.isActivity = false";
//   const sellableProductDomain = "self.isModel = false AND self.dtype = 'Product' AND self.sellable = true AND self.isActivity = false";
//   const depreciationAccountDomain = "self.accountType.technicalTypeSelect = 'immobilisation' AND self.statusSelect = 1";
//   const purchaseTaxDomain = 'self.tax.typeSelect in (2)';
//   const saleTaxDomain = 'self.tax.typeSelect  = 1';
//   const saleAccountDomain = `self.accountType.technicalTypeSelect IN ('income') AND self.statusSelect = 1`;
//   const purchaseAccountDomain = `self.accountType.technicalTypeSelect IN ('charge') AND self.statusSelect = 1`;

//   const getLineHeaders = () => {
//     let lineHeaders = ['LBL_PRODUCT'];

//     if ((operationSubTypeSelect === 8 || operationSubTypeSelect === '8') && purchase && fixedAssetAvailable)
//       lineHeaders.push('LBL_FA_CATEGORY');

//     lineHeaders.push('LBL_QUANTITY', 'LBL_PRICE', 'THE_UNIT', 'LBL_TAX', 'TAV');

//     if (!isOrder) lineHeaders.push('LBL_ACCOUNT');

//     if (isCostCenterFeatureAvailable && !isOrder) lineHeaders.push('C_CENTER');

//     lineHeaders.push('LBL_DESCRIPTION');
//     return lineHeaders;
//   };

//   const fetchAccount = async account => {
//     if (!account || !account.id) return null;
//     const accountResponseData = await fetchFinancialAccountService(account.id);
//     return accountResponseData?.data[0] || null;
//   };

//   const onDefaultProductData = async ({ value, rowFormik }) => {
//     const response = await api('POST', getActionUrl(), {
//       model: MODELS.INVOICELINE,
//       action: 'action-group-account-invoice-line-product-onchange',
//       data: {
//         criteria: [],
//         context: {
//           _model: MODELS.INVOICELINE,
//           product: value,
//           _parent: parentContext,
//           _source: 'product',
//         },
//       },
//     });
//     if (response.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));

//     if (response?.data?.data && checkFlashOrError(response?.data?.data)) {
//       if (response?.data?.data?.[0]?.flash?.includes('Tax configuration is missing for Product')) {
//         return alertHandler('Error', t('ERROR_PRODUCT_MISSING_VAT_CONFIGURATION'));
//       }

//       return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
//     }

//     if (response.data.data && response.data.data.length > 0) {
//       let data = response.data.data;

//       const account = await fetchAccount(data[0]?.values?.account);
//       let line = { ...rowFormik.values };

//       let { exTaxTotal, inTaxTotal } = calculateTotals({
//         qty: rowFormik.values.qty ?? 1.0,
//         price: data[0].values.price,
//         taxLine: data[0]?.values?.taxLine,
//       });

//       line.product = data[1]?.values?.product;
//       line.productName = data[1]?.values?.product?.fullName.split(']')[1] ?? rowFormik?.values?.product;
//       line.product.name = data[1]?.values?.product?.fullName.split(']')[1].trim();
//       line['product.code'] = data[1]?.values?.product?.fullName.split(' ')[0] ?? '';
//       line['product.name'] = data[1]?.values?.product?.name ?? '';
//       line.qty = '1.0';
//       line.unit = data[0]?.values?.unit || null;
//       line.price = data[0]?.values?.price ? Number(Number(data[0].values.price).toFixed(2)).toString() : '';
//       line.taxLine = { ...data[0]?.values?.taxLine, value: data[0]?.values?.taxLine?.name.split(':')[1]?.trim() } || null;
//       line.taxRate = data[0]?.values?.taxLine?.name.split(':')[1]?.trim() ?? null;
//       line.account = account ?? null;
//       line['account.analyticDistributionAuthorized'] = account?.analyticDistributionAuthorized ?? false;
//       line['account.code'] = account?.code ?? false;
//       line.exTaxTotal = exTaxTotal?.toString();
//       line.inTaxTotal = inTaxTotal?.toString();
//       line.companyExTaxTotal = exTaxTotal?.toString();
//       line.companyInTaxTotal = inTaxTotal?.toString();
//       line.priceDiscounted = data[0]?.values?.price ? Number(Number(data[0].values.price).toFixed(2)).toString() : '';

//       line.description = '';

//       if (account?.analyticDistributionAuthorized && isCostCenterFeatureAvailable) {
//         let tempAnalyticLines = await getAnalyticLines(line);
//         line.analyticAccount = rowFormik?.values?.analyticAccount ?? tempAnalyticLines?.[0]?.analyticAccount;
//         line.analyticMoveLineList = tempAnalyticLines;
//       } else {
//         line.analyticAccount = null;
//         line.analyticMoveLineList = [];
//       }

//       line.lineId = rowFormik?.values?.lineId ?? uuidv4();
//       return line;
//     }
//   };

//   const returnNewLine = value => {
//     return onDefaultProductData({ value, rowFormik: { values: {} } });
//   };

//   const onProductChange = async ({ rowData, value, rowFormik }) => {
//     let line = { ...rowFormik.values };

//     if (operationSubTypeSelect === '1' || operationSubTypeSelect === 1) {
//       line = await onDefaultProductData({ value, rowFormik });
//     } else {
//       let { exTaxTotal, inTaxTotal } = calculateTotals({
//         qty: rowFormik.values.qty,
//         price: rowFormik.values.price,
//         taxLine: rowFormik.values?.taxLine,
//       });
//       line.lineId = uuidv4();
//       line.product = null;
//       line.productName = value;
//       line.qty = Number(Number(rowFormik.values.qty).toFixed(2))?.toString();
//       line.price = Number(Number(rowFormik.values.price).toFixed(2))?.toString();
//       line.inTaxTotal = inTaxTotal?.toString();
//       line.exTaxTotal = exTaxTotal?.toString();
//       line.companyExTaxTotal = exTaxTotal?.toString();
//       line.companyInTaxTotal = inTaxTotal?.toString();
//       line.inTaxPrice =
//         Number(Number(rowFormik.values?.price) * Number(rowFormik.values?.taxLine?.name.split(':')[1]))
//           .toFixed(2)
//           ?.toString() ?? '';
//     }

//     let currentParentValue = [...formik.values['invoiceLineList']];
//     let selectedIndex = currentParentValue.findIndex(el => el?.lineId === rowData?.lineId);

//     if (selectedIndex === -1) return null;
//     const isAnalyticDistributionAuthorized =
//       (line?.account && line?.account?.analyticDistributionAuthorized === true) || line?.['account.analyticDistributionAuthorized'];

//     if (isAnalyticDistributionAuthorized && isCostCenterFeatureAvailable) {
//       let tempAnalyticLines = await getAnalyticLines(line);
//       line.analyticAccount = rowData?.analyticAccount ?? tempAnalyticLines?.[0]?.analyticAccount;
//       line.analyticMoveLineList = tempAnalyticLines;
//       // line['account.analyticDistributionAuthorized'] = isAnalyticDistributionAuthorized;
//       currentParentValue[selectedIndex]['analyticMoveLineList'] = tempAnalyticLines;
//     } else {
//       line.analyticAccount = null;
//       line.analyticMoveLineList = [];
//       currentParentValue[selectedIndex]['analyticMoveLineList'] = [];
//     }

//     setAllValues(rowFormik, { ...line });
//     currentParentValue[selectedIndex] = { ...line };

//     // currentParentValue[selectedIndex]['product'] = line?.product ?? null;
//     setFieldValue(formik, 'invoiceLineList', currentParentValue);
//   };

//   const onProductRemove = ({ rowData, rowFormik }) => {
//     let line = { ...rowFormik.values };

//     line.product = null;
//     if (line?.['product.code']) line['product.code'] = undefined;
//     if (line?.['product.productCode']) line['product.productCode'] = undefined;
//     if (line?.['product.productName']) line['product.productName'] = undefined;
//     if (line?.['product.fullName']) line['product.fullName'] = undefined;
//     if (line?.['product.name']) line['product.name'] = undefined;
//     if (line?.productName) line.productName = '';

//     let currentParentValue = [...formik.values['invoiceLineList']];
//     let selectedIndex = currentParentValue.findIndex(el => el?.lineId === rowData?.lineId);

//     if (selectedIndex === -1) return null;

//     setAllValues(rowFormik, { ...line });
//     currentParentValue[selectedIndex] = { ...line };

//     // currentParentValue[selectedIndex]['product'] = line?.product ?? null;

//     setFieldValue(formik, 'invoiceLineList', currentParentValue);
//   };

//   const onQtyChange = async ({ rowData, value, rowFormik }) => {
//     let { exTaxTotal, inTaxTotal } = calculateTotals({ price: rowFormik.values.price, qty: value, taxLine: rowFormik.values?.taxLine });
//     let line = { ...rowFormik.values };

//     if (rowFormik?.values?.product !== null && (operationSubTypeSelect === '1' || operationSubTypeSelect === 1)) {
//       line['product.code'] = rowFormik?.values?.product?.fullName?.split(' ')[0] ?? '';
//       line['product.name'] = rowFormik?.values?.product?.name ?? '';
//     }

//     line.qty = Number(Number(value).toFixed(2)).toString();
//     line.price = rowFormik?.values?.price ? Number(Number(rowFormik.values.price).toFixed(2)).toString() : '';
//     line.inTaxTotal = inTaxTotal?.toString();
//     line.exTaxTotal = exTaxTotal?.toString();
//     line.companyExTaxTotal = exTaxTotal?.toString();
//     line.companyInTaxTotal = inTaxTotal?.toString();
//     line.inTaxPrice =
//       Number(Number(rowFormik.values?.price) * Number(rowFormik.values?.taxLine?.name.split(':')[1]))
//         .toFixed(2)
//         ?.toString() ?? '';

//     let currentParentValue = [...formik.values['invoiceLineList']];
//     let selectedIndex = currentParentValue.findIndex(el => el?.lineId === rowData?.lineId);
//     if (selectedIndex === -1) return null;

//     if (!isOrder) {
//       if (
//         ((line?.account && line?.account?.analyticDistributionAuthorized === true) || line?.['account.analyticDistributionAuthorized']) &&
//         isCostCenterFeatureAvailable
//       ) {
//         let tempAnalyticLines = await getAnalyticLines(line);
//         line.analyticAccount = rowData?.analyticAccount ?? tempAnalyticLines?.[0]?.analyticAccount;
//         line.analyticMoveLineList = tempAnalyticLines;
//         currentParentValue[selectedIndex]['analyticMoveLineList'] = tempAnalyticLines;
//       } else {
//         line.analyticAccount = null;
//         line.analyticMoveLineList = [];
//         currentParentValue[selectedIndex]['analyticMoveLineList'] = [];
//       }
//     }

//     line.maxQty = rowFormik.values.maxQty;
//     setSelectedValues(rowFormik, { ...line });

//     currentParentValue[selectedIndex] = { ...line };
//     setFieldValue(formik, 'invoiceLineList', [...currentParentValue]);
//   };

//   const calculateTotals = ({ price, qty, taxLine }) => {
//     const exTaxTotal = isNaN(roundTo(+(parseFloat(qty) * parseFloat(price)), 2))
//       ? ''
//       : roundTo(+(parseFloat(qty) * parseFloat(price)), 2).toFixed(2);
//     const tax = parseFloat(taxLine?.name.split(':')[1] ?? '');
//     const taxAmount = roundTo(+exTaxTotal * (tax > 0 ? tax : 0), 2);
//     const inTaxTotal = isNaN(roundTo(+exTaxTotal + +taxAmount, 2)) ? '' : roundTo(+exTaxTotal + +taxAmount, 2);
//     return { exTaxTotal, tax, taxAmount, inTaxTotal };
//   };

//   const onPriceChange = async ({ rowData, value, rowFormik }) => {
//     let { exTaxTotal, inTaxTotal } = calculateTotals({
//       price: Number(value)?.toFixed(2)?.toString(),
//       qty: rowFormik.values.qty,
//       taxLine: rowFormik.values?.taxLine,
//     });
//     let line = { ...rowFormik.values };
//     line.price = Number(value)?.toFixed(2)?.toString();

//     if (rowFormik?.values?.product !== null && (operationSubTypeSelect === '1' || operationSubTypeSelect === 1)) {
//       line['product.code'] = rowFormik?.values?.product?.fullName?.split(' ')[0] ?? '';
//       line['product.name'] = rowFormik?.values?.product?.name ?? '';
//     }

//     line.inTaxTotal = inTaxTotal?.toString();
//     line.exTaxTotal = exTaxTotal?.toString();
//     line.companyExTaxTotal = exTaxTotal?.toString();
//     line.companyInTaxTotal = inTaxTotal?.toString();
//     line.inTaxPrice =
//       Number(Number(value) * Number(rowFormik.values?.taxLine?.name.split(':')[1]))
//         .toFixed(2)
//         ?.toString() ?? '';
//     line.priceDiscounted = value?.toString() ?? '';
//     let currentParentValue = [...formik.values['invoiceLineList']];
//     let selectedIndex = currentParentValue.findIndex(el => el?.lineId === rowData?.lineId);
//     if (selectedIndex === -1) return null;

//     if (!isOrder) {
//       if (
//         ((line?.account && line?.account?.analyticDistributionAuthorized === true) || line?.['account.analyticDistributionAuthorized']) &&
//         isCostCenterFeatureAvailable
//       ) {
//         let tempAnalyticLines = await getAnalyticLines(line);
//         line.analyticAccount = rowData?.analyticAccount ?? tempAnalyticLines?.[0]?.analyticAccount;
//         line.analyticMoveLineList = tempAnalyticLines;
//         currentParentValue[selectedIndex]['analyticMoveLineList'] = tempAnalyticLines;
//       } else {
//         line.analyticAccount = null;
//         line.analyticMoveLineList = [];
//         currentParentValue[selectedIndex]['analyticMoveLineList'] = [];
//       }
//     }

//     setSelectedValues(rowFormik, { ...line });

//     currentParentValue[selectedIndex] = { ...line };
//     setFieldValue(formik, 'invoiceLineList', currentParentValue);
//   };

//   const onTaxLineChange = async ({ rowData, value, rowFormik }) => {
//     let { exTaxTotal, inTaxTotal } = calculateTotals({
//       price: rowFormik.values.price,
//       qty: rowFormik.values.qty,
//       taxLine: value,
//     });

//     let line = { ...rowFormik.values };

//     if (rowFormik?.values?.product !== null && (operationSubTypeSelect === '1' || operationSubTypeSelect === 1)) {
//       line['product.code'] = rowFormik?.values?.product?.fullName?.split(' ')[0] ?? '';
//       line['product.name'] = rowFormik?.values?.product?.name ?? '';
//     }

//     line.taxLine = value;
//     line.inTaxTotal = inTaxTotal?.toString();
//     line.exTaxTotal = exTaxTotal?.toString();
//     line.companyExTaxTotal = exTaxTotal?.toString();
//     line.companyInTaxTotal = inTaxTotal?.toString();
//     line.inTaxPrice =
//       Number(Number(rowFormik.values?.price) * Number(value?.name.split(':')[1]))
//         .toFixed(2)
//         ?.toString() ?? '';
//     line.taxRate = value?.name.split(':')[1]?.trim() ?? null;

//     let currentParentValue = [...formik.values['invoiceLineList']];
//     let selectedIndex = currentParentValue.findIndex(el => el?.lineId === rowData?.lineId);
//     if (selectedIndex === -1) return null;

//     if (!isOrder) {
//       if (
//         ((line?.account && line?.account?.analyticDistributionAuthorized === true) || line?.['account.analyticDistributionAuthorized']) &&
//         isCostCenterFeatureAvailable
//       ) {
//         let tempAnalyticLines = await getAnalyticLines(line);
//         line.analyticAccount = rowData?.analyticAccount ?? tempAnalyticLines?.[0]?.analyticAccount;
//         line.analyticMoveLineList = tempAnalyticLines;
//         currentParentValue[selectedIndex]['analyticMoveLineList'] = tempAnalyticLines;
//       } else {
//         line.analyticAccount = null;
//         line.analyticMoveLineList = [];
//         currentParentValue[selectedIndex]['analyticMoveLineList'] = [];
//       }
//     }

//     setSelectedValues(rowFormik, { ...line });
//     currentParentValue[selectedIndex] = { ...line };
//     setFieldValue(formik, 'invoiceLineList', currentParentValue);
//   };

//   const getFixedAssetAccountPayload = () => {
//     return {
//       fields: ['analyticDistributionAuthorized', 'label'],
//       sortby: null,
//       data: {
//         _domain: depreciationAccountDomain,
//       },
//     };
//   };

//   const onFixedAssetCategoryChange = async ({ rowData, value, rowFormik }) => {
//     const getFixedAssetAccount = await api('POST', getSearchUrl(MODELS.ACCOUNT), getFixedAssetAccountPayload());
//     setIsFixedAsset(true);

//     let line = { ...rowFormik.values };

//     if (rowFormik?.values?.product !== null && (operationSubTypeSelect === '1' || operationSubTypeSelect === 1)) {
//       line['product.code'] = rowFormik?.values?.product?.fullName?.split(' ')[0] ?? '';
//       line['product.name'] = rowFormik?.values?.product?.name ?? '';
//     }

//     line.account = getFixedAssetAccount?.data?.data?.[0] ?? null;
//     line.fixedAssets = value !== null ? true : false;
//     line.fixedAssetCategory = value;
//     let currentParentValue = [...formik.values['invoiceLineList']];
//     let selectedIndex = currentParentValue.findIndex(el => el?.lineId === rowData?.lineId);
//     if (selectedIndex === -1) return null;

//     if (!isOrder) {
//       if (
//         ((line?.account && line?.account?.analyticDistributionAuthorized === true) || line?.['account.analyticDistributionAuthorized']) &&
//         isCostCenterFeatureAvailable
//       ) {
//         let tempAnalyticLines = await getAnalyticLines(line);
//         line.analyticAccount = rowData?.analyticAccount ?? tempAnalyticLines?.[0]?.analyticAccount;
//         line.analyticMoveLineList = tempAnalyticLines;
//         currentParentValue[selectedIndex]['analyticMoveLineList'] = tempAnalyticLines;
//       } else {
//         line.analyticAccount = null;
//         line.analyticMoveLineList = [];
//         currentParentValue[selectedIndex]['analyticMoveLineList'] = [];
//       }
//     }

//     setSelectedValues(rowFormik, { ...line });

//     currentParentValue[selectedIndex] = { ...line };
//     setFieldValue(formik, 'invoiceLineList', currentParentValue);
//   };

//   const onCostCenterChange = async ({ rowData, value, rowFormik }) => {
//     let line = { ...rowFormik.values };

//     if (rowFormik?.values?.product !== null && (operationSubTypeSelect === '1' || operationSubTypeSelect === 1)) {
//       line['product.code'] = rowFormik?.values?.product?.fullName?.split(' ')[0] ?? '';
//       line['product.name'] = rowFormik?.values?.product?.name ?? '';
//     }

//     let currentParentValue = [...formik.values['invoiceLineList']];
//     let selectedIndex = currentParentValue.findIndex(el => el?.lineId === rowData?.lineId);
//     if (selectedIndex === -1) return null;
//     line.analyticAccount = value;
//     let tempAnalyticLines = await getAnalyticLines(line);
//     line.analyticMoveLineList = tempAnalyticLines;
//     currentParentValue[selectedIndex]['analyticMoveLineList'] = tempAnalyticLines;

//     setSelectedValues(rowFormik, { ...line });
//     currentParentValue[selectedIndex] = { ...line };
//     setFieldValue(formik, 'invoiceLineList', currentParentValue);
//     // setAllValues(rowFormik, { ...line });
//   };
//   // const onClickExtraHandler = async ({ rowFormik }) => {
//   //   let tempAnalyticLines = [...rowFormik.values.analyticMoveLineList];
//   //   tempAnalyticLines.forEach(item => {
//   //     item.amount = ((Number(item.percentage) / 100) * Number(rowFormik?.values?.qty) * Number(rowFormik?.values?.price)).toString();
//   //   });
//   //   setFieldValue(rowFormik, 'analyticMoveLineList', tempAnalyticLines);
//   //   setFieldValue(rowFormik, 'copyAnalyticMoveLineList', tempAnalyticLines);
//   // };

//   // const saveAnalyticLines = ({ values, rowFormik }) => {
//   //   setFieldValue(rowFormik, 'analyticMoveLineList', values);
//   //   setFieldValue(
//   //     rowFormik,
//   //     'displayedMultiValue',
//   //     values?.length > 1 ? t('LBL_MULTI_VALUES') : values?.[0]?.analyticAccount?.fullName ?? ''
//   //   );
//   // };
//   const onAccountChange = async ({ value, rowFormik, row }) => {
//     let line = { ...rowFormik.values };

//     if (rowFormik?.values?.product !== null && (operationSubTypeSelect === '1' || operationSubTypeSelect === 1)) {
//       line['product.code'] = rowFormik?.values?.product?.fullName?.split(' ')[0] ?? '';
//       line['product.name'] = rowFormik?.values?.product?.name ?? '';
//     }

//     const isAnalyticDistributionAuthorized = value?.analyticDistributionAuthorized;
//     line.account = value;
//     line['account.analyticDistributionAuthorized'] = isAnalyticDistributionAuthorized;
//     let currentParentValue = [...formik.values['invoiceLineList']];
//     let selectedIndex = currentParentValue.findIndex(el => el?.lineId === row?.lineId);

//     if (!isAnalyticDistributionAuthorized && isCostCenterFeatureAvailable) {
//       line.analyticMoveLineList = [];
//       line.analyticAccount = null;
//       currentParentValue[selectedIndex]['account.analyticDistributionAuthorized'] = false;
//       currentParentValue[selectedIndex]['analyticMoveLineList'] = [];
//       currentParentValue[selectedIndex]['analyticAccount'] = null;
//     } else {
//       let tempLines = await getAnalyticLines(line);
//       line.analyticMoveLineList = tempLines;
//       line.analyticAccount = tempLines?.[0]?.analyticAccount;
//       setFieldValue(rowFormik, 'analyticAccount', tempLines?.[0]?.analyticAccount);
//       currentParentValue[selectedIndex]['account.analyticDistributionAuthorized'] = true;
//       currentParentValue[selectedIndex]['analyticMoveLineList'] = tempLines;
//       currentParentValue[selectedIndex]['analyticAccount'] = tempLines?.[0]?.analyticAccount;
//       currentParentValue[selectedIndex] = { ...currentParentValue[selectedIndex], analyticMoveLineList: tempLines };
//       setFieldValue(formik, 'invoiceLineList', currentParentValue);
//     }

//     setAllValues(rowFormik, { ...line });
//     if (selectedIndex === -1) return null;
//     setFieldValue(formik, 'invoiceLineList', currentParentValue);
//   };

//   const getTableInputs = () => {
//     let tableInputs = [];

//     if (operationSubTypeSelect === 1 || operationSubTypeSelect === '1') {
//       tableInputs.push({
//         type: 'searchdrop',
//         accessor: 'product',
//         colSpace: 2,
//         label: 'LBL_PRODUCT',
//         props: {
//           modelKey: formik.values.stockLocation ? 'PRODUCTS_WITH_QUANTITY' : 'PRODUCTS',
//           isRequired: (operationSubTypeSelect === '1' || operationSubTypeSelect === 1) && !fromPO_SO,
//           disabled: hasOriginal || fromPO_SO || mode === 'view',
//           onSuccess: onProductSearchSuccess,
//           selectIdentifier: 'name',
//           // originalData: !formik.values.isClassic ? null : edit && invoiceLines && invoiceLines.length > 0 ? currentLine.product : null,
//           tooltip: purchase ? 'purchasableProduct' : 'sellableProduct',
//           payloadDomain: purchase ? purchasableProductDomain : sellableProductDomain,
//           payloadDomainContext: {
//             _parent: {
//               stockLocation: formik.values.stockLocation,
//             },
//             _xFillProductAvailableQty: true,
//             _model: config.subFeatureChecks.isSupplierRelated ? MODELS.PURCHASEORDERLINE : MODELS.SALE_ORDER_LINE,
//           },
//           defaultValueConfig: null,
//           extraFields: ['fullName', 'productTypeSelect', 'name'],
//           selectCallback: onProductChange,
//           removeCallback: onProductRemove,
//           tooltipIdentifier: 'fullName',
//         },
//       });
//     } else {
//       tableInputs.push({
//         type: 'text',
//         accessor: 'productName',
//         colSpace: 2,
//         label: 'LBL_PRODUCT',
//         props: {
//           isRequired: mode !== 'view' || status === 'Draft' || status === 'Validated',
//           disabled: hasOriginal || fromPO_SO || mode === 'view',
//           onChange: onProductChange,
//         },
//       });
//     }

//     if ((operationSubTypeSelect === 8 || operationSubTypeSelect === '8') && purchase && fixedAssetAvailable) {
//       tableInputs.push({
//         type: 'searchdrop',
//         accessor: 'fixedAssetCategory',
//         colSpace: 1,
//         props: {
//           modelKey: 'FIXED_ASSET_CATEGORIES',
//           onSuccess: onFixedAssetCategorySuccess,
//           defaultValueConfig: null,
//           selectIdentifier: 'name',
//           isRequired: true,
//           disabled: hasOriginal || fromPO_SO || mode === 'view',
//           selectCallback: onFixedAssetCategoryChange,
//           label: 'LBL_FA_CATEGORY',
//         },
//       });
//     }

//     tableInputs.push(
//       {
//         type: 'number',
//         accessor: 'qty',
//         colSpace: 1,
//         label: 'LBL_QUANTITY',
//         props: {
//           disabled: mode === 'view',
//           onChange: onQtyChange,
//         },
//       },
//       {
//         type: 'number',
//         accessor: 'price',
//         colSpace: 2,
//         label: 'LBL_PRICE',
//         props: {
//           onChange: onPriceChange,
//           disabled: hasOriginal || fromPO_SO || mode === 'view',
//         },
//       },
//       {
//         type: 'searchdrop',
//         accessor: 'unit',
//         colSpace: 2,
//         props: {
//           modelKey: 'UNITS',
//           isRequired: hasOriginal && !formik.values.fixedAssets && !fromPO_SO,
//           disabled: hasOriginal || formik.values.fixedAssets || fromPO_SO || mode === 'view',
//           onSuccess: onUnitSearchSuccess,
//           defaultValueConfig: {
//             payloadDomain: 'self.id=1',
//           },
//           label: 'LBL_MU',
//         },
//       },
//       // {
//       //   type: 'text',
//       //   accessor: 'exTaxTotal',
//       //   colSpace: 1,
//       //   label: 'LBL_TOTAL_WITHOUT_TAX',
//       //   props: {
//       //     disabled: true,
//       //   },
//       // },
//       {
//         type: 'searchdrop',
//         accessor: 'taxLine',
//         label: 'LBL_TAX',
//         colSpace: 1,
//         props: {
//           modelKey: 'TAX_LINES',
//           isRequired: !hasOriginal && !fromPO_SO,
//           disabled: hasOriginal || fromPO_SO || mode === 'view',
//           onSuccess: onTaxLinesSearchsSuccess,
//           payloadDomain: purchase ? purchaseTaxDomain : saleTaxDomain,
//           defaultValueConfig: {
//             payloadDomain: purchase ? purchaseTaxDomain : saleTaxDomain,
//           },
//           extraFields: ['name', 'value'],
//           selectCallback: onTaxLineChange,
//           selectIdentifier: /* 'name' */ 'value',
//           tooltipIdentifier: 'name',
//         },
//       },
//       {
//         type: 'number',
//         accessor: 'inTaxTotal',
//         colSpace: 1,
//         label: 'TAV',
//         props: {
//           disabled: true,
//         },
//       }
//     );

//     if (!isOrder) {
//       tableInputs.push({
//         type: 'searchdrop',
//         accessor: 'account',
//         colSpace: 1,
//         label: 'LBL_ACCOUNT',
//         props: {
//           modelKey: 'ACCOUNTS',
//           isRequired: !formik.values.isClassic,
//           disabled: hasOriginal || fromPO_SO || mode === 'view',
//           onSuccess: onAccountsSearchSuccess,
//           tooltip: 'customerInvoiceAccount',
//           payloadDomain: isFixedAsset ? depreciationAccountDomain : purchase ? purchaseAccountDomain : saleAccountDomain,
//           defaultValueConfig: {
//             payloadDomain: isFixedAsset ? depreciationAccountDomain : purchase ? purchaseAccountDomain : saleAccountDomain,
//           },
//           selectIdentifier: /* 'label' */ 'code',
//           extraFields: ['analyticDistributionAuthorized', 'code'],
//           selectCallback: onAccountChange,
//           tooltipIdentifier: 'label',
//         },
//       });
//     }

//     if (isCostCenterFeatureAvailable && !isOrder) {
//       tableInputs.push({
//         type: 'searchdrop',
//         accessor: 'analyticAccount',
//         colSpace: 1,
//         isHidden: row => {
//           return (
//             (row?.account?.analyticDistributionAuthorized !== undefined && row.account.analyticDistributionAuthorized === false) ||
//             (row?.['account.analyticDistributionAuthorized'] !== undefined && row?.['account.analyticDistributionAuthorized'] === false) ||
//             isOrder
//           );
//         },
//         props: {
//           modelKey: 'ANALYTIC_ACCOUNTS',
//           mode: mode,
//           isRequired: mode !== 'view',
//           onSuccess: onAnalyticAccountSuccess,
//           payloadDomain: 'self.statusSelect=1',
//           tooltip: 'analyticAccount',
//           selectIdentifier: 'fullName',
//           defaultValueConfig: null,
//           extraFields: ['analyticAxis'],
//           selectCallback: onCostCenterChange,
//           label: /* 'LBL_COST_CENTERS' */ 'C_CENTER',
//         },
//       });
//     }

//     tableInputs.push({ type: 'textarea', colSpace: 2, accessor: 'description', label: 'LBL_DESCRIPTION' });

//     return tableInputs;
//   };

//   // const getMaxQty = value => {
//   //   return selectedLine?.maxQty || undefined;
//   // };

//   useEffect(() => {
//     getDefaultAnalyticLine();
//   }, []);

//   useEffect(() => {
//     let temp = {
//       _operationTypeSelect: operationTypeSelect,
//       todayDate: moment(today).locale('en').format('YYYY-MM-DD'),
//       operationTypeSelect: operationTypeSelect,
//       statusSelect: 1,
//       operationSubTypeSelect: operationSubTypeSelect,
//       company: company || null,
//       currency: formik.values.currency || null,
//       paymentMode: formik.values.paymentMode || null,
//       paymentCondition: formik.values.paymentCondition || null,
//       partner: formik.values.partner || null,
//       address: formik.values.address ? formik.values.address : formik.values.mainAddres ? formik.values.mainAddres : null,
//       language: {
//         code: 'en',
//         name: 'English',
//         id: 1,
//       },
//       paymentVouchersOnInvoice: false,
//       _model: MODELS.INVOICE,
//       invoiceLineList: [],
//     };
//     setParentContext(temp);
//   }, []);

//   const canAddDetails = (status === 'Draft' || status === 'Validated') && !hasOriginal && !fromPO_SO && mode !== 'view' && formik.isValid;

//   const onDeleteLine = ({ rowData }) => {
//     let tempLine = { ...rowData };

//     let tempLines = [...formik.values.invoiceLineList];
//     let newLines = tempLines.filter(line => line.lineId !== tempLine.lineId);
//     setSelectedValues(formik, {
//       invoiceLineList: newLines,
//     });
//   };

//   const getAnalyticLines = async line => {
//     let tempAnalyticMoveLinesList = [];
//     const { analyticMoveLineList } = await getDefaultAnalyticLine(line);

//     if (line?.analyticMoveLineList?.length === 0 || line.analyticMoveLineList === undefined) {
//       tempAnalyticMoveLinesList = analyticMoveLineList;
//     } else {
//       line?.analyticMoveLineList?.forEach(item => {
//         let temp = {
//           ...item,
//           percentage: item.percentage ?? '100.00',
//           date: moment(today).locale('en').format('YYYY-MM-DD'),
//           analyticJournal: analyticMoveLineList?.[0]?.analyticJournal,
//           analyticAxis: line?.analyticAccount?.analyticAxis ?? analyticMoveLineList?.[0]?.analyticAxis,
//           analyticAccount: line?.analyticAccount ?? analyticMoveLineList?.[0]?.analyticAccount,
//           originalPieceAmount: Number(parseFloat(line.qty) * parseFloat(line.price))
//             .toFixed(2)
//             ?.toString(),
//           amount: ((Number(item.percentage ?? '100.00').toFixed(2) / 100.0) * parseFloat(line.qty) * parseFloat(line.price))
//             .toFixed(2)
//             .toString(),
//         };
//         tempAnalyticMoveLinesList.push(temp);
//       });
//     }

//     return tempAnalyticMoveLinesList;
//   };

//   // const onSaveLine = async ({ rowData }) => {
//   //   let line = { ...rowData };
//   //   line.price = Number(line?.price).toFixed(2).toString();
//   //   line.qty = Number(line?.qty).toFixed(2).toString();
//   //   line.analyticMoveLineList = [...getAnalyticLines(line)];
//   //   line.copyAnalyticMoveLineList = [...getAnalyticLines(line)];
//   //   saveUpdatedLine({ line, accessor: 'invoiceLines' });
//   // };

//   // const saveCopyLine = ({ rowData }) => {
//   //   let line = { ...rowData };
//   //   line.price = Number(line?.price).toFixed(2).toString();
//   //   line.qty = Number(line?.qty).toFixed(2).toString();
//   //   line.analyticMoveLineList = [...getAnalyticLines(line)];
//   //   line.copyAnalyticMoveLineList = [...getAnalyticLines(line)];
//   //   saveUpdatedLine({ line, accessor: 'copyInvoiceLines' });
//   // };

//   // const saveUpdatedLine = ({ line, accessor }) => {
//   //   let lines = [...formik.values[accessor]];
//   //   let index = lines.findIndex(l => l.lineId === line.lineId);
//   //   if (index === -1) lines.push(line);
//   //   else lines[index] = line;
//   //   setFieldValue(formik, accessor, lines);
//   // };
//   const getDefaultAnalyticLine = async line => {
//     const getAnalyticJounralResponse = await api('POST', getSearchUrl(MODELS.ANALYTICJOURNAL), {
//       fields: ['name', 'type.name', 'company.name'],
//       sortBy: null,
//       data: { _domain: null, _domainContext: { _model: 'com.axelor.apps.account.db.AnalyticJournal' }, operator: 'and', criteria: [] },
//       limit: 1,
//       offset: 0,
//       translate: true,
//     });
//     let analyticJournal = getAnalyticJounralResponse?.data?.data?.[0];

//     const getCostCenterResponse = await api('POST', getSearchUrl(MODELS.ANALYTICACCOUNT), {
//       fields: ['fullName', 'name', 'type.name', 'company.name', 'analyticAxis'],
//       sortBy: null,
//       data: { _domain: 'self.statusSelect=1', _domainContext: { _model: MODELS.ANALYTICACCOUNT }, operator: 'and', criteria: [] },
//       limit: 1,
//       offset: 0,
//       translate: true,
//     });

//     let costCenter = getCostCenterResponse?.data?.data?.[0];
//     let tempAnalyticLines = [
//       {
//         lineId: uuidv4(),
//         percentage: '100.0',
//         typeSelect: 2,
//         amount: line ? (Number(line?.qty) * Number(line?.price)).toFixed(2).toString() : '0.00',
//         analyticJournal: analyticJournal ?? null,
//         date: moment(today).locale('en').format('YYYY-MM-DD'),
//         analyticAxis: costCenter?.analyticAxis ?? null,
//         analyticAccount: costCenter ?? null,
//         originalPieceAmount: '0.00',
//         selected: true,
//         id: null,
//       },
//     ];
//     // line.displayedMultiValue = tempAnalyticLines?.[0]?.analyticAccount?.fullName ?? '';
//     let analyticAccount = costCenter ?? null;

//     return { analyticAccount, analyticMoveLineList: tempAnalyticLines };
//   };

//   const onAddNewLine = async ({ rowFormik, value }) => {
//     let values = null;

//     if (operationSubTypeSelect === '1' || operationSubTypeSelect === 1) {
//       values = await onDefaultProductData({ value, rowFormik });
//     } else {
//       const { analyticAccount, analyticMoveLineList } = await getDefaultAnalyticLine();
//       values = {
//         id: rowFormik?.values?.id ?? null,
//         version: rowFormik?.values.version !== undefined ? rowFormik?.values.version : undefined,
//         lineId: uuidv4(),
//         product: null,
//         productName: value,
//         qty: '1.0',
//         price: '0.0',
//         taxRate: '',
//         priceDiscounted: '0.00',
//         description: '',
//         isPurchase: purchase,
//         fixedAssets: false,
//         fixedAssetCategory: null,
//         hasOriginal: hasOriginal,
//         isClassic: invoiceType !== invoiceTypeEnum['FREE_TEXT'],
//         exTaxTotal: '0.00',
//         inTaxTotal: '0.00',
//         analyticAccount: rowFormik.values?.analyticAccount ?? analyticAccount,
//         analyticMoveLineList: isCostCenterFeatureAvailable ? analyticMoveLineList : null,
//         companyExTaxTotal: '0.00',
//         companyInTaxTotal: '0.00',
//       };
//     }

//     const newRow = { ...rowFormik.values, ...values };

//     let tempLines = [...formik.values.invoiceLineList];
//     tempLines.push(newRow);
//     setFieldValue(formik, 'invoiceLineList', [...tempLines]);
//     setAllValues(rowFormik, { ...newRow });
//   };

//   const getDefaultRow = () => {
//     let defaultLineId = uuidv4();
//     return {
//       id: null,
//       version: undefined,
//       lineId: defaultLineId,
//       product: null,
//       productName: '',
//       qty: 1.0,
//       unit: null,
//       price: 0.0,
//       taxLine: null,
//       taxRate: '',
//       description: '',
//       isPurchase: purchase,
//       fixedAssets: false,
//       account: null,
//       fixedAssetCategory: null,
//       hasOriginal: hasOriginal,
//       isClassic: invoiceType !== invoiceTypeEnum['FREE_TEXT'],
//       exTaxTotal: '0.00',
//       inTaxTotal: '0.00',
//       // displayedMultiValue: '',
//       // analyticMoveLineList: tempAnalyticLines,
//       companyExTaxTotal: '0.00',
//       companyInTaxTotal: '0.00',
//       priceDiscounted: '0.00',
//     };
//   };

//   let defaultRow = getDefaultRow();

//   const isRowValidCondition = rowFormik => {
//     // if (hasOriginal) {
//     //   return (
//     //     parseFloat(rowFormik.values.qty) < parseFloat(rowFormik.values.maxQty) &&
//     //     parseFloat(rowFormik.values.price) > 0 &&
//     //     rowFormik.values.productName !== '' &&
//     //     rowFormik.values.taxLine !== null
//     //   );
//     // } else {
//     //   return (
//     //     parseFloat(rowFormik.values.qty) > 0 &&
//     //     parseFloat(rowFormik.values.price) > 0 &&
//     //     rowFormik.values.productName !== '' &&
//     //     rowFormik.values.taxLine !== null
//     //   );
//     // }
//     return true;
//   };

//   return (
//     <>
//       <InteractiveTable
//         title={title}
//         tooltip="LBL_CANNOT_ADD_PRODUCT_UNTIL_VALID"
//         pageMode={mode}
//         lineHeaders={getLineHeaders()}
//         tableInputs={getTableInputs()}
//         lineValidationSchema={getInvoiceLineValidationSchema({ fromPO_SO, edit, isOrder, t, formik })}
//         canAdd={canAddDetails}
//         onAddNewLine={onAddNewLine}
//         onDeleteLine={onDeleteLine}
//         // onSaveLine={onSaveLine}
//         // onSaveCopy={saveCopyLine}
//         defaultRow={defaultRow}
//         hasActions={true}
//         parentFormik={formik}
//         parentAccessor="invoiceLineList"
//         isRowValidCondition={isRowValidCondition}
//         addConfig={
//           mode !== 'view' && operationSubTypeSelect == 1
//             ? {
//                 title: 'PRODUCTS.CREATE',
//                 FormComponent: AddProductModal,
//                 modalTitle: 'PRODUCTS.NEW',
//                 accessor: 'product',
//                 // type: 'searchdrop',
//                 returnNewLine: returnNewLine,
//               }
//             : null
//         }
//       />
//     </>
//   );
// }

// export default InvoiceLines;
