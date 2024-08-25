import { useTranslation } from 'react-i18next';

import img500 from '../assets/images/errors/img500.svg';
import img401 from '../assets/images/errors/img401.svg';
import SomethingWentWrong from '../assets/images/errors/SomethingWentWrong.svg';
import SomethingWentWrongAr from '../assets/images/errors/SomethingWentWrongAr.svg';
import code401 from '../assets/images/errors/code401.svg';
import code401Ar from '../assets/images/errors/code401ar.svg';

import { getItem } from '../utils/localStorage';
import { useAuthServices } from '../services/apis/useAuthServices';

const ErrorPage = () => {
  let status = 100;

  const { t } = useTranslation();
  const { logoutService } = useAuthServices();

  const handleReload = () => {
    window.location.reload(true);
  };

  const errors = {
    401: {
      img: img401,
      codeImg: getItem('code') === 'ar' ? code401Ar : code401,
      noDataMessage: 'LBL_ERROR_401',
      startAddMessage: 'LBL_ERROR_401_DESC',
      btnText: 'LBL_GO_TO_LOGIN',
      btnClick: logoutService,
    },
    500: {
      img: img500,
      noDataMessage: 'LBL_ERROR_500',
      startAddMessage: 'LBL_ERROR_500_DESC',
      btnText: 'LBL_RELOAD',
      btnClick: handleReload,
    },
    100: {
      img: getItem('code') === 'ar' ? SomethingWentWrongAr : SomethingWentWrong,
      noDataMessage: 'LBL_ERROR_GENERIC',
      startAddMessage: 'LBL_ERROR_GENERIC_DESC',
      btnText: 'LBL_RELOAD',
      btnClick: handleReload,
    },
  };

  const currentError = status ? errors[status] : errors[100];

  return (
    <div className="page-body">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <div className="row justify-content-center">
              <div className="card">
                <div className="account-empty">
                  <img src={currentError.img} alt="error" />
                  {currentError.codeImg && <img src={currentError.codeImg} alt="error-code" className="error-img" />}
                  <h5>{t(currentError.noDataMessage)}</h5>
                  {currentError.startAddMessage && <p>{t(currentError.startAddMessage)}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
