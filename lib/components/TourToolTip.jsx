import React from 'react';
import { useTranslation } from 'react-i18next';
import NextToolTipIcon from '../assets/images/next-tooltip-icon.svg';

const TourToolTip = ({ message }) => {
  const { t } = useTranslation();
  return (
    <div role="tooltip" className="guided-tour-step-tooltip">
      <div aria-hidden="true" className="guided-tour-arrow"></div>
      <div className="guided-tour-step-content text-center">
        <p>
          {t(message)}
          {/* <a href="#">Learn More</a> */}
        </p>
      </div>
      <div className="guided-tour-step-footer">
        <button className="btn btn-next-tooltip">
          {t('LBL_NEXT')} <img src={NextToolTipIcon} />
        </button>
        <button className="btn btn-skip-tooltip">{t('LBL_SKIP')}</button>
      </div>
    </div>
  );
};

export default TourToolTip;
