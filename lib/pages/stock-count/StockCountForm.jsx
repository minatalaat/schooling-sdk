import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';

import SearchModalAxelor from '../../components/ui/inputs/SearchModal/SearchModalAxelor';
import InventoryLines from './InventoryLines';
import DateTimeInput from '../../components/ui/inputs/DateTimeInput';
import ExportImport from './ExportImport';
import TextInput from '../../components/ui/inputs/TextInput';
import Tabs from '../../components/ui/inputs/Tabs';
import AttachmentInput from '../../components/ui/inputs/AttachmentInput';
import DropDown from '../../components/ui/inputs/DropDown';

import { checkFlashOrError } from '../../utils/helpers';
import { STOCK_COUNT_STATUS_REV_ENUM, STOCK_COUNT_TYPE_ENUM } from '../../constants/enums/StockCountEnum';
import { MODELS } from '../../constants/models';
import { useAxiosFunction } from '../../hooks/useAxios';
import { getVerifyUrl, getActionUrl, getModelUrl, getRemoveAllUrl, getFetchUrl, getSearchUrl } from '../../services/getUrl';
import { useTabs } from '../../hooks/useTabs';
import { STOCK_COUNT_FETCH_FIELDS, STOCK_COUNT_LINES_SEARCH_FIELDS } from './StockCountPayloadsFields';
import { inventoryLinesActions } from '../../store/inventoryLines';
import { useFormikSubmit } from '../../hooks/useFormikSubmit';
import FormNotes from '../../components/ui/FormNotes';

const StockCountForm = ({
  data,
  addNew,
  enableEdit,
  isSave,
  isPlan,
  isDelete,
  isFillInventory,
  isStart,
  isComplete,
  isValidate,
  isCancel,
  finishedSaveHandler,
  alertHandler,
  setActionInProgress,
  finishedPlanHandler,
  finishedDeleteHandler,
  finishedExportInventoryLines,
  finishedImportInventoryLines,
  finishedFillInventoryHandler,
  finishedStartInventoryCountHandler,
  fetchStockCount,
  finishedCompleteHandler,
  finishedValidateHandler,
  finishedCancelHandler,
}) => {
  const subFeature = 'STOCK_COUNT';
  const { api } = useAxiosFunction();
  const { t } = useTranslation();
  const tabsProps = useTabs();
  const dispatch = useDispatch();
  const inventoryLines = useSelector(state => state.inventoryLines.inventoryLines);
  const [selectedFormatSelect, setSelectedFormatSelect] = useState(null);
  const [parentSaveDone, setParentSaveDone] = useState(false);
  const [fetchedObject, setFetchedObject] = useState(false);
  const [onSuccessFn, setOnSuccessFn] = useState();
  const [displayedTypes, setDisplayedTypes] = useState(null);

  const initialValues = {
    seq: data ? (data.inventorySeq ? data.inventorySeq : '') : '',
    stockLocation: data?.stockLocation ?? null,
    company: data?.company ?? null,
    plannedStartDate: data ? moment(new Date(data.plannedStartDateT)).locale('en').format('YYYY-MM-DDThh:mm') : '',
    plannedEndDate: data ? moment(new Date(data.plannedEndDateT)).locale('en').format('YYYY-MM-DDThh:mm') : '',
    type: data ? (data.typeSelect ? data.typeSelect : '') : '',
    mode: '2',
    desc: data ? (data.description ? data.description : '') : '',
  };

  const validationSchema = Yup.object({
    stockLocation: Yup.object().nullable().required(t('REQUIRED')),
    company: Yup.object().nullable().required(t('REQUIRED')),
    plannedStartDate: Yup.date().required(t('REQUIRED')),
    plannedEndDate: Yup.date().required(t('REQUIRED')).min(Yup.ref('plannedStartDate'), t('REPORT_TO_DATE_VALIDATION_MESSAGE_2')),
    type: Yup.string()
      .trim()
      .required(`* ${t('REQUIRED')}`),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: addNew ? true : false,
  });

  const { validateFormForSubmit } = useFormikSubmit(formik, alertHandler);

  useEffect(() => {
    if (isSave) {
      saveRecord();
    }

    if (isDelete) {
      deleteRecord();
    }

    if (isPlan) {
      planRecord();
    }

    if (isFillInventory) {
      fillInventory(data);
    }

    if (isStart) {
      startRecord();
    }

    if (isComplete) {
      completeRecord();
    }

    if (isValidate) {
      validateRecord();
    }

    if (isCancel) {
      cancelRecord();
    }
  }, [isSave, isDelete, addNew, enableEdit, isPlan, isFillInventory, isStart, isComplete, isValidate, isCancel]);

  useEffect(() => {
    tabsProps.setShowTabsContent(true);
  }, []);
  useEffect(() => {
    let tempTypes = [];
    Object.keys(STOCK_COUNT_TYPE_ENUM).forEach(item => {
      tempTypes.push({
        name: t(STOCK_COUNT_TYPE_ENUM[item]),
        value: item,
      });
    });
    setDisplayedTypes(tempTypes);
  }, [STOCK_COUNT_TYPE_ENUM]);

  const getSaveModelPayload = () => {
    let payload = null;

    if (addNew) {
      payload = {
        data: {
          excludeOutOfStock: false,
          includeObsolete: false,
          typeSelect: parseInt(formik.values.type),
          statusSelect: 1,
          includeSubStockLocation: true,
          formatSelect: 'csv',
          stockLocation: formik.values.stockLocation,
          company: formik.values.company,
          plannedStartDateT: moment(formik.values.plannedStartDate).locale('en').toISOString(),
          plannedEndDateT: moment(formik.values.plannedEndDate).locale('en').toISOString(),
          inventoryLineList: inventoryLines,
          _original: {},
          id: null,
        },
      };
    } else {
      payload = {
        data: {
          excludeOutOfStock: false,
          includeObsolete: false,
          typeSelect: parseInt(formik.values.type),
          statusSelect: data ? (data.statusSelect ? data.statusSelect : null) : null,
          includeSubStockLocation: true,
          formatSelect: selectedFormatSelect ? selectedFormatSelect : data ? (data.formatSelect ? data.formatSelect : null) : null,
          stockLocation: formik.values.stockLocation,
          company: formik.values.company,
          plannedStartDateT: moment(formik.values.plannedStartDate).locale('en').toISOString(),
          plannedEndDateT: moment(formik.values.plannedEndDate).locale('en').toISOString(),
          _original: data,
          id: data ? data.id : null,
          inventoryLineList: inventoryLines,
          version: data ? (data.version !== null ? data.version : null) : null,
        },
      };
    }

    return payload;
  };

  const saveRecord = async () => {
    const isValid = await validateFormForSubmit();
    if (!isValid) return null;

    setActionInProgress(true);
    let saveActionResponse = await api('POST', getModelUrl(MODELS.INVENTORY), getSaveModelSecondPayload());
    if (saveActionResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    let data = saveActionResponse.data.data[0];
    if (data && checkFlashOrError(data)) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));

    setParentSaveDone(true);
    setFetchedObject(data);
    setOnSuccessFn('save');
  };

  const getPlanFirstActionPayload = action => {
    let payload = {
      model: MODELS.INVENTORY,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: MODELS.INVENTORY,
          _id: null,
          productFamily: null,

          formatSelect: selectedFormatSelect ? selectedFormatSelect : data ? (data.formatSelect ? data.formatSelect : null) : null,
          inventoryLineList: inventoryLines,
          plannedStartDateT: moment(formik.values.plannedStartDate).locale('en').toISOString(),
          stockLocation: formik.values.stockLocation,
          toRack: null,
          description: formik.values.desc,
          typeSelect: parseInt(formik.values.type),
          // createdOn: '2023-07-27T13:38:24.958Z',
          productCategory: null,
          company: formik.values.company,
          id: data ? data.id : -1,
          inventorySeq: data ? data.inventorySeq : null,
          plannedEndDateT: moment(formik.values.plannedEndDate).locale('en').toISOString(),
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

  const getPlanVerifyPayload = () => {
    let paylaod = { data: { id: data ? data.id : -1, version: data && data.version !== null ? data.version : null } };
    return paylaod;
  };

  const getPlanSecondActionPayload = action => {
    let payload = {
      model: MODELS.INVENTORY,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: MODELS.INVENTORY,
          _id: null,
          productFamily: null,
          formatSelect: selectedFormatSelect ? selectedFormatSelect : data ? (data.formatSelect ? data.formatSelect : null) : null,
          inventoryLineList: inventoryLines,
          plannedStartDateT: moment(formik.values.plannedStartDate).locale('en').toISOString(),
          stockLocation: formik.values.stockLocation,
          toRack: null,
          description: formik.values.desc,
          typeSelect: parseInt(formik.values.type),
          // createdOn: '2023-07-27T13:38:24.958Z',
          productCategory: null,
          company: formik.values.company,
          id: data ? data.id : -1,
          inventorySeq: data?.inventorySeq || null,
          plannedEndDateT: moment(formik.values.plannedEndDate).locale('en').toISOString(),
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

  // const getPlanThirdActionPayload = action => {
  //   let payload = {
  //     model: MODELS.INVENTORY,
  //     action: action,
  //     data: {
  //       criteria: [],
  //       context: {
  //         _model: MODELS.INVENTORY,
  //         _id: data ? data.id : null,
  //         productFamily: null,
  //         formatSelect: selectedFormatSelect ? selectedFormatSelect : data ? (data.formatSelect ? data.formatSelect : null) : null,
  //         inventoryLineList: inventoryLines,
  //         plannedStartDateT: moment(formik.values.plannedStartDate).locale('en').toISOString(),
  //         stockLocation: { name: 'Internal SL', id: 4 },
  //         toRack: null,
  //         description: formik.values.desc,
  //         typeSelect: parseInt(formik.values.type),
  //         // createdOn: '2023-07-27T13:38:24.958Z',
  //         productCategory: null,
  //         company: formik.values.company,
  //         id: data ? data.id : -1,
  //         inventorySeq: data ? data.inventorySeq : null,
  //         plannedEndDateT: moment(formik.values.plannedEndDate).locale('en').toISOString(),
  //         product: null,
  //         excludeOutOfStock: false,
  //         importFile: null,
  //         includeObsolete: false,
  //         version: data && data.version !== null ? data.version : null,
  //         fromRack: null,
  //         includeSubStockLocation: true,
  //         statusSelect: data ? data.statusSelect : null,
  //         validatedOn: null,
  //         validatedBy: null,
  //         completedBy: null,
  //         wkfStatus: null,
  //       },
  //     },
  //   };

  //   return payload;
  // };

  const getPlanSaveModelPayload = (data, seq) => {
    let payload = {
      data: {
        id: data?.id || -1,
        version: data && data.version !== null ? data.version : null,
        inventorySeq: seq,
        excludeOutOfStock: false,
        includeObsolete: false,
        typeSelect: parseInt(formik.values.type),
        statusSelect: data ? (data.statusSelect ? data.statusSelect : null) : null,
        includeSubStockLocation: true,
        formatSelect: selectedFormatSelect ? selectedFormatSelect : data ? (data.formatSelect ? data.formatSelect : null) : null,
        stockLocation: formik.values.stockLocation,
        company: formik.values.company,
        plannedStartDateT: moment(formik.values.plannedStartDate).locale('en').toISOString(),
        plannedEndDateT: moment(formik.values.plannedEndDate).locale('en').toISOString(),
        _original: data,
        inventoryLineList: inventoryLines,
      },
    };
    return payload;
  };

  const getRecordId = () => {
    return data?.id || -1;
  };

  const planRecord = async () => {
    const isValid = await validateFormForSubmit();
    if (!isValid) return null;

    if (inventoryLines && inventoryLines.length > 0) {
      setActionInProgress(true);
      let action = 'action-group-stock-inventory-plan-click';
      let planFirstActionResponse = await api('POST', getActionUrl(), getPlanFirstActionPayload(action));
      if (planFirstActionResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      let data = planFirstActionResponse.data.data;
      if (data && checkFlashOrError(data)) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));

      let verifyResponse = await api('POST', getVerifyUrl(MODELS.INVENTORY), getPlanVerifyPayload());
      if (verifyResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));

      action = 'action-group-stock-inventory-plan-click[1]';
      let planSecondActionResponse = await api('POST', getActionUrl(), getPlanSecondActionPayload(action));
      if (planSecondActionResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      data = planSecondActionResponse.data.data;
      if (data && checkFlashOrError(data)) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      let fetchLineResponse = await api('POST', getFetchUrl(MODELS.INVENTORY, getRecordId()), {
        fields: STOCK_COUNT_FETCH_FIELDS,
        related: {},
      });
      if (fetchLineResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      data = fetchLineResponse.data.data[0];

      let saveModelResponse = await api(
        'POST',
        getModelUrl(MODELS.INVENTORY),
        getPlanSaveModelPayload(fetchLineResponse.data.data[0], data?.inventorySeq)
      );
      if (saveModelResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      setParentSaveDone(true);
      setOnSuccessFn('plan');
    } else {
      alertHandler('Error', t('INVALID_FORM'));
    }
  };

  const deleteRecord = () => {
    setActionInProgress(true);
    const payload = {
      records: [{ id: data.id }],
    };
    api('POST', getRemoveAllUrl(MODELS.INVENTORY), payload, () => {
      finishedDeleteHandler('success');
    });
  };

  const fillInventoryFirstActionPayload = action => {
    let payload = {
      model: MODELS.INVENTORY,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: MODELS.INVENTORY,
          _id: null,
          productFamily: null,
          formatSelect: selectedFormatSelect ? selectedFormatSelect : data ? (data.formatSelect ? data.formatSelect : null) : null,
          inventoryLineList: data?.inventoryLineList,
          plannedStartDateT: moment(formik.values.plannedStartDate).locale('en').toISOString(),
          stockLocation: { name: 'Internal SL', id: 4 },
          toRack: null,
          description: formik.values.desc,
          typeSelect: parseInt(formik.values.type),
          // createdOn: '2023-07-27T07:00:55.331Z',
          productCategory: null,
          company: formik.values.company,
          id: data?.id || null,
          inventorySeq: data?.inventorySeq || null,
          plannedEndDateT: moment(formik.values.plannedEndDate).locale('en').toISOString(),
          product: null,
          excludeOutOfStock: false,
          importFile: null,
          includeObsolete: false,
          version: data?.version || null,
          fromRack: null,
          includeSubStockLocation: true,
          statusSelect: data?.statusSelect || null,
        },
      },
    };
    return payload;
  };

  const getSaveModelSecondPayload = () => {
    let payload = null;

    if (data && data.id) {
      payload = {
        data: {
          id: data?.id || null,
          version: data?.version || null,
          stockLocation: formik.values.stockLocation,
          excludeOutOfStock: false,
          includeObsolete: false,
          typeSelect: parseInt(formik.values.type),
          statusSelect: data?.statusSelect || null,
          includeSubStockLocation: true,
          formatSelect: selectedFormatSelect ? selectedFormatSelect : data ? (data.formatSelect ? data.formatSelect : null) : null,
          company: formik.values.company,
          plannedStartDateT: moment(formik.values.plannedStartDate).locale('en').toISOString(),
          plannedEndDateT: moment(formik.values.plannedEndDate).locale('en').toISOString(),
          inventoryLineList: inventoryLines,
          description: formik.values.desc,
          _original: {
            productFamily: null,
            formatSelect: selectedFormatSelect ? selectedFormatSelect : data ? (data.formatSelect ? data.formatSelect : null) : null,
            inventoryLineList: data.inventoryLineList,
            plannedStartDateT: formik.values.plannedStartDate,
            stockLocation: data?.stockLocation || null,
            toRack: null,
            description: formik.values.desc,
            typeSelect: parseInt(formik.values.type),
            // createdOn: '2023-07-27T07:07:26.411Z',
            productCategory: null,
            company: formik.values.company,
            id: data?.id || null,
            inventorySeq: data?.inventorySeq || null,
            plannedEndDateT: formik.values.plannedEndDate,
            product: null,
            excludeOutOfStock: false,
            importFile: null,
            includeObsolete: false,
            version: data?.version || null,
            fromRack: null,
            includeSubStockLocation: true,
            statusSelect: data?.statusSelect || null,
            validatedOn: null,
            validatedBy: null,
            completedBy: null,
          },
        },
      };
    } else {
      payload = getSaveModelPayload();
    }

    return payload;
  };

  const fillInventorySecondActionPayload = (action, data) => {
    let payload = {
      model: MODELS.INVENTORY,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: MODELS.INVENTORY,
          _id: data?.id || null,
          productFamily: null,
          formatSelect: selectedFormatSelect ? selectedFormatSelect : data ? (data.formatSelect ? data.formatSelect : null) : null,
          inventoryLineList: data?.inventoryLineList || null,
          plannedStartDateT: moment(formik.values.plannedStartDate).locale('en').toISOString(),
          stockLocation: formik.values.stockLocation,
          toRack: null,
          description: formik.values.desc,
          typeSelect: parseInt(formik.values.type),
          // createdOn: '2023-07-27T07:00:55.331Z',
          productCategory: null,
          company: formik.values.company,
          id: data ? data.id : null,
          inventorySeq: data ? data.inventorySeq : null,
          plannedEndDateT: moment(formik.values.plannedEndDate).locale('en').toISOString(),
          product: null,
          excludeOutOfStock: false,
          importFile: null,
          includeObsolete: false,
          version: data?.version || null,
          fromRack: null,
          includeSubStockLocation: true,
          statusSelect: data ? data.statusSelect : null,
          validatedOn: null,
          validatedBy: null,
          completedBy: null,
          wkfStatus: null,
          _viewType: 'form',
          _viewName: 'inventory-form',
          _views: [
            { type: 'grid', name: 'inventory-grid' },
            { type: 'calendar', name: 'inventory-calendar' },
            { type: 'form', name: 'inventory-form' },
          ],
          _signal: 'fillInventoryBtn',
          _source: 'fillInventoryBtn',
        },
      },
    };
    return payload;
  };

  const getInventoryLinesPayload = data => {
    let fetchLineArray = [];

    if (data) {
      data.forEach(item => {
        fetchLineArray.push(item.id);
      });
    }

    if (fetchLineArray && fetchLineArray.length > 0) {
      let payload = {
        fields: STOCK_COUNT_LINES_SEARCH_FIELDS,
        sortBy: ['product.code'],
        data: {
          _domain: 'self.id in (:_field_ids)',
          _domainContext: {
            _field_ids: fetchLineArray,
          },
          _archived: true,
        },
        limit: -1,
        offset: 0,
        translate: true,
      };
      return payload;
    } else {
      return null;
    }
  };

  const fillInventory = async tempData => {
    const isValid = await validateFormForSubmit();
    if (!isValid) return null;

    if (formik.values.stockLocation === null) {
      return alertHandler('Error', t('LBL_CHOOSE_STOCK_LOCATION_FIRST'));
    }

    if (!tempData || formik.values.stockLocation?.name !== tempData.stockLocation.name || inventoryLines.length === 0) {
      setActionInProgress(true);
      let action = 'action-group-stock-inventory-fillinventoryBtn-click';
      let fillInventoryFirstActionResponse = await api('POST', getActionUrl(), fillInventoryFirstActionPayload(action));
      if (fillInventoryFirstActionResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      let saveActionResponse = await api(
        'POST',
        getModelUrl(MODELS.INVENTORY),
        tempData ? getSaveModelSecondPayload() : getSaveModelPayload()
      );
      if (saveActionResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      finishedFillInventoryHandler('success', saveActionResponse.data.data[0], false);
      let data = saveActionResponse.data.data[0];
      let fetchLineResponse = await api('POST', getFetchUrl(MODELS.INVENTORY, data?.id), {
        fields: STOCK_COUNT_FETCH_FIELDS,
        related: {},
      });
      if (fetchLineResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      data = fetchLineResponse.data.data[0];
      action = 'action-group-stock-inventory-fillinventoryBtn-click[1]';
      let fillInventorySecondActionResponse = await api('POST', getActionUrl(), fillInventorySecondActionPayload(action, data));

      if (fillInventorySecondActionResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      if (
        fillInventorySecondActionResponse &&
        fillInventorySecondActionResponse.data.data[0].notify &&
        fillInventorySecondActionResponse.data.data[0].notify === 'No inventory lines has been created.'
      )
        return alertHandler('Error', t('LBL_NO_INVENTORY_LINES_TO_LOAD'));

      fetchLineResponse = await api('POST', getFetchUrl(MODELS.INVENTORY, saveActionResponse.data.data[0].id), {
        fields: STOCK_COUNT_FETCH_FIELDS,
        related: {},
      });
      if (fetchLineResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      data = fetchLineResponse.data.data[0];

      if (data && data.inventoryLineList.length > 0) {
        let searchResponse = await api(
          'POST',
          getSearchUrl(MODELS.INVENTORY_LINE),
          getInventoryLinesPayload(data?.inventoryLineList || null)
        );

        if (searchResponse.data.status !== 0) {
          dispatch(inventoryLinesActions.resetInventoryLines());
          finishedFillInventoryHandler('Error');
          return alertHandler('Error', t('LBL_NO_INVENTORY_LINES_TO_LOAD'));
        }

        data = searchResponse.data.data;
        alertHandler('Success', t('LBL_INVENTORY_LINES_LOADED_SUCCESSFULLY'));
        let tempInventoryLines = [];

        if (data) {
          data.forEach(item => {
            tempInventoryLines.push({
              ...item,
              lineId: Math.floor(Math.random() * 100).toString(),
            });
          });
        }

        dispatch(inventoryLinesActions.setLines({ inventoryLines: tempInventoryLines }));
        finishedFillInventoryHandler('');
        setParentSaveDone(true);
        //   setTempData(saveActionResponse.data.data[0]);
        // setOnSuccessFn('fillInventory');
      }

      if (data && checkFlashOrError(data)) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    } else {
      return alertHandler('Error', t('LBL_NO_INVENTORY_LINES_TO_LOAD'));
    }
  };

  const getStartFirstActionPayload = action => {
    let payload = {
      model: MODELS.INVENTORY,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: MODELS.INVENTORY,
          _id: null,
          productFamily: null,
          formatSelect: selectedFormatSelect ? selectedFormatSelect : data ? (data.formatSelect ? data.formatSelect : null) : null,
          inventoryLineList: inventoryLines,
          plannedStartDateT: moment(formik.values.plannedStartDate).locale('en').toISOString(),
          stockLocation: data?.stockLocation || null,
          toRack: null,
          description: formik.values.desc,
          typeSelect: parseInt(formik.values.type),
          // createdOn: '2023-07-27T13:38:24.958Z',
          productCategory: null,
          company: data?.company || null,
          id: data?.id || null,
          inventorySeq: data?.inventorySeq || null,
          plannedEndDateT: moment(formik.values.plannedEndDate).locale('en').toISOString(),
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

  const getStartSaveModelPayload = () => {
    let payload = {
      data: {
        excludeOutOfStock: false,
        includeObsolete: false,
        typeSelect: parseInt(formik.values.type),
        statusSelect: data ? (data.statusSelect ? data.statusSelect : null) : null,
        includeSubStockLocation: true,
        formatSelect: selectedFormatSelect ? selectedFormatSelect : data ? (data.formatSelect ? data.formatSelect : null) : null,
        stockLocation: formik.values.stockLocation,
        company: formik.values.company,
        plannedStartDateT: moment(formik.values.plannedStartDate).locale('en').toISOString(),
        plannedEndDateT: moment(formik.values.plannedEndDate).locale('en').toISOString(),
        _original: data,
        id: data ? data.id : null,
        inventoryLineList: inventoryLines,
        version: data ? (data.version !== null ? data.version : null) : null,
      },
    };
    return payload;
  };

  const getStartSecondActionPayload = (action, data) => {
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
          plannedStartDateT: moment(formik.values.plannedStartDate).locale('en').toISOString(),
          stockLocation: data?.stockLocation || null,
          toRack: null,
          description: formik.values.desc,
          typeSelect: data?.typeSelect || null,
          // createdOn: '2023-07-30T08:23:10.360Z',
          productCategory: null,
          company: data?.company || null,
          id: data?.id || null,
          inventorySeq: data?.inventorySeq || null,
          plannedEndDateT: moment(formik.values.plannedEndDate).locale('en').toISOString(),
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
          wkfStatus: null,
        },
      },
    };
    return payload;
  };

  const getStartThirdActionPayload = (action, data) => {
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
          plannedStartDateT: moment(formik.values.plannedStartDate).locale('en').toISOString(),
          stockLocation: data?.stockLocation || null,
          toRack: null,
          description: formik.values.desc,
          typeSelect: data?.typeSelect || null,
          // createdOn: '2023-07-30T08:23:10.360Z',
          productCategory: null,
          company: data?.company || null,
          id: data?.id || null,
          inventorySeq: data?.inventorySeq || null,
          plannedEndDateT: moment(formik.values.plannedEndDate).locale('en').toISOString(),
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

  const startRecord = async () => {
    setActionInProgress(true);
    let action = 'action-group-stock-inventory-start-click';
    let startFirstActionResponse = await api('POST', getActionUrl(), getStartFirstActionPayload(action));
    if (startFirstActionResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    if (startFirstActionResponse.data.data && checkFlashOrError(startFirstActionResponse.data.data))
      return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    let verifyResponse = await api('POST', getVerifyUrl(MODELS.INVENTORY), getPlanVerifyPayload());
    if (verifyResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    let saveModelResponse = await api('POST', getModelUrl(MODELS.INVENTORY), getStartSaveModelPayload());
    if (saveModelResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    let fetchedData = await fetchStockCount(saveModelResponse.data.data[0].id);
    action = 'action-group-stock-inventory-start-click[1]';
    let startSecondActionResponse = await api('POST', getActionUrl(), getStartSecondActionPayload(action, fetchedData));
    if (startSecondActionResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    if (startSecondActionResponse.data.data && checkFlashOrError(startSecondActionResponse.data.data))
      return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    fetchedData = await fetchStockCount(saveModelResponse.data.data[0].id);
    action = 'action-group-stock-inventory-start-click[3]';
    let startThirdActionResponse = await api('POST', getActionUrl(), getStartThirdActionPayload(action, fetchedData));
    if (startThirdActionResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    if (startThirdActionResponse.data.data && checkFlashOrError(startThirdActionResponse.data.data))
      return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    setParentSaveDone(true);
    setOnSuccessFn('startCount');
  };

  const getCompleteFirstActionPayload = (action, data) => {
    let payload = {
      model: MODELS.INVENTORY,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: MODELS.INVENTORY,
          _id: null,
          productFamily: null,
          formatSelect: selectedFormatSelect ? selectedFormatSelect : 'csv',
          inventoryLineList: inventoryLines,
          plannedStartDateT: moment(formik.values.plannedStartDate).locale('en').toISOString(),
          stockLocation: data?.stockLocation || null,
          toRack: null,
          description: formik.values.desc,
          typeSelect: parseInt(formik.values.type),
          // createdOn: '2023-07-27T13:38:24.958Z',
          productCategory: null,
          company: data?.company || null,
          id: data?.id || null,
          inventorySeq: data?.inventorySeq || null,
          plannedEndDateT: moment(formik.values.plannedEndDate).locale('en').toISOString(),
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

  const completeRecord = async () => {
    const completeWitoutError = async () => {
      setActionInProgress(true);
      let action = 'action-group-stock-inventory-complete-click';
      let completeFirstActionResponse = await api('POST', getActionUrl(), getCompleteFirstActionPayload(action));
      if (completeFirstActionResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      if (completeFirstActionResponse.data.data && checkFlashOrError(completeFirstActionResponse.data.data))
        return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      let verifyResponse = await api('POST', getVerifyUrl(MODELS.INVENTORY), getPlanVerifyPayload());
      if (verifyResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      let saveActionResponse = await api('POST', getModelUrl(MODELS.INVENTORY), getSaveModelSecondPayload());
      if (saveActionResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      let data = saveActionResponse.data.data[0];
      if (data && checkFlashOrError(data)) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      let fetchedData = await fetchStockCount(saveActionResponse.data.data[0].id);
      action = 'action-group-stock-inventory-complete-click[1]';
      let completeSeconfActionResponse = await api('POST', getActionUrl(), getCompleteFirstActionPayload(action, fetchedData));
      if (completeSeconfActionResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      if (completeSeconfActionResponse.data.data && checkFlashOrError(completeSeconfActionResponse.data.data))
        return alertHandler('Error', t('PLEASE_FILL_ALL_INVENTORY_LINES'));
      setParentSaveDone(true);
      setOnSuccessFn(() => finishedCompleteHandler('success'));
    };

    if (!inventoryLines?.length > 0) return alertHandler('Error', t('NO_INVENTORY_LINES'));

    let wrongGapValueLines = [];
    inventoryLines.forEach((line, index) => {
      if (
        line?.['product.costTypeSelect'] === 5 &&
        Number(line?.realQty || -1) > Number(line?.currentQty || 0.0) &&
        Number(line?.realValue) === -1
      ) {
        wrongGapValueLines.push(index + 1);
      }
    });

    if (wrongGapValueLines && wrongGapValueLines.length === 0) return completeWitoutError();
    return alertHandler('Error', t('MISS_GAP_VALUES') + ' ' + wrongGapValueLines.join(', '));
  };

  const getValidateFirstActionPayload = action => {
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
          inventoryLineList: data?.inventoryLineList || [],
          plannedStartDateT: data?.plannedStartDateT || null,
          stockLocation: data?.stockLocation || null,
          toRack: null,
          description: '',
          typeSelect: data?.typeSelect || null,
          createdOn: data?.createdOn || null,
          productCategory: null,
          company: data?.co9mpany || null,
          id: data?.id || null,
          inventorySeq: data?.inventorySeq || null,
          plannedEndDateT: data?.plannedEndDateT || null,
          product: null,
          excludeOutOfStock: false,
          importFile: data?.importFile || null,
          includeObsolete: false,
          version: data?.version || null,
          fromRack: null,
          includeSubStockLocation: true,
          statusSelect: data?.statusSelect || null,
          validatedOn: null,
          validatedBy: null,
          completedBy: data?.completedBy || null,
        },
      },
    };
    return payload;
  };

  const validateRecord = async () => {
    setActionInProgress(true);
    let action = 'action-group-stock-inventory-validate-click';
    let validateFirstActionResponse = await api('POST', getActionUrl(), getValidateFirstActionPayload(action));
    if (validateFirstActionResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    if (validateFirstActionResponse.data.data && checkFlashOrError(validateFirstActionResponse.data.data))
      return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    let verifyResponse = await api('POST', getVerifyUrl(MODELS.INVENTORY), getPlanVerifyPayload());
    if (verifyResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    let saveActionResponse = await api('POST', getModelUrl(MODELS.INVENTORY), getSaveModelSecondPayload());
    if (saveActionResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    let data = saveActionResponse.data.data[0];
    await fetchStockCount(saveActionResponse.data.data[0].id);
    if (data && checkFlashOrError(data)) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    action = 'action-group-stock-inventory-validate-click[1]';
    let validateSecondActionResponse = await api('POST', getActionUrl(), getValidateFirstActionPayload(action));
    if (validateSecondActionResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));

    if (
      validateSecondActionResponse.data.data &&
      checkFlashOrError(validateSecondActionResponse.data.data) &&
      validateSecondActionResponse.data.data[0]?.error === 'There is more than one line for same product with same tracking number.'
    ) {
      return alertHandler('Error', t('SAME_PRODUCT_MULTI_LINES'));
    }

    if (validateSecondActionResponse.data.data && checkFlashOrError(validateSecondActionResponse.data.data))
      return alertHandler('Error', t('PLEASE_FILL_ALL_INVENTORY_LINES'));
    finishedValidateHandler('success');
  };

  const cancelRecord = async () => {
    setActionInProgress(true);
    let action = 'action-group-stock-inventory-cancel-click';
    let cancelFirstActionResponse = await api('POST', getActionUrl(), getValidateFirstActionPayload(action));
    if (cancelFirstActionResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    if (cancelFirstActionResponse.data.data && checkFlashOrError(cancelFirstActionResponse.data.data))
      return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    let verifyResponse = await api('POST', getVerifyUrl(MODELS.INVENTORY), getPlanVerifyPayload());
    if (verifyResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    action = 'action-group-stock-inventory-cancel-click[1]';
    let cancelSecondActionResponse = await api('POST', getActionUrl(), getValidateFirstActionPayload(action));
    if (cancelSecondActionResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    if (cancelSecondActionResponse.data.data && checkFlashOrError(cancelSecondActionResponse.data.data))
      return alertHandler('Error', t('PLEASE_FILL_ALL_INVENTORY_LINES'));
    finishedCancelHandler('success');
  };

  return (
    <>
      <div className="card">
        <div className="row">
          {formik.values.seq !== '' && (
            <div className="col-md-6">
              <TextInput formik={formik} label="LBL_INVENTORY_SEQ" accessor="seq" mode="view" disabled={true} />
            </div>
          )}
          <div className="col-md-6">
            <SearchModalAxelor formik={formik} modelKey="COMPANIES" mode="add" disabled={true} defaultValueConfig={true} />
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <SearchModalAxelor
              formik={formik}
              modelKey="STOCK_LOCATIONS"
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
              defaultValueConfig={null}
              payloadDomain="self.typeSelect = '1'"
              isRequired={addNew || !(data && data.statusSelect >= STOCK_COUNT_STATUS_REV_ENUM['LBL_PLANNED'])}
              disabled={data && data.statusSelect >= STOCK_COUNT_STATUS_REV_ENUM['LBL_PLANNED']}
            />
          </div>
          <div className="col-md-6">
            <DropDown
              options={displayedTypes}
              formik={formik}
              isRequired={addNew || !(data && data.statusSelect >= STOCK_COUNT_STATUS_REV_ENUM['LBL_REVIEW'])}
              disabled={(!enableEdit && !addNew) || (data && data.statusSelect >= STOCK_COUNT_STATUS_REV_ENUM['LBL_REVIEW'])}
              label="LBL_TYPE"
              accessor="type"
              // translate={unitTypeSelect.mode === 'enum'}
              keys={{ valueKey: 'value', titleKey: 'name' }}
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
            />
          </div>
          <div className="col-md-6">
            <DateTimeInput
              formik={formik}
              label="LBL_PLANNED_START_DATE"
              accessor="plannedStartDate"
              mode={enableEdit === false ? 'view' : 'add'}
              isRequired={addNew || !(data && data.statusSelect >= STOCK_COUNT_STATUS_REV_ENUM['LBL_REVIEW'])}
              disabled={(!enableEdit && !addNew) || (data && data.statusSelect >= STOCK_COUNT_STATUS_REV_ENUM['LBL_REVIEW'])}
            />
          </div>
          <div className="col-md-6">
            <DateTimeInput
              formik={formik}
              label="LBL_PLANNED_END_DATE"
              accessor="plannedEndDate"
              mode={enableEdit === false ? 'view' : 'add'}
              isRequired={addNew || !(data && data.statusSelect >= STOCK_COUNT_STATUS_REV_ENUM['LBL_REVIEW'])}
              disabled={(!enableEdit && !addNew) || (data && data.statusSelect >= STOCK_COUNT_STATUS_REV_ENUM['LBL_REVIEW'])}
            />
          </div>

          <div className="col-md-12 vew-tabcontent">
            <label htmlFor="exampleDataList" className="form-label">
              {t('LBL_DESCRIPTION')}
            </label>
            <textarea
              className="form-control textarea"
              placeholder={t('LBL_DESCRIPTION')}
              name="desc"
              value={formik.values.desc}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={enableEdit === false ? true : false}
            ></textarea>
          </div>
        </div>

        {(addNew || enableEdit) && (
          <FormNotes
            notes={[
              {
                title: 'LBL_REQUIRED_NOTIFY',
                type: 3,
              },
            ]}
          />
        )}
      </div>
      {formik.isValid && (
        <Tabs
          {...tabsProps}
          tabsList={[
            { accessor: 'inventoryLines', label: 'LBL_INVENTORY_LINES', isHidden: false },
            {
              accessor: 'exportImport',
              label: 'LBL_EXPORT_IMPORT',
              isHidden: data && data.statusSelect === STOCK_COUNT_STATUS_REV_ENUM['LBL_DRAFT'],
            },
          ]}
        >
          <InventoryLines
            pageMode={enableEdit && data && data.statusSelect < STOCK_COUNT_STATUS_REV_ENUM['LBL_VALIDATED'] ? 'edit' : 'view'}
            accessor="inventoryLines"
            data={data}
            alertHandler={alertHandler}
          />
          <ExportImport
            accessor="exportImport"
            data={data}
            alertHandler={alertHandler}
            finishedExportInventoryLines={finishedExportInventoryLines}
            finishedImportInventoryLines={finishedImportInventoryLines}
            parentFormik={formik}
            fetchStockCount={fetchStockCount}
            selectedStockLocation={formik.values.stockLocation}
            setSelectedFormatSelect={setSelectedFormatSelect}
            enableEdit={enableEdit}
          />
        </Tabs>
      )}
      <AttachmentInput
        mode={addNew ? 'add' : enableEdit && data?.statusSelect < 4 ? 'edit' : 'view'}
        modelKey={MODELS.INVENTORY}
        alertHandler={alertHandler}
        fetchedObj={fetchedObject || data || null}
        parentSaveDone={parentSaveDone}
        feature={subFeature}
        navigationParams={{ id: data?.id }}
        onSuccessFn={
          onSuccessFn === 'save'
            ? () => finishedSaveHandler('success')
            : onSuccessFn === 'plan'
              ? () => finishedPlanHandler('success')
              : onSuccessFn === 'startCount'
                ? () => finishedStartInventoryCountHandler('success')
                : onSuccessFn === 'fillInventory'
                  ? () => finishedFillInventoryHandler('success', data, true)
                  : null
        }
      />
    </>
  );
};

export default StockCountForm;
