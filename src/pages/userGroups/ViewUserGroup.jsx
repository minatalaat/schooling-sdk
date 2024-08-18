import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { MODELS } from '../../constants/models';
import { useAxiosFunction } from '../../hooks/useAxios';
import Features from '../users/Features';
import { getActionUrl, getUserGroupByIdUrl } from '../../services/getUrl';
import { useFeatures } from '../../hooks/useFeatures';
import BreadCrumb from '../../components/ui/BreadCrumb';
import ConfirmationPopup from '../../components/ConfirmationPopup';
import MoreAction from '../../parts/MoreAction';
import ActionsProgessBar from '../../parts/ActionsProgessBar';
import BackButton from '../../components/ui/buttons/BackButton';
import Calendar from '../../components/ui/Calendar';
import { VALID_TEXT_WITH_SPECIAL_CHARS } from '../../constants/regex/Regex';
import TextInput from '../../components/ui/inputs/TextInput';
import { alertsActions } from '../../store/alerts';

let features = [];

function ViewUserGroup({ feature, subFeature }) {
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
  const { canEdit, canDelete, getFeaturePath } = useFeatures(feature, subFeature);
  const dispatch = useDispatch();

  const [assignedUserFeatures, setAssignedUserFeatures] = useState([]);
  const [checked, setChecked] = useState([]);
  const [createdUserId, setCreatedUserId] = useState(-1);
  const [buttonClicked, setButtonCliked] = useState(false);
  const [tempChecked, setTempChecked] = useState([]);

  const [showDeletePop, setShowDeletePop] = useState(false);
  const [showMoreActionToolbar, setShowMoreActionToolbar] = useState(false);
  const [deleteUser, setDeleteUser] = useState({
    id: -1,
  });

  const initVals = {
    name: '',
  };
  const valSchema = Yup.object().shape({
    name: Yup.string()
      .matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS'))
      .trim()
      .required(t('CUSTOMER_NAME_VALIDATION_MESSAGE')),
  });

  const submit = values => {};

  const formik = useFormik({
    initialValues: initVals,
    onSubmit: submit,
    validationSchema: valSchema,
    validateOnMount: true,
  });

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
          editHandler={
            canEdit
              ? () => {
                  navigate(getFeaturePath(subFeature, 'edit', { id: id }));
                }
              : null
          }
          deleteHandler={canDelete ? () => setShowDeletePop(true) : null}
          canSelectAll={false}
          bulkActionConfig={{
            canDelete: canDelete,
            deleteSuccessMessage: 'USER_GROUP_DELETE_MESSAGE',
            modelsEnumKey: 'ANALYTIC_AXIS',
          }}
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
              <BreadCrumb feature={feature} subFeature={subFeature} modeText="LBL_VIEW_USER_GROUP" />
            </div>
          </div>

          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{t('LBL_VIEW_USER_GROUP')} </h4>
              </div>
              <div className="reverse-page float-end">
                <BackButton />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <ActionsProgessBar
                feature={feature}
                subfeature={subFeature}
                editHandler={
                  canEdit
                    ? () => {
                        navigate(getFeaturePath(subFeature, 'edit', { id: id }));
                      }
                    : null
                }
                deleteHandler={canDelete ? () => setShowDeletePop(true) : null}
                setShowMoreAction={setShowMoreActionToolbar}
              />
              <div className="card">
                <div className="row"></div>
                <div className="row">
                  <div className="col-md-6">
                    <TextInput formik={formik} label="LBL_NAME" accessor="name" mode="view" disabled={true} isRequired={false} />{' '}
                  </div>

                  <div className="border-section"></div>

                  <Features setAssignedUserFeatures={setAssignedUserFeatures} view={true} initChecked={checked} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ViewUserGroup;
