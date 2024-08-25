import { useTranslation } from 'react-i18next';

import { getItem } from '../../../utils/localStorage';
import { useIntegrationServices } from '../../../services/apis/useIntegrationServices';

function IntegrationBanner({ integrationItem, setActionInProgress }) {
  const { t } = useTranslation();
  const { navigateToIntegrationDetails } = useIntegrationServices({ integrationItem, setActionInProgress });

  return (
    <>
      <div className={`section-card-body ${integrationItem?.code.toUpperCase()}`}>
        <img src={integrationItem?.img} alt={integrationItem?.code} />
        <p>{getItem('code') === 'ar' ? integrationItem?.descAr : integrationItem?.descEn}</p>
        <a onClick={navigateToIntegrationDetails}>
          {t('INTEGRATIONS.LBL_CONNECT')} <i className="add-icon"></i>
        </a>
      </div>
    </>
  );
}

export default IntegrationBanner;
