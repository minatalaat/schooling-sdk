import { useTranslation } from 'react-i18next';
import ErrorMessage from './ErrorMessage';

const EmailInput = ({ formik, accessor = 'email', placeholder = 'LBL_EMAIL_ADDRESS' }) => {
  const { t } = useTranslation();
  return (
    <div className="form-group email-icon">
      <input
        className="form-control form-control-lg"
        type="email"
        name={accessor}
        placeholder={t(placeholder)}
        value={formik.values[accessor]}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
      />
      <div className="user-icon fa">
        <span className="u-icon"> </span>
      </div>
      <ErrorMessage formik={formik} mode="add" identifier={accessor} />
    </div>
  );
};

export default EmailInput;
