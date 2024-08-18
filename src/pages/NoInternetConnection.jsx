import React from 'react';
import { useTranslation } from 'react-i18next';
import noInternet from '../assets/images/errors/noInternet.svg';
import { Link } from 'react-router-dom';

const NoInternetConnection = () => {
  const { t } = useTranslation();

  const currentError = {
    img: noInternet,
    noDataMessage: 'LBL_ERROR_NO_INTERNET',
    startAddMessage: 'LBL_ERROR_NO_INTERNET_DESC',
    btnText: 'LBL_RELOAD',
  };

  const handleReload = () => {
    window.location.reload(true);
  };

  return (
    <>
      <div className="page-body">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <div className="row justify-content-center">
                <div className="card">
                  <div className="account-empty">
                    <img src={currentError.img} alt="no-internet" />
                    {currentError.codeImg && <img src={currentError.codeImg} alt="no-internet-code" className="error-img" />}
                    <h5>{t(currentError.noDataMessage)}</h5>
                    {currentError.startAddMessage && <p>{t(currentError.startAddMessage)}</p>}
                    {currentError.btnText && (
                      <Link onClick={handleReload} className="btn-add-empty text-decoration-none">
                        {t(currentError.btnText)}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NoInternetConnection;
