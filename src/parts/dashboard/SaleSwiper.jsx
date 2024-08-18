import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SpinnerCircular } from 'spinners-react';
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import moment from 'moment';

import 'swiper/css';
import 'swiper/css/pagination';

import DashboardChartCard from '../../components/ui/charts/DashboardChartCard';

import { useAxiosFunction } from '../../hooks/useAxios';
import { getModelChartUrl } from '../../services/getUrl';
import { MODELS } from '../../constants/models';
import { getColumnLabel, getDatasetColors, getSlidesPerView } from '../../utils/dashboardHelpers';

const SaleSwiper = ({ windowSize, isOffersAvailable }) => {
  const { t } = useTranslation();
  const { api } = useAxiosFunction();

  const [isLoading, setIsLoading] = useState(true);
  const [invoiceSituationData, setInvoiceSituationData] = useState(null);
  const [invoicePCDistributionData, setInvoicePCDistributionData] = useState(null);

  const initialValues = {
    invoiceSituationFromDate: moment().clone().startOf('month').format('YYYY-MM-DD'),
    invoiceSituationToDate: moment().format('YYYY-MM-DD'),
    invoicePCDistributionFromDate: moment().clone().startOf('month').format('YYYY-MM-DD'),
    invoicePCDistributionToDate: moment().format('YYYY-MM-DD'),
  };

  const validationSchema = Yup.object({
    invoiceSituationFromDate: Yup.date(),
    invoiceSituationToDate: Yup.date().min(Yup.ref('invoiceSituationFromDate'), t('LBL_ERROR_MIN_DATE')),
    invoicePCDistributionFromDate: Yup.date(),
    invoicePCDistributionToDate: Yup.date().min(Yup.ref('invoicePCDistributionFromDate'), t('LBL_ERROR_MIN_DATE')),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
  });

  let slides = [
    {
      title: 'LBL_INVOICE_SALE_SITUATION_WITH_VAT',
      data: invoiceSituationData,
      options: {
        plugins: {
          legend: {
            display: false,
          },
        },
      },
      type: 'BAR',
      children: [
        { type: 'DATE', label: 'LBL_FROM_DATE', accessor: 'invoiceSituationFromDate' },
        { type: 'DATE', label: 'LBL_TO_DATE', accessor: 'invoiceSituationToDate' },
      ],
    },
    {
      title: 'LBL_INVOICE_SALE_PAYMENT_CONDITION_DISTRIBUTION',
      data: invoicePCDistributionData,
      type: 'DOUGHNUT',
      children: [
        { type: 'DATE', label: 'LBL_FROM_DATE', accessor: 'invoicePCDistributionFromDate' },
        { type: 'DATE', label: 'LBL_TO_DATE', accessor: 'invoicePCDistributionToDate' },
      ],
    },
  ];

  useEffect(() => {
    getInvoiceSituation();
  }, [formik.values.invoiceSituationFromDate, formik.values.invoiceSituationToDate]);

  useEffect(() => {
    getInvoicePCDistribution();
  }, [formik.values.invoicePCDistributionFromDate, formik.values.invoicePCDistributionToDate]);

  const invoiceSituationPayload = () => {
    let payload = {
      data: {
        fromDate: formik.values.invoiceSituationFromDate,
        toDate: formik.values.invoiceSituationToDate,
        _domainAction: 'dashlet.invoice.sale.refund.situation',
      },
      fields: ['dataset'],
    };
    return payload;
  };

  const getInvoiceSituation = async () => {
    if (formik.errors.invoiceSituationFromDate || formik.errors.invoiceSituationToDate) {
      formik.validateForm();
      setIsLoading(false);
      return;
    }

    const response = await api('POST', getModelChartUrl(MODELS.CHART_INVOICE_SALE_REFUND_SITUATION), invoiceSituationPayload());

    if (response.data.status !== 0 || !response.data.data || !response.data.data.dataset) {
      setInvoiceSituationData(null);
      setIsLoading(false);
      return;
    }

    let responseDataset = response.data.data?.dataset || [];

    if (responseDataset.length === 0) setInvoiceSituationData(null);
    else {
      let tempData = {
        labels: responseDataset.map(dataset => t(getColumnLabel(dataset['_situation']))),
        datasets: [
          {
            data: responseDataset.map(dataset => dataset['_amount']),
            borderColor: getDatasetColors(responseDataset),
            backgroundColor: getDatasetColors(responseDataset),
          },
        ],
      };
      setInvoiceSituationData(tempData);
    }

    setIsLoading(false);
  };

  const getInvoicePCDistributionPayload = () => {
    let payload = {
      data: {
        fromDate: formik.values.invoicePCDistributionFromDate,
        toDate: formik.values.invoicePCDistributionToDate,
        _domainAction: 'dashlet.invoice.sale.paymentCondition.distribution',
      },
      fields: ['dataset'],
    };
    return payload;
  };

  const getInvoicePCDistribution = async () => {
    if (formik.errors.invoicePCDistributionFromDate || formik.errors.invoicePCDistributionToDate) {
      formik.validateForm();
      setIsLoading(false);
      return;
    }

    const response = await api(
      'POST',
      getModelChartUrl(MODELS.CHART_INVOICE_SALE_PAYMENTCONDITION_DISTRIBUTION),
      getInvoicePCDistributionPayload()
    );

    if (response.data.status !== 0 || !response.data.data || !response.data.data.dataset) {
      setInvoicePCDistributionData(null);
      setIsLoading(false);
      return;
    }

    let responseDataset = response.data.data?.dataset || [];

    if (responseDataset.length === 0) setInvoicePCDistributionData(null);
    else {
      let tempData = {
        labels: responseDataset.map(dataset => t(getColumnLabel(dataset['_payment_condition']))),
        datasets: [
          {
            label: responseDataset.map(dataset => t(getColumnLabel(dataset['_payment_condition']))),
            data: responseDataset.map(dataset => dataset['ex_tax_total']),
            borderColor: getDatasetColors(responseDataset),
            backgroundColor: getDatasetColors(responseDataset),
          },
        ],
      };
      setInvoicePCDistributionData(tempData);
    }

    setIsLoading(false);
  };

  return (
    <>
      {!isLoading && (
        <>
          <>
            <div className="row mb-3">
              <div className="col-md-12 text-center">
                <h2 className="dashboard-title">{t('LBL_SALES')}</h2>
              </div>
            </div>
            <div className="row">
              <Swiper
                slidesPerView={getSlidesPerView(windowSize, slides, isOffersAvailable)}
                spaceBetween={30}
                pagination={{
                  clickable: true,
                }}
                modules={[Pagination]}
                className="mySwiper"
              >
                {slides &&
                  slides?.map(slide => (
                    <SwiperSlide>
                      <div className="col-md-12 d-flex flex-fill">
                        <DashboardChartCard
                          title={slide?.title}
                          formik={formik}
                          type={slide?.type}
                          children={slide?.children}
                          data={slide.data}
                          options={slide.options}
                        />
                      </div>
                    </SwiperSlide>
                  ))}
              </Swiper>
            </div>
          </>
        </>
      )}

      {isLoading && (
        <div className="text-center">
          <SpinnerCircular size={70} thickness={120} speed={100} color="rgba(31, 79, 222, 1)" secondaryColor="rgba(153, 107, 229, 0.19)" />
        </div>
      )}
    </>
  );
};

export default SaleSwiper;
