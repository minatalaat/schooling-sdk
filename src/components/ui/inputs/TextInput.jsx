// import { useTranslation } from 'react-i18next';
// import PropTypes from 'prop-types';

// import TooltipComp from '../../TooltipComp';
// import ErrorMessage from './ErrorMessage';

// import { handleChange } from '../../../utils/formHelpers';
// import { get } from 'lodash';

// export default function TextInput({
//   disabled,
//   formik,
//   isRequired,
//   label,
//   accessor,
//   tooltip,
//   translate,
//   mode = 'view',
//   className,
//   onChange,
//   onBlur,
//   maxLength = 255,
// }) {
//   const { t } = useTranslation();
//   const nestedAccessor = accessor.split('.');
//   const accessorValue = get(formik.values, nestedAccessor, '');
//   return (
//     <>
//       <label htmlFor={accessor} className="form-label">
//         {t(label)}
//         {isRequired && !disabled && mode !== 'view' && <span>*</span>}
//       </label>
//       {tooltip && <TooltipComp fieldKey={tooltip} />}
//       {!disabled && mode !== 'view' ? (
//         <>
//           <input
//             type="text"
//             className={`form-control ${className || ''} ${formik.touched[accessor] && formik.errors[accessor] ? 'validation' : ''}`}
//             name={accessor}
//             id={accessor}
//             placeholder={t(label)}
//             onChange={typeof onChange === 'function' ? e => onChange(e) : (e, value) => handleChange(formik, e, value)}
//             onBlur={typeof onBlur === 'function' ? e => onBlur(e) : formik.handleBlur}
//             value={accessorValue}
//             maxLength={maxLength}
//           />
//           <ErrorMessage formik={formik} mode={mode} identifier={accessor} />
//         </>
//       ) : (
//         <input
//           type="text"
//           className={className ? `form-control ${className}` : 'form-control'}
//           id="Label"
//           placeholder=""
//           value={translate ? t(accessorValue) : accessorValue}
//           disabled
//         />
//       )}
//     </>
//   );
// }

// TextInput.propTypes = {
//   disabled: PropTypes.bool,
//   formik: PropTypes.object,
//   isRequired: PropTypes.bool,
//   label: PropTypes.string.isRequired,
//   accessor: PropTypes.string.isRequired,
//   tooltip: PropTypes.string,
//   translate: PropTypes.bool,
//   mode: PropTypes.string,
//   className: PropTypes.string,
//   onChange: PropTypes.func,
//   onBlur: PropTypes.func,
//   maxLength: PropTypes.number,
// };

import { useTranslation } from 'react-i18next';
import { useId, useState } from 'react';

import PropTypes from 'prop-types';

import ErrorMessage from './ErrorMessage';
import DisabledInput from './DisabledInput/DisabledInput';

import { handleChange } from '../../../utils/formHelpers';

export default function TextInput({
  disabled,
  formik,
  isRequired,
  label,
  accessor,
  translate,
  mode = 'view',
  className,
  onChange,
  onBlur,
  maxLength = 255,
  onClick,
  isInteractiveTable,
  parentFormik,
  parentAccessor,
  index,
  tooltip,
}) {
  const { t } = useTranslation();
  const tooltipId = useId()
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => setIsFocused(true);

  const handleBlur = e => {
    if (typeof onBlur === 'function') {
      onBlur(e);
    } else formik.handleBlur(e);
    setIsFocused(false);
  };

  const hasContent = formik.values[accessor]?.toString()?.trim().length > 0 || false;
  const labelText = !isRequired ? (isFocused || hasContent ? t(label) : `${t(label)} ${t('LBL_OPTIONAL')}`) : t(label);

  return (
    <>
      {!disabled && mode !== 'view' ? (
        <>
          <div className="form-floating" data-tooltip-id={tooltipId ?? accessor}>
            <input
              data-testid="text-input-test-id"
              type="text"
              className={`form-control ${className || ''} ${(formik.touched[accessor] && formik.errors[accessor]) || (isInteractiveTable && parentFormik?.errors?.[parentAccessor]?.[index]?.[accessor]) ? 'validation' : ''}`}
              name={accessor}
              id={accessor}
              placeholder={t(label)}
              onChange={typeof onChange === 'function' ? e => onChange(e) : (e, value) => handleChange(formik, e, value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              value={formik.values[accessor]}
              maxLength={maxLength}
              onClick={onClick ?? undefined}
            />
            <label htmlFor={accessor}>{labelText}</label>
            <ErrorMessage
              formik={formik}
              mode={mode}
              identifier={accessor}
              parentFormik={parentFormik}
              parentAccessor={parentAccessor}
              isInteractiveTable={isInteractiveTable}
              index={index}
              tooltip={tooltip}
              tooltipId={tooltipId}
            />
          </div>
        </>
      ) : (
        <DisabledInput
          inputValue={translate ? t(formik.values[accessor]) : formik.values[accessor]}
          labelValue={t(label)}
          onClick={onClick ?? undefined}
          isInteractiveTable={isInteractiveTable}
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
