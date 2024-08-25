import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import ConfirmationPopup from '../../components/ConfirmationPopup';
import MoreAction from '../../parts/MoreAction';
import BreadCrumb from '../../components/ui/BreadCrumb';
import ActionsProgessBar from '../../parts/ActionsProgessBar';
import BackButton from '../../components/ui/buttons/BackButton';
import Calendar from '../../components/ui/Calendar';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';
import BankStatementForm from './BankStatementForm';

import { useAxiosFunction } from '../../hooks/useAxios';
import { MODELS } from '../../constants/models';
import { checkFlashOrError, getLastYearDate } from '../../utils/helpers';
import { getSearchUrl, getActionUrl, getModelUrl, getFetchUrl, getUploadUrl, getVerifyUrl } from '../../services/getUrl';
import { STATEMENTS_FIELDS } from './StatementsPayloadsFields';
import { useFeatures } from '../../hooks/useFeatures';
import { getStatementErrorLabel } from '../../utils/statementHelpers';
import { VALID_TEXT_WITH_SPECIAL_CHARS } from '../../constants/regex/Regex';
import { setFieldValue, setAllValues } from '../../utils/formHelpers';
import { alertsActions } from '../../store/alerts';

const EditBankStatement = ({ feature, subFeature }) => {
  const brSubFeature = 'BANK_RECONCILIATIONS';
  const mode = 'edit';
  const url = window.location.href.split('/');
  const id = parseInt(url[url.length - 1]);

  const navigate = useNavigate();
  const { getFeaturePath } = useFeatures();
  const { t } = useTranslation();
  const { api, uploadDocument } = useAxiosFunction();
  const dispatch = useDispatch();

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [statementFile, setStatementFile] = useState(null);
  const [statementID, setStatementID] = useState(null);
  const [isImport, setIsImport] = useState(false);
  const [fetchedStatement, setFetchedStatement] = useState(null);
  const [fetchedAdditionalInfo, setFetchedAdditionalInfo] = useState(null);

  const [disableImport, setDisableImport] = useState(true);
  const [isAutoReconcile, setIsAutoReconcile] = useState(true);

  const [buttonClicked, setButtonClicked] = useState(false);
  const [disableSave, setDisableSave] = useState(false);
  const [showMoreAction, setShowMoreAction] = useState(false);
  const today = new Date();

  const initValues = {
    name: '',
    fromDate: '',
    toDate: '',
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
      setButtonClicked(true);
      setDisableSave(true);
      saveStatement();
    } else {
      alertHandler('Error', t('LBL_REQUIRED_FIELDS'));
    }
  };

  const formik = useFormik({
    initialValues: initValues,
    validationSchema: valSchema,
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

  useEffect(() => {
    fetchBankStatement();
  }, []);

  useEffect(() => {
    if (statementFile) {
      saveStatement();
    }
  }, [statementFile]);

  useEffect(() => {
    if ((statementID && isImport) || statementID !== null) {
      setButtonClicked(true);
      updateAdditionalInfo();
    }
  }, [statementID]);

  const fetchBankStatementPayload = () => {
    let payload = {
      fields: STATEMENTS_FIELDS,
      related: {},
    };
    return payload;
  };

  const fetchBankStatement = async () => {
    const response = await api('POST', getFetchUrl(MODELS.BANK_STATEMENT, id), fetchBankStatementPayload());
    let status = response.data.status;
    let data = response.data.data;
    if (status !== 0 || !data) return alertHandler('Error', t('LBL_ERROR_LOADING_BANK_STATEMENT'));

    if (data) {
      let statement = data[0];
      setFetchedStatement(statement);

      setAllValues(formik, {
        name: statement.name,
        fromDate: statement.fromDate ?? '',
        toDate: statement.toDate ?? '',
        fileFormat: statement.bankStatementFileFormat,
        uploadedFile: statement.bankStatementFile
          ? {
              id: statement.bankStatementFile.id,
              name: statement.bankStatementFile.fileName,
            }
          : null,
      });
      fetchAdditionalInfo();

      if (statement.bankStatementFile && statement.bankStatementFile.fileName) {
        setDisableImport(false);
      }
    }
  };

  const fetchAdditionalInfoPayload = () => {
    let payload = {
      fields: ['bankStatement', 'bankDetails'],
      sortBy: null,
      data: {
        _domain: 'self.bankStatement.id = :bsID',
        _domainContext: {
          _id: null,
          bsID: parseInt(id),
        },
      },
      limit: -1,
      offset: 0,
      translate: true,
    };
    return payload;
  };

  const fetchAdditionalInfo = async () => {
    const response = await api('POST', getSearchUrl(MODELS.BANK_STATEMENT_ADDITIONAL_INFO), fetchAdditionalInfoPayload());
    let status = response.data.status;
    let total = response.data.total;
    let data = response.data.data;

    if (status !== 0 || total === undefined || total === null || !data) {
      return alertHandler('Error', t('LBL_ERROR_LOADING_BANK_DETAILS'));
    }

    if (total > 0 && data) {
      setFetchedAdditionalInfo(data[0]);
      let rowBankDetails = data[0].bankDetails;
      setFieldValue(formik, 'bankDetails', rowBankDetails);
    }
  };

  const uploadFile = async () => {
    setDisableSave(true);
    setButtonClicked(true);

    if (
      fetchedStatement.bankStatementFile.id &&
      formik.values.uploadedFile.id &&
      formik.values.uploadedFile.id === fetchedStatement.bankStatementFile.id
    ) {
      setStatementFile({ id: formik.values.uploadedFile.id });
    } else {
      const response = await uploadDocument(getUploadUrl(MODELS.METAFILE), formik.values.uploadedFile);
      let status = response.data.status;
      let data = response.data.data;
      if (status !== 0 || !data) return alertHandler('Error', t('LBL_ERROR_UPLOADING_FILE'));

      if (data) {
        let id = data[0].id;
        setStatementFile({ id: id });
      }
    }
  };

  const onSaveStatementPayload = () => {
    let payload = {
      data: {
        id: fetchedStatement.id,
        version: fetchedStatement.version,
        statusSelect: fetchedStatement.statusSelect,
        name: formik.values.name,
        fromDate: formik.values.fromDate,
        toDate: formik.values.toDate,
        _original: {
          statusSelect: 1,
        },
      },
    };
    if (statementFile !== null) payload.data.bankStatementFile = statementFile;
    if (formik.values.fileFormat !== null) payload.data.bankStatementFileFormat = formik.values.fileFormat;
    return payload;
  };

  const saveStatement = async () => {
    const response = await api('POST', getModelUrl(MODELS.BANK_STATEMENT), onSaveStatementPayload());
    let status = response.data.status;
    let data = response.data.data;
    if (status !== 0 || !data) return alertHandler('Error', t('LBL_ERROR_SAVING_BANK_STATEMENT'));

    if (data) {
      setStatementID(data[0].id);
      setButtonClicked(false);
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

    if (fetchedAdditionalInfo) {
      payload.data.id = fetchedAdditionalInfo.id;
      payload.data.version = fetchedAdditionalInfo.version;
    }

    return payload;
  };

  const updateAdditionalInfo = async () => {
    const response = await api('POST', getModelUrl(MODELS.BANK_STATEMENT_ADDITIONAL_INFO), additionalInfoPayload());
    let status = response.data.status;
    let data = response.data.data;
    if (status !== 0 || !data) return alertHandler('Error', t('LBL_ERROR_LOADING_BANK_DETAILS'));

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
        navigate(getFeaturePath(subFeature));
      }, 3000);
      return;
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
    let status = response.data.status;
    if (status !== 0) {
      alertHandler('Error', t('LBL_ERROR_IMPORT_BANK_STATEMENT'));
      setTimeout(() => {
        navigate(getFeaturePath(subFeature));
      }, 3000);
      return;
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
        navigate(getFeaturePath(subFeature));
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
    if (status !== 0 || !data) return alertHandler('Error', t('LBL_ERROR_RUN_BANK_RECONCILIATION'));

    if (data) {
      if (data && checkFlashOrError(data)) {
        return alertHandler('Error', t('LBL_ERROR_RUN_BANK_RECONCILIATION'));
      }

      if (data[0] && data[0].view && data[0].view.domain) {
        let domain = data[0].view.domain;

        if (domain.includes('()')) {
          return alertHandler('Error', t('LBL_ERROR_RUN_BANK_RECONCILIATION'));
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

  const deleteStatementHandler = () => {
    setButtonClicked(true);
    setDisableSave(true);
    deleteStatement();
  };

  const getDeleteStatementPayload = () => {
    let payload = {
      model: MODELS.BANK_STATEMENT,
      action: 'action-bank-statement-remove-all',
      data: {
        context: {
          ids: [id],
        },
      },
    };
    return payload;
  };

  const deleteStatement = async () => {
    const response = await api('POST', getActionUrl(), getDeleteStatementPayload());
    let status = response.data.status;
    let data = response.data.data;

    if (status === -1) {
      if (data && checkFlashOrError(data)) {
        return alertHandler('Error', t(getStatementErrorLabel(data[0].error)));
      }
    }

    if (status !== 0) {
      return alertHandler('Error', t('LBL_ERROR_DELETE_BANK_STATEMENTS'));
    }

    if (status === 0) {
      alertHandler('Success', t('LBL_BANK_STATEMENTS_DELETED'));
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
              <BreadCrumb feature={feature} subFeature={subFeature} modeText="LBL_EDIT_BANK_STATEMENT" />
            </div>
          </div>

          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{formik.values.name}</h4>
              </div>
              <div className="reverse-page float-end">
                <BackButton disabled={disableSave} />
                <PrimaryButton onClick={() => submit()} disabled={disableSave} />
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
        <ConfirmationPopup onClickHandler={deleteStatementHandler} setConfirmationPopup={setShowDeletePopup} item={fetchedStatement.name} />
      )}
    </>
  );
};

export default EditBankStatement;
