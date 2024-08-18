import { useTranslation } from 'react-i18next';
import NoConnection from '../assets/images/errors/noInternet.svg';
import NoData from './NoData';

const OBNoConnection = () => {
  const { t } = useTranslation();
  return (
    <NoData
      imgSrc={NoConnection}
      noDataMessage={t('LBL_ERROR_CONNECTING')}
      startAddMessage={t('LBL_CONTACT_YOUR_ADMINSTRATOR')}
      showAdd={false}
      showAdditionalMessage={true}
    />
  );
};

export default OBNoConnection;
