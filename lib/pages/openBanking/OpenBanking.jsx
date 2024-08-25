import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import Calendar from '../../components/ui/Calendar';
import OBServiceCard from '../../components/OBServiceCard';
import BreadCrumb from '../../components/ui/BreadCrumb';
import Spinner from '../../components/Spinner/Spinner';
import OBNoConnection from '../../components/OBNoConnection';

import OBImg from '../../assets/images/open-bank.svg';
import OBCONImg from '../../assets/images/open-bank-con.svg';
import { useFeatures } from '../../hooks/useFeatures';

function OpenBanking() {
  const feature = 'BANKING';
  const subFeature = 'OPEN_BANKING';

  const { t } = useTranslation();
  const { getFeaturePath } = useFeatures();

  const OBToken = useSelector(state => state.openBanking.OBToken);
  const OBConnectionFailed = !OBToken;

  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      {isLoading && <Spinner />}
      {!isLoading && !OBConnectionFailed && (
        <div className="page-body">
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-12">
                <Calendar />

                <BreadCrumb feature={feature} subFeature={subFeature} />
              </div>
            </div>

            <div className="row">
              <div className="col-md-12 mb-4">
                <div className="info-tite-page">
                  <h4>{t('LBL_OPENBANKING_CONNECTIONS')}</h4>
                  <p>{t('LBL_OPENBANKING_CONNECTIONS_DASHBOARD')}</p>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <OBServiceCard
                  to={getFeaturePath('BANKING_ACCOUNTS')}
                  img={OBImg}
                  title="LBL_OB_CONNECTED_ACCOUNTS"
                  desc="LBL_OB_CONNECTED_ACCOUNTS_DESC"
                  className="card-border-primary"
                />
              </div>

              <div className="col-md-6">
                <OBServiceCard
                  //   to={getFeaturePath('BANKING_DASHBOARD')}
                  img={OBCONImg}
                  title="LBL_OB_CONNECTED_SERVICES"
                  desc="LBL_OB_CONNECTED_SERVICES_DESC"
                  className="card-border-secondary"
                />
              </div>
            </div>
          </div>
        </div>
      )}
      {!isLoading && OBConnectionFailed && <OBNoConnection />}
    </>
  );
}

export default OpenBanking;
