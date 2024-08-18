import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useFeatures } from '../../hooks/useFeatures';
import { getActionUrl } from '../../services/getUrl';
import { useAxiosFunction } from '../../hooks/useAxios';
import { getItem } from '../../utils/localStorage';

export default function PayNow({ data, onAlert, onLoading }) {
  let form = useRef();
  const location = useLocation();
  const { getFeaturePath } = useFeatures();
  const { api } = useAxiosFunction();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [paymentFormData, setPaymentFormData] = useState(null);

  const getAppBaseURL = () => {
    const fullURL = window.location.href;
    const realtivePath = location.pathname;
    return fullURL.replace(realtivePath, '');
  };

  const getPaymentGateway = () => {
    const payload = {
      action: 'action-init-credit-card-payment',
      data: {
        context: {
          isMoaeen: false,
          invoiceNo: (data.invoiceInfo && data.invoiceInfo.invoiceNo) || '',
          merchantReturnUrl:
            getAppBaseURL() + getFeaturePath('SUBSCRIPTIONS', 'view', { id: data.invoiceInfo?.invoiceNo }) + '?isReturnFromPayment=true',
          // transactionLocal: getItem('code'),
          transactionLocal: 'en',
        },
      },
    };
    api('POST', getActionUrl(), payload, res => {
      if (res.data?.status === -1 && res.data?.data[0]?.error === 'P-003') {
        onAlert('Error', t('LBL_INVOICE_ALREADY_PAID'));
        return navigate(getFeaturePath('SUBSCRIPTIONS', 'view', { id: data.invoiceInfo?.invoiceNo }));
      }

      if (!res.data || res.data.status !== 0 || !res.data.data || !res.data.data[0] || !res.data.data[0].scsPaymentRequestParams)
        return onAlert('Error', t('LBL_ERROR_INITIALIZE_PAYMENT_GATEWAY'));
      setPaymentFormData(res.data.data[0].scsPaymentRequestParams);
    });
  };

  const LoadingPaymentGateway = `<div dir="${getItem(
    'dir'
  )}" style="width:100%;text-align:center;font-size:1.1rem;line-height:1.2;font-weight:500;color:#4f4f4f;font-family:'Tajawal-bold'!important;"><h3>${t(
    'LBL_LOADING_PAYMENT_GATEWAY'
  )}</h3></div>`;

  useEffect(() => {
    getPaymentGateway();
  }, []);

  useEffect(() => {
    if (paymentFormData) {
      form.current.submit();
      onLoading(false);
    }
  }, [paymentFormData]);

  return (
    <>
      <form action={import.meta.env.VITE_PAYMENT_GATEWAY} method="post" id="" target="myframe" ref={form}>
        <input type="hidden" name="ps_access_code" value={paymentFormData?.ps_access_code || ''} />
        <input type="hidden" name="ps_allow_recurring_payment" value={paymentFormData?.ps_allow_recurring_payment || ''} />
        <input type="hidden" name="ps_amount" value={paymentFormData?.ps_amount || ''} />
        <input type="hidden" name="ps_currency" value={paymentFormData?.ps_currency || ''} />
        <input type="hidden" name="ps_customer_email" value={paymentFormData?.ps_customer_email || ''} />
        <input type="hidden" name="ps_customer_id_number" value={paymentFormData?.ps_customer_id_number || ''} />
        <input type="hidden" name="ps_customer_id_type_code" value={paymentFormData?.ps_customer_id_type_code || ''} />
        <input type="hidden" name="ps_customer_mobile" value={paymentFormData?.ps_customer_mobile || ''} />
        <input type="hidden" name="ps_customer_name" value={paymentFormData?.ps_customer_name || ''} />
        <input type="hidden" name="ps_invoice_number" value={paymentFormData?.ps_invoice_number || ''} />
        <input type="hidden" name="ps_merchant_order_info" value={paymentFormData?.ps_merchant_order_info || ''} />
        <input type="hidden" name="ps_merchant_return_url" value={paymentFormData?.ps_merchant_return_url || ''} />
        <input type="hidden" name="ps_merchant_transaction_ref" value={paymentFormData?.ps_merchant_transaction_ref || ''} />
        <input type="hidden" name="ps_operation" value={paymentFormData?.ps_operation || ''} />
        <input type="hidden" name="ps_transaction_locale" value={paymentFormData?.ps_transaction_locale || ''} />
        <input type="hidden" name="ps_secure_hash" value={paymentFormData?.ps_secure_hash || ''} />
      </form>
      <center>
        <iframe
          title="My frame"
          name="myframe"
          width="100%"
          style={{ maxWidth: '960px' }}
          height="680"
          sandbox="allow-top-navigation allow-scripts allow-forms allow-same-origin allow-popups"
          srcDoc={LoadingPaymentGateway}
        ></iframe>
      </center>
    </>
  );
}
