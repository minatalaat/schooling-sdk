// import { useState } from 'react';
// import { useTranslation } from 'react-i18next';

// import ErrorMessage from './ErrorMessage';

// const PasswordInput = ({ formik, accessor = 'password' }) => {
//   const { t } = useTranslation();
//   const [passwordState, setPasswordState] = useState('password');
//   const [toggle, setToggle] = useState(true);

//   return (
//     <div className="form-group">
//       <input
//         className="form-control form-control-lg"
//         type={passwordState}
//         name={accessor}
//         required={true}
//         placeholder={t('LBL_PASSWORD')}
//         onChange={formik.handleChange}
//         onBlur={formik.handleBlur}
//       />
//       {!toggle && (
//         <div
//           className="show-hide fa"
//           onClick={() => {
//             setToggle(!toggle);
//             setPasswordState('password');
//           }}
//         >
//           <span className="show"> </span>
//         </div>
//       )}
//       {toggle && (
//         <div
//           className="show-hide fa"
//           onClick={() => {
//             setToggle(!toggle);
//             setPasswordState('text');
//           }}
//         >
//           <span> </span>
//         </div>
//       )}
//       <ErrorMessage formik={formik} mode="add" identifier={accessor} />
//     </div>
//   );
// };

// export default PasswordInput;
import { useState, useId } from 'react';
import { useTranslation } from 'react-i18next';
import eye from '../../../assets/images/eye.svg';
import eyeoff from '../../../assets/images/eye-off.svg';
import ErrorMessage from './ErrorMessage';

// import { useState } from 'react';
// import { useTranslation } from 'react-i18next';

// import ErrorMessage from './ErrorMessage';

const PasswordInput = ({ formik, accessor = 'password', mode, label, isRequired = true }) => {
  const { t } = useTranslation();

  const [passwordType, setPasswordType] = useState(true);

  const [isFocused, setIsFocused] = useState(false);

  const id = useId();
  const handleFocus = () => setIsFocused(true);

  const handleBlur = e => {
    formik.handleBlur(e);
    setIsFocused(false);
  };

  const hasContent = formik.values[accessor]?.toString()?.trim().length > 0 || false;
  const labelText = !isRequired ? (isFocused || hasContent ? t(label) : `${t(label)} ${t('LBL_OPTIONAL')}`) : t(label);

  return (
    <div id={id}>
      <div className="form-floating">
        <input
          type={passwordType ? 'password' : 'text'}
          className={`form-control password-input-container ${formik.touched[accessor] && formik.errors[accessor] ? 'validation' : ''}`}
          name={accessor}
          id={accessor}
          placeholder={t(labelText)}
          onChange={formik.handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={formik.values[accessor]}
        />
        <label htmlFor={accessor}>{labelText}</label>
        <button
          className="btn password-toggle-button"
          type="button"
          onClick={() => {
            setPasswordType(!passwordType);
          }}
        >
          <img src={passwordType ? eyeoff : eye} alt="toggle password visibility" />
        </button>
      </div>
      <ErrorMessage formik={formik} mode={mode} identifier={accessor} />
    </div>
  );
};

export default PasswordInput;
