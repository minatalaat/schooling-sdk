// import { get } from 'lodash';
// import { useEffect, useState } from 'react';

// export default function ErrorMessage({ formik, identifier, mode, isFirstLoginStyle = false, isDataAvailableOnRender = true }) {
//   const [dataUpdated, setDataUpdated] = useState(false);

//   useEffect(() => {
//     if (mode === 'edit' && formik.isValid) setDataUpdated(true);
//   }, [mode, formik.isValid]);

//   let errorText = null;
//   const nestedIdentifier = identifier?.split('.');

//   if (mode === 'add' || dataUpdated || (mode === 'edit' && isDataAvailableOnRender)) {
//     errorText = (
//       <>
//         {get(formik.touched, nestedIdentifier) && get(formik.errors, nestedIdentifier) && (
//           <>
//             {!isFirstLoginStyle && <p className="color-text-red mb-3">{get(formik.errors, nestedIdentifier)}</p>}
//             {isFirstLoginStyle && <label className="text-red mb-3">{get(formik.errors, nestedIdentifier)}</label>}
//           </>
//         )}
//       </>
//     );
//   }

//   return errorText;
// }

import { useEffect, useState } from 'react';
import TooltipComp from '../../TooltipComp';
import { Tooltip } from 'react-tooltip';

// import { Tooltip } from 'react-bootstrap';

export default function ErrorMessage({
  formik,
  tooltip,
  identifier,
  mode,
  isFirstLoginStyle = false,
  isDataAvailableOnRender = true,
  isInteractiveTable = false,
  parentFormik,
  parentAccessor,
  index,
  tooltipId,
}) {
  const [dataUpdated, setDataUpdated] = useState(false);
  useEffect(() => {
    if (mode === 'edit' && formik.isValid) setDataUpdated(true);
  }, [mode, formik.isValid]);

  let errorText = null;

  if (mode === 'add' || dataUpdated || (mode === 'edit' && isDataAvailableOnRender)) {
    errorText = (
      <>
        {formik.touched[identifier] && formik.errors[identifier] && !isInteractiveTable ? (
          <>
            {!isFirstLoginStyle && !isInteractiveTable && <p className="color-text-red mb-3">{formik.errors[identifier]}</p>}
            {isFirstLoginStyle && !isInteractiveTable && <label className="text-red mb-3">{formik.errors[identifier]}</label>}
          </>
        ) : tooltip ? (
          <TooltipComp fieldKey={tooltip} />
        ) : (
          ''
        )}
        <>
          {isInteractiveTable && parentFormik?.errors?.[parentAccessor]?.[index]?.[identifier] !== undefined && (
            <>
              <Tooltip className="error-message-tooltip" id={tooltipId ?? identifier}>
                {parentFormik?.errors?.[parentAccessor]?.[index]?.[identifier]}
              </Tooltip>
            </>
          )}
        </>
      </>
    );
  }

  return errorText;
}
