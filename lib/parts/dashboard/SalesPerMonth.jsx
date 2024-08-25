import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

import RectangleSkeleton from '../../components/ui/skeletons/RectangleSkeleton';
import DashboardChartCard from '../../components/ui/charts/DashboardChartCard';

import { MODELS } from '../../constants/models';
import AddRingLight from '../../assets/images/Add_ring_light.svg';
import { useAxiosFunction } from '../../hooks/useAxios';
import { getModelChartUrl } from '../../services/getUrl';
import { useFeatures } from '../../hooks/useFeatures';

const SalesPerMonth = ({ isOffersAvailable }) => {
  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  const navigate = useNavigate();
  const { getFeaturePath } = useFeatures();

  const [salesData, setSalesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const monthsToShow = 6;

  const months = [
    { id: 1, name: 'JAN' },
    { id: 2, name: 'FEB' },
    { id: 3, name: 'MAR' },
    { id: 4, name: 'APR' },
    { id: 5, name: 'MAY' },
    { id: 6, name: 'JUN' },
    { id: 7, name: 'JUL' },
    { id: 8, name: 'AUG' },
    { id: 9, name: 'SEP' },
    { id: 10, name: 'OCT' },
    { id: 11, name: 'NOV' },
    { id: 12, name: 'DEC' },
  ];

  const fetchSalesPerMonth = () => {
    moment.locale('en');
    api(
      'POST',
      getModelChartUrl(MODELS.CHART_SALES_PER_MONTH),
      {
        data: {
          fromDate: `${moment()
            .subtract(monthsToShow - 1, 'months')
            .format('YYYY-MM')}-01`,
          toDate: `${moment().format('YYYY-MM-DD')}`,
        },
        fields: ['dataset'],
      },
      res => {
        setIsLoading(false);

        if (res.data.status === 0) {
          let modifiedData = [];

          if (res.data.data.dataset && res.data.data.dataset.length > 0) {
            res.data.data.dataset.forEach(data => {
              const monthId = Number(data._month.split('-')[1]);
              let monthObject = months.find(month => month.id === monthId);

              if (monthObject) {
                modifiedData.push({
                  _month: monthObject.name,
                  ex_tax_total: data.ex_tax_total,
                });
              }
            });

            while (modifiedData.length < monthsToShow) {
              let monthIndex = months.findIndex(month => month.name === modifiedData[0]._month);

              if (monthIndex === 0) {
                monthIndex = 11;
              } else {
                monthIndex = monthIndex - 1;
              }

              modifiedData.unshift({
                _month: months[monthIndex].name,
                ex_tax_total: '0',
              });
            }

            setSalesData([...modifiedData]);
          }
        }
      }
    );
  };

  useEffect(() => {
    fetchSalesPerMonth();
  }, []);

  const data = {
    labels: salesData.map(saleData => t(`MONTHS.${saleData._month}`)),
    datasets: [
      {
        label: t('LBL_TOTAL_SALES'),
        data: salesData.map(saleData => saleData.ex_tax_total),
      },
    ],
  };

  return (
    <div className="col-md-6 d-flex flex-fill">
      {!isLoading && (
        <DashboardChartCard
          title="SALES_OVERVIEW"
          type="BAR"
          data={data}
          btnOptions={{
            text: 'NEW_INVOICE',
            onClick: () => navigate(getFeaturePath('CUSTOMERS_INVOICES', 'add')),
            src: AddRingLight,
            alt: 'add-icon',
          }}
        />
      )}
      {isLoading && <RectangleSkeleton height="800" width={isOffersAvailable ? '1000' : '1200'} />}
    </div>
  );
};

export default SalesPerMonth;
