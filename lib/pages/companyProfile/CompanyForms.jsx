import { useEffect } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import MainDetails from './MainDetails';
import Configurations from './Configurations';
import BankDetails from './BankDetails';
import Tabs from '../../components/ui/inputs/Tabs';
import HRConfiguration from './HRConfiguration';

import { useAxiosFunction } from '../../hooks/useAxios';
import { getActionUrl, getCompanyProfileUrl, getModelUrl, getUploadUrl } from '../../services/getUrl';
import { checkFlashOrError } from '../../utils/helpers';
import { MODELS } from '../../constants/models';
import { useTabs } from '../../hooks/useTabs';
import {
  VALID_TEXT_WITH_SPECIAL_CHARS,
  VALID_TAX_NUMBER_REGEX,
  VALID_SAUDI_MOBILE_NUMBER,
  CODE_REGEX,
  VALID_POSTAL_CODE,
  NOT_MORE_THAN_FOUR_DIGITS,
  NUMBERS_ONLY,
} from '../../constants/regex/Regex';
import { useFeatures } from '../../hooks/useFeatures';
import { alertsActions } from '../../store/alerts';
import { useFormikSubmit } from '../../hooks/useFormikSubmit';
import { getAddressL6 } from '../../utils/addressHelpers';

export default function CompanyForms({
  data,
  currencySAR,
  isSave,
  finshedSaveHandler,
  refreshData,
  setActionInProgress,
  bankDetailsList,
  setBankDetailsList,
}) {
  const { t } = useTranslation();
  const tabsProps = useTabs();
  const { api, uploadDocument } = useAxiosFunction();
  const { canEdit: canEditHRConfig } = useFeatures('HR_MANAGEMENT', 'HR_CONFIGURATIONS');
  const dispatch = useDispatch();

  const initialValues = {
    name: data.name ? data.name : '',
    code: data.code ? data.code : '',
    parent: data.parent || null,
    partner: data.partner || null,
    country: data.country || null,
    city: data.city || null,
    district: !data.district ? '' : data.district,
    buildingNumber: !data.buildingNumber ? '' : data.buildingNumber,
    streetNumber: !data.streetNumber ? '' : data.streetNumber,
    postalCode: !data.postalCode ? '' : data.postalCode,
    width: data.width ? data.width : 0,
    height: data.height ? data.height : 0,
    logo: null,
    currency: data.currency ? data.currency : currencySAR ? currencySAR : null,
    printingSettings: data.printingSettings ? (data.printingSettings.name ? data.printingSettings.name : '') : '',
    defaultPartnerTypeSelect: data.defaultPartnerTypeSelect ? data.defaultPartnerTypeSelect : '0',
    defaultPartnerCategorySelect: data.defaultPartnerCategorySelect ? data.defaultPartnerCategorySelect : '0',
    timezone: data.timezone ? data.timezone : '0',
    supplierPaymentDelay: data.supplierPaymentDelay ? Number(data.supplierPaymentDelay) : 0,
    customerPaymentDelay: data.customerPaymentDelay ? Number(data.customerPaymentDelay) : 0,
    language: data.language || null,
    defaultBankDetails: data.defaultBankDetails || null,
    taxNbr: data.taxNbr ? data.taxNbr : '',
    tier: data.tier ? (data.tier.name ? data.tier.name : '') : '',
    zatca_is_enabled: data.zatca_is_enabled ? data.zatca_is_enabled : false,
    zatca_code: data.zatca_code ? data.zatca_code : '',
    website: data.website ? data.website : '',
    telephone: data.telephone ? data.telephone : '',
    fax: data.fax ? data.fax : '',
    weeklyPlanning: data.weeklyPlanning || null,
    publicHolidayEventsPlanning: data.publicHolidayEventsPlanning || null,
    companyCr: data?.companyCr ?? '',
    printedCommercialRegister: data?.printedCommercialRegister ?? '',
  };

  const validationSchema = Yup.object({
    name: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).required(t('REQUIRED')).trim(),
    code: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).required(t('REQUIRED')).trim(),
    country: Yup.object().required(t('REQUIRED')).nullable(),
    city: Yup.object().required(t('REQUIRED')).nullable(),
    district: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).required(t('REQUIRED')).trim(),
    buildingNumber: Yup.string()
      .matches(NUMBERS_ONLY, t('BUILDING_NUMBER_VALIDATION'))
      .matches(NOT_MORE_THAN_FOUR_DIGITS, t('BUILDING_NUMBER_LENGTH_VALIDATION'))
      .required(t('REQUIRED'))
      .trim(),
    postalCode: Yup.string().matches(VALID_POSTAL_CODE, t('POSTAL_CODE_VALIDATION_MESSAGE_2')).required(t('REQUIRED')).trim(),
    streetNumber: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).required(t('REQUIRED')).trim(),
    width: Yup.number(),
    height: Yup.number().max(60, t('LBL_HEIGHT_MAX_60PX')),
    currency: Yup.object().required(t('REQUIRED')).nullable(),
    printingSettings: Yup.string()
      .matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS'))
      .required(t('REQUIRED'))
      .trim(),
    supplierPaymentDelay: Yup.number().min(0, t('VALIDATION_ENTER_NO_DAYS')),
    customerPaymentDelay: Yup.number().min(0, t('VALIDATION_ENTER_NO_DAYS')),
    taxNbr: Yup.string()
      // .required(t('REQUIRED'))
      .matches(VALID_TAX_NUMBER_REGEX, t('VALIDATION_TAX_NUMBER'))
      .test('is-3', t('TAX_NBR_3'), value => {
        if (!value) return true;
        const first = value.charAt(0);
        const last = value.charAt(value.length - 1);
        return first === '3' && last === '3';
      }),
    fax: Yup.string().matches(VALID_SAUDI_MOBILE_NUMBER, t('CUSTOMER_FAX_VALIDATION_MESSAGE')).trim(),
    telephone: Yup.string().matches(VALID_SAUDI_MOBILE_NUMBER, t('CUSTOMER_PHONE_VALIDATION_MESSAGE')).trim(),
    webSite: Yup.string().url(t('CUSTOMER_WEBSITE_VALIDATION_MESSAGE')).trim(),
    tier: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).trim(),
    zatca_code: Yup.string()
      .matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS'))
      .trim()
      .when('zatca_is_enabled', {
        is: true,
        then: Yup.string()
          .matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS'))
          .trim()
          .required(t('ZATICA_COMPANY_CODE_VALIDATION_MESSAGE'))
          .matches(CODE_REGEX, t('ZATCA_COMPANY_CODE_VALIDATION_MESSAGE_2'))
          .min(15, t('VALID_ZATCA_COMPANY_CODE_VALIDATION_MESSAGE'))
          .max(15, t('VALID_ZATCA_COMPANY_CODE_VALIDATION_MESSAGE')),
      }),
    printedCommercialRegister: Yup.string().test({
      name: 'match',
      exclusive: false,
      message: t('LBL_PRINTED_COMPANY_CR_MESSAGE'),
      test: function (value) {
        if (!value) return true;
        if (value.startsWith('FL-') && value.match(/^[F]?[L]?[-]?[0-9]{9}$/)) return true;
        if (value.match(/^[0-9]+$/)) return true;
        return false;
      },
    }),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
  });

  const { validateFormForSubmit } = useFormikSubmit(formik, () => setActionInProgress(false));

  const uploadLogo = address => {
    setActionInProgress(true);
    uploadDocument(getUploadUrl(MODELS.METAFILE), formik.values.logo, res => {
      if (res.data.status === 0) {
        saveRecord(address, res.data.data[0]);
      } else {
        setActionInProgress(false);
        dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'SOMETHING_WENT_WRONG' }));
      }
    });
  };

  const fetchAddress = () => {
    let payload = {
      data: {
        addressL7Country: formik.values.country ? { id: formik.values.country?.id } : null,
        city: formik.values.city ? { id: formik.values.city?.id } : null,
        zip: formik.values.postalCode || '',
        streetNumber: formik.values.streetNumber || '',
        street: null,
        addressL4: formik.values.buildingNumber || '',
        addressL3: formik.values.district || '',
        addressL6: getAddressL6(formik.values),
      },
    };

    if (data.addressID) {
      payload = {
        ...payload,
        data: {
          ...payload.data,
          id: data.addressID,
          version: data.addressVersion,
        },
      };
    }

    api('POST', getModelUrl(MODELS.ADDRESS), payload, res => {
      if (res.data.status === 0) {
        let address = null;

        if (res.data.data) {
          address = {
            id: res.data.data[0].id,
          };

          if (formik.values.logo && formik.values.logo instanceof File) {
            uploadLogo(address);
          } else {
            saveRecord(address);
          }
        }
      } else {
        setActionInProgress(false);
        dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'SOMETHING_WENT_WRONG' }));
      }
    });
  };

  const onGenerateZatcaCsrSuccess = response => {
    if (response.data.status !== 0) dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'SOMETHING_WENT_WRONG' }));
  };

  const generateZatcaCsr = () => {
    api('POST', getActionUrl(), { action: 'action-generate-csr' }, onGenerateZatcaCsrSuccess);
  };

  const onCompanyProfileSuccess = response => {
    if (checkFlashOrError(response.data.data)) {
      return dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'SOMETHING_WENT_WRONG' }));
    }
  };

  const saveCompanyProvisionInfo = async () => {
    const isValid = await validateFormForSubmit();
    if (!isValid) return null;

    setActionInProgress(true);
    api(
      'POST',
      getModelUrl(MODELS.COMPANY_PROVISION_INFO),
      {
        data: {
          company: {
            id: data.id,
            version: data.version,
            name: data.name,
          },
          zatca_is_enabled: formik.values.zatca_is_enabled,
          zatca_code: formik.values.zatca_is_enabled ? formik.values.zatca_code : '',
          id: data.companyInfoId,
          version: data.companyInfoVersion,
          website: formik.values.website,
          telephone: formik.values.telephone,
          fax: formik.values.fax,
          printedCommercialRegister: formik.values.printedCommercialRegister || formik.values.companyCr,
        },
      },
      res => {
        if (res.data.status === 0) {
          fetchAddress();
          api('GET', getCompanyProfileUrl(), null, onCompanyProfileSuccess);

          if (data && !data?.zatca_is_enabled && res.data.data?.returnedObj?.[0].zatca_is_enabled) {
            generateZatcaCsr();
          }
        }
      }
    );
  };

  const saveRecord = async (address, logoData) => {
    const isValid = await validateFormForSubmit();
    if (!isValid) return null;

    setActionInProgress(true);
    const currencyObj = currencySAR.name ? currencySAR : formik.values.currency || null;
    const tempBankDetailsList = bankDetailsList.map(({ ...keepAttrs }) => keepAttrs);

    let payload = {
      name: formik.values.name,
      code: formik.values.code,
      parent: formik.values.parent ? formik.values.parent : formik.values.parent === null ? data?.parent || null : null,
      partner: formik.values.partner ? formik.values.partner : formik.values.partner === null ? data?.partner || null : null,
      width: Number(formik.values.width),
      height: Number(formik.values.height),
      logo: logoData ? { fileName: logoData.fileName, id: logoData.id } : formik.values.logo ? (data.logo ? data.logo : null) : null,
      currency: currencyObj ? currencyObj : data.currency ? data.currency : null,
      printingSettings: data.printingSettings || null,
      defaultPartnerTypeSelect: Number(formik.values.defaultPartnerTypeSelect),
      defaultPartnerCategorySelect: Number(formik.values.defaultPartnerCategorySelect),
      timezone: formik.values.timezone !== '0' ? formik.values.timezone : null,
      supplierPaymentDelay: Number(formik.values.supplierPaymentDelay),
      customerPaymentDelay: Number(formik.values.customerPaymentDelay),
      language: formik.values.language ? formik.values.language : formik.values.language === null ? data?.language || null : null,
      defaultBankDetails:
        formik.values.defaultBankDetails && tempBankDetailsList?.find(bank => bank?.id === formik.values.defaultBankDetails?.id)
          ? formik.values.defaultBankDetails
          : null,
      address: address,
      bankDetailsList: tempBankDetailsList,
      taxNumberList: [
        {
          taxNbr: formik.values.taxNbr,
          id: data.taxNumberList ? (data.taxNumberList.length > 0 ? data.taxNumberList[0].id : null) : null,
          version: data.taxNumberList ? (data.taxNumberList.length > 0 ? data.taxNumberList[0].$version : null) : null,
        },
      ],
      weeklyPlanning: formik.values.weeklyPlanning,
      publicHolidayEventsPlanning: formik.values.publicHolidayEventsPlanning,
    };
    let savePayload = { data: { ...payload } };
    if (data.id)
      savePayload = {
        data: { ...payload, id: data.id, version: data.version },
      };
    api('POST', getModelUrl(MODELS.COMPANY), savePayload, res => {
      setActionInProgress(false);

      if (res.data.status === 0) {
        refreshData();
        dispatch(alertsActions.initiateAlert({ title: 'Success', message: 'LBL_COMPANY_PROFILE_SAVED' }));
      } else {
        dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'SOMETHING_WENT_WRONG' }));
      }
    });
  };

  useEffect(() => {
    if (isSave) {
      saveCompanyProvisionInfo();
      finshedSaveHandler();
    }
  }, [isSave]);

  useEffect(() => {
    tabsProps.setShowTabsContent(true);
  }, []);

  return (
    <Tabs
      {...tabsProps}
      isSeperateCard={true}
      formik={formik}
      submitFlag={isSave}
      tabsList={[
        {
          accessor: 'mainDetails',
          label: 'LBL_MAIN_DETAILS',
          relatedFields: [
            'name',
            'code',
            'country',
            'city',
            'district',
            'buildingNumber',
            'streetNumber',
            'postalCode',
            'taxNbr',
            'tier',
            'zatca_code',
            'website',
            'telephone',
            'fax',
          ],
        },
        {
          accessor: 'configuration',
          label: 'LBL_CONFIGURATION',
          relatedFields: [
            'parent',
            'partner',
            'width',
            'height',
            'logo',
            'currency',
            'printingSettings',
            'defaultPartnerTypeSelect',
            'defaultPartnerCategorySelect',
            'timezone',
            'supplierPaymentDelay',
            'customerPaymentDelay',
            'language',
          ],
        },
        {
          accessor: 'bankDetails',
          label: 'LBL_BANK_DETAILS',
          relatedFields: ['defaultBankDetails'],
        },
        {
          accessor: 'hrConfig',
          label: 'LBL_HR_CONFIGURATION',
          isHidden: !canEditHRConfig,
          relatedFields: ['weeklyPlanning', 'publicHolidayEventsPlanning'],
        },
      ]}
    >
      <MainDetails accessor="mainDetails" formik={formik} data={data} />
      <Configurations accessor="configuration" formik={formik} data={data} />
      <BankDetails
        accessor="bankDetails"
        formik={formik}
        data={data}
        bankDetailsList={bankDetailsList}
        setBankDetailsList={setBankDetailsList}
      />
      <HRConfiguration accessor="hrConfig" formik={formik} />
    </Tabs>
  );
}
