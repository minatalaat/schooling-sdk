import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import Spinner from '../../../components/Spinner/Spinner';
import BreadCrumb from '../../../components/ui/BreadCrumb';
import BackButton from '../../../components/ui/buttons/BackButton';
import NotConnectedIntegratorForm from './NotConnectedIntegratorForm';
import Calendar from '../../../components/ui/Calendar';

import { alertsActions } from '../../../store/alerts';

export default function ManageNotConnectedIntegrator({ feature, integrationItem }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isConnect, setIsConnect] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const alertHandler = (title, message) => {
    setIsLoading(false);
    setActionInProgress(false);

    if (message) {
      dispatch(alertsActions.initiateAlert({ title, message }));
      setActionInProgress(false);
    } else {
      if (isConnect) setIsConnect(false);
    }
  };

  const finishedConnectHandler = (type, message) => {
    if (type === 'Success') {
      alertHandler('Success', message);
      setTimeout(() => {
        navigate('/integration');
        setIsConnect(false);
      }, [3000]);
    } else {
      alertHandler('error', t('SOMETHING_WENT_WRONG'));
    }
  };

  let isButtonDisabled = isConnect;
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
                </div>
              </div>
            </div>
            <div className="row">
              {!isLoading && (
                <>
                  <NotConnectedIntegratorForm
                    integrationItem={integrationItem}
                    isConnect={isConnect}
                    setIsConnect={setIsConnect}
                    finishedConnectHandler={finishedConnectHandler}
                    setActionInProgress={setActionInProgress}
                    alertHandler={alertHandler}
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
