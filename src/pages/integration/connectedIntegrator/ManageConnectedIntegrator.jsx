import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import Spinner from '../../../components/Spinner/Spinner';
import BreadCrumb from '../../../components/ui/BreadCrumb';
import BackButton from '../../../components/ui/buttons/BackButton';
import ConnectedIntegratorForm from './ConnectedIntegratorForm';
import Calendar from '../../../components/ui/Calendar';
import PrimaryButton from '../../../components/ui/buttons/PrimaryButton';

import { useAxiosFunction } from '../../../hooks/useAxios';
import { getIntegratorsConfigURL } from '../../../services/getUrl';
import { alertsActions } from '../../../store/alerts';

export default function ManageConnectedIntegrator({ feature, integrationItem }) {
  const { api } = useAxiosFunction();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isSave, setIsSave] = useState(false);
  const [isDisconnect, setIsDisconnect] = useState(false);
  const [isSync, setIsSync] = useState(false);
  const [isSyncAll, setIsSyncAll] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [integratorConfigData, setIntegratorConfigData] = useState(undefined);

  const alertHandler = (title, message) => {
    setIsLoading(false);
    setActionInProgress(false);

    if (message) {
      dispatch(alertsActions.initiateAlert({ title, message }));
      setActionInProgress(false);
    } else {
      if (isSave) setIsSave(false);
      if (isSync) setIsSync(false);
      if (isDisconnect) setIsDisconnect(false);
      if (isSyncAll) setIsSyncAll(false);
    }
  };

  const finishedSyncHandler = (type, message) => {
    if (type === 'Success') {
      alertHandler('Success', message);
      setTimeout(() => {
        setIsSync(false);
        fetchIntegratorConfig();
      }, [3000]);
    } else {
      alertHandler('error', t('SOMETHING_WENT_WRONG'));
    }
  };

  const finishedDisconnectHandler = (type, message) => {
    if (type === 'Success') {
      alertHandler('Success', message);
      setTimeout(() => {
        navigate('/integration');
        setIsDisconnect(false);
      }, [3000]);
    } else {
      alertHandler('error', t('SOMETHING_WENT_WRONG'));
    }
  };

  const finishedSyncAllHandler = (type, message) => {
    if (type === 'Success') {
      alertHandler('Success', message);
      setTimeout(() => {
        setIsSyncAll(false);
        fetchIntegratorConfig();
      }, [3000]);
    } else {
      alertHandler('error', t('SOMETHING_WENT_WRONG'));
    }
  };

  const fetchIntegratorConfig = async () => {
    const integratorConfigResponse = await api('GET', getIntegratorsConfigURL(integrationItem?.code));
    if (integratorConfigResponse.data.status !== 'Ok' || !integratorConfigResponse.data.data?.returnedObj)
      return alertHandler('Error', t('INTEGRATIONS.LBL_ERROR_FETCHING_INTEGRATOR_DETAILS'));
    setIntegratorConfigData(integratorConfigResponse.data.data?.returnedObj?.[0] ?? null);
    setIsLoading(false);
    return integratorConfigResponse.data.data[0];
  };

  const getIntegratorDefaultConfig = async () => {
    
    // setIntegratorDefaultConfig();
    // const integratorConfigResponse = await api('GET', getIntegratorsConfigURL(integrationItem?.code));
    //  if (integratorConfigResponse.data.data?.length === 0) return navigateToConfig();
    // if (integratorConfigResponse.data.status !== 'Ok' || !integratorConfigResponse.data.data?.returnedObj)
    //   return alertHandler('Error', t('INTEGRATIONS.LBL_ERROR_FETCHING_INTEGRATOR_DETAILS'));
    // setIntegratorConfigData(integratorConfigResponse.data.data?.returnedObj?.[0] ?? null);
    // setIsLoading(false);
    // return integratorConfigResponse.data.data[0];
    fetchIntegratorConfig();
  };

  useEffect(() => {
    getIntegratorDefaultConfig();
  }, []);

  const navigateToConfig = () => {
    navigate('/integration/configuration', { state: { integratorCode: integrationItem.code } });
  };

  let isButtonDisabled = isSave || isDisconnect || isSyncAll;
  return (
    <>
      {actionInProgress && <div className="lodingpage"></div>}
      {isLoading && <Spinner />}
      {!isLoading && (
        <div className="page-body">
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-12">
                <Calendar />
                <BreadCrumb feature={feature} modeText={t('INTEGRATIONS.LBL_INTEGRATOR_DETAILS')} />
              </div>
            </div>
            <div className="row">
              <div className="col-md-12 mb-4">
                <div className="info-tite-page float-start">
                  <h4>{t('INTEGRATIONS.LBL_INTEGRATOR_DETAILS')}</h4>
                </div>
                <div className="reverse-page float-end">
                  <BackButton disabled={isButtonDisabled} />
                  <PrimaryButton
                    theme="red"
                    text="INTEGRATIONS.LBL_DISCONNECT"
                    disabled={isButtonDisabled}
                    onClick={() => setIsDisconnect(true)}
                  />
                  <PrimaryButton text="INTEGRATIONS.LBL_INTEGRATOR_CONFIG" disabled={isButtonDisabled} onClick={() => navigateToConfig()} />
                  <PrimaryButton text="INTEGRATIONS.LBL_SYNC_ALL" disabled={isButtonDisabled} onClick={() => setIsSyncAll(true)} />
                </div>
              </div>
            </div>
            <div className="row">
              {!isLoading && integratorConfigData !== undefined && (
                <>
                  <ConnectedIntegratorForm
                    integrationItem={integrationItem}
                    data={integratorConfigData}
                    isDisconnect={isDisconnect}
                    isSync={isSync}
                    isSyncAll={isSyncAll}
                    setIsSync={setIsSync}
                    finishedDisconnectHandler={finishedDisconnectHandler}
                    finishedSyncHandler={finishedSyncHandler}
                    finishedSyncAllHandler={finishedSyncAllHandler}
                    setActionInProgress={setActionInProgress}
                    alertHandler={alertHandler}
                    fetchIntegratorConfig={fetchIntegratorConfig}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
