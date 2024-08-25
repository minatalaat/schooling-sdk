import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import BreadCrumb from '../../components/ui/BreadCrumb';
import BackButton from '../../components/ui/buttons/BackButton';
import IntegrationAppTab from './integrationComponents/IntegrationAppTab';
import IntegrationAppTabNav from './integrationComponents/IntegrationAppTabNav';
import Spinner from '../../components/Spinner/Spinner';
import { INTEGRATION_STATUS } from '../../constants/enums/IntegrationEnum';

import { useAxiosFunction } from '../../hooks/useAxios';
import { getIntegratorsURL } from '../../services/getUrl';
import { integratorsActions } from '../../store/Integrators';
import { alertsActions } from '../../store/alerts';

const IntegratedAppsListing = ({ feature }) => {
  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [integrationApps, setIntegrationApps] = useState([]);
  const [connectedApps, setConnectedApps] = useState([]);
  const [disconnectedApps, setDisconnectedApps] = useState([]);

  let integrators = useSelector(state => state.integrators.integrators);

  useEffect(() => {
    getIntegrators();
  }, []);

  useEffect(() => {
    searchIntegration();
  }, [integrators]);

  const alertHandler = (title, message) => {
    setIsLoading(false);

    if (message) {
      dispatch(alertsActions.initiateAlert({ title, message }));
    }
  };

  const getIntegrators = async () => {
    setIsLoading(true);
    const response = await api('GET', getIntegratorsURL());

    if (response?.data?.code !== 200 || response?.data?.status !== 'Ok' || !response?.data?.data || !response?.data?.data?.returnedObj) {
      dispatch(integratorsActions.setIntegrators([]));
      return alertHandler('Error', 'INTEGRATIONS.LBL_ERROR_FETCHING_INTEGRATORS');
    }

    let tempArr = [];
    if (response?.data?.data?.returnedObj) tempArr = [...response.data.data.returnedObj];
    tempArr.forEach(app => {
      if (app.featuresEn) app.featuresEn = JSON.parse(app.featuresEn) ?? [];
      if (app.featureAr) app.featuresAr = JSON.parse(app.featureAr) ?? [];
    });
    dispatch(integratorsActions.setIntegrators(response?.data?.data?.returnedObj));
    setIsLoading(false);
  };

  const searchIntegration = searchValue => {
    let apps = [...integrators];

    if (searchValue?.length > 0) {
      apps = integrators.filter(
        o =>
          o.nameEn?.toLocaleLowerCase().includes(searchValue?.toLocaleLowerCase()) ||
          o.nameAr?.toLocaleLowerCase().includes(searchValue?.toLocaleLowerCase())
      );
    }

    let tempApps = [];
    let tempConnectedApps = [];
    let tempDisconnectedApps = [];
    apps.forEach(app => {
      if (app.status === INTEGRATION_STATUS.DISCONNECTED) tempDisconnectedApps.push(app);
      if (app.status === INTEGRATION_STATUS.CONNECTED) tempConnectedApps.push(app);
      tempApps.push(app);
    });
    setIntegrationApps(tempApps);
    setConnectedApps(tempConnectedApps);
    setDisconnectedApps(tempDisconnectedApps);
  };

  return (
    <>
      {isLoading && <Spinner />}
      {!isLoading && (
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

                <div className="reverse-page float-end">
                  <BackButton />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                <div className="all-apps-tabs">
                  <div className="row">
                    <div className="col-lg-10">
                      <ul className="nav nav-tabs" id="myTab" role="tablist">
                        <IntegrationAppTabNav
                          activeTab={activeTab}
                          tabName="All"
                          setActiveTab={setActiveTab}
                          title="INTEGRATIONS.LBL_ALL_APPS"
                        />
                        <IntegrationAppTabNav
                          activeTab={activeTab}
                          tabName="Connected"
                          setActiveTab={setActiveTab}
                          title="INTEGRATIONS.LBL_CONNECTED"
                        />
                        <IntegrationAppTabNav
                          activeTab={activeTab}
                          tabName="Disconnected"
                          setActiveTab={setActiveTab}
                          title="INTEGRATIONS.LBL_DISCONNECTED"
                        />
                      </ul>
                    </div>
                    <div className="col-lg-2">
                      <div className="input-group">
                        <input
                          className="form-control"
                          type="search"
                          placeholder={t('LBL_SEARCH')}
                          id="example-search-input"
                          onChange={e => searchIntegration(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                <div className="card">
                  <div className="tab-content d-block " id="myTabContent">
                    <IntegrationAppTab activeTab={activeTab} tabName="All" data={integrationApps} />
                    <IntegrationAppTab activeTab={activeTab} tabName="Connected" data={connectedApps} />
                    <IntegrationAppTab activeTab={activeTab} tabName="Disconnected" data={disconnectedApps} />
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

export default IntegratedAppsListing;
