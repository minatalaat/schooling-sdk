// import { useTranslation } from 'react-i18next';

// import TooltipComp from '../../TooltipComp';
// import ErrorMessage from './ErrorMessage';

// import { handleChange } from '../../../utils/formHelpers';
// import { formatFloatNumber } from '../../../utils/helpers';
// import { useMemo } from 'react';

// export default function NumberInput({
//   disabled,
//   formik,
//   isRequired,
//   label,
//   step = 1,
//   accessor,
//   tooltip,
//   mode = 'view',
//   className,
//   onChange,
//   onBlur,
// }) {
//   const { t } = useTranslation();

//   const viewModeData = useMemo(() => formatFloatNumber(formik.values[accessor]), [formik.values[accessor]]);

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
//             type="number"
//             step={step}
//             className={`form-control ${className || ''} ${formik.touched[accessor] && formik.errors[accessor] ? 'validation' : ''}`}
//             name={accessor}
//             id={accessor}
//             placeholder={t(label)}
//             onChange={typeof onChange === 'function' ? e => onChange(e) : (e, value) => handleChange(formik, e, value)}
//             onBlur={typeof onBlur === 'function' ? e => onBlur(e) : formik.handleBlur}
//             value={formik.values[accessor]}
//           />
//           <ErrorMessage formik={formik} mode={mode} identifier={accessor} />
//         </>
//       ) : (
//         <input
//           type="text"
//           step={1}
//           className={className ? `form-control ${className}` : 'form-control'}
//           id="Label"
//           placeholder=""
//           value={viewModeData}
//           disabled
//         />
//       )}
//     </>
//   );
// }
import { useTranslation } from 'react-i18next';

// import TooltipComp from '../../TooltipComp';
import ErrorMessage from './ErrorMessage';
import DisabledInput from './DisabledInput/DisabledInput';

import { handleChange } from '../../../utils/formHelpers';
import { formatFloatNumber } from '../../../utils/helpers';
import { useMemo, useId } from 'react';

export default function NumberInput({
  disabled,
  formik,
  index,
  label,
  step = 1,
  accessor,
  tooltip,
  mode = 'view',
  className,
  onChange,
  onBlur,
  isInteractiveTable,
  parentFormik,
  parentAccessor,
}) {
  const { t } = useTranslation();
  const tooltipId = useId();
  const viewModeData = useMemo(() => formatFloatNumber(formik.values[accessor]), [formik.values[accessor]]);
  return (
    <>
      {!disabled && mode !== 'view' ? (
        <>
          <div className="form-floating" data-tooltip-id={tooltipId ?? accessor}>
            <input
              type="number"
              step={step}
              className={`form-control ${className || ''} ${(formik.touched[accessor] && formik.errors[accessor]) || (isInteractiveTable && parentFormik?.errors?.[parentAccessor]?.[index]?.[accessor]) ? 'validation' : ''}`}
              name={accessor}
              id={accessor}
              placeholder={t(label)}
              onChange={typeof onChange === 'function' ? e => onChange(e) : (e, value) => handleChange(formik, e, value)}
              onBlur={typeof onBlur === 'function' ? e => onBlur(e) : formik.handleBlur}
              value={formik.values[accessor]}
            />

            <label htmlFor={accessor} className="form-label">
              {t(label)}
            </label>

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
        <DisabledInput inputValue={viewModeData} labelValue={t(label)} isInteractiveTable={isInteractiveTable} />
      )}
    </>
  );
}
