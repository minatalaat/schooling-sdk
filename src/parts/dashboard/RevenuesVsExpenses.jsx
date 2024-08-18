import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import moment from 'moment';
import { useSelector } from 'react-redux';

import RectangleSkeleton from '../../components/ui/skeletons/RectangleSkeleton';
import DashboardChartCard from '../../components/ui/charts/DashboardChartCard';

import { MODELS } from '../../constants/models';
import { useAxiosFunction } from '../../hooks/useAxios';
import { getModelChartUrl, getSearchUrl } from '../../services/getUrl';
import { getColumnLabel, getDatasetColors } from '../../utils/dashboardHelpers';
import { setFieldValue } from '../../utils/formHelpers';

const RevenuesVsExpenses = () => {
  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  const currentYear = moment().year();
  const currentMonth = moment().month() + 1;
  const company = useSelector(state => state.userFeatures.companyInfo.company);
  const currentYearCode = `${company.name}_${currentYear}`;
  const currentPeriodName = currentMonth < 10 ? '0' + currentMonth + '/' + currentYearCode : currentMonth + '/' + currentYearCode;

  const [revenuesVsExpensesData, setRevenuesVsExpensesData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const initialValues = {
    year: null,
    period: null,
  };

  const validationSchema = Yup.object({
    year: Yup.object().nullable(),
    period: Yup.object().nullable(),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
  });

  let periodDomain = `self.year.code = '${formik.values.year?.code}' OR self.year.name = '${formik.values.year?.name}'`;

  const revenuesVsExpensesPayload = () => {
    let payload = {
      data: {
        period: {
          id: formik.values.period?.id,
          name: formik.values.period?.name,
        },
        year: {
          id: formik.values.year?.id,
          name: formik.values.year?.name,
        },
        _domainAction: 'dashlet.moveLines.revenues.vs.expenses',
      },
      fields: ['dataset'],
    };
    return payload;
  };

  const fetchRevenuesVsExpenses = async () => {
    if (!formik.values.year || !formik.values.period) {
      formik.validateForm();
      setIsLoading(false);
      return;
    }

    const response = await api('POST', getModelChartUrl(MODELS.CHART_MOVELINES_REVENUES_VS_EXPENSES), revenuesVsExpensesPayload());

    if (response.data.status !== 0 || !response.data.data || !response.data.data.dataset) {
      setRevenuesVsExpensesData(null);
      setIsLoading(false);
      return;
    }

    let responseDataset = response.data.data?.dataset || [];

    if (responseDataset.length === 0) {
      setRevenuesVsExpensesData(null);
      setIsLoading(false);
    } else {
      let tempData = {
        labels: responseDataset.map(responseDataset => t(getColumnLabel(responseDataset['_label']))),
        datasets: [
          {
            data: responseDataset.map(dataset => dataset['_amount']),
            borderColor: getDatasetColors(responseDataset),
            backgroundColor: getDatasetColors(responseDataset),
          },
        ],
      };
      setRevenuesVsExpensesData(tempData);
      setIsLoading(false);
    }
  };

  const getFirstPeriodPayload = year => {
    let payload = {
      data: {
        _archived: true,
        _domain: `self.year.code = '${year?.code}' OR self.year.name = '${year?.name}'`,
      },
      fields: ['fromDate', 'year.company', 'statusSelect', 'code', 'year', 'toDate', 'name', 'closureDateTime'],
      limit: -1,
      offset: 0,
      sortBy: ['fromDate'],
      translate: true,
    };
    return payload;
  };

  const getFirstPeriod = async year => {
    const response = await api('POST', getSearchUrl(MODELS.PERIOD), getFirstPeriodPayload(year));

    if (!response || !response.data || response.data.status !== 0 || !response.data.data) {
      setFieldValue(formik, 'period', null);
      setIsLoading(false);
      return null;
    }

    setFieldValue(formik, 'period', response.data.data[0]);
  };

  useEffect(() => {
    fetchRevenuesVsExpenses();
  }, [formik.values.period]);

  const slide = {
    title: 'REVENUES_VS_EXPENSES',
    data: revenuesVsExpensesData,
    options: {
      plugins: {
        legend: {
          display: false,
        },
      },
    },
    type: 'BAR',
    children: [
      {
        type: 'SEARCH',
        label: 'LBL_YEAR',
        modelKey: 'YEARS',
        accessor: 'year',
        isRequired: true,
        defaultValueConfig: { payloadDomain: `self.code = '${currentYearCode}' OR self.name = '${currentYear}'` },
        selectCallback: getFirstPeriod,
        showRemoveOption: false,
      },
      {
        type: 'SEARCH',
        label: 'LBL_PERIOD',
        modelKey: 'PERIODS',
        accessor: 'period',
        isRequired: true,
        extraFields: ['year.name', 'year.code'],
        payloadDomain: formik.values.year ? periodDomain : `self.name = '${currentPeriodName}'`,
        showRemoveOption: false,
      },
    ],
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

export default RevenuesVsExpenses;
