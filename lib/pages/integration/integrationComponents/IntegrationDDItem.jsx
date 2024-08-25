import { useTranslation } from 'react-i18next';

import { useIntegrationServices } from '../../../services/apis/useIntegrationServices';

const IntegrationDDItem = ({ integrationItem }) => {
  const { t } = useTranslation();
  const { navigateToIntegrationDetails } = useIntegrationServices({ integrationItem });

  return (
    <li className="list-group-item" onClick={navigateToIntegrationDetails}>
      <div className="item-search">
        <div className="app-icon">
          <img src={integrationItem?.Icon} alt={integrationItem?.alt} />
        </div>
        <div className="app-text">
          <div className="app-title">
            <h5>{t(integrationItem?.name)}</h5>
            <p>{t(integrationItem?.overview)} </p>
          </div>
        </div>
      </div>
    </li>
  );
};

export default IntegrationDDItem;
