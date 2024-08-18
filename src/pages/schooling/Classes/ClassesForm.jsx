import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useTabs } from '../../../hooks/useTabs';
import DropDown from '../../../components/ui/inputs/DropDown';
import { useNavigate } from 'react-router-dom';
import { useClassesServices } from '../../../services/apis/useClassesServices';
import TextInput from '../../../components/ui/inputs/TextInput';

const ClassesForm = ({ enableEdit, data, addNew, btnRef }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const tabsProps = useTabs();
  const { addClass, fetchAvailableGrades, updateClass } = useClassesServices();

  const [grades, setGrades] = useState([]);
  const initialValues = {
    grade: data?.grade || { id: undefined },
    name: data?.name || '',
  };
  const validationSchema = Yup.object().shape({
    grade: Yup.object().shape({
      id: Yup.number().required(`* ${t('REQUIRED')}`),
    }),
    name: Yup.string()
      .required(`* ${t('REQUIRED')}`)
      .trim(),
  });

  const submit = values => {
    values = {
      ...values,
    };

    if (formik.isValid) {
      if (addNew) {
        addClass(values, () => {
          navigate(-1);
        });
      } else {
        updateClass(data?.id, { grade: { id: +values?.grade?.id }, name: values.name, code: data?.code }, () => {
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

  const importGrades = async () => {
    const data = await fetchAvailableGrades();
    setGrades(data?.data);
  };

  useEffect(() => {
    tabsProps.setShowTabsContent(true);
    importGrades();
  }, []);

  const gradesOptions = grades?.map(data => {
    return {
      name: data?.name,
      value: data?.id,
    };
  });

  return (
    <div className="flex col">
      <form className="login-form" onSubmit={formik.handleSubmit}>
        <div className="card vh-100">
          <div className="row justify-content-between gap-3">
            <div className="col-md-5">
              <DropDown
                placeholder={formik.values.grade?.name}
                options={gradesOptions}
                formik={formik}
                isRequired={true}
                disabled={false}
                label="LBL_GRADE"
                accessor="grade.id"
                keys={{ valueKey: 'value', titleKey: 'name' }}
                mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
              />
            </div>
            <div className="col-md-5">
              <TextInput
                formik={formik}
                label="LBL_CLASS_NAME"
                accessor="name"
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

export default ClassesForm;
