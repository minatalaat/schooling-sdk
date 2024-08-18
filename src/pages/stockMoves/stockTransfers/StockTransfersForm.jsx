import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import TextInput from '../../../components/ui/inputs/TextInput';
import DateInput from '../../../components/ui/inputs/DateInput';
import Tabs from '../../../components/ui/inputs/Tabs';
import SearchModalAxelor from '../../../components/ui/inputs/SearchModal/SearchModalAxelor';
import StockMoveLines from '../tabs/StockMoveLines';
import OriginCard from '../OriginCard';
import AttachmentInput from '../../../components/ui/inputs/AttachmentInput';
import FormNotes from '../../../components/ui/FormNotes';

import { MODELS } from '../../../constants/models';
import { useAxiosFunction } from '../../../hooks/useAxios';
import { getFetchUrl, getVerifyUrl, getActionUrl, getModelUrl, getRemoveAllUrl } from '../../../services/getUrl';
import { useTabs } from '../../../hooks/useTabs';
import { STOCK_MOVE_TYPE } from '../../../constants/enums/StockMoveEnums';
import { checkFlashOrError } from '../../../utils/helpers';
import { addObjectToChanges, addFormikValueToChanges } from '../../../utils/comparatorHelpers';
import { STOCK_MOVES_FETCH_FIELDS } from '../StockMovesPayloadsFields';
import { modelsEnum } from '../../../constants/modelsEnum/modelsEnum';
import { useFormikSubmit } from '../../../hooks/useFormikSubmit';

const StockTransfersForm = ({
  enableEdit,
  data,
  addNew,
  isSave,
  isCancelMove,
  cancelReason,
  isReverseStockMove,
  isRealizeStockMove,
  isDelete,
  finishedSaveHandler,
  finishedReverseMoveHandler,
  finishedRealizeHandler,
  finishedDeleteHandler,
  finishedCancelMoveHandler,
  alertHandler,
  setActionInProgress,
  setIsLoading,
  stockMoveLineList,
  setStockMoveLineList,
  productDomain,
  onFromStockLocationChange = () => {},
  noAvailableQty,
  setNoAvailableQty,
}) => {
  const mode = addNew ? 'add' : enableEdit ? 'edit' : 'view';
  const subFeature = 'STOCK_TRANSFERS';
  const { api } = useAxiosFunction();
  const tabsProps = useTabs();
  const { t } = useTranslation();

  const [parent, setParent] = useState();
  const [reversedMoveID, setReversedMoveID] = useState(null);

  const [parentSaveDone, setParentSaveDone] = useState(false);
  const [fetchedObject, setFetchedObject] = useState(false);
  const [onSuccessFn, setOnSuccessFn] = useState();

  let company = useSelector(state => state.userFeatures.companyInfo.company);
  let exTaxTotal = useSelector(state => state.stockMoveLines.exTaxTotal);

  const initialValues = {
    reference: data?.stockMoveSeq || '',
    estimatedDate: data?.estimatedDate || '',
    stockLocation: data?.fromStockLocation || null,
    toStockLocation: data?.toStockLocation || null,
    originFullName: '',
    originType: '',
    typeSelect: t(STOCK_MOVE_TYPE[1]),
  };

  const validationSchema = Yup.object({
    reference: Yup.string(t('LBL_INVALID_VALUE')),
    estimatedDate: Yup.date(t('LBL_INVALID_VALUE')).required(t('REQUIRED')),
    stockLocation: Yup.object().nullable().required(t('REQUIRED')),
    toStockLocation: Yup.object().nullable().required(t('REQUIRED')),
    originFullName: Yup.string(t('LBL_INVALID_VALUE')),
    originType: Yup.string(t('LBL_INVALID_VALUE')),
    typeSelect: Yup.string(t('LBL_INVALID_VALUE')),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: addNew ? true : false,
  });

  const { validateFormForSubmit } = useFormikSubmit(formik, alertHandler);

  const fromStockLocationDomain = `self.typeSelect = '1' and self.id != ${formik.values.toStockLocation?.id ?? null}`;
  const toStockLocationDomain = `self.typeSelect = '1' and self.id != ${formik.values.stockLocation?.id ?? null}`;

  useEffect(() => {
    if (isSave) {
      if (addNew) {
        copyRecordToStock();
      } else {
        saveRecord();
      }
    }

    if (isReverseStockMove) {
      reverseStockMove();
    }

    if (isRealizeStockMove) {
      realizeRecord();
    }

    if (isDelete) {
      deleteRecord();
    }

    if (isCancelMove) {
      cancelMove();
    }
  }, [isSave, isDelete, addNew, enableEdit, isReverseStockMove, isRealizeStockMove, isCancelMove]);

  useEffect(() => {
    tabsProps.setShowTabsContent(true);
  }, []);

  useEffect(() => {
    setParent({
      _id: null,
      _typeSelect: 1,
      typeSelect: 1,
      statusSelect: data?.statusSelect ?? 1,
      estimatedDate: formik.values.estimatedDate,
      company: company,
      fromStockLocation: formik.values.stockLocation,
      stockMoveLineList: [],
      _xFillProductAvailableQty: true,
      _model: 'com.axelor.apps.stock.db.StockMove',
    });
  }, [formik.values.stockLocation, formik.values.estimatedDate]);

  useEffect(() => {
    formik.setFieldValue('exTaxTotal', exTaxTotal);
  }, [exTaxTotal]);

  const onStockLocationsSuccess = response => {
    if (response.data.status === 0) {
      let responseData = response.data.data || [];
      return { displayedData: [...responseData], total: response.data.total || 0 };
    }
  };

  const getSaveActionPayload = (action, id, version, tempStockMoveLineList) => {
    let payload = {
      model: MODELS.STOCK_MOVE,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: MODELS.STOCK_MOVE,
          _id: null,
          _typeSelect: 1,
          id: id ?? undefined,
          version: version ?? undefined,
          typeSelect: 1,
          statusSelect: data?.statusSelect ?? 1,
          exTaxTotal: exTaxTotal,
          estimatedDate: formik.values.estimatedDate,
          company: company,
          fromStockLocation: formik.values.stockLocation,
          toStockLocation: formik.values.toStockLocation,
          stockMoveLineList: tempStockMoveLineList ?? stockMoveLineList,
          // isWithReturnSurplus: false,
          // isReversion: false,
          // isWithBackorder: false,
        },
      },
    };
    return payload;
  };

  const fetchRequest = async id => {
    const stockMoveResponse = await api('POST', getFetchUrl(modelsEnum[subFeature].name, id), {
      fields: STOCK_MOVES_FETCH_FIELDS,
      related: {},
    });
    if (!stockMoveResponse.data || stockMoveResponse.data.status !== 0 || !stockMoveResponse.data.data || !stockMoveResponse.data.data?.[0])
      return 'Error';
    return stockMoveResponse;
  };

  const saveRequestModel = async payload => {
    const saveModelResponse = await api('POST', getModelUrl(MODELS.STOCK_MOVE), payload ?? getSaveModelPayload());
    if (saveModelResponse.data.status !== 0) return 'Error';
    let responseData = saveModelResponse.data.data;
    if (!responseData) return 'Error';
    return saveModelResponse;
  };

  const saveAction = async payload => {
    const saveActionResponse = await api('POST', getActionUrl(), payload);
    if (saveActionResponse.data.status !== 0) return 'Error';
    let responseData = saveActionResponse.data.data;

    if (responseData && checkFlashOrError(responseData) && responseData?.[0]?.error === 'SPC-003') {
      return alertHandler('Error', 'LBL_QUANTITY_MORETHAN_AVAIABLE_IN_STOCK');
    }

    if (responseData && checkFlashOrError(responseData)) return 'Error';
    return saveActionResponse;
  };

  const verifyModel = async payload => {
    const verifyRes = await api('POST', getVerifyUrl(MODELS.STOCK_MOVE), payload);
    if (verifyRes.data.status !== 0) return 'Error';
    let responseData = verifyRes.data.data;
    if (responseData && checkFlashOrError(responseData)) return 'Error';
    return verifyRes;
  };

  const getSaveModelPayload = () => {
    let payload = {
      data: {
        company: company,
        id: data?.id ?? undefined,
        version: data?.version ?? undefined,
        typeSelect: 1,
        statusSelect: data?.statusSelect ?? 1,
        isWithBackorder: false,
        isWithReturnSurplus: false,
        stockMoveLineList: stockMoveLineList,
        _original: data || {},
      },
    };
    addObjectToChanges('fromStockLocation', payload.data, data?.fromStockLocation, formik.values.stockLocation);
    addObjectToChanges('toStockLocation', payload.data, data?.toStockLocation, formik.values.toStockLocation);
    addFormikValueToChanges('estimatedDate', payload.data, data?.estimatedDate, formik);
    if (parseFloat(exTaxTotal) !== parseFloat(data?.exTaxTotal)) payload.data['exTaxTotal'] = exTaxTotal;
    return payload;
  };

  const saveRecord = async () => {
    if (stockMoveLineList.length === 0) return alertHandler('Error', 'PLEASE_FILL_INTERNAL_MOVE_LINES_FIRST');

    const isValid = await validateFormForSubmit();
    if (!isValid) return null;

    let errorMsg = 'LBL_ERROR_SAVING_STOCK_TRANSFER';
    setActionInProgress(true);
    let action = 'action-stock-move-group-save-and-update-stocks';
    const saveActionRes = await saveAction(getSaveActionPayload(action));
    if (saveActionRes === 'Error') return alertHandler('Error', errorMsg);

    const saveModelResponse = await saveRequestModel();
    if (saveModelResponse === 'Error') return alertHandler('Error', errorMsg);
    let id = saveModelResponse.data.data?.[0]?.id;

    const stockMoveResponse = await fetchRequest(id);
    if (stockMoveResponse === 'Error') return alertHandler('Error', errorMsg);
    let newMove = stockMoveResponse.data.data?.[0];
    let version = newMove.version;
    let tempStockMoveLineList = newMove.stockMoveLineList;

    let actionOne = 'action-stock-move-group-save-and-update-stocks[1]';
    const saveActionResTwo = await saveAction(getSaveActionPayload(actionOne, id, version, tempStockMoveLineList));
    if (saveActionResTwo === 'Error') return alertHandler('Error', errorMsg);

    const secondSaveModelResponse = await saveRequestModel({
      data: {
        id: id,
        version: version,
      },
    });
    if (secondSaveModelResponse === 'Error') return alertHandler('Error', errorMsg);

    setFetchedObject(secondSaveModelResponse?.data?.data?.[0]);
    setParentSaveDone(true);
    setOnSuccessFn('save');
  };

  const getPlanPayload = (action, lines, id) => {
    let payload = {
      model: MODELS.STOCK_MOVE,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: MODELS.STOCK_MOVE,
          _isReversion: false,
          _id: null,
          _typeSelect: 1,
          estimatedDate: formik.values.estimatedDate,
          typeSelect: 1,
          id: data?.id || id || null,
          version: data?.version || undefined,
          isWithReturnSurplus: false,
          isWithBackorder: false,
          isReversion: false,
          backorderId: data?.backorderId || 0,
          originId: data?.originId || 0,
          toStockLocation: formik.values.toStockLocation,
          company: company,
          fromStockLocation: formik.values.stockLocation,
          originTypeSelect: data?.originTypeSelect,
          exTaxTotal: exTaxTotal,
          stockMoveSeq: data?.stockMoveSeq || undefined,
          stockMoveLineList: lines,
          statusSelect: data?.statusSelect || 1,
          _signal: 'planBtn',
          _source: 'planBtn',
        },
      },
    };
    return payload;
  };

  const verifyPayload = () => {
    let payload = {
      data: {
        id: data.id,
      },
    };
    return payload;
  };

  const copyRecordToStock = async () => {
    if (stockMoveLineList.length === 0) return alertHandler('Error', 'PLEASE_FILL_INTERNAL_MOVE_LINES_FIRST');

    const isValid = await validateFormForSubmit();
    if (!isValid) return null;

    let errorMsg = 'LBL_ERROR_PLANNING_TRANSFER_REQUEST';
    setActionInProgress(true);
    let action = 'action-group-stock-stockmove-plan-click';
    const saveActionRes = await saveAction(getPlanPayload(action, stockMoveLineList));
    if (saveActionRes === 'Error') return alertHandler('Error', errorMsg);

    if (!addNew) {
      const verifyRes = await verifyModel(verifyPayload());
      if (verifyRes === 'Error') return alertHandler('Error', errorMsg);
    }

    const saveModelResponse = await saveRequestModel(getSaveModelPayload());
    if (saveModelResponse === 'Error') return alertHandler('Error', errorMsg);
    let responseData = saveModelResponse.data.data;
    let id = responseData[0].id;

    const stockMoveResponse = await fetchRequest(id);
    if (stockMoveResponse === 'Error') return alertHandler('Error', errorMsg);
    let newMove = stockMoveResponse.data.data?.[0];
    id = newMove.id;
    let version = newMove.version;
    let tempStockMoveLineList = newMove.stockMoveLineList;

    let actionOne = 'action-group-stock-stockmove-plan-click[1]';
    const saveActionResOne = await saveAction(getPlanPayload(actionOne, tempStockMoveLineList, id));
    if (saveActionResOne === 'Error') return alertHandler('Error', errorMsg);

    const stockMoveTwoResponse = await fetchRequest(id);
    if (stockMoveTwoResponse === 'Error') return alertHandler('Error', errorMsg);
    const newMoveTwo = stockMoveTwoResponse.data.data?.[0];
    id = newMoveTwo.id;
    version = newMoveTwo.version;
    tempStockMoveLineList = newMoveTwo.stockMoveLineList;

    let actionTwo = 'action-group-stock-stockmove-plan-click[2]';
    const saveActionResTwo = await saveAction(getPlanPayload(actionTwo, tempStockMoveLineList, id));
    if (saveActionResTwo === 'Error') return alertHandler('Error', errorMsg);

    const verifyRes = await verifyModel({
      data: {
        id: id,
        version: version,
      },
    });
    if (verifyRes === 'Error') return alertHandler('Error', errorMsg);

    setFetchedObject(newMoveTwo);
    setParentSaveDone(true);
    setOnSuccessFn('save');
  };

  const getRealizePayload = (action, lines, version) => {
    let payload = {
      model: MODELS.STOCK_MOVE,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: MODELS.STOCK_MOVE,
          _isReversion: false,
          _id: null,
          _typeSelect: 1,
          estimatedDate: formik.values.estimatedDate,
          typeSelect: 1,
          id: data?.id || null,
          version: version,
          isWithReturnSurplus: false,
          isWithBackorder: false,
          isReversion: false,
          backorderId: data?.backorderId || 0,
          originId: data?.originId || 0,
          toStockLocation: formik.values.toStockLocation,
          company: company,
          fromStockLocation: formik.values.stockLocation,
          originTypeSelect: data?.originTypeSelect,
          exTaxTotal: exTaxTotal,
          stockMoveSeq: data?.stockMoveSeq || undefined,
          stockMoveLineList: lines,
          statusSelect: data?.statusSelect || 2,
          _signal: 'realizeBtn',
          _source: 'realizeBtn',
        },
      },
    };
    return payload;
  };

  const getActionRealizePayload = () => {
    let payload = {
      model: MODELS.STOCK_MOVE,
      action: 'action-stock-move-method-realize,close',
      data: {
        criteria: [],
        context: {
          _model: MODELS.STOCK_MOVE,
          fromStockLocation: data.fromStockLocation,
          isWithBackorder: false,
          typeSelect: data.typeSelect,
          id: data.id,
          availableStatusSelect: 1,
          version: data.version,
          wkfStatus: null,
          _signal: 'noBtn',
          _source: 'noBtn',
        },
      },
    };
    return payload;
  };

  const realizeRecord = async () => {
    if (stockMoveLineList.length === 0) return alertHandler('Error', 'PLEASE_FILL_INTERNAL_MOVE_LINES_FIRST');

    if (noAvailableQty.length > 0) return alertHandler('Error', 'LBL_QUANTITY_MORETHAN_AVAIABLE_IN_STOCK');

    const isValid = await validateFormForSubmit();
    if (!isValid) return null;

    let errorMsg = 'LBL_ERROR_REALIZING_STOCK_TRANSFER';
    setActionInProgress(true);
    let action = 'action-group-stock-stockmove-realize-click';
    const saveActionRes = await saveAction(getRealizePayload(action, stockMoveLineList, data.version));
    if (saveActionRes === 'Error') return alertHandler('Error', errorMsg);

    const verifyRes = await verifyModel({
      data: {
        id: data.id,
        version: data.version,
      },
    });
    if (verifyRes === 'Error') return alertHandler('Error', errorMsg);

    const saveModelResponse = await saveRequestModel(getSaveModelPayload());
    if (saveModelResponse === 'Error') return alertHandler('Error', errorMsg);

    const stockMoveResponse = await fetchRequest(data.id);
    if (stockMoveResponse === 'Error') return alertHandler('Error', errorMsg);
    let newMove = stockMoveResponse.data.data?.[0];
    let version = newMove.version;
    let tempStockMoveLineList = newMove.stockMoveLineList;

    let actionOne = 'action-group-stock-stockmove-realize-click[1]';
    const saveActionResOne = await saveAction(getRealizePayload(actionOne, tempStockMoveLineList, version));
    if (saveActionResOne === 'Error') return alertHandler('Error', errorMsg);
    let responseData = saveActionResOne.data.data;

    if (responseData && checkFlashOrError(responseData) && responseData[0]?.error?.includes('are not in sufficient quantity')) {
      return alertHandler('Error', 'LBL_QUANTITY_MORETHAN_AVAIABLE_IN_STOCK');
    }

    if (responseData && checkFlashOrError(responseData) && responseData?.[0]?.error === 'SPC-018') {
      return alertHandler('Error', 'LBL_ERROR_NO_AVAILABLE_PERIOD');
    }

    if (responseData && checkFlashOrError(responseData) && responseData?.[0]?.error?.includes('This period is closed')) {
      return alertHandler('Error', 'LBL_ERROR_PERIOD_CLOSED');
    }

    if (responseData && checkFlashOrError(responseData)) return alertHandler('Error', errorMsg);

    if (responseData?.[0]?.view?.title?.includes('Manage backorder')) {
      let realizeResponse = await api('POST', getActionUrl(), getActionRealizePayload());
      if (realizeResponse.data.status !== 0) return alertHandler('Error', errorMsg);
    }

    setParentSaveDone(true);
    setOnSuccessFn('realize');
  };

  const reverseMovePayload = action => {
    let payload = {
      model: MODELS.STOCK_MOVE,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: MODELS.STOCK_MOVE,
          _isReversion: data?.isReversion,
          _id: null,
          _typeSelect: data?._typeSelect,
          invoiceSet: data?.invoiceSet,
          estimatedDate: data?.estimatedDate,
          typeSelect: data?.typeSelect,
          id: data?.id,
          isWithReturnSurplus: false,
          version: data?.version,
          isReversion: data?.isReversion,
          backorderId: data?.backorderId,
          originId: data?.originId,
          toStockLocation: data?.toStockLocation,
          company: data?.company,
          cancelReason: null,
          fromStockLocation: data?.fromStockLocation,
          originTypeSelect: data?.originTypeSelect,
          exTaxTotal: exTaxTotal,
          reversionOriginStockMove: null,
          stockMoveSeq: data?.stockMoveSeq,
          stockMoveLineList: data?.stockMoveLineList,
          statusSelect: data?.statusSelect,
          isWithBackorder: false,
          _signal: 'generateReversionBtn',
          _source: 'generateReversionBtn',
        },
      },
    };
    return payload;
  };

  const reverseStockMove = async () => {
    const isValid = await validateFormForSubmit();
    if (!isValid) return null;

    setActionInProgress(true);
    let errorMsg = 'LBL_ERROR_REVERSING_MOVE';
    let action = 'save,action-stock-move-method-generate-reversion';
    const reverseMoveResponse = await saveAction(reverseMovePayload(action));
    if (reverseMoveResponse === 'Error') return alertHandler('Error', errorMsg);

    let actionTwo = 'action-stock-move-method-generate-reversion';
    const reverseMoveTwoResponse = await saveAction(reverseMovePayload(actionTwo));
    if (reverseMoveTwoResponse === 'Error') return alertHandler('Error', errorMsg);
    let resData = reverseMoveTwoResponse.data.data;
    let context = resData[0]?.view?.context || null;
    let id = context['_showRecord'] || null;

    if (id) {
      setParentSaveDone(true);
      setReversedMoveID(id);
      setOnSuccessFn('reverseMove');
    } else {
      alertHandler('Error', 'LBL_ERROR_REVERSING_MOVE');
    }
  };

  const cancelMovePayload = () => {
    let payload = {
      model: MODELS.STOCK_MOVE,
      action: 'action-stock-move-method-cancel',
      data: {
        criteria: [],
        context: {
          _model: MODELS.STOCK_MOVE,
          _xApplicationType: MODELS.STOCK_MOVE,
          _id: data?.id,
          id: data?.id,
          // availableStatusSelect: 1,
          cancelReason: cancelReason,
          version: data?.version,
          wkfStatus: null,
          _signal: 'cancelConfirmBtn',
          _source: 'cancelConfirmBtn',
        },
      },
    };
    return payload;
  };

  const cancelMove = async () => {
    let errorMsg = 'LBL_ERROR_CANCELLING_MOVE';
    const cancelMoveResponse = await saveAction(cancelMovePayload());
    if (cancelMoveResponse === 'Error') return alertHandler('Error', errorMsg);
    setParentSaveDone(true);
    setOnSuccessFn('cancel');
  };

  const deleteRecord = () => {
    setActionInProgress(true);
    const payload = {
      records: [{ id: data.id }],
    };
    api('POST', getRemoveAllUrl(MODELS.STOCK_LOCATION), payload, () => {
      finishedDeleteHandler('success');
    });
  };

  return (
    <>
      <div className="card">
        <div className="row">
          {!addNew && (
            <div className="col-md-6">
              <TextInput formik={formik} label="LBL_REFERENCE" accessor="reference" mode="view" />
            </div>
          )}
          <div className="col-md-6">
            <TextInput formik={formik} label="LBL_TYPE" accessor="typeSelect" mode="view" />
          </div>
          <div className="col-md-6">
            <SearchModalAxelor
              formik={formik}
              modelKey="FROM_STOCK_LOCATIONS"
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
              onSuccess={onStockLocationsSuccess}
              defaultValueConfig={null}
              selectIdentifier="name"
              payloadDomain={fromStockLocationDomain}
              isRequired={addNew}
              disabled={!addNew}
              selectCallback={stockLocation => onFromStockLocationChange(stockLocation)}
            />
          </div>
          <div className="col-md-6">
            <SearchModalAxelor
              formik={formik}
              modelKey="TO_INTERNAL_STOCK_LOCATIONS"
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
              onSuccess={onStockLocationsSuccess}
              defaultValueConfig={null}
              selectIdentifier="name"
              payloadDomain={toStockLocationDomain}
              isRequired={addNew}
              disabled={!addNew}
            />
          </div>
          <div className="col-md-6">
            <DateInput
              formik={formik}
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
              label="LBL_ESTIMATED_DATE"
              accessor="estimatedDate"
              disabled={(!addNew && !enableEdit) || data?.statusSelect > 2}
              isRequired={addNew || enableEdit}
            />
          </div>
        </div>
        {mode !== 'view' && (
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

      <Tabs {...tabsProps} tabsList={[{ accessor: 'tr-lines', label: 'LBL_INTERNAL_LINES' }]}>
        <StockMoveLines
          accessor="tr-lines"
          addNew={formik.values.stockLocation ? addNew : false}
          enableEdit={enableEdit}
          data={data}
          stockMoveLineList={stockMoveLineList}
          setStockMoveLineList={setStockMoveLineList}
          formik={formik}
          tableTitle="LBL_INTERNAL_LINES"
          modalHeader="LBL_INTERNAL_LINE"
          productDomain={productDomain}
          parent={parent}
          isInternal={true}
          setIsLoading={setIsLoading}
          noAvailableQty={noAvailableQty}
          setNoAvailableQty={setNoAvailableQty}
        />
      </Tabs>

      {!addNew && data?.isReversion && <OriginCard formik={formik} stockMove={data} isInternal={true} />}
      <AttachmentInput
        mode={addNew ? 'add' : enableEdit && data?.statusSelect < 3 ? 'edit' : 'view'}
        modelKey={MODELS.STOCK_MOVE}
        alertHandler={alertHandler}
        fetchedObj={fetchedObject || data || null}
        parentSaveDone={parentSaveDone}
        feature={subFeature}
        navigationParams={{ id: data?.id }}
        onSuccessFn={
          onSuccessFn === 'save'
            ? () => finishedSaveHandler('success')
            : onSuccessFn === 'realize'
              ? () => finishedRealizeHandler('success')
              : onSuccessFn === 'reverseMove'
                ? () => finishedReverseMoveHandler('success', reversedMoveID)
                : onSuccessFn === 'cancel'
                  ? () => finishedCancelMoveHandler('success')
                  : null
        }
      />
    </>
  );
};

export default StockTransfersForm;
