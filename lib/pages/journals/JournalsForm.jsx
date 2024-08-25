import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { v4 as uuidv4 } from 'uuid';

import SearchModalAxelor from '../../components/ui/inputs/SearchModal/SearchModalAxelor';
import TextInput from '../../components/ui/inputs/TextInput';
import TextArea from '../../components/ui/inputs/TextArea';
import DateInput from '../../components/ui/inputs/DateInput';
import MoveLines from './movelines/MoveLines';
import Totals from './Totals';
import FormNotes from '../../components/ui/FormNotes';

import { MODELS } from '../../constants/models';
import { useAxiosFunction } from '../../hooks/useAxios';
import { checkFlashOrError, getLastYearDate, getNextYearDate, checkIfDifferentObj, checkIfDifferentStr } from '../../utils/helpers';
import { VALID_TEXT_WITH_SPECIAL_CHARS } from '../../constants/regex/Regex';
import { setFieldValue } from '../../utils/formHelpers';
import { getActionUrl, getSearchUrl, getModelUrl, getVerifyUrl } from '../../services/getUrl';
import { MODES } from '../../constants/enums/FeaturesModes';
import { MOVELINES_SEARCH_FIELDS } from './JournalsPayloadsFields';

const JournalsForm = ({
  enableEdit,
  addNew,
  data,
  setFetchedData,
  isSave,
  isDelete,
  isAccountMove,
  isReverseMove,
  finishedSaveHandler,
  finishedDeleteHandler,
  finishedAccountHandler,
  finishedReverseHandler,
  alertHandler,
  setActionInProgress,
  setIsLoading,
  mode,
  totals,
  setTotalValues,
  addTotalsToPayload,
  reverseModalFormik,
  setIsModalLoading,
  setIsDateChange,
  targetRef,
}) => {
  const { api } = useAxiosFunction();
  const { t } = useTranslation();

  const initVals = {
    id: data?.id ?? null,
    reference: data?.reference ?? '',
    company: data?.company ?? null,
    period: data?.period ?? null,
    journal: data?.journal ?? null,
    date: data?.date ?? '',
    paymentMode: data?.paymentMode ?? null,
    description: data?.description ?? '',
    currency: data?.currency ?? null,
    accountingDate: data?.accountingDate ?? '',
    companyCurrency: data?.companyCurrency ?? null,
    partner: data?.partner ?? null,
    stockMove: data?.stockMove ?? '',
    moveLineList: data?.moveLineList ?? [],
  };

  const valSchema = Yup.object({
    reference: Yup.string(t('LBL_INVALID_VALUE')),
    company: Yup.object().nullable(),
    journal: Yup.object().nullable(),
    period: Yup.object().nullable(),
    currency: Yup.object().nullable(),
    date: Yup.date()
      .required(t('LBL_DATE_REQUIRED'))
      .min(getLastYearDate(), t('LBL_ERROR_MIN_DATE'))
      .max(getNextYearDate(), t('LBL_ERROR_MAX_DATE')),
    description: Yup.string()
      .matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS'))
      .trim()
      .min(1, t('SPACES_ONLY_VALIDATION_MESSAGE')),
    paymentMode: Yup.object().nullable(),
    accountingDate: Yup.date(),
  });

  const formik = useFormik({
    initialValues: initVals,
    validationSchema: valSchema,
    validateOnMount: addNew ? true : false,
  });

  useEffect(() => {
    if (isSave) {
      saveRecord();
    }

    if (isDelete) {
      deleteHandler();
    }

    if (isAccountMove) {
      accountRecord();
    }

    if (isReverseMove) {
      reverseHandler();
    }
  }, [isSave, isDelete, addNew, enableEdit, isReverseMove, isAccountMove]);

  const addFormikValuesToPayload = (object, periodResponse) => {
    object.journal = formik.values.journal ?? null;
    object.company = formik.values.company ?? null;
    object.companyCurrency = formik.values.companyCurrency ?? null;
    object.currency = formik.values.currency ?? null;
    object.period = periodResponse?.period || formik.values.period || null;
    object.date = formik.values.date ?? null;
    object.paymentMode = formik.values.paymentMode ?? null;
    object.partner = formik.values.partner ?? null;
    return object;
  };

  const getDateChangePayload = date => {
    let payload = {
      model: MODELS.MOVE,
      action: 'action-group-move-date-onchange',
      data: {
        criteria: [],
        context: {
          _model: MODELS.MOVE,
          _isActivateSimulatedMoves: null,
          _id: null,
          'period.statusSelect': 1,
          moveLineList: formik.values.moveLineList,
          validatePeriod: false,
          _source: 'date',
        },
      },
    };
    payload.data.context = addFormikValuesToPayload(payload.data.context);
    payload.data.context.date = date;
    payload.data.context.period = undefined;
    return payload;
  };

  const onDateChange = async () => {
    let tempDate = new Date(formik.values.date);

    if (tempDate >= getLastYearDate() || tempDate <= getNextYearDate()) {
      const response = await api('POST', getActionUrl(), getDateChangePayload(formik.values.date));
      let status = response?.data?.status;
      let responseData = response?.data?.data;

      if (status !== 0 || !responseData) {
        alertHandler('Error', 'LBL_ERROR_LOADING_DATE');
        return null;
      }

      if (responseData && checkFlashOrError(responseData)) {
        alertHandler('Error', 'LBL_ERROR_LOADING_DATE');
        return null;
      }

      if (responseData) {
        let period = responseData.find(el => el.values && 'period' in el.values)?.values?.period || null;
        let movelineList = responseData.find(el => el.values && 'moveLineList' in el.values)?.values?.moveLineList || [];

        if (period) {
          setFieldValue(formik, 'period', period);
        } else {
          setFieldValue(formik, 'date', '');
          setFieldValue(formik, 'period', null);
          alertHandler('Error', 'LBL_ERROR_NO_AVAILABLE_PERIOD');
          return null;
        }

        let moveLineListTemp = [];
        if (movelineList.length > 0) moveLineListTemp = updateDates(movelineList[0].date);

        return { period, moveLineList: moveLineListTemp };
      }
    }
  };

  const updateDates = date => {
    let tempLines = [...formik.values.moveLineList];
    tempLines.forEach(line => (line.date = date));
    setFieldValue(formik, 'moveLineList', tempLines);
    return tempLines;
  };

  const getOnSavePayload = periodResponse => {
    let payload = {
      model: MODELS.MOVE,
      action: 'action-account-move-group-onsave',
      data: {
        criteria: [],
        context: {
          _model: MODELS.MOVE,
          _id: null,
          statusSelect: 1,
          technicalOriginSelect: 1,
          journalTechnicalTypeSelect: 5,
          moveLineList: periodResponse?.moveLineList || formik.values.moveLineList,
        },
      },
    };
    payload.data.context = addFormikValuesToPayload(payload.data.context, periodResponse);
    payload.data.context = addTotalsToPayload(payload.data.context);
    return payload;
  };

  const getOnSaveModelPayload = periodResponse => {
    let payload = {
      data: {
        statusSelect: 1,
        technicalOriginSelect: 1,
        moveLineList: periodResponse?.moveLineList || formik.values.moveLineList,
        _original: null,
        id: data?.id ?? null,
        version: data?.version ?? undefined,
      },
    };
    if (mode === MODES.ADD) payload.data = addFormikValuesToPayload(payload.data, periodResponse);
    if (mode === MODES.EDIT) payload.data = addChangedFieldsToPayload(payload.data);
    return payload;
  };

  const getMoveLineSearchPayload = temp => {
    return {
      fields: MOVELINES_SEARCH_FIELDS,
      sortBy: null,
      data: {
        _domain: 'self.id in (:_field_ids)',
        _domainContext: {
          id: data?.id,
          _model: MODELS.MOVE,
          _field: 'moveLineList',
          _field_ids: temp,
        },
        _archived: true,
      },
      limit: -1,
      offset: 0,
      translate: true,
    };
  };

  const saveRecord = async () => {
    setActionInProgress(true);

    const res = await onDateChange();
    if (!res) return setActionInProgress(false);

    const saveActionResponse = await api('POST', getActionUrl(), getOnSavePayload(res));
    let status = saveActionResponse?.data?.status;
    let saveActionData = saveActionResponse?.data?.data;
    if (status !== 0 || !saveActionData || (saveActionData && checkFlashOrError(saveActionData))) return finishedSaveHandler('error');

    if (mode === MODES.EDIT) {
      const verifyResponse = await api('POST', getVerifyUrl(MODELS.MOVE), { data: { id: data?.id, version: data?.version } });
      let status = verifyResponse?.data?.status;
      if (status !== 0) return finishedSaveHandler('error');
    }

    const saveResponse = await api('POST', getModelUrl(MODELS.MOVE), getOnSaveModelPayload(res));
    let saveStatus = saveResponse?.data?.status;
    let saveData = saveResponse?.data?.data;
    if (saveStatus !== 0 || !saveData) return finishedSaveHandler('error');

    if (saveData && saveData[0]) {
      let move = saveData[0];
      setFetchedData(move);
      let temp = move.moveLineList.map(({ id }) => id);

      if (!move.moveLineList || move.moveLineList.length === 0) {
        const response = await api('POST', getActionUrl(), getOnSaveActionFivePayload(move.id, res));
        let responseStatus = response?.data?.status;
        let responseData = response?.data?.data;
        if (responseStatus !== 0 || (responseData && checkFlashOrError(responseData))) return finishedSaveHandler('error');
        return finishedSaveHandler('success');
      }

      const movelineResponse = await api('POST', getSearchUrl(MODELS.MOVELINE), getMoveLineSearchPayload(temp));
      let movelineStatus = movelineResponse?.data?.status;
      let movelineData = movelineResponse?.data?.data;
      let movelineTotal = movelineResponse?.data?.total;

      if (movelineStatus !== 0 || movelineTotal === undefined || movelineTotal === null || !movelineData) {
        return finishedSaveHandler('error');
      }

      if (movelineData) {
        let tempMoveLines = [];
        movelineData.forEach(moveLine => {
          let tempLine = { ...moveLine };
          tempLine.lineId = uuidv4();
          tempMoveLines.push(tempLine);
        });
        setFieldValue(formik, 'moveLineList', tempMoveLines);
        const response = await api('POST', getActionUrl(), getOnSaveActionFivePayload(move.id, res));
        let responseStatus = response?.data?.status;
        let responseData = response?.data?.data;
        if (responseStatus !== 0 || (responseData && checkFlashOrError(responseData))) return finishedSaveHandler('error');
        return finishedSaveHandler('success');
      }
    }
  };

  const getMoveLineListIDs = periodResponse => {
    let ListIDs = [];
    let ids = formik.values.moveLineList.map(line => line.id);

    if (periodResponse?.moveLineList) ids = periodResponse?.moveLineList.map(line => line.id);

    if (ids && ids.length > 0) {
      ids.forEach(id => {
        if (id) {
          ListIDs.push({ id: id, selected: 'false' });
        }
      });
    }

    return ListIDs;
  };

  const getOnSaveActionFivePayload = (id, periodResponse) => {
    let tempID = id ?? null;
    let payload = {
      model: MODELS.MOVE,
      action: 'action-account-move-group-onsave[5]',
      data: {
        criteria: [],
        context: {
          _model: MODELS.MOVE,
          _isActivateSimulatedMoves: null,
          _id: null,
          reference: formik.values.reference,
          id: tempID,
          statusSelect: 1,
          originDate: null,
          functionalOriginSelect: 0,
          moveLineList: getMoveLineListIDs(periodResponse),
          technicalOriginSelect: 1,
          invoice: null,
          journalTechnicalTypeSelect: 5,
          validatePeriod: false,
        },
      },
    };
    payload.data.context = addFormikValuesToPayload(payload.data.context, periodResponse);
    payload.data.context = addTotalsToPayload(payload.data.context);
    return payload;
  };

  const addChangedFieldsToPayload = object => {
    let changedFields = getChangedMoveFields();
    object.date = changedFields.date ?? formik.values.date;
    object.description = changedFields.description ?? formik.values.description;
    object.currency = changedFields.currency ?? formik.values.currency;
    object.period = changedFields.period ?? formik.values.period;
    object.paymentMode = changedFields.paymentMode ?? formik.values.paymentMode;
    object.partner = changedFields.partner ?? formik.values.partner;
    return object;
  };

  const getChangedMoveFields = () => {
    let changedFields = {};

    if (checkIfDifferentObj(data.period, formik.values.period) === true) {
      changedFields.period = formik.values.period;
    }

    if (checkIfDifferentObj(data.currency, formik.values.currency) === true) {
      changedFields.currency = formik.values.currency;
    }

    if (checkIfDifferentStr(data.description, formik.values.description) === true) {
      changedFields.description = formik.values.description;
    }

    if (checkIfDifferentStr(data.date, formik.values.date) === true) {
      changedFields.date = formik.values.date;
    }

    if (checkIfDifferentObj(data.paymentMode, formik.values.paymentMode) === true) {
      changedFields.paymentMode = formik.values.paymentMode ?? null;
    }

    return changedFields;
  };

  const getOnAccountClickPayload = ({ isActionOne, moveLineList, id, periodResponse }) => {
    let currentAction = isActionOne ? 'action-account-move-group-accounting-click[1]' : 'action-account-move-group-accounting-click[2]';
    let payload = {
      model: MODELS.MOVE,
      action: currentAction,
      data: {
        criteria: [],
        context: {
          _model: MODELS.MOVE,
          _isActivateSimulatedMoves: null,
          _id: null,
          reference: formik.values.reference,
          journal: formik.values.journal,
          companyCurrency: formik.values.companyCurrency,
          company: formik.values.company,
          id: formik.values.id ?? id ?? null,
          functionalOriginSelect: 0,
          statusSelect: 1,
          moveLineList: moveLineList ?? getMoveLineListIDs(periodResponse),
          technicalOriginSelect: 1,
          journalTechnicalTypeSelect: 5,
        },
      },
    };

    if (mode === MODES.ADD) payload.data.context = addFormikValuesToPayload(payload.data.context, periodResponse);
    if (mode === MODES.EDIT) payload.data.context = addChangedFieldsToPayload(payload.data.context);
    payload.data.context = addTotalsToPayload(payload.data.context);
    return payload;
  };

  const accountRecord = async () => {
    if (parseInt(totals.difference) !== 0) return alertHandler('Error', 'LBL_ERROR_DIFFERENCE_EQUAL_THAN_ZERO');
    if (!formik.isValid) return alertHandler('Error', 'LBL_REQUIRED_FIELDS');

    setActionInProgress(true);

    const res = await onDateChange();
    if (!res) return setActionInProgress(false);

    const accountResponse = await api('POST', getActionUrl(), getOnAccountClickPayload({ isActionOne: true, periodResponse: res }));
    let accountStatus = accountResponse?.data?.status;
    let accountData = accountResponse?.data?.data;
    if (accountStatus !== 0 || (accountData && checkFlashOrError(accountData))) return finishedAccountHandler('error');

    const verifyResponse = await api('POST', getVerifyUrl(MODELS.MOVE), { data: { id: formik.values.id } });
    let verifyStatus = verifyResponse?.data?.status;
    if (verifyStatus !== 0) return finishedAccountHandler('error');

    const saveResponse = await api('POST', getModelUrl(MODELS.MOVE), getOnSaveModelPayload(res));
    let saveStatus = saveResponse?.data?.status;
    let saveData = saveResponse?.data?.data;
    if (saveStatus !== 0 || !saveData || !saveData[0]) return finishedAccountHandler('error');

    let linesIDs = saveData[0].moveLineList.map(({ id }) => id);
    const movelineResponse = await api('POST', getSearchUrl(MODELS.MOVELINE), getMoveLineSearchPayload(linesIDs));
    let movelineStatus = movelineResponse?.data?.status;
    let movelineData = movelineResponse?.data?.data;
    let movelineTotal = movelineResponse?.data?.total;

    if (movelineStatus !== 0 || movelineTotal === undefined || movelineTotal === null || !movelineData)
      return finishedAccountHandler('error');

    let tempMoveLines = [];
    movelineData.forEach(moveLine => {
      let tempLine = { ...moveLine };
      tempLine.lineId = uuidv4();
      tempMoveLines.push(tempLine);
    });
    const accountClickResponse = await api(
      'POST',
      getActionUrl(),
      getOnAccountClickPayload({ isActionOne: false, moveLineList: tempMoveLines, id: saveData[0].id })
    );
    let accountClickStatus = accountClickResponse?.data?.status;
    let accountClickData = accountClickResponse?.data?.data;
    if (accountClickStatus !== 0 || !accountClickData || !accountClickData[0] || (accountClickData && checkFlashOrError(accountClickData)))
      return finishedAccountHandler('error');

    return finishedAccountHandler('success');
  };

  const deleteMovePayload = () => {
    let payload = {
      model: MODELS.MOVE,
      action: 'action-move-method-delete-move',
      data: {
        criteria: [],
        context: {
          _model: MODELS.MOVE,
          _isActivateSimulatedMoves: null,
          _id: null,
          id: formik.values.id,
        },
      },
    };
    return payload;
  };

  const deleteHandler = async () => {
    setActionInProgress(true);
    const response = await api('POST', getActionUrl(), deleteMovePayload());
    setActionInProgress(false);
    let status = response?.data?.status;
    let responseData = response?.data?.data;
    if (status !== 0 || !responseData) return finishedDeleteHandler('error');

    if (responseData && checkFlashOrError(responseData)) {
      let flash = responseData[0].flash;

      if (flash && (flash.includes('Selected move') || flash.includes('Move has been removed'))) {
        return finishedDeleteHandler('success');
      }

      if (flash && flash.includes('Please select')) {
        return finishedDeleteHandler('error');
      }

      return finishedDeleteHandler('error');
    }

    return finishedDeleteHandler('success');
  };

  const getReversePayload = () => {
    let payload = {
      model: MODELS.MOVE,
      action: 'action-move-validate-check-date-of-reversion,action-move-method-generate-reverse-move',
      data: {
        criteria: [],
        context: {
          _model: MODELS.MOVE,
          _moveDate: formik.values.date,
          _id: formik.values.id,
          id: formik.values.id,
          isAutomaticReconcile: reverseModalFormik.values.autoReconcile,
          dateOfReversionSelect: parseInt(reverseModalFormik.values.dateOfReversionSelect),
          dateOfReversion: reverseModalFormik.values.dateOfReversion,
          isUnreconcileOriginalMove: reverseModalFormik.values.unReconsileOrginalMove,
          isHiddenMoveLinesInBankReconciliation: reverseModalFormik.values.hideMoveLines,
          isAutomaticAccounting: reverseModalFormik.values.autoAccounting,
        },
      },
    };
    return payload;
  };

  const reverseHandler = async () => {
    setIsModalLoading(true);
    const response = await api('POST', getActionUrl(), getReversePayload());
    let status = response?.data?.status;
    let reverseData = response?.data?.data;
    if (status !== 0 || (reverseData && checkFlashOrError(reverseData))) return finishedReverseHandler('error');
    let newID = reverseData?.[0]?.view?.context?.['_showRecord'] || null;
    return finishedReverseHandler('success', newID);
  };

  return (
    <>
      <div className="card" ref={targetRef} id="page-card">
        <div className="row">
          {mode !== MODES.ADD && (
            <div className="col-md-6">
              <TextInput formik={formik} label="LBL_REFERENCE" accessor="reference" mode="view" />
            </div>
          )}
          <div className="col-md-6">
            <SearchModalAxelor formik={formik} modelKey="JOURNALS" mode="view" defaultValueConfig={null} />
          </div>
        </div>
        <div className="row">
          <div className="col-md-3">
            <SearchModalAxelor formik={formik} modelKey="PERIODS" mode="view" defaultValueConfig={null} />
          </div>
          <div className="col-md-3">
            <DateInput formik={formik} label="LBL_POSTING_DATE" accessor="date" mode={mode} disabled={data?.statusSelect === 3} />
          </div>
          <div className="col-md-3">
            <DateInput formik={formik} label="LBL_TRANSACTION_DATE" accessor="accountingDate" mode="view" />
          </div>
          <div className="col-md-3">
            <SearchModalAxelor formik={formik} modelKey="CURRENCIES" mode="view" defaultValueConfig={null} />
          </div>
          {!data?.journal?.code.includes('FAJ') && !data?.journal?.code.includes('INJ') && (
            <div className="col-md-6">
              <SearchModalAxelor
                formik={formik}
                modelKey="PAYMENT_MODES"
                mode={mode}
                defaultValueConfig={null}
                disabled={data?.statusSelect === 3}
              />
            </div>
          )}
          {data?.statusSelect >= 3 && data?.journal?.code.includes('INJ') && (
            <div className="col-md-6">
              <TextInput formik={formik} label="LBL_STOCK_MOVE" accessor="stockMove" mode="view" />
            </div>
          )}
          <div className="col-md-6">
            <TextArea formik={formik} label="LBL_DESCRIPTION" accessor="description" mode={mode} disabled={data?.statusSelect === 3} />
          </div>
        </div>
        {mode !== MODES.VIEW && (
          <FormNotes
            notes={[
              {
                title: 'LBL_REQUIRED_NOTIFY',
                type: 3,
              },
            ]}
          />
        )}
        <MoveLines
          formik={formik}
          mode={data?.statusSelect === 3 ? 'view' : mode}
          hidePartnerColumn={data?.journal?.code.includes('FAJ') || data?.journal?.code.includes('INJ') ? true : false}
          addFormikValuesToPayload={addFormikValuesToPayload}
          addTotalsToPayload={addTotalsToPayload}
          setTotalValues={setTotalValues}
        />
      </div>
      <Totals totals={totals} />
    </>
  );
};

export default JournalsForm;
