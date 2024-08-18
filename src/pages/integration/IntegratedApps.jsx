import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import BreadCrumb from '../../components/ui/BreadCrumb';
import IntegrationBanner from './integrationComponents/IntegrationBanner';
import IntegrationCard from './integrationComponents/IntegrationCard';
import Spinner from '../../components/Spinner/Spinner';

import { getIntegratorsURL } from '../../services/getUrl';
import { useAxiosFunction } from '../../hooks/useAxios';
import { integratorsActions } from '../../store/Integrators';
import { useIntegrationServices } from '../../services/apis/useIntegrationServices';

const IntegratedApps = ({ feature }) => {
  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState(false);

  const { navigateToIntegrationList } = useIntegrationServices();

  let integrators = useSelector(state => state.integrators.integrators);

  useEffect(() => {
    getIntegrators();
  }, []);

  const getIntegrators = async () => {
    setIsLoading(true);
    const response = await api('GET', getIntegratorsURL());
    if (response?.data?.code !== 200 || response?.data?.status !== 'Ok' || !response?.data?.data || !response?.data?.data?.returnedObj)
      return null;
    let tempArr = [...response?.data?.data?.returnedObj];
    tempArr.forEach(app => {
      if (app?.img?.length > 0) app.img = 'data:image/svg+xml;base64,' + app.img;
      if (app?.icon?.length > 0) app.icon = 'data:image/svg+xml;base64,' + app.icon;
    });
    dispatch(integratorsActions.setIntegrators(response?.data?.data?.returnedObj));
    setIsLoading(false);
  };

  return (
    <>
      {isLoading && <Spinner />}
      {actionInProgress && <div className="lodingpage"></div>}
      {!isLoading && integrators && (
        <div className="page-body">
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-12">
                <BreadCrumb feature={feature} />
              </div>
            </div>

            <div className="row">
              <div className="col-md-12 mb-4">
                <div className="info-tite-page float-start">
                  <h4>{t('INTEGRATIONS.LBL_INTEGRATION')}</h4>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                <div className="card">
                  <div className="row">
                    <div className="section-card-title">
                      <div className="title">
                        <h5>{t('INTEGRATIONS.LBL_FEATURED_APPS')}</h5>
                      </div>
                    </div>
                    {integrators?.map(item => {
                      return (
                        <div className="col-sm-12 col-md-6 col-lg-6 col-xl-6 col-xxl-4 mb-3">
                          <IntegrationBanner integrationItem={item} setActionInProgress={setActionInProgress} />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="section-apps Connected">
                  <div className="row">
                    <div className="section-card-title">
                      <div className="title">
                        <h5>{t('INTEGRATIONS.LBL_FEATURED_APPS')}</h5>
                        <a onClick={navigateToIntegrationList}>
                          {t('INTEGRATIONS.LBL_VIEW_ALL')} <i className="arrow-link"></i>
                        </a>
                      </div>
                    </div>
                    {integrators?.map(item => {
                      return (
                        <div className="col-sm-6 col-md-4 col-lg-4 col-xl-4 col-xxl-3">
                          <IntegrationCard integrationItem={item} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default IntegratedApps;
