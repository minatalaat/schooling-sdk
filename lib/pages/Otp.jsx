import { useCallback, useState, useEffect } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SpinnerCircular } from 'spinners-react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';

import ErrorMessage from '../components/ui/inputs/ErrorMessage';
import PrimaryButton from '../components/ui/buttons/PrimaryButton';

import { verifyOtpURL, getGenerateOtpURL } from '../services/getUrl';
import { VALID_TEXT_WITH_SPECIAL_CHARS } from '../constants/regex/Regex';
import { authActions } from '../store/auth';
import { setItem, setToken } from '../utils/localStorage';
import { getTempTokenHeaders } from '../services/getHeaders';
import { alertsActions } from '../store/alerts';

function Otp({ username, loginStatus, isLoading, setIsLoading }) {
  const otpExpirationTime = 180;

  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [timer, setTimer] = useState(otpExpirationTime);

  const auth = useSelector(state => state.auth);

  const initVals = {
    otp: '',
  };

  const valSchema = Yup.object({
    otp: Yup.string()
      .matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS'))
      .required(t('OTP_VALIDATION_MESSAGE'))
      .min(4, t('OTP_VALIDATION_MESSAGE_1'))
      .max(4, t('OTP_VALIDATION_MESSAGE_1')),
  });

  const alertHandler = (title, message) => dispatch(alertsActions.initiateAlert({ title, message }));

  const submit = async () => {
    if (timer <= 0) return;

    if (!formik.isValid) {
      return alertHandler('Error', t('LBL_OTP_001'));
    }

    setIsLoading(true);

    const verifyOTPResponse = await axios
      .post(verifyOtpURL(), { data: { otp: formik.values.otp } }, getTempTokenHeaders(verifyOtpURL(), auth?.tempToken))
      .then(res => res)
      .catch(err => err);

    if (!verifyOTPResponse?.data) {
      setIsLoading(false);
      return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    }

    if (!(verifyOTPResponse?.data?.status === 0)) {
      setIsLoading(false);
      return alertHandler('Error', t('LBL_OTP_001'));
    }

    if (loginStatus === 202) {
      setIsLoading(false);
      dispatch(authActions.enableChangePassword(true));
      return navigate('/change-password');
    }

    setToken(auth?.tempToken);
    setItem('isTour', true);
    window.location.reload(true);
  };

  const formik = useFormik({
    initialValues: initVals,
    validationSchema: valSchema,
    onSubmit: submit,
    validateOnMount: true,
  });

  const timeOutCallback = useCallback(() => {
    if (timer > 0) setTimer(currTimer => currTimer - 1);
  }, []);

  const resetTimer = () => {
    setTimer(otpExpirationTime);
  };

  const onGenerateOtpSucess = response => {
    if (response.data.status !== 0) {
      alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    }
  };

  const generateOtp = () => {
    axios
      .get(getGenerateOtpURL(), getTempTokenHeaders(getGenerateOtpURL(), auth?.tempToken))
      .then(onGenerateOtpSucess)
      .catch(() => alertHandler('Error', t('SOMETHING_WENT_WRONG')));
  };

  useEffect(() => {
    if (timer > 0) setTimeout(timeOutCallback, 1000);
  }, [timer, timeOutCallback]);

  return (
    <div className="login-main">
      <form className="login-form" onSubmit={formik.handleSubmit}>
        <h4>{t('LBL_SEND_OTP_1') + ` ${username} ` + t('LBL_SEND_OTP_2')}</h4>
        <div className="form-group">
          <input
            className="form-control form-control-lg"
            type="text"
            name="otp"
            required=""
            placeholder={t('LBL_OTP')}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            maxLength={4}
            minLength={4}
          />
          <ErrorMessage formik={formik} mode="add" identifier="otp" />
        </div>
        {timer > 0 && (
          <>
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
              {!isLoading && timer > 0 && (
                <>
                  <PrimaryButton theme="submitBlue" type="submit" text="LBL_SEND" />
                  <div
                    className="forgot-link"
                    onClick={() => {
                      submit();
                    }}
                  >
                    <Link style={{ pointerEvents: 'none' }}>{t('LBL_OTP_EXPIRES_IN') + ': ' + timer}</Link>
                  </div>
                </>
              )}
            </div>
          </>
        )}
        {timer === 0 && (
          <div
            className="forgot-link"
            onClick={() => {
              resetTimer();
              generateOtp();
            }}
          >
            <Link style={{ pointerEvents: 'none' }}>{t('LBL_RESEND_OTP')}</Link>
          </div>
        )}
      </form>
    </div>
  );
}

export default Otp;
