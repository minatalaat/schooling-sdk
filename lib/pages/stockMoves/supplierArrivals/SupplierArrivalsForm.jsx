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
import { getVerifyUrl, getActionUrl, getModelUrl, getRemoveAllUrl } from '../../../services/getUrl';
import { useTabs } from '../../../hooks/useTabs';
import { STOCK_MOVE_TYPE } from '../../../constants/enums/StockMoveEnums';
import { getDateAfterXDays, checkFlashOrError } from '../../../utils/helpers';
import { addObjectToChanges, addFormikValueToChanges } from '../../../utils/comparatorHelpers';
import StockReturns from '../tabs/StockReturns';
import { useFormikSubmit } from '../../../hooks/useFormikSubmit';

const SupplierArrivalsForm = ({
  enableEdit,
  data,
  addNew,
  isSave,
  isGenerateInvoice,
  isReverseStockMove,
  isRealizeStockMove,
  isCancelMove,
  cancelReason,
  finishedSaveHandler,
  finishedRealizeHandler,
  finishedInvoiceGenerateHandler,
  finishedReverseMoveHandler,
  finishedCancelMoveHandler,
  isDelete,
  finishedDeleteHandler,
  alertHandler,
  setActionInProgress,
  fetchMove,
  fetchedStockMoveAdditional,
  setIsLoading,
  stockMoveLineList,
  setStockMoveLineList,
}) => {
  const mode = addNew ? 'add' : enableEdit ? 'edit' : 'view';
  const subFeature = 'SUPPLIER_ARRIVALS';
  const { api } = useAxiosFunction();
  const tabsProps = useTabs();
  const { t } = useTranslation();
  const generateInvoiceStockMovesLines = useSelector(state => state.generateInvoiceStockMovesLines.generateInvoiceStockMovesLines);
  const operationTypeSelect = useSelector(state => state.generateInvoiceStockMovesLines.operationTypeSelect);

  const [selectedFromAddress, setSelectedFromAddress] = useState(null);

  const [invoiceID, setInvoiceID] = useState(null);
  const [reversedMoveID, setReversedMoveID] = useState(null);

  const [parentSaveDone, setParentSaveDone] = useState(false);
  const [onSuccessFn, setOnSuccessFn] = useState();

  let company = useSelector(state => state.userFeatures.companyInfo.company);
  let exTaxTotal = useSelector(state => state.stockMoveLines.exTaxTotal);

  const newDate = getDateAfterXDays(7);

  const initialValues = {
    reference: data?.stockMoveSeq || '',
    partner: data?.partner || null,
    estimatedDate: data?.estimatedDate || '',
    toAddress: data?.toAddress || null,
    stockLocation: data?.toStockLocation || null,
    originFullName: '',
    originType: '',
    orderDate: '',
    typeSelect: t(STOCK_MOVE_TYPE[3]),
    stockMoveDate: fetchedStockMoveAdditional?.stockMoveDate ?? '',
    journal: '',
  };

  const validationSchema = Yup.object({
    reference: Yup.string(t('LBL_INVALID_VALUE')),
    partner: Yup.object().nullable().required(t('REQUIRED')),
    orderDate: Yup.date(),
    estimatedDate: Yup.date(t('LBL_INVALID_VALUE')).required(t('REQUIRED')).min(Yup.ref('orderDate'), t('ESTIMATED_DATE_VALIDATION')),
    toAddress: Yup.object().nullable(),
    stockLocation: Yup.object().nullable().required(t('REQUIRED')),
    originFullName: Yup.string(t('LBL_INVALID_VALUE')),
    originType: Yup.string(t('LBL_INVALID_VALUE')),
    typeSelect: Yup.string(t('LBL_INVALID_VALUE')),
    stockMoveDate: Yup.date(t('LBL_INVALID_VALUE')).required(t('REQUIRED')),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: addNew ? true : false,
  });

  const { validateFormForSubmit } = useFormikSubmit(formik, alertHandler);

  const stockLocationDomain = "self.typeSelect = '1'";

  useEffect(() => {
    if (isSave) {
      saveRecord();
    }

    if (isDelete) {
      deleteRecord();
    }

    if (isReverseStockMove) {
      reverseStockMove();
    }

    if (isRealizeStockMove) {
      realizeRecord();
    }

    if (isGenerateInvoice) {
      generateInvoice();
    }

    if (isCancelMove) {
      cancelMove();
    }
  }, [isSave, isDelete, addNew, enableEdit, isReverseStockMove, isRealizeStockMove, isGenerateInvoice, isCancelMove]);

  useEffect(() => {
    tabsProps.setShowTabsContent(true);
  }, []);

  useEffect(() => {
    formik.setFieldValue('exTaxTotal', exTaxTotal);
  }, [exTaxTotal]);

  const onStockLocationsSuccess = response => {
    if (response.data.status === 0) {
      let data = response.data.data || [];
      return { displayedData: [...data], total: response.data.total || 0 };
    }
  };

  const onPartnersSuccess = response => {
    if (response.data.status === 0) {
      let data = response.data.data || [];
      return { displayedData: [...data], total: response.data.total || 0 };
    }
  };

  const getSaveActionPayload = () => {
    let payload = {
      model: MODELS.STOCK_MOVE,
      action: 'action-stock-move-group-save-and-update-stocks',
      data: {
        criteria: [],
        context: {
          _model: MODELS.STOCK_MOVE,
          _isReversion: false,
          _id: null,
          _newDate: newDate,
          _typeSelect: 3,
          typeSelect: 3,
          isReversion: false,
          statusSelect: data?.statusSelect,
          isWithBackorder: true,
          isWithReturnSurplus: true,
          'toStockLocation.typeSelect': 1,
          fromStockLocation: null,
          toStockLocation: formik.values.stockLocation,
          estimatedDate: formik.values.estimatedDate,
          partner: formik.values.partner,
          toAddress: formik.values.toAddress,
          fromAddress: selectedFromAddress,
          stockMoveLineList: stockMoveLineList,
          exTaxTotal: exTaxTotal,
          originId: 0,
          backorderId: 0,
          company: company,
          id: data?.id,
          version: data?.version,
        },
      },
    };
    return payload;
  };

  const getSaveActionOnePayload = () => {
    let payload = {
      model: MODELS.STOCK_MOVE,
      action: 'action-stock-move-group-save-and-update-stocks[1]',
      data: {
        criteria: [],
        context: {
          _model: MODELS.STOCK_MOVE,
          _isReversion: false,
          _id: null,
          _newDate: newDate,
          _typeSelect: 3,
          typeSelect: 3,
          isReversion: false,
          statusSelect: data?.statusSelect,
          isWithBackorder: true,
          isWithReturnSurplus: true,
          // fromStockLocation: null,
          toStockLocation: formik.values.stockLocation,
          estimatedDate: formik.values.estimatedDate,
          partner: formik.values.partner,
          toAddress: formik.values.toAddress,
          fromAddress: selectedFromAddress,
          stockMoveLineList: stockMoveLineList,
          id: data?.id,
          version: data?.version,
          stockMoveSeq: data?.stockMoveSeq,
          originId: data?.originId,
          originTypeSelect: data?.originTypeSelect,
          company: company,
          exTaxTotal: exTaxTotal,
          backorderId: 0,
          invoiceSet: [],
        },
      },
    };
    return payload;
  };

  const getSaveModelPayload = () => {
    let payload = {
      data: {
        id: data?.id,
        version: data?.version,
        isWithBackorder: true,
        isWithReturnSurplus: true,
        stockMoveLineList: stockMoveLineList,
        _original: data,
      },
    };
    addObjectToChanges('toStockLocation', payload.data, data.toStockLocation, formik.values.stockLocation);
    addFormikValueToChanges('estimatedDate', payload.data, data.estimatedDate, formik);
    if (parseFloat(exTaxTotal) !== parseFloat(data.exTaxTotal)) payload.data['exTaxTotal'] = exTaxTotal;
    return payload;
  };

  const getSaveDateModelPayload = () => {
    let payload = {
      data: {
        stockMove: {
          id: data?.id,
        },
        stockMoveDate: formik.values.stockMoveDate,
        id: fetchedStockMoveAdditional?.id ?? null,
        version: fetchedStockMoveAdditional?.version ?? undefined,
      },
    };
    return payload;
  };

  const saveRecord = async () => {
    const isValid = await validateFormForSubmit();
    if (!isValid) return null;

    setActionInProgress(true);
    let saveDateResponse = await api('POST', getModelUrl(MODELS.STOCK_MOVE_ADDITIONAL_DATA), getSaveDateModelPayload());
    if (saveDateResponse.data.status !== 0) return alertHandler('Error', 'LBL_ERROR_SAVING_SUPPLIER_ARRIVAL');

    let saveActionResponse = await api('POST', getActionUrl(), getSaveActionPayload());
    if (saveActionResponse.data.status !== 0) return alertHandler('Error', 'LBL_ERROR_SAVING_SUPPLIER_ARRIVAL');
    let data = saveActionResponse.data.data;
    if (data && checkFlashOrError(data)) return alertHandler('Error', 'LBL_ERROR_SAVING_SUPPLIER_ARRIVAL');

    let saveActionOneResponse = await api('POST', getActionUrl(), getSaveActionOnePayload());
    if (saveActionOneResponse.data.status !== 0) return alertHandler('Error', 'LBL_ERROR_SAVING_SUPPLIER_ARRIVAL');
    data = saveActionOneResponse.data.data;
    if (data && checkFlashOrError(data)) return alertHandler('Error', 'LBL_ERROR_SAVING_SUPPLIER_ARRIVAL');

    let saveModelResponse = await api('POST', getModelUrl(MODELS.STOCK_MOVE), getSaveModelPayload());
    if (saveModelResponse.data.status !== 0) return alertHandler('Error', 'LBL_ERROR_SAVING_SUPPLIER_ARRIVAL');

    await fetchMove(saveModelResponse?.data?.data?.[0]?.id);

    setParentSaveDone(true);
    setOnSuccessFn('save');
  };

  const getRealizePayload = (action, lines) => {
    let payload = {
      model: MODELS.STOCK_MOVE,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: MODELS.STOCK_MOVE,
          _isReversion: false,
          _id: null,
          _typeSelect: data.typeSelect,
          invoiceSet: data.invoiceSet,
          estimatedDate: formik.values.estimatedDate,
          typeSelect: data.typeSelect,
          toAddress: data.toAddress,
          id: data.id,
          isWithReturnSurplus: true,
          version: data.version,
          isReversion: data.isReversion,
          backorderId: data.backorderId,
          originId: data.originId,
          toStockLocation: data.toStockLocation,
          company: data.company,
          fromAddress: data.fromAddress,
          fromStockLocation: data.fromStockLocation,
          originTypeSelect: data.originTypeSelect,
          exTaxTotal: exTaxTotal,
          stockMoveSeq: data.stockMoveSeq,
          stockMoveLineList: lines,
          statusSelect: data.statusSelect,
          partner: data.partner,
          isWithBackorder: true,
          _signal: 'realizeBtn',
          _source: 'realizeBtn',
        },
      },
    };
    return payload;
  };

  const getStockMoveLineListIDs = () => {
    let tempArr = [];
    stockMoveLineList.forEach(line => tempArr.push({ id: line.id }));
    return tempArr;
  };

  const verifyPayload = () => {
    let payload = {
      data: {
        id: data.id,
      },
    };
    return payload;
  };

  const realizeRecord = async () => {
    const isValid = await validateFormForSubmit();
    if (!isValid) return null;

    setActionInProgress(true);
    let saveDateResponse = await api('POST', getModelUrl(MODELS.STOCK_MOVE_ADDITIONAL_DATA), getSaveDateModelPayload());
    if (saveDateResponse.data.status !== 0) return alertHandler('Error', 'LBL_ERROR_REALIZING_SUPPLIER_ARRIVAL');

    let action = 'action-group-stock-stockmove-realize-click';
    let realizeActionResponse = await api('POST', getActionUrl(), getRealizePayload(action, stockMoveLineList));
    if (realizeActionResponse.data.status !== 0) return alertHandler('Error', 'LBL_ERROR_REALIZING_SUPPLIER_ARRIVAL');
    let data = realizeActionResponse.data.data;
    if (data && checkFlashOrError(data)) return alertHandler('Error', 'LBL_ERROR_REALIZING_SUPPLIER_ARRIVAL');

    let verifyResponse = await api('POST', getVerifyUrl(MODELS.STOCK_MOVE), verifyPayload());
    if (verifyResponse.data.status !== 0) return alertHandler('Error', 'LBL_ERROR_REALIZING_SUPPLIER_ARRIVAL');
    data = verifyResponse.data.data;
    if (data && checkFlashOrError(data)) return alertHandler('Error', 'LBL_ERROR_REALIZING_SUPPLIER_ARRIVAL');

    let saveModelResponse = await api('POST', getModelUrl(MODELS.STOCK_MOVE), getSaveModelPayload());
    if (saveModelResponse.data.status !== 0) return alertHandler('Error', 'LBL_ERROR_REALIZING_SUPPLIER_ARRIVAL');

    await fetchMove(saveModelResponse?.data?.data?.[0]?.id);

    let actionOne = 'action-group-stock-stockmove-realize-click[1]';
    let realizeActionOneResponse = await api('POST', getActionUrl(), getRealizePayload(actionOne, getStockMoveLineListIDs()));
    if (realizeActionOneResponse.data.status !== 0) return alertHandler('Error', 'LBL_ERROR_REALIZING_SUPPLIER_ARRIVAL');
    data = realizeActionOneResponse.data.data;

    if (data && checkFlashOrError(data) && data?.[0]?.error === 'SPC-003') {
      return alertHandler('Error', 'LBL_QUANTITY_MORETHAN_AVAIABLE_IN_STOCK');
    }

    if (data && checkFlashOrError(data) && data?.[0]?.error === 'SPC-018') {
      return alertHandler('Error', 'LBL_ERROR_NO_AVAILABLE_PERIOD');
    }

    if (data && checkFlashOrError(data) && data?.[0]?.error?.includes('This period is closed')) {
      return alertHandler('Error', 'LBL_ERROR_PERIOD_CLOSED');
    }

    if (data && checkFlashOrError(data) && data[0] && data[0].error && data[0].error.includes('are not in sufficient quantity')) {
      return alertHandler('Error', 'LBL_QUANTITY_MORETHAN_AVAIABLE_IN_STOCK');
    }

    if (data && checkFlashOrError(data) && data?.[0]?.flash && data[0].flash.includes('generated (DO')) {
      setParentSaveDone(true);
      setOnSuccessFn('realizeExcess');
      return;
    }

    if (data && checkFlashOrError(data) && data?.[0]?.flash && data[0].flash.includes('generated (RO')) {
      setParentSaveDone(true);
      setOnSuccessFn('realizeRemaining');
      return;
    }

    if (
      data &&
      checkFlashOrError(data) &&
      data?.[0]?.error &&
      data[0].error.includes('realize this stock move because of the ongoing inventory')
    ) {
      return alertHandler('Error', 'LBL_ONGOING_INVENTORY_MESSAGE');
    }

    if (data && checkFlashOrError(data)) return alertHandler('Error', 'LBL_ERROR_REALIZING_SUPPLIER_ARRIVAL');
    setParentSaveDone(true);
    setOnSuccessFn('realize');
  };

  const generateInvoicePayload = () => {
    let tempLines = [];

    if (parseInt(operationTypeSelect) === 1) {
      generateInvoiceStockMovesLines.forEach(line => {
        let tempLine = { ...line };
        tempLine.qtyToInvoice = tempLine.remainingQty;
        tempLines.push(tempLine);
      });
    } else {
      tempLines = [...generateInvoiceStockMovesLines];
    }

    let payload = {
      model: MODELS.STOCK_MOVE,
      action: 'action-supplychain-stock-move-method-generate-invoice',
      data: {
        criteria: [],
        context: {
          _model: MODELS.STOCK_MOVE,
          _id: data.id,
          operationSelect: 2,
          stockMoveLines: tempLines,
          _signal: 'createInvoiceBtn',
          _source: 'createInvoiceBtn',
        },
      },
    };
    return payload;
  };

  const generateInvoice = async () => {
    setActionInProgress(true);
    let generateInvoiceResponse = await api('POST', getActionUrl(), generateInvoicePayload());
    if (generateInvoiceResponse.data.status !== 0) return alertHandler('Error', 'LBL_ERROR_GENERATING_INVOICE');
    let data = generateInvoiceResponse.data.data;
    if (data && checkFlashOrError(data)) return alertHandler('Error', 'LBL_ERROR_SAVING_SUPPLIER_ARRIVAL');

    let context = data[0]?.view?.context || null;
    let id = context['_showRecord'] || null;

    if (id) {
      setParentSaveDone(true);
      setInvoiceID(id);
      setOnSuccessFn('invoiceGenerate');
    } else {
      alertHandler('Error', 'LBL_ERROR_GENERATING_INVOICE');
    }
  };

  const reverseMovePayload = action => {
    let payload = {
      model: MODELS.STOCK_MOVE,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: MODELS.STOCK_MOVE,
          _isReversion: data.isReversion,
          _id: null,
          _typeSelect: data._typeSelect,
          invoiceSet: data.invoiceSet,
          estimatedDate: data.estimatedDate,
          typeSelect: data.typeSelect,
          toAddress: null,
          id: data.id,
          isWithReturnSurplus: true,
          version: data.version,
          isReversion: data.isReversion,
          backorderId: data.backorderId,
          originId: data.originId,
          toStockLocation: data.toStockLocation,
          company: data.company,
          fromAddress: data.fromAddress,
          cancelReason: null,
          fromStockLocation: data.fromStockLocation,
          originTypeSelect: data.originTypeSelect,
          exTaxTotal: exTaxTotal,
          reversionOriginStockMove: null,
          stockMoveSeq: data.stockMoveSeq,
          stockMoveLineList: data.stockMoveLineList,
          statusSelect: data.statusSelect,
          partner: data.partner,
          isWithBackorder: true,
          _signal: 'generateReversionBtn',
          _source: 'generateReversionBtn',
        },
      },
    };
    return payload;
  };

  const reverseStockMove = async () => {
    setActionInProgress(true);
    let action = 'save,action-stock-move-method-generate-reversion';
    let reverseMoveResponse = await api('POST', getActionUrl(), reverseMovePayload(action));
    if (reverseMoveResponse.data.status !== 0) return alertHandler('Error', 'LBL_ERROR_REVERSING_MOVE');
    let data = reverseMoveResponse.data.data;
    if (data && checkFlashOrError(data)) return alertHandler('Error', 'LBL_ERROR_REVERSING_MOVE');

    let actionTwo = 'action-stock-move-method-generate-reversion';
    let reverseMoveTwoResponse = await api('POST', getActionUrl(), reverseMovePayload(actionTwo));
    if (reverseMoveTwoResponse.data.status !== 0) return alertHandler('Error', 'LBL_ERROR_REVERSING_MOVE');
    data = reverseMoveTwoResponse.data.data;
    if (data && checkFlashOrError(data)) return alertHandler('Error', 'LBL_ERROR_REVERSING_MOVE');

    let context = data[0]?.view?.context || null;
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
          id: data.id,
          cancelReason: cancelReason,
          version: data.version,
          _signal: 'cancelConfirmBtn',
          _source: 'cancelConfirmBtn',
        },
      },
    };
    return payload;
  };

  const cancelMove = async () => {
    let cancelMoveResponse = await api('POST', getActionUrl(), cancelMovePayload());
    if (cancelMoveResponse.data.status !== 0) return alertHandler('Error', 'LBL_ERROR_CANCELLING_MOVE');
    let data = cancelMoveResponse.data.data;
    if (data && checkFlashOrError(data)) return alertHandler('Error', 'LBL_ERROR_CANCELLING_MOVE');

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

  const updatePartnerAddress = partner => {
    if (partner && partner.partnerAddressList) {
      setSelectedFromAddress(partner.partnerAddressList[0].address);
    } else {
      setSelectedFromAddress(null);
    }
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
              modelKey="SUPPLIERS"
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
              disabled={!addNew}
              onSuccess={onPartnersSuccess}
              defaultValueConfig={null}
              isRequired={enableEdit && data.statusSelect < 2}
              selectIdentifier="fullName"
              extraFields={['partnerAddressList']}
              selectCallback={partner => {
                updatePartnerAddress(partner);
              }}
            />
          </div>
          <div className="col-md-6">
            <SearchModalAxelor
              formik={formik}
              modelKey="TO_STOCK_LOCATIONS"
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
              onSuccess={onStockLocationsSuccess}
              defaultValueConfig={null}
              selectIdentifier="name"
              payloadDomain={stockLocationDomain}
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
              disabled={(!addNew && !enableEdit) || (enableEdit && data.statusSelect > 2)}
              isRequired={enableEdit && data.statusSelect <= 2}
            />
          </div>
          <div className="col-md-6">
            <DateInput
              formik={formik}
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
              label="LBL_POSTING_DATE"
              accessor="stockMoveDate"
              disabled={(!addNew && !enableEdit) || (enableEdit && data.statusSelect > 2)}
              isRequired={enableEdit && data.statusSelect <= 2}
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

      {!addNew && (
        <Tabs
          {...tabsProps}
          tabsList={[
            { accessor: 'sa-lines', label: 'LBL_SUPPLIER_ARRIVALS_LINES' },
            { accessor: 'returns', label: 'LBL_SUPPLIER_RETURNS', isHidden: data.statusSelect < 3 },
          ]}
        >
          <StockMoveLines
            accessor="sa-lines"
            addNew={addNew}
            enableEdit={enableEdit}
            data={data}
            stockMoveLineList={stockMoveLineList}
            setStockMoveLineList={setStockMoveLineList}
            formik={formik}
            tableTitle="LBL_SUPPLIER_ARRIVALS_LINES"
            modalHeader="LBL_INCOMING_LINE"
            setIsLoading={setIsLoading}
          />
          <StockReturns accessor="returns" tableTitle="LBL_SUPPLIER_RETURNS" stockMove={data} />
        </Tabs>
      )}
      {!addNew && data?.originId && <OriginCard formik={formik} stockMove={data} />}
      <AttachmentInput
        mode={addNew ? 'add' : enableEdit && data?.statusSelect < 3 ? 'edit' : 'view'}
        modelKey={MODELS.STOCK_MOVE}
        alertHandler={alertHandler}
        fetchedObj={data || null}
        parentSaveDone={parentSaveDone}
        feature={subFeature}
        navigationParams={{ id: data?.id }}
        onSuccessFn={
          onSuccessFn === 'save'
            ? () => finishedSaveHandler('success')
            : onSuccessFn === 'realizeExcess'
              ? () => finishedRealizeHandler('success', 'LBL_PARTIAL_STOCK_MOVE_GENERATED_FOR_EXCESS')
              : onSuccessFn === 'realizeRemaining'
                ? () => finishedRealizeHandler('success', 'LBL_PARTIAL_STOCK_MOVE_GENERATED_FOR_REMAINING')
                : onSuccessFn === 'realize'
                  ? () => finishedRealizeHandler('success')
                  : onSuccessFn === 'invoiceGenerate'
                    ? () => finishedInvoiceGenerateHandler('success', invoiceID)
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

export default SupplierArrivalsForm;
