import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import TextInput from '../../../components/ui/inputs/TextInput';
import PrimaryButton from '../../../components/ui/buttons/PrimaryButton';
import BreadCrumb from '../../../components/ui/BreadCrumb';
import BackButton from '../../../components/ui/buttons/BackButton';
import Calendar from '../../../components/ui/Calendar';

import { MODELS } from '../../../constants/models';
import { useAxiosFunction } from '../../../hooks/useAxios';
import { getModelUrl } from '../../../services/getUrl';
import { useFeatures } from '../../../hooks/useFeatures';
import { VALID_TEXT_WITH_SPECIAL_CHARS } from '../../../constants/regex/Regex';
import { alertsActions } from '../../../store/alerts';
import { useFormikSubmit } from '../../../hooks/useFormikSubmit';
import FormNotes from '../../../components/ui/FormNotes';

function AddAxis({ feature, subFeature }) {
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
  const [disableActionButton, setDisableActionButton] = useState(false);
  const [selectedCompany] = useState(null);

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
    let createAxisPayload = {
      data: {
        manageParentAccount: false,
        nbrOfAnalyticGrouping: 0,
        code: formik.values.code,
        name: formik.values.name,
        company: selectedCompany,
      },
    };
    api('POST', getModelUrl(MODELS.ANALYTIC_AXIS), createAxisPayload, onCreateAxisSuccess);
  };

  const onCreateAxisSuccess = response => {
    if (response.data.status === 0) {
      dispatch(alertsActions.initiateAlert({ title: 'Success', message: 'CREATE_AXIS_SUCCESS' }));
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

  return (
    <>
      {buttonClicked && <div className="lodingpage"></div>}

      <div className="page-body">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <Calendar />
              <BreadCrumb feature={feature} subFeature={subFeature} modeText="LBL_ADD_AXIS" />
            </div>
          </div>

          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{t('LBL_ADD_AXIS')} </h4>
              </div>
              <div className="reverse-page float-end">
                <BackButton />
                <PrimaryButton theme="blue" text="LBL_SAVE" onClick={() => saveAxis()} disabled={disableActionButton} />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className="row">
                  <div className="col-md-6">
                    <TextInput formik={formik} label="LBL_CODE" accessor="code" mode="add" isRequired={true} disabled={false} />
                  </div>
                  <div className="col-md-6">
                    <TextInput formik={formik} label="LBL_NAME" accessor="name" mode="add" isRequired={true} disabled={false} />
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

export default AddAxis;
