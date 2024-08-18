import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import Table from '../../components/ListingTable/Table';
import TableRow from '../../components/ListingTable/TableRow';
import CardsList from '../../components/CardsList/CardsList';
import Card from '../../components/CardsList/Card';
import Spinner from '../../components/Spinner/Spinner';
import BreadCrumb from '../../components/ui/BreadCrumb';
import MoreAction from '../../parts/MoreAction';
import NoData from '../../components/NoData';
import Toolbar from '../../parts/Toolbar';
import Calendar from '../../components/ui/Calendar';

import { useAxiosFunction } from '../../hooks/useAxios';
import { MODELS } from '../../constants/models';
import { formatFloatNumber } from '../../utils/helpers';
import { getSearchUrl } from '../../services/getUrl';
import { useFeatures } from '../../hooks/useFeatures';
import { PAYMENTS_SEARCH_FIELDS } from './PaymentsPayloadsFields';
import { alertsActions } from '../../store/alerts';

import NoIncomingPaymentsImg from '../../assets/images/icons/Incoming payments.svg';

const IncomingPayments = ({ feature, subFeature }) => {
  const { api } = useAxiosFunction();
  const { canAdd } = useFeatures(feature, subFeature);
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(true);
  const [incomingPayments, setIncomingPayments] = useState([]);
  const [displayedPayments, setDisplayedPayments] = useState([]);

  const [show, setShow] = useState('table');
  const { t } = useTranslation();

  const [total, setTotal] = useState(0);
  let searchValue = searchParams.get('search') || '';
  let currentPage = parseInt(searchParams.get('currentPage') || 1);
  let pageSize = parseInt(searchParams.get('pageSize') || 10);
  let offset = (currentPage - 1) * pageSize;

  const [windowSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);
  const [showMoreAction, setShowMoreAction] = useState(false);

  const searchPayload = {
    fields: PAYMENTS_SEARCH_FIELDS,
    sortBy: ['-paymentDate'],
    data: {
      _domain: 'self.invoice.paymentMode.inOutSelect = 1  AND self.paymentMode is not null',
    },
    limit: pageSize,
    offset: offset,
    translate: true,
  };

  const searchPayloadwithValue = {
    fields: PAYMENTS_SEARCH_FIELDS,
    sortBy: ['-paymentDate'],
    data: {
      _domain: 'self.invoice.paymentMode.inOutSelect = 1  AND self.paymentMode is not null',
      operator: 'or',
      criteria: [
        {
          fieldName: 'amount',
          operator: '=',
          value: searchValue,
        },
        {
          fieldName: 'paymentMode.name',
          operator: 'like',
          value: searchValue,
        },
        {
          fieldName: 'invoice.invoiceId',
          operator: 'like',
          value: searchValue,
        },
      ],
      _searchText: searchValue,
    },
    limit: pageSize,
    offset: offset,
    translate: true,
  };

  const fields = [
    { accessor: 'invoiceId', Header: t('LBL_INVOICE_NUMBER'), type: 'text' },
    { accessor: 'amount', Header: t('LBL_AMOUNT'), type: 'number' },
    { accessor: 'paymentDate', Header: t('LBL_PAYMENT_DATE'), type: 'text' },
    { accessor: 'paymentMode', Header: t('LBL_PAYMENT_MODE'), type: 'text' },
    { accessor: 'companyBankDetails', Header: t('LBL_COMPANY_BANK_DETAILS'), type: 'text' },
    { accessor: 'currency', Header: t('LBL_CURRENCY'), type: 'text' },
  ];

  const subTitles = [
    { label: 'LBL_AMOUNT', key: 'amount', type: 'number' },
    { label: 'LBL_PAYMENT_MODE', key: 'paymentMode' },
    { label: 'LBL_COMPANY_BANK_DETAILS', key: 'companyBankDetails' },
  ];

  const showErrorMessage = message => dispatch(alertsActions.initiateAlert({ message }));

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
    window.scrollTo(0, 0);
    searchPayments();
  }, [searchParams]);

  const searchPayments = () => {
    if (searchValue === '') {
      setIncomingPayments([]);
      setDisplayedPayments([]);
      setIsLoading(true);
    }

    let payload = searchValue && searchValue !== '' ? searchPayloadwithValue : searchPayload;
    api('POST', getSearchUrl(MODELS.INVOICE_PAYMENT), payload, onPaymentsSearchSuccess);
  };

  const onPaymentsSearchSuccess = response => {
    let status = response.data.status;
    let data = response.data.data;
    let total = response.data.total;
    setIsLoading(false);

    if (status !== 0) {
      setIncomingPayments([]);
      setDisplayedPayments([]);
      return showErrorMessage('LBL_ERROR_LOADING_INCOMING_PAYMENTS');
    }

    if (total === undefined || total === null) {
      setIncomingPayments([]);
      setDisplayedPayments([]);
      return showErrorMessage('LBL_ERROR_LOADING_INCOMING_PAYMENTS');
    }

    setTotal(total);

    if (data === undefined || data === null) {
      setIncomingPayments([]);
      setDisplayedPayments([]);
    }

    if (data) {
      setIncomingPayments(data);
      let tempData = [];
      data.forEach(item => {
        let listItem = { ...item };
        listItem.invoiceId = listItem.invoice?.invoiceId ?? '';
        listItem.amount = listItem.amount ? formatFloatNumber(listItem.amount) : '';
        listItem.paymentMode = listItem.paymentMode?.name ?? '';
        listItem.companyBankDetails = listItem.companyBankDetails?.fullName ?? '';
        listItem.currency = listItem.currency?.name ?? '';
        tempData.push(listItem);
      });
      setDisplayedPayments(tempData);
    }
  };

  return (
    <>
      {isLoading && <Spinner />}
      {((!isLoading && searchValue !== '') || (incomingPayments && incomingPayments.length > 0)) && (
        <div className="page-body">
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-12">
                <Calendar />
                <BreadCrumb feature="INVOICES" subFeature="INCOMING_PAYMENTS" />
              </div>
            </div>

            <div className="row">
              <div className="col-md-12 mb-4">
                <div className="info-tite-page float-start">
                  <h4>{t('LBL_INCOMING_PAYMENTS')}</h4>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <Toolbar
                  show={show}
                  setShow={setShow}
                  refreshData={searchPayments}
                  setShowMoreAction={setShowMoreAction}
                  canSelectAll={false}
                  bulkActionConfig={{
                    isExport: true,
                    modelsEnumKey: 'INVOICE_PAYMENT',
                  }}
                  searchPayload={searchValue && searchValue !== '' ? searchPayloadwithValue : searchPayload}
                />
                {!isLoading && show === 'table' && windowSize[0] > 1200 && (
                  <Table
                    fields={fields}
                    data={displayedPayments}
                    total={total}
                    feature={feature}
                    subFeature={subFeature}
                    hasBulkActions={false}
                  >
                    {displayedPayments.length > 0 &&
                      displayedPayments.map(record => {
                        return (
                          <TableRow
                            record={record}
                            fields={fields}
                            refreshData={searchPayments}
                            feature={feature}
                            subFeature={subFeature}
                            hasBulkActions={false}
                            isEditable={false}
                            isDeletable={false}
                          />
                        );
                      })}
                  </Table>
                )}
                {!isLoading && (show === 'card' || windowSize[0] <= 1200) && (
                  <CardsList total={total}>
                    {displayedPayments &&
                      displayedPayments.map(record => {
                        return (
                          <Card
                            feature={feature}
                            subFeature={subFeature}
                            record={record}
                            title="invoiceId"
                            subTitles={subTitles}
                            refreshData={searchPayments}
                            isEditable={false}
                            isDeletable={false}
                            label1={record.paymentDate.length > 0 ? { value: record.paymentDate } : null}
                            label2={record.currency.length > 0 ? { value: record.currency } : null}
                          />
                        );
                      })}
                  </CardsList>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {showMoreAction && (
        <MoreAction
          show={show}
          setShow={setShow}
          refreshData={searchPayments}
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          canSelectAll={false}
        />
      )}
      {!isLoading && incomingPayments && incomingPayments.length === 0 && searchValue === '' && (
        <NoData
          imgSrc={NoIncomingPaymentsImg}
          noDataMessage={t('NO_INCOMING_PAYMENTS_DATA_MESSAGE')}
          showAdd={canAdd}
          addButtontext={t('LBL_ADD_INCOMING_PAYMENT')}
          addButtonPath="/home"
        />
      )}
    </>
  );
};

export default IncomingPayments;
