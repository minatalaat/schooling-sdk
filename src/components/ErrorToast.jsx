import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import moment from 'moment/moment';
import { useSwipeable } from 'react-swipeable';
import i18n from 'i18next';

import { getItem } from '../utils/localStorage';

const ErrorToast = ({ title, message, view, initView, position }) => {
  const { t } = useTranslation();

  const [currentAlerts, setCurrentAlerts] = useState([]);
  const [hoveredAlert, setHoveredAlert] = useState(null);

  let translatedTitle = t('LBL_ERROR');
  let className = 'toast toast-danger show';
  let iconName = 'remove_circle';

  if (position === '' || position === undefined || position === null) {
    position = 'top-center';
  }

  if (title === 'Info') {
    translatedTitle = t('LBL_INFO');
    className = 'toast toast-info show';
    iconName = 'info_sign';
  }

  if (title === 'Success') {
    translatedTitle = t('LBL_SUCCESS');
    className = 'toast toast-success show';
    iconName = 'check_circle';
  }

  if (title === 'Warning') {
    translatedTitle = t('LBL_WARNING');
    className = 'toast toast-warning show';
    iconName = 'warning_sign';
  }

  const handleSwipeLeft = id => {
    let tempAlerts = [...currentAlerts];
    let selectedAlert = tempAlerts.find(alert => alert.id === id);
    selectedAlert.swipe = 'left';
    setCurrentAlerts(tempAlerts);
    setTimeout(() => {
      setCurrentAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== id));
    }, [500]);
  };

  const handleSwipeRight = id => {
    let tempAlerts = [...currentAlerts];
    let selectedAlert = tempAlerts.find(alert => alert.id === id);
    selectedAlert.swipe = 'right';
    setCurrentAlerts(tempAlerts);
    setTimeout(() => {
      setCurrentAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== id));
    }, [500]);
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (getItem('code') === 'ar') handleSwipeLeft(hoveredAlert.id);
    },
    onSwipedRight: () => {
      if (getItem('code') === 'en') handleSwipeRight(hoveredAlert.id);
    },
    swipeDuration: 5000,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  const toastTimeout = id => {
    return setTimeout(() => {
      setCurrentAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== id));
    }, [7000]);
  };

  const holdAlert = alert => {
    if (alert && alert.timeoutId) clearTimeout(alert.timeoutId);
  };

  const resetTimer = alert => {
    if (alert.iconName !== 'remove_circle') {
      let newTimeoutId = toastTimeout(alert.id);
      setCurrentAlerts(prevAlerts => {
        let newAlerts = [...(prevAlerts || [])];
        if (newAlerts[alert.id]) newAlerts[alert.id].timeoutId = newTimeoutId;
        return newAlerts;
      });
    }

    setHoveredAlert(null);
  };

  useEffect(() => {
    if (view) {
      let newId = currentAlerts.length === 0 ? 0 : currentAlerts[currentAlerts.length - 1].id + 1;
      let newAlert = {
        translatedTitle,
        className,
        message,
        iconName,
        id: newId,
        swipe: null,
        timestamp: moment.utc(new Date().getTime()).utcOffset('+03').locale('en').format('DD/MM/YYYY:hh:mm:ss'),
        timeoutId: iconName !== 'remove_circle' ? toastTimeout(newId) : null,
      };
      setCurrentAlerts(() => {
        return [...[], newAlert];
      });
      initView(false);
    }
  }, [view]);

  return (
    <>
      {currentAlerts.map((alert, i) => (
        <div
          className={
            alert.swipe === 'right' && getItem('code') === 'en'
              ? 'row swipe-element-right'
              : alert.swipe === 'left' && getItem('code') === 'ar'
                ? 'row swipe-element-left'
                : 'row'
          }
          key={alert.id}
          onMouseEnter={() => {
            setHoveredAlert(alert);
            holdAlert(alert);
          }}
          onTouchStart={() => {
            setHoveredAlert(alert);
            holdAlert(alert);
          }}
          onMouseLeave={() => resetTimer(alert)}
          onTouchEnd={() => resetTimer(alert)}
          {...handlers}
        >
          <div className={`col-md-12 mb-${i === currentAlerts.length - 1 ? '4' : '2'}`}>
            <div className="wrapper d-flex">
              <div className={alert.className}>
                <div className="toast__left">
                  <i className="material-icons">{alert.iconName}</i>
                </div>
                <div className="toast__right">
                  <div className="float-end h-100 mt-3">
                    {i18n.dir() === 'ltr' && (
                      <>
                        <p
                          className="d-flex flex-row align-items-center justify-content-between text-decoration-underline"
                          onClick={() => {
                            handleSwipeRight(alert.id);
                          }}
                        >
                          {t('LBL_SWIPE_TO_CLOSE')}
                          <FaArrowRight
                            color="#ccc"
                            size={18}
                            className="align-items-stretch mx-2"
                            onClick={() => {
                              handleSwipeRight(alert.id);
                            }}
                          />
                        </p>
                        <p>{moment.utc(new Date().getTime()).utcOffset('+03').locale('en').format('DD/MM/YYYY:hh:mm:ss')}</p>
                      </>
                    )}
                    {i18n.dir() === 'rtl' && (
                      <>
                        <p
                          className="d-flex flex-row align-items-center justify-content-between text-decoration-underline"
                          onClick={() => {
                            handleSwipeLeft(alert.id);
                          }}
                        >
                          {t('LBL_SWIPE_TO_CLOSE')}
                          <FaArrowLeft
                            color="#ccc"
                            size={18}
                            className="align-items-stretch mx-2"
                            onClick={() => {
                              handleSwipeLeft(alert.id);
                            }}
                          />
                        </p>
                        <p>{alert.timestamp}</p>
                      </>
                    )}
                  </div>
                  <h4 className="toast__title">{alert.translatedTitle}</h4>
                  <p className="toast__desc">{alert.message}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default ErrorToast;
