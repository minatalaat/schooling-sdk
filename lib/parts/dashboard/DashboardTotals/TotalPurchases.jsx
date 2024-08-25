import { useEffect, useState } from 'react';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import DashboardCard from './DashboardCard';

import { MODELS } from '../../../constants/models';
import PurchaseIcon from '../../../assets/images/Purchase-icon.svg';
import { useAxiosFunction } from '../../../hooks/useAxios';
import { getModelChartUrl } from '../../../services/getUrl';
import { alertsActions } from '../../../store/alerts';

function TotalPurchases() {
  const { api } = useAxiosFunction();
  const [total, setTotal] = useState(0);
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(true);

  const fetchPurchases = () => {
    setIsLoading(true);
    moment.locale('en');
    api(
      'POST',
      getModelChartUrl(MODELS.CHART_TOTAL_PURCHASE),
      {
        data: {
          /* _id: null, */
          todayDate: `${moment().format('YYYY-MM-DD')}`,
          fromDate: `${moment().subtract(1, 'years').format('YYYY-MM-DD')}`,
          toDate: `${moment().format('YYYY-MM-DD')}`,
          /* 					monthSelect: 12,
           */ /* _parent: {
						_id: null,
					}, */
          _domainAction: 'dashlet.invoice.purchase.amount.by.month',
        },
        fields: ['dataset'],
      },
      res => {
        setIsLoading(false);

        if (res.data.status === 0) {
          if (res.data.data.dataset[0].total_purchase) {
            setTotal(res.data.data.dataset[0].total_purchase);
          }
        } else {
          dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'SOMETHING_WENT_WRONG' }));
        }
      }
    );
  };

  useEffect(() => {
    fetchPurchases();
  }, []);
  return (
    <>
      {/* <div className='row'>
				<div className='col-md-12'>
					<select
						className='form-select select-1 float-end mb-3 col-1'
						disabled='true'>
						{DateOptions &&
							DateOptions.map((date) => (
								<option value={date.value}>{date.name}</option>
							))}
					</select>
				</div> 
			</div> */}

      <DashboardCard
        toolTipMessage={t('LBL_PURCHASE_DESC')}
        label="PURCHASE"
        cost={total}
        currency="LBL_SAR_BRIEF"
        imgSrc={PurchaseIcon}
        isLoading={isLoading}
      />
    </>
  );
}

export default TotalPurchases;
