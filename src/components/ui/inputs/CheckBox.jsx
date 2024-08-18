import { useTranslation } from 'react-i18next';

import ErrorMessage from './ErrorMessage';

import { handleChange } from '../../../utils/formHelpers';

export default function CheckBox({ formik, label, accessor, mode, disabled, onChangeCallback }) {
  const { t } = useTranslation();
  return (
    <>
      <div className="form-check float-start m-r-30">
        <input
          className="form-check-input"
          type="checkbox"
          value={formik.values[accessor]}
          name={accessor}
          onChange={
            mode === 'view' || disabled
              ? () => {}
              : typeof onChangeCallback === 'function'
                ? (e, value) => {
                    handleChange(formik, e, value);
                    onChangeCallback();
                  }
                : (e, value) => handleChange(formik, e, value)
          }
          onBlur={formik.handleBlur}
          checked={!disabled && mode !== 'view' ? formik.values[accessor] : formik.initialValues[accessor]}
        />
        <label className="form-check-label" htmlFor={accessor}>
          {t(label)}
        </label>
      </div>
      <ErrorMessage formik={formik} mode={mode} identifier={accessor} />
    </>
  );
}
