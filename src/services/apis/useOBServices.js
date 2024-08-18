import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

import { useAxiosFunctionOB } from '../../hooks/useAxiosOB';
import { openBankingActions } from '../../store/openBanking';
import { financialInstitutionsActions } from '../../store/financialInstitutions';
import { getOBGenerateToken } from '../../services/getOBUrl';
import { setItem, getItem } from '../../utils/localStorage';

export const useOBServices = () => {
  const dispatch = useDispatch();
  const { apiOB } = useAxiosFunctionOB();
  const OBToken = useSelector(state => state.openBanking.OBToken);
  const OBProfileID = useSelector(state => state.openBanking.OBProfileID);
  const tenantId = useSelector(state => state.userFeatures.companyInfo?.companyInfoProvision?.tenantId);
  const selectedFinancialInstitution = useSelector(state => state.financialInstitutions.selectedFinancialInstitution);
  const accountsLinkId = useSelector(state => state.financialInstitutions.accountsLinkId);

  let NO_DATA_FOUND_CODES = ['NTSP.ERROR.400.023', 'NTSP.ERROR.400.010', 'NTSP.ERROR.400.007'];

  const getGenerateTokenParams = () => {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', import.meta.env.VITE_OB_CLIENT_ID);
    params.append('client_secret', import.meta.env.VITE_OB_CLIENT_SECRET);
    params.append('scope', 'single_api');
    return params;
  };

  const generateTokenService = async ({ onError = () => {} }) => {
    if (!OBToken || OBToken?.length === 0) {
      try {
        let contentType = 'application/x-www-form-urlencoded';
        const response = await apiOB('POST', getOBGenerateToken(), getGenerateTokenParams(), undefined, undefined, contentType);
        if (!response || !response?.data || !response?.data?.access_token) return null;
        let tempOBToken = response?.data?.access_token;
        dispatch(openBankingActions.setOBToken(tempOBToken));
        return tempOBToken;
      } catch (error) {
        onError();
        return null;
      }
    } else return OBToken;
  };

  const getOBToken = () => OBToken;

  const getCurrentFinancialInstitution = () => {
    return selectedFinancialInstitution ?? JSON.parse(getItem('selectedFinancialInstitution'));
  };

  const setCurrentFinancialInstitution = selectedFinancialInstitution => {
    setItem('selectedFinancialInstitution', JSON.stringify(selectedFinancialInstitution));
    dispatch(financialInstitutionsActions.setSelectedFinancialInstitution(selectedFinancialInstitution));
  };

  const getCurrentPSUID = () => {
    return tenantId ?? getItem('PSUId');
  };

  const setCurrentPSUID = PSUId => {
    setItem('PSUId', PSUId);
  };

  const getCurrentProfileID = () => {
    return OBProfileID ?? getItem('OBProfileID');
  };

  const setCurrentProfileID = ProfileID => {
    setItem('OBProfileID', ProfileID);
    dispatch(openBankingActions.setOBProfileID(ProfileID));
  };

  const getCurrentAccountsLinkID = () => {
    return accountsLinkId ?? getItem('AccountsLinkID');
  };

  const setCurrentAccountsLinkID = AccountsLinkID => {
    setItem('AccountsLinkID', AccountsLinkID);
    dispatch(financialInstitutionsActions.setAccountsLinkId(AccountsLinkID));
  };

  const setCurrentAccountsLinkStatus = AccountsLinkStatus => {
    setItem('AccountsLinkStatus', AccountsLinkStatus);
  };

  const getCurrentAccountsLinkStatus = () => {
    return getItem('AccountsLinkStatus');
  };

  const getTransactionFromDate = () => {
    const today = new Date();

    if (selectedFinancialInstitution?.transactionFromDateTime) {
      let fromDate = new Date(selectedFinancialInstitution?.transactionFromDateTime);
      return moment(fromDate);
    } else return moment(today);
  };

  const getTransactionToDate = () => {
    const today = new Date();
    let expiryDate = new Date(today);
    expiryDate.setDate(today.getDate() + 365);

    if (selectedFinancialInstitution?.transactionToDateTime) {
      let toDate = new Date(selectedFinancialInstitution?.transactionToDateTime);
      return moment(toDate);
    } else return expiryDate;
  };

  const getExpirationDate = () => {
    const today = new Date();
    let expiryDate = new Date(today);
    expiryDate.setDate(today.getDate() + 365);

    if (selectedFinancialInstitution?.ExpirationDateTime) {
      let toDate = new Date(selectedFinancialInstitution?.ExpirationDateTime);
      return moment(toDate);
    } else return expiryDate;
  };

  return {
    generateTokenService,
    getOBToken,
    getCurrentFinancialInstitution,
    setCurrentFinancialInstitution,
    getCurrentPSUID,
    setCurrentPSUID,
    getCurrentProfileID,
    setCurrentProfileID,
    getCurrentAccountsLinkID,
    setCurrentAccountsLinkID,
    getCurrentAccountsLinkStatus,
    setCurrentAccountsLinkStatus,
    getTransactionFromDate,
    getTransactionToDate,
    getExpirationDate,
  };
};
