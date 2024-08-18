import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import DashboardCard from './DashboardCard';

import { MODELS } from '../../../constants/models';
import IncomeIcon from '../../../assets/images/Income-icon.svg';
import { useAxiosFunction } from '../../../hooks/useAxios';
import { getModelChartUrl } from '../../../services/getUrl';
import { alertsActions } from '../../../store/alerts';

function TotalIncome() {
  const { api } = useAxiosFunction();
  const [total, setTotal] = useState(0);
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(true);

  const fetchIncomeAndCharge = () => {
    setIsLoading(true);
    api(
      'POST',
      getModelChartUrl(MODELS.CHART_TOTAL_INCOME),
      {
        data: {},
        fields: ['dataset'],
      },
      res => {
        setIsLoading(false);

        if (res.data.status === 0) {
          if (res.data.data.dataset) {
            let dataset = res.data.data.dataset;
            let totalIncomeObj = dataset.find(record => record.account_type === 9);
            if (totalIncomeObj) setTotal(totalIncomeObj.total);
          }
        } else {
          dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'SOMETHING_WENT_WRONG' }));
        }
      }
    );
  };

  useEffect(() => {
    fetchIncomeAndCharge();
  }, []);
  return (
    <DashboardCard
      toolTipMessage={t('LBL_SALE_DESC')}
      label="LBL_SALES"
      cost={total}
      currency="LBL_SAR_BRIEF"
      imgSrc={IncomeIcon}
      isLoading={isLoading}
    />
  );
}

export default TotalIncome;
