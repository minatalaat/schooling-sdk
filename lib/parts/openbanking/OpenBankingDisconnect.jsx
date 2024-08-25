import { useTranslation } from 'react-i18next';

import CheckIcon from '../../assets/images/check-icon.svg';
import FailProfileImg from '../../assets/images/failProfile.svg';
import { useNavigate } from 'react-router-dom';
import { useFeatures } from '../../hooks/useFeatures';
import i18next from 'i18next';

function OpenBankingDisconnect({ disconnectResult, provider, tryAgainHandler }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getFeaturePath } = useFeatures();
  return (
    <>
      <div className="card disconnect-complete">
        {disconnectResult && (
          <div className="col-md-12">
            <h4>{t('LBL_DISCONNECT_COMPLETE')} </h4>
            <img src={CheckIcon} alt={CheckIcon} />
            <p>{`${t('LBL_DISCONNECT_CONFIRMATION')} [${i18next.language === 'en' ? provider?.NameEn || '' : provider?.NameAr}]`}</p>
            <p>{t('LBL_DATA_DISCONNECTED_RETAINTION')}</p>
          </div>
        )}
        {!disconnectResult && (
          <div className="col-md-12">
            <h4>{t('LBL_DISCONNECT_FAIL')} </h4>
            <img src={FailProfileImg} alt={FailProfileImg} />
            <p>{t('LBL_CONTACT_YOUR_ADMINSTRATOR')}</p>
          </div>
        )}
      </div>
      {disconnectResult && (
        <div className="btobca">
          <button
            className="btn con-btn"
            onClick={() => {
              navigate(getFeaturePath('BANKING_ACCOUNTS'));
            }}
          >
            {t('LBL_BACK_TO_CONNECTED_ACCOUNTS')}
          </button>
        </div>
      )}
      {!disconnectResult && (
        <>
          <div className="btobca">
            <button className="btn btn-cancel" onClick={tryAgainHandler}>
              {t('LBL_TRY_AGAIN')}
            </button>
          </div>
          <div className="btobca mt-3">
            <button
              className="btn con-btn"
              onClick={() => {
                navigate(getFeaturePath('BANKING_ACCOUNTS'));
              }}
            >
              {t('LBL_BACK_TO_CONNECTED_ACCOUNTS')}
            </button>
          </div>
        </>
      )}
    </>
  );
}

export default OpenBankingDisconnect;
