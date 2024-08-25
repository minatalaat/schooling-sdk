import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import PrimaryButton from '../../../components/ui/buttons/PrimaryButton';

import { getItem } from '../../../utils/localStorage';
import { useIntegrationServices } from '../../../services/apis/useIntegrationServices';
import { INTEGRATION_STATUS } from '../../../constants/enums/IntegrationEnum';

import BG from '../../../assets/images/int-bg.svg';

function NotConnectedIntegratorForm({
  isConnect,
  setIsConnect,
  isButtonDisabled,
  finishedConnectHandler,
  setActionInProgress,
  alertHandler,
  integrationItem,
}) {
  let isAr = getItem('code') === 'ar';
  const { t } = useTranslation();
  const { navigateToIntegrationAuthorize, getIntegratorStatus } = useIntegrationServices({
    integrationItem,
    setActionInProgress,
    alertHandler,
  });

  const [windowSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);

  const intervalRef = useRef(null);

  const connectHandler = async () => {
    const res = await navigateToIntegrationAuthorize();
    if (!res) return null;
    setIsConnect(true);
  };

  useEffect(() => {
    const handleWindowResize = () => {
      setWindowSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  });

  useEffect(() => {
    if (isConnect) {
      setActionInProgress(true);
      let status = integrationItem.status;

      if (status === INTEGRATION_STATUS.PENDING || (status !== INTEGRATION_STATUS.CONNECTED && status !== INTEGRATION_STATUS.FAILED)) {
        intervalRef.current = setInterval(async function () {
          status = await getIntegratorStatus();
          if (status === INTEGRATION_STATUS.CONNECTED) finishedConnectHandler('Success', 'INTEGRATIONS.LBL_APP_CONNECTED_SUCCESSFULLY');
          if (status === INTEGRATION_STATUS.FAILED) finishedConnectHandler('Error', 'INTEGRATIONS.LBL_ERROR_CONNECTING_APP');
        }, 6000);
      }
    }

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [isConnect, integrationItem.status]);

  let msgExists = (isAr && integrationItem?.noteAr?.length > 0) || (!isAr && integrationItem?.noteEn?.length > 0);
  return (
    <>
      <div className="col-md-9">
        <div className="card sin-app">
          <div className="row d-flex align-content-center ">
            <div className="col-lg-5 col-md-5 col-sm-12">
              <div className="left-sin">
                <div className="app-logo">
                  <img src={integrationItem?.img} alt={integrationItem?.code} />
                </div>
                <h2>
                  {t('INTEGRATIONS.LBL_CONNECTION_WITH')} <br />
                  {isAr ? integrationItem?.nameAr : integrationItem?.nameEn}
                </h2>
                <h4>{isAr ? integrationItem?.descAr : integrationItem?.descEn}</h4>
                <h3 className="title">{t('INTEGRATIONS.LBL_KEY_FEATURES')}</h3>

                {isAr
                  ? integrationItem?.featuresAr?.map(feature => <p key={feature}>{feature}</p>)
                  : integrationItem?.featuresEn?.map(feature => <p key={feature}>{feature}</p>)}
              </div>
            </div>

            {windowSize[0] >= 768 && (
              <div className="col-lg-7 col-md-7">
                <div className="right-sin text-center ">
                  <img className="img-fluid " src={BG} alt="Background" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card right-more">
          <div className="row">
            <div className="col-md-12">
              <>
                <div className="list-info">
                  <div className="list">
                    <h5 className="warning-text">{isAr ? integrationItem?.noteAr : integrationItem?.noteEn}</h5>
                  </div>
                </div>
                {msgExists && <div className="border-solid"></div>}
                <div className="actionbtn-right-page">
                  <PrimaryButton
                    theme="blueInCard"
                    disabled={isButtonDisabled}
                    text="INTEGRATIONS.LBL_CONNECT"
                    onClick={() => {
                      setActionInProgress(true);
                      connectHandler();
                    }}
                  />
                </div>
              </>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default NotConnectedIntegratorForm;
