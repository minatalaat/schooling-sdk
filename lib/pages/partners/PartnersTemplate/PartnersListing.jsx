import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import Spinner from '../../../components/Spinner/Spinner';
import Toolbar from '../../../parts/Toolbar';
import NoData from '../../../components/NoData';
import MoreAction from '../../../parts/MoreAction';
import Table from '../../../components/ListingTable/Table';
import TableRow from '../../../components/ListingTable/TableRow';
import CardsList from '../../../components/CardsList/CardsList';
import Card from '../../../components/CardsList/Card';
import BreadCrumb from '../../../components/ui/BreadCrumb';
import PrimaryButton from '../../../components/ui/buttons/PrimaryButton';
import Calendar from '../../../components/ui/Calendar';

import { useAxiosFunction } from '../../../hooks/useAxios';
import { MODELS } from '../../../constants/models';
import { getSearchUrl } from '../../../services/getUrl';
import { useFeatures } from '../../../hooks/useFeatures';
import { alertsActions } from '../../../store/alerts';
import { modelsEnum } from '../../../constants/modelsEnum/modelsEnum';
import { tourStepsActions } from '../../../store/tourSteps';
import { useTourServices } from '../../../services/useTourServices';

const PartnersListing = ({ partnerConfig }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { getFeaturePath } = useFeatures();
  const { canAdd, canDelete } = useFeatures(partnerConfig.feature, partnerConfig.subFeature);
  const { api } = useAxiosFunction();
  const [searchParams] = useSearchParams();
  const isTour = useSelector(state => state.tourSteps.isTour);
  const { addStepsOptions } = useTourServices();

  const [show, setShow] = useState('table');
  const [windosSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [checked, setChecked] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [noData, setNoData] = useState(false);
  const [partnersData, setPartnersData] = useState({});
  const [searchTimeout, setSearchTimeout] = useState(0);

  let searchValue = searchParams.get('search') || '';
  let currentPage = parseInt(searchParams.get('currentPage') || 1);
  let pageSize = parseInt(searchParams.get('pageSize') || 10);
  let offset = (currentPage - 1) * pageSize;

  const fields = [
    { accessor: 'ref', Header: t('LBL_REFERENCE'), type: 'text' },
    { accessor: 'name', Header: t('LBL_NAME'), type: 'text' },
    { accessor: 'mobilePhone', Header: t('LBL_MOBILE_NUMBER'), type: 'text' },
    { accessor: 'email', Header: t('LBL_EMAIL_ADDRESS'), type: 'text' },
    { accessor: 'address', Header: t('LBL_ADDRESS'), type: 'text' },
  ];

  const subTitles = [
    { label: 'LBL_MOBILE_NUMBER', key: 'mobilePhone' },
    { label: 'LBL_EMAIL_ADDRESS', key: 'email' },
  ];

  const searchPayload = useMemo(() => {
    const criteria = [
      { fieldName: 'partnerSeq', operator: 'like', value: searchValue },
      {
        fieldName: 'simpleFullName',
        operator: 'like',
        value: searchValue,
      },
      { fieldName: 'fixedPhone', operator: 'like', value: searchValue },
      {
        fieldName: 'emailAddress.address',
        operator: 'like',
        value: searchValue,
      },
      {
        fieldName: 'partnerCategory.name',
        operator: 'like',
        value: searchValue,
      },
      {
        fieldName: 'fiscalPosition.code',
        operator: 'like',
        value: searchValue,
      },
      {
        fieldName: 'registrationCode',
        operator: 'like',
        value: searchValue,
      },
      {
        fieldName: 'mainAddress.fullName',
        operator: 'like',
        value: searchValue,
      },
      { fieldName: 'mainAddress.zip', operator: 'like', value: '0003' },
      {
        fieldName: 'mainAddress.city.fullName',
        operator: 'like',
        value: searchValue,
      },
      { fieldName: 'companyStr', operator: 'like', value: '0003' },
    ];
    return {
      fields: [
        'partnerCategory',
        'fiscalPosition.code',
        'simpleFullName',
        'partnerSeq',
        'emailAddress.address',
        'mainAddress.zip',
        'fixedPhone',
        'mobilePhone',
        'registrationCode',
        'mainAddress.city',
        'partnerAddressList.address',
        'mainAddress',
        'companyStr',
        'isProspect',
        'isEmployee',
        'isSupplier',
        'isCustomer',
        'debitBalance',
        'partnerAddressList.address.addressL6',
        'partnerAddressList.address.addressL7Country',
      ],
      sortBy: ['-id'],
      data: {
        _searchText: searchValue !== '' ? searchValue : null,
        _domain: partnerConfig?.partner?.partnerDomain ?? null,
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

    const partnersResponse = await api('POST', getSearchUrl(MODELS.PARTNER), searchPayload);

    if (!partnersResponse || !partnersResponse.data || partnersResponse.data.status !== 0) {
      setIsLoading(false);
      navigate('/error');
      return null;
    }

    if ((!partnersResponse.data.data || !partnersResponse.data.total) && searchValue === '') {
      setIsLoading(false);
      setNoData(true);
      return null;
    }

    let partnerTemp = { ...partnersResponse.data };

    if (searchValue !== '' && !partnersResponse.data.total) {
      setIsLoading(false);
      setPartnersData({ ...partnerTemp });
      return null;
    }

    let newPartners = [];

    if (partnerTemp.data) {
      for (const partner of partnerTemp.data) {
        let newPartner = {
          ...partner,
          isSupplier: partner?.isSupplier ?? false,
          isCustomer: partner?.isCustomer ?? false,
          ref: partner?.partnerSeq ?? '',
          name: partner?.simpleFullName ?? '',
          fixedPhone: partner?.fixedPhone ?? '',
          mobilePhone: partner?.mobilePhone ?? '',
          email: partner?.['emailAddress.address'] ?? '',
          category: partner?.partnerCategory ?? '',
          fiscalPosition: partner?.['fiscalPosition.code'] ?? '',
          registrationCode: partner?.registrationCode ?? '',
          zip: partner?.['mainAddress.zip'] ?? '',
          city: partner?.['mainAddress.city'] ?? '',
          companies: partner?.companyStr ?? '',
          address:
            (partner?.['partnerAddressList.address.addressL7Country']?.['$t:name'] ?? '') +
            ' ' +
            (partner?.['partnerAddressList.address.addressL6'] ?? ''),
          id: partner?.id ?? '',
          version: partner?.version ?? '',
        };

        newPartners.push(newPartner);
      }
    }

    setIsLoading(false);
    return setPartnersData({
      ...partnerTemp,
      data: [...newPartners],
    });
  };

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
    if (partnerConfig.tourConfig && isTour === 'true' && !isLoading) {
      addStepsOptions(partnerConfig.tourConfig?.listSteps);
      dispatch(tourStepsActions.setIsTour('true'));
      dispatch(tourStepsActions.setSpotlightClick(true));
      dispatch(tourStepsActions.setSteps({ steps: partnerConfig.tourConfig?.listSteps }));
    }
  }, [isTour, isLoading]);

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
      {actionInProgress && <div className="lodingpage"></div>}
      {isLoading && <Spinner />}
      {showMoreAction && (
        <MoreAction
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          refreshData={fetchListingData}
          checked={checked}
          setChecked={setChecked}
          data={partnersData.data || []}
          alertHandler={alertHandler}
          setActionInProgress={setActionInProgress}
          bulkActionConfig={{
            isExport: true,
            isImport: false,
            canDelete: canDelete,
            deleteSuccessMessage: partnerConfig.deleteSuccessMessage,
            modelsEnumKey: partnerConfig.modelsEnumKey,
          }}
        />
      )}
      {!isLoading && noData && (
        <NoData
          imgSrc={partnerConfig.noData.img}
          noDataMessage={t(partnerConfig.noData.noDataMessage)}
          showAdd={canAdd}
          addButtontext={t(partnerConfig.addLabel)}
          addButtonPath={getFeaturePath(partnerConfig.subFeature, 'add')}
          stepClass={partnerConfig.noData?.stepClass || undefined}
        />
      )}
      {!isLoading && !noData && (
        <div className="page-body">
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-12">
                <Calendar />
                <BreadCrumb feature={partnerConfig.feature} subFeature={partnerConfig.subFeature} />
              </div>
            </div>
            <div className="row">
              <div className="col-md-12 mb-4">
                <div className="info-tite-page float-start">
                  <h4>{t(modelsEnum[partnerConfig.modelsEnumKey].titlePlural)}</h4>
                </div>

                <div className="reverse-page float-end">
                  {canAdd && (
                    <PrimaryButton
                      theme="purpleWithIcon"
                      className={partnerConfig.tourConfig?.stepAddClass || undefined}
                      text={partnerConfig.addLabel}
                      onClick={() => {
                        navigate(getFeaturePath(partnerConfig.subFeature, 'add'));
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <Toolbar
                  show={show}
                  setShow={setShow}
                  refreshData={fetchListingData}
                  setShowMoreAction={setShowMoreAction}
                  checked={checked}
                  setChecked={setChecked}
                  data={partnersData.data || []}
                  setActionInProgress={setActionInProgress}
                  bulkActionConfig={{
                    isExport: true,
                    isImport: true,
                    subFeature: partnerConfig.subFeature,
                    canDelete: canDelete,
                    deleteSuccessMessage: partnerConfig.deleteSuccessMessage,
                    modelsEnumKey: partnerConfig.modelsEnumKey,
                  }}
                  searchPayload={searchPayload}
                />

                {show === 'table' && windosSize[0] > 1200 && (
                  <Table
                    fields={fields}
                    data={partnersData.data || []}
                    total={partnersData.total || 0}
                    checked={checked}
                    setChecked={setChecked}
                    feature={partnerConfig.feature}
                    subFeature={partnerConfig.subFeature}
                  >
                    {partnersData?.data?.length > 0 &&
                      partnersData.data.map(record => {
                        return (
                          <TableRow
                            key={record.id}
                            record={record}
                            fields={fields}
                            deleteModel={MODELS.PARTNER}
                            refreshData={fetchListingData}
                            checked={checked}
                            setChecked={setChecked}
                            setActionInProgress={setActionInProgress}
                            feature={partnerConfig.feature}
                            subFeature={partnerConfig.subFeature}
                          />
                        );
                      })}
                  </Table>
                )}
                {(show === 'card' || windosSize[0] <= 1200) && (
                  <CardsList total={partnersData.total || 0}>
                    {partnersData.data &&
                      partnersData.data.length > 0 &&
                      partnersData.data.map(record => {
                        return (
                          <Card
                            key={record.id}
                            feature={partnerConfig.feature}
                            subFeature={partnerConfig.subFeature}
                            record={record}
                            title="name"
                            subTitles={subTitles}
                            deleteModel={MODELS.PARTNER}
                            refreshData={fetchListingData}
                            setActionInProgress={setActionInProgress}
                            checked={checked}
                            setChecked={setChecked}
                            label1={record.isSupplier ? { value: 'LBL_SUPPLIER' } : null}
                            label2={record.isCustomer ? { value: 'LBL_CUSTOMER' } : null}
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
};

export default PartnersListing;
