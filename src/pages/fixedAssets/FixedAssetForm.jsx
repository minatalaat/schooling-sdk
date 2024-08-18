import { useEffect, useState, useMemo } from 'react';
import moment from 'moment';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';

import AddAnalyticDistributionTemplate from '../../components/AddAnalyticDistributionTemplate';
import DepreciationInformation from './DepreciationInformation';
import opactiyCheckCircle from '../../assets/images/opacitycheck.png';
import checkCircle from '../../assets/images/check.png';
import TextInput from '../../components/ui/inputs/TextInput';
import SearchModalAxelor from '../../components/ui/inputs/SearchModal/SearchModalAxelor';
import DateInput from '../../components/ui/inputs/DateInput';
import NumberInput from '../../components/ui/inputs/NumberInput';
import Tabs from '../../components/ui/inputs/Tabs';
import AttachmentInput from '../../components/ui/inputs/AttachmentInput';
import FormNotes from '../../components/ui/FormNotes';

import { MODELS } from '../../constants/models';
import { useAxiosFunction } from '../../hooks/useAxios';
import { getActionUrl, getRemoveAllUrl, getVerifyUrl } from '../../services/getUrl';
import { FIXED_ASSET_STATUS_REV_ENUM } from '../../constants/enums/FixedAssetEnum';
import { useTabs } from '../../hooks/useTabs';
import { checkFlashOrError, parseFloatFixedTwo } from '../../utils/helpers';
import { VALID_TEXT_WITH_SPECIAL_CHARS } from '../../constants/regex/Regex';
import { useDepreciationServices } from '../../services/apis/useDepreciationServices';
import { useFormikSubmit } from '../../hooks/useFormikSubmit';
import { useFeatures } from '../../hooks/useFeatures';

function FixedAssetForm({
  data,
  isSave,
  isDelete,
  addNew,
  enableEdit,
  setActionInProgress,
  alertHandler,
  finishedSaveHandler,
  finishedDeleteHandler,
  isComputeDepreciation,
  finishedComputeDepreciationHandler,
  isValidate,
  finishedValidateHandler,
  fetchFixedAsset,
}) {
  const subFeature = 'FIXED_ASSETS';
  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  let depreciationLines = useSelector(state => state.depreciationLines.depreciationLines);
  let company = useSelector(state => state.userFeatures.companyInfo.company);
  let tabsProps = useTabs();
  const { realizeLineService } = useDepreciationServices(alertHandler);
  const { isFeatureAvailable } = useFeatures();

  const [depreciationData, setDepreciationData] = useState(null);
  const [durationData, setDurationData] = useState(null);
  const [parentContext, setParentContext] = useState(null);
  const [parentSaveDone, setParentSaveDone] = useState(false);
  const [fetchedObject, setFetchedObject] = useState(false);
  const [onSuccessFn, setOnSuccessFn] = useState();
  const journalDomain = "self.code = 'FAJ'";

  const initialValues = {
    fixedAssetCategory: data?.fixedAssetCategory || null,
    currency: data?.currency || null,
    name: data?.name?.replace(' (1.00)', '') || '',
    partner: data?.partner || null,
    acquisitionDate: data ? data.acquisitionDate : '',
    firstDepreciationDate: data ? data.firstDepreciationDate : '',
    qty: parseFloatFixedTwo(data?.qty ?? 1.0),
    depreciationPlanSelect: data ? (data.depreciationPlanSelect ? data.depreciationPlanSelect : '1') : '1',
    grossValue: data ? data.grossValue : 1.0,
    residualValue: data ? data.residualValue : 0.0,
    journal: data?.journal || null,
    purchaseAccount: data?.purchaseAccount || null,
    stockLocation: data?.stockLocation || null,
    analyticDistributionTemplate: data?.analyticDistributionTemplate || null,
  };

  const validationSchema = Yup.object({
    name: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).trim().required(t('REQUIRED')),
    currency: Yup.object().nullable().required(t('REQUIRED')),
    fixedAssetCategory: Yup.object().nullable().required(t('REQUIRED')),
    acquisitionDate: Yup.date().required(t('REQUIRED')),
    firstDepreciationDate: Yup.date()
      .required(t('REQUIRED'))
      .test('is-greater-or-equal', t('VALIDATION_FIRST_DEPRECIATION'), function (value) {
        const { acquisitionDate } = this.parent;
        return !acquisitionDate || !value || value >= acquisitionDate;
      }),
    partner: Yup.object().nullable().required(t('REQUIRED')),
    journal: Yup.object().nullable().required(t('REQUIRED')),
    purchaseAccount: Yup.object().nullable().required(t('REQUIRED')),
    grossValue: Yup.number().required(t('GROSS_VALUE_VALIDATION_MESSAGE')).min(0.01, t('LBL_NUMBER_MUST_NOT_BE_ZERO')),
    residualValue: Yup.number().required(t('GROSS_VALUE_VALIDATION_MESSAGE')).min(0.0, t('LBL_NUMBER_MUST_NOT_BE_ZERO')),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: addNew ? true : false,
  });

  const { validateFormForSubmit } = useFormikSubmit(formik, alertHandler);

  const stockManagementAvailable = useMemo(() => {
    return isFeatureAvailable({ featureCode: '12' });
  }, []);

  const costCenterAvailable = useMemo(() => {
    return isFeatureAvailable({ featureCode: '13' });
  }, []);

  useEffect(() => {
    if (isSave) {
      saveRecord();
    }

    if (isDelete) {
      deleteRecord();
    }

    if (isComputeDepreciation) {
      computeDepreciation();
    }

    if (isValidate) {
      validateRecord();
    }
  }, [isSave, isComputeDepreciation, isDelete, isValidate, addNew, enableEdit]);

  useEffect(() => {
    tabsProps.setShowTabsContent(true);
  }, []);

  useEffect(() => {
    getDeprationData();
  }, [formik.values.fixedAssetCategory]);

  useEffect(() => {
    if (data) setParentContext(data);
  }, [data]);

  const getDeprationDataPayload = action => {
    let payload = {
      model: MODELS.FIXED_ASSET,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: MODELS.FIXED_ASSET,
          _id: null,
          fixedAssetCategory: formik.values.fixedAssetCategory ? { id: formik.values.fixedAssetCategory.id } : null,
          depreciationPlanSelect: '2',
        },
      },
    };
    return payload;
  };

  const getDeprationData = async () => {
    let action = 'action-group-account-record-on-change-depreciation-plan';
    const depreciationDataResponse = await api('POST', getActionUrl(), getDeprationDataPayload(action));
    if (depreciationDataResponse.data.status === 0) setDepreciationData(depreciationDataResponse.data.data);
  };

  const onCurrencySuccess = response => {
    if (response.data.status === 0) {
      let data = response.data.data;
      let temp4 = [];

      if (data) {
        data.forEach(currency => {
          let obj = {
            id: currency.id,
            name: currency.name,
            prinitingcode: currency.code,
            symbol: currency.symbol,
            isocode: currency.codeISO,
          };

          temp4.push(obj);
        });
      }

      return { displayedData: [...temp4], total: response.data.total || 0 };
    }
  };

  const onFixedAssetCategorySuccess = response => {
    if (response.data.status === 0) {
      let data = response.data.data;
      let categories = [];

      if (data) {
        data.forEach(category => {
          let temp = {
            id: category.id,
            name: category?.name ?? '',
            fixedAssetType: category ? (category.fixedAssetType ? category.fixedAssetType.name : '') : '',
          };
          categories.push(temp);
        });
      }

      return { displayedData: [...categories], total: response.data.total || 0 };
    }
  };

  const onCustomersSearchSuccess = response => {
    if (response.data.status === 0) {
      let data = response.data.data;
      let temp2 = [];

      if (data) {
        data.forEach(customer => {
          let obj = {
            id: customer.id ? customer.id : -1,
            fullName: customer.fullName,
            partnerSeq: customer.partnerSeq,
            simpleFullName: customer.simpleFullName,
            fixedphone: customer.fixedphone,
            email: customer.emailAddress,
            category: customer.partnerCategory,
            fiscalposition: customer.fiscalPosition,
            registrationcode: customer.registrationcode,
            address: customer.mainAddress,
            companies: customer.companyStr,
          };
          temp2.push(obj);
        });
      }

      return { displayedData: [...temp2], total: response.data.total || 0 };
    }
  };

  const onJournalsSuccess = res => {
    if (res.data.status === 0) {
      if (!res.data.data) return alertHandler('Error', t('NO_DATA_AVAILABLE'));
      return { displayedData: [...(res?.data?.data || [])], total: res.data.total || 0 };
    } else {
      alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    }
  };

  const onAccountsDatasSuccess = response => {
    if (response.data.status === 0) {
      return { displayedData: [...response.data.data], total: response.data.total || 0 };
    }
  };

  const onStockLocationsSuccess = response => {
    if (response.data.status === 0) {
      let data = response.data.data || [];
      return { displayedData: [...data], total: response.data.total || 0 };
    }
  };

  const onAnalyticDistributionTemplateSuccess = response => {
    if (response.data.status === 0) {
      let data = response.data.data || [];
      let tempData = [];

      if (data) {
        data.forEach(item => {
          tempData.push({
            name: item ? item.name : '',
          });
        });
      }

      return { displayedData: [...tempData], total: response.data.total || 0 };
    }
  };

  const getSavePayload = () => {
    let payload = {
      model: MODELS.FIXED_ASSET,
      action: 'action-fixed-asset-transfer-and-update',
      data: {
        criteria: [],
        context: {
          _model: MODELS.FIXED_ASSET,
          fixedAsset: {
            acquisitionDate: moment(formik.values.acquisitionDate).locale('en').format('YYYY-MM-DD'),
            depreciationPlanSelect: '2',
            periodicityTypeSelect: 1,
            fixedAssetLineList: depreciationLines,
            reference: data?.rreference || null,
            durationInMonth: durationData ? (durationData.durationInMonth ? parseInt(durationData.durationInMonth) : null) : null,
            computationMethodSelect: durationData ? (durationData.computationMethod ? durationData.computationMethod : null) : null,
            barcodeTypeConfig: null,
            firstDepreciationDateInitSelect: 2,
            id: data?.id || null,
            barcode: null,
            trackingNumber: null,
            firstServiceDate: moment(formik.values.firstDepreciationDate).locale('en').format('YYYY-MM-DD'),
            firstDepreciationDate: moment(formik.values.firstDepreciationDate).locale('en').format('YYYY-MM-DD'),
            nbrOfPastDepreciations: data?.nbrOfPastDepreciations || null,
            alreadyDepreciatedAmount: data?.alreadyDepreciatedAmount || null,
            purchaseAccount: formik.values.purchaseAccount,
            saleAccountMove: null,
            version: data && data.version !== null ? data.version : null,
            grossValue: parseFloat(formik.values.grossValue).toFixed(2).toString(),
            residualValue: parseFloat(formik.values.residualValue).toFixed(2).toString(),
            purchaseAccountMove: null,
            qty: '1.00',
            disposalDate: null,
            name: formik.values.name,
            numberOfDepreciation: durationData ? (durationData.durationInMonth ? parseInt(durationData.durationInMonth) : null) : null,
            correctedAccountingValue: data?.correctedAccountingValue || null,
            journal: formik.values.journal,
            company: company,
            periodicityInMonth: 1,
            disposalValue: data?.disposalValue || null,
            statusSelect: data?.statusSelect || 1,
            degressiveCoef: '0.00',
            originSelect: data?.originSelect || 1,
            partner: formik.values.partner,
            accountingValue: data?.accountingValue || '0.00',
            analyticDistributionTemplate: formik.values.analyticDistributionTemplate,
            fixedAssetCategory: formik.values.fixedAssetCategory ? { id: formik.values.fixedAssetCategory.id } : null,
            stockLocation: formik.values.stockLocation,
            isEqualToFiscalDepreciation: false,
          },
        },
      },
    };
    return payload;
  };

  const saveRecord = async () => {
    const isValid = await validateFormForSubmit();
    if (!isValid) return null;

    setActionInProgress(true);
    const saveModelResponse = await api('POST', getActionUrl(), getSavePayload());
    if (saveModelResponse.data.status !== 0) return alertHandler('error', t('SOMETHING_WENT_WRONG'));
    setOnSuccessFn('save');
    setFetchedObject(saveModelResponse.data.data);
    setParentSaveDone(true);
  };

  const deleteRecord = () => {
    setActionInProgress(true);
    const payload = {
      records: [{ id: data.id }],
    };
    api('POST', getRemoveAllUrl(MODELS.FIXED_ASSET), payload, () => {
      finishedDeleteHandler('success');
    });
  };

  const getComputeDeprectionFirstActionPayload = (action, data) => {
    let payload = {
      model: MODELS.FIXED_ASSET,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: MODELS.FIXED_ASSET,
          _id: data?.id || null,
          acquisitionDate: moment(formik.values.acquisitionDate).locale('en').format('YYYY-MM-DD'),
          depreciationPlanSelect: '2',
          periodicityTypeSelect: 1,
          fixedAssetLineList: depreciationLines,
          reference: data?.rreference || null,
          durationInMonth: durationData ? (durationData.durationInMonth ? parseInt(durationData.durationInMonth) : null) : null,
          computationMethodSelect: durationData ? (durationData.computationMethod ? durationData.computationMethod : null) : null,
          isEqualToFiscalDepreciation: false,
          barcodeTypeConfig: null,
          firstDepreciationDateInitSelect: 2,
          id: data?.id || null,
          barcode: null,
          trackingNumber: null,
          firstServiceDate: moment(formik.values.firstDepreciationDate).locale('en').format('YYYY-MM-DD'),
          firstDepreciationDate: moment(formik.values.firstDepreciationDate).locale('en').format('YYYY-MM-DD'),
          nbrOfPastDepreciations: data?.nbrOfPastDepreciations || null,
          alreadyDepreciatedAmount: data?.alreadyDepreciatedAmount || null,
          purchaseAccount: formik.values.purchaseAccount,
          saleAccountMove: null,
          version: data && data.version !== null ? data.version : null,
          grossValue: parseFloat(formik.values.grossValue).toFixed(2).toString(),
          purchaseAccountMove: null,
          qty: '1.00',
          disposalDate: null,
          name: formik.values.name,
          numberOfDepreciation: durationData ? (durationData.durationInMonth ? parseInt(durationData.durationInMonth) : null) : null,
          correctedAccountingValue: data?.correctedAccountingValue || null,
          residualValue: parseFloat(formik.values.residualValue).toFixed(2).toString(),
          journal: formik.values.journal,
          company: company,
          periodicityInMonth: 1,
          disposalValue: data?.disposalValue || null,
          statusSelect: data?.statusSelect || 1,
          degressiveCoef: '0.00',
          originSelect: data?.originSelect || 1,
          partner: formik.values.partner,
          accountingValue: data?.accountingValue || '0.00',
          analyticDistributionTemplate: formik.values.analyticDistributionTemplate,
          fixedAssetCategory: formik.values.fixedAssetCategory ? { id: formik.values.fixedAssetCategory.id } : null,
          stockLocation: formik.values.stockLocation,
        },
      },
    };
    return payload;
  };

  const getVerifyPayload = fetchedData => {
    return { data: { id: fetchedData?.id || null, version: fetchedData && fetchedData.version !== null ? fetchedData.version : null } };
  };

  const computeDepreciation = async () => {
    const isValid = await validateFormForSubmit();
    if (!isValid) return null;

    setActionInProgress(true);
    let action = 'action-group-account-fixed-asset-failover-control, action-fixed-asset-group-compute-depreciation-click';
    const computeDepreciationFirstActionResponse = await api('POST', getActionUrl(), getComputeDeprectionFirstActionPayload(action));
    if (computeDepreciationFirstActionResponse.data.status !== 0) return alertHandler('error', t('SOMETHING_WENT_WRONG'));
    if (computeDepreciationFirstActionResponse.data.data && checkFlashOrError(computeDepreciationFirstActionResponse.data.data))
      return alertHandler('error', t('SOMETHING_WENT_WRONG'));

    const saveModelResponse = await api('POST', getActionUrl(), getSavePayload());
    if (saveModelResponse.data.status !== 0) return alertHandler('error', t('SOMETHING_WENT_WRONG'));
    if (saveModelResponse.data.data && checkFlashOrError(saveModelResponse.data.data))
      return alertHandler('error', t('SOMETHING_WENT_WRONG'));
    let fetchedData = await fetchFixedAsset(saveModelResponse.data.data.id);
    const verifyResponse = await api('POST', getVerifyUrl(MODELS.FIXED_ASSET), getVerifyPayload(fetchedData));
    if (verifyResponse.data.status !== 0) return alertHandler('error', t('SOMETHING_WENT_WRONG'));
    action = 'action-fixed-asset-group-compute-depreciation-click[1]';
    const computeDepreciationSecondActionResponse = await api(
      'POST',
      getActionUrl(),
      getComputeDeprectionFirstActionPayload(action, fetchedData)
    );
    if (computeDepreciationSecondActionResponse.data.status !== 0) return alertHandler('error', t('SOMETHING_WENT_WRONG'));
    if (computeDepreciationSecondActionResponse.data.data && checkFlashOrError(computeDepreciationSecondActionResponse.data.data))
      return alertHandler('error', t('SOMETHING_WENT_WRONG'));
    fetchedData = await fetchFixedAsset(saveModelResponse.data.data.id);
    action = 'action-fixed-asset-group-compute-depreciation-click[3]';
    const computeDepreciationThirdActionResponse = await api(
      'POST',
      getActionUrl(),
      getComputeDeprectionFirstActionPayload(action, fetchedData)
    );
    if (computeDepreciationThirdActionResponse.data.status !== 0) return alertHandler('error', t('SOMETHING_WENT_WRONG'));
    if (computeDepreciationThirdActionResponse.data.data && checkFlashOrError(computeDepreciationThirdActionResponse.data.data))
      fetchedData = await fetchFixedAsset(saveModelResponse.data.data.id);
    finishedComputeDepreciationHandler('Success', t('LBL_DEPRECIATION_LINES_LOADED_SUCCESSFULLY'));
  };

  const validateFirstActionPayload = (action, data) => {
    return {
      model: MODELS.FIXED_ASSET,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: MODELS.FIXED_ASSET,
          _id: data?.id || null,
          acquisitionDate: moment(formik.values.acquisitionDate).locale('en').format('YYYY-MM-DD'),
          depreciationPlanSelect: '2',
          periodicityTypeSelect: 1,
          fixedAssetLineList: depreciationLines,
          reference: data?.rreference || null,
          durationInMonth: durationData ? (durationData.durationInMonth ? parseInt(durationData.durationInMonth) : null) : null,
          computationMethodSelect: durationData ? (durationData.computationMethod ? durationData.computationMethod : null) : null,
          barcodeTypeConfig: null,
          firstDepreciationDateInitSelect: 2,
          isEqualToFiscalDepreciation: false,
          id: data?.id || null,
          barcode: null,
          trackingNumber: null,
          firstServiceDate: moment(formik.values.firstDepreciationDate).locale('en').format('YYYY-MM-DD'),
          firstDepreciationDate: moment(formik.values.firstDepreciationDate).locale('en').format('YYYY-MM-DD'),
          nbrOfPastDepreciations: data?.nbrOfPastDepreciations || null,
          alreadyDepreciatedAmount: data?.alreadyDepreciatedAmount || null,
          purchaseAccount: formik.values.purchaseAccount,
          saleAccountMove: null,
          version: data && data.version !== null ? data.version : null,
          grossValue: parseFloat(formik.values.grossValue).toFixed(2).toString(),
          purchaseAccountMove: null,
          qty: '1.00',
          disposalDate: null,
          name: formik.values.name,
          numberOfDepreciation: durationData ? (durationData.durationInMonth ? parseInt(durationData.durationInMonth) : null) : null,
          correctedAccountingValue: data?.correctedAccountingValue || null,
          residualValue: parseFloat(formik.values.residualValue).toFixed(2).toString(),
          journal: formik.values.journal,
          company: company,
          periodicityInMonth: 1,
          disposalValue: data?.disposalValue || null,
          statusSelect: data?.statusSelect || 1,
          degressiveCoef: '0.00',
          originSelect: data?.originSelect || 1,
          partner: formik.values.partner,
          accountingValue: data?.accountingValue || '0.00',
          fixedAssetCategory: formik.values.fixedAssetCategory ? { id: formik.values.fixedAssetCategory.id } : null,
          stockLocation: formik.values.stockLocation,
          analyticDistributionTemplate: formik.values.analyticDistributionTemplate,
        },
      },
    };
  };

  const validateRecord = async () => {
    const isValid = await validateFormForSubmit();
    if (!isValid) return null;

    setActionInProgress(true);
    let action = 'action-fixed-asset-record-set-residual-value';
    let getGrossValueActionResponse = await api('POST', getActionUrl(), validateFirstActionPayload(action));
    if (getGrossValueActionResponse.data.status !== 0) return alertHandler('error', t('SOMETHING_WENT_WRONG'));
    if (getGrossValueActionResponse.data.data && checkFlashOrError(getGrossValueActionResponse.data.data))
      return alertHandler('error', t('SOMETHING_WENT_WRONG'));
    action = 'save,action-group-account-fixed-asset-failover-control,action-group-account-fixed-asset-validate,save';
    let validateFirstActionResponse = await api('POST', getActionUrl(), validateFirstActionPayload(action));
    if (validateFirstActionResponse.data.status !== 0) return alertHandler('error', t('SOMETHING_WENT_WRONG'));
    if (validateFirstActionResponse.data.data && checkFlashOrError(validateFirstActionResponse.data.data))
      return alertHandler('error', t('SOMETHING_WENT_WRONG'));

    const verifyResponse = await api('POST', getVerifyUrl(MODELS.FIXED_ASSET), getVerifyPayload());
    if (verifyResponse.data.status !== 0) return alertHandler('error', t('SOMETHING_WENT_WRONG'));
    const saveModelResponse = await api('POST', getActionUrl(), getSavePayload());
    if (saveModelResponse.data.status !== 0) return alertHandler('error', t('SOMETHING_WENT_WRONG'));
    if (saveModelResponse.data.data && checkFlashOrError(validateFirstActionResponse.data.data))
      return alertHandler('error', t('SOMETHING_WENT_WRONG'));
    let fetchedData = await fetchFixedAsset(saveModelResponse.data.data.id);
    action = 'action-group-account-fixed-asset-failover-control,action-group-account-fixed-asset-validate,save';
    let validateSecondActionResponse = await api('POST', getActionUrl(), validateFirstActionPayload(action, fetchedData));
    if (validateSecondActionResponse.data.status !== 0) return alertHandler('error', t('SOMETHING_WENT_WRONG'));
    if (validateSecondActionResponse.data.data && checkFlashOrError(validateSecondActionResponse.data.data))
      return alertHandler('error', t('SOMETHING_WENT_WRONG'));
    fetchedData = await fetchFixedAsset(saveModelResponse.data.data.id);
    setOnSuccessFn('validate');
    setFetchedObject(fetchedData);
    setParentSaveDone(true);
  };

  const realizeLineHandler = async line => {
    setActionInProgress(true);
    const res = await realizeLineService(line);
    await fetchFixedAsset(data.id);
    if (res) alertHandler('Success', t('DEPRECIATION_LINE_REAILZED_SUCCESSFULLY'));
  };

  return (
    <>
      <div className="card">
        <div className="row">
          <div className="col-md-6">
            <TextInput
              formik={formik}
              label="LBL_NAME"
              accessor="name"
              mode="add"
              isRequired={addNew || (enableEdit && data && data.statusSelect === FIXED_ASSET_STATUS_REV_ENUM['LBL_DRAFT'])}
              disabled={!addNew && !(data && data.statusSelect === FIXED_ASSET_STATUS_REV_ENUM['LBL_DRAFT'])}
            />
          </div>
          <div className="col-md-6">
            <SearchModalAxelor
              formik={formik}
              modelKey="CURRENCIES"
              mode="add"
              isRequired={false}
              disabled={true}
              onSuccess={onCurrencySuccess}
              defaultValueConfig={{
                payloadDomain: "self.codeISO = 'SAR'",
              }}
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <SearchModalAxelor
              formik={formik}
              modelKey="CATEGORIES"
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
              onSuccess={onFixedAssetCategorySuccess}
              defaultValueConfig={null}
              isRequired={addNew || (enableEdit && data && data.statusSelect === FIXED_ASSET_STATUS_REV_ENUM['LBL_DRAFT'])}
              disabled={!addNew && !(data && data.statusSelect === FIXED_ASSET_STATUS_REV_ENUM['LBL_DRAFT'])}
            />
          </div>
          <div className="col-md-6">
            <SearchModalAxelor
              formik={formik}
              modelKey="SUPPLIERS"
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
              onSuccess={onCustomersSearchSuccess}
              selectIdentifier="fullName"
              payloadDomain={`self.isContact = false AND ${company.id} member of self.companySet AND self.isSupplier = true AND self.id!=1`}
              defaultValueConfig={null}
              extraFields={['fullName']}
              isRequired={addNew || (enableEdit && data && data.statusSelect === FIXED_ASSET_STATUS_REV_ENUM['LBL_DRAFT'])}
              disabled={!addNew && !(data && data.statusSelect === FIXED_ASSET_STATUS_REV_ENUM['LBL_DRAFT'])}
            />
          </div>
          <div className="col-md-6">
            <SearchModalAxelor
              formik={formik}
              modelKey="JOURNALS"
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
              onSuccess={onJournalsSuccess}
              defaultValueConfig={{ payloadDomain: journalDomain }}
              payloadDomain={`self.company = ${company.id} AND self.statusSelect = 1`}
              isRequired={false}
              disabled={true}
            />
          </div>
          <div className="col-md-6">
            <SearchModalAxelor
              formik={formik}
              modelKey="PURCHASE_ACCOUNTS"
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
              isRequired={addNew || (enableEdit && data && data.statusSelect === FIXED_ASSET_STATUS_REV_ENUM['LBL_DRAFT'])}
              disabled={!addNew && !(data && data.statusSelect === FIXED_ASSET_STATUS_REV_ENUM['LBL_DRAFT'])}
              onSuccess={onAccountsDatasSuccess}
              payloadDomain={`self.accountType.technicalTypeSelect IN ('immobilisation') AND self.statusSelect = 1`}
              defaultValueConfig={null}
              selectIdentifier="label"
            />
          </div>

          <div className="col-md-6">
            <DateInput
              formik={formik}
              label="LBL_ACQUISITION_DATE"
              accessor="acquisitionDate"
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
              isRequired={addNew || (enableEdit && data && data.statusSelect === FIXED_ASSET_STATUS_REV_ENUM['LBL_DRAFT'])}
              disabled={!addNew && !(data && data.statusSelect === FIXED_ASSET_STATUS_REV_ENUM['LBL_DRAFT'])}
            />
          </div>
          <div className="col-md-6">
            <DateInput
              formik={formik}
              label="LBL_FIRST_DEPRECIATION_DATE"
              accessor="firstDepreciationDate"
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
              isRequired={addNew || (enableEdit && data && data.statusSelect === FIXED_ASSET_STATUS_REV_ENUM['LBL_DRAFT'])}
              disabled={!addNew && !(data && data.statusSelect === FIXED_ASSET_STATUS_REV_ENUM['LBL_DRAFT'])}
            />
          </div>
          <div className="col-md-6">
            <NumberInput
              formik={formik}
              label="LBL_GROSS_VALUE"
              accessor="grossValue"
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
              isRequired={addNew || (enableEdit && data && data.statusSelect === FIXED_ASSET_STATUS_REV_ENUM['LBL_DRAFT'])}
              disabled={!addNew && !(data && data.statusSelect === FIXED_ASSET_STATUS_REV_ENUM['LBL_DRAFT'])}
            />
          </div>
          <div className="col-md-6">
            <NumberInput
              formik={formik}
              label="LBL_RESIDUAL_VALUE"
              accessor="residualValue"
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
              isRequired={addNew || (enableEdit && data && data.statusSelect === FIXED_ASSET_STATUS_REV_ENUM['LBL_DRAFT'])}
              disabled={!addNew && !(data && data.statusSelect === FIXED_ASSET_STATUS_REV_ENUM['LBL_DRAFT'])}
            />
          </div>
          {stockManagementAvailable && (
            <div className="col-md-6">
              <SearchModalAxelor
                formik={formik}
                modelKey="STOCK_LOCATIONS"
                mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                onSuccess={onStockLocationsSuccess}
                defaultValueConfig={null}
                isRequired={false}
                disabled={!addNew && !(data && data.statusSelect === FIXED_ASSET_STATUS_REV_ENUM['LBL_DRAFT'])}
              />
            </div>
          )}
          {costCenterAvailable && (
            <div className="col-md-6">
              <SearchModalAxelor
                formik={formik}
                modelKey="ANALYTIC_DISTRIBUTION_TEMPLATE"
                mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                onSuccess={onAnalyticDistributionTemplateSuccess}
                defaultValueConfig={null}
                payloadDomain={`self.company = ${company.id}`}
                isRequired={false}
                disabled={!addNew && !(data && data.statusSelect === FIXED_ASSET_STATUS_REV_ENUM['LBL_DRAFT'])}
                addConfig={{
                  title: 'LBL_ANALYTIC_DISTRIBUTION_TEMPLATE',
                  FormComponent: AddAnalyticDistributionTemplate,
                  additionalProps: {
                    parentContext: data ? data : null,
                    parentModel: MODELS.FIXED_ASSET,
                    type: 'fixedAsset',
                  },
                }}
              />
            </div>
          )}
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
      {formik.values.fixedAssetCategory && (
        <Tabs {...tabsProps} tabsList={[{ accessor: 'depreciationInfo', label: 'LBL_DEPRECIATION_INFO' }]}>
          <DepreciationInformation
            accessor="depreciationInfo"
            data={depreciationData}
            setDurationData={setDurationData}
            hasCustomAction={addNew || (enableEdit === true && data && data.statusSelect >= FIXED_ASSET_STATUS_REV_ENUM['LBL_VALIDATED'])}
            mode={enableEdit ? 'edit' : 'view'}
            customActionIcon={
              addNew || (enableEdit && data && data.statusSelect <= FIXED_ASSET_STATUS_REV_ENUM['LBL_DRAFT'])
                ? opactiyCheckCircle
                : checkCircle
            }
            customActionHandler={realizeLineHandler}
            parentContext={parentContext}
          />
        </Tabs>
      )}
      <AttachmentInput
        mode={addNew ? 'add' : enableEdit && data?.statusSelect < 2 ? 'edit' : 'view'}
        modelKey={MODELS.FIXED_ASSET}
        alertHandler={alertHandler}
        fetchedObj={fetchedObject || data || null}
        parentSaveDone={parentSaveDone}
        feature={subFeature}
        navigationParams={{ id: data?.id }}
        onSuccessFn={
          onSuccessFn === 'save'
            ? () => finishedSaveHandler('Success')
            : onSuccessFn === 'validate'
              ? () => finishedValidateHandler('Success')
              : null
        }
      />
    </>
  );
}

export default FixedAssetForm;
