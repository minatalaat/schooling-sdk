import { useEffect } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';

import TextInput from '../../../components/ui/inputs/TextInput';

import { MODELS } from '../../../constants/models';
import { useAxiosFunction } from '../../../hooks/useAxios';
import { getModelUrl, getRemoveAllUrl } from '../../../services/getUrl';
import { VALID_TEXT_WITH_SPECIAL_CHARS } from '../../../constants/regex/Regex';

const EndOfContractReasonForm = ({
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
  const mode = addNew ? 'add' : enableEdit ? 'edit' : 'view';

  const initialValues = {
    reason: data?.reason || '',
  };

  const validationSchema = Yup.object({
    reason: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).required(t('REQUIRED')).trim(),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: addNew ? true : false,
  });

  const saveRecord = () => {
    if (formik.isValid) {
      setActionInProgress(true);
      let payload = {
        data: {
          reason: formik.values.reason,
        },
      };

      if (enableEdit) payload = { ...payload, data: { ...payload.data, id: data.id, version: data.version } };

      api('POST', getModelUrl(MODELS.END_OF_CONTRACT_REASON), payload, () => {
        setActionInProgress(false);
        finshedSaveHandler('success');
      });
    } else {
      alertHandler('Error', t('INVALID_FORM'));
    }
  };

  const deleteRecord = () => {
    setActionInProgress(true);
    const payload = {
      records: [{ id: data.id }],
    };
    api('POST', getRemoveAllUrl(MODELS.END_OF_CONTRACT_REASON), payload, () => {
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
      <div className="card">
        <div className="row">
          <div className="col-md-6">
            <TextInput formik={formik} label="LBL_REASON" accessor="reason" mode={mode} isRequired={true} />
          </div>
        </div>
      </div>
    </>
  );
};

export default EndOfContractReasonForm;
