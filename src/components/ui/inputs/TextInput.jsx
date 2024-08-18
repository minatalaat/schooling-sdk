import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import TooltipComp from '../../TooltipComp';
import ErrorMessage from './ErrorMessage';

import { handleChange } from '../../../utils/formHelpers';
import { get } from 'lodash';

export default function TextInput({
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
  maxLength = 255,
}) {
  const { t } = useTranslation();
  const nestedAccessor = accessor.split('.');
  const accessorValue = get(formik.values, nestedAccessor, '');
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
            type="text"
            className={`form-control ${className || ''} ${formik.touched[accessor] && formik.errors[accessor] ? 'validation' : ''}`}
            name={accessor}
            id={accessor}
            placeholder={t(label)}
            onChange={typeof onChange === 'function' ? e => onChange(e) : (e, value) => handleChange(formik, e, value)}
            onBlur={typeof onBlur === 'function' ? e => onBlur(e) : formik.handleBlur}
            value={accessorValue}
            maxLength={maxLength}
          />
          <ErrorMessage formik={formik} mode={mode} identifier={accessor} />
        </>
      ) : (
        <input
          type="text"
          className={className ? `form-control ${className}` : 'form-control'}
          id="Label"
          placeholder=""
          value={translate ? t(accessorValue) : accessorValue}
          disabled
        />
      )}
    </>
  );
}

TextInput.propTypes = {
  disabled: PropTypes.bool,
  formik: PropTypes.object,
  isRequired: PropTypes.bool,
  label: PropTypes.string.isRequired,
  accessor: PropTypes.string.isRequired,
  tooltip: PropTypes.string,
  translate: PropTypes.bool,
  mode: PropTypes.string,
  className: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  maxLength: PropTypes.number,
};
