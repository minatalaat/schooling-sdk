import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import Spinner from '../../../components/Spinner/Spinner';
import ToolBar from '../../../parts/Toolbar';
import NoData from '../../../components/NoData';
import MoreAction from '../../../parts/MoreAction';
import Table from '../../../components/ListingTable/Table';
import CardsList from '../../../components/CardsList/CardsList';
import Card from '../../../components/CardsList/Card';
import BreadCrumb from '../../../components/ui/BreadCrumb';
import PrimaryButton from '../../../components/ui/buttons/PrimaryButton';
import Calendar from '../../../components/ui/Calendar';
import TableRow from '../../../components/ListingTable/TableRow';

import { useAxiosFunction } from '../../../hooks/useAxios';
import { tourStepsActions } from '../../../store/tourSteps';
import { getActionUrl, getSearchUrl } from '../../../services/getUrl';
import { useFeatures } from '../../../hooks/useFeatures';
import { alertsActions } from '../../../store/alerts';
import { modelsEnum } from '../../../constants/modelsEnum/modelsEnum';
import { SEARCH_FIELDS, poStatusEnum, soStatusEnum } from './OrdersConstants';
import { useTourServices } from '../../../services/useTourServices';
import PrintOptionsTooltip from '../../../components/ui/PrintOptionsTooltip';
import { useFormik } from 'formik';

function OrdersListing({ orderConfig }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { getFeaturePath } = useFeatures();

  const { canAdd, canDelete, canEdit } = useFeatures(orderConfig.feature, orderConfig.subFeature);
  const { api } = useAxiosFunction();
  const tenantId = useSelector(state => state.userFeatures.companyInfo?.companyInfoProvision?.tenantId);
  const [searchParams] = useSearchParams();
  const { addStepsOptions } = useTourServices();
  const isTour = useSelector(state => state.tourSteps.isTour);

  const [show, setShow] = useState('table');
  const [windosSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [checked, setChecked] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [noData, setNoData] = useState(false);
  const [ordersData, setOrdersData] = useState({});
  const [searchTimeout, setSearchTimeout] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  let searchValue = searchParams.get('search') || '';
  let currentPage = parseInt(searchParams.get('currentPage') || 1);
  let pageSize = parseInt(searchParams.get('pageSize') || 10);
  let offset = (currentPage - 1) * pageSize;

  let initVals = {};

  orderConfig?.printOptions?.options &&
    orderConfig?.printOptions?.options.forEach(option => {
      initVals[option.accessor] = option.defaultValue;
    });

  const formik = useFormik({
    initialValues: initVals,
  });

  const fields = useMemo(() => {
    let tempFields = [
      { accessor: 'ref', Header: t('LBL_REFERENCE'), type: 'text' },
      { accessor: 'orderDate', Header: t('LBL_ORDER_DATE'), type: 'text' },
      { accessor: 'totalWithOutTax', Header: t('LBL_TOTAL_WITHOUT_TAX'), type: 'number' },
      { accessor: 'totalWithTax', Header: t('LBL_TOTAL_WITH_TAX'), type: 'number' },
      {
        accessor: 'currency',
        Header: t('LBL_CURRENCY'),
        type: 'text',
      },
      {
        accessor: 'status',
        Header: t('LBL_STATUS'),
        type: 'text',
        translate: true,
      },
    ];

    if (orderConfig.subFeatureChecks.isSO) {
      tempFields.splice(2, 0, { accessor: 'customer', Header: t('LBL_CUSTOMER'), type: 'text' });
    }

    if (orderConfig.subFeatureChecks.isPO) {
      tempFields.splice(2, 0, { accessor: 'supplier', Header: t('LBL_SUPPLIER'), type: 'text' });
    }

    return tempFields;
  }, []);

  const subTitles = useMemo(() => {
    let tempSubTitles = [
      { label: 'LBL_TOTAL_WITHOUT_TAX', key: 'totalWithOutTax', type: 'number' },
      { label: 'LBL_TOTAL_WITH_TAX', key: 'totalWithTax', type: 'number' },
    ];

    if (orderConfig.subFeatureChecks.isSO) {
      tempSubTitles.splice(0, 0, { label: 'LBL_CUSTOMER', key: 'customer' });
    }

    if (orderConfig.subFeatureChecks.isPO) {
      tempSubTitles.splice(0, 0, { label: 'LBL_SUPPLIER', key: 'supplier' });
    }

    return tempSubTitles;
  }, []);

  const searchPayload = useMemo(() => {
    let criteria = [
      { fieldName: 'stockLocation.name', operator: 'like', value: searchValue },
      { fieldName: 'externalReference', operator: 'like', value: searchValue },
      { fieldName: 'inTaxTotal', operator: '=', value: parseFloat(searchValue) },
      { fieldName: 'exTaxTotal', operator: '=', value: parseFloat(searchValue) },
      {
        fieldName: 'statusSelect',
        operator: '=',
        value:
          searchValue.toLowerCase() === 'draft' || searchValue.toLowerCase() === 'مسودة'
            ? 1
            : searchValue.toLowerCase() === 'validated' || searchValue.toLowerCase() === 'تم التحقق من صحتها'
              ? 3
              : searchValue.toLowerCase() === 'finished' || searchValue.toLowerCase() === 'منتهى'
                ? 4
                : searchValue.toLowerCase() === 'canceled' || searchValue.toLowerCase() === 'ملغية'
                  ? 5
                  : 0,
      },
      { fieldName: orderConfig.sequenceKey, operator: 'like', value: searchValue },
      { fieldName: `${orderConfig.partner.identifier}.fullName`, operator: 'like', value: searchValue },
    ];

    return {
      fields: SEARCH_FIELDS,
      sortBy: ['-createdOn'],
      data: {
        _searchText: searchValue !== '' ? searchValue : null,
        _domain: 'self.statusSelect IN (1,3,4,5)',
        _domainContext: {
          _id: null,
          _internalUser: 1,
          _model: modelsEnum[orderConfig.modelsEnumKey].name,
        },
        operator: 'or',
        criteria: searchValue !== '' ? criteria : [],
      },
      limit: pageSize,
      offset: offset,
      translate: true,
    };
  }, [searchValue, pageSize, offset]);

  const alertHandler = (title, message) => dispatch(alertsActions.initiateAlert({ title, message }));

  const fetchListingData = async () => {
    if (isLoading === false && searchValue === '') setIsLoading(true);

    const ordersResposne = await api('POST', getSearchUrl(modelsEnum[orderConfig.modelsEnumKey].name), searchPayload);

    if (!ordersResposne || !ordersResposne.data || ordersResposne.data.status !== 0) {
      setIsLoading(false);
      navigate('/error');
      return null;
    }

    if ((!ordersResposne.data.data || !ordersResposne.data.total) && searchValue === '') {
      setIsLoading(false);
      setNoData(true);
      return null;
    }

    let orderTemp = { ...ordersResposne.data };

    if (searchValue !== '' && !ordersResposne.data.total) {
      setIsLoading(false);
      setOrdersData({ ...orderTemp });
      return null;
    }

    let newOrders = [];

    if (orderTemp.data) {
      for (const order of orderTemp.data) {
        let newOrder = {
          ...order,
          orderDate: order?.orderDate ?? '',
          stockLocation: order?.stockLocation?.name ?? '',
          totalWithOutTax: order?.exTaxTotal ?? '0.00',
          totalWithTax: order?.inTaxTotal ?? '0.00',
          currency: order?.currency?.name ?? '',
          status:
            order && order.statusSelect
              ? orderConfig?.subFeatureChecks?.isPO
                ? poStatusEnum[order.statusSelect]
                : orderConfig?.subFeatureChecks?.isSO
                  ? soStatusEnum[order.statusSelect]
                  : ''
              : '',
          id: order?.id ?? -1,
          version: order?.version ?? -1,
        };

        if (orderConfig.subFeatureChecks.isSO) {
          newOrder = {
            ...newOrder,
            name: order?.saleOrderSeq ?? '',
            ref: order?.saleOrderSeq ?? '',
            customer: order?.clientPartner?.fullName ?? '',
          };
        }

        if (orderConfig.subFeatureChecks.isPO) {
          newOrder = {
            ...newOrder,
            name: order?.purchaseOrderSeq ?? '',
            ref: order?.purchaseOrderSeq ?? '',
            supplier: order?.supplierPartner?.fullName ?? '',
          };
        }

        newOrders.push(newOrder);
      }
    }

    setIsLoading(false);
    return setOrdersData({
      ...orderTemp,
      data: [...newOrders],
    });
  };

  useEffect(() => {
    if (orderConfig.tourConfig && isTour === 'true' && !isLoading) {
      addStepsOptions(orderConfig.tourConfig?.listSteps);
      dispatch(tourStepsActions.setIsTour('true'));
      dispatch(tourStepsActions.setSpotlightClick(true));
      dispatch(tourStepsActions.setSteps({ steps: orderConfig.tourConfig?.listSteps }));
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
      action: orderConfig.report?.action,
      data: {
        InvoiceID: record?.ref || null,
        // Locale: i18n.language,
        Locale: 'en',
        reportType: orderConfig.report?.reportType,
      },
    };
    if (orderConfig?.printOptions?.showOptions) {
      orderConfig?.printOptions?.options?.forEach(option => {
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
          data={ordersData.data || []}
          alertHandler={alertHandler}
          setActionInProgress={setActionInProgress}
          bulkActionConfig={{
            isExport: true,
            isImport: false,
            canDelete: canDelete,
            deleteSuccessMessage: orderConfig.deleteSuccessMessage,
            modelsEnumKey: orderConfig.modelsEnumKey,
          }}
        />
      )}
      {!isLoading && noData && (
        <NoData
          imgSrc={orderConfig.noData.img}
          noDataMessage={t(orderConfig.noData.noDataMessage)}
          showAdd={canAdd}
          addButtontext={t(orderConfig.addLabel)}
          addButtonPath={getFeaturePath(orderConfig.subFeature, 'add')}
          stepClass={orderConfig.noData?.stepClass || undefined}
        />
      )}
      {!isLoading && !noData && (
        <div className="page-body">
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-12">
                <Calendar />
                <BreadCrumb feature={orderConfig.feature} subFeature={orderConfig.subFeature} />
              </div>
            </div>

            <div className="row">
              <div className="col-md-12 mb-4">
                <div className="info-tite-page float-start">
                  <h4>{t(modelsEnum[orderConfig.modelsEnumKey].titlePlural)}</h4>
                </div>
                <div className="reverse-page float-end">
                  {canAdd && (
                    <PrimaryButton
                      theme="purpleWithIcon"
                      className={orderConfig.tourConfig?.stepAddClass || undefined}
                      text={orderConfig.addLabel}
                      onClick={() => {
                        navigate(getFeaturePath(orderConfig.subFeature, 'add'));
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
                  data={ordersData.data || []}
                  setActionInProgress={setActionInProgress}
                  bulkActionConfig={{
                    isExport: true,
                    canDelete: canDelete,
                    deleteSuccessMessage: orderConfig.deleteSuccessMessage,
                    modelsEnumKey: orderConfig.modelsEnumKey,
                  }}
                  searchPayload={searchPayload}
                />
                {show === 'table' && windosSize[0] > 1200 && (
                  <Table
                    fields={fields}
                    data={ordersData.data || []}
                    total={ordersData.total || 0}
                    checked={checked}
                    setChecked={setChecked}
                    feature={orderConfig.feature}
                    subFeature={orderConfig.subFeature}
                    isCollapsable={true}
                  >
                    {ordersData?.data?.length > 0 &&
                      ordersData.data.map(record => {
                        return (
                          <TableRow
                            key={record.id}
                            record={record}
                            fields={fields}
                            deleteModel={modelsEnum[orderConfig.modelsEnumKey].name}
                            refreshData={fetchListingData}
                            checked={checked}
                            setChecked={setChecked}
                            setActionInProgress={setActionInProgress}
                            feature={orderConfig.feature}
                            subFeature={orderConfig.subFeature}
                            navigationParams={{
                              id: record.id,
                              status: orderConfig?.subFeatureChecks?.isPO ? poStatusEnum[record.status] : soStatusEnum[record.status],
                            }}
                            isEditable={
                              (!orderConfig?.stockMangamentAvaiable &&
                                canEdit &&
                                orderConfig?.subFeatureChecks?.isSO &&
                                record.status !== soStatusEnum[4] &&
                                record &&
                                record.amountInvoiced &&
                                record.amountInvoiced !== record.totalWithOutTax) ||
                              (canEdit &&
                                orderConfig?.subFeatureChecks?.isSO &&
                                record.status !== soStatusEnum[4] &&
                                record &&
                                record.amountInvoiced &&
                                record.amountInvoiced !== record.totalWithOutTax) ||
                              (canEdit &&
                                orderConfig?.subFeatureChecks?.isPO &&
                                record.status !== poStatusEnum[5] &&
                                record.status !== poStatusEnum[4] &&
                                record &&
                                record.amountInvoiced &&
                                record.amountInvoiced !== record.totalWithOutTax)
                            }
                            isDeletable={
                              (canDelete &&
                                orderConfig?.subFeatureChecks?.isSO &&
                                record.status !== soStatusEnum[5] &&
                                record.status !== soStatusEnum[3] &&
                                record.status !== soStatusEnum[4]) ||
                              (canDelete &&
                                orderConfig?.subFeatureChecks?.isPO &&
                                record.status !== poStatusEnum[5] &&
                                record.status !== poStatusEnum[3] &&
                                record.status !== poStatusEnum[4])
                            }
                            isPrintable={
                              (orderConfig?.subFeatureChecks?.isPO &&
                                record.status !== poStatusEnum[1] &&
                                record.status !== poStatusEnum[5]) ||
                              (orderConfig?.subFeatureChecks?.isSO &&
                                record.status !== soStatusEnum[1] &&
                                record.status !== soStatusEnum[5])
                            }
                            viewPDFHandler={viewPDFHandler}
                            setIsOpen={setIsOpen}
                          />
                        );
                      })}
                  </Table>
                )}
                {(show === 'card' || windosSize[0] <= 1200) && (
                  <CardsList total={ordersData.total || 0}>
                    {ordersData?.data?.length > 0 &&
                      ordersData.data.map(record => {
                        return (
                          <Card
                            key={record.id}
                            feature={orderConfig.feature}
                            subFeature={orderConfig.subFeature}
                            record={record}
                            title="name"
                            subTitles={subTitles}
                            deleteModel={modelsEnum[orderConfig.modelsEnumKey].name}
                            refreshData={fetchListingData}
                            setActionInProgress={setActionInProgress}
                            checked={checked}
                            setChecked={setChecked}
                            label1={{ value: record.status }}
                            navigationParams={{
                              id: record.id,
                              status: orderConfig?.subFeatureChecks?.isPO ? poStatusEnum[record.status] : soStatusEnum[record.status],
                            }}
                            isEditable={
                              (!orderConfig?.stockMangamentAvaiable &&
                                canEdit &&
                                orderConfig?.subFeatureChecks?.isSO &&
                                record.status < soStatusEnum[4] &&
                                record &&
                                record.amountInvoiced &&
                                record.amountInvoiced !== record.totalWithOutTax) ||
                              (canEdit &&
                                orderConfig?.subFeatureChecks?.isSO &&
                                record.status < soStatusEnum[4] &&
                                record &&
                                record.amountInvoiced &&
                                record.amountInvoiced !== record.totalWithOutTax) ||
                              (canEdit &&
                                orderConfig?.subFeatureChecks?.isPO &&
                                record.status !== poStatusEnum[5] &&
                                record.status !== poStatusEnum[4] &&
                                record &&
                                record.amountInvoiced &&
                                record.amountInvoiced !== record.totalWithOutTax)
                            }
                            isDeletable={
                              (canDelete &&
                                orderConfig?.subFeatureChecks?.isSO &&
                                record.status !== soStatusEnum[5] &&
                                record.status !== soStatusEnum[3] &&
                                record.status !== soStatusEnum[4]) ||
                              (canDelete &&
                                orderConfig?.subFeatureChecks?.isPO &&
                                record.status !== poStatusEnum[5] &&
                                record.status !== poStatusEnum[3] &&
                                record.status !== poStatusEnum[4])
                            }
                            isPrintable={
                              (orderConfig?.subFeatureChecks?.isPO &&
                                record.status !== poStatusEnum[1] &&
                                record.status !== poStatusEnum[5]) ||
                              (orderConfig?.subFeatureChecks?.isSO &&
                                record.status !== soStatusEnum[1] &&
                                record.status !== soStatusEnum[5])
                            }
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
      {orderConfig?.printOptions?.showOptions && (
        <PrintOptionsTooltip options={orderConfig?.printOptions?.options} formik={formik} isOpen={isOpen} />
      )}
    </>
  );
}

export default OrdersListing;
