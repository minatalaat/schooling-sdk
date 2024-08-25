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

const TopProducts = (initView, setMessage, setTitle) => {
  const [topProducts, setTopProducts] = useState([]);

  const { api } = useAxiosFunction();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getFeaturePath } = useFeatures();

  const [isLoading, setIsLoading] = useState(true);

  const fetchTopProducts = () => {
    setIsLoading(true);
    moment.locale('en');
    api(
      'POST',
      getModelChartUrl(MODELS.CHART_TOP_PRODUCTS),
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
              let topProductsSorted = [...res.data.data.dataset];
              topProductsSorted = topProductsSorted.sort((a, b) => Number(b.Total) - Number(a.Total));
              topProductsSorted = topProductsSorted.filter(a => Number(a?.Total) >= 0);
              setTopProducts(topProductsSorted);
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
    fetchTopProducts();
  }, []);
  return (
    <div className="col-xl-6 d-flex flex-fill">
      {!isLoading && (
        <div className="card section-card card-no-border">
          <div className="card-header-q">
            <h5 className="float-start mb-0">
              {t('TOP')} {t('LBL_PRODUCTS')}
            </h5>
            {topProducts.length > 0 && (
              <button type="button" className="see-all-btn float-end" disabled={false} onClick={() => navigate(getFeaturePath('PRODUCTS'))}>
                {t('SEE_ALL')}
              </button>
            )}
          </div>
          <div className="card-body-q pt-0">
            {topProducts.length > 0 &&
              topProducts.map(item => (
                <div className="cel-top-2" key={item.name}>
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
                    {item.Name}
                  </h4>

                  {item.Total && (
                    <p className="float-end up">
                      {formatFloatNumber(item.Total)} {t('LBL_SAR_BRIEF')}
                    </p>
                  )}
                </div>
              ))}
          </div>
          {topProducts.length === 0 && (
            <div>
              <h4 className="text-center pt-5">{t('NO_DATA_AVAILABLE')}</h4>
            </div>
          )}
        </div>
      )}
      {isLoading && <RectangleSkeleton height="250" />}
    </div>
  );
};

export default TopProducts;
