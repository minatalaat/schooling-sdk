import { useEffect } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';

import TextInput from '../../components/ui/inputs/TextInput';
import NumberInput from '../../components/ui/inputs/NumberInput';
import DropDown from '../../components/ui/inputs/DropDown';

import { MODELS } from '../../constants/models';
import { useAxiosFunction } from '../../hooks/useAxios';
import { getModelUrl, getRemoveAllUrl } from '../../services/getUrl';
import { VALID_TEXT_WITH_SPECIAL_CHARS } from '../../constants/regex/Regex';
import useMetaFields from '../../hooks/metaFields/useMetaFields';
import BorderSection from '../../components/ui/inputs/BorderSection';
import SearchModalAxelor from '../../components/ui/inputs/SearchModal/SearchModalAxelor';
import { useSelector } from 'react-redux';
import { useFormikSubmit } from '../../hooks/useFormikSubmit';

const TaxForm = ({
  enableEdit,
  data,
  taxLine,
  accountingConfigLine,
  addNew,
  isSave,
  finshedSaveHandler,
  isDelete,
  finshedDeleteHandler,
  alertHandler,
  setActionInProgress,
}) => {
  const { api } = useAxiosFunction();
  const { t } = useTranslation();
  const company = useSelector(state => state.userFeatures.companyInfo.company);

  const typeSelect = useMetaFields('account.tax.type.select');
  const today = new Date();

  const initialValues = {
    name: addNew ? '' : data.name,
    code: addNew ? '' : data.code,
    typeSelect: addNew ? 0 : data.typeSelect,
    value: addNew ? 0 : taxLine.value,
    startDate: addNew ? today : taxLine.startDate,
    purchaseAccount: addNew ? null : accountingConfigLine.purchaseAccount,
    purchFixedAssetsAccount: addNew ? null : accountingConfigLine.purchFixedAssetsAccount,
    saleAccount: addNew ? null : accountingConfigLine.saleAccount,
  };
  const validationSchema = Yup.object({
    name: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).required(t('REQUIRED')).trim(),
    code: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).required(t('REQUIRED')).trim(),
    value: Yup.number().required(t('REQUIRED')),
    purchaseAccount: Yup.object().nullable().required(t('LBL_PURCHASE_ACCOUNT_REQUIRED')),
    purchFixedAssetsAccount: Yup.object().nullable().required(t('LBL_PURCHASE_FIXED_ASSET_ACCOUNT_REQUIRED')),
    saleAccount: Yup.object().nullable().required(t('LBL_SALE_ACCOUNT_REQUIRED')),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: addNew ? true : false,
  });

  const { validateFormForSubmit } = useFormikSubmit(formik, alertHandler);

  const getTaxLine = () => {
    let tempLine = { id: null, startDate: formik.values.startDate, value: formik.values.value };

    if (enableEdit) {
      tempLine.id = taxLine.id;
      tempLine.version = taxLine.version;
    }

    return tempLine;
  };

  const getAccountingConfigLine = () => {
    let tempLine = {
      id: null,
      company: company,
      purchFixedAssetsAccount: formik.values.purchFixedAssetsAccount,
      purchaseAccount: formik.values.purchaseAccount,
      saleAccount: formik.values.saleAccount,
    };

    if (enableEdit) {
      tempLine.id = accountingConfigLine.id;
      tempLine.version = accountingConfigLine.version;
    }

    return tempLine;
  };

  const saveRecord = async () => {
    const isValid = await validateFormForSubmit();
    if (!isValid) return null;

    setActionInProgress(true);
    let payload = {
      name: formik.values.name,
      code: formik.values.code,
      typeSelect: formik.values.typeSelect,
      taxLineList: [getTaxLine()],
      accountManagementList: [getAccountingConfigLine()],
    };

    if (payload.typeSelect !== '') {
      payload.typeSelect = Number(payload.typeSelect);
    } else {
      payload.typeSelect = 0;
    }

    let savePayload = { data: { ...payload } };
    if (enableEdit)
      savePayload = {
        data: { ...payload, id: data.id, version: data.version },
      };
    api('POST', getModelUrl(MODELS.TAXES), savePayload, () => {
      setActionInProgress(false);
      finshedSaveHandler('success');
    });
  };

  const deleteRecord = () => {
    setActionInProgress(true);
    const payload = {
      records: [{ id: data.id }],
    };
    api('POST', getRemoveAllUrl(MODELS.TAXES), payload, () => {
      setActionInProgress(false);
      finshedDeleteHandler('success');
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

  return (
    <>
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
        <TextInput
          formik={formik}
          label="LBL_CODE"
          accessor="code"
          mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
          isRequired={true}
        />
      </div>
      <div className="col-md-6">
        <DropDown
          formik={formik}
          accessor="typeSelect"
          label="LBL_TAX_TYPE"
          keys={{ valueKey: 'value', titleKey: 'label' }}
          options={typeSelect.list}
          translate={typeSelect.mode === 'enum'}
          mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
          initialValue={0}
          tooltip="taxType"
        />
      </div>
      <div className="col-md-6">
        <NumberInput
          formik={formik}
          label="LBL_RATE"
          accessor="value"
          mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
          isRequired={true}
          step={0.1}
        />
      </div>
      <BorderSection title="LBL_ACCOUNTING_CONFIG" />
      <div className="col-md-6">
        <SearchModalAxelor
          formik={formik}
          modelKey="PURCHASE_ACCOUNTS"
          mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
          defaultValueConfig={null}
          selectIdentifier="label"
          payloadDomain={`self.statusSelect = 1 AND self.company = ${company.id} AND self.accountType.technicalTypeSelect = 'tax'`}
          isRequired={addNew || enableEdit}
        />
      </div>
      <div className="col-md-6">
        <SearchModalAxelor
          formik={formik}
          modelKey="PURCHASE_FIXED_ASSET_ACCOUNTS"
          mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
          defaultValueConfig={null}
          selectIdentifier="label"
          payloadDomain={`self.statusSelect = 1 AND self.company = ${company.id} AND self.accountType.technicalTypeSelect = 'tax'`}
          isRequired={addNew || enableEdit}
        />
      </div>
      <div className="col-md-6">
        <SearchModalAxelor
          formik={formik}
          modelKey="SALE_ACCOUNTS"
          mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
          defaultValueConfig={null}
          selectIdentifier="label"
          payloadDomain={`self.statusSelect = 1 AND self.company = ${company.id} AND self.accountType.technicalTypeSelect = 'tax'`}
          isRequired={addNew || enableEdit}
        />
      </div>
    </>
  );
};

export default TaxForm;
