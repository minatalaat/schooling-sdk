import { useTranslation } from 'react-i18next';

const NoDataAvailable = () => {
  const { t } = useTranslation();
  return (
    <div>
      <h4 className="text-center">{t('NO_DATA_AVAILABLE')}</h4>
    </div>
  );
};

export default NoDataAvailable;
