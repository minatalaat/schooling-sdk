import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';

import { CloseIcon } from './CloseIcon';

import { alertsActions } from '../../../store/alerts';
import { useEffect } from 'react';

export default function ToastCard({ alert }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const location = useLocation();

  const [timeoutId, setTimeoutId] = useState(undefined);
  const [fade, setFade] = useState(false);
  const [initialLocation, setInitialLocation] = useState(null);

  const closeHandler = () => {
    setFade(true);
    setTimeout(() => {
      dispatch(alertsActions.closeAlert(alert.id));
    }, [500]);
  };

  const addTimeout = () => {
    setTimeoutId(
      setTimeout(() => {
        closeHandler();
      }, [alert.timeout || 7000])
    );
  };

  const removeTimeout = () => {
    clearTimeout(timeoutId);
    setTimeoutId(undefined);
  };

  useEffect(() => {
    if (alert.autoClose) addTimeout();
  }, []);

  useEffect(() => {
    setInitialLocation(location.pathname);
    if (initialLocation && alert.dissappearOnLocationChange) closeHandler();
  }, [location.pathname]);

  return (
    <div
      className={`toast-accent ${alert.action} ${fade ? 'toast-fade' : ''}`}
      onMouseEnter={alert.autoClose ? removeTimeout : null}
      onMouseLeave={alert.autoClose ? addTimeout : null}
      onTouchStart={alert.autoClose ? removeTimeout : null}
      onTouchEnd={alert.autoClose ? addTimeout : null}
    >
      <div className="toast-accent-header">
        <h5>{alert.translate ? t(alert.title) : alert.title}</h5>
        <div className="d-flex flex-row jusify-content-end">
          <p className="toast-accent-timestamp">{alert.timestamp}</p>
          <CloseIcon
            className="toast-accent-icon"
            color={
              alert.action === 'warning'
                ? '#F97316'
                : alert.action === 'success'
                  ? '#348352'
                  : alert.action === 'info'
                    ? '#0EA5E9'
                    : alert.action === 'attention'
                      ? '#525252'
                      : '#E63535'
            }
            clickHandler={closeHandler}
          />
        </div>
      </div>
      <p>{t(alert.message)}</p>
    </div>
  );
}
