import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import TextInput from '../../../components/ui/inputs/TextInput';
import FileInput from '../../../components/ui/inputs/FileInput';
import BorderSection from '../../../components/ui/inputs/BorderSection';
import DropDown from '../../../components/ui/inputs/DropDown';
import { useNavigate } from 'react-router-dom';
import { useSchoolStudentServices } from '../../../services/apis/useSchoolStudentServices';

const SupervisorsForm = ({ enableEdit, data, addNew, btnRef }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addSupervisor, updateSupervisor } = useSchoolStudentServices();
  const initialValues = {
    state: data?.state || '',
    name: data?.name || '',
    username: data?.username || '',
    email: data?.email || '',
    phoneNumber: data?.phoneNumber || '',
    nationalId: data?.nationalId || '',
    ...(addNew && {
      password: '',
      confirmPassword: '',
    }),
  };
  const validationSchema = Yup.object().shape({
    state: Yup.string()
      .required(`* ${t('REQUIRED')}`)
      .trim(),
    name: Yup.string()
      .required(`* ${t('REQUIRED')}`)
      .trim(),
    username: Yup.string()
      .required(`* ${t('REQUIRED')}`)
      .trim(),
    email: Yup.string()
      .required(`* ${t('REQUIRED')}`)
      .trim(),
    phoneNumber: Yup.string()
      .required(`* ${t('REQUIRED')}`)
      .trim(),
    nationalId: Yup.string()
      .required(`* ${t('REQUIRED')}`)
      .trim(),
    ...(addNew && {
      password: Yup.string().required(`* ${t('REQUIRED')}`),
      confirmPassword: Yup.string()
        .required(`* ${t('REQUIRED')}`)
        .oneOf([Yup.ref('password'), null], `* ${t('PASSWORD_MATCH_VALIDATION_MESSAGE')}`),
    }),
  });

  const submit = async values => {
    // Exclude confirmPassword field
    delete values.confirmPassword;
    // console.log(values, 'submitted');

    if (formik.isValid) {
      if (values.imageUrl && typeof values.imageUrl === 'string') {
        // If imageUrl is a string, convert it to a URL
        try {
          const base64String = values.imageUrl.split(',')[1];
          values.imageUrl = base64String;
        } catch (error) {
          // console.error('Error fetching image:', error);
          // Handle error appropriately, for example:
          // setError('Failed to fetch image');
          return;
        }
      }

      if (addNew) {
        addSupervisor(values, () => {
          navigate(-1);
        });
      } else {
        updateSupervisor(data?.id, { ...values, id: data?.id }, () => {
          navigate(-1);
        });
      }
    }
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: addNew ? true : false,
    onSubmit: submit,
    validateOnChange: true, // Add this line
    validateOnBlur: true, // Add this line
  });

  const operatorStatus = [
    { name: 'INACTIVE', value: 'INACTIVE' },
    { name: 'ACTIVE', value: 'ACTIVE' },
  ];
  return (
    <div className="flex col">
      <form className="login-form" onSubmit={formik.handleSubmit}>
        <div className="card">
          <div className="row justify-content-between gap-3">
            <div className="col-md-8">
              <div className="section-title">
                <h4>{t('LBL_SUPERVISORS_INFO')}</h4>
              </div>
              <div className="row justify-content-between gap-3">
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
                    label="LBL_USER_NAME"
                    accessor="username"
                    mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                    isRequired={true}
                  />
                </div>
              </div>
              <div className="row justify-content-between gap-3">
                <div className="col-md-5">
                  <TextInput
                    formik={formik}
                    label="LBL_PHONE_NUMBER"
                    accessor="phoneNumber"
                    mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                    isRequired={true}
                  />
                </div>
                <div className="col-md-5">
                  <TextInput
                    formik={formik}
                    label="LBL_EMAIL"
                    accessor="email"
                    mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                    isRequired={true}
                  />
                </div>
              </div>
              <div className="row justify-content-between gap-3">
                <div className="col-md-5">
                  <TextInput
                    formik={formik}
                    label="LBL_NATIONAL_ID"
                    accessor="nationalId"
                    mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                    isRequired={true}
                  />
                </div>
                {enableEdit || addNew ? (
                  <div className="col-md-5">
                    <DropDown
                      options={operatorStatus}
                      formik={formik}
                      isRequired={true}
                      disabled={false}
                      label="LBL_STATE"
                      accessor="state"
                      // translate={unitTypeSelect.mode === 'enum'}
                      keys={{ valueKey: 'value', titleKey: 'name' }}
                      mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                    />
                  </div>
                ) : (
                  <div className="col-md-5">
                    <TextInput
                      formik={formik}
                      label="LBL_STATE"
                      accessor="state"
                      mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                      isRequired={true}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="col-md-3">
              <FileInput
                formik={formik}
                identifier="imageUrl"
                label="LBL_PHOTO_IMAGE"
                mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
              />
            </div>
          </div>

          {addNew && (
            <>
              <BorderSection title="LBL_ADD_PASSWORD" />

              <div className="row justify-content-between gap-3">
                <div className="col-md-5">
                  <TextInput
                    formik={formik}
                    label="LBL_PASSWORD"
                    accessor="password"
                    mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                    isRequired={true}
                  />
                </div>
                <div className="col-md-5">
                  <TextInput
                    formik={formik}
                    label="LBL_CONFIRM_PASSWORD"
                    accessor="confirmPassword"
                    mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                    isRequired={true}
                  />
                </div>
              </div>
            </>
          )}
        </div>
        <button type="submit" ref={btnRef} hidden></button>
      </form>
    </div>
  );
};

export default SupervisorsForm;
