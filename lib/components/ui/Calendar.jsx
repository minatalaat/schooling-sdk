import React from 'react';
import { useTranslation } from 'react-i18next';

import { getTodayDate } from '../../utils/helpers';

const Calendar = () => {
  const { t } = useTranslation();
  return (
    <div className="info-date-page float-end">
      <i className="calender-i"></i>
      <p>{t('DATE', getTodayDate())}</p>
    </div>
  );
};

export default Calendar;
