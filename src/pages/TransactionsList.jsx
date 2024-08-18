import { useEffect, useState } from 'react';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import BackButton from '../components/ui/buttons/BackButton';
import Toolbar from '../parts/Toolbar';
import MoreAction from '../parts/MoreAction';
import Table from '../components/ListingTable/Table';
import TableRow from '../components/ListingTable/TableRow';
import CardsList from '../components/CardsList/CardsList';
import Card from '../components/CardsList/Card';
import StatementsCard from '../components/TotalsCards/StatementsCard';

import { MODELS } from '../constants/models';
import { useAxiosFunction } from '../hooks/useAxios';
import { getActionUrl } from '../services/getUrl';

function TransactionsList({ showBack, formik, isRun, setIsRun, type, setActionInProgress }) {
  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  const [windosSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);

  const [show, setShow] = useState('table');
  const [moves, setMoves] = useState(null);
  const [displayedMoves, setDisplayedMoves] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [total, setTotal] = useState(0);
  let currentPage = parseInt(searchParams.get('currentPage') || 1);
  let pageSize = parseInt(searchParams.get('pageSize') || 10);
  let offset = (currentPage - 1) * pageSize;

  const [showMoreAction, setShowMoreAction] = useState(false);

  const fields = [
    { accessor: 'transactionNumber', Header: t('LBL_TRANSACTION_NUMBER'), type: 'text' },
    { accessor: 'type', Header: t('LBL_TYPE'), type: 'text' },
    { accessor: 'date', Header: t('LBL_POSTING_DATE'), type: 'text' },
    { accessor: 'accountingDate', Header: t('LBL_TRANSACTION_DATE'), type: 'text' },
    {
      accessor: 'debit',
      Header: t('LBL_DEBIT'),
      type: 'number',
    },
    {
      accessor: 'credit',
      Header: t('LBL_CREDIT'),
      type: 'number',
    },
    {
      accessor: 'calculatedBalance',
      Header: t('LBL_CUMULATIVE_BALANCE'),
      type: 'number',
    },
  ];

  const subTitles = [
    { label: 'LBL_TRANSACTION_NUMBER', key: 'transactionNumber' },
    { label: 'LBL_DEBIT', key: 'debit', type: 'number' },
    { label: 'LBL_CREDIT', key: 'credit', type: 'number' },
    { label: 'LBL_CUMULATIVE_BALANCE', key: 'cumulativeBalance', type: 'number' },
  ];

  const onTransactionsSearchSuccess = response => {
    if (response.data.status === 0) {
      let data = response?.data?.data || null;
      setActionInProgress(false);
      setIsRun(false);

      if (data) {
        setTotal(data.length);

        let moveCopy = [];

        data.forEach(move => {
          let temp = {};
          temp.transactionNumber = move?.transactionNumber ?? '';
          temp.type = move?.journalName ?? '';
          temp.date = move?.dateVal ?? '';
          temp.accountingDate = move?.accountingDate ?? '';
          temp.debit = move?.debit ?? '';
          temp.credit = move?.credit ?? '';
          temp.calculatedBalance = move?.calculatedBalance ?? '';
          temp.openingBalance = move?.openingBalance ?? '';
          moveCopy.push(temp);
        });
        setMoves(moveCopy);
      } else {
        setMoves(null);
      }
    } else {
      setMoves(null);
    }
  };

  useEffect(() => {
    if (isRun) {
      let payload =
        type !== 'account'
          ? {
              action: 'action-transaction-statement-chart',
              data: {},
            }
          : {
              action: 'action-transaction-statement-account-chart',
              data: {},
            };

      if (formik.values.account) {
        payload.data = {
          ...payload.data,
          accountId: formik?.values?.account?.id || null,
        };
      }

      if (formik.values.partner) {
        payload.data = {
          ...payload.data,
          partnerId: formik?.values?.partner?.id || null,
          partnerType: type === 'customer' ? 1 : 2,
        };
      }

      if (formik.values.fromDate) {
        payload.data = {
          ...payload.data,
          dateFrom: moment(formik?.values?.fromDate || null)
            .locale('en')
            .format('YYYY-MM-DD'),
        };
      }

      if (formik.values.toDate) {
        payload.data = {
          ...payload.data,
          dateTo: moment(formik?.values?.toDate || null)
            .locale('en')
            .format('YYYY-MM-DD'),
        };
      }

      if (type !== 'account') {
        api('POST', getActionUrl(), payload, onTransactionsSearchSuccess);
      } else if (type === 'account') {
        api('POST', getActionUrl(), payload, onTransactionsSearchSuccess);
      } else {
        setActionInProgress(false);
        setIsRun(false);
      }
    }
  }, [isRun]);

  useEffect(() => {
    const handleWindowResize = () => {
      setWindowSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  });

  useEffect(() => {
    if (moves && moves.length > 0) {
      let movesCopy = [];

      for (let i = offset; i <= offset + pageSize; i++) {
        if (moves[i]) movesCopy.push(moves[i]);
      }

      if (movesCopy && movesCopy.length > 0) {
        setDisplayedMoves(movesCopy);
      } else {
        setDisplayedMoves(null);
      }
    } else {
      setDisplayedMoves(null);
    }
  }, [moves, offset, pageSize]);

  return (
    <>
      {showMoreAction && (
        <MoreAction
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          bulkActionConfig={{
            isExport: true,
            isImport: false,
            modelsEnumKey: 'TRANSACTIONS',
          }}
        />
      )}

      <div className="row">
        <div className="col-md-12 mb-4">
          <div className="info-tite-page float-start">
            <h4>{t('LBL_TRANSACTIONS')}</h4>
          </div>
          {showBack && (
            <div className="reverse-page float-end">
              <BackButton />
            </div>
          )}
        </div>
        <div className="col-md-12">
          {windosSize[0] > 1200 && (
            <Toolbar
              show={show}
              setShow={setShow}
              refreshData={null}
              setShowMoreAction={null}
              canSelectAll={false}
              searchPayload={null}
              showSearch={false}
              showMoreAction={false}
            />
          )}

          {displayedMoves && (
            <StatementsCard
              openingBalance={moves?.[0]?.openingBalance || null}
              closingBalance={moves?.[moves?.length - 1]?.calculatedBalance || null}
            />
          )}
          {show === 'table' && windosSize[0] > 1200 && (
            <Table fields={fields} data={moves} total={total} hasBulkActions={false}>
              {displayedMoves &&
                displayedMoves.length > 0 &&
                displayedMoves.map(record => {
                  return (
                    <TableRow
                      key={record.id}
                      record={record}
                      fields={fields}
                      deleteModel={MODELS.MOVE}
                      setActionInProgress={setActionInProgress}
                      isEditable={false}
                      isDeletable={false}
                      isViewable={false}
                      hasBulkActions={false}
                    />
                  );
                })}
            </Table>
          )}
          {(show === 'card' || windosSize[0] <= 1200) && (
            <CardsList total={total}>
              {displayedMoves &&
                displayedMoves.length > 0 &&
                displayedMoves.map(record => {
                  return (
                    <Card
                      key={record.id}
                      record={record}
                      title="name"
                      subTitles={subTitles}
                      deleteModel={MODELS.MOVE}
                      setActionInProgress={setActionInProgress}
                      label1={{ value: record.status }}
                      isEditable={false}
                      isDeletable={false}
                      isViewable={false}
                      hasBulkActions={false}
                    />
                  );
                })}
            </CardsList>
          )}
        </div>
      </div>
    </>
  );
}

export default TransactionsList;
