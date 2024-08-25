import { useEffect, useMemo } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import SearchModalAxelor from '../../../components/ui/inputs/SearchModal/SearchModalAxelor';
import BorderSection from '../../../components/ui/inputs/BorderSection';
import PhoneInputField from '../../../components/ui/inputs/PhoneInputField';
import TextInput from '../../../components/ui/inputs/TextInput';
import DropDown from '../../../components/ui/inputs/DropDown';
import ValueCard from '../../../components/ui/inputs/ValueCard';
import CheckboxInput from '../../../components/ui/inputs/CheckboxInput';
import AccountSituationTable from '../components/AccountSituationTable';

import { useAxiosFunction } from '../../../hooks/useAxios';
import { getModelUrl, getRemoveAllUrl } from '../../../services/getUrl';
import { MODELS } from '../../../constants/models';
import { setFieldValue } from '../../../utils/formHelpers';
import useMetaFields from '../../../hooks/metaFields/useMetaFields';
import {
  VALID_TEXT_WITH_SPECIAL_CHARS,
  VALID_SAUDI_MOBILE_NUMBER,
  VALID_POSTAL_CODE,
  VALID_TAX_NUMBER_REGEX,
} from '../../../constants/regex/Regex';
import { useFormikSubmit } from '../../../hooks/useFormikSubmit';
import { useFeatures } from '../../../hooks/useFeatures';
import { onCountriesSuccess, onCitiesSuccess } from '../../../utils/successFnHelpers';
import { defaultSAPayloadDomain, getAddressL6 } from '../../../utils/addressHelpers';
import { MODES } from '../../../constants/enums/FeaturesModes';
import { getItem, setItem } from '../../../utils/localStorage';
import { tourStepsActions } from '../../../store/tourSteps';

const PartnersForm = ({
  addNew,
  enableEdit,
  data,
  partnerConfig,
  isSave,
  isDelete,
  finishedActionHandler,
  alertHandler,
  setActionInProgress,
  isBalanceLoading,
  partnerBalance,
}) => {
  let mode = addNew ? 'add' : enableEdit ? 'edit' : 'view';
  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  const { getFeaturePath } = useFeatures(partnerConfig.feature, partnerConfig.subFeature);
  const dispatch = useDispatch();

  const partnerTypeSelect = useMetaFields('partner.partner.type.select');
  const paymentConditionsAddUrl = useMemo(() => getFeaturePath('PAYMENT_CONDITIONS', 'add'), []);
  const paymentModesAddUrl = useMemo(() => getFeaturePath('PAYMENT_MODES', 'add'), []);
  let accountingLines = useSelector(state => state.partnerAccounts.partnerAccounts);
  let company = useSelector(state => state.userFeatures.companyInfo.company);

  const initialValues = {
    partnerTypeSelect: addNew ? partnerTypeSelect.list[0].value : data.partnerTypeSelect.toString(),
    name: addNew || !data.name ? '' : data.name,
    isSupplier: addNew ? partnerConfig.subFeatureChecks.isSupplier : data.isSupplier,
    isCustomer: addNew ? partnerConfig.subFeatureChecks.isCustomer : data.isCustomer,
    fixedPhone: addNew || !data.fixedPhone ? '' : data.fixedPhone,
    fax: addNew || !data.fax ? '' : data.fax,
    mobilePhone: addNew || !data.mobilePhone ? '' : data.mobilePhone,
    emailAddress: addNew || !data.emailAddress ? '' : data.emailAddress.address,
    webSite: addNew || !data.webSite ? '' : data.webSite,
    country: addNew ? null : data.country || null,
    city: addNew ? null : data.city || null,
    district: addNew || !data.district ? '' : data.district,
    buildingNumber: addNew || !data.buildingNumber ? '' : data.buildingNumber,
    streetNumber: addNew || !data.streetNumber ? '' : data.streetNumber,
    postalCode: addNew || !data.postalCode ? '' : data.postalCode,
    currency: data.currency || null,
    inPaymentMode: addNew || !data.inPaymentMode ? null : data.inPaymentMode,
    outPaymentMode: addNew || !data.outPaymentMode ? null : data.outPaymentMode,
    paymentCondition: addNew || !data.paymentCondition ? null : data.paymentCondition,
    taxNbr: addNew || !data.taxNbr ? '' : data.taxNbr,
    checked:
      addNew && partnerConfig.subFeatureChecks.isSupplier
        ? ['supplier']
        : addNew && partnerConfig.subFeatureChecks.isCustomer
          ? ['customer']
          : data.isCustomer && data.isSupplier
            ? ['supplier', 'customer']
            : data.isCustomer
              ? ['customer']
              : ['supplier'],
    balance: '',
    registrationCode: data?.registrationCode || '',
  };

  const validationSchema = Yup.object().shape({
    partnerTypeSelect: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).required(t('REQUIRED')),
    name: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).required(t('REQUIRED')).trim(),
    currency: Yup.object().required(t('REQUIRED')).nullable(),
    emailAddress: Yup.string()
      .email(`* ${t('CUSTOMER_EMAIL_VALIDATION_MESSAGE')}`)
      .trim(),
    fixedPhone: Yup.string().matches(VALID_SAUDI_MOBILE_NUMBER, t('CUSTOMER_PHONE_VALIDATION_MESSAGE')).trim(),
    fax: Yup.string().matches(VALID_SAUDI_MOBILE_NUMBER, t('CUSTOMER_FAX_VALIDATION_MESSAGE')).trim(),
    mobilePhone: Yup.string().required(t('REQUIRED')).matches(VALID_SAUDI_MOBILE_NUMBER, t('CUSTOMER_PHONE_VALIDATION_MESSAGE')).trim(),
    webSite: Yup.string().url(t('CUSTOMER_WEBSITE_VALIDATION_MESSAGE')).trim(),
    country: Yup.object().required(t('REQUIRED')).nullable(),
    city: Yup.object().required(t('REQUIRED')).nullable(),
    district: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).required(t('REQUIRED')).trim(),
    buildingNumber: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).required(t('REQUIRED')).trim(),
    postalCode: Yup.string().matches(VALID_POSTAL_CODE, t('POSTAL_CODE_VALIDATION_MESSAGE_2')).required(t('REQUIRED')).trim(),
    streetNumber: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).required(t('REQUIRED')).trim(),
    inPaymentMode: Yup.object().required(t('REQUIRED')).nullable(),
    outPaymentMode: Yup.object().required(t('REQUIRED')).nullable(),
    paymentCondition: Yup.object().required(t('REQUIRED')).nullable(),
    taxNbr: Yup.string()
      .matches(VALID_TAX_NUMBER_REGEX, t('CUSTOMER_TAX_NUMBER_VALIDATION_MESSAGE'))
      .max(15, t('CUSTOMER_TAX_NUMBER_VALIDATION_MESSAGE'))
      .when(['partnerTypeSelect'], {
        is: partnerTypeSelect => Number(partnerTypeSelect) === 1,
        then: Yup.string()
          .trim()
          .matches(VALID_TAX_NUMBER_REGEX, t('CUSTOMER_TAX_NUMBER_VALIDATION_MESSAGE'))
          .max(15, t('CUSTOMER_TAX_NUMBER_VALIDATION_MESSAGE'))
          .test('is-3', t('TAX_NBR_3'), value => {
            if (!value) return true;
            const first = value.charAt(0);
            const last = value.charAt(value.length - 1);
            return first === '3' && last === '3';
          }),
      }),
    registrationCode: Yup.string()
      .matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS'))
      .when(['partnerTypeSelect'], {
        is: partnerTypeSelect => Number(partnerTypeSelect) === 1,
        then: Yup.string().trim().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')),
      }),
  });

  const saveRecord = async () => {
    if (getItem('isTour') === 'true') {
      setItem('isTour', 'false');
      dispatch(tourStepsActions.setIsTour('false'));
    }

    if (formik.values.checked?.length === 0) {
      setActionInProgress(false);
      return alertHandler('Error', t('VALIDATION_PARTNER_TYPE'));
    }

    if (!accountingLines || accountingLines?.length === 0) {
      setActionInProgress(false);
      return alertHandler('Error', 'ADD_ANALYTICLINE_MESSAGE');
    }

    setActionInProgress(true);

    let addressPayload = {
      data: {
        addressL7Country: formik.values.country ? { id: formik.values.country?.id } : null,
        city: formik.values.city ? { id: formik.values.city?.id } : null,
        addressL3: formik.values.district ?? '',
        addressL4: formik.values.buildingNumber ?? '',
        streetNumber: formik.values.streetNumber ?? '',
        zip: formik.values.postalCode ?? '',
        addressL6: getAddressL6(formik.values),
      },
    };

    if (enableEdit && data.addressID) {
      addressPayload = {
        ...addressPayload,
        data: {
          ...addressPayload.data,
          id: data.addressID,
          version: data.addressVersion,
        },
      };
    }

    const addressResponse = await api('POST', getModelUrl(MODELS.ADDRESS), addressPayload);

    if (addressResponse?.data?.status === -1 && addressResponse?.data?.data?.title === 'Unique constraint violation') {
      setActionInProgress(false);
      return alertHandler('Error', t('LBL_ADDRESS_ALREADY_EXIST'));
    }

    if (!(addressResponse?.data?.status === 0) || !addressResponse?.data?.data) {
      setActionInProgress(false);
      return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    }

    const address = {
      id: addressResponse.data.data[0].id,
    };

    let payload = {
      currency: formik.values.currency || null,
      name: formik.values.name,
      deliveryDelay: 0,
      emailAddress: {
        address: formik.values.emailAddress,
      },
      fax: formik.values.fax,
      fixedPhone: formik.values.fixedPhone,
      inPaymentMode: formik.values.inPaymentMode || null,
      isCustomer: formik.values.checked.includes('customer') ? true : false,
      isEmployee: false,
      isFactor: false,
      isInternal: false,
      isIspmRequired: false,
      isNeedingConformityCertificate: false,
      isProspect: false,
      isSubcontractor: false,
      isSupplier: formik.values.checked.includes('supplier') ? true : false,
      language: {
        code: 'en',
        name: 'English',
        id: 1,
      },
      mobilePhone: formik.values.mobilePhone,
      outPaymentMode: formik.values.outPaymentMode || null,
      partnerTypeSelect: Number(formik.values.partnerTypeSelect),
      paymentCondition: formik.values.paymentCondition || null,
      webSite: formik.values.webSite,
      accountingSituationList: accountingLines.length > 0 ? accountingLines : null,
      partnerAddressList: [
        {
          address: address,
          isInvoicingAddr: true,
          isDeliveryAddr: true,
        },
      ],
      companySet: [company],
      taxNbr: Number(formik.values.partnerTypeSelect) === 1 ? formik.values.taxNbr : null,
      registrationCode: Number(formik.values.partnerTypeSelect) === 1 ? formik.values.registrationCode : null,
    };
    let savePayload = { data: { ...payload } };
    if (enableEdit)
      savePayload = {
        data: { ...payload, id: data.id, version: data.version },
      };
    api('POST', getModelUrl(MODELS.PARTNER), savePayload, res => {
      setActionInProgress(false);

      if (res.data.status !== 0) return finishedActionHandler('error', partnerConfig.messages.saveErrorMessage);
      finishedActionHandler('Success', partnerConfig.messages.saveSuccessMessage);
    });
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: addNew ? true : false,
    validateOnChange: true,
    onSubmit: saveRecord,
  });

  const { handleFormikSubmit } = useFormikSubmit(formik, alertHandler);

  const deleteRecord = () => {
    setActionInProgress(true);
    const payload = {
      records: [{ id: data.id }],
    };
    api('POST', getRemoveAllUrl(MODELS.PARTNER), payload, res => {
      setActionInProgress(false);

      if (res.data.status !== 0) return finishedActionHandler('error', partnerConfig.messages.deleteErrorMessage);
      finishedActionHandler('Success', partnerConfig.messages.deleteSuccessMessage);
    });
  };

  useEffect(() => {
    if (isSave) handleFormikSubmit();
    if (isDelete) deleteRecord();
  }, [isSave, isDelete, addNew, enableEdit]);

  const customDefaultSuccess = async response => {
    if (
      response?.data?.status !== 0 ||
      response?.data?.total === null ||
      response?.data?.total === undefined ||
      response?.data?.total === 0 ||
      response?.data?.data?.length === 0
    )
      return;
    let country = response.data.data[0];
    country.name = country['$t:name'];
    setFieldValue(formik, 'country', country || null);
  };

  const onInPaymentModeSuccessCallback = list => {
    if (formik.values.inPaymentMode === '' && addNew) {
      setFieldValue(formik, 'inPaymentMode', list[0]?.label ?? '');
    }
  };

  const onOutPaymentModeSuccessCallback = list => {
    if (formik.values.outPaymentMode === '' && addNew) {
      setFieldValue(formik, 'outPaymentMode', list[0]?.label ?? '');
    }
  };

  const onPaymentConditionSuccess = response => {
    if (response.data.status === 0) {
      let data = response.data.data;
      let temp3 = [];

      if (data) {
        data.forEach(paymentCondition => {
          let obj = {
            id: paymentCondition.id,
            name: paymentCondition.name,
            code: paymentCondition.code,
            type: paymentCondition.typeSelect,
          };

          temp3.push(obj);
        });
      }

      return { displayedData: [...temp3], total: response.data.total || 0 };
    }
  };

  return (
    <>
      <div className="card">
        <div className="row">
          <div className="row step-add-customer-1">
            <div className="col-md-4">
              <DropDown
                formik={formik}
                accessor="partnerTypeSelect"
                label={partnerConfig.labels.partnerType}
                isRequired={true}
                keys={{ valueKey: 'value', titleKey: 'label' }}
                options={partnerTypeSelect.list}
                translate={partnerTypeSelect.mode === 'enum'}
                mode={mode}
                initialValue={0}
              />
            </div>
            <div className="col-md-4 ">
              <TextInput formik={formik} label="LBL_NAME" accessor="name" mode={mode} isRequired={true} />
            </div>
            <div className="col-md-4 d-flex justify-content-end">
              {mode === MODES.VIEW && (
                <ValueCard
                  linkTo={`/transactions/${data.id}` + partnerConfig.partner.partnerTransactionPath}
                  title="LBL_BALANCE"
                  content={`${partnerBalance} ${t('LBL_SAR')}`}
                  isLoading={isBalanceLoading}
                />
              )}
            </div>
            <div className="row">
              <div className="col-md-4 checkbox-container">
                <CheckboxInput
                  formik={formik}
                  value="customer"
                  accessor="checked"
                  mode={mode}
                  label="LBL_CUSTOMER"
                  isOnlyCheckboxesInRow={true}
                />
                <CheckboxInput
                  formik={formik}
                  value="supplier"
                  accessor="checked"
                  mode={mode}
                  label="LBL_SUPPLIER"
                  isOnlyCheckboxesInRow={true}
                />
              </div>
            </div>
          </div>
          <BorderSection title={partnerConfig.labels.partnerInfo} />
          <div className="row step-add-customer-3">
            <div className="col-md-4">
              <PhoneInputField formik={formik} label="LBL_MOBILE_NUMBER" identifier="mobilePhone" mode={mode} isRequired={true} />
            </div>
            <div className="col-md-4">
              <PhoneInputField formik={formik} label="LBL_FAX" identifier="fax" mode={mode} />
            </div>
            <div className="col-md-4">
              <PhoneInputField formik={formik} label="LBL_PHONE" identifier="fixedPhone" mode={mode} />
            </div>
            {Number(formik.values.partnerTypeSelect) === 1 && (
              <div className="col-md-6">
                <TextInput formik={formik} label="LBL_COMPANY_CR" accessor="registrationCode" mode={mode} />
              </div>
            )}
            {Number(formik.values.partnerTypeSelect) === 1 && (
              <div className="col-md-6">
                <TextInput formik={formik} label="LBL_TAX_NUMBER" accessor="taxNbr" mode={mode} maxLength={15} />
              </div>
            )}
            <div className="col-md-6">
              <TextInput formik={formik} label="LBL_EMAIL_ADDRESS" accessor="emailAddress" mode={mode} />
            </div>
            <div className="col-md-6">
              <TextInput formik={formik} label="LBL_WEBSITE" accessor="webSite" mode={mode} />
            </div>
          </div>
          <BorderSection title={partnerConfig.labels.partnerAddress} />
          <div className="row step-add-customer-4">
            <div className="col-md-4" key="country">
              <SearchModalAxelor
                formik={formik}
                modelKey="COUNTRIES"
                mode={mode}
                isRequired={true}
                defaultValueConfig={{
                  payloadDomain: defaultSAPayloadDomain,
                  customDefaultSuccess: customDefaultSuccess,
                }}
                onSuccess={onCountriesSuccess}
                selectCallback={() => {
                  setFieldValue(formik, 'city', null);
                }}
                removeCallback={() => {
                  setFieldValue(formik, 'city', null);
                }}
              />
            </div>
            <div className="col-md-4">
              <SearchModalAxelor
                formik={formik}
                modelKey="CITY"
                mode={mode}
                isRequired={true}
                defaultValueConfig={formik.values.country?.id ? { payloadDomain: `self.country.id = ${formik.values.country?.id}` } : null}
                payloadDomain={`self.country.id = ${formik.values.country?.id}`}
                onSuccess={onCitiesSuccess}
              />
            </div>
            <div className="col-md-4">
              <TextInput formik={formik} label="LBL_DISTRICT" accessor="district" mode={mode} isRequired={true} />
            </div>

            <div className="col-md-4">
              <TextInput formik={formik} label="LBL_BUILDING_NUMBER" accessor="buildingNumber" mode={mode} isRequired={true} />
            </div>
            <div className="col-md-4">
              <TextInput formik={formik} label="LBL_STREET_NUMBER" accessor="streetNumber" mode={mode} isRequired={true} />
            </div>
            <div className="col-md-4">
              <TextInput formik={formik} label="LBL_POSTAL_CODE" accessor="postalCode" mode={mode} isRequired={true} maxLength={5} />
            </div>
          </div>
          <BorderSection title="LBL_PAYMENT_DETAILS" />
          <div className="row step-add-customer-5">
            <div className="col-md-6" key="currency">
              <SearchModalAxelor formik={formik} modelKey="CURRENCIES" mode={mode} disabled={true} payloadDomain="self.codeISO='SAR'" />
            </div>
            <div className="col-md-6">
              <SearchModalAxelor
                formik={formik}
                modelKey={partnerConfig.modelsEnum.inPaymentModes}
                mode={mode}
                onSuccessCallback={onInPaymentModeSuccessCallback}
                isRequired={true}
                tooltip={partnerConfig.tooltips.inPaymentMode}
                payloadDomain="self.inOutSelect = 1"
                extraFields={['inOutSelect']}
                addConfig={{ path: paymentModesAddUrl }}
                defaultValueConfig={{ payloadDomain: "self.inOutSelect = 1 AND self.code = 'CC'" }}
              />
            </div>
            <div className="col-md-6">
              <SearchModalAxelor
                formik={formik}
                modelKey={partnerConfig.modelsEnum.outPaymentModes}
                mode={mode}
                onSuccessCallback={onOutPaymentModeSuccessCallback}
                isRequired={true}
                tooltip={partnerConfig.tooltips.outPaymentMode}
                payloadDomain="self.inOutSelect = 2"
                extraFields={['inOutSelect']}
                addConfig={{ path: paymentModesAddUrl }}
                defaultValueConfig={{ payloadDomain: "self.inOutSelect = 2 AND self.code = 'CP'" }}
              />
            </div>
            <div className="col-md-6">
              <SearchModalAxelor
                formik={formik}
                modelKey="PAYMENT_CONDITIONS"
                mode={mode}
                onSuccess={onPaymentConditionSuccess}
                isRequired={true}
                tooltip={partnerConfig.tooltips.paymentCondition}
                addConfig={{ path: paymentConditionsAddUrl }}
              />
            </div>
          </div>
          <div className="row step-add-customer-6">
            <AccountSituationTable formik={formik} mode={mode} />
          </div>
        </div>
      </div>
    </>
  );
};

export default PartnersForm;
