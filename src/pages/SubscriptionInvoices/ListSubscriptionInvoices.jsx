import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';

import Spinner from '../../components/Spinner/Spinner';
import MoreAction from '../../parts/MoreAction';
import Toolbar from '../../parts/Toolbar';
import Table from '../../components/ListingTable/Table';
import TableRow from '../../components/ListingTable/TableRow';
import CardsList from '../../components/CardsList/CardsList';
import Card from '../../components/CardsList/Card';
import BreadCrumb from '../../components/ui/BreadCrumb';
import Calendar from '../../components/ui/Calendar';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';
import NoData from '../../components/NoData';

import NoInvoicesImg from '../../assets/images/icons/Customer Invoices.svg';

import { useAxiosFunction } from '../../hooks/useAxios';
import { getSubscribtionInvoicesListURL } from '../../services/getUrl';
import { alertsActions } from '../../store/alerts';
import { useFeatures } from '../../hooks/useFeatures';
import { useUpgradeServices } from '../../services/apis/useUpgradeServices';

export default function ListSubscriptionInvoices({ mainConfig }) {
  let maxCallbacks = 2;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  const [searchParams] = useSearchParams();
  const { canEdit, getFeaturePath } = useFeatures(mainConfig.feature, mainConfig.subFeature);
  const { checkQaemaInvoicePayment } = useUpgradeServices();

  const { payOnly } = useSelector(state => state.auth);
  const companyInfo = useSelector(state => state.userFeatures.companyInfo);

  const [show, setShow] = useState('table');
  const [actionInProgress, setActionInProgress] = useState(false);
  const [windosSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [noData, setNoData] = useState(false);

  const [total, setTotal] = useState(0);
  let searchValue = searchParams.get('search') || '';
  let currentPage = parseInt(searchParams.get('currentPage') || 1);
  let pageSize = parseInt(searchParams.get('pageSize') || 10);
  let offset = (currentPage - 1) * pageSize;

  const [invoices, setInvoices] = useState([]);
  const [searchTimeout, setSearchTimeout] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fields = [
    { accessor: 'invoiceNo', Header: t('LBL_INVOICE_NUMBER'), type: 'text' },
    { accessor: 'netAmount', Header: t('LBL_NET_AMOUNT'), type: 'text' },
    { accessor: 'paidAmount', Header: t('LBL_PAID_AMOUNT'), type: 'text' },
    { accessor: 'currency', Header: t('LBL_CURRENCY'), type: 'text' },
    { accessor: 'billStartDt', Header: t('LBL_START_DATE'), type: 'text' },
    { accessor: 'billEndDt', Header: t('LBL_END_DATE'), type: 'text' },
    { accessor: 'sttsCd', Header: t('LBL_STATUS'), type: 'text', translate: true },
  ];

  const subTitles = [
    { label: 'LBL_NET_AMOUNT', key: 'netAmount' },
    { label: 'LBL_PAID_AMOUNT', key: 'paidAmount' },
  ];

  const infoColors = {
    field: 'sttsCd',
    data: [
      { colorId: '1', label: 'LBL_PAYMENT_INITIALIZED' },
      { colorId: '2', label: 'LBL_PAID' },
      { colorId: '3', label: 'LBL_NOT_PAID' },
      { colorId: '4', label: 'LBL_PARTIALY_PAID' },
    ],
  };

  const alertHandler = (title, message) => {
    dispatch(alertsActions.initiateAlert({ title, message }));
    setIsLoading(false);
  };

  const getSubscriptionInvoices = () => {
    if (isLoading === false) setIsLoading(true);
    if (!companyInfo?.companyInfoProvision?.customer_id) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    api(
      'GET',
      getSubscribtionInvoicesListURL() +
        `?pageOffset=${Math.floor(offset / pageSize)}&pageSize=${pageSize}&sortFields=createDt&sortOrders=DESC&customerId=${
          companyInfo.companyInfoProvision.customer_id
        }&productId=${import.meta.env.VITE_PRODUCT_ID}`,
      {},
      async res => {
        if (!(res?.data?.statusCode === 'I000000')) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));

        if (!(res?.data?.returnedObject?.returnedList?.length > 0) && searchValue === '') {
          setIsLoading(false);
          setNoData(true);
          return null;
        }

        let returnedObject = res.data.returnedObject;
        let modifiedInvoices = [];
        let checkInvoiceResponse = false;

        for (const inv of returnedObject.returnedList) {
          let newInvoice = { ...inv };
          let invoiceStatus = newInvoice?.sttsCd;

          if (invoiceStatus === 'PI') {
            checkInvoiceResponse = await checkQaemaInvoicePayment();
            if (checkInvoiceResponse?.paid) return mainConfig.redirectAfterPaymentHandler();
            maxCallbacks = maxCallbacks - 1;
            if (maxCallbacks > 0) return getSubscriptionInvoices();
          }

          if (invoiceStatus === 'Paid' || invoiceStatus === 'S') invoiceStatus = 'LBL_PAID';
          if (invoiceStatus === 'PP') invoiceStatus = 'LBL_PARTIALY_PAID';
          if (invoiceStatus === 'A') invoiceStatus = 'LBL_NOT_PAID';
          if (invoiceStatus === 'PI') invoiceStatus = 'LBL_PAYMENT_INITIALIZED';

          modifiedInvoices.push({ ...newInvoice, sttsCd: invoiceStatus });
        }

        setInvoices(modifiedInvoices);
        setTotal(returnedObject.paginationOutRec.wholeResultSetSize);
        setIsLoading(false);
      }
    );
  };

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
    clearTimeout(searchTimeout);

    if (searchValue !== '') {
      setSearchTimeout(
        setTimeout(() => {
          getSubscriptionInvoices();
        }, 1500)
      );
    } else {
      getSubscriptionInvoices();
    }
  }, [offset, pageSize, searchValue]);

  return (
    <>
      {actionInProgress && <div className="lodingpage"></div>}
      {isLoading && <Spinner />}
      {showMoreAction && (
        <MoreAction showMoreAction={showMoreAction} setShowMoreAction={setShowMoreAction} refreshData={getSubscriptionInvoices} />
      )}
      {!isLoading && noData && (
        <NoData
          imgSrc={NoInvoicesImg}
          noDataMessage={t('NO_SUBSCRIPTION_INVOICES_DATA_MESSAGE')}
          showAdd={canEdit}
          addButtontext={t('MANAGE_YOUR_SUBSCRIPTION')}
          addButtonPath={getFeaturePath(mainConfig.subFeature, 'edit')}
        />
      )}
      {total > 0 && (
        <div className="page-body">
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-12">
                <Calendar />
                <BreadCrumb feature="SETTINGS" subFeature="SUBSCRIPTIONS" />
              </div>
            </div>
            <div className="row">
              <div className="col-md-12 mb-4">
                <div className="info-tite-page float-start">
                  <h4>{t('LBL_SUBSCRIPTIONS')}</h4>
                </div>
                {canEdit && !payOnly && (
                  <div className="reverse-page float-end">
                    <PrimaryButton
                      theme="purple"
                      text="MANAGE_SUBSCRIPTION"
                      onClick={() => {
                        navigate(getFeaturePath(mainConfig.subFeature, 'edit'));
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                {!isLoading && (
                  <Toolbar
                    show={show}
                    setShow={setShow}
                    refreshData={getSubscriptionInvoices}
                    showSearch={false}
                    setShowMoreAction={setShowMoreAction}
                    canSelectAll={false}
                  />
                )}

                {!isLoading && show === 'table' && windosSize[0] > 1200 && (
                  <Table
                    fields={fields}
                    data={invoices}
                    total={total}
                    noCollapse
                    isViewable={true}
                    refreshData={getSubscriptionInvoices}
                    setActionInProgress={setActionInProgress}
                    feature={mainConfig.feature}
                    subFeature={mainConfig.subFeature}
                    infoColors={infoColors}
                    hasBulkActions={false}
                  >
                    {invoices &&
                      invoices.length > 0 &&
                      invoices.map(record => {
                        return (
                          <TableRow
                            key={record?.invoiceId}
                            record={record}
                            fields={fields}
                            refreshData={getSubscriptionInvoices}
                            setActionInProgress={setActionInProgress}
                            feature={mainConfig.feature}
                            subFeature={mainConfig.subFeature}
                            keyIdentifier="invoiceNo"
                            isEditable={false}
                            isDeletable={false}
                            infoColors={infoColors}
                            hasBulkActions={false}
                          />
                        );
                      })}
                  </Table>
                )}
                {!isLoading && (show === 'card' || windosSize[0] <= 1200) && (
                  <CardsList total={total} isPagination={false}>
                    {invoices &&
                      invoices.length > 0 &&
                      invoices.map(record => {
                        return (
                          <Card
                            key={record?.invoiceId}
                            feature={mainConfig.feature}
                            subFeature={mainConfig.subFeature}
                            record={record}
                            title="invoiceTitle"
                            subTitles={subTitles}
                            keyIdentifier="invoiceNo"
                            refreshData={getSubscriptionInvoices}
                            setActionInProgress={setActionInProgress}
                            label1={record.sttsCd ? { value: record.sttsCd } : null}
                            isEditable={false}
                            isDeletable={false}
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
    </>
  );
}
