import { useTranslation } from 'react-i18next';

const InfoCard = ({ text }) => {
  const { t } = useTranslation();
  return (
    <div className="alert alert-info-ob-form">
      <div className="alert-text">
        <h4>{t(text)}</h4>
      </div>
    </div>
  );
};

export default InfoCard;
