import { useState, useEffect } from 'react';
import { Doughnut, Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useTranslation } from 'react-i18next';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DashboardChart = ({ type = 'DOUGHNUT', data, options }) => {
  const { t } = useTranslation();
  const [windowSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);

  //MANDATORY FIELDS: labels - datasets [label-data-borderColor-backgroundColor]

  useEffect(() => {
    const handleWindowResize = () => {
      setWindowSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  });

  let isLargeScreen = windowSize[0] >= 768;

  const defaultData = {
    labels: data?.labels || [],
    datasets: data?.datasets?.map(dataset => ({
      label: t(dataset.label ?? ''),
      data: dataset.data || [],
      borderColor: dataset.borderColor ?? '#656CEE',
      backgroundColor: dataset.backgroundColor ?? '#656CEE',
      hoverOffset: dataset.hoverOffset ?? 4,
      barThickness: dataset.barThickness ?? 30,
      borderWidth: dataset.borderWidth ?? 1,
      weight: dataset.weight ?? 1,
    })),
  };

  const defaultDoughnutData = {
    labels: data?.labels || [],
    datasets: data?.datasets?.map(dataset => ({
      label: t(dataset.label ?? ''),
      data: dataset.data || [],
      borderColor: dataset.borderColor ?? '#656CEE',
      backgroundColor: dataset.backgroundColor ?? '#656CEE',
      hoverOffset: dataset.hoverOffset ?? 2,
    })),
  };

  const defaultDoughnutOptions = {
    rtl: true,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: options?.plugins?.legend?.position ?? t('LBL_CHART_LEGEND_POSITION'),
        responsive: true,
        display: options?.plugins?.legend?.display ?? true,
        labels: {
          font: {
            size: options?.plugins?.legend?.labels?.font?.size ?? 20,
          },
        },
      },
      title: {
        font: {
          size: options?.plugins?.title?.font?.size ?? 20,
        },
        display: options?.plugins?.title?.display ?? true,
        text: t(options?.plugins?.title?.text ?? ''),
      },
    },
  };

  const defaultOptions = {
    rtl: true,
    responsive: true,
    indexAxis: 'x',
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: options?.plugins?.legend?.position ?? 'top',
        responsive: true,
        display: options?.plugins?.legend?.display ?? true,
        labels: {
          font: {
            size: options?.plugins?.legend?.labels?.font?.size ?? isLargeScreen ? 20 : 16,
          },
        },
      },
      title: {
        font: {
          size: options?.plugins?.title?.font?.size ?? 20,
        },
        display: options?.plugins?.title?.display ?? true,
        text: t(options?.plugins?.title?.text ?? ''),
      },
    },

    elements: {
      bar: {
        borderWidth: options?.elements?.bar?.borderWidth ?? 2,
      },
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: options?.scales?.x?.ticks?.font?.size ?? isLargeScreen ? 20 : 16,
          },
          max: options?.scales?.x?.ticks?.max ?? undefined,
        },
        grid: {
          display: isLargeScreen ? true : false,
        },
      },
      y: {
        ticks: {
          display: isLargeScreen ? true : false,
          font: {
            size: options?.scales?.y?.ticks?.font?.size ?? isLargeScreen ? 20 : 16,
          },
          beginAtZero: true,
          max: options?.scales?.x?.ticks?.max ?? undefined,
        },
        grid: {
          drawBorder: isLargeScreen ? true : false,
          display: isLargeScreen ? true : false,
        },
      },
    },
  };

  if (type === 'DOUGHNUT') return <Doughnut data={defaultDoughnutData} options={defaultDoughnutOptions} />;
  if (type === 'BAR') return <Bar data={defaultData} options={defaultOptions} />;
  else return <Pie data={defaultData} options={defaultOptions} />;
};

export default DashboardChart;
