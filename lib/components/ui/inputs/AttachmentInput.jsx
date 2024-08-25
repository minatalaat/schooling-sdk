import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { useAxiosFunction } from '../../../hooks/useAxios';
import { getDownloadAttachmentUrl, getSearchUrl, getUploadAttachmentUrl, getModelUrl, getRemoveAllUrl } from '../../../services/getUrl';
import { MODELS } from '../../../constants/models';
import {
  baseStyle,
  focusedStyle,
  attachmentContainerStyle,
  thumbsContainer,
  thumb,
  removeOneStyle,
} from '../../../utils/attachmentsStyles';
import RectangleSkeleton from '../../../components/ui/skeletons/RectangleSkeleton';
import { FaFileAlt } from 'react-icons/fa';
import DeleteIconBtnHeader from '../../../assets/images/delete-icon.svg';
import { useNavigate } from 'react-router-dom';
import { useFeatures } from '../../../hooks/useFeatures';
import FormNotes from '../FormNotes';

const AttachmentInput = ({
  mode,
  modelKey,
  isRequired,
  successMessage,
  fetchedObj,
  parentSaveDone,
  feature,
  navigationParams,
  alertHandler,
  onSuccessFn,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getFeaturePath } = useFeatures();
  const { api, uploadAttachment, downloadAttachment } = useAxiosFunction();
  const maxSize = 2097152;
  const [parentID, setParentID] = useState(null);
  const [deleteRecords, setDeleteRecords] = useState([]);
  const [files, setFiles] = useState([]);
  const [filesLoaded, setFilesLoaded] = useState(false);
  const [maxFileExceeded, setMaxFileExceeded] = useState(false);
  const directoryFields = ['fileName', 'relatedModel', 'relatedId'];
  const directoryDomain =
    'self.isDirectory = true AND self.relatedId = :rid AND self.relatedModel = :rmodel AND self.parent.relatedModel = :rmodel AND (self.parent.relatedId is null OR self.parent.relatedId = 0)';
  const filesFields = ['isLock', 'fileName', 'metaFile.sizeText', 'updatedOn', 'relatedId', 'relatedModel', 'isDirectory', 'metaFile.id'];

  useEffect(() => {
    if (mode === 'add') {
      getFiles();
    }
  }, []);

  useEffect(() => {
    if (fetchedObj?.id && mode !== 'add') {
      getFiles();
    }
  }, [fetchedObj]);

  useEffect(() => {
    if (parentSaveDone && fetchedObj) onSaveRelatedModel();
  }, [parentSaveDone, fetchedObj]);

  const getDirectoryPayload = () => {
    let payload = {
      fields: directoryFields,
      sortBy: null,
      data: {
        _domain: directoryDomain,
        _domainContext: {
          rid: fetchedObj ? fetchedObj.id : null,
          rmodel: modelKey,
        },
      },
      limit: 1,
      offset: 0,
      translate: true,
    };
    return payload;
  };

  const getFilesPayload = parentID => {
    let payload = {
      fields: filesFields,
      sortBy: null,
      data: {
        _domain: `self.parent.id = ${parentID}`,
        _domainContext: {
          _model: MODELS.DMS_FILE,
        },
        operator: 'and',
        criteria: [],
      },
      limit: -1,
      offset: 0,
      translate: true,
    };
    return payload;
  };

  const getFiles = async () => {
    const response = await api('POST', getSearchUrl(MODELS.DMS_FILE), getDirectoryPayload());
    let status = response?.data?.status;
    let data = response?.data?.data;
    let total = response?.data?.total;

    if (status !== 0 || total === undefined || total === null) {
      setFilesLoaded(true);
      return alertHandler('Error', t('LBL_ERROR_LOADING_FILES'));
    }

    let parentID = -1;

    if (data && data[0]) {
      parentID = data[0].id;
    }

    setParentID(parentID);
    const filesResponse = await api('POST', getSearchUrl(MODELS.DMS_FILE), getFilesPayload(parentID));
    let status2 = filesResponse.data.status;
    let total2 = filesResponse.data.total;
    let data2 = filesResponse.data.data;

    if (status2 !== 0 || total2 === undefined || total2 === null) {
      setFilesLoaded(true);
      return alertHandler('Error', t('LBL_ERROR_LOADING_FILES'));
    }

    if (!data2) {
      setFiles([]);
      setFilesLoaded(true);
    }

    if (data2) {
      for (let i in data2) {
        await getFetchedFileData(data2[i]);
      }

      setFilesLoaded(true);
    }
  };

  const getFetchedFileData = async fetchedFile => {
    const response = await downloadAttachment(getDownloadAttachmentUrl(fetchedFile.id), 'application/octet-stream');
    if (!response) return null;
    const file = new File([response], fetchedFile.fileName, {
      type: response.type,
    });
    const reader = new FileReader();

    reader.onabort = () => {};

    reader.onerror = () => {};

    reader.onload = () => {
      const data = reader.result;
      let newFile = {
        id: fetchedFile.id,
        isOld: true,
        fileName: file.name,
        fileString: file.name.length >= 30 ? file.name.substring(0, 30) + '...' : file.name,
        fileSize: file.size,
        fileType: file.type,
        data: data,
        file: file,
      };
      const found = files.some(el => el.id === fetchedFile.id);
      if (!found) setFiles(prev => [...prev, newFile]);
    };

    reader.readAsArrayBuffer(response);
  };

  const onAddFile = (file, data) => {
    let newFile = {
      id: uuidv4(),
      isOld: false,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      data: data,
      file: file,
      fileString: file.name.length >= 30 ? file.name.substring(0, 30) + '...' : file.name,
    };
    setFiles(prev => [...prev, newFile]);
  };

  const onDownloadClick = file => {
    const link = document.createElement('a');
    link.target = '_blank';
    link.download = file.fileName;
    link.href = URL.createObjectURL(new Blob([file.data]));
    link.click();
  };

  const onRemoveClick = file => {
    let tempFiles = [...files];
    tempFiles.splice(tempFiles.indexOf(file), 1);
    setFiles(tempFiles);
    if (file.isOld) setDeleteRecords(prev => [...prev, { id: file.id }]);
  };

  const onRemoveAllClick = () => {
    acceptedFiles.length = 0;
    acceptedFiles.splice(0, acceptedFiles.length);
    let deleteFiles = files.map(file => {
      if (file.id) return { id: file.id };
    });
    setFiles([]);
    setDeleteRecords([...deleteFiles]);
    inputRef.current.value = '';
  };

  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    if (fileRejections.length > 0) {
      let rejectedFile = fileRejections[0].file;
      if (rejectedFile.size > maxSize) setMaxFileExceeded(true);
    } else {
      setMaxFileExceeded(false);

      if (mode !== 'view') {
        acceptedFiles.forEach(file => {
          const reader = new FileReader();

          reader.onabort = () => {};

          reader.onerror = () => {};

          reader.onload = () => {
            const data = reader.result;
            onAddFile(file, data);
          };

          reader.readAsArrayBuffer(file);
        });
      }
    }
  }, []);

  const { acceptedFiles, getRootProps, getInputProps, isFocused, inputRef } = useDropzone({
    onDrop,
    maxSize,
    noDragEventsBubbling: true,
    noClick: mode === 'view',
    noDrag: mode === 'view',
    accept: {
      'image/jpeg': ['.jpeg', '.png'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.doc'],
      'application/msword': ['docx'],
    },
  });

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
    }),
    [isFocused]
  );

  // OnSave APIs
  const saveToDMSPayload = (fileName, metaFileID) => {
    let payload = {
      data: {
        fileName: fileName,
        metaFile: {
          id: metaFileID,
        },
        parent:
          parentID !== -1
            ? {
                id: parentID,
              }
            : undefined,
        relatedId: fetchedObj.id,
        relatedModel: modelKey,
      },
    };
    return payload;
  };

  const uploadFile = async file => {
    const response = await uploadAttachment(getUploadAttachmentUrl(), file);

    if (!response || !response.id) {
      alertHandler('Error', t('LBL_ERROR_UPLOADING_FILE'));
      return false;
    }

    let fileName = response.fileName;
    let metaFileID = response.id;
    const saveResponse = await api('POST', getModelUrl(MODELS.DMS_FILE), saveToDMSPayload(fileName, metaFileID));

    if (saveResponse.data.status !== 0) {
      alertHandler('Error', t('LBL_ERROR_UPLOADING_FILE'));
      return false;
    }

    return true;
  };

  const removeAll = async () => {
    const response = await api('POST', getRemoveAllUrl(MODELS.DMS_FILE), {
      records: deleteRecords,
    });

    if (response.data.status !== 0) {
      alertHandler('Error', t('LBL_ERROR_DELETING_FILE'));
      return false;
    }

    return true;
  };

  const uploadAll = async uploadedFiles => {
    for (let i in files) {
      let tempUpload = true;

      if (!files[i].isOld) {
        tempUpload = await uploadFile(files[i]);
        if (tempUpload) uploadedFiles.push(files[i].fileName);
      }
    }
  };

  const onSaveRelatedModel = async () => {
    let isRemoveSuccess = true;

    if (deleteRecords && deleteRecords.length > 0) {
      isRemoveSuccess = await removeAll();
    }

    let uploadedFiles = [];
    await uploadAll(uploadedFiles);
    if (isRemoveSuccess && uploadedFiles.length === files.filter(file => !file.isOld).length) onSaveSuccess();
    else onSaveError();
  };

  const onSaveSuccess = () => {
    if (typeof onSuccessFn === 'function') {
      return onSuccessFn();
    } else {
      alertHandler('Success', t(successMessage));
      setTimeout(() => {
        navigate(getFeaturePath(feature));
      }, [3000]);
    }
  };

  const onSaveError = () => {
    alertHandler('Error', t('LBL_ERROR_UPLOADING_FILE'));
    setTimeout(() => {
      navigate(getFeaturePath(feature, 'edit', navigationParams));
    }, [3000]);
  };

  return (
    <>
      {filesLoaded && (
        <>
          {mode !== 'view' && (
            <>
              <div className="card head-page">
                <div className="row">
                  <div className="col-md-12">
                    <label className="form-label" htmlFor="full-name">
                      {t('LBL_ATTACHMENTS')}
                      {isRequired && <span>*</span>}
                    </label>

                    <div style={attachmentContainerStyle}>
                      <div {...getRootProps({ style })}>
                        <input {...getInputProps()} />
                        {(!files || files.length === 0) && <>{t('ATTACHMENT.CLICK_HERE_OR_DROP')}</>}
                        <em>{t('LBL_ACCEPTED_FILES_FORMATS')}</em>
                        <>
                          {files && files.length > 0 && (
                            <aside style={thumbsContainer}>
                              {files.map(file => (
                                <div
                                  style={thumb}
                                  key={file.name}
                                  onClick={e => {
                                    e.stopPropagation();
                                  }}
                                >
                                  <FaFileAlt
                                    size={24}
                                    color="blue"
                                    onClick={e => {
                                      e.stopPropagation();
                                      onDownloadClick(file);
                                    }}
                                  />
                                  <Link
                                    title={file.fileName}
                                    style={{ marginTop: '10px' }}
                                    onClick={e => {
                                      e.stopPropagation();
                                      onDownloadClick(file);
                                    }}
                                  >
                                    {file.fileString}
                                  </Link>
                                  <Link
                                    style={removeOneStyle}
                                    onClick={e => {
                                      e.stopPropagation();
                                      onRemoveClick(file);
                                    }}
                                  >
                                    <span className="browse-button-text">
                                      <i className="fa fa-times"></i>
                                    </span>
                                  </Link>
                                </div>
                              ))}
                            </aside>
                          )}
                          {maxFileExceeded && <p className="color-text-red">{t('ATTACHMENT.FILE_EXCEEDS_LIMIT')}</p>}
                          {files && files.length > 0 && (
                            <Link
                              style={{ marginTop: '10px' }}
                              onClick={e => {
                                e.stopPropagation();
                                onRemoveAllClick();
                              }}
                            >
                              <img src={DeleteIconBtnHeader} alt="delete-icon" />
                            </Link>
                          )}
                        </>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <FormNotes
                      notes={[
                        {
                          title: 'LBL_MAX_SIZE_MESSAGE',
                          type: 2,
                        },
                      ]}
                    />{' '}
                  </div>
                </div>
              </div>
            </>
          )}
          {mode === 'view' && (
            <>
              <div className="card head-page">
                <div className="row">
                  <div className="col-md-12">
                    <label className="form-label" htmlFor="full-name">
                      {t('LBL_ATTACHMENTS')}
                    </label>
                    <div style={attachmentContainerStyle}>
                      <div style={style}>
                        {(!files || files.length === 0) && <>{t('ATTACHMENT.NO_AVAILABLE_FILES')}</>}
                        {files && files.length > 0 && (
                          <>
                            <aside style={thumbsContainer}>
                              {files.map(file => (
                                <div style={thumb} key={file.name}>
                                  <Link
                                    title={file.fileName}
                                    onClick={e => {
                                      e.stopPropagation();
                                      onDownloadClick(file);
                                    }}
                                  >
                                    {file.fileString}
                                  </Link>
                                </div>
                              ))}
                            </aside>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
      {!filesLoaded && <RectangleSkeleton height="180" />}
    </>
  );
};

export default AttachmentInput;
