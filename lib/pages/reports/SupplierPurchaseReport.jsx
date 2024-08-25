import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { parse, isDate } from 'date-fns';
import { useFormik } from 'formik';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import i18next from 'i18next';

import Calendar from '../../components/ui/Calendar';
import BreadCrumb from '../../components/ui/BreadCrumb';
import BackButton from '../../components/ui/buttons/BackButton';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';
import DateInput from '../../components/ui/inputs/DateInput';
import ViewReport from './ViewReport';
import SearchModalAxelor from '../../components/ui/inputs/SearchModal/SearchModalAxelor';
import FormNotes from '../../components/ui/FormNotes';

import { getActionUrl } from '../../services/getUrl';
import { useAxiosFunction } from '../../hooks/useAxios';
import { alertsActions } from '../../store/alerts';
import { useFormikSubmit } from '../../hooks/useFormikSubmit';
import DropDown from '../../components/ui/inputs/DropDown';
import { supportedFormats } from './constants';

function SupplierPurchaseReport({ feature, subFeature }) {
  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  const dispatch = useDispatch();

  const parseDateString = (value, originalValue) => {
    const parsedDate = isDate(originalValue) ? originalValue : parse(originalValue, 'yyyy-MM-dd', new Date());

    return parsedDate;
  };

  const [buttonClicked, setButtonCliked] = useState(false);
  const [pdfURL, setPdfURL] = useState('');

  const initVals = {
    reportFromDate: '',
    reportToDate: '',
    partner: null,
    format: '',
  };

  const valSchema = Yup.object().shape({
    reportFromDate: Yup.date()
      .transform(parseDateString)
      .typeError(t('VALID_DATE_FORMAT'))
      .required(t('REPORT_FROM_DATE_VALIDATION_MESSAGE')),
    reportToDate: Yup.date()
      .transform(parseDateString)
      .typeError(t('VALID_DATE_FORMAT'))
      .required(t('REPORT_TO_DATE_VALIDATION_MESSAGE'))
      .min(Yup.ref('reportFromDate'), t('REPORT_TO_DATE_VALIDATION_MESSAGE_2')),
    partner: Yup.object().nullable(),
    format: Yup.string().required(t('REQUIRED')),
  });

  const formik = useFormik({
    initialValues: initVals,
    validationSchema: valSchema,
    validateOnMount: true,
  });

  const { validateFormForSubmit } = useFormikSubmit(formik, () => setButtonCliked(false));

  const onCustomersSearchSuccess = response => {
    if (response.data.status === 0) {
      let data = response.data.data;
      let temp2 = [];

      if (data) {
        data.forEach(customer => {
          let obj = {
            id: customer.id ? customer.id : -1,
            fullName: customer.fullName,
            partnerSeq: customer.partnerSeq,
            simpleFullName: customer.simpleFullName,
            fixedphone: customer.fixedphone,
            email: customer.emailAddress,
            category: customer.partnerCategory,
            fiscalposition: customer.fiscalPosition,
            registrationcode: customer.registrationcode,
            address: customer.mainAddress,
            companies: customer.companyStr,
          };
          temp2.push(obj);
        });
      }

      return { displayedData: [...temp2], total: response.data.total || 0 };
    }
  };

  const generateReport = async () => {
    const isValid = await validateFormForSubmit();
    if (!isValid) return null;

    setButtonCliked(true);

    let reportPaylod = {
      action: 'action-customer-sales-purchase',
      data: {
        dateFrom: moment(formik.values.reportFromDate).locale('en').format('YYYY-MM-DD'),
        dateTo: moment(formik.values.reportToDate).locale('en').format('YYYY-MM-DD'),
        operationType: 'purchase',
        Locale: i18next.language,
        format: formik.values.format,
      },
    };

    if (formik.values.partner) {
      reportPaylod.data = {
        partnerId: formik?.values?.partner?.id || null,
        dateFrom: moment(formik.values.reportFromDate).locale('en').format('YYYY-MM-DD'),
        dateTo: moment(formik.values.reportToDate).locale('en').format('YYYY-MM-DD'),
        operationType: 'purchase',
        Locale: i18next.language,
        format: formik.values.format,
      };
    }

    if (reportPaylod) {
      api('POST', getActionUrl(), reportPaylod, onGenerateReportSuccess);
    } else {
      setButtonCliked(false);
    }
  };

  const onGenerateReportSuccess = response => {
    if (response.data.status === 0) {
      const url = response.data.data
        ? response.data.data[0]
          ? response.data.data[0].view
            ? response.data.data[0].view.views
              ? response.data.data[0].view.views[0].name
                ? response.data.data[0].view.views[0].name
                : ''
              : ''
            : ''
          : ''
        : '';

      if (url !== '') {
        setButtonCliked(false);

        setPdfURL(url);
      } else {
        setButtonCliked(false);
      }
    } else {
      setButtonCliked(false);
      dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'SOMETHING_WENT_WRONG' }));
    }
  };
  useEffect(() => {
    if (formik.values.format !== '') {
      setPdfURL('');
    }
  }, [formik.values.format]);
  return (
    <>
      {buttonClicked && <div className="lodingpage"></div>}

      <div className="page-body">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <Calendar />
              <BreadCrumb feature={feature} subFeature={subFeature} />
            </div>
          </div>

          <div className="row ">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{t('LBL_SUPPLIER_PURCHASE_REPORT')}</h4>
              </div>

              <div className="reverse-page float-end">
                <BackButton />
                <PrimaryButton theme="blue" text="LBL_GENERATE_REPORT" onClick={() => generateReport()} />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className="row">
                  <div className="col-md-6">
                    <DateInput formik={formik} label="LBL_FROM_DATE" accessor="reportFromDate" mode="add" isRequired={true} />{' '}
                  </div>
                  <div className="col-md-6">
                    <DateInput formik={formik} label="LBL_TO_DATE" accessor="reportToDate" mode="add" isRequired={true} />{' '}
                  </div>
                  <div className="col-md-6">
                    <SearchModalAxelor
                      formik={formik}
                      modelKey="SUPPLIERS"
                      mode="add"
                      isRequired={false}
                      onSuccess={onCustomersSearchSuccess}
                      selectIdentifier="fullName"
                      payloadDomain="self.isContact = false AND self.isSupplier = true AND self.id!=1"
                      defaultValueConfig={null}
                      extraFields={['fullName']}
                    />
                  </div>
                  <div className="col-md-6">
                    <DropDown
                      options={supportedFormats}
                      formik={formik}
                      isRequired={true}
                      label="LBL_FORMAT"
                      accessor="format"
                      type="STRING"
                      keys={{ valueKey: 'value', titleKey: 'name' }}
                      mode="add"
                    />
                  </div>
                  <FormNotes
                    notes={[
                      {
                        title: 'LBL_REQUIRED_NOTIFY',
                        type: 3,
                      },
                    ]}
                  />
                  {pdfURL !== '' && <ViewReport url={pdfURL} formik={formik} />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SupplierPurchaseReport;
