import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import Spinner from '../../../components/Spinner/Spinner';
import MoreAction from '../../../parts/MoreAction';
import BreadCrumb from '../../../components/ui/BreadCrumb';
import BackButton from '../../../components/ui/buttons/BackButton';
import PrimaryButton from '../../../components/ui/buttons/PrimaryButton';
import DefaultConfigurationsForm from './DefaultConfigurationsForm';

import { useAxiosFunction } from '../../../hooks/useAxios';
import { getTodayDate } from '../../../utils/helpers';
import { getSearchUrl } from '../../../services/getUrl';

import { alertsActions } from '../../../store/alerts';

export default function ManageDefaultConfigurations({ defaultConfig }) {
  const { api } = useAxiosFunction();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [isSave, setIsSave] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);

  const alertHandler = (title, message) => {
    setIsLoading(false);

    if (message) {
      dispatch(alertsActions.initiateAlert({ title, message }));
      setActionInProgress(false);
    }

    if (isSave) setIsSave(false);
  };

  const finishedSaveHandler = (type, message) => {
    if (type === 'Success') {
      alertHandler('Success', message);
      setTimeout(() => {
        setIsSave(false);
      }, [3000]);
    } else {
      alertHandler('error', t('SOMETHING_WENT_WRONG'));
    }
  };

  const getDefaultConfiguration = async () => {
    const configDefaultResponse = await api('POST', getSearchUrl(defaultConfig.modelName), {
      fields: defaultConfig.searchFields,
      sortBy: null,
      data: {
        _domain: defaultConfig.domains.searchDomain,
        operator: 'and',
        criteria: [],
      },
      limit: 1,
      offset: 0,
      translate: true,
    });
    if (configDefaultResponse.data.status !== 0 || !configDefaultResponse?.data?.data) return alertHandler('Error', 'SOMETHING_WENT_WRONG');
    setData(configDefaultResponse.data.data?.[0]);
    setIsLoading(false);
    return configDefaultResponse.data.data?.[0];
  };

  useEffect(() => {
    getDefaultConfiguration();
  }, []);

  let isButtonDisabled = isSave;
  return (
    <>
      {showMoreAction && (
        <MoreAction
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          editHandler={null}
          viewHandler={null}
          deleteHandler={null}
          canSelectAll={false}
        />
      )}
      {actionInProgress && <div className="lodingpage"></div>}
      {isLoading && <Spinner />}
      <div className="page-body">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <div className="info-date-page float-end">
                <i className="calender-i"></i>
                <p>{t('DATE', getTodayDate())}</p>
              </div>
              <BreadCrumb
                feature={defaultConfig.feature}
                subFeature={defaultConfig.subFeature}
                modeText={defaultConfig.labels?.modeText ? t(defaultConfig.labels?.modeText) : null}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{t(defaultConfig.labels?.title)}</h4>
              </div>
              <div className="reverse-page float-end">
                <BackButton disabled={isButtonDisabled} />
                <PrimaryButton disabled={isButtonDisabled} onClick={() => setIsSave(true)} />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              {!isLoading && (
                <>
                  <DefaultConfigurationsForm
                    defaultConfig={defaultConfig}
                    data={data}
                    isSave={isSave}
                    finishedSaveHandler={finishedSaveHandler}
                    setActionInProgress={setActionInProgress}
                    alertHandler={alertHandler}
                    getDefaultConfiguration={getDefaultConfiguration}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
