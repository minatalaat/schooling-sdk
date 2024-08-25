import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import moment from 'moment';

import RectangleSkeleton from '../../components/ui/skeletons/RectangleSkeleton';
import DashboardChartCard from '../../components/ui/charts/DashboardChartCard';

import { useAxiosFunction } from '../../hooks/useAxios';
import { getActionUrl } from '../../services/getUrl';
import { getDatasetColors } from '../../utils/dashboardHelpers';
import { useTranslation } from 'react-i18next';

const AgingChart = ({ type }) => {
  const { t } = useTranslation();
  const { api } = useAxiosFunction();

  const [agingData, setAgingData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const labels = [t('LBL_ZERO_THIRTY'), t('LBL_THIRTY_SIXTY'), t('LBL_SIXTY_NINETY'), t('LBL_NINETY_PLUS')];

  const initialValues = {
    agingDate: moment().format('YYYY-MM-DD'),
  };

  const validationSchema = Yup.object({
    agingDate: Yup.date(),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
  });

  const agingPayload = () => {
    let payload = {
      action: 'action-aging-chart',
      data: {
        agingDate: formik.values.agingDate,
        operationType: type,
      },
    };
    return payload;
  };

  const fetchAgingChart = async () => {
    if (!formik.values.agingDate) {
      formik.validateForm();
      setIsLoading(false);
      return;
    }

    const response = await api('POST', getActionUrl(), agingPayload());

    if (response.data.status !== 0 || !response.data.data || !response.data.data.dataset) {
      setAgingData(null);
      setIsLoading(false);
      return;
    }

    let responseDataset = response.data.data || [];

    if (responseDataset.length === 0) {
      setAgingData(null);
      setIsLoading(false);
    } else {
      let tempData = {
        labels: labels,
        datasets: [
          {
            data: ['100', '200'],
            borderColor: getDatasetColors(responseDataset),
            backgroundColor: getDatasetColors(responseDataset),
          },
        ],
      };
      setAgingData(tempData);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgingChart();
  }, [formik.values.agingDate]);

  const slide = {
    title: type === 'customer' ? 'LBL_CUSTOMER_AGING' : 'LBL_VENDOR_AGING',
    data: agingData,
    options: {
      plugins: {
        legend: {
          display: false,
        },
      },
    },
    type: 'BAR',
    children: [{ type: 'DATE', label: 'LBL_DATE', accessor: 'agingDate' }],
  };

  return (
    <div className="col-md-6 d-flex flex-fill">
      {!isLoading && (
        <DashboardChartCard
          title={slide.title}
          type={slide.type}
          data={slide.data}
          formik={formik}
          children={slide?.children}
          options={slide.options}
        />
      )}
      {isLoading && <RectangleSkeleton height="800" width="800" />}
    </div>
  );
};

export default AgingChart;
