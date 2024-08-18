import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import TooltipComp from '../../TooltipComp';
import ErrorMessage from './ErrorMessage';

import { handleChange } from '../../../utils/formHelpers';

const DropDown = ({
  options,
  placeholder = 'LBL_PLEASE_SELECT',
  disabled,
  formik,
  isRequired = false,
  label,
  accessor,
  tooltip,
  translate = true,
  mode = 'view',
  keys = { valueKey: null, titleKey: null },
  initialValue = '',
  onChange,
  type = 'INTEGER',
  isFirstLoginStyle = false,
  noLabel = false,
}) => {
  const { t } = useTranslation();

  const viewValue = useMemo(() => {
    if (!options) return '';

    if (keys.valueKey && keys.titleKey) {
      let selectedOption;

      if (type === 'STRING') {
        selectedOption = options.find(option => option[keys.valueKey] === formik.values[accessor]);
      } else {
        selectedOption = options.find(option => Number(option[keys.valueKey]) === Number(formik.values[accessor]));
      }

      if (!selectedOption) return '';
      if (translate) return t(selectedOption[keys.titleKey]);
      return selectedOption[keys.titleKey];
    }

    if (translate) {
      return t(options[formik.values[accessor]]);
    }

    return options[formik.values[accessor]];
  }, [formik.values[accessor], !options]);

  const InitialOption = useMemo(() => {
    const initialOption = options?.length > 0 ? options.find(option => +option[keys?.valueKey || ''] === 0) : null;

    if (initialOption) return null;

    return (
      <option value={initialValue} hidden={isRequired ? true : false}>
        {t(placeholder)}
      </option>
    );
  }, [!options]);

  return (
    <>
      {!noLabel && (
        <label htmlFor={accessor} className="form-label">
          {t(label)}
          {isRequired && !disabled && mode !== 'view' && <span>*</span>}
        </label>
      )}
      {tooltip && <TooltipComp fieldKey={tooltip} />}
      {!disabled && mode !== 'view' ? (
        <>
          <select
            className={`form-select ${isFirstLoginStyle ? '' : 'placeholder-shown'}${
              Number(formik.values[accessor]) !== 0 ? ' edit' : ''
            } ${formik.touched[accessor] && formik.errors[accessor] ? 'validation' : ''}`}
            placeholder=""
            name={accessor}
            value={formik.values[accessor]}
            onChange={typeof onChange === 'function' ? e => onChange(e) : (e, value) => handleChange(formik, e, value)}
            onBlur={formik.handleBlur}
          >
            {InitialOption}
            {options &&
              !(keys.valueKey || keys.titleKey) &&
              Object.entries(options).map(([key, value]) => <option value={key}>{t(value)}</option>)}
            {options &&
              keys.valueKey &&
              keys.titleKey &&
              options.map(option => (
                <option value={option[keys.valueKey]} key={option[keys.valueKey]}>
                  {translate ? t(option[keys.titleKey]) : option[keys.titleKey]}
                </option>
              ))}
          </select>
          <ErrorMessage formik={formik} mode={mode} identifier={accessor} isFirstLoginStyle={isFirstLoginStyle} />
        </>
      ) : (
        <input type="text" className="form-control" id="Label" placeholder="" value={viewValue} disabled />
      )}
    </>
  );
};

export default DropDown;
