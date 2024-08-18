import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import moment from 'moment';
import { useDispatch } from 'react-redux';

import BreadCrumb from '../../components/ui/BreadCrumb';
import Calendar from '../../components/ui/Calendar';
import BackButton from '../../components/ui/buttons/BackButton';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';
import SearchModalAxelor from '../../components/ui/inputs/SearchModal/SearchModalAxelor';
import FormNotes from '../../components/ui/FormNotes';

import { checkFlashOrError } from '../../utils/helpers';
import { useAxiosFunction } from '../../hooks/useAxios';
import { getActionUrl, getImportTemplateUrl, getModelUrl, getUploadUrl } from '../../services/getUrl';
import { MODELS } from '../../constants/models';
import { alertsActions } from '../../store/alerts';
import { useFormikSubmit } from '../../hooks/useFormikSubmit';
import { getImportErrorMessage } from '../../utils/importHelpers';
import { setFieldValue } from '../../utils/formHelpers';

function ImportCenter() {
  const feature = 'APP_CONFIG';
  const subFeature = 'IMPORT_MODEL';
  const { t } = useTranslation();
  moment.locale('en');
  const { api, uploadDocument, downloadAttachment } = useAxiosFunction();
  const dispatch = useDispatch();

  const [buttonClicked, setButtonCliked] = useState(false);
  const uploadInputRef = useRef();
  const [uploadedFile, setUploadedFile] = useState(null);

  const initVals = {
    importModel: null,
  };
  const valSchema = Yup.object().shape({
    importModel: Yup.object().nullable().required(t('REQUIRED')),
  });

  const formik = useFormik({
    initialValues: initVals,
    validationSchema: valSchema,
    validateOnMount: true,
  });

  const { validateFormForSubmit } = useFormikSubmit(formik, () => setButtonCliked(false));

  useEffect(() => {
    if (uploadedFile) importData();
  }, [uploadedFile]);

  const onAdvancedImportSuccess = response => {
    if (response.data.status === 0) {
      let data = response.data.data;
      let models = [];

      if (data) {
        data.forEach(model => {
          let temp = {
            id: model.id,
            version: model.version,
            name: model?.name ?? '',
            fileTabList: model ? (model.fileTabList ? (model.fileTabList[0] ? model.fileTabList[0].name : null) : null) : null,
          };
          models.push(temp);
        });
      }

      return { displayedData: [...models], total: response.data.total || 0 };
    }
  };

  const alertHandler = (title, message) => {
    setButtonCliked(false);
    setFieldValue(formik, 'importModel', null);
    dispatch(alertsActions.initiateAlert({ title, message }));
  };

  const importClickHandler = async () => {
    const isValid = await validateFormForSubmit();
    if (!isValid) return null;

    uploadInputRef.current.click();
  };

  const exportTemplate = async () => {
    const isValid = await validateFormForSubmit();
    if (!isValid) return null;
    setButtonCliked(true);

    const getFileData = async () => {
      const response = await downloadAttachment(
        getImportTemplateUrl(`${formik.values.importModel?.fileTabList}.xlsx`),
        'application/octet-stream'
      );
      const reader = new FileReader();

      reader.onabort = () => {};

      reader.onerror = () => {};

      reader.onload = () => {
        setButtonCliked(false);
        const data = reader.result;
        const link = document.createElement('a');
        link.target = '_blank';
        link.download = `${formik.values.importModel?.fileTabList}.xlsx`;
        link.href = URL.createObjectURL(new Blob([data]));
        link.click();
      };

      reader.readAsArrayBuffer(response);
    };

    getFileData();
  };

  const importData = async () => {
    const commonError = () => {
      setButtonCliked(false);
      setUploadedFile(null);
      alertHandler('Error', t('LBL_FAILED_TO_IMPORT'));
    };

    const selectedImport = formik.values.importModel;

    if (!selectedImport) {
      commonError();
      return null;
    }

    setButtonCliked(true);
    const importId = selectedImport.id;
    const importVersion = selectedImport.version;

    const uploadMetaFileResponse = await uploadDocument(getUploadUrl(MODELS.METAFILE), uploadedFile);

    if (
      !uploadMetaFileResponse.data ||
      uploadMetaFileResponse.data.status !== 0 ||
      !uploadMetaFileResponse.data.data ||
      !uploadMetaFileResponse.data.data[0] ||
      !uploadMetaFileResponse.data.data[0].id
    ) {
      commonError();
      return null;
    }

    const fileId = uploadMetaFileResponse.data.data[0].id;

    const addImportFileResponse = await api('POST', getModelUrl(MODELS.ADVANCED_IMPORT), {
      data: {
        id: importId,
        version: importVersion || 0,
        statusSelect: 0,
        importFile: {
          id: fileId,
        },
      },
    });

    if (
      !addImportFileResponse ||
      !addImportFileResponse.data ||
      addImportFileResponse.data.status !== 0 ||
      !addImportFileResponse.data.data ||
      addImportFileResponse.data.data.length === 0
    ) {
      commonError();
      return null;
    }

    const selectedUpdatedImport = addImportFileResponse.data.data[0];

    if (!selectedImport) {
      commonError();
      return null;
    }

    const importUpdatedId = selectedUpdatedImport.id;
    const importUpdatedVersion = selectedUpdatedImport.version;

    const validatePayload = {
      model: MODELS.ADVANCED_IMPORT,
      action: 'action-advanced-import-method-validate',
      data: {
        criteria: [],
        context: {
          _model: MODELS.ADVANCED_IMPORT,
          _id: null,
          isConfigInFile: false,
          isValidateValue: true,
          importFile: {
            id: fileId,
          },
          isFileTabConfigAdded: false,
          fileSeparator: ';',
          version: importUpdatedVersion,
          statusSelect: 0,
          attachment: null,
          languageSelect: 'en',
          fileExtension: 'xlsx',
          isHeader: true,
          nbOfFirstLineIgnore: 0,
          id: importUpdatedId,
          name: formik.values.importModel?.name,
          wkfStatus: null,
          _viewType: 'form',
          _viewName: 'advanced-import-form',
          _views: [
            {
              type: 'grid',
              name: 'advanced-import-grid',
            },
            {
              type: 'form',
              name: 'advanced-import-form',
            },
          ],
          _signal: 'validateBtn',
          _source: 'validateBtn',
          // fileTabList: selectedImport?.fileTabList || [],
        },
      },
    };

    const validateResponse = await api('POST', getActionUrl(), validatePayload);

    if (
      !validateResponse ||
      !validateResponse.data ||
      validateResponse.data.status !== 0 ||
      !validateResponse.data.data[0] ||
      checkFlashOrError(validateResponse.data.data)
    ) {
      commonError();
      return null;
    }

    const postValidationSaveResponse = await api('POST', getModelUrl(MODELS.ADVANCED_IMPORT), {
      data: {
        id: importUpdatedId,
        version: importUpdatedVersion || 0,
        statusSelect: 1,
      },
    });

    if (!postValidationSaveResponse || !postValidationSaveResponse.data || postValidationSaveResponse.data.status !== 0) {
      commonError();
      return null;
    }

    const importActionResponse = await api('POST', getActionUrl(), {
      model: MODELS.ADVANCED_IMPORT,
      action: 'action-advanced-import-method-import',
      data: {
        criteria: [],
        context: {
          id: importUpdatedId,
        },
      },
    });

    if (
      !importActionResponse ||
      !importActionResponse.data ||
      importActionResponse.data.status !== 0 ||
      !importActionResponse.data.data[0]
    ) {
      commonError();
      return null;
    }

    if (checkFlashOrError(importActionResponse.data.data)) {
      if (importActionResponse.data.data[0].flash === 'Data imported successfully') {
        setUploadedFile(null);
        return alertHandler('Success', t('LBL_SUCCESS_IMPORT'));
      } else {
        let errorMsg = getImportErrorMessage(importActionResponse.data?.data?.[0]?.flash);

        if (errorMsg) {
          return alertHandler('Error', t(errorMsg));
        } else {
          commonError();
          return null;
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
              <BreadCrumb feature={feature} subFeature={subFeature} />
            </div>
          </div>

          <div className="row ">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{t('LBL_IMPORT_MODEL')}</h4>
              </div>

              <div className="reverse-page float-end">
                <BackButton backPath="/home" />
                <PrimaryButton theme="blue" onClick={() => exportTemplate()} text="LBL_DOWNLOAD_TEMPLATE" />
                <PrimaryButton theme="blue" onClick={() => importClickHandler()} text="LBL_IMPORT" />
                <input
                  ref={uploadInputRef}
                  type="file"
                  style={{ display: 'none' }}
                  onChange={event => {
                    if (event.currentTarget.files[0]) {
                      setUploadedFile(event.currentTarget.files[0]);
                      event.currentTarget.value = '';
                    }
                  }}
                />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className="row">
                  <div className="col-md-6">
                    <SearchModalAxelor
                      formik={formik}
                      modelKey="ADVANCED_IMPORT"
                      mode="add"
                      isRequired={true}
                      onSuccess={onAdvancedImportSuccess}
                      defaultValueConfig={null}
                      isNeedVersion={true}
                    />
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

export default ImportCenter;
