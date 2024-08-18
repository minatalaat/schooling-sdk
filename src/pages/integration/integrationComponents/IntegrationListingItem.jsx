import { useTranslation } from 'react-i18next';

import { getItem } from '../../../utils/localStorage';
import { useIntegrationServices } from '../../../services/apis/useIntegrationServices';
import { INTEGRATION_STATUS } from '../../../constants/enums/IntegrationEnum';

const IntegrationListingItem = ({ integrationItem }) => {
  const { t } = useTranslation();
  const { navigateToIntegrationDetails } = useIntegrationServices({ integrationItem });

  const integrationStatus = {
    [INTEGRATION_STATUS.CONNECTED]: 'Connected',
    [INTEGRATION_STATUS.NOT_ACTIVE]: 'Connect',
    [INTEGRATION_STATUS.PENDING]: 'Connect',
    [INTEGRATION_STATUS.DISCONNECTED]: 'Disconnected',
    [INTEGRATION_STATUS.FAILED]: 'Disconnected',
    // Disconnected: 'Disconnected',
  };

  const statusLabels = {
    [INTEGRATION_STATUS.CONNECTED]: 'INTEGRATIONS.LBL_CONNECTED',
    [INTEGRATION_STATUS.NOT_ACTIVE]: 'INTEGRATIONS.LBL_CONNECT',
    [INTEGRATION_STATUS.PENDING]: 'INTEGRATIONS.LBL_PENDING',
    [INTEGRATION_STATUS.DISCONNECTED]: 'INTEGRATIONS.LBL_DISCONNECTED',
    [INTEGRATION_STATUS.FAILED]: 'INTEGRATIONS.LBL_FAILED',
  };
  return (
    <div className="app-list" onClick={navigateToIntegrationDetails}>
      <div className="list-content">
        <div className="app-icon">
          <img src={integrationItem?.icon} alt={integrationItem?.code} />
        </div>
        <div className="app-text">
          <div className="app-title">
            <h5>{getItem('code') === 'ar' ? integrationItem?.nameAr : integrationItem?.nameEn}</h5>
            <p>{getItem('code') === 'ar' ? integrationItem?.descAr : integrationItem?.descEn}</p>
          </div>
          <div className="action-list">
            <a
              // onClick={integrationItem.status === INTEGRATION_STATUS.NOT_ACTIVE ? navigateToIntegrationDetails : null}
              className={integrationStatus[integrationItem.status]}
            >
              {t(statusLabels[integrationItem.status])}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationListingItem;
