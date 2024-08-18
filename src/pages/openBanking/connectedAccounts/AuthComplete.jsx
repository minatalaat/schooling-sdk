import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import i18n from 'i18next';
import crypto from 'crypto-js';

import Spinner from '../../../components/Spinner/Spinner';
import StatusBar from '../../../parts/StatusBar/StatusBar';
import ConsentAccordion from './ConsentAccordion';
import ComponentIcon from '../../../assets/images/Component-icon.svg';
import CheckIcon from '../../../assets/images/check-icon.svg';
import ArrowTbDown from '../../../assets/images/arrow-tb-down.svg';
import PrimaryButton from '../../../components/ui/buttons/PrimaryButton';
import defaultLogo from '../../../assets/images/building-bank.svg';
import OBErrorPopup from '../../../components/OBErrorPopup';

import { useFeatures } from '../../../hooks/useFeatures';
import { removeItem } from '../../../utils/localStorage';
import { useAxiosFunction } from '../../../hooks/useAxios';
import { useAxiosFunctionOB } from '../../../hooks/useAxiosOB';
import { useOBServices } from '../../../services/apis/useOBServices';

const AuthComplete = ({ transactionFromDate, transactionToDate, expiryDate, username }) => {
  const feature = 'BANKING';
  const subFeature = 'BANKING_ACCOUNTS';
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { getFeaturePath } = useFeatures(feature, subFeature);
  const { getCurrentFinancialInstitution, setCurrentAccountsLinkID, setCurrentPSUID, setCurrentAccountsLinkStatus } = useOBServices();

  const queryParams = new URLSearchParams(location.search);
  const AuthorizationResult = queryParams?.get('AuthorizationResult');

  const company = useSelector(state => state.userFeatures.companyInfo.company);
  let selectedFinancialInstitution = getCurrentFinancialInstitution();
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isBalanceShown, setIsBalanceShown] = useState(false);

  let balance = '23,233.33';

  const statusBarItems = [
    {
      label: 'LBL_CONSENT',
      className: 'done',
    },
    {
      label: 'LBL_AUTHENTICATE',
      className: 'done',
    },
    {
      label: 'LBL_COMPLETE',
      className: 'done',
    },
  ];

  const accordionItems = [
    {
      title: 'VIEW_THE_DATA',
      img: ComponentIcon,
      data: ['LBL_ONGOING_ACCESS_CAN_CANCEL'],
    },
  ];

  let institutionName =
    i18n.language === 'en'
      ? selectedFinancialInstitution?.FinancialInstitutionName?.NameEn ?? ''
      : selectedFinancialInstitution?.FinancialInstitutionName?.NameAr ?? '';

  const getDecodedPayload = base64String => {
    if (!base64String) return null;
    let splittedStr = base64String.split('.');
    let encodedPayload = splittedStr[1];
    let words = crypto.enc.Base64.parse(encodedPayload).toString(crypto.enc.Utf8);
    return JSON.parse(words);
  };

  useEffect(() => {
    setIsLoading(true);
    const AuthResultDecoded = getDecodedPayload(AuthorizationResult);
    if (AuthResultDecoded && AuthResultDecoded.AccountsLinkStatus === 'Active') {
      setCurrentAccountsLinkID(AuthResultDecoded.AccountsLinkId);
      setCurrentAccountsLinkStatus(AuthResultDecoded.AccountsLinkStatus);
      setCurrentPSUID(AuthResultDecoded.PSUId);
      setIsError(false);
      setIsLoading(false);
    } else {
      setIsError(true);
      setIsLoading(false);
    }
  }, []);

  return (
    <>
      {isLoading && <Spinner />}
      {!isLoading && (
        <div className="page-body single-account">
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-12">
                <div className="head-section">
                  <div className="title-section-drop mb-4">
                    <p>
                      {company?.name}
                      <Link
                        className={!isBalanceShown ? 'clickable open' : 'clickable'}
                        onClick={() => setIsBalanceShown(!isBalanceShown)}
                        to={{
                          pathname: location.pathname,
                          search: location.search,
                        }}
                        state={location.state}
                      >
                        <img src={ArrowTbDown} alt="arrow-down" />
                      </Link>
                    </p>
                    {isBalanceShown && (
                      <div id="hidden_row-tilte" className="hidden_row">
                        {t('LBL_TOTAL_BALANCE')}: {t('LBL_SAR')} {balance}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {isError && (
              <>
                <OBErrorPopup
                  onClickHandler={() => {
                    setIsError(false);
                    navigate(getFeaturePath(subFeature, 'ADD'));
                  }}
                />
              </>
            )}
            {!isError && (
              <>
                <div className="card head-page">
                  <div className="col-md-6 offset-md-3">
                    <StatusBar items={statusBarItems} />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-12">
                    <div className="card form-steps">
                      <div className="col-md-12">
                        <h4>{t('LBL_THANK_TOU')}</h4>

                        <img className="done-img" src={CheckIcon} alt="check" />

                        <p>{t('WE_RECEIVED_THE_REQUESTED_INFO')}</p>
                      </div>

                      <div className="col-md-6 offset-md-3">
                        <div className="accounts-list">
                          <div className="cel-account-banks">
                            <div className="float-start bank-logo">
                              {!selectedFinancialInstitution?.image && <img src={defaultLogo} alt="BankLogo" style={{ height: '57px' }} />}
                              {selectedFinancialInstitution?.image && <img src={selectedFinancialInstitution?.image} alt="BankLogo" />}
                            </div>
                            <div className="float-start bank-name">
                              <p>{institutionName}</p>
                            </div>
                          </div>

                          <div id="cya-banks">
                            <div className="accordion accordion-flush" id="accordionFlushExample">
                              {accordionItems && accordionItems.map(item => <ConsentAccordion item={item} isComplete={true} />)}
                            </div>
                          </div>
                          <div className="select-list">
                            <PrimaryButton
                              theme="blueOutsideCard"
                              text="LBL_OK"
                              onClick={() => {
                                removeItem('selectedFinancialInstitution');
                                navigate(getFeaturePath(subFeature));
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AuthComplete;
