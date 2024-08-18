import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { MODELS } from '../../../constants/models';
import { useAxiosFunction } from '../../../hooks/useAxios';
import { useFeatures } from '../../../hooks/useFeatures';
import BreadCrumb from '../../../components/ui/BreadCrumb';
import ActionsProgessBar from '../../../parts/ActionsProgessBar';
import MoreAction from '../../../parts/MoreAction';
import ConfirmationPopup from '../../../components/ConfirmationPopup';
import BackButton from '../../../components/ui/buttons/BackButton';
import { getFetchUrl, getModelUrl, getRemoveAllUrl } from '../../../services/getUrl';
import Calendar from '../../../components/ui/Calendar';
import { VALID_TEXT_WITH_SPECIAL_CHARS } from '../../../constants/regex/Regex';
import TextInput from '../../../components/ui/inputs/TextInput';
import PrimaryButton from '../../../components/ui/buttons/PrimaryButton';

import { alertsActions } from '../../../store/alerts';
import { useFormikSubmit } from '../../../hooks/useFormikSubmit';
import FormNotes from '../../../components/ui/FormNotes';

function EditAxis({ feature, subFeature }) {
  const actionEnum = {
    1: 'LBL_VIEW',
    2: 'LBL_ADD',
    3: 'LBL_EDIT',
    4: 'LBL_DELETE',
  };

  Object.freeze(actionEnum);
  const { api } = useAxiosFunction();
  const { t } = useTranslation();
  const url = window.location.href.split('/');
  const id = parseInt(url[url.length - 1]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { canView, canDelete, getFeaturePath } = useFeatures(feature, subFeature);
  const [fetchedAxis, setFetchedAxis] = useState(null);
  const [buttonClicked, setButtonCliked] = useState(false);
  const [showDeletePop, setShowDeletePop] = useState(false);
  const [showMoreActionToolbar, setShowMoreActionToolbar] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [deleteAxis, setDeleteAxis] = useState({
    id: -1,
  });
  const [disableActionButton, setDisableActionButton] = useState(false);
  const initVals = {
    name: '',
    code: '',
    company: '',
  };
  const valSchema = Yup.object().shape({
    name: Yup.string()
      .matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS'))
      .trim()
      .required(t('CUSTOMER_NAME_VALIDATION_MESSAGE')),
    code: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).trim().required(t('LBL_CODE_REQUIRED')),
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

  const saveAxis = async () => {
    const isValid = await validateFormForSubmit();
    if (!isValid) return null;

    setButtonCliked(true);
    setDisableActionButton(true);
    let editAxisPayload = {
      data: {
        id: parseInt(id),
        version: fetchedAxis.version ? fetchedAxis.version : 0,
        manageParentAccount: false,
        nbrOfAnalyticGrouping: 0,
        code: formik.values.code,
        name: formik.values.name,
        company: selectedCompany,
      },
    };
    api('POST', getModelUrl(MODELS.ANALYTIC_AXIS), editAxisPayload, onCreateAxisSuccess);
  };

  const onCreateAxisSuccess = response => {
    if (response.data.status === 0) {
      dispatch(alertsActions.initiateAlert({ title: 'Success', message: 'AXIS_EDIT_SUCCESS' }));
      setButtonCliked(false);
      setTimeout(() => {
        if (response.data.status === 0) {
          setDisableActionButton(false);
          navigate(getFeaturePath(subFeature));
        }
      }, 3000);
    } else {
      setDisableActionButton(false);
      setButtonCliked(false);
      dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'SOMETHING_WENT_WRONG' }));
      setButtonCliked(false);
    }
  };

  const onAxiesDeleteSuccess = response => {
    if (response.data.status === 0) {
      setShowDeletePop(false);
      dispatch(alertsActions.initiateAlert({ title: 'Success', message: 'AXIS_DELETE_MESSAGE' }));
      setTimeout(() => {
        if (response.data.status === 0) {
          navigate(getFeaturePath(subFeature));
        }
      }, 3000);
    } else {
      setShowDeletePop(false);
      dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'SOMETHING_WENT_WRONG' }));
    }
  };

  const deleteConfirmHandler = () => {
    if (deleteAxis) {
      let deletePayload = {
        records: [
          {
            id: id,
            version: deleteAxis.version,
          },
        ],
      };
      api('POST', getRemoveAllUrl(MODELS.ANALYTIC_AXIS), deletePayload, onAxiesDeleteSuccess);
    }
  };

  const onFetchedAxisData = response => {
    if (response.data.status === 0) {
      if (response.data.data[0]) {
        let tempAxis = response.data.data[0];
        setDeleteAxis({
          id: id,
          version: tempAxis.version,
          name: tempAxis.name,
        });
        setFetchedAxis(tempAxis);
        setSelectedCompany(tempAxis ? tempAxis.company : null);
        formik.setValues({
          name: tempAxis.name ? tempAxis.name : '',
          code: tempAxis.code ? tempAxis.code : '',
          company: tempAxis.company ? tempAxis.company.name : '',
        });
      }
    }
  };

  useEffect(() => {
    api(
      'POST',
      getFetchUrl(MODELS.ANALYTIC_AXIS, id),
      {
        fields: [
          'code',
          'analyticGrouping10',
          'analyticGrouping6',
          'analyticGrouping7',
          'manageParentAccount',
          'analyticGrouping4',
          'analyticGrouping5',
          'analyticGrouping2',
          'analyticGrouping3',
          'analyticGrouping1',
          'name',
          'company',
          'nbrOfAnalyticGrouping',
          'analyticGrouping8',
          'analyticGrouping9',
        ],
        related: {},
      },
      onFetchedAxisData,
      {}
    );
  }, []);
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
                  navigate(getFeaturePath(subFeature, 'view', { id: id }));
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
          onClickHandlerParams={deleteAxis}
          setConfirmationPopup={setShowDeletePop}
          item={`${t('LBL_AXIS')} : ${deleteAxis.name}`}
        />
      )}
      <div className="page-body">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <Calendar />
              <BreadCrumb feature={feature} subFeature={subFeature} modeText="LBL_EDIT_AXIS" />
            </div>
          </div>

          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{t('LBL_EDIT_AXIS')} </h4>
              </div>
              <div className="reverse-page float-end">
                <BackButton />
                <PrimaryButton theme="blue" text="LBL_SAVE" onClick={() => saveAxis()} disabled={disableActionButton} />
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
                        navigate(getFeaturePath(subFeature, 'view', { id: id }));
                      }
                    : null
                }
                deleteHandler={canDelete ? () => setShowDeletePop(true) : null}
                setShowMoreAction={setShowMoreActionToolbar}
              />
              <div className="card">
                <div className="row">
                  <div className="col-md-6">
                    <TextInput formik={formik} label="LBL_CODE" accessor="code" mode="edit" isRequired={true} disabled={false} />
                  </div>
                  <div className="col-md-6">
                    <TextInput formik={formik} label="LBL_NAME" accessor="name" mode="edit" isRequired={true} disabled={false} />
                  </div>
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

export default EditAxis;
