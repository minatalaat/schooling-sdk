import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import TextInput from '../../../components/ui/inputs/TextInput';
import { useTabs } from '../../../hooks/useTabs';
import FileInput from '../../../components/ui/inputs/FileInput';
import { useCategoriesServices } from '../../../services/apis/useCategoriesServices';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { alertsActions } from '../../../store/alerts';

const CanteenCategoriesForm = ({ enableEdit, data, addNew, btnRef }) => {
  const { t } = useTranslation();
  const tabsProps = useTabs();
  const { addCategory, updateCategory } = useCategoriesServices();
  const dispatch=useDispatch();
  const alertHandler = (title, message) => dispatch(alertsActions.initiateAlert({ title, message }));
  const navigate = useNavigate();
  const initialValues = {
    name: data?.name || '',
    name_ar: data?.name_ar || '',
    image: data?.image||'',
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required(`* ${t('REQUIRED')}`)
      .trim(),
    name_ar: Yup.string()
      .required(`* ${t('REQUIRED')}`)
      .trim(),
  });

  const submit = values => {
    if (formik.isValid) {
      if (addNew) {
        addCategory(values, () => {
      
          alertHandler('Success', t('CATEGORY_ADDED'));
          
          navigate(-1);
        });
      } else {
        updateCategory(data?.id, { ...values, id: data?.id }, () => {
          navigate(-1);
          alertHandler('Success', t('CATEGORY_UPDATED'));
        });
      }
    }
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: addNew ? true : false,
    onSubmit: submit,
  });

  useEffect(() => {
    tabsProps.setShowTabsContent(true);
  }, []);


  return (
    <div className="flex col">
      <form className="login-form" onSubmit={formik.handleSubmit}>
        <div className="card">
          <div className="row justify-content-between gap-3">
            <div className="col-md-12">
              <FileInput
               formik={formik}
               identifier="image"
                label="LBL_LOGO"
                 mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'} 
                 fileId={data?.image?.id}
                 parentId={data?.id}
                 />
         
            </div>
            <div className="col-md-5">
              <TextInput
                formik={formik}
                label="LBL_CATEGORY_NAME_EN"
                accessor="name"
                mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                isRequired={true}
              />
            </div>
            <div className="col-md-5">
              <TextInput
                formik={formik}
                label="LBL_CATEGORY_NAME_AR"
                accessor="name_ar"
                mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                isRequired={true}
              />
            </div>
          </div>
        </div>
        <button type="submit" ref={btnRef} hidden></button>
      </form>
    </div>
  );
};

export default CanteenCategoriesForm;
