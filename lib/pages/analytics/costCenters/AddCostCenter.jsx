import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import PrimaryButton from '../../../components/ui/buttons/PrimaryButton';
import TextInput from '../../../components/ui/inputs/TextInput';

import { MODELS } from '../../../constants/models';
import { useAxiosFunction } from '../../../hooks/useAxios';
import { getModelUrl, getSearchUrl } from '../../../services/getUrl';
import { useFeatures } from '../../../hooks/useFeatures';
import BreadCrumb from '../../../components/ui/BreadCrumb';
import BackButton from '../../../components/ui/buttons/BackButton';
import SearchModalAxelor from '../../../components/ui/inputs/SearchModal/SearchModalAxelor';

import ToggleSwitch from '../../../components/ui/inputs/ToggleSwitch';
import Calendar from '../../../components/ui/Calendar';
import { VALID_TEXT_WITH_SPECIAL_CHARS } from '../../../constants/regex/Regex';
import { alertsActions } from '../../../store/alerts';
import { useFormikSubmit } from '../../../hooks/useFormikSubmit';
import FormNotes from '../../../components/ui/FormNotes';

function AddCostCenter({ feature, subFeature }) {
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

  const [buttonClicked, setButtonCliked] = useState(false);
  const [selectedAnalyticLevel, setSelectedAnalyticLevel] = useState(null);

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
  }, []);

  const saveCostCenter = async () => {
    const isValid = await validateFormForSubmit();
    if (!isValid) return null;

    setButtonCliked(true);
    setDisableActionButton(true);
    let createCostCenterPayload = {
      data: {
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
      dispatch(alertsActions.initiateAlert({ title: 'Success', message: 'CREATE_COST_CENTER_SUCCESS' }));
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

  return (
    <>
      {buttonClicked && <div className="lodingpage"></div>}

      <div className="page-body">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <Calendar />
              <BreadCrumb feature={feature} subFeature={subFeature} modeText="LBL_ADD_COST_CENTER" />
            </div>
          </div>

          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{t('LBL_ADD_COST_CENTER')} </h4>
              </div>
              <div className="reverse-page float-end">
                <BackButton />
                <PrimaryButton onClick={() => saveCostCenter()} disabled={disableActionButton} />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className="row">
                  <div className="col-md-6">
                    <TextInput formik={formik} label="LBL_CODE" accessor="code" mode="add" isRequired={true} />
                  </div>
                  <div className="col-md-6">
                    <TextInput formik={formik} label="LBL_NAME" accessor="name" mode="add" isRequired={true} />
                  </div>
                  <div className="col-md-6">
                    <SearchModalAxelor formik={formik} modelKey="ANALYTIC_AXIS" mode="add" isRequired={true} />
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

export default AddCostCenter;
