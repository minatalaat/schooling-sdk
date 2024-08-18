import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import Features from '../users/Features';
import BreadCrumb from '../../components/ui/BreadCrumb';
import ActionsProgessBar from '../../parts/ActionsProgessBar';
import MoreAction from '../../parts/MoreAction';
import ConfirmationPopup from '../../components/ConfirmationPopup';
import BackButton from '../../components/ui/buttons/BackButton';
import Calendar from '../../components/ui/Calendar';
import TextInput from '../../components/ui/inputs/TextInput';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';

import { MODELS } from '../../constants/models';
import { useAxiosFunction } from '../../hooks/useAxios';
import { getActionUrl, getAssignGroupPermissionsUrl, getUserGroupByIdUrl, getUserGroupsUrl } from '../../services/getUrl';
import { useFeatures } from '../../hooks/useFeatures';
import { VALID_TEXT_WITH_SPECIAL_CHARS } from '../../constants/regex/Regex';
import { alertsActions } from '../../store/alerts';
import { useFormikSubmit } from '../../hooks/useFormikSubmit';
import FormNotes from '../../components/ui/FormNotes';

let features = [];

function EditUserGroup({ feature, subFeature }) {
  const actionEnum = {
    1: 'LBL_VIEW',
    2: 'LBL_ADD',
    3: 'LBL_EDIT',
    4: 'LBL_DELETE',
  };

  Object.freeze(actionEnum);
  const { setIsLoading, api } = useAxiosFunction();
  const { t } = useTranslation();
  const url = window.location.href.split('/');
  const id = parseInt(url[url.length - 1]);
  const navigate = useNavigate();
  const { canView, canDelete, getFeaturePath } = useFeatures(feature, subFeature);
  const dispatch = useDispatch();

  const [assignedUserFeatures, setAssignedUserFeatures] = useState([]);
  const [checked, setChecked] = useState([]);
  const [buttonClicked, setButtonCliked] = useState(false);
  const [tempChecked, setTempChecked] = useState([]);
  const [showDeletePop, setShowDeletePop] = useState(false);
  const [showMoreActionToolbar, setShowMoreActionToolbar] = useState(false);
  const [deleteUser, setDeleteUser] = useState({
    id: -1,
  });
  const [disableActionButton, setDisableActionButton] = useState(false);

  const initVals = {
    name: '',
  };
  const valSchema = Yup.object().shape({
    name: Yup.string()
      .matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS'))
      .trim()
      .required(t('CUSTOMER_NAME_VALIDATION_MESSAGE')),
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

  const saveRole = async () => {
    const isValid = await validateFormForSubmit();
    if (!isValid) return null;

    if (formik.isValid && assignedUserFeatures && assignedUserFeatures.length > 0) {
      setButtonCliked(true);
      setDisableActionButton(true);
      let editUserGroupPayload = {
        data: {
          requestObject: {
            name: formik.values.name,
            code: formik.values.name,
            id: id,
          },
        },
      };
      api('POST', getUserGroupsUrl(), editUserGroupPayload, onCreateUserActionSuccess);
    } else {
      setButtonCliked(false);
      dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'PLEASE_FILL_REQUIRED_ERROR_MESSAGE' }));
    }
  };

  const onCreateUserActionSuccess = response => {
    if (response.data.status === 'Ok') {
      let id = response.data.data?.returnedObj?.[0].id;
      let assignGroupRolesPayload = {
        data: {
          requestObject: {
            id: id,
            features: [...features],
          },
        },
      };
      api('POST', getAssignGroupPermissionsUrl(), assignGroupRolesPayload, onAssignGroupRolesSuccess);
    } else {
      setDisableActionButton(false);
      setButtonCliked(false);
      dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'SOMETHING_WENT_WRONG' }));
      setButtonCliked(false);
    }
  };

  const onAssignGroupRolesSuccess = response => {
    if (response.data.status === 'Ok') {
      dispatch(alertsActions.initiateAlert({ title: 'Success', message: 'USER_GROUP_EDIT_SUCCESS' }));
      setButtonCliked(false);

      setTimeout(() => {
        if (response.data.status === 'Ok') {
          setDisableActionButton(false);
          navigate(getFeaturePath('USERS_GROUPS'));
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
        // setFeatures([...new Set(tempFeatures)])
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
    api('GET', getUserGroupByIdUrl(id), null, onUserGroupSearchSuccess);
  }, [id]);

  const onUserGroupSearchSuccess = response => {
    if (response.data.status === 'Ok') {
      setIsLoading(false);

      if (response.data?.data?.returnedObj?.length === 0) {
        formik.setValues({
          name: '',
          features: [],
        });
      } else {
        let data = response.data?.data?.returnedObj?.[0];
        setDeleteUser({
          id: id,
          name: data.name ? data.name : '',
        });

        if (data.features && data.features.length > 0) {
          // setUserFeatures(data.features)

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
          setChecked(fetchedChecked);
        }

        formik.setValues({
          name: data.name ? data.name : '',
        });
      }
    } else {
      setIsLoading(false);
    }
  };

  const deleteConfirmHandler = ({ id, name }) => {
    if (id) {
      api('DELETE', getUserGroupByIdUrl(id), null, onUsersDeleteSuccess);
    }
  };

  const onUsersDeleteSuccess = response => {
    if (response.data.status === 'Ok') {
      setShowDeletePop(false);
      dispatch(alertsActions.initiateAlert({ title: 'Success', message: 'USER_GROUP_DELETE_MESSAGE' }));
      setTimeout(() => {
        navigate(getFeaturePath(subFeature));
      }, [3000]);
    } else {
      setShowDeletePop(false);
      dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'SOMETHING_WENT_WRONG' }));
    }
  };

  return (
    <>
      {buttonClicked && <div className="lodingpage"></div>}
      {showMoreActionToolbar && (
        <MoreAction
          showMoreAction={showMoreActionToolbar}
          setShowMoreAction={setShowMoreActionToolbar}
          viewHandler={
            canView
              ? () => {
                  navigate(getFeaturePath('USERS_GROUPS', 'view', { id: id }));
                }
              : null
          }
          deleteHandler={canDelete ? () => setShowDeletePop(true) : null}
          canSelectAll={false}
        />
      )}{' '}
      {showDeletePop && (
        <ConfirmationPopup
          onClickHandler={deleteConfirmHandler}
          onClickHandlerParams={deleteUser}
          setConfirmationPopup={setShowDeletePop}
          item={`${t('LBL_USER_GROUP')} : ${deleteUser.name}`}
        />
      )}
      <div className="page-body">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <Calendar />
              <BreadCrumb feature={feature} subFeature={subFeature} modeText="LBL_EDIT_USER_GROUP" />
            </div>
          </div>

          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{t('LBL_EDIT_USER_GROUP')} </h4>
              </div>
              <div className="reverse-page float-end">
                <BackButton />
                <PrimaryButton theme="blue" text="LBL_SAVE" onClick={saveRole} disabled={disableActionButton} />
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
                        navigate(getFeaturePath('USERS_GROUPS', 'view', { id: id }));
                      }
                    : null
                }
                deleteHandler={canDelete ? () => setShowDeletePop(true) : null}
                setShowMoreAction={setShowMoreActionToolbar}
              />
              <div className="card">
                <div className="row">
                  <div className="col-md-6">
                    <TextInput formik={formik} label="LBL_NAME" accessor="name" mode="edit" disabled={false} isRequired={true} />{' '}
                  </div>

                  <div className="border-section"></div>

                  <Features setAssignedUserFeatures={setAssignedUserFeatures} edit={true} initChecked={checked} />
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default EditUserGroup;
