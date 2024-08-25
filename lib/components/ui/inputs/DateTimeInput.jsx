import { useTranslation } from 'react-i18next';
import moment from 'moment';
import 'moment/locale/ar';

import TooltipComp from '../../TooltipComp';
import ErrorMessage from './ErrorMessage';

import { handleChange } from '../../../utils/formHelpers';

export default function DateTimeInput({ disabled, formik, isRequired, label, accessor, tooltip, onChange, mode = 'view' }) {
  const { t } = useTranslation();

  moment.locale(localStorage.getItem('code'));

  return (
    <div className={!disabled ? 'date-input' : ''}>
      <label htmlFor={accessor} className="form-label">
        {t(label)}
        {isRequired && !disabled && <span>*</span>}
      </label>
      {tooltip && <TooltipComp fieldKey={tooltip} />}
      {!disabled && mode !== 'view' ? (
        <>
          <input
            type="datetime-local"
            className="form-control"
            name={accessor}
            id={accessor}
            onChange={typeof onChange === 'function' ? e => onChange(e) : (e, value) => handleChange(formik, e, value)}
            onBlur={formik.handleBlur}
            value={formik.values[accessor]}
          />
          <ErrorMessage formik={formik} mode={mode} identifier={accessor} />
        </>
      ) : (
        <input type="text" className="form-control" id="Label" placeholder="" value={formik.values[accessor]} disabled />
      )}
    </div>
  );
}
