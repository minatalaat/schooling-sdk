import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FormikWizard } from 'formik-wizard-form';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { SpinnerCircular } from 'spinners-react';

import PrimaryButton from '../../../../components/ui/buttons/PrimaryButton';
import StatusBar from '../../../../parts/StatusBar/StatusBar';
import Consent from './Consent';
import Authenticate from './Authenticate';
import TransferToPasP from './TransferToPasP';
import AuthComplete from '../AuthComplete';

import { useAxiosFunctionOB } from '../../../../hooks/useAxiosOB';
import { alertsActions } from '../../../../store/alerts';
import { getOBCreateAccountLink, getOBFinancialInstitutions, getOBFinancialInstitutionDataGroups } from '../../../../services/getOBUrl';
import { financialInstitutionsActions } from '../../../../store/financialInstitutions';
import ArrowTbDown from '../../../../assets/images/arrow-tb-down.svg';
import { useOBServices } from '../../../../services/apis/useOBServices';
import { useNavigate } from 'react-router-dom/dist';

const AddAccountLink = () => {
  const location = useLocation();
  const search = location.search;
  const searchParams = new URLSearchParams(search);
  const searchParamsLength = Array.from(searchParams).length;
  const { t } = useTranslation();
  const { apiOB } = useAxiosFunctionOB();
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const {
    getCurrentFinancialInstitution,
    setCurrentFinancialInstitution,
    setCurrentAccountsLinkID,
    setCurrentAccountsLinkStatus,
  } = useOBServices();

  const company = useSelector(state => state.userFeatures.companyInfo.company);
  const tenantId = useSelector(state => state.userFeatures.companyInfo?.companyInfoProvision?.tenantId);
  const selectedFinancialInstitution = useSelector(state => state.financialInstitutions.selectedFinancialInstitution);
  const username = useSelector(state => state.userFeatures.userData.name);

  // get aggregated balance
  let balance = '23,233.33';

  const [isLoading, setIsLoading] = useState(false);
  const [isBalanceShown, setIsBalanceShown] = useState(false);
  const [stepNumber, setStepNumber] = useState(0);
  const stepNames = ['LBL_CONSENT', 'LBL_AUTHENTICATE', 'LBL_AUTHENTICATE', 'LBL_COMPLETE'];

  const firstIndex = 0;
  const authIndex = 1;
  const transferIndex = 2;
  const lastIndex = 3;

  const today = new Date();
  let expiryDate = new Date(today);
  let transactionFromDate = new Date(today.getFullYear(), 0, 1);
  let transactionToDate = new Date(today);
  expiryDate.setDate(today.getDate() + 365);
  transactionToDate.setDate(today.getDate() + 364);

  let statusBarItems = [
    {
      label: stepNames[firstIndex],
      className: stepNumber >= firstIndex ? 'done' : 'default',
    },
    {
      label: stepNames[authIndex],
      className: stepNumber >= authIndex ? 'done' : 'default',
    },
    {
      label: stepNames[lastIndex],
      className: stepNumber >= lastIndex ? 'done' : 'default',
    },
  ];

  const getDataGroups = () => {
    let tempDataGroups = [];
    let tempSelectedFinancialInstitution = getCurrentFinancialInstitution();

    if (tempSelectedFinancialInstitution?.DataGroups) {
      tempSelectedFinancialInstitution.DataGroups.forEach(dataGroup => {
        let tempDataGroup = { Id: dataGroup.DataGroupId };

        if (dataGroup?.Permissions) {
          let tempPermissions = dataGroup?.Permissions.map(permission => permission.PermissionId);
          tempDataGroup.Permissions = tempPermissions || [];
        }

        tempDataGroups.push(tempDataGroup);
      });
    }

    return tempDataGroups;
  };

  const createAccountLinkPayload = () => {
    let tempSelectedFinancialInstitution = getCurrentFinancialInstitution();

    let payload = {
      Data: {
        FinancialInstitutionId: tempSelectedFinancialInstitution?.FinancialInstitutionId,
        SecurityProfile: 'Redirection',
        DataGroups: getDataGroups(),
        PSUId: tenantId,
        UserLoginId: username,
        ExpirationDateTime: expiryDate.toISOString(),
        TransactionFromDateTime: transactionFromDate.toISOString(),
        TransactionToDateTime: transactionToDate.toISOString(),
        AccountType: ['KSAOB.Retail'],
        AccountSubType: ['CurrentAccount'],
        Purpose: ['Account Aggregation'],
      },
    };
    return payload;
  };

  const createAccountLink = async () => {
    try {
      const response = await apiOB('POST', getOBCreateAccountLink(tenantId), createAccountLinkPayload());
      if (!response || !response.data || !response.data.Data)
        return dispatch(alertsActions.initiateAlert({ message: 'LBL_ERROR_CREATING_LINK' }));
      let redirectionURL = response.data.Data.RedirectionURL;
      let AccountsLinkId = response.data.Data.AccountsLinkId;
      let AccountsLinkStatus = response.data.Data.AccountsLinkStatus;
      setCurrentAccountsLinkID(AccountsLinkId);
      setCurrentFinancialInstitution(selectedFinancialInstitution);
      setCurrentAccountsLinkStatus(AccountsLinkStatus);

      if (!redirectionURL || redirectionURL?.length === 0)
        return dispatch(alertsActions.initiateAlert({ message: 'LBL_ERROR_CREATING_LINK' }));
      window.open(redirectionURL);
    } catch (error) {
      dispatch(alertsActions.initiateAlert({ message: 'LBL_ERROR_CREATING_LINK' }));
    }
  };

  useEffect(() => {
    setIsLoading(true);
    dispatch(financialInstitutionsActions.resetAccountsLinkId());
    dispatch(financialInstitutionsActions.resetSelectedFinancialInstitution());
    getFinancialInstitutions();
  }, []);

  const getFinancialInstitutions = async () => {
    const response = await apiOB('GET', getOBFinancialInstitutions(), {}, undefined, onGetInstitutionsError);

    if (!response || response?.status !== 200) {
      setIsLoading(false);
      return dispatch(alertsActions.initiateAlert({ message: 'LBL_ERROR_LOADING_FINANCIAL_INSTITUTIONS' }));
    }

    let data = response.data?.Data?.FinancialInstitution;
    if (data) dispatch(financialInstitutionsActions.setFinancialInstitutions(data));
    setIsLoading(false);
  };

  const onGetInstitutionsError = () => {
    setIsLoading(false);
    dispatch(alertsActions.initiateAlert({ message: 'LBL_ERROR_LOADING_FINANCIAL_INSTITUTIONS' }));
  };

  const getInstitutionDataGroups = async () => {
    try {
      const response = await apiOB('GET', getOBFinancialInstitutionDataGroups(selectedFinancialInstitution?.FinancialInstitutionId));

      if (!response || !response?.data || !response?.data?.Data) {
        setIsLoading(false);
        return dispatch(alertsActions.initiateAlert({ message: 'LBL_ERROR_LOADING_FINANCIAL_INSTITUTIONS' }));
      }

      let tempInstitution = { ...selectedFinancialInstitution };
      tempInstitution.DataGroups = response.data.Data.DataGroups;
      setCurrentFinancialInstitution(tempInstitution);
    } catch (e) {
      return dispatch(alertsActions.initiateAlert({ message: 'LBL_ERROR_LOADING_FINANCIAL_INSTITUTIONS' }));
    }
  };

  return (
    <>
      {searchParamsLength !== 0 && (
        <AuthComplete
          transactionFromDate={transactionFromDate}
          transactionToDate={transactionToDate}
          expiryDate={expiryDate}
          username={username}
        />
      )}
      {searchParamsLength === 0 && (
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

            <div className="card head-page">
              <div className="col-md-6 offset-md-3">
                <StatusBar items={statusBarItems} />
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                  {!isLoading && (
                    <FormikWizard
                      initialValues={{
                        accountProvider: null,
                        accountProviderSelect: '',
                      }}
                      validateOnNext
                      activeStepIndex={firstIndex}
                      steps={[
                        {
                          component: Consent,
                          validationSchema: Yup.object().shape({
                            accountProvider: Yup.object().nullable().required(t('ACCOUNT_PROVIDER_VALIDATION_MESSAGE')),
                          }),
                        },
                        {
                          component: Authenticate,
                        },
                        {
                          component: TransferToPasP,
                        },
                        {
                          component: AuthComplete,
                        },
                      ]}
                    >
                      {({ renderComponent, handlePrev, handleNext, isNextDisabled, isPrevDisabled, isLastStep, currentStepIndex }) => {
                        
                        setStepNumber(currentStepIndex);

                        return (
                          <>
                            {renderComponent()}
                            {currentStepIndex !== transferIndex && (
                              <div className="col-md-6 mx-auto">
                                <div className="action-btn-ob">
                                  <PrimaryButton
                                    theme="whiteOutsideCard"
                                    className="float-start"
                                    onClick={currentStepIndex === firstIndex ? ()=>{ 
                                      navigate(-1)
                                    }:handlePrev}
                                    disabled={currentStepIndex === lastIndex}
                                  />
                                  <PrimaryButton
                                    theme="blueOutsideCard"
                                    className="float-end"
                                    onClick={async e => {
                                      if (currentStepIndex === firstIndex) {
                                        handleNext(e);
                                        if(selectedFinancialInstitution)
                                        await getInstitutionDataGroups();
                                      } else if (currentStepIndex === authIndex) {
                                        handleNext(e);
                                        await createAccountLink();
                                      } else {
                                        handleNext(e);
                                      }
                                    }}
                                    disabled={isNextDisabled}
                                    text={currentStepIndex === lastIndex ? 'LBL_OK' : undefined}
                                  />
                                </div>
                              </div>
                            )}
                          </>
                        );
                      }}
                    </FormikWizard>
                  )}
                  {isLoading && (
                    <div className="card form-steps">
                      <div className="d-flex align-items-center justify-content-center pt-5 pb-5">
                        <SpinnerCircular
                          size={71}
                          thickness={138}
                          speed={100}
                          color="rgba(31, 79, 222, 1)"
                          secondaryColor="rgba(153, 107, 229, 0.19)"
                        />
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddAccountLink;
