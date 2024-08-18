import { useSelector, useDispatch } from 'react-redux';
import { enc, AES, mode as encMode, pad } from 'crypto-js';
import moment from 'moment';
import axios from 'axios';
import i18next from 'i18next';

import { useAxiosFunction } from '../../hooks/useAxios';
import { getActionUrl, getModelUrl, getMyProfileUrl, getSearchUrl, getUploadUrl } from '../getUrl';
import { MODELS } from '../../constants/models';
import { getAddressL6 } from '../../utils/addressHelpers';
import { useMainAxelorServices } from './useMainAxelorServices';
import { setItem, setToken } from '../../utils/localStorage';
import useFiscalYearServices from './useFiscalYearServices';
import { getLastDayOfYearFromDate } from '../../utils/helpers';
import { getTempTokenHeaders } from '../getHeaders';
import { alertsActions } from '../../store/alerts';

export default function useChangePasswordServices() {
  const dispatch = useDispatch();

  const { api, uploadDocument } = useAxiosFunction();
  const { fetchService } = useMainAxelorServices();
  const { generatePeriodsService } = useFiscalYearServices();

  const userInfo = useSelector(state => state?.userFeatures?.userData);
  const company = useSelector(state => state?.userFeatures?.companyInfo?.companyInfoProvision?.company);
  const companyInfo = useSelector(state => state?.userFeatures?.companyInfo?.companyInfoProvision);
  const mainCompanyData = useSelector(state => state?.userFeatures?.companyInfo?.mainData);
  const auth = useSelector(state => state?.auth);

  const saveFirstLoginChangesService = async values => {
    // Upload logo if exist
    let logoId = -1;

    if (values.logo && values.logo.name && values.logo.name.length > 0) {
      const logoResponse = await uploadDocument(getUploadUrl(MODELS.METAFILE), values.logo);

      if (!(logoResponse?.data?.status === 0) || !logoResponse?.data?.data) return false;

      logoId = logoResponse?.data?.data?.[0]?.id || -1;
    }

    // Add Address
    const addressDefaultValues = {
      countryObj: { id: 2 },
      cityObj: { id: 76 },
      postalCode: '12263',
      streetNumber: '8467',
      district: 'Al Muruj',
      buildingNumber: '2743',
    };
    let addressPayload = {
      data: {
        addressL7Country: addressDefaultValues.countryObj ? { id: addressDefaultValues.countryObj?.id } : null,
        city: addressDefaultValues.cityObj ? { id: addressDefaultValues.cityObj?.id } : null,
        zip: addressDefaultValues.postalCode,
        streetNumber: addressDefaultValues.streetNumber,
        street: null,
        addressL3: addressDefaultValues.district ?? '',
        addressL4: addressDefaultValues.buildingNumber,
        addressL6: getAddressL6(addressDefaultValues),
        id: null,
      },
    };

    if (mainCompanyData?.address) {
      addressPayload = {
        ...addressPayload,
        data: { ...addressPayload.data, id: mainCompanyData?.address?.id || null, version: mainCompanyData?.address?.$version || 0 },
      };
    }

    const addressResposne = await api('POST', getModelUrl(MODELS.ADDRESS), addressPayload);

    if (!(addressResposne?.data?.status === 0) || !addressResposne?.data?.data) return false;

    const address = {
      id: addressResposne.data.data[0].id,
    };

    // Add Tax Number
    let taxNumberPayload = {
      data: {
        taxNbr: values.vatId ?? '',
        company: { id: company.id },
        id: null,
      },
    };

    if (mainCompanyData?.taxNumberList?.[0]?.id) {
      taxNumberPayload = {
        ...taxNumberPayload,
        data: {
          ...taxNumberPayload.data,
          id: mainCompanyData?.taxNumberList?.[0]?.id || null,
          version: mainCompanyData?.taxNumberList?.[0]?.$version || 0,
        },
      };
    }

    const taxResponse = await api('POST', getModelUrl(MODELS.TAXNUMBER), taxNumberPayload);

    if (!(taxResponse?.data?.status === 0) || !taxResponse?.data?.data) return false;

    const taxNumber = {
      id: taxResponse.data.data[0].id,
    };
    const companyVersion = taxResponse.data.data[0].company?.$version;

    // Update Company
    const companyResponse = await api(
      'POST',
      getModelUrl(MODELS.COMPANY),
      updateCompanyPayload(values, address, taxNumber, logoId, companyVersion)
    );

    if (!(companyResponse?.data?.status === 0) || !companyResponse?.data?.data) return false;

    const companyInfoResponse = await fetchService(MODELS.COMPANY_PROVISION_INFO, companyInfo.id, {
      fields: ['version'],
    });

    let version = companyInfoResponse?.data?.[0]?.version;

    // Update Company Provision
    const companyProvisionResponse = await api(
      'POST',
      getModelUrl(MODELS.COMPANY_PROVISION_INFO),
      updateCompanyInfoProvisionPayload(values, version)
    );
    if (!(companyProvisionResponse?.data?.status === 0) || !companyProvisionResponse?.data?.data) return false;

    // Generate ZATCA CSR
    if (companyProvisionResponse.data.data?.[0]?.zatca_is_enabled) {
      const zatcaResponse = await api('POST', getActionUrl(), { action: 'action-generate-csr' });

      if (!(zatcaResponse?.data?.status === 0)) return false;
    }

    // Update User Password
    const updatePasswordResponse = await api('POST', getMyProfileUrl(), updateUserPasswordPayload(values));

    if (!(updatePasswordResponse?.data?.status === 'Ok')) return false;

    // Update Fiscal Year
    const fiscalYearObj = await getFiscalYear();
    if (!fiscalYearObj) return false;

    const fiscalYearResponse = await api('POST', getModelUrl(MODELS.FISCALYEAR), updateFiscalYearPayload(values, fiscalYearObj));

    let fiscalYearData = fiscalYearResponse?.data?.data?.[0];

    if (!(fiscalYearResponse?.data?.status === 0) || !fiscalYearData) return false;

    const generatePeriodsResponse = await generatePeriodsService(fiscalYearData, 1);

    if (!generatePeriodsResponse) return false;

    setItem('isTour', true);
    dispatch(alertsActions.initiateAlert({ title: 'Success', message: 'PASSWORD_CHANGED_SUCCESSFULLY' }));

    setTimeout(() => {
      window.location.reload(true);
    }, [3000]);
    return true;
  };

  const getFiscalYearPayload = () => {
    let payload = {
      fields: ['name', 'code', 'fromDate', 'toDate'],
      sortBy: ['-code'],
      criteria: [],
      limit: -1,
      offset: 0,
      translate: true,
    };
    return payload;
  };

  const getFiscalYear = async () => {
    const response = await api('POST', getSearchUrl(MODELS.FISCALYEAR), getFiscalYearPayload());

    if (response.data.status === 0) {
      if (response.data.total > 0) {
        let data = response?.data?.data?.[0];
        return { id: data.id, version: data.version, fromDate: data.fromDate };
      }
    }

    return null;
  };

  const addFieldsToCompanyPayload = (data, formValues, address, taxNumber, logoID) => {
    if ((formValues.header && formValues.header.length > 0) || (formValues.footer && formValues.footer.length > 0)) {
      data.printingSettings = {
        pdfHeader: formValues.header,
        pdfFooter: formValues.footer,
        id: company.printingSettings.id,
        version: company.printingSettings['$version'],
      };
    }

    data.taxNumberList = [taxNumber];

    if (formValues.logo && formValues.logo.name && formValues.logo.name.length > 0 && logoID !== -1) {
      data.logo = { id: logoID };
    }

    data.address = address;

    return data;
  };

  const updateCompanyPayload = (values, address, taxNumber, logoId, version) => {
    let payload = {
      data: {
        id: company.id,
        name: company.name,
        version: version ?? (mainCompanyData.version !== null || mainCompanyData.$version !== null ? mainCompanyData.version : null),
      },
    };
    addFieldsToCompanyPayload(payload.data, values, address, taxNumber, logoId);
    return payload;
  };

  const updateCompanyInfoProvisionPayload = (formValues, version) => {
    let payload = {
      data: {
        tier: {
          name: companyInfo?.subscriptionTier?.name,
          id: companyInfo?.subscriptionTier?.id,
        },
        printedCommercialRegister: companyInfo.commercial_register ? companyInfo.commercial_register : formValues.companyCR,
        company: {
          code: companyInfo.company.code,
          name: companyInfo.company.name,
          id: companyInfo.company.id,
        },
        id: companyInfo.id,
        website: formValues?.companyWebsite !== '' ? formValues?.companyWebsite ?? undefined : undefined,
        telephone: formValues.companyTelephone !== '' ? formValues.companyTelephone : null,
        fax: formValues?.companyFax !== '' ? formValues.companyFax : null,
        zatca_is_enabled: formValues?.zatcaCheckbox ?? false,
        company_email: companyInfo.company_email ?? formValues?.companyEmail ?? undefined,
        first_login: false,
        version: version ?? companyInfo.version,
      },
    };

    if (formValues.zatcaCheckbox === true) {
      payload.data.zatca_code = formValues?.zatcaCompanyCode ? formValues.zatcaCompanyCode : null;
    }

    return payload;
  };

  const getEncryptedPassword = formValues => {
    const keyBase64 = import.meta.env.VITE_SECRET;
    let key = enc.Base64.parse(keyBase64);
    let srcs = enc.Utf8.parse(formValues.password);
    let encrypted = AES.encrypt(srcs, key, {
      mode: encMode.ECB,
      padding: pad.Pkcs7,
    });
    return encrypted.toString();
  };

  const updateUserPasswordPayload = formValues => {
    let payload = {
      data: {
        requestObject: {
          id: userInfo.id,
          name: userInfo.name,
          code: userInfo.code,
          newPassword: getEncryptedPassword(formValues),
          language: userInfo.language,
        },
      },
    };
    return payload;
  };

  const updateFiscalYearPayload = (formValues, fiscalYearObj) => {
    const selectedFiscalYear = formValues?.fiscalYear ?? moment().locale('en').startOf('year').format('YYYY-MM-DD');
    const name = moment(formValues.fiscalYear).format('YYYY');
    let payload = {
      data: {
        fromDate: selectedFiscalYear,
        toDate: getLastDayOfYearFromDate(selectedFiscalYear),
        reportedBalanceDate: getLastDayOfYearFromDate(selectedFiscalYear),
        id: fiscalYearObj.id,
        version: fiscalYearObj.version,
        periodList: [],
        name,
        code: `${company.name}_${name}`,
      },
    };
    return payload;
  };

  const changePasswordService = async values => {
    const keyBase64 = import.meta.env.VITE_SECRET;
    var key = enc.Base64.parse(keyBase64);
    var srcs = enc.Utf8.parse(values.password.toString().trim());
    var encrypted = AES.encrypt(srcs, key, { mode: encMode.ECB, padding: pad.Pkcs7 });

    let payload = {
      data: {
        requestObject: {
          newPassword: encrypted.toString().trim(),
          language: i18next.language,
        },
      },
    };

    try {
      await axios.post(getMyProfileUrl(), payload, getTempTokenHeaders(getMyProfileUrl(), auth?.tempToken));

      dispatch(alertsActions.initiateAlert({ title: 'Success', message: 'PASSWORD_CHANGED_SUCCESSFULLY' }));
      setTimeout(() => {
        setToken(auth?.tempToken);
        setItem('isTour', true);

        window.location.reload(true);
      }, [3000]);
      return true;
    } catch (err) {
      dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'SOMETHING_WENT_WRONG' }));
      return false;
    }
  };

  return { saveFirstLoginChangesService, changePasswordService };
}
