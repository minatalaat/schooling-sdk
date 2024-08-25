import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import PrimaryButton from '../../../components/ui/buttons/PrimaryButton';
import TextInput from '../../../components/ui/inputs/TextInput';
import ActionsProgessBar from '../../../parts/ActionsProgessBar';
import MoreAction from '../../../parts/MoreAction';
import ConfirmationPopup from '../../../components/ConfirmationPopup';
import BreadCrumb from '../../../components/ui/BreadCrumb';
import BackButton from '../../../components/ui/buttons/BackButton';
import SearchModalAxelor from '../../../components/ui/inputs/SearchModal/SearchModalAxelor';
import ToggleSwitch from '../../../components/ui/inputs/ToggleSwitch';
import Calendar from '../../../components/ui/Calendar';
import FormNotes from '../../../components/ui/FormNotes';

import { MODELS } from '../../../constants/models';
import { useAxiosFunction } from '../../../hooks/useAxios';
import { getFetchUrl, getModelUrl, getRemoveAllUrl, getSearchUrl } from '../../../services/getUrl';
import { useFeatures } from '../../../hooks/useFeatures';
import { VALID_TEXT_WITH_SPECIAL_CHARS } from '../../../constants/regex/Regex';
import { alertsActions } from '../../../store/alerts';
import { useFormikSubmit } from '../../../hooks/useFormikSubmit';
import { setAllValues } from '../../../utils/formHelpers';

function EditCostCenter({ feature, subFeature }) {
  const actionEnum = {
    1: 'LBL_VIEW',
    2: 'LBL_ADD',
    3: 'LBL_EDIT',
    4: 'LBL_DELETE',
  };

  Object.freeze(actionEnum);
  const { canView, canDelete, getFeaturePath } = useFeatures(feature, subFeature);
  const [showMoreActionToolbar, setShowMoreActionToolbar] = useState(false);
  const [showDeletePop, setShowDeletePop] = useState(false);
  const [deleteCostCenter, setDeleteCostCenter] = useState(null);
  const { api } = useAxiosFunction();
  const url = window.location.href.split('/');
  const id = parseInt(url[url.length - 1]);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [buttonClicked, setButtonCliked] = useState(false);
  const [selectedAnalyticLevel, setSelectedAnalyticLevel] = useState(null);
  const [fetchedCostCenter, setFetchedCostCenter] = useState(null);
  const [disableActionButton, setDisableActionButton] = useState(false);

  const initVals = {
    name: '',
    code: '',
    axis: null,
    isActive: false,
  };
  const valSchema = Yup.object().shape({
    name: Yup.string()
      .matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS'))
      .trim()
      .required(t('CUSTOMER_NAME_VALIDATION_MESSAGE')),
    code: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).trim().required(t('LBL_CODE_REQUIRED')),
    axis: Yup.object().nullable().required(t('REQUIRED')),
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

  useEffect(() => {
    api(
      'POST',
      getSearchUrl(MODELS.ANALYTIC_LEVEL),
      {
        fields: ['nbr'],
        sortBy: ['nbr'],
        data: { _domainContext: { _model: 'com.axelor.apps.account.db.AnalyticLevel' }, operator: 'and', criteria: [] },
        limit: -1,
        offset: 0,
        translate: true,
      },
      onAnalyticLevelsSearchSuccess
    );
    api(
      'POST',
      getFetchUrl(MODELS.ANALYTICACCOUNT, id),
      {
        fields: ['code', 'name', 'analyticAxis', 'statusSelect'],
        related: {},
      },
      onFetchedCostCenterSuccess
    );
  }, []);

  const saveCostCenter = async () => {
    const isValid = await validateFormForSubmit();
    if (!isValid) return null;

    setButtonCliked(true);
    setDisableActionButton(true);
    let createCostCenterPayload = {
      data: {
        id: fetchedCostCenter.id,
        version: fetchedCostCenter.version,
        statusSelect: formik.values.isActive ? 1 : 0,
        code: formik.values.code,
        name: formik.values.name,
        analyticAxis: formik.values.axis,
        parent: null,
        analyticGroupingValue9: null,
        analyticGroupingValue10: null,
        analyticGroupingValue5: null,
        analyticGroupingValue6: null,
        analyticGroupingValue7: null,
        analyticGroupingValue8: null,
        analyticGroupingValue1: null,
        analyticGroupingValue2: null,
        analyticGroupingValue3: null,
        analyticGroupingValue4: null,
        analyticLevel: selectedAnalyticLevel,
      },
    };
    api('POST', getModelUrl(MODELS.ANALYTICACCOUNT), createCostCenterPayload, onCreateCostCenterAxisSuccess);
  };

  const onCreateCostCenterAxisSuccess = response => {
    if (response.data.status === 0) {
      dispatch(alertsActions.initiateAlert({ title: 'Success', message: 'COST_CENTER_EDIT_SUCCESS' }));
      setButtonCliked(false);
      setTimeout(() => {
        if (response.data.status === 0) {
          setDisableActionButton(false);
          navigate(getFeaturePath(subFeature));
        }
      }, 3000);
    } else {
      setButtonCliked(false);
      dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'SOMETHING_WENT_WRONG' }));
      setDisableActionButton(false);
      setButtonCliked(false);
    }
  };

  const onAnalyticLevelsSearchSuccess = response => {
    if (response.data.status === 0) {
      setSelectedAnalyticLevel(response.data.data[0]);
    }
  };

  const onFetchedCostCenterSuccess = response => {
    if (response.data.status === 0) {
      let data = response.data.data[0];
      setFetchedCostCenter(data);
      setDeleteCostCenter({
        id: id,
        version: data.version,
        name: data.name,
      });
      setAllValues(formik, {
        name: data.name ? data.name : '',
        code: data.code ? data.code : '',
        axis: data.analyticAxis ?? null,
        isActive: data.statusSelect === 1 ? true : false,
      });
    }
  };

  const onCostCenterDeleteSuccess = response => {
    if (response.data.status === 0) {
      setShowDeletePop(false);
      dispatch(alertsActions.initiateAlert({ title: 'Success', message: 'COST_CENTER_DELETE_MESSAGE' }));
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
    if (deleteCostCenter) {
      let deletePayload = {
        records: [
          {
            id: id,
            version: deleteCostCenter.version,
          },
        ],
      };
      api('POST', getRemoveAllUrl(MODELS.ANALYTIC_AXIS), deletePayload, onCostCenterDeleteSuccess);
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
          onClickHandlerParams={deleteCostCenter}
          setConfirmationPopup={setShowDeletePop}
          item={`${t('LBL_COST_CENTER')} : ${deleteCostCenter.name}`}
        />
      )}
      <div className="page-body">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <Calendar />
              <BreadCrumb feature={feature} subFeature={subFeature} modeText="LBL_EDIT_COST_CENTER" />
            </div>
          </div>

          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{t('LBL_EDIT_COST_CENTER')} </h4>
              </div>
              <div className="reverse-page float-end">
                <BackButton />
                <PrimaryButton theme="blue" text="LBL_SAVE" onClick={() => saveCostCenter()} disabled={disableActionButton} />
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
                    <TextInput formik={formik} label="LBL_CODE" accessor="code" mode="edit" isRequired={true} />
                  </div>
                  <div className="col-md-6">
                    <TextInput formik={formik} label="LBL_NAME" accessor="name" mode="edit" isRequired={true} />
                  </div>
                  <div className="col-md-6">
                    <SearchModalAxelor formik={formik} modelKey="ANALYTIC_AXIS" mode="edit" isRequired={true} />
                  </div>
                  <div className="col-md-6">
                    <ToggleSwitch formik={formik} label="LBL_ACTIVATE" accessor="isActive" mode="add" />
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

export default EditCostCenter;
