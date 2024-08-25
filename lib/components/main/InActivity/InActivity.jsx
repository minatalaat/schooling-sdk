import { useState } from 'react';
import { useIdleTimer } from 'react-idle-timer';
import { useTranslation } from 'react-i18next';

import WarningImg from '../../../assets/images/warning2.svg';

import { useAxiosFunction } from '../../../hooks/useAxios';
import { getHealthCheckUrl } from '../../../services/getUrl';
import { useAuthServices } from '../../../services/apis/useAuthServices';

let logout = false;

function InActivity() {
  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  const { logoutService } = useAuthServices();

  const [showInActivityModal, setShowInActivityModal] = useState(false);

  const inActivityTimeout = parseInt(import.meta.env.VITE_INACTIVITY_TIMEOUT)
    ? parseInt(import.meta.env.VITE_INACTIVITY_TIMEOUT) * 60000
    : 10000;

  const onIdle = () => {
    setShowInActivityModal(true);
    logout = true;
    setTimeout(() => {
      if (logout) {
        logoutService();
      }
    }, [7000]);
  };

  const onActive = () => {
    logout = false;
    setShowInActivityModal(false);
  };

  const healthCheckHandler = () => api('GET', getHealthCheckUrl(), {}, () => {}, logoutService);

  useIdleTimer({
    onIdle: onIdle,
    onActive: onActive,
    timeout: inActivityTimeout,
    throttle: inActivityTimeout * 0.8,
    events: ['mousemove', 'touchmove', 'click', 'DOMMouseScroll'],
    onAction: healthCheckHandler,
    crossTab: true,
    syncTimers: inActivityTimeout * 0.5,
  });

  return (
    <>
      {showInActivityModal && (
        <div
          className="modal fade show"
          id="delete-row"
          aria-labelledby="exampleModalToggleLabel2"
          tabIndex="-1"
          aria-modal="true"
          role="dialog"
          style={{ display: 'block' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header justify-content-center">
                <h3 className="text-align-center">{t('LBL_INACTIVITY_WARNING')}</h3>
              </div>
              <div className="modal-body">
                <img src={WarningImg} alt={WarningImg} />
                <p>{t('LBL_INACTIVITY_WARNING_MESSAGE')}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {showInActivityModal && <div style={{ display: 'block' }}></div>}
    </>
  );
}

export default InActivity;
