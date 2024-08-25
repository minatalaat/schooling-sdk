import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaFileDownload, FaFileUpload } from 'react-icons/fa';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import moment from 'moment';

import { useAxiosFunction } from '../../hooks/useAxios';
import { getActionUrl, getModelUrl, getUploadUrl, getVerifyUrl } from '../../services/getUrl';
import { MODELS } from '../../constants/models';
import { useSelector } from 'react-redux';
import { checkFlashOrError } from '../../utils/helpers';
import { STOCK_COUNT_STATUS_REV_ENUM } from '../../constants/enums/StockCountEnum';
import { VALID_TEXT_WITH_SPECIAL_CHARS } from '../../constants/regex/Regex';
import DropDown from '../../components/ui/inputs/DropDown';

function ExportImport({
  isTabRequired,
  enableEdit,
  parentFormik,
  data,
  selectedStockLocation,
  alertHandler,
  finishedExportInventoryLines,
  finishedImportInventoryLines,
  fetchStockCount,
  setSelectedFormatSelect,
}) {
  const { t } = useTranslation();
  const { uploadDocument, downloadFile, api } = useAxiosFunction();
  const uploadInputRef = useRef();
  const [uploadedFile, setUploadedFile] = useState(null);

  let inventoryLines = useSelector(state => state.inventoryLines.inventoryLines);
  const company = useSelector(state => state.userFeatures.companyInfo.company);

  const fileFormatOptions = [
    {
      name: 'PDF',
      value: 'pdf',
    },
    {
      name: 'XLS',
      value: 'xlsx',
    },
    {
      name: 'CSV',
      value: 'csv',
    },
    {
      name: 'ODS',
      value: 'ods',
    },
  ];
  const initVals = {
    fileFormat: data?.formatSelect || '',
  };
  const valSchema = Yup.object({
    fileFormat: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).trim().required(t('REQUIRED')),
  });
  const formik = useFormik({
    initialValues: initVals,
    validationSchema: valSchema,
    validateOnMount: true,
  });

  const getExportFirstActionPayload = action => {
    let payload = {
      model: MODELS.INVENTORY,
      action: 'save,action-inventory-method-export-inventory',
      data: {
        criteria: [],
        context: {
          _model: MODELS.INVENTORY,
          _id: null,
          productFamily: null,
          formatSelect: formik.values.fileFormat.toString(),
          inventoryLineList: inventoryLines,
          plannedStartDateT: parentFormik ? parentFormik.plannedStartDate : '',
          stockLocation: data ? data.stockLocation : null,
          toRack: null,
          description: null,
          typeSelect: data ? data.typeSelect : null,
          // createdOn: '2023-07-30T08:00:25.974Z',
          productCategory: null,
          company: { code: 'TestCompiny113', name: 'TestCompiny113', id: 1 },
          id: data ? data.id : null,
          inventorySeq: data ? data.inventorySeq : null,
          plannedEndDateT: data ? data.plannedStartDateT : '',
          product: null,
          excludeOutOfStock: false,
          importFile: null,
          includeObsolete: false,
          version: data && data.version !== null ? data.version : null,
          fromRack: null,
          includeSubStockLocation: true,
          statusSelect: data ? data.statusSelect : null,
          validatedOn: null,
          validatedBy: null,
          completedBy: null,
        },
      },
    };
    return payload;
  };

  const getVerifyPayload = () => {
    let paylaod = { data: { id: data ? data.id : -1, version: data && data.version !== null ? data.version : null } };
    return paylaod;
  };

  const getSaveModelPayload = () => {
    let payload = {
      data: {
        id: data?.id || -1,
        version: data && data.version !== null ? data.version : null,
        formatSelect: formik.values.fileFormat,
        excludeOutOfStock: false,
        includeObsolete: false,
        typeSelect: parseInt(parentFormik.values.type),
        statusSelect: data?.statusSelect || null,
        includeSubStockLocation: true,
        stockLocation: selectedStockLocation,
        company: data?.company || null,
        plannedStartDateT: moment(parentFormik.values.plannedStartDate).locale('en').toISOString(),
        plannedEndDateT: moment(parentFormik.values.plannedEndDate).locale('en').toISOString(),
        description: parentFormik.values.desc,
        inventoryLineList: inventoryLines,
      },
    };
    return payload;
  };

  const getExportSecondActionPayload = (data, action) => {
    let payload = {
      model: MODELS.INVENTORY,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: MODELS.INVENTORY,
          _id: null,
          productFamily: null,
          formatSelect: data?.formatSelect || null,
          inventoryLineList: inventoryLines,
          plannedStartDateT: data?.plannedStartDateT || null,
          stockLocation: { name: 'External SL', id: 5 },
          toRack: null,
          description: null,
          typeSelect: data?.typeSelect || null,
          // createdOn: '2023-07-30T08:00:25.974Z',
          productCategory: null,
          company: data?.company || null,
          id: data?.id || null,
          inventorySeq: data?.inventorySeq || null,
          plannedEndDateT: data?.plannedEndDateT || null,
          product: null,
          excludeOutOfStock: false,
          importFile: null,
          includeObsolete: false,
          version: data && data.version !== null ? data.version : null,
          fromRack: null,
          includeSubStockLocation: true,
          statusSelect: data?.statusSelect || null,
          validatedOn: null,
          validatedBy: null,
          completedBy: null,
        },
      },
    };
    return payload;
  };

  const downloadExportedFile = getFileResponse => {
    if (
      !getFileResponse ||
      !getFileResponse.data ||
      getFileResponse.data.status !== 0 ||
      !getFileResponse.data.data ||
      !getFileResponse.data.data[0] ||
      !getFileResponse.data.data[0].view.views ||
      !getFileResponse.data.data[0].view.views[0] ||
      !getFileResponse.data.data[0].view.views[0].name
    ) {
      alertHandler('Error', t('LBL_FAILED_TO_DOWNLAOD'));
      return null;
    }

    const url =
      formik.values.fileFormat === 'csv'
        ? import.meta.env.VITE_BASE_URL + getFileResponse.data.data[0].view.views[0].name
        : import.meta.env.VITE_BASE_URL + getFileResponse.data.data[0].view.views[0].name + `&tenantId=${company.name}`;
    const fileName = `${getFileResponse.data.data[0].view.title}.${formik.values.fileFormat}`;

    downloadFile(
      url,
      fileName,
      () => {},
      () => {
        alertHandler('Error', t('LBL_FAILED_TO_DOWNLAOD'));
        return null;
      }
    );
  };

  const exportRecord = async () => {
    let action = 'save,action-inventory-method-export-inventory';
    const exportFirstActionResponse = await api('POST', getActionUrl(), getExportFirstActionPayload(action));
    if (exportFirstActionResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    let data = exportFirstActionResponse.data.data;
    if (data && checkFlashOrError(data)) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));

    let verifyResponse = await api('POST', getVerifyUrl(MODELS.INVENTORY), getVerifyPayload());
    if (verifyResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));

    let saveModelResponse = await api('POST', getModelUrl(MODELS.INVENTORY), getSaveModelPayload());
    if (saveModelResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    action = formik.values.fileFormat === 'csv' ? 'action-inventory-method-export-inventory' : 'action-inventory-method-show-inventory';
    let exportSecondActionResponse = await api(
      'POST',
      getActionUrl(),
      getExportSecondActionPayload(saveModelResponse.data.data[0], action)
    );
    if (exportSecondActionResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    data = exportSecondActionResponse.data.data;
    if (data && checkFlashOrError(data)) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    downloadExportedFile(exportSecondActionResponse);
    finishedExportInventoryLines('success', saveModelResponse.data.data[0]);
  };

  const getImportFirstActionPayload = (action, importFile) => {
    let payload = {
      model: MODELS.INVENTORY,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: MODELS.INVENTORY,
          _id: null,
          productFamily: null,
          formatSelect: formik.values.fileFormat,
          inventoryLineList: inventoryLines,
          plannedStartDateT: parentFormik.values.plannedStartDate,
          stockLocation: selectedStockLocation,
          toRack: null,
          description: null,
          typeSelect: parseInt(parentFormik.values.type),
          // createdOn: '2023-07-30T18:48:19.326Z',
          productCategory: null,
          company: data?.company || null,
          id: data?.id || null,
          inventorySeq: data?.inventorySeq || null,
          plannedEndDateT: parentFormik.values.plannedEndDate,
          product: null,
          excludeOutOfStock: false,
          importFile: importFile,
          includeObsolete: false,
          version: data && data.version !== null ? data.version : null,
          fromRack: null,
          includeSubStockLocation: true,
          statusSelect: data?.statusSelect || null,
          validatedOn: null,
          validatedBy: null,
          completedBy: null,
        },
      },
    };
    return payload;
  };

  const getImportSaveModelPayload = importFile => {
    let payload = {
      data: {
        id: data?.id || -1,
        version: data && data.version !== null ? data.version : null,
        formatSelect: formik.values.fileFormat,
        excludeOutOfStock: false,
        includeObsolete: false,
        typeSelect: parseInt(parentFormik.values.type),
        statusSelect: data?.statusSelect || null,
        includeSubStockLocation: true,
        stockLocation: selectedStockLocation,
        company: data?.company || null,
        plannedStartDateT: moment(parentFormik.values.plannedStartDate).locale('en').toISOString(),
        plannedEndDateT: moment(parentFormik.values.plannedEndDate).locale('en').toISOString(),
        description: parentFormik.values.desc,
        inventoryLineList: inventoryLines,
        importFile: importFile,
      },
    };
    return payload;
  };

  const importRecord = async () => {
    const uploadMetaFileResponse = await uploadDocument(getUploadUrl(MODELS.METAFILE), uploadedFile);
    let action = 'action-group-stock-inventory-importfile-click';
    const importFirstActionResponse = await api(
      'POST',
      getActionUrl(),
      getImportFirstActionPayload(action, uploadMetaFileResponse.data.data[0])
    );
    if (importFirstActionResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    if (importFirstActionResponse.data.data && checkFlashOrError(importFirstActionResponse.data.data))
      return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    if (uploadMetaFileResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    let verifyResponse = await api('POST', getVerifyUrl(MODELS.INVENTORY), getVerifyPayload());
    if (verifyResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    let saveModelResponse = await api(
      'POST',
      getModelUrl(MODELS.INVENTORY),
      getImportSaveModelPayload(uploadMetaFileResponse.data.data[0])
    );
    if (saveModelResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    fetchStockCount(saveModelResponse.data.data[0].id);
    action = 'action-group-stock-inventory-importfile-click[1]';
    const importSecondActionResponse = await api(
      'POST',
      getActionUrl(),
      getImportFirstActionPayload(action, uploadMetaFileResponse.data.data[0])
    );
    if (importSecondActionResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    finishedImportInventoryLines('success', saveModelResponse.data.data[0]);
  };

  useEffect(() => {
    setSelectedFormatSelect(formik.values.fileFormat);
  }, [formik.values.fileFormat]);

  useEffect(() => {
    if (uploadedFile) importRecord();
  }, [uploadedFile]);
  return (
    <div className="row d-contents">
      <div className="col-md-6 section-title mt-4">
        <h4>
          {t('LBL_EXPORT_IMPORT')}
          {isTabRequired && <span>*</span>}
        </h4>
      </div>
      <div className="row">
        <div className="col-md-6">
          <DropDown
            options={fileFormatOptions}
            formik={formik}
            label="LBL_FILE_FORMAT"
            accessor="fileFormat"
            // translate={unitTypeSelect.mode === 'enum'}
            keys={{ valueKey: 'value', titleKey: 'name' }}
            mode="add"
            isRequired={true}
            disabled={false}
          />{' '}
        </div>
        {formik.isValid && (
          <div className="col-md-3">
            <div
              className=" btn export-button clickable"
              style={{
                marginTop: '40px',
              }}
            >
              <FaFileDownload className="template-download" size={35} color="#214FDE" onClick={exportRecord} />
              <label className="form-label template-download-label">
                <strong> {t('LBL_EXPORT_INVENTORY_LINES')}</strong>
              </label>{' '}
            </div>
          </div>
        )}
        {enableEdit && data && data.statusSelect === STOCK_COUNT_STATUS_REV_ENUM['LBL_IN_PROGRESS'] && (
          <div className="col-md-3">
            <div
              className=" btn export-button clickable"
              style={{
                marginTop: '40px',
              }}
            >
              <FaFileUpload
                className="template-download"
                size={35}
                color="#214FDE"
                onClick={() => {
                  uploadInputRef.current.click();
                }}
              />
              <label className="form-label template-download-label">
                <strong> {t('LBL_IMPORT_INVENTORY_LINES')}</strong>
              </label>{' '}
            </div>
            <input
              ref={uploadInputRef}
              type="file"
              style={{ display: 'none' }}
              accept=".csv"
              onChange={event => {
                if (event.currentTarget.files[0]) {
                  setUploadedFile(event.currentTarget.files[0]);
                  event.currentTarget.value = '';
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ExportImport;
