import { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Link, useNavigate } from 'react-router-dom';
import { SpinnerCircular } from 'spinners-react';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { enc, mode as encMode, AES, pad } from 'crypto-js';
import { useDispatch } from 'react-redux';
import { useLocation, useSearchParams } from 'react-router-dom';

import Otp from './Otp';
import ForgetPassword from './ForgetPassword';
import ErrorMessage from '../components/ui/inputs/ErrorMessage';
import PrimaryButton from '../components/ui/buttons/PrimaryButton';

import LoginLogoImg from '../assets/images/login/login-img.svg';
import OtpImg from '../assets/images/icons/otp-asset.png';

import { useAxiosFunction } from '../hooks/useAxios';
import { getLoginUrl } from '../services/getUrl';
import { setItem, setToken } from '../utils/localStorage';
import { VALID_PASSWORD_WITH_SPECIAL_CHARS, VALID_TEXT_WITH_SPECIAL_CHARS_WITHOUT_SPACES } from '../constants/regex/Regex';
import { setFieldValue } from '../utils/formHelpers';
import { authActions } from '../store/auth';
import { alertsActions } from '../store/alerts';
import { confirmationPopupActions } from '../store/confirmationPopup';

function Login() {
  let testURl = '';
  let urlTenantId = null;
  const [searchParams] = useSearchParams();
  const [username] = useState(searchParams.get('username'));
  const [isUpdating] = useState(searchParams.get('isUpdating'));
  const location = useLocation();

  if (import.meta.env.VITE_ENV && import.meta.env.VITE_ENV !== 'dev') {
    const url = window.location;
    testURl = new URL(url);
    urlTenantId = testURl.hostname.split('.') ? testURl.hostname.split('.')[0] : null;
    // urlTenantId = 'qaemademo2023';
  }

  const { api } = useAxiosFunction();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showOtp, setShowOtp] = useState(false);
  const [passwordState, setPasswordState] = useState('password');
  const [toggle, setToggle] = useState(true);
  const [showLoginOrForgetPassword, setLoginOrForgetPassword] = useState(true);
  const [loginStatus, setloginStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const initVals = {
    emailAddress: username ? username : '',
    password: '',
    companyId: '',
  };

  const valSchema = Yup.object({
    emailAddress: Yup.string().trim().email(t('CUSTOMER_EMAIL_VALIDATION_MESSAGE')).required(t('LOGIN_EMAIL_VALIDATION_MESSAGE')),
    password: Yup.string()
      .trim()
      .required(t('LOGIN_PASSWORD_REQUIRED_VALIDATION_MESSAGE'))
      .matches(VALID_PASSWORD_WITH_SPECIAL_CHARS, t('VALID_PASSWORD_VALIDATION_MESSAGE')),
    companyId: Yup.string()
      .matches(VALID_TEXT_WITH_SPECIAL_CHARS_WITHOUT_SPACES, t('VALID_INPUT_WITH_SPECIAL_CHARS_WITHOUT_SPACES'))
      .trim()
      .required(t('LOGIN_COMPANY_ID_VALIDATION_MESSAGE')),
  });

  const showErrorMessage = message => dispatch(alertsActions.initiateAlert({ message }));

  const addAuthCookiesToLocalStorage = response => {
    if (response?.data?.otpEnabled) {
      dispatch(authActions.setTempToken({ checksum: response.headers.get('checksum') }));
      setIsLoading(false);
      return setShowOtp(true);
    }

    if (response.status === 202) {
      dispatch(authActions.setTempToken({ checksum: response.headers.get('checksum') }));
      setIsLoading(false);
      dispatch(authActions.enableChangePassword(true));
      return navigate('/change-password');
    }

    setToken({ checksum: response.headers.get('checksum') });
    setItem('isTour', true);
    return window.location.reload(true);
  };

  const submit = async () => {
    const onSuccess = response => {
      setloginStatus(response.status || null);
      if (response.status === 202) {
        addAuthCookiesToLocalStorage(response);
      } else if (response.status === 200) {
        addAuthCookiesToLocalStorage(response);
      } else if (response.status === 401) {
        showErrorMessage('UNAUTHORIZED_MESSAGE');
      } else showErrorMessage('UNAUTHORIZED_MESSAGE');
    };

    const onError = error => {
      setIsLoading(false);

      if (error.response.status === 401) {
        showErrorMessage('UNAUTHORIZED_MESSAGE');
      }
    };

    try {
      const params = new URLSearchParams();
      params.append('username', formik.values.emailAddress.toString().trim().toLowerCase());
      const keyBase64 = import.meta.env.VITE_SECRET;
      var key = enc.Base64.parse(keyBase64);
      var srcs = enc.Utf8.parse(formik.values.password.toString().trim());
      var encrypted = AES.encrypt(srcs, key, {
        mode: encMode.ECB,
        padding: pad.Pkcs7,
      });
      params.append('password', encrypted.toString().trim());
      params.append('tenantId', formik.values.companyId.toString().trim());
      setIsLoading(true);
      await api('POST', getLoginUrl(), params, onSuccess, onError, 'application/x-www-form-urlencoded');
    } catch (error) {
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

  const onChangeLanguageClick = () => {
    const onConfirmHandler = () => {
      setItem('code', i18n.language === 'en' ? 'ar' : 'en');
      window.location.reload(true);
    };

    dispatch(confirmationPopupActions.openPopup({ message: 'LBL_DATA_WILL_REMOVE', onConfirmHandler }));
  };

  useEffect(() => {
    if (import.meta.env.VITE_ENV && import.meta.env.VITE_ENV !== 'dev') {
      setFieldValue(formik, 'companyId', urlTenantId);
    }
  }, [urlTenantId, import.meta.env.VITE_ENV]);

  useEffect(() => {
    if (isUpdating === 'true') dispatch(alertsActions.initiateAlert({ title: 'Info', message: 'YOUR_COMPANY_PACKAGE_IS_UPDATING' }));
  }, []);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-xl-6 p-0">
          <div className="login-card">
            <div className="col-md-10">
              {!showOtp && showLoginOrForgetPassword && (
                <div className="login-main">
                  <form className="login-form" onSubmit={formik.handleSubmit}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h4> {t('SIGN_IN_TO_SCHOOLING')} </h4>
                      </div>
                      <div className="d-flex justify-content-start align-items-start">
                        <Link
                          to={{
                            pathname: location.pathname,
                            search: location.search,
                          }}
                          className="lang-button"
                          onClick={onChangeLanguageClick}
                        >
                          {i18n.dir() === 'rtl' ? 'English' : 'العربية'}
                        </Link>
                      </div>
                    </div>
                    <div className="form-group email-icon">
                      <input
                        className="form-control form-control-lg"
                        type="text"
                        name="emailAddress"
                        placeholder={t('LBL_EMAIL_ADDRESS')}
                        value={formik.values.emailAddress}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      <div className="user-icon fa">
                        <span className="u-icon"> </span>
                      </div>
                      <ErrorMessage formik={formik} mode="add" identifier="emailAddress" />
                    </div>

                    <div className="form-group">
                      <input
                        className="form-control form-control-lg"
                        type={passwordState}
                        name="password"
                        required=""
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
                      <ErrorMessage formik={formik} mode="add" identifier="password" />
                    </div>
                    {!urlTenantId && (
                      <div className="form-group">
                        <input
                          className="form-control form-control-lg"
                          type="text"
                          name="companyId"
                          required=""
                          placeholder={t('LBL_COMPANY_ID')}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                        <ErrorMessage formik={formik} mode="add" identifier="companyId" />
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
                      {!isLoading && <PrimaryButton theme="submitBlue" type="submit" text="LBL_SIGN_IN" />}
                    </div>
                    <div
                      className="forgot-link"
                      onClick={() => {
                        setLoginOrForgetPassword(false);
                      }}
                    >
                      <Link style={{ pointerEvents: 'none' }}> {t('LBL_FORGOT_PASSWORD')} </Link>
                    </div>
                  </form>
                </div>
              )}
              {showOtp && (
                <Otp username={formik.values.emailAddress} loginStatus={loginStatus} isLoading={isLoading} setIsLoading={setIsLoading} />
              )}
              {!showOtp && !showLoginOrForgetPassword && (
                <ForgetPassword setLoginOrForgetPassword={setLoginOrForgetPassword} urlTenantId={urlTenantId} />
              )}
            </div>
          </div>
        </div>
        {!showOtp && (
          <div className="col-xl-6">
            <div className="qa-right-bg">
              <img className="img-fluid" src={LoginLogoImg} alt="login" />
            </div>
          </div>
        )}
        {showOtp && (
          <div className="col-xl-6">
            <div className="qa-right-bg">
              <img className="img-fluid" src={OtpImg} alt={OtpImg} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
