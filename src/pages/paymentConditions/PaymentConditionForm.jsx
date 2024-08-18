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
import { useFormikSubmit } from '../../hooks/useFormikSubmit';

const PaymentConditionForm = ({
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

  // const typeSelect = useMetaFields('account.payment.condition.type.select');
  const periodTypeSelect = useMetaFields('account.payment.condition.period.type.select');

  const initialValues = {
    name: addNew ? '' : data.name,
    code: addNew ? '' : data.code,
    typeSelect: addNew ? 0 : data.typeSelect,
    paymentTime: addNew ? 0 : data.paymentTime,
    periodTypeSelect: addNew ? 0 : data.periodTypeSelect,
  };

  const validationSchema = Yup.object({
    name: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).required(t('REQUIRED')).trim(),
    code: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).required(t('REQUIRED')).trim(),
    paymentTime: Yup.number(),
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
    let payload = { ...formik.values };

    if (payload.typeSelect !== '') {
      payload.typeSelect = Number(payload.typeSelect);
    } else {
      payload.typeSelect = 0;
    }

    if (payload.periodTypeSelect !== '') {
      payload.periodTypeSelect = Number(payload.periodTypeSelect);
    } else {
      payload.periodTypeSelect = 0;
    }

    let savePayload = { data: { ...payload } };
    if (enableEdit)
      savePayload = {
        data: { ...payload, id: data.id, version: data.version },
      };
    api('POST', getModelUrl(MODELS.PAYMENTCONDITION), savePayload, () => {
      setActionInProgress(false);
      finshedSaveHandler('success');
    });
  };

  const deleteRecord = () => {
    setActionInProgress(true);
    const payload = {
      records: [{ id: data.id }],
    };
    api('POST', getRemoveAllUrl(MODELS.PAYMENTCONDITION), payload, () => {
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
      {/* <div className="col-md-6">
        <DropDown
          formik={formik}
          accessor="typeSelect"
          label="LBL_TYPE"
          keys={{ valueKey: 'value', titleKey: 'label' }}
          options={typeSelect.list}
          translate={typeSelect.mode === 'enum'}
          mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
          initialValue={0}
          tooltip="paymentConditionType"
        />
      </div> */}
      <div className="col-md-6">
        <NumberInput
          formik={formik}
          label="LBL_PAYMENT_PERIOD"
          accessor="paymentTime"
          mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
          tooltip="paymentConditionPeriod"
        />
      </div>
      <div className="col-md-6">
        <DropDown
          formik={formik}
          accessor="periodTypeSelect"
          label="LBL_PERIOD_TYPE"
          keys={{ valueKey: 'value', titleKey: 'label' }}
          options={periodTypeSelect.list}
          translate={periodTypeSelect.mode === 'enum'}
          mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
          initialValue={0}
          tooltip="paymentConditionPeriodType"
        />
      </div>
    </>
  );
};

export default PaymentConditionForm;
