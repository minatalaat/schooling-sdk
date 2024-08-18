export const setFieldValue = async (formik, field, value) => {
  formik.setFieldValue(field, value, true);
  setTimeout(() => formik.setFieldTouched(field, true));
};

export const resetForm = formik => {
  formik.resetForm();
  setTimeout(() => formik.validateForm());
};

export const handleChange = (formik, e, value) => {
  formik.handleChange(e, value);
  setTimeout(() => formik.setFieldTouched(e.target.name, true, true));
};

export const setSelectedValues = (formik, values) => {
  for (const [key, value] of Object.entries(values)) setFieldValue(formik, key, value);
};

export const setAllValues = (formik, values) => {
  formik.setValues(values, true);
};
