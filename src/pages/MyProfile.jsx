import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { enc, AES, mode as encMode, pad } from 'crypto-js';

import Toolbar from '../parts/Toolbar';
import MoreAction from '../parts/MoreAction';
import ErrorMessage from '../components/ui/inputs/ErrorMessage';
import Calendar from '../components/ui/Calendar';
import BackButton from '../components/ui/buttons/BackButton';
import PrimaryButton from '../components/ui/buttons/PrimaryButton';
import PhoneInputField from '../components/ui/inputs/PhoneInputField';
import CheckboxInput from '../components/ui/inputs/CheckboxInput';
import TextInput from '../components/ui/inputs/TextInput';
import SearchModalAxelor from '../components/ui/inputs/SearchModal/SearchModalAxelor';
import FormNotes from '../components/ui/FormNotes';
import DropDown from '../components/ui/inputs/DropDown';

import { MODELS } from '../constants/models';
import { useAxiosFunction } from '../hooks/useAxios';
import { getActionUrl, getMyProfileUrl, getUploadUrl } from '../services/getUrl';
import eye from '../assets/images/eye.svg';
import eyeoff from '../assets/images/eye-off.svg';
import {
  VALID_SAUDI_MOBILE_NUMBER,
  VALID_TEXT_WITH_SPECIAL_CHARS,
  VALID_POSTAL_CODE,
  VALID_PASSWORD_WITH_SPECIAL_CHARS,
  NOT_MORE_THAN_FOUR_DIGITS,
  NUMBERS_ONLY,
} from '../constants/regex/Regex';
import { alertsActions } from '../store/alerts';
import { LANGUAGES } from '../constants/LanguageEnum';
import { setAllValues, setFieldValue } from '../utils/formHelpers';
import { onCountriesSuccess, onCitiesSuccess } from '../utils/successFnHelpers';
import { changeSystemLanguage } from '../utils/helpers';
import { defaultSAPayloadDomain, getAddressL6 } from '../utils/addressHelpers';
import { getItem } from '../utils/localStorage';
import UserProfileFileInput from '../components/ui/inputs/UserProfileFileInput';
import { userFeaturesActions } from '../store/userFeatures';

function MyProfile() {
  const [mode, setMode] = useState('view');
  let userProfile = useSelector(state => state.userFeatures.userData);
  let userId = userProfile ? (userProfile.id ? userProfile.id : -1) : -1;
  let userImg = null;

  const { api, uploadDocument } = useAxiosFunction();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [currentPasswordState, setCurrentPasswordState] = useState(true);
  const [newPasswordState, setNewPasswordState] = useState(true);
  const [confirmNewPasswordState, setConfirmNewPasswordState] = useState(true);

  const [buttonClicked, setButtonCliked] = useState(false);

  const [showMoreActionToolbar, setShowMoreActionToolbar] = useState(false);

  const [genderOptions] = useState([
    { name: 'LBL_MALE', value: 1 },
    { name: 'LBL_FEMALE', value: 2 },
  ]);

  const initVals = {
    name: '',
    titleSelect: 1,
    img: null,
    userEmail: '',
    userMobilePhone: '',
    userFixedPhone: '',
    addAddress: false,
    country: null,
    city: null,
    district: '',
    buildingNumber: '',
    streetNumber: '',
    postalCode: '',
    password: '',
    newPassword: '',
    confirmNewPassword: '',
    changePassword: false,
    language: 'en',
  };

  const valSchema = Yup.object().shape({
    name: Yup.string()
      .matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS'))
      .trim()
      .min(1, t('CUSTOMER_NAME_VALIDATION_MESSAGE')),
    titleSelect: Yup.number().required(t('REQUIRED')),

    password: Yup.string()
      .trim()
      .when('changePassword', {
        is: true,
        then: Yup.string()
          .trim()
          .required(t('LOGIN_PASSWORD_REQUIRED_VALIDATION_MESSAGE'))
          .matches(VALID_PASSWORD_WITH_SPECIAL_CHARS, t('VALID_PASSWORD_VALIDATION_MESSAGE')),
      }),
    newPassword: Yup.string()
      .trim()
      .when('changePassword', {
        is: true,
        then: Yup.string()
          .trim()
          .required(t('PASSWORD_VALIDATION_MESSAGE'))
          .matches(VALID_PASSWORD_WITH_SPECIAL_CHARS, t('VALID_PASSWORD_VALIDATION_MESSAGE')),
      }),
    confirmNewPassword: Yup.string()
      .trim()
      .when('changePassword', {
        is: true,
        then: Yup.string()
          .trim()
          .required(t('RETYPE_PASSWORD_VALIDATION_MESSAGE'))
          .oneOf([Yup.ref('newPassword'), null], t('VALID_RETYPE_PASSWORD_VALIDATION_MESSAGE')),
      }),
    userEmail: Yup.string().trim().email(t('CUSTOMER_EMAIL_VALIDATION_MESSAGE')).required(t('LOGIN_EMAIL_VALIDATION_MESSAGE')),
    userMobilePhone: Yup.string().trim().matches(VALID_SAUDI_MOBILE_NUMBER, t('CUSTOMER_MOBILE_VALIDATION_MESSAGE')),
    userFixedPhone: Yup.string().trim().matches(VALID_SAUDI_MOBILE_NUMBER, t('CUSTOMER_PHONE_VALIDATION_MESSAGE')),
    country: Yup.object()
      .nullable()
      .when('addAddress', {
        is: true,
        then: Yup.object().required(t('CUSTOMER_COUNTRY_VALIDATION_MESSAGE')).nullable(),
      }),
    city: Yup.object()
      .nullable()
      .when('addAddress', {
        is: true,
        then: Yup.object().nullable().required(t('CUSTOMER_CITY_VALIDATION_MESSAGE')),
      }),
    district: Yup.string()
      .matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS'))
      .when('addAddress', {
        is: true,
        then: Yup.string()
          .matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS'))
          .trim()
          .required(t('CUSTOMER_DISTRACT_VALIDATION_MESSAGE')),
      }),
    buildingNumber: Yup.string()
      .matches(NUMBERS_ONLY, t('BUILDING_NUMBER_VALIDATION'))
      .matches(NOT_MORE_THAN_FOUR_DIGITS, t('BUILDING_NUMBER_LENGTH_VALIDATION'))
      .when('addAddress', {
        is: true,
        then: Yup.string()
          .matches(NUMBERS_ONLY, t('BUILDING_NUMBER_VALIDATION'))
          .matches(NOT_MORE_THAN_FOUR_DIGITS, t('BUILDING_NUMBER_LENGTH_VALIDATION'))
          .trim()
          .required(t('CUSTOMER_BUILDING_NUMBER_VALIDATION_MESSAGE')),
      }),
    streetNumber: Yup.string()
      .matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS'))
      .when('addAddress', {
        is: true,
        then: Yup.string()
          .matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS'))
          .trim()
          .required(t('CUSTOMER_STREET_NUMBER_VALIDATION_MESSAGE')),
      }),
    postalCode: Yup.string()
      .matches(VALID_POSTAL_CODE, t('POSTAL_CODE_VALIDATION_MESSAGE_2'))
      .when('addAddress', {
        is: true,
        then: Yup.string()
          .matches(VALID_POSTAL_CODE, t('POSTAL_CODE_VALIDATION_MESSAGE_2'))
          .trim()
          .required(t('CUSTOMER_POSTAL_CODE_VALIDATION_MESSAGE_1')),
      }),
    language: Yup.string().required(t('REQUIRED')),
  });

  const formik = useFormik({
    initialValues: initVals,
    validationSchema: valSchema,
    validateOnMount: true,
  });

  const getEncryptedPassword = password => {
    const keyBase64 = import.meta.env.VITE_SECRET;
    let key = enc.Base64.parse(keyBase64);
    let srcs = enc.Utf8.parse(password);
    let encrypted = AES.encrypt(srcs, key, {
      mode: encMode.ECB,
      padding: pad.Pkcs7,
    });
    return encrypted.toString();
  };

  const saveUser = async pictureID => {
    if (!formik.isValid || userId === -1)
      return dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'PLEASE_FILL_REQUIRED_ERROR_MESSAGE' }));
    setButtonCliked(true);
    let createUserPayload = {
      data: {
        requestObject: {
          id: userId,
          name: formik.values.name,
          language: formik.values.language,
          code: formik.values.userEmail,
          email: formik.values.userEmail,
          partner: {
            name: formik.values.name,
            fixedPhone: formik.values.userFixedPhone,
            mobilePhone: formik.values.userMobilePhone,
            titleSelect: formik?.values?.titleSelect,
            img: pictureID ? { id: pictureID } : null,
          },
        },
      },
    };

    let requestObject = { ...createUserPayload.data.requestObject };

    if (formik.values.newPassword !== '') {
      requestObject.password = getEncryptedPassword(formik.values.password);
      requestObject.newPassword = getEncryptedPassword(formik.values.newPassword);
    }

    if (formik.values.addAddress) {
      requestObject.partner.address = {
        addressL7Country: formik.values.country ? { id: formik.values.country?.id } : null,
        city: formik.values.city ? { id: formik.values.city?.id } : null,
        zip: formik.values.postalCode || '',
        streetNumber: formik.values.streetNumber || '',
        street: null,
        addressL4: formik.values.buildingNumber || '',
        addressL3: formik.values.district || '',
        addressL6: getAddressL6(formik.values),
      };
    }

    createUserPayload.data.requestObject = { ...requestObject };

    const response = await api('POST', getMyProfileUrl(), createUserPayload);
    setButtonCliked(false);
    if (response.data.status !== 'Ok') return dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'SOMETHING_WENT_WRONG' }));

    dispatch(alertsActions.initiateAlert({ title: 'Success', message: 'USER_PROFILE_UPDATED_SUCCESSFULLY' }));
    changeSystemLanguage(formik.values.language);

    if (userProfile?.id === userId) {
      dispatch(userFeaturesActions.setUserPartnerImg(userImg));
      dispatch(userFeaturesActions.setUserPartnerTitleSelect(parseInt(formik.values.titleSelect)));
    }

    setTimeout(() => {
      navigate('/home');
    }, [3000]);
  };

  useEffect(() => {
    if (mode === 'view') {
      let address = userProfile?.partner?.address || null;
      setAllValues(formik, {
        name: userProfile?.name ?? '',
        userEmail: userProfile?.email ?? '',
        userMobilePhone: userProfile?.partner?.mobilePhone ?? '',
        userFixedPhone: userProfile?.partner?.fixedPhone ?? '',
        addAddress: address ? true : false,
        country: address?.addressL7Country ? { id: address?.addressL7Country?.id, name: address?.addressL7Country['$t:name'] } : null,
        city: address?.city ? { id: address?.city?.id, name: address?.city['$t:name'] } : null,
        district: address?.addressL3 ?? '',
        buildingNumber: address?.addressL4 ?? '',
        streetNumber: address?.streetNumber ?? '',
        postalCode: address?.zip ?? '',
        addressL6: address?.addressL6 ?? '',
        password: '',
        newPassword: '',
        confirmNewPassword: '',
        changePassword: false,
        language: userProfile?.language ?? getItem('code'),
        titleSelect: userProfile?.partner?.titleSelect?.toString() !== '0' ? userProfile?.partner?.titleSelect?.toString() : '1',
        img: userProfile?.partner?.img || null,
      });
    }
  }, [mode]);

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

  const viewHandler = () => {
    setMode('view');
  };

  const editHandler = () => {
    setMode('edit');
  };

  const alertHandler = (title, message) => {
    dispatch(alertsActions.initiateAlert({ title, message }));
  };

  const uploadPicture = async () => {
    const response = await uploadDocument(getUploadUrl(MODELS.METAFILE), formik.values.img);
    let status = response.data.status;
    let data = response.data.data;

    if (!response.data || status !== 0 || !data) {
      return alertHandler('Error', 'LBL_ERROR_UPLOADING_PRODUCT_PICTURE');
    }

    userImg = {
      id: data[0].id,
    };
    saveUser(data[0].id);
  };

  return (
    <>
      {buttonClicked && <div className="lodingpage"></div>}
      {showMoreActionToolbar && (
        <MoreAction
          showMoreAction={showMoreActionToolbar}
          setShowMoreAction={setShowMoreActionToolbar}
          canSelectAll={false}
          viewHandler={mode === 'edit' ? viewHandler : null}
          editHandler={mode === 'view' ? editHandler : null}
        />
      )}
      <div className="page-body">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <Calendar />
              {mode === 'view' && (
                <div className="breadcrumb-page float-start">
                  <p>
                    <span>{t('LBL_VIEW_USER_PROFILE')}</span>
                  </p>
                </div>
              )}
              {mode === 'edit' && (
                <div className="breadcrumb-page float-start">
                  <p>
                    <span>{t('LBL_EDIT_USER_PROFILE')}</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                {mode === 'edit' && <h4>{t('LBL_EDIT_USER_PROFILE')} </h4>}
                {mode === 'view' && <h4>{t('LBL_VIEW_USER_PROFILE')} </h4>}
              </div>
              <div className="reverse-page float-end">
                <BackButton />
                {mode === 'edit' && (
                  <PrimaryButton
                    onClick={() => {
                      if (formik.values.img) {
                        setButtonCliked(true);
                        uploadPicture();
                      } else {
                        saveUser(null);
                      }
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-12">
              <Toolbar
                canSelectAll={false}
                viewHandler={mode === 'edit' ? viewHandler : null}
                editHandler={mode === 'view' ? editHandler : null}
                setShowMoreAction={setShowMoreActionToolbar}
              />
              <div className="card">
                <div className="row">
                  <div className="col-md-9">
                    <div className="row">
                      <div className="col-md-6">
                        <TextInput
                          formik={formik}
                          label="LBL_NAME"
                          accessor="name"
                          mode={mode}
                          disabled={mode === 'view'}
                          isRequired={true}
                        />{' '}
                      </div>
                      <div className="col-md-6">
                        <TextInput formik={formik} label="LBL_EMAIL_ADDRESS" accessor="userEmail" mode="view" />
                      </div>
                      <div className="col-md-4">
                        <PhoneInputField formik={formik} label="LBL_MOBILE_NUMBER" identifier="userMobilePhone" mode={mode} />
                      </div>
                      <div className="col-md-4">
                        <PhoneInputField formik={formik} label="LBL_PHONE" identifier="userFixedPhone" mode={mode} />
                      </div>
                      <div className="col-md-6">
                        <DropDown
                          options={genderOptions}
                          formik={formik}
                          isRequired={true}
                          label="LBL_GENDER"
                          accessor="titleSelect"
                          type="INTEGER"
                          keys={{ valueKey: 'value', titleKey: 'name' }}
                          translate={true}
                          mode={mode}
                        />
                      </div>
                      <div className="col-md-4">
                        <DropDown
                          options={LANGUAGES.list}
                          formik={formik}
                          isRequired={true}
                          label="LBL_LANGUAGE"
                          accessor="language"
                          keys={{ valueKey: 'value', titleKey: 'title' }}
                          mode={mode}
                          type={LANGUAGES.type}
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mt-4 mb-4 step-add-customer-2">
                        {mode === 'edit' && (
                          <>
                            <CheckboxInput formik={formik} accessor="addAddress" label="LBL_ADD_ADDRESS" mode={mode} />
                            <CheckboxInput formik={formik} accessor="changePassword" label="LBL_CHANGE_PASSWORD" mode="edit" />
                          </>
                        )}
                      </div>
                      {(formik.values.addAddress || (userProfile?.partner?.address && mode === 'view')) && (
                        <>
                          <div className="border-section"></div>
                          <div className="row step-add-customer-4">
                            <div className="section-title">
                              <h4>{t('LBL_USER_ADDRESS')}</h4>
                            </div>
                            <div className="col-md-4">
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
                                defaultValueConfig={
                                  formik.values.country?.id ? { payloadDomain: `self.country.id = ${formik.values.country?.id}` } : null
                                }
                                payloadDomain={`self.country.id = ${formik.values.country?.id}`}
                                onSuccess={onCitiesSuccess}
                              />
                            </div>
                            <div className="col-md-4">
                              <TextInput
                                formik={formik}
                                label="LBL_DISTRICT"
                                accessor="district"
                                mode={mode}
                                isRequired={true}
                                disabled={mode === 'view'}
                              />
                            </div>
                            <div className="col-md-4">
                              <TextInput
                                formik={formik}
                                label="LBL_BUILDING_NUMBER"
                                accessor="buildingNumber"
                                mode={mode}
                                isRequired={true}
                                disabled={mode === 'view'}
                              />
                            </div>
                            <div className="col-md-4">
                              <TextInput
                                formik={formik}
                                label="LBL_STREET_NUMBER"
                                accessor="streetNumber"
                                mode={mode}
                                isRequired={true}
                                disabled={mode === 'view'}
                              />
                            </div>
                            <div className="col-md-4">
                              <TextInput
                                formik={formik}
                                label="LBL_POSTAL_CODE"
                                accessor="postalCode"
                                mode={mode}
                                isRequired={true}
                                disabled={mode === 'view'}
                              />
                            </div>
                          </div>
                        </>
                      )}
                      {mode === 'edit' && (
                        <>
                          {formik.values.changePassword && (
                            <>
                              <div className="border-section"></div>
                              <div className="section-title">
                                <h4>{t('LBL_CHANGE_PASSWORD')}</h4>
                              </div>
                              <div className="col-md-6">
                                <div className="search-ex">
                                  <label className="form-label" htmlFor="full-name">
                                    {t('LBL_CURRENT_PASSWORD')}
                                    <span>*</span>
                                  </label>
                                  {!currentPasswordState && (
                                    <button
                                      className="btn"
                                      type="button"
                                      onClick={() => {
                                        setCurrentPasswordState(!currentPasswordState);
                                      }}
                                    >
                                      <img src={eyeoff} alt={eyeoff} />
                                    </button>
                                  )}
                                  {currentPasswordState && (
                                    <button
                                      className="btn"
                                      type="button"
                                      onClick={() => {
                                        setCurrentPasswordState(!currentPasswordState);
                                      }}
                                    >
                                      <img src={eye} alt={eye} />
                                    </button>
                                  )}

                                  <input
                                    type={currentPasswordState ? 'password' : 'text'}
                                    className="form-control"
                                    id="Label"
                                    placeholder={t('LBL_CURRENT_PASSWORD')}
                                    name="password"
                                    value={formik.values.password}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                  />
                                </div>
                                <ErrorMessage formik={formik} mode={mode} identifier="password" />
                              </div>
                              <div className="col-md-6"></div>
                              <div className="col-md-6">
                                <div className="search-ex">
                                  <label className="form-label" htmlFor="full-name">
                                    {t('LBL_NEW_PASSWORD')}
                                    <span>*</span>
                                  </label>
                                  {!newPasswordState && (
                                    <button
                                      className="btn"
                                      type="button"
                                      onClick={() => {
                                        setNewPasswordState(!newPasswordState);
                                      }}
                                    >
                                      <img src={eyeoff} alt={eyeoff} />
                                    </button>
                                  )}
                                  {newPasswordState && (
                                    <button
                                      className="btn"
                                      type="button"
                                      onClick={() => {
                                        setNewPasswordState(!newPasswordState);
                                      }}
                                    >
                                      <img src={eye} alt={eye} />
                                    </button>
                                  )}

                                  <input
                                    type={newPasswordState ? 'password' : 'text'}
                                    className="form-control"
                                    id="Label"
                                    placeholder={t('LBL_NEW_PASSWORD')}
                                    name="newPassword"
                                    value={formik.values.newPassword}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                  />
                                </div>
                                <ErrorMessage formik={formik} mode={mode} identifier="newPassword" />
                              </div>
                              <div className="col-md-6">
                                <div className="search-ex">
                                  <label className="form-label" htmlFor="full-name">
                                    {t('LBL_RETYPE_NEW_PASSWORD')}
                                    <span>*</span>
                                  </label>
                                  {!confirmNewPasswordState && (
                                    <button
                                      className="btn"
                                      type="button"
                                      onClick={() => {
                                        setConfirmNewPasswordState(!confirmNewPasswordState);
                                      }}
                                    >
                                      <img src={eyeoff} alt={eyeoff} />
                                    </button>
                                  )}
                                  {confirmNewPasswordState && (
                                    <button
                                      className="btn"
                                      type="button"
                                      onClick={() => {
                                        setConfirmNewPasswordState(!confirmNewPasswordState);
                                      }}
                                    >
                                      <img src={eye} alt={eye} />
                                    </button>
                                  )}

                                  <input
                                    type={confirmNewPasswordState ? 'password' : 'text'}
                                    className="form-control"
                                    id="Label"
                                    placeholder={t('LBL_RETYPE_NEW_PASSWORD')}
                                    name="confirmNewPassword"
                                    value={formik.values.confirmNewPassword}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                  />
                                </div>
                                <ErrorMessage formik={formik} mode={mode} identifier="confirmNewPassword" />
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  {formik.values.titleSelect && (
                    <>
                      <div className="col-md-3">
                        <UserProfileFileInput
                          formik={formik}
                          identifier="img"
                          label="LBL_USER_PICTURE"
                          alertHandler={alertHandler}
                          mode={mode}
                          parentId={null}
                          fileId={formik?.values?.img?.id}
                          tableModel={MODELS.PARTNER}
                        />
                      </div>
                    </>
                  )}
                </div>
                {mode === 'edit' && (
                  <FormNotes
                    notes={[
                      {
                        title: 'LBL_REQUIRED_NOTIFY',
                        type: 3,
                      },
                    ]}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MyProfile;
