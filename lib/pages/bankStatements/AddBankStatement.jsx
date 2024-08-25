import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import BreadCrumb from '../../components/ui/BreadCrumb';
import BackButton from '../../components/ui/buttons/BackButton';
import Calendar from '../../components/ui/Calendar';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';
import BankStatementForm from './BankStatementForm';

import { useAxiosFunction } from '../../hooks/useAxios';
import { MODELS } from '../../constants/models';
import { checkFlashOrError, getLastYearDate } from '../../utils/helpers';
import { getActionUrl, getModelUrl, getUploadUrl, getVerifyUrl } from '../../services/getUrl';
import { useFeatures } from '../../hooks/useFeatures';
import { getStatementErrorLabel } from '../../utils/statementHelpers';
import { VALID_TEXT_WITH_SPECIAL_CHARS } from '../../constants/regex/Regex';
import { alertsActions } from '../../store/alerts';

const AddBankStatement = ({ feature, subFeature }) => {
  const brSubFeature = 'BANK_RECONCILIATIONS';
  const mode = 'add';
  const navigate = useNavigate();
  const { getFeaturePath } = useFeatures();
  const { t } = useTranslation();
  const { api, uploadDocument } = useAxiosFunction();
  const dispatch = useDispatch();

  const [statementFile, setStatementFile] = useState(null);
  const [statementID, setStatementID] = useState(null);
  const [isImport, setIsImport] = useState(false);
  const [disableImport, setDisableImport] = useState(true);
  const [isAutoReconcile, setIsAutoReconcile] = useState(true);
  const [buttonClicked, setButtonClicked] = useState(false);
  const [disableSave, setDisableSave] = useState(false);
  const today = new Date();

  const initValues = {
    name: '',
    fromDate: '',
    toDate: today,
    fileFormat: null,
    uploadedFile: null,
    bankDetails: null,
  };

  const valSchema = Yup.object().shape({
    name: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).trim().required(t('LBL_NAME_REQUIRED')),
    fromDate: Yup.date()
      .required(t('LBL_DATE_REQUIRED'))
      .min(getLastYearDate(), t('LBL_ERROR_MIN_DATE'))
      .max(today, t('LBL_ERROR_MAX_DATE')),
    toDate: Yup.date()
      .required(t('LBL_DATE_REQUIRED'))
      .min(Yup.ref('fromDate'), t('LBL_ERROR_MIN_DATE'))
      .max(today, t('LBL_ERROR_MAX_DATE')),
    fileFormat: Yup.object().nullable().required(t('LBL_FILE_FORMAT_IS_REQUIRED')),
    uploadedFile: Yup.mixed().required(t('LBL_FILE_IS_REQUIRED')),
    bankDetails: Yup.object().nullable().required(t('COMPANY_BANK_DETAILS_VALIDATION_MESSAGE')),
  });

  const submit = values => {
    if (formik.isValid) {
      uploadFile();
    } else {
      alertHandler('Error', t('LBL_REQUIRED_FIELDS'));
    }
  };

  const formik = useFormik({
    initialValues: initValues,
    validationSchema: valSchema,
    validateOnMount: true,
    onSubmit: submit,
  });

  const alertHandler = (title, message) => {
    dispatch(alertsActions.initiateAlert({ title, message }));
    setButtonClicked(false);

    if (title === 'Success') {
      setTimeout(() => {
        setDisableSave(false);
      }, 3000);
    } else {
      setDisableSave(false);
    }
  };

  const uploadFile = async () => {
    setDisableSave(true);
    setButtonClicked(true);

    if (formik.values.uploadedFile && formik.values.uploadedFile.name) {
      const response = await uploadDocument(getUploadUrl(MODELS.METAFILE), formik.values.uploadedFile);
      let data = response.data.data;
      let status = response.data.status;
      if (status !== 0 || !data) return alertHandler('Error', t('LBL_ERROR_UPLOADING_FILE'));

      if (data && data[0]) {
        let id = data[0].id;
        setStatementFile({ id: id });
        saveStatement(id);
      }
    } else {
      alertHandler('Error', t('LBL_PLEASE_SELECT_A_FILE_FIRST'));
    }
  };

  const onSaveStatementPayload = id => {
    let payload = {
      data: {
        statusSelect: 1,
        name: formik.values.name,
        bankStatementFile: { id: id },
        fromDate: formik.values.fromDate,
        toDate: formik.values.toDate,
        bankStatementFileFormat: formik.values.fileFormat,
        _original: {
          statusSelect: 1,
        },
      },
    };
    return payload;
  };

  const saveStatement = async id => {
    const response = await api('POST', getModelUrl(MODELS.BANK_STATEMENT), onSaveStatementPayload(id));
    let status = response.data.status;
    let data = response.data.data;
    if (status !== 0 || !data) return alertHandler('Error', t('LBL_ERROR_SAVING_BANK_STATEMENT'));

    if (data) {
      setStatementID(data[0].id);
    }
  };

  const runImport = () => {
    if (formik.isValid && formik.values.uploadedFile) {
      setButtonClicked(true);
      setDisableImport(true);
      setIsImport(true);
      uploadFile();
    } else {
      alertHandler('Error', t('LBL_REQUIRED_FIELDS'));
    }
  };

  useEffect(() => {
    if ((statementID && isImport) || statementID !== null) {
      addAdditionalInfo();
    }
  }, [statementID]);

  const additionalInfoPayload = () => {
    let payload = {
      data: {
        bankStatement: {
          id: statementID,
        },
        bankDetails: {
          id: formik.values.bankDetails.id,
        },
      },
    };
    return payload;
  };

  const addAdditionalInfo = async () => {
    const response = await api('POST', getModelUrl(MODELS.BANK_STATEMENT_ADDITIONAL_INFO), additionalInfoPayload());
    let status = response.data.status;
    let data = response.data.data;

    if (status !== 0 || !data) {
      alertHandler('Error', t('LBL_ERROR_LOADING_BANK_DETAILS'));
      setTimeout(() => {
        navigate(getFeaturePath(subFeature, 'edit', { id: statementID }));
      }, 3000);
    }

    if (data) {
      if (isImport) {
        saveActionRunImport();
      } else {
        alertHandler('Success', t('LBL_BANK_STATEMENT_SAVED'));
        setTimeout(() => {
          navigate(getFeaturePath(subFeature));
        }, 3000);
      }
    }
  };

  const onSaveActionRunImportPayload = () => {
    let payload = {
      model: MODELS.BANK_STATEMENT,
      action: 'save,action-bank-statement-method-run-import',
      data: {
        criteria: [],
        context: {
          _model: MODELS.BANK_STATEMENT,
          _id: null,
          id: statementID,
          _signal: 'runImportBtn',
          _source: 'runImportBtn',
        },
      },
    };
    return payload;
  };

  const saveActionRunImport = async () => {
    const response = await api('POST', getActionUrl(), onSaveActionRunImportPayload());
    let status = response.data.status;
    let data = response.data.data;

    if (status !== 0 || !data) {
      alertHandler('Error', t('LBL_ERROR_IMPORT_BANK_STATEMENT'));
      setTimeout(() => {
        navigate(getFeaturePath(subFeature, 'edit', { id: statementID }));
      }, 3000);
    }

    if (data && checkFlashOrError(data)) {
      let error = data[0].flash;
      return alertHandler('Error', t(getStatementErrorLabel(error)));
    }

    if (data) {
      onVerifyImport();
    }
  };

  const onVerifyImport = async () => {
    const response = await api('POST', getVerifyUrl(MODELS.BANK_STATEMENT), {
      data: {
        id: statementID,
      },
    });
    if (response.data.status !== 0) {
      alertHandler('Error', t('LBL_ERROR_IMPORT_BANK_STATEMENT'));
      setTimeout(() => {
        navigate(getFeaturePath(subFeature, 'edit', { id: statementID }));
      }, 3000);
    } else onActionRunImport();
  };

  const onActionRunImportPayload = () => {
    let payload = {
      model: MODELS.BANK_STATEMENT,
      action: 'action-bank-statement-method-run-import',
      data: {
        criteria: [],
        context: {
          _model: MODELS.BANK_STATEMENT,
          _id: null,
          bankStatementFile: statementFile,
          id: statementID,
          bankStatementFileFormat: formik.values.fileFormat,
          _signal: 'runImportBtn',
          _source: 'runImportBtn',
        },
      },
    };
    return payload;
  };

  const onActionRunImport = async () => {
    const response = await api('POST', getActionUrl(), onActionRunImportPayload());
    let status = response.data.status;
    let data = response.data.data;

    if (status !== 0 || !data) {
      alertHandler('Error', t('LBL_ERROR_IMPORT_BANK_STATEMENT'));
      setTimeout(() => {
        navigate(getFeaturePath(subFeature, 'edit', { id: statementID }));
      }, 3000);
      return;
    }

    if (data && checkFlashOrError(data)) {
      let error = data[0].flash;
      return alertHandler('Error', t(getStatementErrorLabel(error)));
    }

    if (data) {
      alertHandler('Success', t('LBL_STATEMENT_IMPORTED_SUCCESSFULLY'));
      runBankReconciliation();
    }
  };

  const runBankReconciliationPayload = () => {
    let payload = {
      model: MODELS.BANK_STATEMENT,
      action: 'action-bank-statement-method-run-bank-reconciliation',
      data: {
        criteria: [],
        context: {
          _model: MODELS.BANK_STATEMENT,
          _id: null,
          id: statementID,
        },
      },
    };
    return payload;
  };

  const runBankReconciliation = async () => {
    const response = await api('POST', getActionUrl(), runBankReconciliationPayload());
    let status = response.data.status;
    let data = response.data.data;

    if (status !== 0 || data === undefined || data === null) {
      alertHandler('Error', t('LBL_ERROR_RUN_BANK_RECONCILIATION'));
      setTimeout(() => {
        navigate(getFeaturePath(subFeature, 'view', { id: statementID }));
      }, 3000);
      return;
    }

    if (data) {
      if (data[0] && data[0].view && data[0].view.domain) {
        let domain = data[0].view.domain;

        if (domain.includes('()')) {
          alertHandler('Error', t('LBL_ERROR_RUN_BANK_RECONCILIATION'));
          setTimeout(() => {
            navigate(getFeaturePath(subFeature, 'view', { id: statementID }));
          }, 3000);
          return;
        } else {
          let id = domain.slice(domain.indexOf('(') + 1, domain.lastIndexOf(')'));

          if (id.length > 0) {
            navigate(getFeaturePath(brSubFeature, 'edit', { id: id }), {
              state: { autoReconcile: isAutoReconcile },
            });
          } else {
            navigate(getFeaturePath(brSubFeature));
          }
        }
      }
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
              <BreadCrumb feature={feature} subFeature={subFeature} modeText="LBL_ADD_BANK_STATEMENT" />
            </div>
          </div>

          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{t('LBL_NEW_BANK_STATEMENT')}</h4>
              </div>
              <div className="reverse-page float-end">
                <BackButton text={t('LBL_CANCEL')} disabled={disableSave} />
                <PrimaryButton onClick={() => submit()} disabled={disableSave} />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <BankStatementForm
                formik={formik}
                mode={mode}
                alertHandler={alertHandler}
                disableImport={disableImport}
                setDisableImport={setDisableImport}
                onImportClick={runImport}
                setIsAutoReconcile={setIsAutoReconcile}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddBankStatement;
