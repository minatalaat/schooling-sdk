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
import { useFormikSubmit } from '../../../hooks/useFormikSubmit';

const SupplierReturnsForm = ({
  enableEdit,
  data,
  addNew,
  isSave,
  isPlanStockMove,
  isRealizeStockMove,
  isCancelMove,
  cancelReason,
  finishedSaveHandler,
  finishedPlanHandler,
  finishedRealizeHandler,
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
  noAvailableQty,
  setNoAvailableQty,
}) => {
  const mode = addNew ? 'add' : enableEdit ? 'edit' : 'view';
  const subFeature = 'SUPPLIER_RETURNS';
  const { api } = useAxiosFunction();
  const tabsProps = useTabs();
  const { t } = useTranslation();

  const [selectedFromAddress, setSelectedFromAddress] = useState(null);

  const [parentSaveDone, setParentSaveDone] = useState(false);
  const [fetchedObject, setFetchedObject] = useState(false);
  const [onSuccessFn, setOnSuccessFn] = useState();

  let company = useSelector(state => state.userFeatures.companyInfo.company);
  let exTaxTotal = useSelector(state => state.stockMoveLines.exTaxTotal);

  const newDate = getDateAfterXDays(7);

  const initialValues = {
    reference: data?.stockMoveSeq || '',
    partner: data?.partner || null,
    estimatedDate: data?.estimatedDate || '',
    toAddress: data?.toAddress || null,
    stockLocation: data?.fromStockLocation || null,
    originFullName: '',
    originType: '',
    orderDate: '',
    typeSelect: t(STOCK_MOVE_TYPE[2]),
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

    if (isPlanStockMove) {
      planRecord();
    }

    if (isDelete) {
      deleteRecord();
    }

    if (isRealizeStockMove) {
      realizeRecord();
    }

    if (isCancelMove) {
      cancelMove();
    }
  }, [isSave, isDelete, addNew, enableEdit, isRealizeStockMove, isPlanStockMove, isCancelMove]);

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
          _isReversion: true,
          _id: null,
          _newDate: newDate,
          _typeSelect: 2,
          typeSelect: 2,
          isReversion: true,
          statusSelect: data?.statusSelect,
          isWithBackorder: false,
          isWithReturnSurplus: false,
          'toStockLocation.typeSelect': 1,
          fromStockLocation: formik.values.stockLocation,
          toStockLocation: null,
          estimatedDate: formik.values.estimatedDate,
          partner: formik.values.partner,
          toAddress: null,
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
          _isReversion: true,
          _id: null,
          _newDate: newDate,
          _typeSelect: 2,
          typeSelect: 2,
          isReversion: true,
          statusSelect: data?.statusSelect,
          isWithBackorder: false,
          isWithReturnSurplus: false,
          fromStockLocation: formik.values.stockLocation,
          toStockLocation: null,
          estimatedDate: formik.values.estimatedDate,
          partner: formik.values.partner,
          toAddress: null,
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
        stockMoveLineList: stockMoveLineList,
        isWithBackorder: false,
        isWithReturnSurplus: false,
        _original: data,
      },
    };
    addObjectToChanges('fromStockLocation', payload.data, data.fromStockLocation, formik.values.stockLocation);
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
    if (saveDateResponse.data.status !== 0) return alertHandler('Error', 'LBL_ERROR_SAVING_SUPPLIER_RETURN');

    let saveActionResponse = await api('POST', getActionUrl(), getSaveActionPayload());
    if (saveActionResponse.data.status !== 0) return alertHandler('Error', 'LBL_ERROR_SAVING_SUPPLIER_RETURN');
    let data = saveActionResponse.data.data;
    if (data && checkFlashOrError(data)) return alertHandler('Error', 'LBL_ERROR_SAVING_SUPPLIER_RETURN');

    let saveActionOneResponse = await api('POST', getActionUrl(), getSaveActionOnePayload());
    if (saveActionOneResponse.data.status !== 0) return alertHandler('Error', 'LBL_ERROR_SAVING_SUPPLIER_RETURN');
    data = saveActionOneResponse.data.data;
    if (data && checkFlashOrError(data)) return alertHandler('Error', 'LBL_ERROR_SAVING_SUPPLIER_RETURN');

    let saveModelResponse = await api('POST', getModelUrl(MODELS.STOCK_MOVE), getSaveModelPayload());
    if (saveModelResponse.data.status !== 0) return alertHandler('Error', 'LBL_ERROR_SAVING_SUPPLIER_RETURN');
    setFetchedObject(saveModelResponse?.data?.data[0]);
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
          _isReversion: true,
          _id: null,
          _typeSelect: data.typeSelect,
          invoiceSet: data.invoiceSet,
          estimatedDate: formik.values.estimatedDate,
          typeSelect: data.typeSelect,
          toAddress: data.toAddress,
          id: data.id,
          isWithReturnSurplus: false,
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
          isWithBackorder: false,
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
    if (noAvailableQty.length > 0) return alertHandler('Error', 'LBL_QUANTITY_MORETHAN_AVAIABLE_IN_STOCK');

    const isValid = await validateFormForSubmit();
    if (!isValid) return null;

    setActionInProgress(true);
    let saveDateResponse = await api('POST', getModelUrl(MODELS.STOCK_MOVE_ADDITIONAL_DATA), getSaveDateModelPayload());
    if (saveDateResponse.data.status !== 0) return alertHandler('Error', 'LBL_ERROR_REALIZING_SUPPLIER_RETURN');

    let action = 'action-group-stock-stockmove-realize-click';
    let realizeActionResponse = await api('POST', getActionUrl(), getRealizePayload(action, stockMoveLineList));
    if (realizeActionResponse.data.status !== 0) return alertHandler('Error', 'LBL_ERROR_REALIZING_SUPPLIER_RETURN');
    let responseData = realizeActionResponse.data.data;
    if (responseData && checkFlashOrError(responseData)) return alertHandler('Error', 'LBL_ERROR_REALIZING_SUPPLIER_RETURN');

    let verifyResponse = await api('POST', getVerifyUrl(MODELS.STOCK_MOVE), verifyPayload());
    if (verifyResponse.data.status !== 0) return alertHandler('Error', 'LBL_ERROR_REALIZING_SUPPLIER_RETURN');
    let verifyResponseData = verifyResponse.data.data;
    if (verifyResponseData && checkFlashOrError(verifyResponseData)) return alertHandler('Error', 'LBL_ERROR_REALIZING_SUPPLIER_RETURN');

    let saveModelResponse = await api('POST', getModelUrl(MODELS.STOCK_MOVE), getSaveModelPayload());
    if (saveModelResponse.data.status !== 0) return alertHandler('Error', 'LBL_ERROR_REALIZING_SUPPLIER_RETURN');

    await fetchMove(saveModelResponse?.data?.data?.[0]?.id);

    let actionOne = 'action-group-stock-stockmove-realize-click[1]';
    let realizeActionOneResponse = await api('POST', getActionUrl(), getRealizePayload(actionOne, getStockMoveLineListIDs()));
    let realizeResponseStatus = realizeActionOneResponse.data.status;
    let realizeActionOneData = realizeActionOneResponse?.data?.data;

    if (realizeResponseStatus !== 0) return alertHandler('Error', 'LBL_ERROR_REALIZING_SUPPLIER_RETURN');

    if (
      realizeActionOneData &&
      checkFlashOrError(realizeActionOneData) &&
      (realizeActionOneData[0]?.flash === 'SMI-003' || realizeActionOneData[0]?.error === 'SMI-003')
    )
      return alertHandler('Error', 'LBL_NO_REMAINING_QTY_TO_REALIZE');

    if (realizeActionOneData && checkFlashOrError(realizeActionOneData) && realizeActionOneData?.[0]?.error === 'SPC-003') {
      return alertHandler('Error', 'LBL_QUANTITY_MORETHAN_AVAIABLE_IN_STOCK');
    }

    if (realizeActionOneData && checkFlashOrError(realizeActionOneData) && realizeActionOneData?.[0]?.error === 'SPC-018') {
      return alertHandler('Error', 'LBL_ERROR_NO_AVAILABLE_PERIOD');
    }

    if (
      realizeActionOneData &&
      checkFlashOrError(realizeActionOneData) &&
      realizeActionOneData?.[0]?.error?.includes('This period is closed')
    ) {
      return alertHandler('Error', 'LBL_ERROR_PERIOD_CLOSED');
    }

    if (
      realizeActionOneData &&
      checkFlashOrError(realizeActionOneData) &&
      realizeActionOneData[0]?.error?.includes('are not in sufficient quantity')
    ) {
      return alertHandler('Error', 'LBL_QUANTITY_MORETHAN_AVAIABLE_IN_STOCK');
    }

    if (realizeActionOneData && checkFlashOrError(realizeActionOneData))
      return alertHandler('Error', 'LBL_ERROR_REALIZING_SUPPLIER_RETURN');

    if (
      realizeActionOneData &&
      checkFlashOrError(realizeActionOneData) &&
      realizeActionOneData[0]?.error?.includes('are not in sufficient quantity')
    ) {
      return alertHandler('Error', 'LBL_QUANTITY_MORETHAN_AVAIABLE_IN_STOCK');
    }

    if (realizeActionOneData && checkFlashOrError(realizeActionOneData))
      return alertHandler('Error', 'LBL_ERROR_REALIZING_SUPPLIER_RETURN');

    if (realizeActionOneData?.[0]?.view?.title?.includes('Manage backorder')) {
      let realizeResponse = await api('POST', getActionUrl(), getActionRealizePayload());
      if (realizeResponse.data.status !== 0) return alertHandler('Error', 'LBL_ERROR_REALIZING_SUPPLIER_RETURN');
    }

    setParentSaveDone(true);
    setOnSuccessFn('realize');
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

  const getPlanPayload = (action, lines) => {
    let payload = {
      model: MODELS.STOCK_MOVE,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: MODELS.STOCK_MOVE,
          _isReversion: true,
          _id: null,
          _typeSelect: data.typeSelect,
          invoiceSet: data.invoiceSet,
          estimatedDate: formik.values.estimatedDate,
          typeSelect: data.typeSelect,
          toAddress: data.toAddress,
          id: data.id,
          isWithReturnSurplus: false,
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
          isWithBackorder: false,
          _signal: 'planBtn',
          _source: 'planBtn',
        },
      },
    };
    return payload;
  };

  const planRecord = async () => {
    const isValid = await validateFormForSubmit();
    if (!isValid) return null;

    setActionInProgress(true);
    let saveDateResponse = await api('POST', getModelUrl(MODELS.STOCK_MOVE_ADDITIONAL_DATA), getSaveDateModelPayload());
    if (saveDateResponse.data.status !== 0) return alertHandler('Error', 'LBL_ERROR_PLANNING_SUPPLIER_RETURN');

    let action = 'action-group-stock-stockmove-plan-click';
    let planActionResponse = await api('POST', getActionUrl(), getPlanPayload(action, stockMoveLineList));
    if (planActionResponse.data.status !== 0) return alertHandler('Error', 'LBL_ERROR_PLANNING_SUPPLIER_RETURN');
    let data = planActionResponse.data.data;
    if (data && checkFlashOrError(data)) return alertHandler('Error', 'LBL_ERROR_PLANNING_SUPPLIER_RETURN');

    let verifyResponse = await api('POST', getVerifyUrl(MODELS.STOCK_MOVE), verifyPayload());
    if (verifyResponse.data.status !== 0) return alertHandler('Error', 'LBL_ERROR_PLANNING_SUPPLIER_RETURN');
    data = verifyResponse.data.data;
    if (data && checkFlashOrError(data)) return alertHandler('Error', 'LBL_ERROR_PLANNING_SUPPLIER_RETURN');

    let saveModelResponse = await api('POST', getModelUrl(MODELS.STOCK_MOVE), getSaveModelPayload());
    if (saveModelResponse.data.status !== 0) return alertHandler('Error', 'LBL_ERROR_PLANNING_SUPPLIER_RETURN');

    await fetchMove(saveModelResponse?.data?.data?.[0]?.id);

    let actionOne = 'action-group-stock-stockmove-plan-click[1]';
    let planActionOneResponse = await api('POST', getActionUrl(), getPlanPayload(actionOne, getStockMoveLineListIDs()));
    if (planActionOneResponse.data.status !== 0) return alertHandler('Error', 'LBL_ERROR_PLANNING_SUPPLIER_RETURN');
    data = planActionOneResponse.data.data;
    if (data && checkFlashOrError(data)) return alertHandler('Error', 'LBL_ERROR_PLANNING_SUPPLIER_RETURN');

    let actionTwo = 'action-group-stock-stockmove-plan-click[2]';
    let planActionTwoResponse = await api('POST', getActionUrl(), getPlanPayload(actionTwo, getStockMoveLineListIDs()));
    if (planActionTwoResponse.data.status !== 0) return alertHandler('Error', 'LBL_ERROR_PLANNING_SUPPLIER_RETURN');
    data = planActionTwoResponse.data.data;
    if (data && checkFlashOrError(data)) return alertHandler('Error', 'LBL_ERROR_PLANNING_SUPPLIER_RETURN');

    setFetchedObject(saveModelResponse?.data?.data[0]);
    setParentSaveDone(true);
    setOnSuccessFn('plan');
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
              isRequired={addNew}
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
              modelKey="FROM_STOCK_LOCATIONS"
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
        <Tabs {...tabsProps} tabsList={[{ accessor: 'sr-lines', label: 'LBL_SUPPLIER_RETURNS_LINES' }]}>
          <StockMoveLines
            accessor="sr-lines"
            addNew={addNew}
            enableEdit={enableEdit}
            data={data}
            stockMoveLineList={stockMoveLineList}
            setStockMoveLineList={setStockMoveLineList}
            formik={formik}
            tableTitle="LBL_SUPPLIER_RETURNS_LINES"
            modalHeader="LBL_OUTGOING_LINE"
            setIsLoading={setIsLoading}
            noAvailableQty={noAvailableQty}
            setNoAvailableQty={setNoAvailableQty}
          />
        </Tabs>
      )}
      {!addNew && data?.originId && <OriginCard formik={formik} stockMove={data} />}
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
            : onSuccessFn === 'plan'
              ? () => finishedPlanHandler('success')
              : onSuccessFn === 'realize'
                ? () => finishedRealizeHandler('success')
                : onSuccessFn === 'cancel'
                  ? () => finishedCancelMoveHandler('success')
                  : null
        }
      />
    </>
  );
};

export default SupplierReturnsForm;
