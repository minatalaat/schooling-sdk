import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import NoData from '../../../components/NoData';
import BreadCrumb from '../../../components/ui/BreadCrumb';
import Calendar from '../../../components/ui/Calendar';
import Spinner from '../../../components/Spinner/Spinner';
import PrimaryButton from '../../../components/ui/buttons/PrimaryButton';
import { Pagination, Grid } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import OBPagination from '../../../parts/OBPagination';
import EmptyAccountImg from '../../../assets/images/account-empty.svg';
import OpenbankingToolbar from '../../../parts/openbanking/OpenbankingToolbar';
import OpenBankingNavbar from '../../../parts/openbanking/OpenBankingNavbar';
import OpenbankingCard from '../../../parts/openbanking/OpenbankingCard';
import NoDataAvailable from '../../../components/NoDataAvailable';

import { useFeatures } from '../../../hooks/useFeatures';
import { alertsActions } from '../../../store/alerts';
import { getOBAccountsLinks } from '../../../services/getOBUrl';
import { useAxiosFunctionOB } from '../../../hooks/useAxiosOB';

import 'swiper/css';
import 'swiper/css/grid';
import 'swiper/css/pagination';

function ConnectedAccounts() {
  const feature = 'BANKING';
  const subFeature = 'BANKING_ACCOUNTS';
  const tenantId = useSelector(state => state.userFeatures.companyInfo?.companyInfoProvision?.tenantId);

  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const location = useLocation();
  const { apiOB } = useAxiosFunctionOB();
  const { getFeaturePath } = useFeatures(feature, subFeature);

  const [isLoading, setIsLoading] = useState(false);
  const [windosSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);

  const [accountsLinksState, setAccountsLinksState] = useState([]);
  const [accountsLinksPage, setAccountsLinksPage] = useState(1);
  const [show, setShow] = useState('LBL_CURRENT');
  const [navItems, setNavItems] = useState();
  const alertHandler = (title, message) => dispatch(alertsActions.initiateAlert({ title, message }));

  const getAccountLinks = async () => {
    try {
      setIsLoading(true);
      const getOBAccountsLinksResponse = await apiOB('GET', getOBAccountsLinks(tenantId) + `?page=${accountsLinksPage}`);

      if (getOBAccountsLinksResponse && getOBAccountsLinksResponse.data?.Errors) {
        setIsLoading(false);
        setAccountsLinksState(null);
        return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      } else if (getOBAccountsLinksResponse && getOBAccountsLinksResponse.data?.Meta?.TotalPages === 0) {
        setAccountsLinksState([]);
      } else {
        setAccountsLinksState(getOBAccountsLinksResponse?.data);
        setIsLoading(false);
      }
    } catch (err) {
      setIsLoading(false);
      setAccountsLinksState(null);
      return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    }
  };

  useEffect(() => {
    setIsLoading(true);
    setNavItems([
      {
        title: 'LBL_CURRENT',
        clickHandler: currentClickHanlder,
      },
      {
        title: 'LBL_HISTORY',
        clickHandler: historyClickHanlder,
      },
    ]);
  }, []);

  useEffect(() => {
    const handleWindowResize = () => {
      setWindowSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  });

  const currentClickHanlder = () => {
    setShow('LBL_CURRENT');
  };

  const historyClickHanlder = () => {
    setShow('LBL_HISTORY');
  };

  const handleClick = () => {
    if (location.key !== 'default') return navigate(-1);
    return navigate('/home');
  };

  useEffect(() => {
    getAccountLinks();
  }, [accountsLinksPage]);

  return (
    <>
      {isLoading && <Spinner />}
      {!isLoading && (accountsLinksState?.Data?.AccountsLinks?.length === 0 || accountsLinksState === null) && (
        <NoData
          imgSrc={EmptyAccountImg}
          noDataMessage={t('LBL_NOT_ACCOUNTS_LINKS_MESSAGE')}
          showAdd={false}
          addButtontext={t('LBL_ADD_ACCOUNT_LINK')}
          addButtonPath={getFeaturePath('BANKING_ACCOUNTS', 'add')}
        />
      )}
      {!isLoading && accountsLinksState?.Data?.AccountsLinks && accountsLinksState?.Data?.AccountsLinks?.length > 0 && (
        <div className="page-body">
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-12">
                <Calendar />
                <BreadCrumb
                  feature="BANKING"
                  subFeature="OPEN_BANKING"
                  modeText="LBL_CONNECTED_ACCOUNTS"
                  // moreBreadCrumb={[{ name: id, path: getFeaturePath('CUSTOMERS', 'view', { id }) }]}
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-12 mb-4">
                <div className="info-tite-page">
                  <h4>{t('LBL_OPEN_BANKING_CONNECTED_ACCOUNTS')}</h4>
                  <p className="mb-2">{t('LBL_PROVIDERS_DATA_FROM')}</p>
                </div>
              </div>
            </div>

            {windosSize[0] > 1182 && <OpenbankingToolbar />}

            <div className="card">
              <OpenBankingNavbar navItems={navItems} show={show} />

              <div
                className="tab-content d-block"
                id="Tabbank"
                style={{
                  display: 'none',
                }}
              >
                <div
                  className={show === 'LBL_CURRENT' ? 'tab-pane fade active show' : 'tab-pane fade'}
                  id="tab1"
                  role="tabpanel"
                  aria-labelledby="tab1-tab"
                >
                  <div className="row">
                    <Swiper
                      slidesPerView={windosSize[0] > 550 ? 2 : 1}
                      spaceBetween={30}
                      loopAddBlankSlides={true}
                      pagination={{
                        clickable: true,
                      }}
                      modules={[Grid, Pagination]}
                      className="mySwiper"
                      // grid={{
                      //   rows: 2,
                      //   fill: 'row',
                      // }}
                    >
                      {accountsLinksState &&
                        accountsLinksState?.Data?.AccountsLinks &&
                        accountsLinksState?.Data?.AccountsLinks.length > 0 &&
                        accountsLinksState?.Data?.AccountsLinks.filter(link => link.Status === 'Active')
                          .sort(function (a, b) {
                            return new Date(b.CreationDateTime) - new Date(a.CreationDateTime);
                          })
                          .map(link => {
                            return (
                              <SwiperSlide>
                                <OpenbankingCard link={link} />
                              </SwiperSlide>
                            );
                          })}
                    </Swiper>
                    {accountsLinksState &&
                      accountsLinksState?.Data?.AccountsLinks &&
                      accountsLinksState?.Data?.AccountsLinks.filter(link => link.Status === 'Active').length === 0 && <NoDataAvailable />}
                  </div>
                </div>
                <div
                  className={show === 'LBL_HISTORY' ? 'tab-pane fade active show' : 'tab-pane fade'}
                  id="tab2"
                  role="tabpanel"
                  aria-labelledby="tab2-tab"
                >
                  <div className="row">
                    <Swiper
                      slidesPerView={windosSize[0] > 550 ? 2 : 1}
                      spaceBetween={30}
                      loopAddBlankSlides={true}
                      pagination={{
                        clickable: true,
                      }}
                      modules={[Grid, Pagination]}
                      className="mySwiper"
                      // grid={{
                      //   rows: 2,
                      //   fill: 'row',
                      // }}
                    >
                      {accountsLinksState &&
                        accountsLinksState?.Data?.AccountsLinks &&
                        accountsLinksState?.Data?.AccountsLinks.length > 0 &&
                        accountsLinksState?.Data?.AccountsLinks.sort(function (a, b) {
                          return new Date(b.CreationDateTime) - new Date(a.CreationDateTime);
                        }).map(link => {
                          return (
                            <SwiperSlide>
                              <OpenbankingCard link={link} />
                            </SwiperSlide>
                          );
                        })}
                    </Swiper>
                  </div>
                </div>
                <OBPagination
                  OBPage={accountsLinksPage}
                  setOBPage={setAccountsLinksPage}
                  totalPagesOB={accountsLinksState?.Meta?.TotalPages}
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                <div className="action-page-bank">
                  <PrimaryButton theme="whiteNoBg" onClick={handleClick} />
                  <PrimaryButton
                    theme="blueConnect"
                    text="LBL_CONNECT_ANOTHER_PROVIDER"
                    onClick={() => {
                      navigate(getFeaturePath('BANKING_ACCOUNTS', 'ADD'));
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ConnectedAccounts;
