import { useTranslation } from 'react-i18next';

import { handleChange } from '../../../utils/formHelpers';

export default function ToggleSwitch({ formik, label, accessor, mode, disabled, onChangeCallback, onChange, onBlur }) {
  const { t } = useTranslation();

  return (
    <div className="switch-ex" style={{ marginBottom: '20px' }}>
      {label && (
        <label className="form-label" htmlFor={accessor}>
          {t(label)}
        </label>
      )}
      <div className="form-check form-switch">
        <input
          className="form-check-input"
          type="checkbox"
          role="switch"
          id="flexSwitchCheckChecked"
          value={formik.values[accessor]}
          name={accessor}
          onChange={
            typeof onChange === 'function'
              ? (e, value) => {
                  onChange(e);
                  handleChange(formik, e, value);
                }
              : !disabled && mode !== 'view'
                ? (e, value) => {
                    handleChange(formik, e, value);
                    onChangeCallback && onChangeCallback();
                  }
                : () => {}
          }
          onBlur={typeof onBlur === 'function' ? e => onBlur(e) : formik.handleBlur}
          checked={formik.values[accessor]}
        />
      </div>
    </div>
  );
}
