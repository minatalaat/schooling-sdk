import { useTranslation } from 'react-i18next';

import TooltipComp from '../../TooltipComp';
import ErrorMessage from './ErrorMessage';

import { handleChange } from '../../../utils/formHelpers';

export default function TimeInput({
  disabled,
  formik,
  isRequired,
  label,
  accessor,
  tooltip,
  translate,
  mode = 'view',
  className,
  onChange,
  onBlur,
}) {
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
          <input
            type="time"
            className={className ? `form-control ${className}` : 'form-control'}
            name={accessor}
            id={accessor}
            placeholder={t(label)}
            onChange={typeof onChange === 'function' ? e => onChange(e) : (e, value) => handleChange(formik, e, value)}
            onBlur={typeof onBlur === 'function' ? e => onBlur(e) : formik.handleBlur}
            value={formik.values[accessor]}
          />
          <ErrorMessage formik={formik} mode={mode} identifier={accessor} />
        </>
      ) : (
        <input
          type="text"
          className={className ? `form-control ${className}` : 'form-control'}
          id="Label"
          placeholder=""
          value={translate ? t(formik.values[accessor]) : formik.values[accessor]}
          disabled
        />
      )}
    </>
  );
}
