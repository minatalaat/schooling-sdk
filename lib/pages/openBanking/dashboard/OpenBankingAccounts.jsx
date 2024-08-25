import React from 'react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useTranslation } from 'react-i18next';
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import AddIcon from '../../../assets/images/Add-icon.svg';
import AccountCard from '../../../components/AccountCard';

import { useFeatures } from '../../../hooks/useFeatures';

import 'swiper/css';
import 'swiper/css/pagination';
import { SpinnerCircular } from 'spinners-react';
import OBPagination from '../../../parts/OBPagination';

ChartJS.register(ArcElement, Tooltip, Legend);

function OpenBankingAccounts({ feature, subFeature, displayedAccounts, windowSize, addButtonTitle, page, setPage, totalPages, isLoading }) {
  const { getFeaturePath } = useFeatures(feature, subFeature);
  const { t } = useTranslation();
  return (
    <>
      <div className="row">
        <div className="col-md-12 mt-5">
          <div className="titlesection float-start">
            <h5>{t('BANK_ACCOUNTS')}</h5>
          </div>

          <div className="actionesection float-end">
            <Link to={getFeaturePath(subFeature, 'ADD')} className="btn-add-section  text-decoration-none">
              <img src={AddIcon} alt={AddIcon} />
              {t(addButtonTitle)}
            </Link>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          {!isLoading && (
            <>
              {displayedAccounts && displayedAccounts.length > 0 && (
                <>
                  <Swiper
                    slidesPerView={windowSize[0] > 1250 ? 3 : windowSize[0] > 500 ? 2 : 1}
                    spaceBetween={30}
                    pagination={{
                      clickable: true,
                    }}
                    modules={[Pagination]}
                    className="mySwiper"
                  >
                    {displayedAccounts.map(account => {
                      return (
                        <>
                          <SwiperSlide>
                            <div className="col-md-12 flex-fill">
                              <AccountCard account={account} hasSettings={false} />
                            </div>
                          </SwiperSlide>
                        </>
                      );
                    })}
                  </Swiper>
                  <OBPagination OBPage={page} setOBPage={setPage} totalPagesOB={totalPages} />
                </>
              )}
              {displayedAccounts && displayedAccounts.length === 0 && <h4 className="text-center">{t('NO_DATA_AVAILABLE')}</h4>}
            </>
          )}
          {isLoading && (
            <div className="text-center">
              <SpinnerCircular
                size={70}
                thickness={120}
                speed={100}
                color="rgba(31, 79, 222, 1)"
                secondaryColor="rgba(153, 107, 229, 0.19)"
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default OpenBankingAccounts;
