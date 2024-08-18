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
import NumberInput from '../../components/ui/inputs/NumberInput';
import ViewReport from './ViewReport';

import { getActionUrl } from '../../services/getUrl';
import { useAxiosFunction } from '../../hooks/useAxios';
import { alertsActions } from '../../store/alerts';
import { useFormikSubmit } from '../../hooks/useFormikSubmit';
import FormNotes from '../../components/ui/FormNotes';
import DropDown from '../../components/ui/inputs/DropDown';
import { supportedFormats } from './constants';

function BalanceSheetReport({ feature, subFeature }) {
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
    upToLevel: 0,
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
    upToLevel: Yup.number().required(t('UP_TO_LEVEL_VALIDATION_MESSAGE_1')).min(0, t('UP_TO_LEVEL_VALIDATION_MESSAGE_2')),
    format: Yup.string().required(t('REQUIRED')),
  });

  const formik = useFormik({
    initialValues: initVals,
    validationSchema: valSchema,
    validateOnMount: true,
  });

  const { validateFormForSubmit } = useFormikSubmit(formik, () => setButtonCliked(false));

  const generateReport = async () => {
    const isValid = await validateFormForSubmit();
    if (!isValid) return null;

    setButtonCliked(true);
    let reportPaylod = {
      action: 'action-print-balance-sheet-report',
      data: {
        dateFrom: moment(formik.values.reportFromDate).locale('en').format('YYYY-MM-DD'),
        dateTo: moment(formik.values.reportToDate).locale('en').format('YYYY-MM-DD'),
        upToLevel: formik.values.upToLevel,
        Locale: i18next.language,
        format: formik.values.format,
      },
    };

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
                <h4>{t('LBL_BALANCE_SHEET_REPORT')}</h4>
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
                <div className="row mb-3">
                  <div className="col-md-4">
                    <DateInput formik={formik} label="LBL_FROM_DATE" accessor="reportFromDate" mode="add" isRequired={true} />{' '}
                  </div>
                  <div className="col-md-4">
                    <DateInput formik={formik} label="LBL_TO_DATE" accessor="reportToDate" mode="add" isRequired={true} />{' '}
                  </div>
                  <div className="col-md-4">
                    <NumberInput formik={formik} label="LBL_UP_TO_LEVEL" accessor="upToLevel" mode="add" isRequired={true} step={1} />{' '}
                  </div>
                  <div className="col-md-4">
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

export default BalanceSheetReport;
