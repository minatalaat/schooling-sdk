import { useTranslation } from 'react-i18next';
import i18n from 'i18next';

import TooltipComp from '../../TooltipComp';

import { handleChange } from '../../../utils/formHelpers';

const CheckboxInput = ({
  disabled = false,
  formik,
  label,
  accessor,
  mode,
  onChange,
  tooltip,
  value,
  className = '',
  isOnlyCheckboxesInRow,
  isFirstLoginStyle = false,
}) => {
  const { t } = useTranslation();
  return (
    <div
      className={`form-check checkbox-input  ${i18n.dir() === 'ltr' ? 'm-r-30' : 'm-l-30'}  ${
        isOnlyCheckboxesInRow ? 'checkboxe-only' : ''
      } ${className}`}
    >
      <input
        className="form-check-input"
        type="checkbox"
        id="flexCheckDefault"
        name={accessor}
        value={value || formik.values[accessor]}
        checked={value ? formik.values[accessor]?.includes(value) : formik.values[accessor]}
        onChange={
          mode === 'view' || disabled
            ? () => {}
            : typeof onChange === 'function'
              ? e => onChange(e)
              : (e, value) => handleChange(formik, e, value)
        }
        onBlur={formik.handleBlur}
      />
      <label className={`form-check-label ${isFirstLoginStyle ? 'mb-0' : ''}`} htmlFor={accessor}>
        {t(label)}
      </label>
      {tooltip && <TooltipComp fieldKey={tooltip} />}
    </div>
  );
};

export default CheckboxInput;
