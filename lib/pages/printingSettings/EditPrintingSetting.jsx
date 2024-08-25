import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import ConfirmationPopup from '../../components/ConfirmationPopup';
import MoreAction from '../../parts/MoreAction';
import BreadCrumb from '../../components/ui/BreadCrumb';
import ActionsProgessBar from '../../parts/ActionsProgessBar';
import BackButton from '../../components/ui/buttons/BackButton';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';
import Calendar from '../../components/ui/Calendar';
import PrintingSettingsForm from './PrintingSettingsForm';

import { useAxiosFunction } from '../../hooks/useAxios';
import { MODELS } from '../../constants/models';
import { VALID_FLOAT } from '../../constants/regex/Regex';
import { getModelUrl, getFetchUrl, getRemoveAllUrl } from '../../services/getUrl';
import { useFeatures } from '../../hooks/useFeatures';
import { addObjectToChanges, addFormikValueToChanges } from '../../utils/comparatorHelpers';
import { VALID_TEXT_WITH_SPECIAL_CHARS } from '../../constants/regex/Regex';
import { alertsActions } from '../../store/alerts';
import { useFormikSubmit } from '../../hooks/useFormikSubmit';

const EditPrintingSetting = ({ feature, subFeature }) => {
  const mode = 'edit';
  const { api } = useAxiosFunction();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getFeaturePath } = useFeatures();
  const dispatch = useDispatch();

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showMoreAction, setShowMoreAction] = useState(false);

  const url = window.location.href.split('/');
  const id = parseInt(url[url.length - 1]);

  const [fetchedPrintingSetting, setFetchedPrintingSetting] = useState(null);
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

    setButtonClicked(true);
    setDisableSave(true);
    saveSettings();
  };

  const formik = useFormik({
    initialValues: initValues,
    validationSchema: valSchema,
    onSubmit: submit,
  });

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

  const { validateFormForSubmit } = useFormikSubmit(formik, alertHandler);

  useEffect(() => {
    fetchPrintingSettings();
  }, []);

  useEffect(() => {
    if (!formik.isValid) formik.validateForm();
  }, [formik.isValid]);

  const onFetchPayload = () => {
    let payload = {
      fields: [
        'pdfFooterHeight',
        'pdfHeader',
        'pdfHeaderHeight',
        'name',
        'pdfFooter',
        'colorCode',
        'addressPositionSelect',
        'defaultMailBirtTemplate',
        'logoPositionSelect',
      ],
      related: {},
    };
    return payload;
  };

  const fetchPrintingSettings = () => {
    api('POST', getFetchUrl(MODELS.PRINTING_SETTINGS, id), onFetchPayload(), onFetchSuccess);
  };

  const onFetchSuccess = response => {
    let status = response.data.status;
    let data = response.data.data;
    if (status !== 0) navigate(getFeaturePath(subFeature));
    if (data === undefined || data === null) navigate(getFeaturePath(subFeature));

    if (data && data[0]) {
      let printing = data[0];
      setFetchedPrintingSetting(printing);
      formik.setValues({
        name: printing.name,
        defaultMailBirtTemplate: printing.defaultMailBirtTemplate ?? null,
        logoPositionSelect: printing.logoPositionSelect,
        colorCode: printing.colorCode ?? '',
        addressPositionSelect: printing.addressPositionSelect,
        pdfHeader: printing.pdfHeader ?? '',
        pdfHeaderHeight: printing.pdfHeaderHeight ?? '',
        pdfFooter: printing.pdfFooter ?? '',
        pdfFooterHeight: printing.pdfFooterHeight ?? '',
      });
    }
  };

  const getChangedFields = () => {
    let changedFields = {};
    addFormikValueToChanges('name', changedFields, fetchedPrintingSetting.name, formik);
    addFormikValueToChanges('colorCode', changedFields, fetchedPrintingSetting.colorCode, formik);
    addFormikValueToChanges('addressPositionSelect', changedFields, fetchedPrintingSetting.addressPositionSelect, formik);
    addFormikValueToChanges('logoPositionSelect', changedFields, fetchedPrintingSetting.logoPositionSelect, formik);
    addFormikValueToChanges('pdfHeader', changedFields, fetchedPrintingSetting.pdfHeader, formik);
    addFormikValueToChanges('pdfHeaderHeight', changedFields, fetchedPrintingSetting.pdfHeaderHeight, formik);
    addFormikValueToChanges('pdfFooter', changedFields, fetchedPrintingSetting.pdfFooter, formik);
    addFormikValueToChanges('pdfFooterHeight', changedFields, fetchedPrintingSetting.pdfFooterHeight, formik);
    addObjectToChanges(
      'defaultMailBirtTemplate',
      changedFields,
      fetchedPrintingSetting.defaultMailBirtTemplate,
      formik.values.defaultMailBirtTemplate
    );
    changedFields.id = fetchedPrintingSetting.id;
    changedFields.version = fetchedPrintingSetting.version;
    return changedFields;
  };

  const onSavePayload = () => {
    let payload = {
      data: getChangedFields(),
    };
    return payload;
  };

  const saveSettings = async () => {
    const response = await api('POST', getModelUrl(MODELS.PRINTING_SETTINGS), onSavePayload());
    let status = response.data.status;
    let data = response.data.data;
    if (status !== 0) return alertHandler('Error', t('LBL_ERROR_SAVING_SETTING'));
    if (data === undefined || data === null) return alertHandler('Error', t('LBL_ERROR_SAVING_SETTING'));

    if (data && data[0]) {
      alertHandler('Success', t('LBL_PRINTING_SETTING_SAVED'));
      setTimeout(() => {
        navigate(getFeaturePath(subFeature));
      }, 3000);
    }
  };

  const getDeletePayload = () => {
    let payload = {
      records: [
        {
          id: id,
        },
      ],
    };
    return payload;
  };

  const singleDeleteHandler = () => {
    setButtonClicked(true);
    setDisableSave(true);
    api('POST', getRemoveAllUrl(MODELS.PRINTING_SETTINGS), getDeletePayload(), onSettingsDeleteSuccess);
  };

  const onSettingsDeleteSuccess = response => {
    let status = response.data.status;
    let data = response.data.data;
    if (status !== 0) return alertHandler('Error', t('LBL_ERROR_DELETE_PRINTING_SETTINGS'));
    if (!data) return alertHandler('Error', t('LBL_ERROR_DELETE_PRINTING_SETTINGS'));

    if (data) {
      alertHandler('Success', t('LBL_PRINTING_SETTINGS_DELETED'));
      setTimeout(() => {
        navigate(getFeaturePath(subFeature));
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
              <BreadCrumb feature={feature} subFeature={subFeature} modeText="LBL_EDIT_PRINTING_SETTINGS" />
            </div>
          </div>

          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{formik.values.name}</h4>
              </div>

              <div className="reverse-page float-end">
                <BackButton disabled={disableSave} />
                <PrimaryButton disabled={disableSave} onClick={() => submit()} />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <ActionsProgessBar
                feature={feature}
                subfeature={subFeature}
                viewHandler={() => {
                  navigate(getFeaturePath(subFeature, 'view', { id: id }));
                }}
                deleteHandler={() => setShowDeletePopup(true)}
                setShowMoreAction={setShowMoreAction}
              />
              <PrintingSettingsForm formik={formik} mode={mode} alertHandler={alertHandler} />
            </div>
          </div>
        </div>
      </div>
      {showMoreAction && (
        <MoreAction
          viewHandler={() => {
            navigate(getFeaturePath(subFeature, 'view', { id: id }));
          }}
          deleteHandler={() => setShowDeletePopup(true)}
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          canSelectAll={false}
        />
      )}
      {showDeletePopup && (
        <ConfirmationPopup
          onClickHandler={singleDeleteHandler}
          setConfirmationPopup={setShowDeletePopup}
          item={fetchedPrintingSetting.name}
        />
      )}
    </>
  );
};

export default EditPrintingSetting;
