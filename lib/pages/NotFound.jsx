import React from 'react';
import { useTranslation } from 'react-i18next';
import { getItem } from '../utils/localStorage';
import img404 from '../assets/images/errors/img404.svg';
import img404Ar from '../assets/images/errors/img404ar.svg';
import code404 from '../assets/images/errors/code404.svg';
import code404Ar from '../assets/images/errors/code404ar.svg';

const NotFound = ({}) => {
  const { t } = useTranslation();

  const currentError = {
    img: getItem('code') === 'ar' ? img404Ar : img404,
    codeImg: getItem('code') === 'ar' ? code404Ar : code404,
    noDataMessage: 'LBL_ERROR_404',
    startAddMessage: 'LBL_ERROR_404_DESC',
    btnText: 'LBL_BACK',
  };

  return (
    <div className="page-body">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <div className="row justify-content-center">
              <div className="card">
                <div className="account-empty">
                  <img src={currentError.img} alt="error" />
                  <img src={currentError.codeImg} alt="error-code" className="error-img" />
                  <h5>{t(currentError.noDataMessage)}</h5>
                  {currentError.startAddMessage && <p>{t(currentError.startAddMessage)}</p>}
                  {/* {currentError.btnText && (
                    <Link onClick={handleBackClick} className="btn-add-empty text-decoration-none">
                      {t(currentError.btnText)}
                    </Link>
                  )} */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
