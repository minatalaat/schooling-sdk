import { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Toast, ToastContainer } from 'react-bootstrap';
import { SpinnerCircular } from 'spinners-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import ErrorMessage from '../components/ui/inputs/ErrorMessage';
import PrimaryButton from '../components/ui/buttons/PrimaryButton';

import { useAxiosFunction } from '../hooks/useAxios';
import { getForgotPasswordURL } from '../services/getUrl';
import { VALID_TEXT_WITH_SPECIAL_CHARS, NO_WHITE_SPACES } from '../constants/regex/Regex';
import { alertsActions } from '../store/alerts';
import { setFieldValue } from '../utils/formHelpers';

function ForgetPassword({ setLoginOrForgetPassword, urlTenantId }) {
  const { api } = useAxiosFunction();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitDisabled, setSubmitDisabled] = useState(false);

  const initVals = {
    emailAddress: '',
    tenantId: '',
  };

  const valSchema = Yup.object({
    emailAddress: Yup.string().email(t('CUSTOMER_EMAIL_VALIDATION_MESSAGE')).required(t('LOGIN_EMAIL_VALIDATION_MESSAGE')),
    tenantId: Yup.string()
      .matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS'))
      .trim()
      .required(t('LOGIN_COMPANY_ID_VALIDATION_MESSAGE'))
      .matches(NO_WHITE_SPACES, t('SPACES_ONLY_VALIDATION_MESSAGE')),
  });

  const sumbit = values => {
    setSubmitDisabled(true);

    if (formik.isValid) {
      setIsLoading(true);
      let forgotPasswordPayload = {
        data: {
          emailAttributes: {
            recipient: values.emailAddress.trim(),
            from: 'Qaema@qaema.com',
            emailType: 'resetpassword',
          },

          templateAttributes: {
            tenantId: values.tenantId ? values.tenantId.toLowerCase() : '',
          },
        },
      };

      if (forgotPasswordPayload) {
        api('POST', getForgotPasswordURL(), forgotPasswordPayload, onForgotPasswordSuccess, onForgotPasswordError);
      } else {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
      setSubmitDisabled(false);
    }
  };

  const formik = useFormik({
    initialValues: initVals,
    validationSchema: valSchema,
    onSubmit: sumbit,
  });

  const onForgotPasswordSuccess = response => {
    if (response.data.status === 0) {
      setIsLoading(false);
      dispatch(alertsActions.initiateAlert({ title: 'Success', message: 'FORGOT_PASSWORD_SUCCESS' }));
      setTimeout(() => {
        setLoginOrForgetPassword(true);
      }, [7000]);
    } else if (response.data.status === -1) {
      setIsLoading(false);
      dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'FP_001' }));
    }
  };

  const onForgotPasswordError = () => {
    setIsLoading(false);
    dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'SOMETHING_WENT_WRONG' }));
  };

  useEffect(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (urlTenantId !== undefined && urlTenantId !== null) {
      setFieldValue(formik, 'tenantId', urlTenantId);
    }
  }, [urlTenantId]);

  return (
    <div className="login-main">
      <form className="login-form" onSubmit={formik.handleSubmit}>
        <h4>{t('LBL_ENTER_RECOVERY_EMAIL')}</h4>
        {showToast && (
          <ToastContainer
            position="top-center"
            containerPosition="relative"
            className="mb-3"
            style={{
              width: '300px',
            }}
          >
            <Toast onClose={() => setShowToast(false)} show={showToast} delay={5000} autohide bg="danger">
              <Toast.Body className="text-white">{t('UN_AUTHORIZED')}</Toast.Body>
            </Toast>
          </ToastContainer>
        )}
        <div className="form-group email-icon">
          <input
            className="form-control form-control-lg"
            type="text"
            name="emailAddress"
            placeholder={t('LBL_EMAIL_ADDRESS')}
            onChange={isSubmitDisabled ? null : formik.handleChange}
            onBlur={isSubmitDisabled ? null : formik.handleBlur}
          />
          <div className="user-icon fa">
            <span className="u-icon"></span>
          </div>
          <ErrorMessage formik={formik} mode="add" identifier="emailAddress" />
        </div>
        {(urlTenantId === undefined || urlTenantId === null) && (
          <div className="form-group">
            <input
              className="form-control form-control-lg"
              type="text"
              name="tenantId"
              required=""
              placeholder={t('LBL_COMPANY_ID')}
              onChange={isSubmitDisabled ? null : formik.handleChange}
              onBlur={isSubmitDisabled ? null : formik.handleBlur}
            />
            <ErrorMessage formik={formik} mode="add" identifier="tenantId" />
          </div>
        )}
        <div className="form-group mb-0">
          {isLoading && (
            <div className="text-center">
              <SpinnerCircular
                size={70}
                thickness={120}
                speed={100}
                color="rgba(31, 79, 222, 1)"
                secondaryColor="rgba(153, 107, 229, 0.19)"
              />
            </div>
          )}
          {!isLoading && <PrimaryButton theme="submitBlue" type="submit" disabled={isSubmitDisabled} />}
        </div>
        <div
          className="forgot-link"
          onClick={() => {
            setLoginOrForgetPassword(true);
          }}
        >
          <Link style={{ pointerEvents: 'none' }}>{t('LBL_SIGN_IN')}</Link>
        </div>
      </form>
    </div>
  );
}

export default ForgetPassword;
