import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { useDispatch } from 'react-redux';

import BreadCrumb from '../../components/ui/BreadCrumb';
import BackButton from '../../components/ui/buttons/BackButton';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';
import Calendar from '../../components/ui/Calendar';
import PrintingSettingsForm from './PrintingSettingsForm';

import { useAxiosFunction } from '../../hooks/useAxios';
import { MODELS } from '../../constants/models';
import { VALID_FLOAT } from '../../constants/regex/Regex';
import { getModelUrl } from '../../services/getUrl';
import { useFeatures } from '../../hooks/useFeatures';
import { VALID_TEXT_WITH_SPECIAL_CHARS } from '../../constants/regex/Regex';
import { alertsActions } from '../../store/alerts';
import { useFormikSubmit } from '../../hooks/useFormikSubmit';
import FormNotes from '../../components/ui/FormNotes';

const AddPrintingSetting = ({ feature, subFeature }) => {
  const mode = 'add';
  const { api } = useAxiosFunction();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getFeaturePath } = useFeatures();
  const dispatch = useDispatch();

  const [buttonClicked, setButtonClicked] = useState(false);
  const [disableSave, setDisableSave] = useState(false);

  const initValues = {
    name: '',
    defaultMailBirtTemplate: null,
    logoPositionSelect: '',
    colorCode: '',
    addressPositionSelect: '',
    pdfHeader: '',
    pdfHeaderHeight: '',
    pdfFooter: '',
    pdfFooterHeight: '',
  };

  const valSchema = Yup.object().shape({
    name: Yup.string()
      .matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS'))
      .trim()
      .required(t('PRINTING_NAME_VALIDATION_MESSAGE')),
    defaultMailBirtTemplate: Yup.object().nullable(),
    pdfHeader: Yup.string()
      .matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS'))
      .trim()
      .min(1, t('SPACES_ONLY_VALIDATION_MESSAGE')),
    pdfFooter: Yup.string()
      .matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS'))
      .trim()
      .min(1, t('SPACES_ONLY_VALIDATION_MESSAGE')),
    colorCode: Yup.string()
      .matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS'))
      .trim()
      .min(1, t('SPACES_ONLY_VALIDATION_MESSAGE')),
    pdfHeaderHeight: Yup.string().matches(VALID_FLOAT, t('LBL_INVALID_NUMBER_VALUE')),
    pdfFooterHeight: Yup.string().matches(VALID_FLOAT, t('LBL_INVALID_NUMBER_VALUE')),
  });

  const submit = async () => {
    const isValid = await validateFormForSubmit();
    if (!isValid) return null;

    setDisableSave(true);
    setButtonClicked(true);
    saveSettings();
  };

  const alertHandler = (title, message) => {
    if (message) dispatch(alertsActions.initiateAlert({ title, message }));
    setButtonClicked(false);

    if (title === 'Success') {
      setTimeout(() => {
        setDisableSave(false);
      }, 3000);
    } else {
      setDisableSave(false);
    }
  };

  const formik = useFormik({
    initialValues: initValues,
    validationSchema: valSchema,
    validateOnMount: true,
    onSubmit: submit,
  });

  const { validateFormForSubmit } = useFormikSubmit(formik, alertHandler);

  const onSaveSettingPayload = () => {
    let payload = {
      data: {
        pdfFooter: formik.values.pdfFooter,
        pdfHeader: formik.values.pdfHeader,
        pdfFooterHeight: formik.values.pdfFooterHeight,
        pdfHeaderHeight: formik.values.pdfHeaderHeight,
        addressPositionSelect: formik.values.addressPositionSelect,
        logoPositionSelect: formik.values.logoPositionSelect,
        name: formik.values.name,
        colorCode: formik.values.colorCode,
        defaultMailBirtTemplate: formik.values.defaultMailBirtTemplate ?? null,
      },
    };
    return payload;
  };

  const saveSettings = async () => {
    const response = await api('POST', getModelUrl(MODELS.PRINTING_SETTINGS), onSaveSettingPayload());
    let status = response.data.status;
    let data = response.data.data;
    if (status !== 0) return alertHandler('Error', t('LBL_ERROR_SAVING_SETTING'));
    if (!data) return alertHandler('Error', t('LBL_ERROR_SAVING_SETTING'));

    if (data && data[0]) {
      alertHandler('Success', t('LBL_PRINTING_SETTING_SAVED'));
      setTimeout(() => {
        navigate(getFeaturePath('PRINTING_SETTINGS'));
      }, 3000);
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
              <BreadCrumb feature={feature} subFeature={subFeature} modeText="LBL_ADD_PRINTING_SETTING" />
            </div>
          </div>

          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{t('LBL_NEW_PRINTING_SETTING')}</h4>
              </div>

              <div className="reverse-page float-end">
                <BackButton text={t('LBL_CANCEL')} disabled={disableSave} />
                <PrimaryButton disabled={disableSave} onClick={() => submit()} />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <PrintingSettingsForm formik={formik} mode={mode} alertHandler={alertHandler} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddPrintingSetting;
