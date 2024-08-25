import { useTranslation } from 'react-i18next';

import IntegrationListingItem from './IntegrationListingItem';

const IntegrationAppTab = ({ activeTab, tabName, data }) => {
  const { t } = useTranslation();

  return (
    <>
      <div
        className={`tab-pane fade ${activeTab === tabName ? 'show active' : ''}`}
        id={tabName}
        role="tabpanel"
        aria-labelledby={`${tabName}-tab`}
      >
        {data?.map(item => {
          return <IntegrationListingItem key={item?.code} integrationItem={item} />;
        })}
        {(!data || data?.length === 0) && (
          <div>
            <h4 className="text-center">{t('NO_DATA_AVAILABLE')}</h4>
          </div>
        )}
      </div>
    </>
  );
};

export default IntegrationAppTab;
