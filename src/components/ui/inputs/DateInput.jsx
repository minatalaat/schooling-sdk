import { useTranslation } from 'react-i18next';
import moment from 'moment';
import 'moment/locale/ar';

import TooltipComp from '../../TooltipComp';
import ErrorMessage from './ErrorMessage';
import { MODES } from '../../../constants/enums/FeaturesModes';

import { handleChange } from '../../../utils/formHelpers';

export default function DateInput({ disabled, formik, isRequired, label, accessor, tooltip, onChange, onBlur, mode = 'view', min, max }) {
  const { t } = useTranslation();
  moment.locale(localStorage.getItem('code'));

  let initialDate = moment(formik.values[accessor]).format('Do-MMMM-YYYY');

  return (
    <div className={!disabled && mode !== MODES.VIEW ? 'date-input' : ''}>
      <label htmlFor={accessor} className="form-label">
        {t(label)}
        {isRequired && !disabled && mode !== MODES.VIEW && <span>*</span>}
      </label>
      {tooltip && <TooltipComp fieldKey={tooltip} />}
      {!disabled && mode !== MODES.VIEW ? (
        <>
          <input
            type="date"
            className={`form-control ${formik.touched[accessor] && formik.errors[accessor] ? 'validation' : ''}`}
            name={accessor}
            id={accessor}
            onChange={typeof onChange === 'function' ? (e, value) => onChange(e, value) : (e, value) => handleChange(formik, e, value)}
            onBlur={typeof onBlur === 'function' ? e => onBlur(e) : formik.handleBlur}
            value={formik.values[accessor]}
            min={min}
            max={max}
          />
          <ErrorMessage formik={formik} mode={mode} identifier={accessor} />
        </>
      ) : (
        <input
          type="text"
          className="form-control"
          id="Label"
          placeholder=""
          value={initialDate !== 'Invalid date' ? initialDate : ''}
          disabled
        />
      )}
    </div>
  );
}
