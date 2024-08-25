import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import moment from 'moment';

import RectangleSkeleton from '../../components/ui/skeletons/RectangleSkeleton';
import DashboardChartCard from '../../components/ui/charts/DashboardChartCard';

import { useAxiosFunction } from '../../hooks/useAxios';
import { getActionUrl } from '../../services/getUrl';
import { getDatasetPositiveNegativeColors } from '../../utils/dashboardHelpers';
import { setFieldValue } from '../../utils/formHelpers';

const ProfitAndLoss = () => {
  const { t } = useTranslation();
  const { api } = useAxiosFunction();

  const [profitAndLossData, setProfitAndLossData] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const initialValues = {
    fromDate: moment().clone().startOf('month').format('YYYY-MM-DD'),
    toDate: moment().format('YYYY-MM-DD'),
    dropDownSelect: '',
  };

  let dropDownList = [
    {
      value: '0',
      label: 'LBL_PROFITS',
    },
    {
      value: '1',
      label: 'LBL_GROSS_PROFIT',
    },
    {
      value: '2',
      label: 'LBL_OPERATING_PROFIT',
    },
    {
      value: '3',
      label: 'LBL_NET_PROFIT',
    },
  ];

  const infoColors = {
    field: 'colorLabel',
    data: [
      { colorId: '5', label: 'LBL_POSITIVE' },
      { colorId: '6', label: 'LBL_NEGATIVE' },
    ],
  };

  const validationSchema = Yup.object({
    fromDate: Yup.date(),
    toDate: Yup.date().min(Yup.ref('fromDate'), t('LBL_ERROR_MIN_DATE')),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
  });

  const profitAndLossPayload = () => {
    let payload = {
      action: 'action-profit-and-loss-chart',
      data: {
        dateFrom: formik.values.fromDate,
        dateTo: formik.values.toDate,
      },
    };
    return payload;
  };

  const fetchProfitAndLoss = async () => {
    if (!formik.values.fromDate || !formik.values.toDate) {
      formik.validateForm();
      setIsLoading(false);
      return;
    }

    const response = await api('POST', getActionUrl(), profitAndLossPayload());

    if (response.data.status !== 0 || !response.data.data) {
      setProfitAndLossData(null);
      setIsLoading(false);
      return;
    }

    let tempResponseData = response.data.data || [];
    setResponseData(tempResponseData);

    if (tempResponseData.length === 0) {
      setProfitAndLossData(null);
      setIsLoading(false);
    } else {
      setData(tempResponseData);
    }
  };

  const setData = (tempResponseData, dropDown) => {
    if (!tempResponseData) return;
    let labels = [];
    let dataset = [];
    if (!dropDown) dropDown = formik.values.dropDownSelect;

    if (parseInt(dropDown) === 1) {
      setGrossProfitDataset(tempResponseData, labels, dataset);
    } else if (parseInt(dropDown) === 2) {
      setOperatingProfitDataset(tempResponseData, labels, dataset);
    } else if (parseInt(dropDown) === 3) {
      setNetProfitDataset(tempResponseData, labels, dataset);
    } else {
      setLabelsAndDataset(tempResponseData, labels, dataset);
    }

    let allPositive = [];
    dataset.forEach(data => {
      if (data.includes('-')) allPositive.push(data.replace('-', ''));
      else allPositive.push(data);
    });

    let tempData = {
      labels: labels,
      datasets: [
        {
          data: allPositive,
          borderColor: getDatasetPositiveNegativeColors(dataset),
          backgroundColor: getDatasetPositiveNegativeColors(dataset),
        },
      ],
    };
    setProfitAndLossData(tempData);
    setIsLoading(false);
  };

  const setLabelsAndDataset = (tempResponseData, labels, dataset) => {
    let grossProfit = tempResponseData.filter(data => data.accountCode === '51000000')?.[0];

    if (grossProfit) {
      dataset.push(grossProfit?.grossProfit);
      labels.push(t('LBL_GROSS_PROFIT'));
    }

    let operatingProfit = tempResponseData.filter(data => data.accountCode === '61000000')?.[0];

    if (operatingProfit) {
      dataset.push(operatingProfit?.operatingProfit);
      labels.push(t('LBL_OPERATING_PROFIT'));
    }

    let netProfit = tempResponseData.filter(data => data.accountCode === '71000000')?.[0];

    if (netProfit) {
      dataset.push(netProfit?.netProfit);
      labels.push(t('LBL_NET_PROFIT'));
    }
  };

  const setGrossProfitDataset = (tempResponseData, labels, dataset) => {
    let revenues = tempResponseData.filter(data => data.accountCode === '41000000')?.[0];

    if (revenues) {
      dataset.push(revenues?.totalParentBalance);
      labels.push(t('LBL_REVENUES'));
    }

    let costOfSales = tempResponseData.filter(data => data.accountCode === '51000000')?.[0];

    if (costOfSales) {
      dataset.push(costOfSales?.totalParentBalance);
      labels.push(t('LBL_COST_OF_SALES'));
    }

    let grossProfit = tempResponseData.filter(data => data.accountCode === '51000000')?.[0];

    if (grossProfit) {
      dataset.push(grossProfit?.grossProfit);
      labels.push(t('LBL_GROSS_PROFIT'));
    }
  };

  const setOperatingProfitDataset = (tempResponseData, labels, dataset) => {
    let grossProfit = tempResponseData.filter(data => data.accountCode === '51000000')?.[0];

    if (grossProfit) {
      dataset.push(grossProfit?.grossProfit);
      labels.push(t('LBL_GROSS_PROFIT'));
    }

    let operationsExpenses = tempResponseData.filter(data => data.accountCode === '61000000')?.[0];

    if (operationsExpenses) {
      dataset.push(operationsExpenses?.totalParentBalance);
      labels.push(t('LBL_OPERATION_EXPENSES'));
    }

    let operatingProfit = tempResponseData.filter(data => data.accountCode === '61000000')?.[0];

    if (operatingProfit) {
      dataset.push(operatingProfit?.operatingProfit);
      labels.push(t('LBL_OPERATING_PROFIT'));
    }
  };

  const setNetProfitDataset = (tempResponseData, labels, dataset) => {
    let operatingProfit = tempResponseData.filter(data => data.accountCode === '61000000')?.[0];

    if (operatingProfit) {
      dataset.push(operatingProfit?.operatingProfit);
      labels.push(t('LBL_OPERATING_PROFIT'));
    }

    let netAdministrationExpenses = tempResponseData.filter(data => data.accountCode === '71000000')?.[0];

    if (netAdministrationExpenses) {
      dataset.push(netAdministrationExpenses?.totalParentBalance);
      labels.push(t('LBL_NET_ADMINSTRATION_GENERAL_EXPENSES'));
    }

    let netProfit = tempResponseData.filter(data => data.accountCode === '71000000')?.[0];

    if (netProfit) {
      dataset.push(netProfit?.netProfit);
      labels.push(t('LBL_NET_PROFIT'));
    }
  };

  const onDropDownChange = e => {
    setFieldValue(formik, 'dropDownSelect', e.target.value);

    if (e.target.value) {
      setData(responseData, e.target.value);
    }
  };

  const dropDownOptions = {
    options: dropDownList,
    formik,
    label: '',
    accessor: 'dropDownSelect',
    translate: true,
    valueKey: 'value',
    titleKey: 'label',
    onChange: onDropDownChange,
    type: 'INTEGER',
    noLabel: true,
  };

  useEffect(() => {
    fetchProfitAndLoss();
  }, [formik.values.fromDate, formik.values.toDate]);

  const slide = {
    title: 'PROFIT_AND_LOSS',
    data: profitAndLossData,
    options: {
      plugins: {
        legend: {
          display: false,
        },
      },
    },
    type: 'BAR',
    children: [
      { type: 'DATE', label: 'LBL_FROM_DATE', accessor: 'fromDate' },
      { type: 'DATE', label: 'LBL_TO_DATE', accessor: 'toDate' },
    ],
  };

  return (
    <div className="col-xl-6 col-md-6 d-flex flex-fill ">
      {!isLoading && (
        <DashboardChartCard
          title={slide.title}
          type={slide.type}
          data={slide.data}
          formik={formik}
          children={slide?.children}
          options={slide.options}
          dropDownOptions={dropDownOptions}
          infoColors={infoColors}
        />
      )}
      {isLoading && <RectangleSkeleton height="800" width="800" />}
    </div>
  );
};

export default ProfitAndLoss;
