import { useState } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Toast, ToastContainer } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import Spinner from '../../components/Spinner/Spinner';
import ErrorMessage from '../../components/ui/inputs/ErrorMessage';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';

import loginLogo from '../../assets/images/logo/login.svg';
import ChangePasswordImg from '../../assets/images/icons/change password.png';

import { VALID_PASSWORD_WITH_SPECIAL_CHARS } from '../../constants/regex/Regex';
import useChangePasswordServices from '../../services/apis/useChangePasswordServices';
import { alertsActions } from '../../store/alerts';

function ChangeUserPassword() {
  const dispatch = useDispatch();

  const { t } = useTranslation();
  const { saveFirstLoginChangesService, changePasswordService } = useChangePasswordServices();

  const { firstLogin } = useSelector(state => state.auth);

  const [passwordType, setPasswordType] = useState(true);
  const [retypePasswordType, setRetypePasswordType] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);

  const initVals = {
    password: '',
    confirmPassword: '',
  };
  const valSchema = Yup.object({
    password: Yup.string()
      .required(t('PASSWORD_VALIDATION_MESSAGE'))
      .matches(VALID_PASSWORD_WITH_SPECIAL_CHARS, t('VALID_PASSWORD_VALIDATION_MESSAGE')),
    confirmPassword: Yup.string()
      .required(t('RETYPE_PASSWORD_VALIDATION_MESSAGE'))
      .oneOf([Yup.ref('password'), null], t('VALID_RETYPE_PASSWORD_VALIDATION_MESSAGE')),
  });

  const submit = async () => {
    setIsLoading(true);

    try {
      if (firstLogin) {
        const res = await saveFirstLoginChangesService(formik.values);
        if (!res) return dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'SOMETHING_WENT_WRONG' }));
        setPasswordChanged(true);
      } else {
        const res = await changePasswordService(formik.values);
        if (!res) return null;
        setPasswordChanged(true);
      }
    } catch (err) {
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: initVals,
    validationSchema: valSchema,
    onSubmit: submit,
    validateOnMount: true,
  });

  return (
    <>
      {isLoading && <Spinner />}
      <div className="container-fluid">
        <div className="row">
          {!isLoading && (
            <div className="col-xl-6 p-0">
              <div className="login-card">
                <div className="col-md-10">
                  <div>
                    <a href="/" className="logo text-left">
                      <img className="text-left" src={loginLogo} alt={loginLogo} />
                    </a>
                  </div>
                  <div className="login-main">
                    <form className="login-form" onSubmit={formik.handleSubmit}>
                      <h4>{t('LBL_ENTER_NEW_PASSWORD')}</h4>
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

                      <div className="form-group">
                        <input
                          className="form-control form-control-lg"
                          type={passwordType === false ? 'text' : 'password'}
                          name="password"
                          placeholder={t('LBL_NEW_PASSWORD')}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                        {!passwordType && (
                          <div
                            className="show-hide fa"
                            onClick={() => {
                              setPasswordType(!passwordType);
                            }}
                          >
                            <span className="show"></span>
                          </div>
                        )}
                        {passwordType && (
                          <div
                            className="show-hide fa"
                            onClick={() => {
                              setPasswordType(!passwordType);
                            }}
                          >
                            <span></span>
                          </div>
                        )}
                        <ErrorMessage formik={formik} mode="add" identifier="password" />
                      </div>
                      <div className="form-group">
                        <input
                          className="form-control form-control-lg"
                          type={retypePasswordType === false ? 'text' : 'password'}
                          name="confirmPassword"
                          placeholder={t('LBL_RETYPE_NEW_PASSWORD')}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                        {!retypePasswordType && (
                          <div
                            className="show-hide fa"
                            onClick={() => {
                              setRetypePasswordType(!retypePasswordType);
                            }}
                          >
                            <span className="show"></span>
                          </div>
                        )}
                        {retypePasswordType && (
                          <div
                            className="show-hide fa"
                            onClick={() => {
                              setRetypePasswordType(!retypePasswordType);
                            }}
                          >
                            <span></span>
                          </div>
                        )}
                        <ErrorMessage formik={formik} mode="add" identifier="confirmPassword" />
                      </div>
                      <div className="form-group mb-0">
                        <PrimaryButton theme="submitBlue" type="submit" text="LBL_CONTINUE" disabled={passwordChanged} />
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="col-xl-6">
            <div className="qa-right-bg">
              <img className="img-fluid" src={ChangePasswordImg} alt={ChangePasswordImg} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ChangeUserPassword;
