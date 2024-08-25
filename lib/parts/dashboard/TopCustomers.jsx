import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import RectangleSkeleton from '../../components/ui/skeletons/RectangleSkeleton';

import { MODELS } from '../../constants/models';
import StachFrameFill from '../../assets/images/Stackframe_fill.svg';
import { formatFloatNumber } from '../../utils/helpers';
import { useAxiosFunction } from '../../hooks/useAxios';
import { getModelChartUrl } from '../../services/getUrl';
import { useFeatures } from '../../hooks/useFeatures';
import { getItem } from '../../utils/localStorage';

const TopCustomers = (initView, setMessage, setTitle) => {
  const [topCustomers, setTopCustomers] = useState([]);

  const { api } = useAxiosFunction();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getFeaturePath } = useFeatures();

  const [isLoading, setIsLoading] = useState(true);

  const fetchTopCustomers = () => {
    setIsLoading(true);
    api(
      'POST',
      getModelChartUrl(MODELS.CHART_TOP_CUSTOMERS),
      {
        data: {
          date: `${moment().year()}`,
          num: 5,
        },
        fields: ['dataset'],
      },
      res => {
        setIsLoading(false);

        if (res.data.status === 0) {
          if (res.data.data) {
            if (res.data.data.dataset.length > 0) {
              let topCustomersSorted = [...res.data.data.dataset];
              topCustomersSorted = topCustomersSorted.sort((a, b) => Number(b['Total Amount']) - Number(a['Total Amount']));
              setTopCustomers(topCustomersSorted);
            }
          }
        } else {
          initView(true);
          setTitle('Error');
          setMessage(t('SOMETHING_WENT_WRONG'));
        }
      }
    );
  };

  useEffect(() => {
    fetchTopCustomers();
  }, []);
  return (
    <div className="col-xl-6 d-flex flex-fill">
      {!isLoading && (
        <div className="card section-card card-no-border">
          <div className="card-header-q">
            <h5 className="float-start mb-0">
              {t('TOP')} {t('CUSTOMERS')}
            </h5>
            {topCustomers.length > 0 && (
              <button
                type="button"
                className="see-all-btn float-end"
                disabled={false}
                onClick={() => navigate(getFeaturePath('CUSTOMERS'))}
              >
                {t('SEE_ALL')}
              </button>
            )}
          </div>
          <div className="card-body-q pt-0">
            {topCustomers.length > 0 &&
              topCustomers.map(customer => (
                <div className="cel-top-2" key={customer['Customer Name']}>
                  <h4 className="float-start">
                    <img
                      src={StachFrameFill}
                      alt={StachFrameFill}
                      style={
                        getItem('code') === 'ar'
                          ? { transform: 'rotate(180deg)', transitionProperty: 'transform' }
                          : { transform: 'rotate(0deg)', transitionProperty: 'transform' }
                      }
                    />
                    {customer['Customer Name']}
                  </h4>
                  <p className="float-end up">
                    {formatFloatNumber(customer['Total Amount'])} {t('LBL_SAR_BRIEF')}
                  </p>
                </div>
              ))}
            {topCustomers.length === 0 && (
              <div>
                <h4 className="text-center pt-5">{t('NO_DATA_AVAILABLE')}</h4>
              </div>
            )}
          </div>
        </div>
      )}
      {isLoading && <RectangleSkeleton height="250" />}
    </div>
  );
};

export default TopCustomers;
