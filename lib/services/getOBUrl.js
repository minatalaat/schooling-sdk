import { OB_REST_ENDPOINTS } from '../constants/rest';

export const getOBGenerateToken = () => {
  return import.meta.env.VITE_OB_URL + OB_REST_ENDPOINTS.OBAUTH;
};

export const getOBFinancialInstitutions = () => {
  return import.meta.env.VITE_OB_URL + OB_REST_ENDPOINTS.FINANCIAL_INSTITUTION;
};

export const getOBProfile = () => {
  return import.meta.env.VITE_OB_URL + OB_REST_ENDPOINTS.OBPSUSERS + OB_REST_ENDPOINTS.PROFILES;
};

export const getOBCreateAccountLink = tenantId => {
  // {{TPP_Inbound}}/client-managed-profiles/v1/psusers/{{psuId}}/profiles/{{profileId}}/accounts-links
  return import.meta.env.VITE_OB_URL + getOBProfileIDPath(tenantId) + OB_REST_ENDPOINTS.ACCOUNTS_LINKS;
};

export const getUpdateOBAccountsLink = (psuId, accountsLinkId) => {
  //{{TPP_Inbound}}/client-managed-profiles/v1/psusers/{{psuId}}/profiles/{{profileId}}/accounts-links/{{accountsLinkId}}?action=Update
  return getOBCreateAccountLink(psuId) + '/' + accountsLinkId + '?action=Update';
};

export const getDisconnectOBAccountsLink = (psuId, accountsLinkId) => {
  //{{TPP_Inbound}}/client-managed-profiles/v1/psusers/{{psuId}}/profiles/{{profileId}}/accounts-links/{{accountsLinkId}}?action=Revoke
  return (
    import.meta.env.VITE_OB_URL +
    OB_REST_ENDPOINTS.SELF_MANAGED_PROFILES +
    OB_REST_ENDPOINTS.PSU_USERS +
    `/${psuId}/` +
    OB_REST_ENDPOINTS.PROFILES +
    OB_REST_ENDPOINTS.ACCOUNTS_LINKS +
    `/${accountsLinkId}` +
    '?action=Revoke'
  );
};

export const getOBProfileActivation = tenantId => {
  // {{TPP_Inbound}}/client-managed-profiles/v1/psusers/{{psuId}}/profiles/{{profileId}}/activate
  return import.meta.env.VITE_OB_URL + getOBProfileIDPath(tenantId) + OB_REST_ENDPOINTS.ACTIVATE;
};

export const getOBProfileIDPath = tenantId => {
  //{{TPP_Inbound}}/client-managed-profiles/v1/psusers/{{psuId}}/profiles/{{profileId}}
  return OB_REST_ENDPOINTS.SELF_MANAGED_PROFILES + OB_REST_ENDPOINTS.PSU_USERS + tenantId + '/' + OB_REST_ENDPOINTS.PROFILES;
};

export const getOBProfilesByPSUId = tenantId => {
  //{{TPP_Inbound}}/client-managed-profiles/v1/psusers/{{psuId}}/profiles/{{profileId}}
  // {{TPP_Inbound}}/client-managed-profiles/v1/psusers/{{psuId}}/profiles?page=1&maxRecords=20
  return import.meta.env.VITE_OB_URL + OB_REST_ENDPOINTS.OBPSUSERS + tenantId + '/' + OB_REST_ENDPOINTS.PROFILES + '?page=1&maxRecords=20';
};

export const getOBPSUAccounts = (psuId, accountsLinkId) => {
  //{{TPP_Inbound}}/profile-accounts-information/v1/psusers/{{psuId}}/accounts-links/{{accountsLinkId}}/accounts?page=1
  return (
    import.meta.env.VITE_OB_URL +
    OB_REST_ENDPOINTS.PROFILE_ACCOUNTS_INFO +
    OB_REST_ENDPOINTS.PSU_USERS +
    psuId.toString() +
    '/' +
    OB_REST_ENDPOINTS.ACCOUNTS_LINKS +
    '/' +
    accountsLinkId.toString() +
    OB_REST_ENDPOINTS.ACCOUNTS
  );
};

export const getOBProfilesAccounts = psuId => {
  return (
    import.meta.env.VITE_OB_URL +
    OB_REST_ENDPOINTS.PROFILE_ACCOUNTS_INFO +
    OB_REST_ENDPOINTS.PSU_USERS +
    psuId +
    '/' +
    OB_REST_ENDPOINTS.PROFILES +
    OB_REST_ENDPOINTS.ACCOUNTS
  );
};

export const getOBAccountsLinks = tenantId => {
  return (
    import.meta.env.VITE_OB_URL +
    OB_REST_ENDPOINTS.SELF_MANAGED_PROFILES +
    OB_REST_ENDPOINTS.PSU_USERS +
    tenantId +
    '/' +
    OB_REST_ENDPOINTS.PROFILES +
    OB_REST_ENDPOINTS.ACCOUNTS_LINKS
  );
};

export const getOBAccountsLinkAccountsDetails = (tenantId, accountLinkId) => {
  return (
    import.meta.env.VITE_OB_URL +
    OB_REST_ENDPOINTS.PROFILE_ACCOUNTS_INFO +
    OB_REST_ENDPOINTS.PSU_USERS +
    tenantId +
    '/' +
    OB_REST_ENDPOINTS.ACCOUNTS_LINKS +
    `/${accountLinkId}/` +
    OB_REST_ENDPOINTS.ACCOUNTS
  );
};

export const getOBAccountTransactions = psuId => {
  return (
    import.meta.env.VITE_OB_URL +
    OB_REST_ENDPOINTS.PROFILE_ACCOUNTS_INFO +
    OB_REST_ENDPOINTS.PSU_USERS +
    psuId +
    '/' +
    OB_REST_ENDPOINTS.PROFILES +
    OB_REST_ENDPOINTS.TRANSACTIONS
  );
};

export const getOBAggregatedBalances = psuId => {
  return (
    import.meta.env.VITE_OB_URL +
    OB_REST_ENDPOINTS.PROFILE_ACCOUNTS_INFO +
    OB_REST_ENDPOINTS.PSU_USERS +
    psuId +
    '/' +
    OB_REST_ENDPOINTS.PROFILES +
    OB_REST_ENDPOINTS.BALANCES
  );
};

export const getOBFinancialInstitutionDataGroups = FinancialInstitutionId => {
  //{{TPP_Inbound}}/financial-institutions-information/v1/financial-institutions/:FinancialInstitutionId/data-groups
  return (
    import.meta.env.VITE_OB_URL +
    OB_REST_ENDPOINTS.FINANCIAL_INSTITUTION +
    '/' +
    FinancialInstitutionId +
    OB_REST_ENDPOINTS.FINANCIAL_INSTITUTION_DATA_GROUPS
  );
};

export const getUpdateNicknameLink = (tenantId, linkId) => {
  ///psusers/{PSUID}/profiles/accounts-links/{AccountsLinkId}/financial-institution-nickname
  return (
    import.meta.env.VITE_OB_URL +
    OB_REST_ENDPOINTS.SELF_MANAGED_PROFILES +
    OB_REST_ENDPOINTS.PSU_USERS +
    tenantId +
    '/' +
    OB_REST_ENDPOINTS.PROFILES +
    OB_REST_ENDPOINTS.ACCOUNTS_LINKS +
    `/${linkId}` +
    OB_REST_ENDPOINTS.NICKNAME
  );
};
