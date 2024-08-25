import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import OBNoConnection from '../../../components/OBNoConnection';
import Spinner from '../../../components/Spinner/Spinner';
import AggregatedBalances from './AggregatedBalances';
import OpenBankingAccounts from './OpenBankingAccounts';
import OpenBankingTransactions from './OpenBankingTransactions';

import { getOBProfilesAccounts, getOBAccountTransactions, getOBAggregatedBalances } from '../../../services/getOBUrl';
import { useAxiosFunctionOB } from '../../../hooks/useAxiosOB';

function Banking() {
  const feature = 'BANKING';
  const subFeature = 'BANKING_ACCOUNTS';
  const { apiOB } = useAxiosFunctionOB();
  const [OBAccountsPage, setOBAccountPage] = useState(1);
  const [OBTransactionPage, setOBTransactionPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [balancesState, setBalancesState] = useState(null);
  const [windowSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);
  const [displayedAccounts, setDisplayedAccounts] = useState(null);
  const [transactions, setTransactions] = useState(null);
  const [balancesIsLoading, setBalancesIsLoading] = useState(false);
  const [accountsIsLoading, setAccountsIsLoading] = useState(false);
  const [transactionsIsLoading, setTransactionsIsLoading] = useState(false);

  const OBToken = useSelector(state => state.openBanking.OBToken);
  const tenantId = useSelector(state => state.userFeatures.companyInfo?.companyInfoProvision?.tenantId);

  const OBConnectionFailed = !OBToken;
  // const OBConnectionFailed = false;

  const onGetError = model => {
    setIsLoading(false);
    if (model === 'account') {
      setDisplayedAccounts(null);
      setAccountsIsLoading(false);
    } else if (model === 'transaction') {
      setTransactions(null);
      setTransactionsIsLoading(false);
    } else {
      setBalancesIsLoading(false);
      setBalancesState(null);
    }
  };

  const getAccounts = async () => {
    try {
      setAccountsIsLoading(true);
      const accountsResponse = await apiOB('GET', getOBProfilesAccounts(tenantId) + `?page=${OBAccountsPage}`);
      if (accountsResponse && accountsResponse.data && accountsResponse.data?.Meta?.TotalPages === 0) return onGetError('account');
      setDisplayedAccounts(accountsResponse.data);
      setAccountsIsLoading(false);
      setIsLoading(false);
    } catch (err) {
      return onGetError('account');
    }
  };

  const getAccountTransactions = async () => {
    try {
      setTransactionsIsLoading(true);
      const transactionsResponse = await apiOB('GET', getOBAccountTransactions(tenantId) + `?page=${OBTransactionPage}`);
      if (transactionsResponse && transactionsResponse.data && transactionsResponse?.Meta?.TotalPages?.length === 0)
        onGetError('transaction');
      setTransactions(transactionsResponse.data);
      setTransactionsIsLoading(false);
      setIsLoading(false);
    } catch (err) {
      return onGetError('transaction');
    }
  };

  const getAggregatedBalances = async () => {
    try {
      setBalancesIsLoading(true);
      const aggregatedBalancesResponse = await apiOB('GET', getOBAggregatedBalances(tenantId) + `?page=1`);
      if (
        aggregatedBalancesResponse &&
        aggregatedBalancesResponse.data &&
        aggregatedBalancesResponse.data?.Data?.AggregatedBalances?.length === 0
      ) {
        setBalancesState([]);
        setBalancesIsLoading(false);
        return onGetError('balance');
      }
      setBalancesState(aggregatedBalancesResponse.data?.Data?.AggregatedBalances);
      setBalancesIsLoading(false);
      setIsLoading(false);
    } catch (err) {
      setBalancesState([]);
      setBalancesIsLoading(false);
      return onGetError('balance');
    }
  };

  useEffect(() => {
    if (OBToken) {
      getAggregatedBalances();
    }
  }, [OBToken]);

  useEffect(() => {
    getAccounts();
  }, [OBAccountsPage]);
  useEffect(() => {
    getAccountTransactions();
  }, [OBTransactionPage]);

  useEffect(() => {
    const handleWindowResize = () => {
      setWindowSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  });

  return (
    <>
      {isLoading && <Spinner />}
      {!isLoading && !OBConnectionFailed && (
        <div className="page-body">
          <div className="container-fluid">
            <AggregatedBalances
              title="LBL_AGGREGATED_BALANCES"
              balancesState={balancesState}
              windowSize={windowSize}
              isLoading={balancesIsLoading}
            />
            <OpenBankingAccounts
              feature={feature}
              subFeature={subFeature}
              displayedAccounts={displayedAccounts?.Data?.Account || []}
              windowSize={windowSize}
              addButtonTitle="ADD_PROVIDER"
              page={OBAccountsPage}
              setPage={setOBAccountPage}
              totalPages={displayedAccounts?.Meta?.TotalPages}
              isLoading={accountsIsLoading}
            />
            <OpenBankingTransactions
              transactions={transactions?.Data?.Transaction || []}
              windowSize={windowSize}
              page={OBTransactionPage}
              setPage={setOBTransactionPage}
              totalPages={transactions?.Meta?.TotalPages}
              isLoading={transactionsIsLoading}
            />
          </div>
        </div>
      )}
      {!isLoading && OBConnectionFailed && <OBNoConnection />}
    </>
  );
}

export default Banking;
