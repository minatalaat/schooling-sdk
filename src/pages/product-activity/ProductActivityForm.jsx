import { useEffect } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';

import TextInput from '../../components/ui/inputs/TextInput';
import SearchModalAxelor from '../../components/ui/inputs/SearchModal/SearchModalAxelor';

import { MODELS } from '../../constants/models';
import { useAxiosFunction } from '../../hooks/useAxios';
import { getModelUrl, getRemoveAllUrl } from '../../services/getUrl';
import { useTabs } from '../../hooks/useTabs';
import { VALID_TEXT_WITH_SPECIAL_CHARS } from '../../constants/regex/Regex';
import FormNotes from '../../components/ui/FormNotes';

const ProductActivityForm = ({
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
  const { api } = useAxiosFunction();
  const tabsProps = useTabs();
  const { t } = useTranslation();

  const initialValues = {
    name: data?.name || '',
    code: data?.code || '',
    productFamily: data?.productFamily || null,
    productCategory: data?.productCategory || null,
  };

  const validationSchema = Yup.object({
    name: Yup.string()
      .matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS'))
      .required(`* ${t('REQUIRED')}`)
      .trim(),
    code: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).trim(),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: addNew ? true : false,
  });

  const onAccountingFamilySuccess = response => {
    if (response.data.status === 0) {
      let tempData = [];
      let data = response.data.data;

      if (data && data.length > 0) {
        data.forEach(item => {
          tempData.push(item);
        });
      }

      return { displayedData: [...tempData], total: response.data.total || 0 };
    }
  };

  const onProductCategorySuccess = response => {
    if (response.data.status === 0) {
      let tempData = [];
      let data = response.data.data;

      if (data && data.length > 0) {
        data.forEach(item => {
          tempData.push(item);
        });
      }

      return { displayedData: [...tempData], total: response.data.total || 0 };
    }
  };

  const saveRecord = () => {
    if (formik.isValid) {
      setActionInProgress(true);
      let payload = {
        data: {
          code: formik.values.code,
          name: formik.values.name,
          productFamily: formik.values.productFamily,
          productCategory: formik.values.productCategory,
          isActivity: true,
        },
      };

      if (enableEdit) payload = { ...payload, data: { ...payload.data, id: data.id, version: data.version } };

      api('POST', getModelUrl(MODELS.PRODUCT), payload, () => {
        setActionInProgress(false);
        finishedSaveHandler('success');
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
    api('POST', getRemoveAllUrl(MODELS.PRODUCT), payload, () => {
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
              isRequired={addNew || enableEdit === true}
            />
          </div>
          <div className="col-md-6">
            <TextInput
              formik={formik}
              label="LBL_CODE"
              accessor="code"
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
              isRequired={false}
            />
          </div>
          <div className="col-md-6">
            <SearchModalAxelor
              formik={formik}
              modelKey="ACCOUNTING_FAMILY"
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
              isRequired={false}
              onSuccess={onAccountingFamilySuccess}
              selectIdentifier="name"
              //   payloadDomain={`self.partner = ${formik.values.partner.id}`}
              //   defaultValueConfig={null}
              //   extraFields={['address.fullName', 'id', 'address.addressL4', 'address.addressL7Country']}
            />
          </div>
          <div className="col-md-6">
            <SearchModalAxelor
              formik={formik}
              modelKey="PRODUCT_CATEGORY"
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
              isRequired={false}
              onSuccess={onProductCategorySuccess}
              //   payloadDomain={`self.partner = ${formik.values.partner.id}`}
              //   defaultValueConfig={null}
              //   extraFields={['address.fullName', 'id', 'address.addressL4', 'address.addressL7Country']}
            />
          </div>
        </div>
        <FormNotes
          notes={[
            {
              title: 'LBL_REQUIRED_NOTIFY',
              type: 3,
            },
          ]}
        />
      </div>
    </>
  );
};

export default ProductActivityForm;
