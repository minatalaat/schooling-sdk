import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { FaFileInvoice, FaFileInvoiceDollar } from 'react-icons/fa';

import Spinner from '../../../components/Spinner/Spinner';
import ToolBar from '../../../parts/Toolbar';
import NoData from '../../../components/NoData';
import MoreAction from '../../../parts/MoreAction';
import Table from '../../../components/ListingTable/Table';
import CollapsableRow from '../../../components/ListingTable/CollapsableRow';
import CardsList from '../../../components/CardsList/CardsList';
import Card from '../../../components/CardsList/Card';
import BreadCrumb from '../../../components/ui/BreadCrumb';
import PrimaryButton from '../../../components/ui/buttons/PrimaryButton';
import Calendar from '../../../components/ui/Calendar';
import PrintOptionsTooltip from '../../../components/ui/PrintOptionsTooltip';

import { useAxiosFunction } from '../../../hooks/useAxios';
import { MODELS } from '../../../constants/models';
import { tourStepsActions } from '../../../store/tourSteps';
import { formatFloatNumber } from '../../../utils/helpers';
import { getActionUrl, getSearchUrl } from '../../../services/getUrl';
import { useFeatures } from '../../../hooks/useFeatures';
import { zatcaStatusEnum, invoiceTypeEnum, invoiceStatusEnum } from '../../../constants/enums/InvoicingEnums';
import { alertsActions } from '../../../store/alerts';
import { modelsEnum } from '../../../constants/modelsEnum/modelsEnum';
import { INVSTATUS_SELECT } from './InvoicesConstants';
import { useTourServices } from '../../../services/useTourServices';

import 'react-tooltip/dist/react-tooltip.css';
import { useFormik } from 'formik';

function InvoicesListing({ invoiceConfig }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { getFeaturePath } = useFeatures();
  const { canAdd, canDelete } = useFeatures(invoiceConfig.feature, invoiceConfig.subFeature);
  const { api } = useAxiosFunction();
  const tenantId = useSelector(state => state.userFeatures.companyInfo?.companyInfoProvision?.tenantId);
  const [searchParams] = useSearchParams();
  const isTour = useSelector(state => state.tourSteps.isTour);
  const zatcaIsEnabled = useSelector(state => state.userFeatures.companyInfo.companyInfoProvision.zatca_is_enabled);
  const { addStepsOptions } = useTourServices();

  const [show, setShow] = useState('table');
  const [windosSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [checked, setChecked] = useState([]);
  const [showRows, setShowRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [noData, setNoData] = useState(false);
  const [invoicesData, setInvoicesData] = useState({});
  const [searchTimeout, setSearchTimeout] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  let searchValue = searchParams.get('search') || '';
  let currentPage = parseInt(searchParams.get('currentPage') || 1);
  let pageSize = parseInt(searchParams.get('pageSize') || 10);
  let offset = (currentPage - 1) * pageSize;

  const today = new Date();

  let initVals = {};

  invoiceConfig?.printOptions?.options &&
    invoiceConfig?.printOptions?.options.forEach(option => {
      initVals[option.accessor] = option.defaultValue;
    });

  const formik = useFormik({
    initialValues: initVals,
  });

  const SEARCH_FIELDS = [
    'tradingName',
    'paymentDelay',
    'inTaxTotal',
    'operationSubTypeSelect',
    'dueDate',
    'exTaxTotal',
    'invoiceDate',
    'debtRecoveryBlockingOk',
    'statusSelect',
    'partner',
    'amountRemaining',
    'invoiceId',
    'company',
    'currency',
    'invoicePaymentList',
    'refundInvoiceList',
    'zatcaIntegrationStatus.status',
    'paymentMode',
  ];

  const fields = useMemo(() => {
    let tempFields = [
      { accessor: 'statusIcon', Header: t('LBL_TYPE'), type: 'icon' },
      {
        accessor: 'name',
        Header: invoiceConfig.subFeatureChecks.isNote
          ? invoiceConfig.subFeatureChecks.isCreditNote
            ? t('LBL_REFUND_NUMBER')
            : t('LBL_DEBIT_NOTE_NUMBER')
          : t('LBL_INVOICE_NUMBER'),
        type: 'text',
      },
      {
        accessor: 'partner',
        Header: invoiceConfig?.subFeatureChecks.isCustomerRelated ? t('LBL_CUSTOMER') : t('LBL_SUPPLIER'),
        type: 'text',
      },
      { accessor: 'paymentMode', Header: t('LBL_PAYMENT_MODE'), type: 'text' },
      { accessor: 'currency', Header: t('LBL_CURRENCY'), type: 'text' },
      {
        accessor: 'invoiceDate',
        Header:
          (invoiceConfig.subFeatureChecks.isSupplierRelated && invoiceConfig.subFeatureChecks.isNote) ||
          (invoiceConfig.subFeatureChecks.isCustomerRelated && invoiceConfig.subFeatureChecks.isNote)
            ? t('LBL_NOTE_DATE')
            : t('LBL_INVOICE_DATE'),
        type: 'text',
      },
      {
        accessor: 'dueDate',
        Header: t('Invoicing_Duedate'),
        type: 'text',
      },
      { accessor: 'statusLabel', Header: t('LBL_STATUS'), type: 'text', translate: true },
    ];

    if (invoiceConfig?.isZATCA && zatcaIsEnabled) {
      tempFields.push({ accessor: 'zatcaStatus', Header: t('LBL_ZATCA_REPORTING_STATUS'), type: 'text', isHidden: false });
    }

    return tempFields;
  }, [zatcaIsEnabled]);

  const subTitles = [
    { label: 'LBL_TOTAL_WITHOUT_TAX', key: 'totalWithoutTax', type: 'number' },
    { label: 'LBL_TOTAL_WITH_TAX', key: 'totalWithTax', type: 'number' },
    { label: 'LBL_INVOICE_DATE', key: 'invoiceDate' },
    { label: 'Invoicing_Duedate', key: 'dueDate' },
  ];

  const collapsableFieldsOne = [
    { accessor: 'name', Header: t('LBL_INVOICE_NUMBER'), type: 'text' },
    { accessor: 'partner', Header: t('LBL_CUSTOMER_SUPPLIER'), type: 'text' },
    { accessor: 'invoiceDate', Header: t('LBL_INVOICE_DATE'), type: 'text' },
    {
      accessor: 'dueDate',
      Header: t('Invoicing_Duedate'),
      type: 'text',
    },
    { accessor: 'statusLabel', Header: t('LBL_STATUS'), type: 'text', translate: true },
  ];

  const collapsableFieldsTwo = [
    { accessor: 'totalWithoutTax', Header: t('LBL_TOTAL_WITHOUT_TAX'), type: 'number' },
    { accessor: 'totalWithTax', Header: t('LBL_TOTAL_WITH_TAX'), type: 'number' },
    { accessor: 'amountRemaining', Header: t('LBL_REMAINING_AMOUNT'), type: 'number' },
    { accessor: 'currency', Header: t('LBL_CURRENCY'), type: 'text' },
  ];

  const infoColors = {
    field: 'colorLabel',
    data: [
      { colorId: '1', label: 'LBL_NORMAL_INVOICE' },
      { colorId: '2', label: 'LBL_PAID_INVOICE' },
      { colorId: '3', label: 'LBL_OVERDUE_INVOICE' },
      { colorId: '4', label: 'LBL_DUE_TODAY_INVOICE' },
    ],
  };

  const searchPayload = useMemo(() => {
    const criteria = [
      {
        fieldName: 'invoiceId',
        operator: 'like',
        value: searchValue,
      },
      {
        fieldName: 'statusSelect',
        operator: '=',
        value:
          searchValue.toLowerCase() === 'draft' || searchValue.toLowerCase() === 'مسودة'
            ? 1
            : searchValue.toLowerCase() === 'validated' || searchValue.toLowerCase() === 'تم التحقق من صحتها'
              ? 2
              : searchValue.toLowerCase() === 'ventilated' || searchValue.toLowerCase() === 'مسجلة'
                ? 3
                : searchValue.toLowerCase() === 'canceled' || searchValue.toLowerCase() === 'ملغية'
                  ? 4
                  : 0,
      },
      {
        fieldName: 'dueDate',
        operator: 'between',
        value: searchValue && searchValue.length < 4 ? new Date(today.getFullYear(), parseInt(searchValue) - 2, today.getDay()) : '',
        value2: searchValue && searchValue.length < 4 ? new Date(today.getFullYear(), parseInt(searchValue) - 1, today.getDay()) : '',
      },
    ];
    return {
      fields: SEARCH_FIELDS,
      sortBy: ['-id'],
      data: {
        _searchText: searchValue !== '' ? searchValue : null,
        _domain: `self.operationTypeSelect = ${invoiceConfig.operationTypeSelect}`,
        _domainContext: {
          _operationTypeSelect: invoiceConfig.operationTypeSelect,
          _id: null,
          todayDate: moment(today).locale('en').format('YYYY-MM-DD'),
          _model: MODELS.INVOICE,
        },
        operator: 'or',
        criteria: searchValue !== '' ? criteria : [],
      },
      limit: pageSize,
      offset: offset,
      translate: true,
    };
  }, [searchValue, pageSize, offset]);

  const invoiceStatusLabels = ['', 'LBL_DRAFT', 'LBL_VALIDATED_INV', 'LBL_POSTED', 'LBL_CANCELED'];

  const alertHandler = (title, message) => dispatch(alertsActions.initiateAlert({ title, message }));

  const getColorLabel = invoice => {
    let yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    yesterday = moment(yesterday).locale('en').format('YYYY-MM-DD');
    let dueDate = invoice.dueDate ? new Date(invoice.dueDate) : null;
    if (invoice.amountRemaining === '0.00' && invoice.statusSelect !== INVSTATUS_SELECT.CANCELLED) return 'LBL_PAID_INVOICE';
    if (invoice.dueDate && invoice.dueDate === moment(today).locale('en').format('YYYY-MM-DD')) return 'LBL_DUE_TODAY_INVOICE';
    if ((invoice.dueDate && invoice.dueDate === yesterday) || (dueDate && dueDate.getTime() < today.getTime()))
      return 'LBL_OVERDUE_INVOICE';
    return 'LBL_NORMAL_INVOICE';
  };

  const fetchListingData = async () => {
    if (isLoading === false && searchValue === '') setIsLoading(true);

    const invoicesResponse = await api('POST', getSearchUrl(MODELS.INVOICES), searchPayload);

    if (!invoicesResponse || !invoicesResponse.data || invoicesResponse.data.status !== 0) {
      setIsLoading(false);
      navigate('/error');
      return null;
    }

    if ((!invoicesResponse.data.data || !invoicesResponse.data.total) && searchValue === '') {
      setIsLoading(false);
      setNoData(true);
      return null;
    }

    let invoiceTemp = { ...invoicesResponse.data };

    if (searchValue !== '' && !invoicesResponse.data.total) {
      setIsLoading(false);
      setInvoicesData({ ...invoiceTemp });
      return null;
    }

    let newInvoices = [];

    if (invoiceTemp.data) {
      for (const inv of invoiceTemp.data) {
        let newInvoice = {
          ...inv,
          active: false,
          name: inv?.invoiceId ?? '',
          partner: inv?.partner?.fullName ?? '',
          paymentMode: inv?.paymentMode?.name ?? '',
          currency: inv?.currency?.name ?? '',
          invoiceDate: inv?.invoiceDate ?? '',
          dueDate: inv?.dueDate ?? '',
          statusSelect: inv?.statusSelect ?? '',
          status: inv?.statusSelect ? invoiceStatusEnum[inv.statusSelect] : '',
          statusLabel: inv?.statusSelect ? invoiceStatusLabels[inv.statusSelect] : '',
          totalWithoutTax: inv && inv.exTaxTotal ? formatFloatNumber(inv.exTaxTotal.toString()) : '',
          totalWithTax: inv && inv.inTaxTotal ? formatFloatNumber(inv.inTaxTotal.toString()) : '',
          amountRemaining: inv && inv.amountRemaining ? formatFloatNumber(inv.amountRemaining.toString()) : '',
          id: inv?.id ?? -1,
          version: inv?.version ?? -1,
          invoicePaymentList: inv?.invoicePaymentList ?? [],
          refundInvoiceList: inv?.refundInvoiceList ?? [],
          zatcaStatus: inv && inv['zatcaIntegrationStatus.status'] ? t(zatcaStatusEnum[inv['zatcaIntegrationStatus.status']]) : '',
          colorLabel: getColorLabel(inv),
          title: `${inv.invoiceId}-${inv?.partner?.fullName ?? ''}`,
          statusIcon:
            inv && inv.operationSubTypeSelect && inv.operationSubTypeSelect.toString() === invoiceTypeEnum['FREE_TEXT'] ? (
              <FaFileInvoice size={23} color="grey" />
            ) : (
              <FaFileInvoiceDollar size={23} color="#1F4FDE" />
            ),
          operationSubTypeSelect:
            inv && inv.operationSubTypeSelect && inv.operationSubTypeSelect.toString() === invoiceTypeEnum['FREE_TEXT']
              ? 'LBL_FREE_TEXT_INVOICE'
              : 'LBL_CLASSIC_INVOICE',
        };

        newInvoices.push(newInvoice);
      }
    }

    setIsLoading(false);
    return setInvoicesData({
      ...invoiceTemp,
      data: [...newInvoices],
    });
  };

  useEffect(() => {
    if (invoiceConfig.tourConfig && isTour === 'true' && !isLoading) {
      addStepsOptions(invoiceConfig.tourConfig?.listSteps);
      dispatch(tourStepsActions.setIsTour('true'));
      dispatch(tourStepsActions.setSpotlightClick(true));
      dispatch(tourStepsActions.setSteps({ steps: invoiceConfig.tourConfig?.listSteps }));
    }
  }, [isTour, isLoading]);

  useEffect(() => {
    clearTimeout(searchTimeout);

    if (searchValue !== '') {
      setSearchTimeout(
        setTimeout(() => {
          fetchListingData();
        }, 1500)
      );
    } else {
      fetchListingData();
    }
  }, [offset, pageSize, searchValue]);

  useEffect(() => {
    const handleWindowResize = () => {
      setWindowSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  });

  const viewPDFHandler = async record => {
    let payload = {
      action: invoiceConfig.report?.action,
      data: {
        InvoiceID: record?.name || null,
        // Locale: i18n.language,
        Locale: 'en',
        reportType: invoiceConfig.report?.reportType,
      },
    };

    if (invoiceConfig?.printOptions?.showOptions) {
      invoiceConfig?.printOptions?.options?.forEach(option => {
        payload.data[option.accessor] = formik.values[option?.accessor];
      });
    }
    const getReportResponse = await api('POST', getActionUrl(), payload);
    if (getReportResponse.data.status !== 0) return alertHandler('Error', 'SOMETHING_WENT_WRONG');
    const url = getReportResponse?.data?.data?.[0]?.view?.views?.[0]?.name ?? '';

    if (url !== '') window.open(import.meta.env.VITE_BASE_URL + url + `&tenantId=${tenantId}`, '_blank');
  };

  return (
    <>
      {actionInProgress && <div className="lodingpage"></div>}
      {isLoading && <Spinner />}
      {showMoreAction && (
        <MoreAction
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          refreshData={fetchListingData}
          checked={checked}
          setChecked={setChecked}
          data={invoicesData.data || []}
          alertHandler={alertHandler}
          setActionInProgress={setActionInProgress}
          bulkActionConfig={{
            isExport: true,
            isImport: false,
            canDelete: canDelete,
            deleteSuccessMessage: invoiceConfig.deleteSuccessMessage,
            modelsEnumKey: invoiceConfig.modelsEnumKey,
          }}
        />
      )}
      {!isLoading && noData && (
        <NoData
          imgSrc={invoiceConfig.noData.img}
          noDataMessage={t(invoiceConfig.noData.noDataMessage)}
          showAdd={invoiceConfig.subFeatureChecks?.isInvoice ? canAdd : false}
          addButtontext={t(invoiceConfig.addLabel)}
          addButtonPath={getFeaturePath(invoiceConfig.subFeature, 'add')}
          stepClass={invoiceConfig.noData?.stepClass || undefined}
        />
      )}
      {!isLoading && !noData && (
        <div className="page-body">
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-12">
                <Calendar />
                <BreadCrumb feature={invoiceConfig.feature} subFeature={invoiceConfig.subFeature} />
              </div>
            </div>

            <div className="row">
              <div className="col-md-12 mb-4">
                <div className="info-tite-page float-start">
                  <h4>{t(modelsEnum[invoiceConfig.modelsEnumKey].titlePlural)}</h4>
                </div>
                <div className="reverse-page float-end">
                  {canAdd && invoiceConfig.subFeatureChecks?.isInvoice && (
                    <PrimaryButton
                      theme="purpleWithIcon"
                      text={invoiceConfig.addLabel}
                      className={invoiceConfig.tourConfig?.stepAddClass || undefined}
                      onClick={() => {
                        navigate(getFeaturePath(invoiceConfig.subFeature, 'add'));
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                <ToolBar
                  show={show}
                  setShow={setShow}
                  refreshData={fetchListingData}
                  setShowMoreAction={setShowMoreAction}
                  checked={checked}
                  setChecked={setChecked}
                  data={invoicesData.data || []}
                  setActionInProgress={setActionInProgress}
                  bulkActionConfig={{
                    isExport: true,
                    canDelete: canDelete,
                    deleteSuccessMessage: invoiceConfig.deleteSuccessMessage,
                    modelsEnumKey: invoiceConfig.modelsEnumKey,
                  }}
                  searchPayload={searchPayload}
                />
                {show === 'table' && windosSize[0] > 1200 && (
                  <Table
                    fields={fields}
                    data={invoicesData.data || []}
                    total={invoicesData.total || 0}
                    checked={checked}
                    setChecked={setChecked}
                    feature={invoiceConfig.feature}
                    subFeature={invoiceConfig.subFeature}
                    isCollapsable={true}
                    infoColors={infoColors}
                  >
                    {invoicesData?.data?.length > 0 &&
                      invoicesData.data.map(record => {
                        return (
                          <CollapsableRow
                            key={record.id}
                            record={record}
                            fields={fields}
                            deleteModel={MODELS.INVOICES}
                            refreshData={fetchListingData}
                            checked={checked}
                            setChecked={setChecked}
                            setActionInProgress={setActionInProgress}
                            feature={invoiceConfig.feature}
                            subFeature={invoiceConfig.subFeature}
                            navigationParams={{ id: record.id }}
                            isEditable={
                              (!invoiceConfig?.subFeatureChecks?.isNote && record.statusSelect !== INVSTATUS_SELECT.CANCELLED) ||
                              (invoiceConfig?.subFeatureChecks?.isNote &&
                                record.amountRemaining !== '0.00' &&
                                record.statusSelect !== INVSTATUS_SELECT.CANCELLED)
                            }
                            isDeletable={
                              record.statusSelect === INVSTATUS_SELECT.DRAFT || record.statusSelect === INVSTATUS_SELECT.VALIDATED
                            }
                            isPrintable={record.statusSelect === INVSTATUS_SELECT.POSTED}
                            infoColors={infoColors}
                            showRows={showRows}
                            setShowRows={setShowRows}
                            collapsableFieldsOne={collapsableFieldsOne}
                            collapsableFieldsTwo={collapsableFieldsTwo}
                            viewPDFHandler={viewPDFHandler}
                            setIsOpen={setIsOpen}
                          />
                        );
                      })}
                  </Table>
                )}
                {(show === 'card' || windosSize[0] <= 1200) && (
                  <CardsList total={invoicesData.total || 0}>
                    {invoicesData?.data?.length > 0 &&
                      invoicesData.data.map(record => {
                        return (
                          <Card
                            key={record.id}
                            feature={invoiceConfig.feature}
                            subFeature={invoiceConfig.subFeature}
                            record={record}
                            title="title"
                            subTitles={subTitles}
                            deleteModel={MODELS.INVOICES}
                            refreshData={fetchListingData}
                            setActionInProgress={setActionInProgress}
                            checked={checked}
                            setChecked={setChecked}
                            label1={{ value: record.operationSubTypeSelect }}
                            label2={{ value: invoiceStatusLabels[record.statusSelect] }}
                            navigationParams={{ id: record.id, status: record.status }}
                            isEditable={
                              (!invoiceConfig?.subFeatureChecks?.isNote && record.statusSelect !== INVSTATUS_SELECT.CANCELLED) ||
                              (invoiceConfig?.subFeatureChecks?.isNote &&
                                record.amountRemaining !== '0.00' &&
                                record.statusSelect !== INVSTATUS_SELECT.CANCELLED)
                            }
                            isDeletable={
                              record.statusSelect === INVSTATUS_SELECT.DRAFT || record.statusSelect === INVSTATUS_SELECT.VALIDATED
                            }
                            isPrintable={record.statusSelect === INVSTATUS_SELECT.POSTED}
                            viewPDFHandler={viewPDFHandler}
                            setIsOpen={setIsOpen}
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
      {invoiceConfig?.printOptions?.showOptions && (
        <PrintOptionsTooltip options={invoiceConfig?.printOptions?.options} formik={formik} isOpen={isOpen} />
      )}
    </>
  );
}

export default InvoicesListing;
