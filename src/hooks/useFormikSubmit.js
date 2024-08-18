import { useEffect, useState } from 'react';
import { setNestedObjectValues } from 'formik';

export const useFormikSubmit = (formik, errCallback, type = 'form') => {
  const [isSubmit, setIsSubmit] = useState(false);

  const handleFormikSubmit = () => {
    setIsSubmit(true);
    formik.handleSubmit();
    if (!formik.isValid && errCallback) errCallback();
  };

  const validateFormForSubmit = async () => {
    setIsSubmit(true);
    const validationErrors = await formik.validateForm();

    if (Object.keys(validationErrors).length > 0) {
      formik.setTouched(setNestedObjectValues(validationErrors, true));
    }

    if (!formik.isValid && errCallback) errCallback();

    return formik.isValid;
  };

  useEffect(() => {
    const element = document.querySelector(`${type === 'modal' ? '.modal-content .validation' : '.validation'}`);

    if (element && !formik.isValid && isSubmit) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setIsSubmit(false);
    }
  }, [document.querySelector('.validation'), isSubmit, type]);

  return { handleFormikSubmit, validateFormForSubmit };
};
