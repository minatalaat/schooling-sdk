import { useState, useRef, useEffect } from 'react';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { FaUpload, FaFileImport } from 'react-icons/fa';
// import { IoMdHelpCircle } from 'react-icons/io';
import Dropdown from 'react-bootstrap/Dropdown';
import { SpinnerCircular } from 'spinners-react';

import { useAxiosFunction } from '../../hooks/useAxios';
import { getSearchUrl, getActionUrl, getUploadUrl, getModelUrl, getMetaFileUrl } from '../../services/getUrl';
// import { MODELS } from '../../assets/constants/models';
import { checkFlashOrError } from '../../utils/helpers';
import { getItem } from '../../utils/localStorage';
import { MODELS } from '../../constants/models';

export default function ImportData({ importConfigName, onAlert, refreshData }) {
  const { t } = useTranslation();
  const { axiosFetch, uploadDocument, downloadFile } = useAxiosFunction();
  const uploadInputRef = useRef();
  moment.locale('en');

  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const importOptions = [
    { name: 'Import', title: t('LBL_IMPORT_DATA'), action: 'action-export-excel-method', type: 'xlsx', IconComponent: FaFileImport },
    // { name: 'guide', title: t('LBL_IMPORT_DATA_GUIDE'), action: 'action-export-pdf-method', type: 'guide', IconComponent: IoMdHelpCircle },
  ];

  const dropdownSelectHandler = name => {
    if (name === 'Import') {
      uploadInputRef.current.click();
    }
  };

  const importData = async () => {
    setIsLoading(true);

    const commonError = () => {
      setIsLoading(false);
      setUploadedFile(null);
      onAlert('Error', t('LBL_FAILED_TO_IMPORT'));
    };

    const searchImportResponse = await axiosFetch('POST', getSearchUrl(MODELS.ADVANCED_IMPORT), {
      fields: ['statusSelect', 'isConfigInFile', 'isHeader', 'importFile', 'name', 'fileTabList'],
      data: {
        _domain: null,
        _domainContext: {
          _id: null,
          _model: MODELS.ADVANCED_IMPORT,
        },
      },
    });

    if (
      !searchImportResponse ||
      !searchImportResponse.data ||
      searchImportResponse.data.status !== 0 ||
      !searchImportResponse.data.data ||
      !searchImportResponse.data.data[0]
    ) {
      commonError();
      return null;
    }

    const selectedImport = searchImportResponse.data.data.find(record => record.name === importConfigName);

    if (!selectedImport) {
      commonError();
      return null;
    }

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

    const addImportFileResponse = await axiosFetch('POST', getModelUrl(MODELS.ADVANCED_IMPORT), {
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
          name: importConfigName,
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
          fileTabList: selectedImport?.fileTabList || [],
        },
      },
    };

    const validateResponse = await axiosFetch('POST', getActionUrl(), validatePayload);

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

    const postValidationSaveResponse = await axiosFetch('POST', getModelUrl(MODELS.ADVANCED_IMPORT), {
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

    const importActionResponse = await axiosFetch('POST', getActionUrl(), {
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

    if (importActionResponse.data.data[0].values?.errorLog?.fileName) {
      let fileId = importActionResponse.data.data[0].values?.errorLog?.id;
      const fileName = importActionResponse.data.data[0].values?.errorLog?.fileName;

      downloadFile(
        getMetaFileUrl(fileId, importId, MODELS.ADVANCED_IMPORT),
        fileName,
        () => {
          setIsLoading(false);
          setUploadedFile(null);
          onAlert('Error', t('LBL_FAILED_TO_IMPORT_CHECK_LOG'));
        },
        () => {
          commonError();
          return null;
        }
      );
    }

    if (checkFlashOrError(importActionResponse.data.data) && importActionResponse.data.data[0].flash === 'Data imported successfully') {
      setIsLoading(false);
      setUploadedFile(null);
      onAlert('Success', t('LBL_SUCCESS_IMPORT'));
      setTimeout(() => {
        refreshData();
      }, [1500]);
    } else {
      commonError();
    }
  };

  useEffect(() => {
    if (uploadedFile) importData();
  }, [uploadedFile]);

  return (
    <>
      <Dropdown className="float-end import-dropdown" onSelect={dropdownSelectHandler}>
        {!isLoading && (
          <Dropdown.Toggle variant="">
            <FaUpload isIcon={true} size={23} style={{ margin: '0 0.5rem' }} />
          </Dropdown.Toggle>
        )}
        {isLoading && (
          <SpinnerCircular
            size={35}
            thickness={138}
            speed={100}
            color="rgba(31, 79, 222, 1)"
            secondaryColor="rgba(153, 107, 229, 0.19)"
            style={getItem('code') === 'ar' ? { marginTop: '12px', marginLeft: '14px' } : { marginTop: '12px', marginRight: '14px' }}
          />
        )}

        <Dropdown.Menu>
          {importOptions.map(option => (
            <Dropdown.Item key={option.name} className={option.type} eventKey={option.name}>
              <option.IconComponent isIcon={true} size={23} style={{ margin: '0 0.5rem' }} values={option.name} />
              {option.title}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
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
    </>
  );
}
