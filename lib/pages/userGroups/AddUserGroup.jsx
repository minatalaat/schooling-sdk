import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import BreadCrumb from '../../components/ui/BreadCrumb';
import BackButton from '../../components/ui/buttons/BackButton';
import Calendar from '../../components/ui/Calendar';
import TextInput from '../../components/ui/inputs/TextInput';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';
import Features from '../users/Features';

import { MODELS } from '../../constants/models';
import { useAxiosFunction } from '../../hooks/useAxios';
import { getActionUrl, getAssignGroupPermissionsUrl, getUserGroupsUrl } from '../../services/getUrl';
import { useFeatures } from '../../hooks/useFeatures';
import { VALID_TEXT_WITH_SPECIAL_CHARS } from '../../constants/regex/Regex';
import { alertsActions } from '../../store/alerts';
import { useFormikSubmit } from '../../hooks/useFormikSubmit';
import FormNotes from '../../components/ui/FormNotes';

let features = [];

function AddUserGroup({ feature, subFeature }) {
  const actionEnum = {
    1: 'LBL_VIEW',
    2: 'LBL_ADD',
    3: 'LBL_EDIT',
    4: 'LBL_DELETE',
  };

  Object.freeze(actionEnum);
  const { api } = useAxiosFunction();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getFeaturePath } = useFeatures();
  const dispatch = useDispatch();

  const [assignedUserFeatures, setAssignedUserFeatures] = useState([]);
  const [buttonClicked, setButtonCliked] = useState(false);
  const [tempChecked, setTempChecked] = useState([]);
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
      setTempChecked(assignedUserFeatures);
      setButtonCliked(true);
      setDisableActionButton(true);
      let createUserGroupPayload = {
        data: {
          requestObject: {
            name: formik.values.name,
            code: formik.values.name,
          },
        },
      };
      api('POST', getUserGroupsUrl(), createUserGroupPayload, onCreateUserGroupActionSuccess);
    } else {
      setButtonCliked(false);
      dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'PLEASE_FILL_REQUIRED_ERROR_MESSAGE' }));
    }
  };

  const onCreateUserGroupActionSuccess = response => {
    if (response.data.status === 'Ok') {
      let id = response.data.data?.returnedObj?.[0].id;
      let assignUserRolesPayload = {
        data: {
          requestObject: {
            id: id,
            features: features,
          },
        },
      };
      api('POST', getAssignGroupPermissionsUrl(), assignUserRolesPayload, onAssignUserRolesSuccess);
    } else {
      dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'SOMETHING_WENT_WRONG' }));
      setDisableActionButton(false);
      setButtonCliked(false);
    }
  };

  const onAssignUserRolesSuccess = response => {
    if (response.data.status === 'Ok') {
      dispatch(alertsActions.initiateAlert({ title: 'Success', message: 'CREATE_USER_GROUP_SUCCESS' }));
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

  return (
    <>
      {buttonClicked && <div className="lodingpage"></div>}

      <div className="page-body">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <Calendar />
              <BreadCrumb feature={feature} subFeature={subFeature} modeText="LBL_ADD_USER_GROUP" />
            </div>
          </div>

          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{t('LBL_ADD_USER_GROUP')} </h4>
              </div>
              <div className="reverse-page float-end">
                <BackButton />
                <PrimaryButton theme="blue" text="LBL_SAVE" onClick={() => saveRole()} disabled={disableActionButton} />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className="row">
                  <div className="col-md-6">
                    <TextInput formik={formik} label="LBL_NAME" accessor="name" mode="add" disabled={false} isRequired={true} />{' '}
                  </div>
                  <div className="border-section"></div>
                  <Features setAssignedUserFeatures={setAssignedUserFeatures} edit={false} />
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

export default AddUserGroup;
