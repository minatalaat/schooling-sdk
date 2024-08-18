import { useTranslation } from 'react-i18next';

import TooltipComp from '../../TooltipComp';
import ErrorMessage from './ErrorMessage';

import { handleChange } from '../../../utils/formHelpers';

export default function TextArea({ disabled, formik, isRequired, label, accessor, tooltip, translate, mode = 'view', maxLength = 1024 }) {
  const { t } = useTranslation();

  return (
    <>
      <label htmlFor={accessor} className="form-label">
        {t(label)}
        {isRequired && !disabled && mode !== 'view' && <span>*</span>}
      </label>
      {tooltip && <TooltipComp fieldKey={tooltip} />}
      {!disabled && mode !== 'view' ? (
        <>
          <textarea
            className={`form-control ${formik.touched[accessor] && formik.errors[accessor] ? 'validation' : ''}`}
            placeholder={t(label)}
            name={accessor}
            id={accessor}
            onChange={(e, value) => handleChange(formik, e, value)}
            onBlur={formik.handleBlur}
            value={formik.values[accessor]}
            maxLength={maxLength}
          ></textarea>
          <ErrorMessage formik={formik} mode={mode} identifier={accessor} />
        </>
      ) : (
        <textarea
          className="form-control"
          placeholder=""
          name={accessor}
          id={accessor}
          onChange={(e, value) => handleChange(formik, e, value)}
          onBlur={formik.handleBlur}
          value={translate ? t(formik.values[accessor]) : formik.values[accessor]}
          disabled
          maxLength={maxLength}
        ></textarea>
      )}
    </>
  );
}
