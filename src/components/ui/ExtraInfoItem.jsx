import { useTranslation } from 'react-i18next';

const ExtraInfoItem = ({ label, value, valueClassName }) => {
  const { t } = useTranslation();
  return (
    <div className="extra-info-4">
      <p>{t(label)}</p>
      <h4 className={valueClassName}>{value}</h4>
    </div>
  );
};

export default ExtraInfoItem;
