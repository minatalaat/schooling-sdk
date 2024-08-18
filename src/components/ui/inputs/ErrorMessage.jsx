import { get } from 'lodash';
import { useEffect, useState } from 'react';

export default function ErrorMessage({ formik, identifier, mode, isFirstLoginStyle = false, isDataAvailableOnRender = true }) {
  const [dataUpdated, setDataUpdated] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && formik.isValid) setDataUpdated(true);
  }, [mode, formik.isValid]);

  let errorText = null;
  const nestedIdentifier = identifier?.split('.');

  if (mode === 'add' || dataUpdated || (mode === 'edit' && isDataAvailableOnRender)) {
    errorText = (
      <>
        {get(formik.touched, nestedIdentifier) && get(formik.errors, nestedIdentifier) && (
          <>
            {!isFirstLoginStyle && <p className="color-text-red mb-3">{get(formik.errors, nestedIdentifier)}</p>}
            {isFirstLoginStyle && <label className="text-red mb-3">{get(formik.errors, nestedIdentifier)}</label>}
          </>
        )}
      </>
    );
  }

  return errorText;
}
