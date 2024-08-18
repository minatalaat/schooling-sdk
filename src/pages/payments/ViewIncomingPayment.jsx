import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';

import BreadCrumb from '../../components/ui/BreadCrumb';
import BackButton from '../../components/ui/buttons/BackButton';
import Calendar from '../../components/ui/Calendar';
import TextInput from '../../components/ui/inputs/TextInput';
import NumberInput from '../../components/ui/inputs/NumberInput';
import DateInput from '../../components/ui/inputs/DateInput';
import SearchModalAxelor from '../../components/ui/inputs/SearchModal/SearchModalAxelor';

import { useAxiosFunction } from '../../hooks/useAxios';
import { MODELS } from '../../constants/models';
import { parseFloatFixedTwo } from '../../utils/helpers';
import { setAllValues } from '../../utils/formHelpers';
import { getFetchUrl } from '../../services/getUrl';
import { useFeatures } from '../../hooks/useFeatures';
import { PAYMENTS_FETCH_FIELDS } from './PaymentsPayloadsFields';

const ViewIncomingPayment = ({ feature, subFeature }) => {
  const mode = 'view';
  const url = window.location.href.split('/');
  const id = parseInt(url[url.length - 1]);

  const { api } = useAxiosFunction();
  const navigate = useNavigate();
  const { getFeaturePath } = useFeatures();
  const { t } = useTranslation();

  const statusSelected = ['', 'LBL_NEW', 'LBL_DAYBOOK', 'LBL_VALIDATED', 'LBL_CANCELLED', 'LBL_SIMULATED'];

  const initValues = {
    id: '',
    amount: parseFloatFixedTwo(0),
    currency: '',
    paymentMode: '',
    date: '',
    companyBankDetails: '',
    description: '',
    move: '',
    status: '',
    invoiceId: '',
  };

  const formik = useFormik({
    initialValues: initValues,
  });

  useEffect(() => {
    fetchPayment();
  }, []);

  const fetchPaymentPayload = () => {
    let payload = {
      fields: PAYMENTS_FETCH_FIELDS,
      sortBy: ['-paymentDate'],
      translate: true,
    };
    return payload;
  };

  const fetchPayment = async () => {
    const response = await api('POST', getFetchUrl(MODELS.INVOICE_PAYMENT, id), fetchPaymentPayload());
    let status = response.data.status;
    let data = response.data.data;
    if (status !== 0 || !data) navigate(getFeaturePath('INCOMING_PAYMENTS'));

    if (data && data[0]) {
      let payment = data[0];
      setAllValues(formik, {
        id: payment.id,
        amount: payment.amount ?? 0,
        currency: payment.currency ?? null,
        paymentMode: payment.paymentMode ?? null,
        date: payment.paymentDate,
        companyBankDetails: payment.companyBankDetails?.fullName ?? '',
        description: payment.description ?? null,
        move: payment.move?.reference ?? '',
        invoiceId: payment.invoice?.invoiceId ?? '',
        status: payment.invoice ? t(statusSelected[payment.invoice.statusSelect]) : '',
      });
    }
  };

  return (
    <div className="page-body">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <Calendar />
            <BreadCrumb feature={feature} subFeature={subFeature} modeText="LBL_VIEW_INCOMING_PAYMENT" />
          </div>
        </div>

        <div className="row">
          <div className="col-md-12 mb-4">
            <div className="info-tite-page float-start">
              <h4>{formik.values.invoiceId} </h4>
            </div>

            <div className="reverse-page float-end">
              <BackButton />
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="row">
                <div className="col-md-12">
                  <TextInput formik={formik} label="LBL_INVOICE_NUMBER" accessor="invoiceId" mode={mode} />
                </div>
                <div className="col-md-6">
                  <NumberInput formik={formik} label="LBL_AMOUNT" accessor="amount" mode={mode} />
                </div>
                <div className="col-md-6">
                  <SearchModalAxelor formik={formik} modelKey="CURRENCIES" mode="view" defaultValueConfig={null} />
                </div>
                <div className="col-md-6">
                  <SearchModalAxelor formik={formik} modelKey="PAYMENT_MODES" mode="view" defaultValueConfig={null} />
                </div>
                <div className="col-md-6">
                  <DateInput formik={formik} label="LBL_PAYMENT_DATE" accessor="date" mode={mode} />
                </div>
                <div className="col-md-12">
                  <TextInput formik={formik} label="LBL_COMPANY_BANK_DETAILS" accessor="companyBankDetails" mode={mode} />
                </div>

                <div className="col-md-6">
                  <TextInput formik={formik} label="LBL_MOVE_REFERENCE" accessor="move" mode={mode} />
                </div>
                <div className="col-md-6">
                  <TextInput formik={formik} label="LBL_STATUS" accessor="status" mode={mode} />
                </div>
                <div className="col-md-12">
                  <TextInput formik={formik} label="LBL_DESCRIPTION" accessor="description" mode={mode} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewIncomingPayment;
