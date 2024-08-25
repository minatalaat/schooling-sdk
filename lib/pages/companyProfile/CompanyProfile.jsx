import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import CompanyForms from './CompanyForms';
import BreadCrumb from '../../components/ui/BreadCrumb';
import Calendar from '../../components/ui/Calendar';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';
import Spinner from '../../components/Spinner/Spinner';

import { useAxiosFunction } from '../../hooks/useAxios';
import { getCompanyProfileUrl, getFetchUrl, getSearchUrl } from '../../services/getUrl';
import { MODELS } from '../../constants/models';
import { checkFlashOrError } from '../../utils/helpers';
import { bankDetailsActions } from '../../store/bankDetails';
import { BANK_DETAILS_FIELDS } from './bankDetails/BankDetailsFields';
import { alertsActions } from '../../store/alerts';
import { userFeaturesActions } from '../../store/userFeatures';

function CompanyProfile() {
  const feature = 'APP_CONFIG';
  const subFeature = 'COMPANY_PROFILE';
  const { api } = useAxiosFunction();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isSave, setIsSave] = useState(false);
  const [company, setCompany] = useState({});
  const [currency, setCurency] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bankDetailsList, setBankDetailsList] = useState([]);

  const fields = [
    'name',
    'code',
    'parent',
    'taxNumberList',
    'notes',
    'timezone',
    'supplierPaymentDelay',
    'language',
    'tradingNameSet',
    'partnerList',
    'printingSettings',
    'logo',
    'currency',
    'height',
    'address',
    'defaultBankDetails',
    'orderBloquedMessage',
    'name',
    'defaultPartnerTypeSelect',
    'publicHolidayEventsPlanning',
    'weeklyPlanning',
    'tradingNamePrintingSettingsList',
    'bankDetailsList',
    'partner',
    'workshopList',
    'width',
    'defaultPartnerCategorySelect',
    'customerPaymentDelay',
    'companyDepartmentList',
    'taxNumberList',
  ];

  const alertHandler = (title, message) => dispatch(alertsActions.initiateAlert({ title, message }));

  const finshedSaveHandler = () => {
    setIsSave(false);
  };

  const fetchCompanyInfoProvision = () => {
    return api('GET', getCompanyProfileUrl(), null);
  };

  const fetchAddress = addressID => {
    return api('POST', getFetchUrl(MODELS.ADDRESS, addressID), {
      fields: [
        'zip',
        'certifiedOk',
        'streetNumber',
        'city',
        'street',
        'pickList',
        'addressL2',
        'addressL3',
        'isValidLatLong',
        'addressL4',
        'addressL5',
        'addressL6',
        'addressL7Country',
      ],
      related: {},
    });
  };

  const fetchCompanyProfile = () => {
    const payload = {
      fields: fields,
      related: {},
    };
    return api('POST', getFetchUrl(MODELS.COMPANY, 1), payload);
  };

  const fetchCurrency = () => {
    api(
      'POST',
      getSearchUrl(MODELS.CURRENCY),
      {
        fields: ['symbol', 'code', 'name', 'codeISO'],
        sortBy: null,
        data: {
          _domainContext: {
            _model: MODELS.CURRENCY,
          },
          operator: 'and',
          criteria: [],
        },
        limit: 0,
        offset: 0,
        translate: true,
      },
      res => {
        if (res.data.status === 0) {
          if (res.data.data) {
            const SARCurrencyObj = res.data.data.find(obj => obj.code === 'SAR');
            if (SARCurrencyObj) setCurency({ ...SARCurrencyObj });
            if (!SARCurrencyObj) setCurency({});
          }
        } else {
          setIsLoading(false);
          alertHandler('Error', 'SOMETHING_WENT_WRONG');
        }
      }
    );
  };

  const getBankDetailsPayload = (companyCode, idList) => {
    let payload = {
      fields: BANK_DETAILS_FIELDS,
      sortBy: null,
      data: {
        _domain: 'self.id in (:_field_ids)',
        _domainContext: {
          id: companyCode,
          _model: MODELS.COMPANY,
          _field: 'bankDetailsList',
          _field_ids: idList,
        },
        _archived: true,
      },
      limit: -1,
      offset: 0,
      translate: true,
    };
    return payload;
  };

  const getCompanyBankDetails = (companyCode, idList) => {
    return api('POST', getSearchUrl(MODELS.BANK_DETAILS), getBankDetailsPayload(companyCode, idList));
  };

  const getBankDetailsFromBRPayload = () => {
    let payload = {
      fields: ['bankDetails'],
      data: {
        _domain: null,
      },
    };
    return payload;
  };

  const getBankDetailsFromBR = () => {
    return api('POST', getSearchUrl(MODELS.BANK_RECONCILIATION), getBankDetailsFromBRPayload());
  };

  const fetchCompanyProfileData = async () => {
    if (!isLoading) setIsLoading(true);

    const companyProfileResponse = await fetchCompanyProfile();

    if (
      !companyProfileResponse ||
      !companyProfileResponse.data ||
      companyProfileResponse.data.status !== 0 ||
      !companyProfileResponse.data.data ||
      !companyProfileResponse.data.data[0]
    ) {
      setIsLoading(false);
      navigate('/error');
      return null;
    }

    let companyData = companyProfileResponse.data.data[0];
    dispatch(userFeaturesActions.setTaxNumberList(companyData?.taxNumberList));
    dispatch(userFeaturesActions.setCompanyLogo(companyData?.logo?.id));
    let bankDetailsIdList = companyData.bankDetailsList;

    if (bankDetailsIdList && bankDetailsIdList.length > 0) {
      bankDetailsIdList = bankDetailsIdList.map(bd => bd.id);
    }

    dispatch(bankDetailsActions.setBankDetailsIDs({ bankDetailsIDs: bankDetailsIdList }));
    dispatch(
      bankDetailsActions.setDefaultBankDetails({
        defaultBankDetails: companyData.defaultBankDetails
          ? { id: companyData.defaultBankDetails.id, fullName: companyData.defaultBankDetails.fullName }
          : null,
      })
    );

    if (bankDetailsIdList && bankDetailsIdList.length > 0) {
      const bankDetailsResponse = await getCompanyBankDetails(companyData.id, bankDetailsIdList);

      if (
        !bankDetailsResponse ||
        !bankDetailsResponse.data ||
        bankDetailsResponse.data.status !== 0 ||
        bankDetailsResponse.data.total === null ||
        bankDetailsResponse.data.total === undefined
        //  ||!bankDetailsResponse.data.data
      ) {
        alertHandler('Error', t('LBL_ERROR_LOADING_BANK_DETAILS'));
      } else {
        let bankDetailsData = bankDetailsResponse.data.data ?? [];
        let tempData = [];
        bankDetailsData.forEach(acc => {
          tempData.push({
            ...acc,
            lineId: uuidv4(),
          });
        });
        dispatch(bankDetailsActions.setBankDetails({ bankDetails: bankDetailsData }));
        setBankDetailsList([...bankDetailsData]);
        const bankDetailsFromBRResponse = await getBankDetailsFromBR();

        if (
          !bankDetailsFromBRResponse ||
          !bankDetailsFromBRResponse.data ||
          bankDetailsFromBRResponse.data.status !== 0 ||
          bankDetailsFromBRResponse.data.total === null ||
          bankDetailsFromBRResponse.data.total === undefined
          // ||!bankDetailsFromBRResponse.data.data
        ) {
          dispatch(bankDetailsActions.setBankDetailsOperations({ ids: [] }));
          alertHandler('Error', t('LBL_ERROR_LOADING_BANK_DETAILS'));
        } else {
          let bankDetailsFromBRData = bankDetailsFromBRResponse.data.data ?? [];

          let brIDs = [];
          brIDs = bankDetailsFromBRData.map(({ bankDetails }) => bankDetails.id);
          dispatch(bankDetailsActions.setBankDetailsOperations({ ids: brIDs }));
        }
      }
    }

    let addressID = companyData.address ? (companyData.address.id ? companyData.address.id : -1) : -1;
    let addressResponse = null;
    let addressData = null;

    if (addressID !== -1) {
      addressResponse = await fetchAddress(addressID);

      if (
        !addressResponse ||
        !addressResponse.data ||
        addressResponse.data.status !== 0 ||
        !addressResponse.data.data ||
        !addressResponse.data.data[0]
      ) {
        setIsLoading(false);
        navigate('/error');
        return null;
      }

      addressData = addressResponse.data.data[0];
    }

    const companyInfoProvisionResponse = await fetchCompanyInfoProvision();

    if (
      !companyInfoProvisionResponse ||
      !companyInfoProvisionResponse.data ||
      companyInfoProvisionResponse.data.status !== 'Ok' ||
      !companyInfoProvisionResponse.data?.data?.returnedObj
    ) {
      setIsLoading(false);
      navigate('/error');
      return null;
    }

    if (checkFlashOrError(companyInfoProvisionResponse.data.data?.returnedObj)) {
      setIsLoading(false);
      navigate('/error');
      return null;
    }

    let companyProvisionData = companyInfoProvisionResponse.data?.data?.returnedObj?.[0]?.companyInfoProvision;

    setCompany({
      ...companyData,
      country: addressData?.addressL7Country
        ? { id: addressData?.addressL7Country?.id, name: addressData?.addressL7Country['$t:name'] }
        : null,
      city: addressData?.city ? { id: addressData?.city?.id, name: addressData?.city['$t:name'] } : null,
      district: addressData?.addressL3 || '',
      buildingNumber: addressData?.addressL4 || '',
      addressL6: addressData?.addressL6 || '',
      streetNumber: addressData?.streetNumber || '',
      postalCode: addressData?.zip || '',
      addressID: addressID,
      addressVersion: addressData?.version ?? null,
      taxNbr: companyData.taxNumberList ? (companyData.taxNumberList.length > 0 ? companyData.taxNumberList[0].taxNbr : null) : null,
      tier: companyProvisionData.tier ? companyProvisionData.tier : null,
      zatca_is_enabled: companyProvisionData?.zatca_is_enabled ?? false,
      zatca_code: companyProvisionData?.zatca_code ?? null,
      companyInfoId: companyProvisionData?.id ?? null,
      companyInfoVersion: companyProvisionData?.version ?? null,
      website: companyProvisionData?.website ?? '',
      telephone: companyProvisionData?.telephone ?? '',
      fax: companyProvisionData?.fax ?? '',
      companyCr: companyProvisionData?.commercial_register ?? '',
      printedCommercialRegister: companyProvisionData?.printedCommercialRegister ?? companyProvisionData?.commercial_register,
    });

    setIsLoading(false);
  };

  useEffect(() => {
    fetchCurrency();
    fetchCompanyProfileData();
  }, []);

  return (
    <>
      {actionInProgress && <div className="lodingpage"></div>}
      {isLoading && <Spinner />}
      <div className="page-body">
        {!isLoading && (
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-12">
                <Calendar />
                <BreadCrumb feature={feature} subFeature={subFeature} />
              </div>
            </div>
            <div className="row">
              <div className="col-md-12 mb-4">
                <div className="info-tite-page float-start">
                  <h4>{company.name}</h4>
                </div>
                <div className="reverse-page float-end">
                  <PrimaryButton className="savebtn-action" onClick={() => setIsSave(true)}>
                    <i className="saveicombtn"></i>
                  </PrimaryButton>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                {company.name && (
                  <CompanyForms
                    data={company}
                    currencySAR={currency}
                    isSave={isSave}
                    finshedSaveHandler={finshedSaveHandler}
                    refreshData={fetchCompanyProfileData}
                    setActionInProgress={setActionInProgress}
                    bankDetailsList={bankDetailsList}
                    setBankDetailsList={setBankDetailsList}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default CompanyProfile;
