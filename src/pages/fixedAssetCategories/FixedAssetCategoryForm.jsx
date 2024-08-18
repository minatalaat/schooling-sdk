import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import TextInput from '../../components/ui/inputs/TextInput';
import SearchModalAxelor from '../../components/ui/inputs/SearchModal/SearchModalAxelor';
import Tabs from '../../components/ui/inputs/Tabs';
import CheckboxInput from '../../components/ui/inputs/CheckboxInput';
import AttachmentInput from '../../components/ui/inputs/AttachmentInput';

import { MODELS } from '../../constants/models';
import { useAxiosFunction } from '../../hooks/useAxios';
import { getActionUrl, getModelUrl, getRemoveAllUrl } from '../../services/getUrl';
import { useTabs } from '../../hooks/useTabs';
import AccountingInfo from './tabs/AccountingInfo';
import Periodicity from './tabs/Periodicity';
import { checkFlashOrError } from '../../utils/helpers';
import { VALID_TEXT_WITH_SPECIAL_CHARS } from '../../constants/regex/Regex';
import { useFormikSubmit } from '../../hooks/useFormikSubmit';
import FormNotes from '../../components/ui/FormNotes';

const FixedAssetCategoryForm = ({
  enableEdit,
  data,
  addNew,
  isSave,
  finishedSaveHandler,
  isDelete,
  finishedDeleteHandler,
  alertHandler,
  setActionInProgress,
}) => {
  const subFeature = 'FIXED_ASSET_CATEGORIES';
  const { api } = useAxiosFunction();
  const tabsProps = useTabs();
  const { t } = useTranslation();

  let company = useSelector(state => state.userFeatures.companyInfo.company);
  let mode = addNew ? 'add' : enableEdit ? 'edit' : 'view';

  const [parentSaveDone, setParentSaveDone] = useState(false);
  const [fetchedObject, setFetchedObject] = useState(false);

  const initialValues = {
    depreciationPlanSelect: '2',
    computationMethodSelect: 'linear',
    periodicityTypeSelect: data?.periodicityTypeSelect || 1,
    periodicityInMonth: data?.periodicityInMonth || 1,
    name: data?.name || '',
    fixedAssetType: data?.fixedAssetType || null,
    journal: data?.journal || null,
    chargeAccount: data?.chargeAccount || null,
    depreciationAccount: data?.depreciationAccount || null,
    debtReceivableAccount: data?.debtReceivableAccount || null,
    realisedAssetsValueAccount: data?.realisedAssetsValueAccount || null,
    realisedAssetsIncomeAccount: data?.realisedAssetsIncomeAccount || null,
    numberOfDepreciation: data?.numberOfDepreciation || 1,
    durationInMonth: data?.durationInMonth || 1,
    isValidateFixedAsset: data?.isValidateFixedAsset || false,
  };

  const validationSchema = Yup.object({
    name: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).trim().required(t('REQUIRED')),
    fixedAssetType: Yup.object().nullable().required(t('REQUIRED')),
    journal: Yup.object().nullable().required(t('REQUIRED')),
    depreciationAccount: Yup.object().nullable().required(t('REQUIRED')),
    debtReceivableAccount: Yup.object().nullable().required(t('REQUIRED')),
    realisedAssetsValueAccount: Yup.object().nullable().required(t('REQUIRED')),
    realisedAssetsIncomeAccount: Yup.object().nullable().required(t('REQUIRED')),
    chargeAccount: Yup.object().nullable().required(t('REQUIRED')),
    numberOfDepreciation: Yup.number()
      .typeError(t('LBL_ERROR_FIELD_MUST_CONTAIN_ONLY_NUM'))
      .required(t('REQUIRED'))
      .min(1, t('LBL_NUMBER_MUST_NOT_BE_ZERO')),
    isValidateFixedAsset: Yup.boolean(),
    depreciationPlanSelect: Yup.string(t('LBL_INVALID_VALUE')),
    computationMethodSelect: Yup.string(t('LBL_INVALID_VALUE')),
    periodicityTypeSelect: Yup.number(t('LBL_INVALID_NUMBER_VALUE')),
    periodicityInMonth: Yup.number(t('LBL_INVALID_NUMBER_VALUE')),
    durationInMonth: Yup.number(t('LBL_INVALID_NUMBER_VALUE')),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: addNew ? true : false,
  });

  const { validateFormForSubmit } = useFormikSubmit(formik, alertHandler);

  const saveRecord = async () => {
    const isValid = await validateFormForSubmit();
    if (!isValid) return null;

    setActionInProgress(true);
    let payload = {
      data: {
        name: formik.values.name,
        depreciationPlanSelect: formik.values.depreciationPlanSelect,
        computationMethodSelect: formik.values.computationMethodSelect,
        periodicityTypeSelect: formik.values.periodicityTypeSelect,
        periodicityInMonth: formik.values.periodicityInMonth,
        company: company,
        degressiveCoef: '0',
        fixedAssetType: formik.values.fixedAssetType,
        journal: formik.values.journal,
        chargeAccount: formik.values.chargeAccount,
        depreciationAccount: formik.values.depreciationAccount,
        debtReceivableAccount: formik.values.debtReceivableAccount,
        realisedAssetsValueAccount: formik.values.realisedAssetsValueAccount,
        realisedAssetsIncomeAccount: formik.values.realisedAssetsIncomeAccount,
        numberOfDepreciation: parseInt(formik.values.numberOfDepreciation),
        durationInMonth: parseInt(formik.values.durationInMonth),
        isValidateFixedAsset: formik.values.isValidateFixedAsset,
      },
    };

    if (enableEdit) payload = { ...payload, data: { ...payload.data, id: data.id, version: data.version } };

    api('POST', getModelUrl(MODELS.FIXED_ASSET_CATEGORY), payload, response => {
      setFetchedObject(response.data.data[0]);
      setParentSaveDone(true);
    });
  };

  const deleteRecord = () => {
    setActionInProgress(true);
    const payload = {
      records: [{ id: data.id }],
    };
    api('POST', getRemoveAllUrl(MODELS.FIXED_ASSET_CATEGORY), payload, () => {
      setActionInProgress(false);
      finishedDeleteHandler('success');
    });
  };

  useEffect(() => {
    if (isSave) {
      saveRecord();
    }

    if (isDelete) {
      deleteRecord();
    }
  }, [isSave, isDelete, addNew, enableEdit]);

  useEffect(() => {
    tabsProps.setShowTabsContent(true);
  }, []);

  const onFixedAssetTypesSearchSuccess = response => {
    if (response.data.status === 0) {
      let responseData = response.data.data || [];
      return { displayedData: [...responseData], total: response.data.total || 0 };
    }
  };

  const onDepreciationBlurPayload = () => {
    let payload = {
      model: MODELS.FIXED_ASSET_CATEGORY,
      action: 'action-fixed-asset-attrs-set-degressive-coef,action-fixed-asset-category-record-compute-duration',
      data: {
        criteria: [],
        context: {
          _model: MODELS.FIXED_ASSET_CATEGORY,
          _id: null,
          company: company,
          degressiveCoef: '0',
          fixedAssetType: formik.values.fixedAssetType,
          computationMethodSelect: formik.values.computationMethodSelect,
          periodicityTypeSelect: formik.values.periodicityTypeSelect,
          durationInMonth: formik.values.durationInMonth,
          periodicityInMonth: formik.values.periodicityInMonth,
          numberOfDepreciation: formik.values.numberOfDepreciation,
          depreciationPlanSelect: formik.values.depreciationPlanSelect,
          isValidateFixedAsset: formik.values.isValidateFixedAsset,
          // isUSProrataTemporis: false,
          // isProrataTemporis: false,
          // 'fixedAssetType.technicalTypeSelect': 1,
          _source: 'numberOfDepreciation',
        },
      },
    };
    return payload;
  };

  const onDepreciationBlur = async e => {
    const depreciationResponse = await api('POST', getActionUrl(), onDepreciationBlurPayload());
    let status = depreciationResponse.data.status;
    let data = depreciationResponse.data.data;
    if (status !== 0) return alertHandler('error', 'LBL_ERROR_CHANGING_NUMBER_OF_DEPRECIATION');

    if (data && checkFlashOrError(data)) {
      return alertHandler('error', 'LBL_ERROR_CHANGING_NUMBER_OF_DEPRECIATION');
    }

    if (data) {
      let durationInMonth = data.find(el => el.values && 'durationInMonth' in el.values);
      formik.setFieldValue('durationInMonth', durationInMonth.values.durationInMonth);
    }
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
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
              isRequired={true}
            />
          </div>
          <div className="col-md-6">
            <SearchModalAxelor
              formik={formik}
              modelKey="FIXED_ASSET_TYPES"
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
              onSuccess={onFixedAssetTypesSearchSuccess}
              defaultValueConfig={null}
              selectIdentifier="name"
              isRequired={true}
            />
          </div>
          <div className="col-md-6">
            <CheckboxInput
              formik={formik}
              accessor="isValidateFixedAsset"
              label="LBL_VALIDATE_FA_GENERATE_INVOICE"
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
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
      <Tabs
        {...tabsProps}
        tabsList={[
          { accessor: 'accounting-info', label: 'LBL_ACCOUNTING_INFO' },
          { accessor: 'periodicity', label: 'LBL_DEPRECIATION_AND_PERIODICITY' },
        ]}
        // isSeperateCard={true}
      >
        <AccountingInfo accessor="accounting-info" formik={formik} mode={mode} />
        <Periodicity accessor="periodicity" formik={formik} mode={mode} onDepreciationBlur={onDepreciationBlur} />
      </Tabs>
      <AttachmentInput
        mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
        modelKey={MODELS.FIXED_ASSET_CATEGORY}
        alertHandler={alertHandler}
        fetchedObj={fetchedObject || data || null}
        parentSaveDone={parentSaveDone}
        feature={subFeature}
        navigationParams={{ id: data?.id }}
        onSuccessFn={() => finishedSaveHandler('success')}
      />
    </>
  );
};

export default FixedAssetCategoryForm;
