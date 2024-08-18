import { useEffect } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';

import TextInput from '../../../components/ui/inputs/TextInput';
import DropDown from '../../../components/ui/inputs/DropDown';

import { MODELS } from '../../../constants/models';
import { useAxiosFunction } from '../../../hooks/useAxios';
import { getModelUrl, getRemoveAllUrl } from '../../../services/getUrl';
import ToggleSwitch from '../../../components/ui/inputs/ToggleSwitch';
import NumberInput from '../../../components/ui/inputs/NumberInput';
import useMetaFields from '../../../hooks/metaFields/useMetaFields';
import TextAreaFormat from '../../../components/ui/inputs/TextAreaFormat';
import { VALID_TEXT_WITH_SPECIAL_CHARS } from '../../../constants/regex/Regex';

const LeaveReasonsForm = ({
  enableEdit,
  data,
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
  const unitSelect = useMetaFields('hr.leave.reason.unit.select');

  const initialValues = {
    name: data?.name || '',
    payrollPreprationExport: data?.payrollPreprationExport || false,
    exportCode: data?.exportCode || '',
    allowInjection: data?.allowInjection || false,
    instruction: data?.instruction || null,
    defaultDayNumberGain: data?.defaultDayNumberGain || '',
    unitSelect: data?.unitSelect || 0,
    selectedByMgtOnly: data?.selectedByMgtOnly || false,
    allowNegativeValue: data?.allowNegativeValue || false,
    manageAccumulation: data?.manageAccumulation || false,
  };
  const validationSchema = Yup.object({
    name: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).required(t('REQUIRED')).trim(),
    payrollPreprationExport: Yup.boolean(),
    exportCode: Yup.string()
      .matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS'))
      .trim()
      .when('payrollPreprationExport', {
        is: true,
        then: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).trim().required(t('REQUIRED')),
      }),
    allowInjection: Yup.boolean(),
    instruction: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).nullable(),
    defaultDayNumberGain: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')),
    unitSelect: Yup.number(),
    selectedByMgtOnly: Yup.boolean(),
    allowNegativeValue: Yup.boolean(),
    manageAccumulation: Yup.boolean(),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: addNew ? true : false,
  });

  const saveRecord = async () => {
    if (formik.isValid) {
      setActionInProgress(true);
      let payload = {
        data: {
          name: formik.values.name,
          payrollPreprationExport: formik.values.payrollPreprationExport,
          exportCode: formik.values.payrollPreprationExport ? formik.values.exportCode : '',
          allowInjection: formik.values.manageAccumulation ? formik.values.allowInjection : false,
          instruction: formik.values.instruction,
          defaultDayNumberGain: formik.values.defaultDayNumberGain,
          unitSelect: formik.values.unitSelect,
          selectedByMgtOnly: formik.values.selectedByMgtOnly,
          allowNegativeValue: formik.values.manageAccumulation ? formik.values.allowNegativeValue : false,
          manageAccumulation: formik.values.manageAccumulation,
        },
      };

      if (enableEdit) payload = { ...payload, data: { ...payload.data, id: data.id, version: data.version } };

      const saveResposne = await api('POST', getModelUrl(MODELS.LEAVE_REASON), payload);

      if (saveResposne?.data?.status !== 0) {
        setActionInProgress(false);
        return finshedSaveHandler('error');
      }

      setActionInProgress(false);
      finshedSaveHandler('success');
    } else {
      alertHandler('Error', t('INVALID_FORM'));
    }
  };

  const deleteRecord = () => {
    setActionInProgress(true);
    const payload = {
      records: [{ id: data.id }],
    };
    api('POST', getRemoveAllUrl(MODELS.LEAVE_REASON), payload, () => {
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
        <ToggleSwitch
          formik={formik}
          label="LBL_MANAGE_ACCUMLATION"
          accessor="manageAccumulation"
          mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
        />
      </div>
      {formik.values.manageAccumulation && (
        <div className="col-md-6">
          <ToggleSwitch
            formik={formik}
            label="LBL_ALLOW_NEG_VALUE"
            accessor="allowNegativeValue"
            mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
          />
        </div>
      )}
      {formik.values.manageAccumulation && (
        <div className="col-md-6">
          <ToggleSwitch
            formik={formik}
            label="LBL_ALLOW_INJECTION"
            accessor="allowInjection"
            mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
          />
        </div>
      )}
      <div className="col-md-12">
        <TextAreaFormat
          formik={formik}
          mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
          identifier="instruction"
          label="LBL_INSTRUCTIONS"
        />
      </div>
      <div className="col-md-6">
        <NumberInput
          formik={formik}
          label="LBL_DEFAULT_DAY_NO_GAIN"
          accessor="defaultDayNumberGain"
          mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
        />
      </div>
      <div className="col-md-6">
        <DropDown
          options={unitSelect.list}
          formik={formik}
          isRequired={false}
          label="LBL_UNIT"
          accessor="unitSelect"
          translate={unitSelect.mode === 'enum'}
          keys={{ valueKey: 'value', titleKey: 'label' }}
          mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
          initialValue={0}
        />
      </div>
      <div className="col-md-3">
        <ToggleSwitch
          formik={formik}
          label="LBL_CAN_BE_SELECTED_ONLY_BY_HR"
          accessor="selectedByMgtOnly"
          mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
        />
      </div>

      <div className="col-md-3">
        <ToggleSwitch
          formik={formik}
          label="LBL_EXPORT_FOR_PAYROLL_PREPARATION"
          accessor="payrollPreprationExport"
          mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
        />
      </div>
      {formik.values.payrollPreprationExport && (
        <div className="col-md-6">
          <TextInput
            formik={formik}
            label="LBL_EXPORT_CODE"
            accessor="exportCode"
            mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
            isRequired={formik.values.payrollPreprationExport}
          />
        </div>
      )}
    </>
  );
};

export default LeaveReasonsForm;
