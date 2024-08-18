import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import ErrorMessage from './ErrorMessage';

const PasswordInput = ({ formik, accessor = 'password' }) => {
  const { t } = useTranslation();
  const [passwordState, setPasswordState] = useState('password');
  const [toggle, setToggle] = useState(true);

  return (
    <div className="form-group">
      <input
        className="form-control form-control-lg"
        type={passwordState}
        name={accessor}
        required={true}
        placeholder={t('LBL_PASSWORD')}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
      />
      {!toggle && (
        <div
          className="show-hide fa"
          onClick={() => {
            setToggle(!toggle);
            setPasswordState('password');
          }}
        >
          <span className="show"> </span>
        </div>
      )}
      {toggle && (
        <div
          className="show-hide fa"
          onClick={() => {
            setToggle(!toggle);
            setPasswordState('text');
          }}
        >
          <span> </span>
        </div>
      )}
      <ErrorMessage formik={formik} mode="add" identifier={accessor} />
    </div>
  );
};

export default PasswordInput;
