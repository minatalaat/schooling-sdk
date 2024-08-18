import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import TextInput from '../../../components/ui/inputs/TextInput';
import { useTabs } from '../../../hooks/useTabs';

const StudentsForm = ({ enableEdit, data, addNew }) => {
  const { t } = useTranslation();
  const tabsProps = useTabs();

  const initialValues = {
    dropdownInput: data?.dropdownInput?.toString() || '',
    name: data?.name || '',
    grade: data?.grade || '',
    national_id: data?.national_id || '',
    address: data?.address,
    parent_name: data?.parent_name || '',
    parent_national_id: data?.parent_national_id || '',
    parent_phone_number: data?.parent_phone_number || '',
    school_name: data?.school_name || '',
    braceletBin: data?.braceletBin || '',
  };

  const formik = useFormik({
    initialValues,
    validateOnMount: addNew ? true : false,
    enableReinitialize: true,
  });

  useEffect(() => {
    tabsProps.setShowTabsContent(true);
  }, []);

  return (
    <div className="flex col">
      <div className="card">
        <div className="row justify-content-between">
          <div className="col-md-5">
            <TextInput
              formik={formik}
              label="LBL_NAME"
              accessor="name"
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
              isRequired={true}
            />
          </div>
          <div className="col-md-5">
            <TextInput
              formik={formik}
              label="LBL_GRADE"
              accessor="grade"
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
              isRequired={true}
            />
          </div>
          <div className="col-md-5">
            <TextInput
              formik={formik}
              label="LBL_STUDENT_NATIONAL_ID"
              accessor="national_id"
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
              isRequired={true}
            />
          </div>
          <div className="col-md-5">
            <TextInput
              formik={formik}
              label="LBL_BRACELET_ID"
              accessor="braceletBin"
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
              isRequired={false}
            />
          </div>
          <div className="col-md-5">
            <TextInput
              formik={formik}
              label="LBL_ADDRESS"
              accessor="address"
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
              isRequired={true}
            />
          </div>
        </div>
      </div>
      <div className="card">
        <div className="info-tite-page mb-4">
          <h4>{t('LBL_PARANT_DETAILS')}</h4>
        </div>
        <div className="row justify-content-between">
          <div className="col-md-5">
            <TextInput
              formik={formik}
              label="LBL_PARANT_NAME"
              accessor="parent_name"
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
              isRequired={true}
            />
          </div>
          <div className="col-md-5">
            <TextInput
              formik={formik}
              label="LBL_PARANT_NATIONAL_ID"
              accessor="parent_national_id"
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
              isRequired={true}
            />
          </div>
          <div className="col-md-5">
            <TextInput
              formik={formik}
              label="LBL_PARANT_PHONE"
              accessor="parent_phone_number"
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
              isRequired={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentsForm;
