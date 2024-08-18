import { useEffect } from 'react';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import { useAxiosFunction } from '../../../hooks/useAxios';
import { getIntegratorDisconnectUrl, getSyncURL, getSyncAllURL } from '../../../services/getUrl';
import { getItem } from '../../../utils/localStorage';

function ConnectedIntegratorForm({
  data,
  isDisconnect,
  isSyncAll,
  setIsSync,
  finishedSyncHandler,
  finishedDisconnectHandler,
  finishedSyncAllHandler,
  setActionInProgress,
  integrationItem,
}) {
  const { api } = useAxiosFunction();
  const { t } = useTranslation();
    let isAr = getItem('code') === 'ar';

  useEffect(() => {
    if (isDisconnect) {
      disconnectIntegrator();
    }

    if (isSyncAll) {
      syncAll();
    }
  }, [isDisconnect, isSyncAll]);

  const onSyncClick = async url => {
    const syncResponse = await api('GET', getSyncURL() + url);
    if (!syncResponse || !syncResponse.data.data || !syncResponse.data.data.returnedObj)
      return finishedSyncHandler('Error', 'INTEGRATIONS.LBL_ERROR_SYNCING');

    finishedSyncHandler('Success', 'INTEGRATIONS.LBL_SYNCED_SUCCESSFULLY');
    setActionInProgress(false);
  };

  const disconnectIntegrator = async () => {
    setActionInProgress(true);
    const response = await api('POST', getIntegratorDisconnectUrl(integrationItem?.code));
    if (response?.data?.code !== 200 || response?.data?.status !== 'Ok')
      return finishedDisconnectHandler('Error', 'INTEGRATIONS.LBL_ERROR_DISCONNECTING');
    finishedDisconnectHandler('Success', 'INTEGRATIONS.LBL_DISCONNECTED_SUCCESSFULLY');
    setActionInProgress(false);
  };

  const syncAll = async () => {
    setActionInProgress(true);
    const syncResponse = await api('POST', getSyncAllURL(integrationItem?.code));
    if (syncResponse?.data?.code !== 200 || syncResponse?.data?.status !== 'Ok')
      return finishedSyncHandler('Error', 'INTEGRATIONS.LBL_ERROR_SYNCING');
    finishedSyncAllHandler('Success', 'INTEGRATIONS.LBL_SYNCED_SUCCESSFULLY');
    setActionInProgress(false);
  };

  return (
    <>
      <div className="col-md-12">
        <div className="card details-card">
          <div className="row">
            <div className="col-md-12">
              <div className="app-logo">
                <img src={integrationItem?.img} alt={integrationItem?.code} />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <h4>{t('INTEGRATIONS.AUTOMATIC_SYNCING')}</h4>
            </div>
          </div>
          <div className="tab-content d-block " id="myTabContent">
            <div className="tab-pane fade show active" id="All" role="tabpanel" aria-labelledby="All-tab">
              {data.modules.map(module => (
                <div key={module.code} className="app-list default-cursor">
                  <div className="list-content">
                    <div className="app-text">
                      <div className="app-title">
                        <h5>{isAr ? module?.nameAr : module?.nameEn}</h5>
                        <p>
                          {t('INTEGRATIONS.LBL_LAST_SYNC')}
                          {': '}
                          {module.lastSync ? moment(module.lastSync).format('DD-MM-YYYY HH:mm:ss') : ''}
                        </p>
                      </div>
                      <div className="action-list">
                        <a
                          className="sync-link"
                          onClick={() => {
                            setActionInProgress(true);
                            setIsSync(true);
                            onSyncClick(module.syncURL);
                          }}
                        >
                          {t('INTEGRATIONS.LBL_SYNC_NOW')}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ConnectedIntegratorForm;
