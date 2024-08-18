import React from 'react';
import { useTranslation } from 'react-i18next';

const TotalsCardItem = ({ contentColor = '', content, title }) => {
  const { t } = useTranslation();
  return (
    <div className="total-nfo">
      <p>{t(title)}</p>
      <h4 className={contentColor}>{content}</h4>
    </div>
  );
};

export default TotalsCardItem;
