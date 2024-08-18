import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import i18next from 'i18next';

import Calendar from '../../../components/ui/Calendar';
import BreadCrumb from '../../../components/ui/BreadCrumb';
import Spinner from '../../../components/Spinner/Spinner';
import EditIconBtnHeader from '../../../assets/images/edit-icon-btn-header.svg';
import BuildingBank from '../../../assets/images/building-bank.svg';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import OpenBankingAccordins from '../../../parts/openbanking/OpenBankingAccordins';
import OpenBankingDisconnect from '../../../parts/openbanking/OpenBankingDisconnect';
import DisconnectConfirmationPopup from './DisconnectConfirmationPopUp';
import NoDataAvailable from '../../../components/NoDataAvailable';
import UpdateNickNamePopUp from './UpdateNickNamePopUp';
import OBTermsAndConditions from './OBTermsAndConditions';
import OBPagination from '../../../parts/OBPagination';
import { FaCheckCircle, FaRegTimesCircle } from 'react-icons/fa';

import { useAxiosFunctionOB } from '../../../hooks/useAxiosOB';
import {
  getOBAccountsLinks,
  getDisconnectOBAccountsLink,
  getUpdateNicknameLink,
  getOBAccountsLinkAccountsDetails,
} from '../../../services/getOBUrl';
import { alertsActions } from '../../../store/alerts';
import { accountSubTypesEnum, linkStatusEnum } from '../../../constants/enums/OBEnums';
import { SpinnerCircular } from 'spinners-react';

function ConnectedAccountDetails() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { apiOB } = useAxiosFunctionOB();
  const dispatch = useDispatch();
  const location = useLocation();
  const tenantId = useSelector(state => state.userFeatures.companyInfo?.companyInfoProvision?.tenantId);
  const { id } = useParams();
  const [windosSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);
  const [isLoading, setIsLoading] = useState(true);
  const [accoutLinkDetailsIsLoading, setAccoutLinkDetailsIsLoading] = useState(true);
  const [disconnect, setDisconnect] = useState(false);
  const [currentAccountLink, setCurrentAccountLink] = useState(null);
  const [currentAccountLinkAccountsDetails, setCurrentAccountLinkAccountsDetails] = useState(null);
  const [disconnectResult, setDisconnectResult] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmedPop, setConfirmedPop] = useState(false);
  const [isOBLoading, setIsOBLoading] = useState(false);
  const [enableEdit, setEnableEdit] = useState(false);
  const [nickName, setNickName] = useState(null);
  const [nickNameConfirm, setNickNameConfirm] = useState(false);
  const [isOBNickname, setIsOBNickname] = useState(false);
  const [showOBTermsAndConditions, setShowOBTermsAndConditions] = useState(false);
  const [accountDetailPage, setAccountDetailPage] = useState(1);

  const alertHandler = (title, message) => dispatch(alertsActions.initiateAlert({ title, message }));

  const getAccountLinkDetails = async () => {
    try {
      setIsLoading(true);
      const accountLinkDeatilsReponse = await apiOB('GET', getOBAccountsLinks(tenantId) + `/${id}`);
      if (!accountLinkDeatilsReponse) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      if (accountLinkDeatilsReponse && accountLinkDeatilsReponse.data?.Errors !== undefined) {
        setIsLoading(false);
        return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      }
      setCurrentAccountLink(accountLinkDeatilsReponse?.data?.Data || null);
      setNickName(accountLinkDeatilsReponse?.data?.Data?.FinancialInstitution?.Nickname || null);
      setIsLoading(false);
    } catch (err) {
      setCurrentAccountLink(null);
      setNickName(null);
      setIsLoading(false);
    }
  };

  const getAccountLinkAccountsDetails = async () => {
    try {
      setAccoutLinkDetailsIsLoading(true);
      const accountResponse = await apiOB('GET', getOBAccountsLinkAccountsDetails(tenantId, id) + `?page=${accountDetailPage}`);
      if (accountResponse?.status === 200) {
        setCurrentAccountLinkAccountsDetails(accountResponse?.data);
        setAccoutLinkDetailsIsLoading(false);
      }
    } catch (err) {
      setAccoutLinkDetailsIsLoading(false);
    }
  };

  const handleClick = () => {
    if (location.key !== 'default') return navigate(-1);
    return navigate('/home');
  };

  const disconnectFromOB = async () => {
    try {
      const response = await apiOB('PATCH', getDisconnectOBAccountsLink(tenantId, id));

      if (!response || response?.status !== 200) {
        setIsOBLoading(false);
        setConfirmed(true);
        setConfirmedPop(false);
        setDisconnectResult(false);
        return alertHandler('Error', 'LBL_DISCONNECT_FAIL');
      } else if (response?.status === 200) {
        setIsOBLoading(false);
        setConfirmed(true);
        setConfirmedPop(false);
        setDisconnectResult(true);
        alertHandler('Success', 'LBL_DISCONNECT_COMPLETE');
      }
    } catch (e) {
      setIsOBLoading(false);
      setConfirmed(true);
      setConfirmedPop(false);
      setDisconnectResult(false);
      return alertHandler('Error', 'LBL_DISCONNECT_FAIL');
    }
  };

  const onConfirmClickHandler = async params => {
    setIsOBLoading(true);
    await disconnectFromOB();
  };

  const onCancelHandler = () => {
    setDisconnect(false);
  };

  const onSaveNickNameHandler = async () => {
    setIsOBNickname(true);

    const updateNicknameResponse = await apiOB('PATCH', getUpdateNicknameLink(tenantId, id), {
      Data: {
        FinancialInstitutionNickname: nickName,
      },
    });
    setIsOBNickname(false);
    setNickNameConfirm(false);
    setEnableEdit(false);
    if (updateNicknameResponse?.status !== 200) {
      return alertHandler('Error', t('LBL_UPDATE_NICKNAME_ERROR'));
    }
    getAccountLinkDetails();

    return alertHandler('Success', t('LBL_UPDATE_NICKNAME_SUCCESS'));
  };

  useEffect(() => {
    getAccountLinkDetails();
  }, []);
  useEffect(() => {
    getAccountLinkAccountsDetails();
  }, [accountDetailPage]);
  return (
    <>
      {isLoading && <Spinner />}

      {!isLoading && (
        <div className="page-body">
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-12">
                <Calendar />
                <BreadCrumb
                  feature="BANKING"
                  subFeature="OPEN_BANKING"
                  modeText={
                    i18next.language === 'en'
                      ? currentAccountLink?.FinancialInstitution?.NameEn || ''
                      : currentAccountLink?.FinancialInstitution?.NameAr
                  }
                  // moreBreadCrumb={[{ name: id, path: getFeaturePath('CUSTOMERS', 'view', { id }) }]}
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-12 mb-4">
                <div className="row">
                  <div className="col-md-6">
                    <div className="info-tite-page float-start">
                      {!enableEdit && (
                        <h4>
                          {nickName}
                          <Link to={location.pathname} onClick={() => setEnableEdit(true)}>
                            <img src={EditIconBtnHeader} alt="editIconBtn" />
                          </Link>
                        </h4>
                      )}
                      {enableEdit && (
                        <div className="ob-nickname">
                          <input className="" value={nickName} onChange={event => setNickName(event.target.value)}></input>
                          <FaCheckCircle
                            className="ob-nickname-save-btn"
                            color="#50ad4e"
                            onClick={() => {
                              setNickNameConfirm(true);
                            }}
                          />
                          <FaRegTimesCircle
                            className="ob-nickname-cancel-btn"
                            color="red"
                            onClick={() => {
                              setEnableEdit(false);
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="info-tite-page float-end">
                      <div className={disconnectResult ? 'Revoked' : currentAccountLink?.Status || ''}>
                        <span>{t(disconnectResult ? linkStatusEnum['Revoked'] : linkStatusEnum[currentAccountLink.Status])}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {!confirmed && (
              <div className="card">
                {disconnect && (
                  <div className="alert-info-ob">
                    <div className="alert-icon">
                      <i className="info-alert"></i>
                    </div>
                    <div className="alert-text">
                      <h4>{t('LBL_IMPACT_TO_YOUR_SERVICE')}</h4>
                      <p>
                        {`${t('LBL_ABOUT_TO_DISCONNECT_THESE_ACCOUNTS')} [${
                          i18next.language === 'en'
                            ? currentAccountLink?.FinancialInstitution?.NameEn || ''
                            : currentAccountLink?.FinancialInstitution?.NameAr
                        }]`}
                      </p>
                    </div>
                  </div>
                )}
                <div className="ob-title-section">
                  <h4>{t('LBL_CONNECTED_ACCOUNTS')}</h4>
                </div>

                <div className="row mb-3">
                  {!accoutLinkDetailsIsLoading && (
                    <>
                      {currentAccountLinkAccountsDetails &&
                        currentAccountLinkAccountsDetails?.Data?.Account &&
                        currentAccountLinkAccountsDetails?.Data?.Account?.length > 0 && (
                          <Swiper
                            slidesPerView={windosSize[0] > 1250 ? 3 : windosSize[0] > 500 ? 2 : 1}
                            spaceBetween={30}
                            pagination={{
                              clickable: true,
                            }}
                            modules={[Pagination]}
                            className="mySwiper"
                          >
                            {currentAccountLinkAccountsDetails?.Data?.Account?.map(item => {
                              return (
                                <SwiperSlide key={item}>
                                  <div className="col-md-12">
                                    <div className="card-ca" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                      <img src={BuildingBank} alt="Buildingbank" />
                                      <div class="title-des">
                                        <h5>{t(accountSubTypesEnum[item?.AccountSubType])}</h5>
                                        <p>
                                          {item?.AccountIdentifiers?.filter(identity => identity?.IdentificationType === 'KSAOB.IBAN')[0]
                                            ?.Identification || null}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </SwiperSlide>
                              );
                            })}
                          </Swiper>
                        )}
                      {((currentAccountLinkAccountsDetails &&
                        currentAccountLinkAccountsDetails?.Data?.Account &&
                        currentAccountLinkAccountsDetails?.Data?.Account?.length === 0) ||
                        !currentAccountLinkAccountsDetails) && <NoDataAvailable />}
                    </>
                  )}
                  {accoutLinkDetailsIsLoading && (
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
                  {currentAccountLink && currentAccountLinkAccountsDetails && (
                    <OBPagination
                      OBPage={accountDetailPage}
                      setOBPage={setAccountDetailPage}
                      totalPagesOB={currentAccountLinkAccountsDetails?.Meta?.TotalPages}
                    />
                  )}
                </div>

                <div className="ob-title-section">
                  <h4> {t('LBL_DATA_WE_CAN_GET')}</h4>
                </div>

                <div id="User-banks">
                  <OpenBankingAccordins currentAccountLink={currentAccountLink} disconnect={disconnect} />
                </div>

                {!disconnect && (
                  <>
                    <hr />
                    <div className="data-text-ob">
                      <h5>{t('LBL_HOW_WE_ARE_USING_YOUR_DATA')}</h5>
                      <p>{`${t('LBL_WE_ARE_SHARING_DATA')} ${
                        i18next.language === 'en'
                          ? currentAccountLink?.FinancialInstitution?.NameEn || ''
                          : currentAccountLink?.FinancialInstitution?.NameAr
                      } ${t('LBL_LISTED_ABOVE')}`}</p>
                    </div>
                    <hr />
                    <div className="card-info-ob">
                      <div className="Last-update">
                        <p>
                          <i className="calender-i"></i>
                          <strong>{t('LBL_TRANSACTION_FROM')}</strong>{' '}
                          <span>
                            {moment(currentAccountLink?.TransactionFromDateTime || null)
                              .locale('en')
                              .format('YYYY-MM-DD')}
                          </span>
                        </p>
                        <p>
                          <i className="calender-i"></i>
                          <strong>{t('LBL_EXPIRY_DATE')}</strong>{' '}
                          <span>
                            {' '}
                            {moment(currentAccountLink?.ExpirationDateTime || null)
                              .locale('en')
                              .format('YYYY-MM-DD')}
                          </span>
                        </p>
                      </div>
                    </div>
                  </>
                )}
                {disconnect && (
                  <>
                    <hr />
                    <div className="data-text-ob">
                      <h5>{t('LBL_CLICK_HERE')}</h5>
                      <h5 className="ob-terms-conditions" onClick={() => setShowOBTermsAndConditions(true)}>
                        {t('LBL_TERMS_AND_CONDITIONS')}
                      </h5>
                    </div>

                    <OBTermsAndConditions
                      show={showOBTermsAndConditions}
                      setShow={setShowOBTermsAndConditions}
                      conditions={['LBL_OB_DISCONNECT_TERMS_AND_CONDITIONS_1', 'LBL_OB_DISCONNECT_TERMS_AND_CONDITIONS_1']}
                    />
                  </>
                )}
              </div>
            )}
            {disconnectResult !== null && (
              <OpenBankingDisconnect
                disconnectResult={disconnectResult}
                provider={currentAccountLink?.FinancialInstitution || null}
                tryAgainHandler={onConfirmClickHandler}
              />
            )}
            {nickNameConfirm && (
              <UpdateNickNamePopUp
                onClickHandler={onSaveNickNameHandler}
                onClickHandlerParams={id}
                setConfirmationPopup={setNickNameConfirm}
                onCancelHandler={() => {
                  setNickNameConfirm(false);
                  setEnableEdit(false);
                  setNickName(currentAccountLink?.FinancialInstitution?.Nickname || null);
                }}
                isLoading={isOBNickname}
              />
            )}

            {!confirmed && (
              <div className="row">
                <div className="col-md-12">
                  <div className="action-page-bank">
                    {!disconnect && (
                      <>
                        <button className="btn back-btn" onClick={handleClick}>
                          {t('LBL_BACK')}
                        </button>
                        <button
                          className="btn con-btn"
                          onClick={() => {
                            setDisconnect(true);
                            window.scrollTo(0, 0);
                          }}
                        >
                          {t('LBL_DISCONNECT')}
                        </button>
                      </>
                    )}
                    {disconnect && (
                      <>
                        <button
                          className="btn back-btn"
                          onClick={() => {
                            setDisconnect(false);
                          }}
                        >
                          {t('LBL_CANCEL')}
                        </button>
                        <button
                          className="btn con-btn"
                          onClick={() => {
                            setConfirmedPop(true);
                          }}
                        >
                          {t('LBL_CONFIRM')}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
            {confirmedPop && (
              <DisconnectConfirmationPopup
                onClickHandler={onConfirmClickHandler}
                setConfirmationPopup={setConfirmedPop}
                onCancelHandler={onCancelHandler}
                isLoading={isOBLoading}
                setIsLoading={setIsOBLoading}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default ConnectedAccountDetails;
