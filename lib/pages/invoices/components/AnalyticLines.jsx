import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';

import InteractiveTable from '../../../components/InteractiveTable/InteractiveTable';
import MoreAction from '../../../parts/MoreAction';

import { useAxiosFunction } from '../../../hooks/useAxios';
import { getActionUrl, getSearchUrl } from '../../../services/getUrl';
import { MODELS } from '../../../constants/models';
import { formatFloatNumber } from '../../../utils/helpers';
import { setAllValues, setFieldValue } from '../../../utils/formHelpers';
import { useAnalyticLinesServices } from '../../../services/apis/useAnalyticLinesServices';

function AnalyticLines({
  hasOriginal,
  po,
  type,
  parentContext,
  mode,
  superFormik,
  parentFormik,
  isSave,
  setIsSave,
  postSave,
  setIsLoading,
  alertHandler,
  setIsValid,
}) {
  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  const today = new Date();

  const { onAnalyticAxisSuccess, onAnalyticAccountSuccess } = useAnalyticLinesServices();

  const [showMoreAction, setShowMoreAction] = useState(false);

  const getValidateMoveLinesPayload = action => {
    return {
      model: MODELS.INVOICELINE,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: MODELS.INVOICELINE,
          taxEquiv: null,
          companyExTaxTotal: parentContext?.exTaxTotal || null,
          discountAmount: '0.0000000000',
          project: null,
          description: '',
          typeSelect: 0,
          analyticMoveLineList: parentFormik.values.analyticMoveLineList,
          discountTypeSelect: 0,
          productName: parentContext?.productName || null,
          isHideUnitAmounts: false,
          isShowTotal: false,
          price: parentContext?.price || null,
          fixedAssets: false,
          id: parentContext?.id || null,
          budget: null,
          inTaxTotal: parentContext?.inTaxTotal || null,
          product: null,
          saleOrderLine: null,
          budgetDistributionList: [],
          taxLine: parentContext?.taxLine || null,
          budgetDistributionSumAmount: '0.00',
          exTaxTotal: parentContext?.exTaxTotal || null,
          inTaxPrice: parentContext?.inTaxPrice || null,
          purchaseOrderLine: null,
          version: parentContext && parentContext.version !== null ? parentContext.version : null,
          unit: parentContext?.unit || null,
          companyInTaxTotal: parentContext?.companyInTaxTotal || null,
          priceDiscounted: parentContext?.priceDiscounted || null,
          qty: parentContext?.qty || null,
          analyticDistributionTemplate: null,
          fixedAssetCategory: null,
          account: parentContext?.account || null,
          wkfStatus: null,
          partnerLanguage: 'EN',
          isFilterOnSupplier: true,
          _viewType: 'grid',
          _viewName: 'analytic-move-line-distribution-grid',
          _views: [
            { type: 'grid', name: 'analytic-move-line-distribution-grid' },
            { type: 'form', name: 'analytic-move-line-distribution-form' },
          ],
          _source: 'analyticMoveLineList',
        },
      },
    };
  };

  const validateAnalyticMoveLines = async () => {
    let action = 'action-analytic-move-line-group-analytic-move-line-list-onchange,action-attrs-account-invoice-line-onnew-onload';
    let validateMoveLinesResponse = await api('POST', getActionUrl(), getValidateMoveLinesPayload(action));
    if (validateMoveLinesResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    let data = validateMoveLinesResponse.data.data;

    if (data && data[0] && data[0].attrs && data[0].attrs.isValidAnalyticMoveLineList && !data[0].attrs.isValidAnalyticMoveLineList.value) {
      setIsSave(false);
      if (type === 'journal') {
        return alertHandler(t('PERCENTAGE_FOR_EACH_DIMENSION_SHOULD_BE_100'));
      } else {
        return alertHandler('Error', t('PERCENTAGE_FOR_EACH_DIMENSION_SHOULD_BE_100'));
      }
    }

    setIsValid(true);
    postSave(parentFormik.values.analyticMoveLineList);
  };

  //new implementation
  const [tempData, setTempData] = useState([]);
  const [costCenterDomain, setCostCenterDomain] = useState('self.statusSelect=1');
  const [maxPer, setMaxPer] = useState(100.0);
  const [defaultAnalyticJounral, setDefaultAnalyicJournal] = useState(null);
  const lineHeaders = ['LBL_AXIS', 'LBL_COST_CENTER', 'LBL_PERCENTAGE', 'LBL_AMOUNT'];

  const onPercentageChange = ({ value, rowData, rowFormik }) => {
    setAllValues(rowFormik, {
      lineId: rowFormik.values?.lineId,
      percentage: value,
      typeSelect: 2,
      analyticJournal: rowFormik.values?.analyticJournal ?? null,
      amount: rowFormik.values?.amount,
      date: moment(today).locale('en').format('YYYY-MM-DD'),
      analyticAxis: rowFormik.values?.analyticAxis ?? null,
      analyticAccount: rowFormik.values?.analyticAccount ?? null,
      selected: true,
      id: rowFormik.values?.id,
      version: rowFormik.values.version !== undefined ? rowFormik.values.version : undefined,
    });
    computeAmount(rowFormik, value);
  };

  const onDimensionChange = ({ value, rowData, rowFormik }) => {
    setCostCenterDomain(`self.analyticAxis = ${value?.id} and self.statusSelect = 1`);
    // setFieldValue(rowFormik, 'analyticAccount', null);
    const per = getRemaningPer(rowFormik, value);
    setAllValues(rowFormik, {
      lineId: rowFormik.values?.lineId,
      percentage: per,
      typeSelect: 2,
      analyticJournal: rowFormik.values?.analyticJournal ?? null,
      amount: rowFormik.values?.amount,
      date: moment(today).locale('en').format('YYYY-MM-DD'),
      analyticAxis: value ?? null,
      analyticAccount: null,
      selected: true,
      id: rowFormik.values?.id,
      version: rowFormik.values.version !== undefined ? rowFormik.values.version : undefined,
    });
    computeAmount(rowFormik, per);
  };

  const onCostCenterChange = ({ value, rowData, rowFormik }) => {
    setAllValues(rowFormik, {
      lineId: rowFormik.values?.lineId,
      percentage: rowFormik?.values?.percentage,
      typeSelect: 2,
      analyticJournal: rowFormik.values?.analyticJournal ?? null,
      amount: rowFormik.values?.amount,
      date: moment(today).locale('en').format('YYYY-MM-DD'),
      analyticAxis: rowFormik.values?.analyticAxis ?? null,
      analyticAccount: value ?? null,
      selected: true,
      id: rowFormik.values?.id,
      version: rowFormik.values.version !== undefined ? rowFormik.values.version : undefined,
    });
  };

  const tableInputs = [
    {
      type: 'searchdrop',
      accessor: 'axis',
      label: 'LBL_AXIS',
      props: {
        modelKey: 'ANALYTIC_AXIS',
        isRequired: true,
        onSuccess: onAnalyticAxisSuccess,
        tooltip: 'dimension',
        selectCallback: onDimensionChange,
        defaultValueConfig: {
          payloadDomain: 'self.id=1',
        },
      },
    },
    {
      type: 'searchdrop',
      accessor: 'analyticAccount',
      label: 'LBL_ANALYTIC_ACCOUNT',
      props: {
        modelKey: 'ANALYTIC_ACCOUNTS',
        isRequired: true,
        onSuccess: onAnalyticAccountSuccess,
        selectIdentifier: 'fullName',
        payloadDomain: costCenterDomain,
        tooltip: 'analyticAccount',
        defaultValueConfig: null,
        selectCallback: onCostCenterChange,
      },
    },
    {
      type: 'text',
      accessor: 'percentage',
      label: 'LBL_PERCENTAGE',
      props: {
        disabled: mode === 'view',
        onChange: onPercentageChange,
      },
    },
    {
      type: 'number',
      accessor: 'amount',
      label: 'LBL_AMOUNT',
      props: {
        disabled: true,
      },
    },
  ];
  const getRemaningPer = (rowFormik, value, edit) => {
    let remainingPerctange = null;
    parentFormik.values?.analyticMoveLineList?.length > 0 &&
      parentFormik.values?.analyticMoveLineList
        .filter(line => line?.analyticAxis?.id === value?.id && line.lineId !== rowFormik?.values?.lineId)
        .forEach(line => {
          remainingPerctange = remainingPerctange + parseFloat(line.percentage);
        });
    remainingPerctange = parseFloat(100 - remainingPerctange).toFixed(2);
    if (!edit) {
      setFieldValue(rowFormik, 'percentage', remainingPerctange);
    }
    setMaxPer(parseFloat(remainingPerctange).toFixed(2));
    return remainingPerctange;
  };
  const getComputeAmountPayload = (action, formik, percentage) => {
    // parentContext = { ...parentContext, analyticMoveLineList: analyticDistributionLines };
    return {
      model: MODELS.ANALYTICMOVELINE,
      action: 'action-analytic-move-line-method-compute-amount,action-method-calculate-amount-with-percentage-analytic-move-line',
      data: {
        criteria: [],
        context: {
          _model: MODELS.ANALYTICMOVELINE,
          originalPieceAmount: parseFloat(Number(parentFormik.values.qty) * Number(parentFormik.values.price))
            .toFixed(2)
            .toString(),
          amount: '0',
          percentage: parseFloat(percentage).toFixed(2).toString(),
          typeSelect: 2,
          analyticJournal: formik.values.analyticJournal,
          date: moment(today).locale('en').format('YYYY-MM-DD'),
          analyticAxis: formik.values.analyticAxis,
          analyticAccount: formik.values.analyticAccount,
          // _parent: parentContext,
          _viewType: 'grid',
          _viewName: 'analytic-move-line-distribution-grid',
          _views: [
            { type: 'grid', name: 'analytic-move-line-distribution-grid' },
            { type: 'form', name: 'analytic-move-line-distribution-form' },
          ],
          _source: 'percentage',
        },
      },
    };
  };

  const computeAmount = async (formik, percentage) => {
    let action = 'action-analytic-move-line-method-compute-amount,action-method-calculate-amount-with-percentage-analytic-move-line';
    let computeAmountResponse = await api('POST', getActionUrl(), getComputeAmountPayload(action, formik, percentage));
    if (computeAmountResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    setFieldValue(formik, 'amount', computeAmountResponse.data.data?.[0]?.values?.amount);
    // setCalculatedAmount(computeAmountResponse.data.data?.[0]?.values?.amount ?? null);
  };

  const valSchema = Yup.object().shape({
    analyticAxis: Yup.object().required(t('AXIS_VALIDATION_MESSAGE')).nullable(),
    analyticAccount: Yup.object().nullable().required(t('ANALYTIC_ACCOUNT_VALIDATION_MESSAGE')),
    percentage: Yup.number(t('BUILDING_NUMBER_VALIDATION'))
      .typeError(t('BUILDING_NUMBER_VALIDATION'))
      .required(t('PERCENTAGE_VALIDATION_MESSAGE'))
      .min(0.01, t('LBL_NUMBER_MUST_NOT_BE_ZERO'))
      .max(maxPer, t('PERCENTAGE_VALIDATION_MESSAGE_2') + maxPer.toString()),
    date: Yup.date().required(t('DATE_VALIDATION_MESSAGE')),
  });

  const editLine = ({ lineId, line }) => {
    let currentInvoiceLineIndex = parentFormik.values?.analyticMoveLineList.findIndex(line => line.lineId && line.lineId === lineId);
    let tempLines = [...parentFormik.values?.analyticMoveLineList];
    tempLines[currentInvoiceLineIndex] = line;
    setFieldValue(parentFormik, 'analyticMoveLineList', [...tempLines]);
  };
  const onAddNewLine = () => {
    let tempLines = [...parentFormik.values.analyticMoveLineList];
    tempLines.push({
      lineId: uuidv4(),
      percentage: maxPer,
      typeSelect: 2,
      amount: (Number(parentFormik.values.qty) * Number(parentFormik.values.price)).toFixed(2),
      analyticJournal: defaultAnalyticJounral ?? null,
      date: moment(today).locale('en').format('YYYY-MM-DD'),
      analyticAxis: null,
      analyticAccount: null,
      selected: true,
      id: null,
    });
    setFieldValue(parentFormik, 'analyticMoveLineList', tempLines);
  };
  const onEditLine = ({ rowData, rowFormik }) => {
    setAllValues(rowFormik, {
      lineId: rowFormik.values?.lineId,
      percentage: rowFormik?.values?.percentage,
      typeSelect: 2,
      analyticJournal: rowFormik.values?.analyticJournal ?? null,
      amount: rowFormik.values?.amount,
      date: moment(today).locale('en').format('YYYY-MM-DD'),
      analyticAxis: rowFormik.values?.analyticAxis ?? null,
      analyticAccount: rowFormik.values?.analyticAccount ?? null,
      selected: true,
      id: rowFormik.values?.id,
      version: rowFormik.values.version !== undefined ? rowFormik.values.version : undefined,
    });
    getRemaningPer(rowFormik, rowData?.analyticAxis, true);
  };

  const onDeleteLine = async ({ rowData, rowFormik }) => {
    setFieldValue(parentFormik, 'analyticMoveLineList', [
      ...parentFormik.values.analyticMoveLineList.filter(line => line.lineId !== rowData?.lineId),
    ]);
    // getRemaningPer(rowFormik, rowData?.analyticAxis);
  };

  const onSaveLine = async ({ rowData, rowFormik }) => {
    getRemaningPer(rowFormik, rowData?.analyticAxis);
    editLine({
      lineId: rowData?.lineId,
      line: {
        lineId: rowData?.lineId,
        percentage: Number(rowData?.percentage).toFixed(2).toString(),
        typeSelect: 2,
        amount: rowData?.amount.toString(),
        analyticJournal: defaultAnalyticJounral ?? null,
        date: moment(today).locale('en').format('YYYY-MM-DD'),
        analyticAxis: rowData?.analyticAxis,
        analyticAccount: rowData?.analyticAccount,
        selected: true,
        id: rowData?.id,
        version: rowData.version !== undefined ? rowData.version : undefined,
      },
    });
  };

  const getDefaultAnalyticJounral = async () => {
    const getAnalyticJounralResponse = await api('POST', getSearchUrl(MODELS.ANALYTICJOURNAL), {
      fields: ['name', 'type.name', 'company.name'],
      sortBy: null,
      data: { _domain: null, _domainContext: { _model: 'com.axelor.apps.account.db.AnalyticJournal' }, operator: 'and', criteria: [] },
      limit: 1,
      offset: 0,
      translate: true,
    });

    setDefaultAnalyicJournal(getAnalyticJounralResponse?.data?.data?.[0]);
  };

  useEffect(() => {
    getDefaultAnalyticJounral();
  }, []);
  useEffect(() => {
    if (parentFormik.values?.analyticMoveLineList?.length > 0) {
      let tempLines = [...parentFormik.values?.analyticMoveLineList];
      let tempArr = [];
      tempLines.forEach(line => {
        tempArr.push({
          isDeleteable: mode !== 'view' && !hasOriginal && !po,
          isEditable: mode !== 'view',
          isViewable: true,
          tableData: [
            { value: line?.axis ?? null, type: 'text' },
            { value: line?.analyticAccount ?? null, type: 'text' },
            { value: line?.percentage ?? 0, type: 'number' },
            { value: line?.amount ?? null, type: 'text' },
          ],
          data: line,
          key: line.lineId,
          headData: formatFloatNumber(line?.analyticAccount ?? null),
        });
      });
      setTempData(tempArr);
    } else {
      setTempData([]);
      setIsValid(false);
      alertHandler('Error', t('ADD_ANALYTICLINE_MESSAGE'));
    }
  }, [tableInputs?.length, parentFormik.values.analyticMoveLineList]);

  useEffect(() => {
    if (parentFormik.values.analyticMoveLineList?.length > 0) {
      setIsValid(true);
    }
  }, [parentFormik.values.analyticMoveLineList]);

  useEffect(() => {
    if (isSave) {
      validateAnalyticMoveLines();
    }
  }, [isSave]);

  return (
    <>
      {showMoreAction && (
        <MoreAction
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          editHandler={() => {
            setShowEditAnalyticDistributionLinePop(true);
          }}
          deleteHandler={() => deleteAnalyticDistributionLine(currentAnalyticLineId)}
        />
      )}
      <InteractiveTable
        title="LBL_ANALYTICS"
        addTitle="LBL_ADD"
        pageMode={mode}
        lineHeaders={lineHeaders}
        lineData={tempData}
        tableInputs={tableInputs}
        lineValidationSchema={valSchema}
        canAdd={!hasOriginal}
        // isAddDisabled={!canAddDetails}
        onAddNewLine={onAddNewLine}
        onEditLine={onEditLine}
        onDeleteLine={onDeleteLine}
        onSaveLine={onSaveLine}
        // isRowValidCondition={isRowValidCondition}
        // onCancelLine={deleteFormikMoveLineList}
      />

      {/* {showAddAnalyticDistributionLinePop && (
        <AddAnalyticLine
          show={showAddAnalyticDistributionLinePop}
          setShow={setShowAddAnalyticDistributionLinePop}
          edit={false}
          originalAmount={
            lineAmount
              ? lineAmount
              : parseFloat(formik.values.quantity) * parseFloat(formik.values.unitPrice) > 0.0
                ? (parseFloat(formik.values.quantity) * parseFloat(formik.values.unitPrice)).toFixed(2)
                : 0.0
          }
          po={po === true ? true : false}
          type={type}
          parentContext={parentContext}
          showDistrubuteByQty={showDistrubuteByQty}
          qty={qty}
        />
      )}
      {showEditAnalyticDistributionLinePop && (
        <AddAnalyticLine
          show={showEditAnalyticDistributionLinePop}
          setShow={setShowEditAnalyticDistributionLinePop}
          edit={true}
          lineId={currentAnalyticLineReduxId}
          id={currentAnalyticLineId}
          version={currentAnalyticLineVersion}
          originalAmount={
            lineAmount
              ? lineAmount
              : parseFloat(formik.values.quantity) * parseFloat(formik.values.unitPrice) > 0.0
                ? (parseFloat(formik.values.quantity) * parseFloat(formik.values.unitPrice)).toFixed(2)
                : 0.0
          }
          po={po === true ? true : false}
          type={type}
          parentContext={parentContext}
          showDistrubuteByQty={showDistrubuteByQty}
          qty={qty}
        />
      )} */}
    </>
  );
}

export default AnalyticLines;
