import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { useTranslation } from 'react-i18next';
import { formatFloatNumber } from '../../../utils/helpers';
import { SpinnerCircular } from 'spinners-react';

function AggregatedBalances({ title, balancesState, windowSize, isLoading }) {
  const { t } = useTranslation();
  return (
    <div className="row">
      <div className="col-md-12 mt-3">
        <div className="titlesection float-start">
          <h5>{t(title)}</h5>
        </div>
      </div>
      {!isLoading && <>
        {balancesState && balancesState.length > 0 && (
        <Swiper
          slidesPerView={windowSize[0] > 1250 ? 3 : windowSize[0] > 500 ? 2 : 1}
          spaceBetween={30}
          pagination={{
            clickable: true,
          }}
          modules={[Pagination]}
          className="mySwiper"
        >
          {balancesState &&
            balancesState.length > 0 &&
            balancesState.map(item => {
              return (
                <SwiperSlide>
                  <div className="col-md-12 d-flex flex-fill">
                    <div className="card banking-card card-color-1">
                      <div className="card-header-color-1">
                        <h5 className="float-start mb-0">{t('LBL_TOTAL_BALANCE')}</h5>
                      </div>
                      <div className="card-body-q pt-0">
                        <div className="cel-top-chart float-end"></div>

                        <div className="cel-top-chart float-start">
                          <h1>
                            {formatFloatNumber(item.Amount)} <span>{item.Currency}</span>
                          </h1>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
        </Swiper>
      )}
      {(!balancesState || balancesState.length === 0) && <h4 className="text-center">{t('NO_DATA_AVAILABLE')}</h4>}
      </>}
      {isLoading && (
        <div className="text-center">
          <SpinnerCircular size={70} thickness={120} speed={100} color="rgba(31, 79, 222, 1)" secondaryColor="rgba(153, 107, 229, 0.19)" />
        </div>
      )}
    </div>
  );
}

export default AggregatedBalances;
