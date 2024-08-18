import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import Spinner from '../../../components/Spinner/Spinner';
import MoreAction from '../../../parts/MoreAction';
import BreadCrumb from '../../../components/ui/BreadCrumb';
import BackButton from '../../../components/ui/buttons/BackButton';
import PrimaryButton from '../../../components/ui/buttons/PrimaryButton';
import ActionsProgessBar from '../../../parts/ActionsProgessBar';
import ImportDefaultConfigForm from './ImportDefaultConfigForm';

import { useAxiosFunction } from '../../../hooks/useAxios';
import { getTodayDate } from '../../../utils/helpers';
import { getFetchUrl } from '../../../services/getUrl';
import { MODELS } from '../../../constants/models';
import { alertsActions } from '../../../store/alerts';

export default function ManageImportDefaultConfig({ addNew }) {
  const feature = 'APP_CONFIG';
  const subFeature = 'CONFIG';

  const { api } = useAxiosFunction();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [isSave, setIsSave] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [importDefaultData, setImportDefaultData] = useState(null);

  const alertHandler = (title, message) => {
    setIsLoading(false);

    if (message) {
      dispatch(alertsActions.initiateAlert({ title, message }));
      setActionInProgress(false);
    } else {
      if (isSave) setIsSave(false);
    }
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

  const fetchImportDefaultConfig = async () => {
    const importConfigDefaultResponse = await api('POST', getFetchUrl(MODELS.COMPANY_STOCK_CONFIG, 1), {
      fields: ['authRedirectPurchaseOrderToStockMove', 'authRedirectSaleOrderToStockMove'],
      related: {},
    });
    if (importConfigDefaultResponse.data.status !== 0 || !importConfigDefaultResponse?.data?.data)
      return alertHandler('Error', 'SOMETHING_WENT_WRONG');
    setImportDefaultData({
      defaultSaleCurrency: {},
      defaultPurchaseCurrency: {},
      defaultSaleAccount: {},
      defaultPurchaseAccount: {},
      defaultSaleTax: {},
      defaultPurchaseTax: {},
    });
    setIsLoading(false);
    return importConfigDefaultResponse.data.data[0];
  };

  useEffect(() => {
    setIsLoading(false);
    // fetchImportDefaultConfig();
  }, [addNew]);

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
              <BreadCrumb feature={feature} subFeature={subFeature} modeText={t('CONFIGURATION.IMPORT_DEFAULT_CONFIG')} />
            </div>
          </div>
          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{t('CONFIGURATION.IMPORT_DEFAULT_CONFIG')}</h4>
              </div>
              <div className="reverse-page float-end">
                <BackButton disabled={isButtonDisabled} />
                <PrimaryButton disabled={isButtonDisabled} onClick={() => setIsSave(true)} />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              {!isLoading && !addNew && (
                <ActionsProgessBar
                  feature={feature}
                  subfeature={subFeature}
                  editHandler={null}
                  viewHandler={null}
                  deleteHandler={null}
                  setShowMoreAction={setShowMoreAction}
                />
              )}
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              {!isLoading && (
                <>
                  {addNew && (
                    <ImportDefaultConfigForm
                      data={importDefaultData}
                      isSave={isSave}
                      finishedSaveHandler={finishedSaveHandler}
                      setActionInProgress={setActionInProgress}
                      alertHandler={alertHandler}
                      fetchImportDefaultConfig={fetchImportDefaultConfig}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
