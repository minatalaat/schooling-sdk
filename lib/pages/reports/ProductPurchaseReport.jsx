import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { parse, isDate } from 'date-fns';
import { useFormik } from 'formik';
import moment from 'moment';
import { useDispatch } from 'react-redux';

import Calendar from '../../components/ui/Calendar';
import BreadCrumb from '../../components/ui/BreadCrumb';
import BackButton from '../../components/ui/buttons/BackButton';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';
import DateInput from '../../components/ui/inputs/DateInput';
import ViewReport from './ViewReport';
import SearchModalAxelor from '../../components/ui/inputs/SearchModal/SearchModalAxelor';

import { getActionUrl } from '../../services/getUrl';
import { useAxiosFunction } from '../../hooks/useAxios';
import { alertsActions } from '../../store/alerts';
import { useFormikSubmit } from '../../hooks/useFormikSubmit';
import FormNotes from '../../components/ui/FormNotes';
import DropDown from '../../components/ui/inputs/DropDown';
import { supportedFormats } from './constants';

function ProductPurchaseReport({ feature, subFeature }) {
  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  const dispatch = useDispatch();
  const purchasableProductDomain =
    "self.isModel = false AND self.dtype = 'Product' AND self.purchasable = true AND self.isActivity = false";

  const parseDateString = (value, originalValue) => {
    const parsedDate = isDate(originalValue) ? originalValue : parse(originalValue, 'yyyy-MM-dd', new Date());

    return parsedDate;
  };

  const [buttonClicked, setButtonCliked] = useState(false);
  const [pdfURL, setPdfURL] = useState('');
  const initVals = {
    reportFromDate: '',
    reportToDate: '',
    product: null,
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
    product: Yup.object().nullable(),
    format: Yup.string().required(t('REQUIRED')),
  });

  const formik = useFormik({
    initialValues: initVals,
    validationSchema: valSchema,
    validateOnMount: true,
  });

  const { validateFormForSubmit } = useFormikSubmit(formik, () => setButtonCliked(false));

  const onProductSearchSuccess = response => {
    if (response.data.status === 0) {
      let data = response.data.data;
      let products = [];

      if (data) {
        data.forEach(product => {
          let temp = {
            id: product?.id ?? null,
            picture: product?.picture ?? '',
            code: product?.code ?? '',
            name: product?.name ?? '',
            fullName: product?.fullName ?? '',
            type: 'Product',
            productCode: product?.code ?? '',
            productName: product?.name ?? '',
            productCategory: product?.productCategory ?? '',
            accountingFamily: product?.accountingFamily ?? '',
            salePrice: product?.salePrice ?? '',
            unit: product?.unit?.name ?? '',
            internalDescription: product?.internalDescription ?? '',
            productTypeSelect: product?.productTypeSelect ?? '',
            serialNumber: product?.serialNumber ?? '',
            availableQty: product && product.$availableQty ? parseFloat(product.$availableQty).toFixed(2).toString() : '0.00',
          };
          products.push(temp);
        });
      }

      return { displayedData: [...products], total: response.data.total || 0 };
    }
  };

  const generateReport = async () => {
    const isValid = await validateFormForSubmit();
    if (!isValid) return null;
    setButtonCliked(true);
    let reportPaylod = {
      action: 'action-product-sales-purchase-report',
      data: {
        dateFrom: moment(formik.values.reportFromDate).locale('en').format('YYYY-MM-DD'),
        dateTo: moment(formik.values.reportToDate).locale('en').format('YYYY-MM-DD'),
        operationType: 'purchase',
        // Language: 'en',
        Locale: 'en',
        // Locale: getAppLang() ? getAppLang() : null,
        format: formik.values.format,
      },
    };

    if (formik.values.product) {
      reportPaylod.data = {
        productId: formik?.values?.product?.id || null,
        dateFrom: moment(formik.values.reportFromDate).locale('en').format('YYYY-MM-DD'),
        dateTo: moment(formik.values.reportToDate).locale('en').format('YYYY-MM-DD'),
        operationType: 'purchase',
        // Language: 'en',
        Locale: 'en',
        // Locale: getAppLang() ? getAppLang() : null,
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
                <h4>{t('LBL_PRODUCT_PURCHASE_REPORT')}</h4>
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
                      modelKey="PRODUCTS"
                      mode="add"
                      isRequired={false}
                      disabled={false}
                      onSuccess={onProductSearchSuccess}
                      selectIdentifier="fullName"
                      tooltip="purchasableProduct"
                      payloadDomain={purchasableProductDomain}
                      defaultValueConfig={null}
                      extraFields={['fullName', 'productTypeSelect']}
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

export default ProductPurchaseReport;
