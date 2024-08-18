import { useEffect } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';

import DropDown from '../../components/ui/inputs/DropDown';
import TextInput from '../../components/ui/inputs/TextInput';

import { MODELS } from '../../constants/models';
import { useAxiosFunction } from '../../hooks/useAxios';
import { getModelUrl, getRemoveAllUrl } from '../../services/getUrl';
import useMetaFields from '../../hooks/metaFields/useMetaFields';
import { VALID_TEXT_WITH_SPECIAL_CHARS } from '../../constants/regex/Regex';
import { useFormikSubmit } from '../../hooks/useFormikSubmit';

const UnitForm = ({
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
  const unitTypeSelect = useMetaFields('unit.unit.type.select');

  const initialValues = {
    name: addNew ? '' : data.name,
    labelToPrinting: addNew ? '' : data.labelToPrinting,
    unitTypeSelect: addNew ? 0 : data.unitTypeSelect,
  };
  const validationSchema = Yup.object({
    name: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).required(t('REQUIRED')).trim(),
    labelToPrinting: Yup.string()
      .matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS'))
      .required(t('REQUIRED'))
      .trim(),
  });

  const saveRecord = () => {
    setActionInProgress(true);
    let payload = { ...formik.values };

    if (payload.unitTypeSelect !== '') {
      payload.unitTypeSelect = Number(payload.unitTypeSelect);
    } else {
      payload.unitTypeSelect = 0;
    }

    let savePayload = { data: { ...payload } };
    if (enableEdit)
      savePayload = {
        data: { ...payload, id: data.id, version: data.version },
      };
    api('POST', getModelUrl(MODELS.UNIT), savePayload, res => {
      setActionInProgress(false);

      if (res.data.status === 0) {
        finshedSaveHandler('success');
      } else {
        finshedSaveHandler('error');
      }
    });
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: addNew ? true : false,
    onSubmit: saveRecord,
  });

  const { handleFormikSubmit } = useFormikSubmit(formik, alertHandler);

  const deleteRecord = () => {
    setActionInProgress(true);
    const payload = {
      records: [{ id: data.id }],
    };
    api('POST', getRemoveAllUrl(MODELS.UNIT), payload, res => {
      setActionInProgress(false);

      if (res.data.status === 0) {
        finshedDeleteHandler('success');
      } else {
        finshedDeleteHandler('error');
      }
    });
  };

  useEffect(() => {
    if (isSave) handleFormikSubmit();

    if (isDelete) deleteRecord();
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
          label="LBL_LABEL_TO_PRINTING"
          accessor="labelToPrinting"
          mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
          isRequired={true}
        />
      </div>
      <div className="col-md-6">
        <DropDown
          options={unitTypeSelect.list}
          formik={formik}
          isRequired={false}
          label="LBL_UNIT_TYPE"
          accessor="unitTypeSelect"
          translate={unitTypeSelect.mode === 'enum'}
          keys={{ valueKey: 'value', titleKey: 'label' }}
          mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
          initialValue={0}
        />
      </div>
    </>
  );
};

export default UnitForm;
