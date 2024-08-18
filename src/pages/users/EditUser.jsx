import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Multiselect from 'multiselect-react-dropdown';
import { useDispatch, useSelector } from 'react-redux';

import Features from './Features';
import SearchModalAxelor from '../../components/ui/inputs/SearchModal/SearchModalAxelor';
import Calendar from '../../components/ui/Calendar';
import BreadCrumb from '../../components/ui/BreadCrumb';
import ConfirmationPopup from '../../components/ConfirmationPopup';
import MoreAction from '../../parts/MoreAction';
import BackButton from '../../components/ui/buttons/BackButton';
import PhoneInputField from '../../components/ui/inputs/PhoneInputField';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';
import TextInput from '../../components/ui/inputs/TextInput';
import CheckboxInput from '../../components/ui/inputs/CheckboxInput';
import FormNotes from '../../components/ui/FormNotes';
import UserProfileFileInput from '../../components/ui/inputs/UserProfileFileInput';
import DropDown from '../../components/ui/inputs/DropDown';
import Spinner from '../../components/Spinner/Spinner';

import { MODELS } from '../../constants/models';
import { useAxiosFunction } from '../../hooks/useAxios';
import {
  getAssignUserPermissionsUrl,
  getUploadUrl,
  getUserGroupsUrl,
  getUserProfileByIdUrl,
  getUserProfilesUrl,
} from '../../services/getUrl';
import { useFeatures } from '../../hooks/useFeatures';
import {
  VALID_SAUDI_MOBILE_NUMBER,
  VALID_TEXT_WITH_SPECIAL_CHARS,
  VALID_POSTAL_CODE,
  NOT_MORE_THAN_FOUR_DIGITS,
  NUMBERS_ONLY,
} from '../../constants/regex/Regex';
import { alertsActions } from '../../store/alerts';
import { useFormikSubmit } from '../../hooks/useFormikSubmit';
import { onCountriesSuccess, onCitiesSuccess } from '../../utils/successFnHelpers';
import { setFieldValue, setAllValues } from '../../utils/formHelpers';
import { defaultSAPayloadDomain, getAddressL6 } from '../../utils/addressHelpers';
import { getItem } from '../../utils/localStorage';
import { checkFlashOrError } from '../../utils/helpers';
import { userFeaturesActions } from '../../store/userFeatures';
import ActionsProgessBar from '../../parts/ActionsProgessBar';

let features = [];
let userImg = null;

function EditUser({ feature, subFeature }) {
  const actionEnum = {
    1: 'LBL_VIEW',
    2: 'LBL_ADD',
    3: 'LBL_EDIT',
    4: 'LBL_DELETE',
  };
  Object.freeze(actionEnum);
  const { api, uploadDocument } = useAxiosFunction();
  const { t } = useTranslation();
  const url = window.location.href.split('/');
  const id = parseInt(url[url.length - 1]);
  const navigate = useNavigate();
  const { canView, canDelete, getFeaturePath } = useFeatures(feature, subFeature);
  let userData = useSelector(state => state?.userFeatures?.userData);

  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [assignedUserFeatures, setAssignedUserFeatures] = useState([]);
  const [buttonClicked, setButtonCliked] = useState(false);
  const [tempChecked, setTempChecked] = useState([]);
  const [initChecked, setInitChecked] = useState([]);

  const [selectedGroups, setSelectedGroups] = useState([]);
  const [displayedUsersGroups, setDisplayedUsersGroups] = useState([]);

  const [showDeletePop, setShowDeletePop] = useState(false);
  const [showMoreActionToolbar, setShowMoreActionToolbar] = useState(false);
  const [deleteUser, setDeleteUser] = useState({
    id: -1,
  });
  const [disableActionButton, setDisableActionButton] = useState(false);
  const [genderOptions] = useState([
    { name: 'LBL_MALE', value: 1 },
    { name: 'LBL_FEMALE', value: 2 },
  ]);

  const initVals = {
    name: '',
    titleSelect: 0,
    img: null,
    userEmail: '',
    userMobilePhone: '',
    userFixedPhone: '',
    country: null,
    city: null,
    district: '',
    buildingNumber: '',
    streetNumber: '',
    postalCode: '',
    isAdmin: false,
    manual: false,
    language: getItem('code'),
  };

  const valSchema = Yup.object().shape({
    name: Yup.string()
      .matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS'))
      .trim()
      .required(t('CUSTOMER_NAME_VALIDATION_MESSAGE')),
    titleSelect: Yup.number().required(t('REQUIRED')),
    userEmail: Yup.string().trim().email(t('CUSTOMER_EMAIL_VALIDATION_MESSAGE')).required(t('LOGIN_EMAIL_VALIDATION_MESSAGE')),
    userMobilePhone: Yup.string().trim().matches(VALID_SAUDI_MOBILE_NUMBER, t('CUSTOMER_PHONE_VALIDATION_MESSAGE')),
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
  });

  const formik = useFormik({
    initialValues: initVals,
    validationSchema: valSchema,
    validateOnMount: true,
  });

  const { validateFormForSubmit } = useFormikSubmit(formik, () => {
    setButtonCliked(false);
    setDisableActionButton(false);
  });

  const editUser = (addAddress, pictureID) => {
    let createUserPayload = {
      data: {
        requestObject: {
          id: id,
          name: formik.values.name,
          code: formik.values.userEmail,
          email: formik.values.userEmail?.trim(),
          language: formik.values.language,
          partner: {
            name: formik.values.name,
            fixedPhone: formik.values.userFixedPhone,
            mobilePhone: formik.values.userMobilePhone,
            titleSelect: parseInt(formik?.values?.titleSelect || null),
            img: pictureID ? { id: pictureID } : null,
          },
        },
      },
    };

    if (addAddress) {
      createUserPayload.data.requestObject.partner.address = {
        addressL7Country: formik.values.country ? { id: formik.values.country?.id } : null,
        city: formik.values.city ? { id: formik.values.city?.id } : null,
        addressL3: formik.values.district ?? '',
        addressL4: formik.values.buildingNumber ?? '',
        streetNumber: formik.values.streetNumber ?? '',
        zip: formik.values.postalCode ?? '',
        addressL6: getAddressL6(formik.values),
      };
    }

    api('POST', getUserProfilesUrl(), createUserPayload, onCreateUserActionSuccess);
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

  const saveUser = async pictureID => {
    const isValid = await validateFormForSubmit();
    if (!isValid) return null;

    if (
      formik.values.isAdmin ||
      (formik.values.manual && assignedUserFeatures && assignedUserFeatures.length > 0) ||
      (!formik.values.manual && selectedGroups && selectedGroups.length > 0)
    ) {
      setButtonCliked(true);
      setDisableActionButton(true);
      editUser(formik.values.addAddress, pictureID);
    } else {
      setButtonCliked(false);
      dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'PLEASE_FILL_REQUIRED_ERROR_MESSAGE' }));
    }
  };

  const onCreateUserActionSuccess = response => {
    if (response.data.status === 'Ok') {
      let id = response.data.data?.returnedObj?.[0]?.id;
      let assignUserRolesPayload = {};

      if (userData?.id === id) {
        dispatch(userFeaturesActions.setUserPartnerImg(userImg));
        dispatch(userFeaturesActions.setUserPartnerTitleSelect(parseInt(formik.values.titleSelect)));
      }

      if (formik.values.isAdmin) {
        assignUserRolesPayload = {
          data: {
            requestObject: {
              id: id,
              group: 0,
            },
          },
        };
      } else if (formik.values.manual && features && features.length > 0) {
        assignUserRolesPayload = {
          data: {
            requestObject: {
              id: id,
              features: features,
            },
          },
        };
      } else {
        let groupsObj = [];

        if (selectedGroups && selectedGroups.length > 0) {
          selectedGroups.forEach(group => {
            let tempGroup = {};
            tempGroup.id = group.id;
            groupsObj.push(tempGroup);
          });
        }

        assignUserRolesPayload = {
          data: {
            requestObject: {
              id: id,
              groupProfiles: groupsObj,
            },
          },
        };
      }

      api('POST', getAssignUserPermissionsUrl(), assignUserRolesPayload, onAssignUserRolesSuccess);
    } else {
      setButtonCliked(false);
      setDisableActionButton(false);

      if (
        response.data?.data?.returnedObj &&
        checkFlashOrError(response.data.data?.returnedObj) &&
        response.data.data?.returnedObj?.[0]?.error?.includes('UP-001')
      ) {
        dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'USER_EMAIL_ALREADY_EXISTS' }));
      } else {
        dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'SOMETHING_WENT_WRONG' }));
      }
    }
  };

  const onAssignUserRolesSuccess = response => {
    if (response.data.status === 'Ok') {
      setButtonCliked(false);
      dispatch(alertsActions.initiateAlert({ title: 'Success', message: 'EDIT_USER_SUCCESS' }));
      setTimeout(() => {
        if (response.data.status === 'Ok') {
          setDisableActionButton(false);

          navigate(getFeaturePath(subFeature));
        }
      }, 3000);
    } else {
      setButtonCliked(false);
      setDisableActionButton(false);
      dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'SOMETHING_WENT_WRONG' }));
    }
  };

  const addSubFeature = subFeatureCode => {
    let subFeatureChecked =
      assignedUserFeatures && assignedUserFeatures.length > 0 && assignedUserFeatures.filter(item => item.split(':')[0] === subFeatureCode);
    let subFeature = {};
    let subFeatureActions = [];
    subFeatureChecked &&
      subFeatureChecked.length > 0 &&
      subFeatureChecked.forEach(action => {
        subFeatureActions.push(action.split(':')[1]);
      });

    subFeature.subFeatureCode = subFeatureCode;
    subFeature.actions = subFeatureActions;
    addToSubFeatureList(subFeatureCode.split('.')[0], subFeature);
  };

  const addToSubFeatureList = (featureCode, subFeature) => {
    let tempFeatures = features;
    let featureIndex = tempFeatures.findIndex(item => item.featureCode === featureCode);

    if (featureIndex > -1) {
      let subFeatureIndex =
        tempFeatures[featureIndex].subFeatureList &&
        tempFeatures[featureIndex].subFeatureList.findIndex(item => item.subFeatureCode === subFeature.subFeatureCode);

      if (subFeatureIndex > -1) {
        tempFeatures[featureIndex].subFeatureList[subFeatureIndex].actions = subFeature.actions;
      } else {
        tempFeatures[featureIndex].subFeatureList.push({
          subFeatureCode: subFeature.subFeatureCode,
          actions: subFeature.actions,
        });
      }
    } else {
      let tempSubFeatureList = [];
      tempSubFeatureList.push({
        subFeatureCode: subFeature.subFeatureCode,
        actions: subFeature.actions,
      });
      tempFeatures.push({
        featureCode: featureCode,
        subFeatureList: tempSubFeatureList,
      });
    }

    features = [...tempFeatures];
  };

  useEffect(() => {
    if (tempChecked && tempChecked.length > 0) {
      let newTempChecked = [];
      addSubFeature(tempChecked[0].split(':')[0]);
      newTempChecked = tempChecked.filter(item1 => item1.split(':')[0] !== tempChecked[0].split(':')[0]);

      if (newTempChecked && newTempChecked.length > 0) {
        setTempChecked([...newTempChecked]);
      }
    } else {
      features = [];
    }
  }, [tempChecked]);
  useEffect(() => {
    features = [];
    setTempChecked(assignedUserFeatures);
  }, [assignedUserFeatures]);

  useEffect(() => {
    api('GET', getUserProfilesUrl(), null, onUserSearchSuccess);
  }, [id]);

  const onUserSearchSuccess = response => {
    setIsLoading(true);

    if (response.data.status === 'Ok') {
      if (response.data?.data?.returnedObj?.length === 0) {
        setAllValues(formik, {
          name: '',
          img: null,
          titleSelect: '1',
          userEmail: '',
          isAdmin: false,
          manual: false,
          userFixedPhone: '',
          userMobilePhone: '',
          country: null,
          city: null,
          district: '',
          buildingNumber: '',
          streetNumber: '',
          postalCode: '',
          language: '',
        });
      } else {
        let data = response.data?.data?.returnedObj.filter(user => user.id === parseInt(id))[0];
        setDeleteUser({
          id: id,
          name: data.name ? data.name : '',
        });

        if (data.group === 0) {
          let address = data?.partner?.address;
          setAllValues(formik, {
            name: data.name ? data.name : '',
            titleSelect: data?.partner?.titleSelect?.toString() !== '0' ? data?.partner?.titleSelect?.toString() : '1',
            img: data?.partner?.img || null,
            userEmail: data.email?.trim() || '',
            isAdmin: true,
            manual: false,
            userFixedPhone: data?.partner?.fixedPhone ?? '',
            userMobilePhone: data?.partner?.mobilePhone ?? '',
            addAddress: address ? true : false,
            country: address?.addressL7Country ? { id: address?.addressL7Country?.id, name: address?.addressL7Country['$t:name'] } : null,
            city: address?.city ? { id: address?.city?.id, name: address?.city['$t:name'] } : null,
            district: address?.addressL3 ?? '',
            buildingNumber: address?.addressL4 ?? '',
            streetNumber: address?.streetNumber ?? '',
            postalCode: address?.zip ?? '',
            language: data?.language ?? getItem('code'),
          });
        } else if (data.groupProfiles && data.groupProfiles.length > 0) {
          setSelectedGroups(data.groupProfiles);
          let address = data?.partner?.address;
          setAllValues(formik, {
            name: data.name ? data.name : '',
            titleSelect: data?.partner?.titleSelect?.toString() !== '0' ? data?.partner?.titleSelect?.toString() : '1',
            img: data?.partner?.img || null,
            userEmail: data.email?.trim() || '',
            isAdmin: false,
            manual: false,
            userFixedPhone: data?.partner?.fixedPhone ?? '',
            userMobilePhone: data?.partner?.mobilePhone ?? '',
            addAddress: address ? true : false,
            country: address?.addressL7Country ? { id: address?.addressL7Country?.id, name: address?.addressL7Country['$t:name'] } : null,
            city: address?.city ? { id: address?.city?.id, name: address?.city['$t:name'] } : null,
            district: address?.addressL3 ?? '',
            buildingNumber: address?.addressL4 ?? '',
            streetNumber: address?.streetNumber ?? '',
            postalCode: address?.zip ?? '',
            language: data?.language ?? getItem('code'),
          });
        } else if (data.features && data.features.length > 0) {
          let fetchedChecked = [];

          data.features &&
            data.features.forEach(feature => {
              feature &&
                feature.subFeatureList &&
                feature.subFeatureList.forEach(subFeature => {
                  subFeature &&
                    subFeature.actions &&
                    subFeature.actions.forEach(action => {
                      fetchedChecked.push(`${subFeature.subFeatureCode}:${action}`);
                    });
                });
            });

          setInitChecked(fetchedChecked);
          let address = data?.partner?.address;
          setAllValues(formik, {
            name: data.name ? data.name : '',
            titleSelect: data?.partner?.titleSelect?.toString() !== '0' ? data?.partner?.titleSelect?.toString() : '1',
            img: data?.partner?.img || null,
            userEmail: data.email?.trim() || '',
            manual: true,
            isAdmin: false,
            userFixedPhone: data?.partner?.fixedPhone ?? '',
            userMobilePhone: data?.partner?.mobilePhone ?? '',
            addAddress: address ? true : false,
            country: address?.addressL7Country ? { id: address?.addressL7Country?.id, name: address?.addressL7Country['$t:name'] } : null,
            city: address?.city ? { id: address?.city?.id, name: address?.city['$t:name'] } : null,
            district: address?.addressL3 ?? '',
            buildingNumber: address?.addressL4 ?? '',
            streetNumber: address?.streetNumber ?? '',
            postalCode: address?.zip ?? '',
            language: data?.language ?? getItem('code'),
          });
        } else {
          let address = data?.partner?.address;
          setAllValues(formik, {
            name: data.name ? data.name : '',
            titleSelect: data?.partner?.titleSelect?.toString() !== '0' ? data?.partner?.titleSelect?.toString() : '1',
            img: data?.partner?.img || null,
            userEmail: data.email?.trim() || '',
            isAdmin: false,
            manual: false,
            userFixedPhone: data?.partner?.fixedPhone ?? '',
            userMobilePhone: data?.partner?.mobilePhone ?? '',
            addAddress: address ? true : false,
            country: address?.addressL7Country ? { id: address?.addressL7Country?.id, name: address?.addressL7Country['$t:name'] } : null,
            city: address?.city ? { id: address?.city?.id, name: address?.city['$t:name'] } : null,
            district: address?.addressL3 ?? '',
            buildingNumber: address?.addressL4 ?? '',
            streetNumber: address?.streetNumber ?? '',
            postalCode: address?.zip ?? '',
            language: data?.language ?? getItem('code'),
          });
        }
      }

      setIsLoading(false);
    } else {
      setIsLoading(false);
      dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'SOMETHING_WENT_WRONG' }));
    }
  };

  const onUserGroupsSearchSuccess = response => {
    if (response.data.status === 'Ok') {
      // setIsLoading(false);

      if (response.data?.data?.returnedObj?.length === 0) {
        setDisplayedUsersGroups([]);
      } else {
        let users = [];
        let data = response.data.data?.returnedObj;

        if (data) {
          data.forEach((user, i) => {
            let temp = {
              id: user.id ? user.id : '',
              name: user.name ? user.name : '',
            };
            users.push(temp);
          });
        }

        setDisplayedUsersGroups(users);
      }
    } else {
      // setIsLoading(false);
      dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'SOMETHING_WENT_WRONG' }));
    }
  };

  useEffect(() => {
    //get user groups
    api('GET', getUserGroupsUrl(), null, onUserGroupsSearchSuccess);
  }, []);

  const deleteConfirmHandler = ({ id, name }) => {
    if (id) {
      api('DELETE', getUserProfileByIdUrl(id), null, onUsersDeleteSuccess);
    }
  };

  const onUsersDeleteSuccess = response => {
    if (response.data.status === 'Ok') {
      setShowDeletePop(false);
      dispatch(alertsActions.initiateAlert({ title: 'Success', message: 'USER_DELETE_MESSAGE' }));

      setTimeout(() => {
        navigate(getFeaturePath(subFeature));
      }, [3000]);
    } else {
      setShowDeletePop(false);
      dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'SOMETHING_WENT_WRONG' }));
    }
  };

  const customDefaultSuccess = async response => {
    if (
      response?.data?.status !== 0 ||
      response?.data?.total === null ||
      response?.data?.total === undefined ||
      response?.data?.total === 0 ||
      response?.data?.total === 0 ||
      response?.data?.data?.length === 0
    )
      return;
    let country = response.data.data[0];
    country.name = country['$t:name'];
    setFieldValue(formik, 'country', country || null);
  };

  const alertHandler = (title, message) => {
    dispatch(alertsActions.initiateAlert({ title, message }));
    setIsLoading(false);
  };

  return (
    <>
      {buttonClicked && <div className="lodingpage"></div>}
      {showDeletePop && (
        <ConfirmationPopup
          onClickHandler={deleteConfirmHandler}
          onClickHandlerParams={deleteUser}
          setConfirmationPopup={setShowDeletePop}
          item={`${t('LBL_USER')} : ${deleteUser.name}`}
        />
      )}
      {showMoreActionToolbar && (
        <MoreAction
          showMoreAction={showMoreActionToolbar}
          setShowMoreAction={setShowMoreActionToolbar}
          viewHandler={
            canView
              ? () => {
                  navigate(getFeaturePath(subFeature, 'view', { id: id }));
                }
              : null
          }
          deleteHandler={canDelete ? () => setShowDeletePop(true) : null}
          canSelectAll={false}
        />
      )}
      {isLoading && <Spinner />}
      {!isLoading && (
        <div className="page-body">
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
                  <h4>{t('LBL_EDIT_USER')} </h4>
                </div>
                <div className="reverse-page float-end">
                  <BackButton />
                  <PrimaryButton
                    disabled={disableActionButton}
                    onClick={() => {
                      if (formik.values.img) {
                        uploadPicture();
                      } else {
                        saveUser(null);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <ActionsProgessBar
                  feature={feature}
                  subfeature={subFeature}
                  viewHandler={
                    canView
                      ? () => {
                          navigate(getFeaturePath('USERS', 'view', { id: id }));
                        }
                      : null
                  }
                  deleteHandler={canDelete ? () => setShowDeletePop(true) : null}
                  setShowMoreAction={setShowMoreActionToolbar}
                />
                <div className="card">
                  <div className="row">
                    <div className="col-md-9">
                      <div className="row">
                        <div className="col-md-6">
                          <TextInput formik={formik} label="LBL_NAME" accessor="name" mode="add" disabled={false} isRequired={true} />{' '}
                        </div>
                        <div className="col-md-6">
                          <TextInput
                            formik={formik}
                            label="LBL_EMAIL_ADDRESS"
                            accessor="userEmail"
                            mode="add"
                            disabled={false}
                            isRequired={true}
                          />
                        </div>

                        <div className="row">
                          <div className="col-md-6">
                            <DropDown
                              options={genderOptions}
                              formik={formik}
                              isRequired={true}
                              label="LBL_GENDER"
                              accessor="titleSelect"
                              type="INTEGER"
                              // translate={unitTypeSelect.mode === 'enum'}
                              keys={{ valueKey: 'value', titleKey: 'name' }}
                              translate={true}
                              mode="add"
                            />
                          </div>
                        </div>

                        <div className="col-md-12 checkbox-container">
                          <CheckboxInput
                            formik={formik}
                            label="LBL_ADD_ADDRESS"
                            accessor="addAddress"
                            mode="add"
                            isOnlyCheckboxesInRow={true}
                          />
                        </div>
                        {formik.values.addAddress && (
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
                                  mode="add"
                                  isRequired={true}
                                  onSuccess={onCountriesSuccess}
                                  defaultValueConfig={{
                                    payloadDomain: defaultSAPayloadDomain,
                                    customDefaultSuccess: customDefaultSuccess,
                                  }}
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
                                  mode="edit"
                                  isRequired={true}
                                  onSuccess={onCitiesSuccess}
                                  defaultValueConfig={
                                    formik.values.country?.id ? { payloadDomain: `self.country.id = ${formik.values.country?.id}` } : null
                                  }
                                  payloadDomain={`self.country.id = ${formik.values.country?.id}`}
                                />
                              </div>
                              <div className="col-md-4">
                                <TextInput formik={formik} label="LBL_DISTRICT" accessor="district" mode="edit" isRequired={true} />{' '}
                              </div>
                              <div className="col-md-4">
                                <TextInput
                                  formik={formik}
                                  label="LBL_BUILDING_NUMBER"
                                  accessor="buildingNumber"
                                  mode="edit"
                                  isRequired={true}
                                />
                              </div>
                              <div className="col-md-4">
                                <TextInput
                                  formik={formik}
                                  label="LBL_STREET_NUMBER"
                                  accessor="streetNumber"
                                  mode="edit"
                                  isRequired={true}
                                />{' '}
                              </div>
                              <div className="col-md-4">
                                <TextInput formik={formik} label="LBL_POSTAL_CODE" accessor="postalCode" mode="edit" isRequired={true} />{' '}
                              </div>
                              <div className="col-md-6">
                                <PhoneInputField formik={formik} label="LBL_MOBILE_NUMBER" identifier="userMobilePhone" mode="add" />
                              </div>
                              <div className="col-md-6">
                                <PhoneInputField formik={formik} label="LBL_PHONE" identifier="userFixedPhone" mode="add" />
                              </div>
                            </div>
                          </>
                        )}

                        <div className="border-section"></div>

                        <div className="col-md-12 checkbox-container">
                          <CheckboxInput formik={formik} label="LBL_IS_ADMIN" accessor="isAdmin" mode="add" isOnlyCheckboxesInRow={true} />
                          {!formik.values.isAdmin && (
                            <CheckboxInput
                              formik={formik}
                              label="LBL_MANUAL_ASSIGN_ROLES"
                              accessor="manual"
                              mode="add"
                              isOnlyCheckboxesInRow={true}
                            />
                          )}
                        </div>
                        {!formik.values.manual && !formik.values.isAdmin && (
                          <>
                            <div className="section-title mt-3">
                              <h4 className="float-start">{t('LBL_USER_GROUPS')} *</h4>
                            </div>
                            <div className="col-md-12">
                              <Multiselect
                                className="multi-select"
                                options={displayedUsersGroups}
                                selectedValues={selectedGroups}
                                onSelect={(selectedList, selectedItem) => setSelectedGroups([...selectedList])}
                                onRemove={(selectedList, removedItem) => setSelectedGroups(selectedList)}
                                displayValue="name"
                                placeholder={t('LBL_CHOOSE_USER_GROUPS')}
                                emptyRecordMsg={t('NO_DATA_AVAILABLE')}
                              />
                            </div>
                          </>
                        )}
                        {formik.values.manual && !formik.values.isAdmin && (
                          <Features setAssignedUserFeatures={setAssignedUserFeatures} edit={true} view={false} initChecked={initChecked} />
                        )}
                      </div>
                      <FormNotes
                        notes={[
                          {
                            title: 'LBL_REQUIRED_NOTIFY',
                            type: 3,
                          },
                        ]}
                      />
                    </div>
                    {formik.values.titleSelect && (
                      <>
                        <div className="col-md-3">
                          <UserProfileFileInput
                            formik={formik}
                            identifier="img"
                            label="LBL_USER_PICTURE"
                            alertHandler={alertHandler}
                            mode="edit"
                            // parentId={id}
                            fileId={formik?.values?.img?.id}
                            tableModel={MODELS.PARTNER}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default EditUser;
