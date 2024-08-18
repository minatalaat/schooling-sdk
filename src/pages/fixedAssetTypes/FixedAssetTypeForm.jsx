import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';

import TextInput from '../../components/ui/inputs/TextInput';
import DropDown from '../../components/ui/inputs/DropDown';
import AttachmentInput from '../../components/ui/inputs/AttachmentInput';

import { MODELS } from '../../constants/models';
import { useAxiosFunction } from '../../hooks/useAxios';
import { getModelUrl, getRemoveAllUrl } from '../../services/getUrl';
import { useTabs } from '../../hooks/useTabs';
import useMetaFields from '../../hooks/metaFields/useMetaFields';
import { VALID_TEXT_WITH_SPECIAL_CHARS } from '../../constants/regex/Regex';
import { useFormikSubmit } from '../../hooks/useFormikSubmit';
import FormNotes from '../../components/ui/FormNotes';

const FixedAssetTypeForm = ({
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
  const subFeature = 'FIXED_ASSET_TYPES';
  const { api } = useAxiosFunction();
  const tabsProps = useTabs();
  const { t } = useTranslation();

  const [parentSaveDone, setParentSaveDone] = useState(false);
  const [fetchedObject, setFetchedObject] = useState(false);
  const technicalTypeSelect = useMetaFields('account.fixed.asset.technical.type.select');

  const initialValues = {
    name: data?.name || '',
    code: data?.code || '',
    technicalTypeSelect: data?.technicalTypeSelect || '',
  };

  const validationSchema = Yup.object({
    name: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).required(t('REQUIRED')).trim(),
    code: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).required(t('REQUIRED')).trim(),
    technicalTypeSelect: Yup.number().required(t('REQUIRED')),
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
        code: formik.values.code,
        name: formik.values.name,
        technicalTypeSelect: formik.values.technicalTypeSelect,
      },
    };

    if (enableEdit) payload = { ...payload, data: { ...payload.data, id: data.id, version: data.version } };

    api('POST', getModelUrl(MODELS.FIXED_ASSET_TYPE), payload, response => {
      setFetchedObject(response.data.data[0]);
      setParentSaveDone(true);
    });
  };

  const deleteRecord = () => {
    setActionInProgress(true);
    const payload = {
      records: [{ id: data.id }],
    };
    api('POST', getRemoveAllUrl(MODELS.FIXED_ASSET_TYPE), payload, () => {
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
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
              isRequired={true}
              label="LBL_TECHNICAL_TYPE"
              accessor="technicalTypeSelect"
              options={technicalTypeSelect.list}
              translate={technicalTypeSelect.mode === 'enum'}
              keys={{ valueKey: 'value', titleKey: 'label' }}
              type={technicalTypeSelect.data?.type}
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
      <AttachmentInput
        mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
        modelKey={MODELS.FIXED_ASSET_TYPE}
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

export default FixedAssetTypeForm;
