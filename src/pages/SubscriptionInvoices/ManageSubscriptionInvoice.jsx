import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import Spinner from '../../components/Spinner/Spinner';
import SubscriptionInvoiceForm from './SubscriptionInvoiceForm';
import BreadCrumb from '../../components/ui/BreadCrumb';
import BackButton from '../../components/ui/buttons/BackButton';
import PayNow from './PayNow';
import Calendar from '../../components/ui/Calendar';

import { useAxiosFunction } from '../../hooks/useAxios';
import { useFeatures } from '../../hooks/useFeatures';
import { getSubscribtionInvoiceDetailsURL } from '../../services/getUrl';
import { alertsActions } from '../../store/alerts';
import { useUpgradeServices } from '../../services/apis/useUpgradeServices';
import useSubscriptionServices from '../../services/apis/useSubscriptionServices';

export default function ManageSubscriptionInvoice({ mainConfig }) {
  let maxCallbacks = 2;

  const { api } = useAxiosFunction();
  const { t } = useTranslation();
  const { getFeaturePath } = useFeatures();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { checkQaemaInvoicePayment } = useUpgradeServices();
  const { getSubscriptionDetailsService } = useSubscriptionServices();

  const [invoice, setInvoice] = useState({});
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPayNow, setIsPayNow] = useState(false);
  const [isDisablePayNow, setIsDisablePayMow] = useState(false);

  const { id } = useParams();

  const alertHandler = (title, message) => {
    dispatch(alertsActions.initiateAlert({ title, message }));
    setIsLoading(false);
    setIsPayNow(false);
  };

  const getInvoice = async (updateStatus, message) => {
    if (isLoading === false) setIsLoading(true);

    const invoiceResponse = await api('GET', getSubscribtionInvoiceDetailsURL(id));
    if (!(invoiceResponse?.data?.statusCode === 'I000000') || !invoiceResponse?.data?.returnedObject) return navigate('/error');
    let modifiedInvoice = { ...invoiceResponse.data.returnedObject };
    let invoiceStatus = modifiedInvoice?.invoiceInfo?.sttsCd;

    if (invoiceStatus === 'PI') {
      let checkResponse = await checkQaemaInvoicePayment();
      if (checkResponse?.paid) return mainConfig.redirectAfterPaymentHandler();
      maxCallbacks = maxCallbacks - 1;
      if (maxCallbacks > 0) return getInvoice();
    }

    if (invoiceStatus === 'Paid' || invoiceStatus === 'S') modifiedInvoice.invoiceInfo.sttsName = 'LBL_PAID';
    if (invoiceStatus === 'PP') modifiedInvoice.invoiceInfo.sttsName = 'LBL_PARTIALY_PAID';
    if (invoiceStatus === 'A') modifiedInvoice.invoiceInfo.sttsName = 'LBL_NOT_PAID';

    if (invoiceStatus === 'PI') modifiedInvoice.invoiceInfo.sttsName = 'LBL_PAYMENT_INITIALIZED';

    const subscriptionResponse = await getSubscriptionDetailsService(modifiedInvoice?.invoiceInfo?.subscriptionId);

    if (!subscriptionResponse) return navigate('/error');

    setInvoice(modifiedInvoice);
    setSubscription(subscriptionResponse);

    if (updateStatus === 'success') return alertHandler('Success', 'LBL_INVOICE_PAID');
    if (updateStatus === 'fail' && message) return alertHandler('Error', message);
    if (updateStatus === 'fail') return alertHandler('Error', 'LBL_PAYMENT_FAILED');
    if (searchParams.get('isReturnFromPayment')) return alertHandler('Error', 'LBL_ERROR_INITIALIZE_PAYMENT_GATEWAY');
    if (isPayNow) return null;

    if (invoiceStatus === 'PI') {
      setIsDisablePayMow(true);
      alertHandler('Info', 'PAYMENT_FAILED_TRY_AGAIN_LATER');
    }

    setIsLoading(false);
  };

  useEffect(() => {
    getInvoice();
  }, []);

  return (
    <>
      {isLoading && <Spinner />}
      <div className="page-body">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <Calendar />
              <BreadCrumb
                feature="SETTINGS"
                subFeature="SUBSCRIPTIONS"
                modeText={`${t(isPayNow ? 'LBL_PAY' : 'LBL_VIEW')} ${t('LBL_SUBSCRIPTION')}`}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{`${t('LBL_INVOICE')} ${id}`}</h4>
              </div>

              {!isPayNow && (
                <div className="reverse-page float-end">
                  <BackButton text="LBL_BACK" backPath={getFeaturePath('SUBSCRIPTIONS')} fallbackPath={getFeaturePath('SUBSCRIPTIONS')} />
                </div>
              )}
            </div>
          </div>

          <div className="row">
            <div className="col-md-12">
              {!isLoading && Object.keys(invoice).length > 0 && !isPayNow && (
                <SubscriptionInvoiceForm
                  data={invoice}
                  subscription={subscription}
                  alertHandler={alertHandler}
                  isDisablePayNow={isDisablePayNow}
                  setIsPayNow={setIsPayNow}
                />
              )}
              {Object.keys(invoice).length > 0 &&
                isPayNow &&
                invoice.invoiceInfo.sttsCd !== 'S' &&
                invoice.invoiceInfo.sttsCd !== 'Paid' && (
                  <div className="card">
                    <div className="row">
                      <h5 className="text-center payment-disclaimer">{t('LBL_PAYMENT_DISCLAMER')}</h5>
                      <PayNow data={invoice} onAlert={alertHandler} onLoading={setIsLoading} />
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
