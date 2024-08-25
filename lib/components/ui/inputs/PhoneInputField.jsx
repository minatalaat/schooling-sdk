import 'react-phone-input-2/lib/style.css';
import 'react-phone-input-2/lib/material.css';

import { useTranslation } from 'react-i18next';
import ar from 'react-phone-input-2/lang/ar.json';

import TooltipComp from '../../TooltipComp';
import ErrorMessage from './ErrorMessage';
import PhoneInput from 'react-phone-input-2';

import { setFieldValue } from '../../../utils/formHelpers';

export default function PhoneInputField({
  disabled,
  formik,
  isRequired,
  label,
  identifier,
  tooltip,
  translate,
  mode = 'view',
  className,
  onChange,
  onBlur,
  maxLength = 16,
  placeholder = '+966-xx-xxx-xxxx',
  isFirstLoginStyle = false,
}) {
  const { t } = useTranslation();

  return (
    <>
      <label htmlFor={identifier} className="form-label">
        {t(label)}
        {isRequired && !disabled && mode !== 'view' && <span>*</span>}
      </label>
      {tooltip && <TooltipComp fieldKey={tooltip} />}

      {!disabled && mode !== 'view' ? (
        <>
          <PhoneInput
            country="sa"
            value={formik.values[identifier]}
            onChange={typeof onChange === 'function' ? e => onChange(e) : newValue => setFieldValue(formik, identifier, newValue)}
            onBlur={typeof onBlur === 'function' ? e => onBlur(e) : () => formik.setFieldTouched(identifier, true)}
            inputClass={`form-control ${className || ''} ${formik.touched[identifier] && formik.errors[identifier] ? 'validation' : ''}`}
            localization={ar}
            onlyCountries={['sa']}
            disableDropdown={true}
            containerClass={
              isFirstLoginStyle
                ? `telephone-container mt-0 ${formik.touched[identifier] && formik.errors[identifier] ? 'validation' : ''}`
                : `phone-container ${formik.touched[identifier] && formik.errors[identifier] ? 'validation' : ''}`
            }
            placeholder={placeholder}
            specialLabel=""
            enableAreaCodes={true}
            inputProps={{
              name: identifier,
              maxLength: maxLength,
            }}
          />
          <ErrorMessage formik={formik} mode={mode} identifier={identifier} isFirstLoginStyle={isFirstLoginStyle} />
        </>
      ) : (
        <input
          type="text"
          className={className ? `form-control ${className}` : 'form-control'}
          id="Label"
          placeholder=""
          value={translate ? t(formik.values[identifier]) : formik.values[identifier]}
          disabled
        />
      )}
    </>
  );
}
