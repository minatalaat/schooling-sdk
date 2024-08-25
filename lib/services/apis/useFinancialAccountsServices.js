import { MODELS } from '../../constants/models';
import { useMainAxelorServices } from './useMainAxelorServices';

export const useFinancialAccountsServices = () => {
  const { fetchService, actionService, saveService } = useMainAxelorServices();

  const fetchFinancialAccountService = async id => {
    const payload = {
      fields: [
        'analyticDistributionRequiredOnInvoiceLines',
        'serviceType',
        'code',
        'isTaxRequiredOnMoveLine',
        'accountType',
        'reconcileOk',
        'useForPartnerBalance',
        'analyticDistributionAuthorized',
        'parentAccount',
        'analyticDistributionRequiredOnMoveLines',
        'statusSelect',
        'commonPosition',
        'isTaxAuthorizedOnMoveLine',
        'name',
        'defaultTax',
        'company',
        'compatibleAccountSet',
        'analyticDistributionTemplate',
        'label',
      ],
      related: {
        analyticDistributionTemplate: ['name', 'company', 'analyticDistributionLineList'],
        compatibleAccountSet: ['label'],
      },
    };
    return await fetchService(MODELS.ACCOUNT, id, payload);
  };

  const fetchAccountBalanceService = async accountData => {
    const payload = {
      action: 'action-account-opening-balance',
      data: {
        accountId: accountData?.id,
      },
    };
    return await actionService(payload);
  };

  const saveFinancialAccountService = async payload => {
    return await saveService(MODELS.ACCOUNT, payload);
  };

  return { fetchFinancialAccountService, fetchAccountBalanceService, saveFinancialAccountService };
};
