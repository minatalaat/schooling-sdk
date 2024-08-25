import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import BRWarningPopup from '../../components/BRWarningPopup';
import ConfirmationPopup from '../../components/ConfirmationPopup';
import MoreAction from '../../parts/MoreAction';
import BreadCrumb from '../../components/ui/BreadCrumb';
import ActionsProgessBar from '../../parts/ActionsProgessBar';
import BackButton from '../../components/ui/buttons/BackButton';
import BalancesTable from './BalancesTable';
import BalancesRow from './BalancesRow';
import Calendar from '../../components/ui/Calendar';
import TextInput from '../../components/ui/inputs/TextInput';
import DateInput from '../../components/ui/inputs/DateInput';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';
import MoveLines from './MoveLines';
import ReconciliationLines from './ReconciliationLines';

import { useAxiosFunction } from '../../hooks/useAxios';
import { MODELS } from '../../constants/models';
import { getLastYearDate, getNextYearDate, checkFlashOrError } from '../../utils/helpers';
import { reconciliationLineActions } from '../../store/reconciliationLines';
import { RECONCILIATION_FIELDS, RECONCILIATION_LINES_FIELDS, MOVELINES_FIELDS } from './ReconciliationsPayloadsFields';
import { getSearchUrl, getActionUrl, getModelUrl, getFetchUrl, getVerifyUrl, getRemoveAllUrl } from '../../services/getUrl';
import { useFeatures } from '../../hooks/useFeatures';
import { setSelectedValues } from '../../utils/formHelpers';
import { alertsActions } from '../../store/alerts';

const EditBankReconciliation = ({ feature, subFeature }) => {
  const navigate = useNavigate();
  const { getFeaturePath } = useFeatures();
  const { t } = useTranslation();
  const { state } = useLocation();

  let validateFirstAction = 'action-group-bankreconciliation-validate-click';
  let statusBarItems = [
    {
      label: 'LBL_DRAFT',
      className: 'done',
    },
    {
      label: 'LBL_ACCOUNTED',
      className: 'default',
    },
  ];

  const { api } = useAxiosFunction();

  const url = window.location.href.split('/');
  const reconciliationID = parseInt(url[url.length - 1]);

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [reconciliationLinesIDs, setReconciliationLinesIDs] = useState([]);
  const [fetchedReconciliation, setFetchedReconciliation] = useState(null);

  let movelines = useSelector(state => state.reconciliationLines.movelines);
  let reconciliationLines = useSelector(state => state.reconciliationLines.reconciliationLines);
  const dispatch = useDispatch();

  const [currentMoveLines, setCurrentMoveLines] = useState([]);
  const [currentReconciliationLines, setCurrentReconciliationLines] = useState([]);
  const [currentLineSelected, setCurrentLineSelected] = useState(null);

  const [buttonClicked, setButtonClicked] = useState(false);
  const [disableSave, setDisableSave] = useState(false);

  const [showWarningPopup, setShowWarningPopup] = useState(false);
  const [validateClicked, setValidateClicked] = useState(false);

  const [showMoreAction, setShowMoreAction] = useState(false);
  const lastYearDate = getLastYearDate().toISOString().split('T')[0];

  const initValues = {
    label: '',
    company: '',
    currency: '',
    bankDetails: '',
    bankStatement: '',
    cashAccount: '',
    fromDate: '',
    toDate: '',
    journal: '',
    startingBalance: '',
    endingBalance: '',
    totalPaid: '',
    totalCashed: '',
    movesReconciledLineBalance: '',
    movesUnreconciledLineBalance: '',
    movesOngoingReconciledBalance: '',
    movesAmountRemainingToReconcile: '',
    movesTheoreticalBalance: '',
    statementReconciledLineBalance: '',
    statementUnreconciledLineBalance: '',
    statementOngoingReconciledBalance: '',
    statementAmountRemainingToReconcile: '',
    statementTheoreticalBalance: '',
    moveLineFromDate: '',
    moveLineToDate: '',
  };

  const valSchema = Yup.object().shape({
    label: Yup.string(),
    company: Yup.string(),
    currency: Yup.string(),
    bankDetails: Yup.string(),
    bankStatement: Yup.string(),
    cashAccount: Yup.string(),
    fromDate: Yup.date()
      .required(t('LBL_DATE_REQUIRED'))
      .min(lastYearDate, t('LBL_ERROR_MIN_DATE'))
      .max(getNextYearDate(), t('LBL_ERROR_MAX_DATE')),
    toDate: Yup.date()
      .required(t('LBL_DATE_REQUIRED'))
      .min(lastYearDate, t('LBL_ERROR_MIN_DATE'))
      .max(getNextYearDate(), t('LBL_ERROR_MAX_DATE')),
    moveLineFromDate: Yup.date().min(lastYearDate, t('LBL_ERROR_MIN_DATE')).max(Yup.ref('moveLineToDate'), t('LBL_ERROR_MAX_DATE')),
    moveLineToDate: Yup.date().min(Yup.ref('moveLineFromDate'), t('LBL_ERROR_MIN_DATE')).max(Yup.ref('toDate'), t('LBL_ERROR_MAX_DATE')),
    journal: Yup.string(),
    startingBalance: Yup.string(),
    endingBalance: Yup.string(),
    totalPaid: Yup.string(),
    totalCashed: Yup.string(),
    movesReconciledLineBalance: Yup.string(),
    movesUnreconciledLineBalance: Yup.string(),
    movesOngoingReconciledBalance: Yup.string(),
    movesAmountRemainingToReconcile: Yup.string(),
    movesTheoreticalBalance: Yup.string(),
    statementReconciledLineBalance: Yup.string(),
    statementUnreconciledLineBalance: Yup.string(),
    statementOngoingReconciledBalance: Yup.string(),
    statementAmountRemainingToReconcile: Yup.string(),
    statementTheoreticalBalance: Yup.string(),
  });

  const submit = values => {
    if (formik.isValid) {
      setButtonClicked(true);
      setDisableSave(true);
      saveReconciliation();
    } else {
      showErrorMessage('LBL_REQUIRED_FIELDS');
    }
  };

  const formik = useFormik({
    initialValues: initValues,
    validationSchema: valSchema,
    onSubmit: submit,
  });

  const showSuccessMessage = message => {
    setButtonClicked(false);
    dispatch(alertsActions.initiateAlert({ title: 'Success', message }));
    setTimeout(() => {
      setDisableSave(false);
    }, 3000);
  };

  const showErrorMessage = message => {
    setButtonClicked(false);
    setDisableSave(false);
    dispatch(alertsActions.initiateAlert({ title: 'Error', message }));
  };

  useEffect(() => {
    dispatch(reconciliationLineActions.setReconciliationLines({ lines: [] }));
    dispatch(reconciliationLineActions.setMovelines({ lines: [] }));
    fetchReconciliation();
  }, []);

  useEffect(() => {
    setCurrentReconciliationLines(reconciliationLines);
  }, [reconciliationLines]);

  useEffect(() => {
    setCurrentMoveLines(movelines);
  }, [movelines]);

  useEffect(() => {
    if (fetchedReconciliation && reconciliationLinesIDs?.length > 0) {
      setButtonClicked(true);
      getBankReconciliationLines();
    }
  }, [fetchedReconciliation, reconciliationLinesIDs]);

  // FETCH RECONCILIATION
  const fetchReconciliationPayload = () => {
    let payload = {
      fields: RECONCILIATION_FIELDS,
      related: {},
    };
    return payload;
  };

  const fetchReconciliation = async () => {
    setButtonClicked(true);
    const response = await api('POST', getFetchUrl(MODELS.BANK_RECONCILIATION, reconciliationID), fetchReconciliationPayload());
    let status = response.data.status;
    let data = response.data.data;
    if (status !== 0 || !data) return showErrorMessage('LBL_ERROR_LOADING_BANK_RECONCILIATION');

    if (data) {
      let reconciliation = data[0];
      setFetchedReconciliation(reconciliation);
      setSelectedValues(formik, {
        label: reconciliation.name,
        company: reconciliation.company?.name ?? '',
        currency: reconciliation.currency?.name ?? '',
        bankDetails: reconciliation.bankDetails?.fullName ?? '',
        bankStatement: reconciliation.bankStatement?.name ?? '',
        fromDate: reconciliation.fromDate,
        toDate: reconciliation.toDate,
        moveLineFromDate: formik.values.moveLineFromDate?.length > 0 ? formik.values.moveLineFromDate : reconciliation.fromDate,
        moveLineToDate: formik.values.moveLineToDate?.length > 0 ? formik.values.moveLineToDate : reconciliation.toDate,
        journal: reconciliation.journal?.name ?? '',
        cashAccount: reconciliation.cashAccount?.label ?? '',
        startingBalance: reconciliation.startingBalance,
        endingBalance: reconciliation.endingBalance,
        totalPaid: reconciliation.totalPaid,
        totalCashed: reconciliation.totalCashed,
        movesReconciledLineBalance: reconciliation.movesReconciledLineBalance,
        movesUnreconciledLineBalance: reconciliation.movesUnreconciledLineBalance,
        movesOngoingReconciledBalance: reconciliation.movesOngoingReconciledBalance,
        movesAmountRemainingToReconcile: reconciliation.movesAmountRemainingToReconcile,
        movesTheoreticalBalance: reconciliation.movesTheoreticalBalance,
        statementReconciledLineBalance: reconciliation.statementReconciledLineBalance,
        statementUnreconciledLineBalance: reconciliation.statementUnreconciledLineBalance,
        statementOngoingReconciledBalance: reconciliation.statementOngoingReconciledBalance,
        statementAmountRemainingToReconcile: reconciliation.statementAmountRemainingToReconcile,
        statementTheoreticalBalance: reconciliation.statementTheoreticalBalance,
      });
      let tempIDs = [];
      reconciliation.bankReconciliationLineList.map(line => tempIDs.push(line.id));
      if (tempIDs.length === 0) {
        setButtonClicked(true);
        loadBankStatementActionOne();
      } else setReconciliationLinesIDs(tempIDs);
    }
  };

  const getReconciliationLinesPayload = () => {
    let payload = {
      fields: RECONCILIATION_LINES_FIELDS,
      sortBy: ['effectDate', 'postedNbr'],
      data: {
        _domain: 'self.id in (:_field_ids)',
        _domainContext: {
          id: reconciliationID,
          _model: MODELS.BANK_RECONCILIATION,
          _field: 'bankReconciliationLineList',
          _field_ids: reconciliationLinesIDs,
        },
        _archived: true,
      },
      limit: -1,
      offset: 0,
      translate: true,
    };
    return payload;
  };

  const getBankReconciliationLines = async () => {
    const response = await api('POST', getSearchUrl(MODELS.BANK_RECONCILIATION_LINE), getReconciliationLinesPayload());
    let status = response.data.status;
    let total = response.data.total;
    let data = response.data.data;
    if (status !== 0 || total === undefined || total === null) return showErrorMessage('LBL_ERROR_LOADING_BANK_RECONCILIATION');

    if (data) {
      dispatch(reconciliationLineActions.setReconciliationLines({ lines: data }));
      getMoveLines();
    }
  };

  const getMovelinesPayload = () => {
    let payload = {
      fields: MOVELINES_FIELDS,
      sortBy: ['date', 'postedNbr'],
      data: {
        _domain:
          '(self.date >= :fromDate OR self.dueDate >= :fromDate) AND (self.date <= :toDate OR self.dueDate <= :toDate) AND self.move.statusSelect = 3 AND self.move.company = :company AND ((self.debit > 0 AND self.bankReconciledAmount < self.debit) OR (self.credit > 0 AND self.bankReconciledAmount < self.credit)) AND self.account = :cashAccount',
        _domainContext: {
          fromDate: formik.values.moveLineFromDate,
          toDate: formik.values.moveLineToDate,
          statusSelect: 3,
          company: fetchedReconciliation.company,
          cashAccount: fetchedReconciliation.cashAccount,
          currency: fetchedReconciliation.currency,
          id: reconciliationID,
          _model: MODELS.BANK_RECONCILIATION,
        },
        _domainAction: 'action-bank-reconciliation-method-show-unreconciled-move-lines',
        operator: 'and',
        criteria: [],
      },
      limit: -1,
      offset: 0,
      translate: true,
    };
    return payload;
  };

  const getMoveLines = async () => {
    const moveLinesResponse = await api('POST', getSearchUrl(MODELS.MOVELINE), getMovelinesPayload());
    let status = moveLinesResponse.data.status;
    let total = moveLinesResponse.data.total;
    let moveLines = moveLinesResponse.data.data;
    if (status !== 0 || total === undefined || total === null) return showErrorMessage('LBL_ERROR_LOADING_MOVE_LINES');

    setButtonClicked(false);

    if (moveLines) {
      dispatch(reconciliationLineActions.setMovelines({ lines: moveLines }));
    }
  };

  useEffect(() => {
    if (formik.values.moveLineFromDate?.length > 0 && formik.values.moveLineToDate?.length > 0) {
      const fromDate1 = Date.parse(formik.values.moveLineFromDate);
      const toDate1 = Date.parse(formik.values.moveLineToDate);
      const toDate2 = Date.parse(formik.values.toDate);
      const lastYear = Date.parse(lastYearDate);

      if (fromDate1 >= lastYear && fromDate1 <= toDate1 && toDate1 >= fromDate1 && toDate1 <= toDate2) getMoveLines();
    }
  }, [formik.values.moveLineFromDate, formik.values.moveLineToDate]);
  // END FETCH RECONCILIATION

  // LOAD BANK STATEMENT
  const getActionOnePayload = () => {
    let payload = {
      model: MODELS.BANK_RECONCILIATION,
      action: 'save,action-bank-reconciliation-method-load-bank-statement',
      data: {
        criteria: [],
        context: {
          _model: MODELS.BANK_RECONCILIATION,
          id: reconciliationID,
        },
      },
    };
    return payload;
  };

  const verifyReconciliationPayload = () => {
    let payload = {
      data: {
        id: reconciliationID,
      },
    };
    return payload;
  };

  const getActionTwoPayload = () => {
    let payload = {
      model: MODELS.BANK_RECONCILIATION,
      action: 'action-bank-reconciliation-method-load-bank-statement',
      data: {
        criteria: [],
        context: {
          _model: MODELS.BANK_RECONCILIATION,
          id: reconciliationID,
        },
      },
    };
    return payload;
  };

  const loadBankStatementActionOne = async () => {
    const response = await api('POST', getActionUrl(), getActionOnePayload());
    let status = response.data.status;
    if (status !== 0) return showErrorMessage('LBL_ERROR_LOADING_BANK_STATEMENT');

    const verifyResponse = await api('POST', getVerifyUrl(MODELS.BANK_RECONCILIATION), verifyReconciliationPayload());
    let verifyStatus = verifyResponse.data.status;
    if (verifyStatus !== 0) return showErrorMessage('LBL_ERROR_LOADING_BANK_STATEMENT');

    const actionResponse = await api('POST', getActionUrl(), getActionTwoPayload());
    let actionStatus = actionResponse.data.status;
    let actionData = actionResponse.data.data;
    if (actionStatus !== 0) return showErrorMessage('LBL_ERROR_LOADING_BANK_STATEMENT');

    if (actionData && checkFlashOrError(actionData)) {
      return showErrorMessage('LBL_ERROR_LOADING_BANK_STATEMENT');
    }

    if (actionData && state?.autoReconcile) {
      autoReconcile();
    } else {
      fetchReconciliation();
    }
  };
  // END LOAD BANK STATEMENT

  //  RECONCILIATION LINE SET SELECTED
  const setReconciliationLineSelectedPayload = line => {
    let payload = {
      model: MODELS.BANK_RECONCILIATION_LINE,
      action: 'action-bank-reconciliation-line-method-set-selected',
      data: {
        criteria: [],
        context: {
          _model: MODELS.BANK_RECONCILIATION_LINE,
          isSelectedBankReconciliation: line.isSelectedBankReconciliation,
          id: line.id,
          selected: true,
        },
      },
    };
    return payload;
  };

  const setReconciliationLineSelected = async line => {
    const response = await api('POST', getActionUrl(), setReconciliationLineSelectedPayload(line));
    let status = response.data.status;
    if (status !== 0) return showErrorMessage('LBL_ERROR_SELECTING_LINE');
    fetchReconciliation();
  };
  //  END RECONCILIATION LINE SET SELECTED

  //  MOVELINE SET SELECTED
  useEffect(() => {
    if (currentLineSelected) {
      setMoveLineSelected();
    }
  }, [currentLineSelected]);

  const setMoveLineSelectedPayload = () => {
    let payload = {
      model: MODELS.MOVELINE,
      action: 'action-move-line-method-set-selected,save,reload',
      data: {
        criteria: [],
        context: {
          _model: MODELS.MOVELINE,
          isSelectedBankReconciliation: currentLineSelected.isSelectedBankReconciliation,
          id: currentLineSelected.id,
          selected: true,
        },
      },
    };
    return payload;
  };

  const setMoveLineSelected = async () => {
    const response = await api('POST', getActionUrl(), setMoveLineSelectedPayload());
    let status = response.data.status;
    if (status !== 0) return showErrorMessage('LBL_ERROR_SELECTING_LINE');
    saveAndReloadMoveLines();
  };

  const saveAndReloadMoveLinesPayload = () => {
    let payload = {
      model: MODELS.MOVELINE,
      action: 'save,reload',
      data: {
        criteria: [],
        context: {
          _model: MODELS.MOVELINE,
          id: currentLineSelected.id,
          isSelectedBankReconciliation: currentLineSelected.isSelectedBankReconciliation,
          selected: true,
        },
      },
    };
    return payload;
  };

  const saveAndReloadMoveLines = async line => {
    const response = await api('POST', getActionUrl(), saveAndReloadMoveLinesPayload());
    let status = response.data.status;
    if (status !== 0) return showErrorMessage('LBL_ERROR_SELECTING_LINE');
    const reloadResponse = await api('POST', getActionUrl(), saveAndReloadMoveLinesPayload());
    let reloadStatus = reloadResponse.data.status;
    if (reloadStatus !== 0) return showErrorMessage('LBL_ERROR_SELECTING_LINE');
    fetchReconciliation();
  };

  //  END MOVELINE SET SELECTED

  // RECONCILE SELECTED
  const onReconcileSelectedOnePayload = () => {
    let payload = {
      model: MODELS.BANK_RECONCILIATION,
      action: 'save,action-bank-reconciliation-method-reconcile-selected',
      data: {
        criteria: [],
        context: {
          _model: MODELS.BANK_RECONCILIATION,
          id: reconciliationID,
        },
      },
    };
    return payload;
  };

  const onVerifyPayload = () => {
    let payload = {
      data: {
        id: reconciliationID,
      },
    };
    return payload;
  };

  const onReconcileSelectedTwoPayload = () => {
    let payload = {
      model: MODELS.BANK_RECONCILIATION,
      action: 'action-bank-reconciliation-method-reconcile-selected',
      data: {
        criteria: [],
        context: {
          _model: MODELS.BANK_RECONCILIATION,
          id: reconciliationID,
        },
      },
    };
    return payload;
  };

  const onReconcileSelectedOne = async () => {
    const reconcileOneResponse = await api('POST', getActionUrl(), onReconcileSelectedOnePayload());
    let status = reconcileOneResponse.data.status;
    if (status !== 0) return showErrorMessage('LBL_ERROR_RECONCILING_LINE');
    const verifyResponse = await api('POST', getVerifyUrl(MODELS.BANK_RECONCILIATION), onVerifyPayload());
    let verifyStatus = verifyResponse.data.status;
    if (verifyStatus !== 0) return showErrorMessage('LBL_ERROR_RECONCILING_LINE');
    const reconcileTwoResponse = await api('POST', getActionUrl(), onReconcileSelectedTwoPayload());
    let reconcileStatus = reconcileTwoResponse.data.status;
    if (reconcileStatus !== 0) return showErrorMessage('LBL_ERROR_RECONCILING_LINE');
    fetchReconciliation();
  };
  // END RECONCILE SELECTED

  // UNRECONCILE SELECTED
  const onUnReconcileSelectedOnePayload = () => {
    let payload = {
      model: MODELS.BANK_RECONCILIATION,
      action: 'save,action-bank-reconciliation-method-unreconcile',
      data: {
        criteria: [],
        context: {
          _model: MODELS.BANK_RECONCILIATION,
          _id: null,
          id: reconciliationID,
        },
      },
    };
    return payload;
  };

  const onUnReconcileSelectedTwoPayload = () => {
    let payload = {
      model: MODELS.BANK_RECONCILIATION,
      action: 'action-bank-reconciliation-method-unreconcile',
      data: {
        criteria: [],
        context: {
          _model: MODELS.BANK_RECONCILIATION,
          _id: null,
          id: reconciliationID,
        },
      },
    };
    return payload;
  };

  const onUnReconcileSelectedOne = async () => {
    const response = await api('POST', getActionUrl(), onUnReconcileSelectedOnePayload());
    let status = response.data.status;
    if (status !== 0) return showErrorMessage('LBL_ERROR_UNRECONCILING_LINE');
    const verifyResponse = await api('POST', getVerifyUrl(MODELS.BANK_RECONCILIATION), onVerifyPayload());
    let verifyStatus = verifyResponse.data.status;
    if (verifyStatus !== 0) return showErrorMessage('LBL_ERROR_UNRECONCILING_LINE');
    const unreconcileResponse = await api('POST', getActionUrl(), onUnReconcileSelectedTwoPayload());
    let unreconcileStatus = unreconcileResponse.data.status;
    if (unreconcileStatus !== 0) return showErrorMessage('LBL_ERROR_UNRECONCILING_LINE');
    fetchReconciliation();
  };
  // END UNRECONCILE SELECTED

  const autoReconcilePayload = () => {
    let payload = {
      model: MODELS.BANK_RECONCILIATION,
      action: 'action-bank-reconciliation-method-automatic-reconciliation',
      data: {
        criteria: [],
        context: {
          _model: MODELS.BANK_RECONCILIATION,
          _id: null,
          id: reconciliationID,
        },
      },
    };
    return payload;
  };

  const autoReconcile = async () => {
    setButtonClicked(true);
    const response = await api('POST', getActionUrl(), autoReconcilePayload());
    let status = response.data.status;
    if (status !== 0) return showErrorMessage('LBL_ERROR_ON_AUTO_RECONCILIATION');
    setButtonClicked(false);
    fetchReconciliation();
  };

  const computeBalanceFirstActionPayload = () => {
    let payload = {
      model: MODELS.BANK_RECONCILIATION,
      action: 'save,action-bank-reconciliation-method-compute-balances',
      data: {
        criteria: [],
        context: {
          _model: MODELS.BANK_RECONCILIATION,
          _id: null,
          id: reconciliationID,
        },
      },
    };
    return payload;
  };

  const computeBalanceSecondActionPayload = () => {
    let payload = {
      model: MODELS.BANK_RECONCILIATION,
      action: 'action-bank-reconciliation-method-compute-balances',
      data: {
        criteria: [],
        context: {
          _model: MODELS.BANK_RECONCILIATION,
          _id: null,
          id: reconciliationID,
        },
      },
    };
    return payload;
  };

  const computeBalanceFirstAction = async () => {
    const response = await api('POST', getActionUrl(), computeBalanceFirstActionPayload());
    let status = response.data.status;
    let data = response.data.data;
    if (status !== 0) return showErrorMessage('LBL_ERROR_COMPUTING_BALANCES');

    if (data && checkFlashOrError(data)) {
      return showErrorMessage('LBL_ERROR_COMPUTING_BALANCES');
    }

    if (data) {
      const actionResponse = await api('POST', getActionUrl(), computeBalanceSecondActionPayload());
      let status = actionResponse.data.status;
      let actionData = actionResponse.data.data;
      if (status !== 0) return showErrorMessage('LBL_ERROR_COMPUTING_BALANCES');

      if (actionData && checkFlashOrError(actionData)) {
        return showErrorMessage('LBL_ERROR_COMPUTING_BALANCES');
      }

      if (actionData && actionData[0]) {
        fetchReconciliation();
      }
    }
  };

  const getUnpostedLines = lines => {
    let unposted = [];
    lines.forEach(line => {
      if (!line.postedNbr || line.postedNbr.length === 0) {
        unposted.push({ name: line.name, id: line.id });
      }
    });
    return unposted;
  };

  // SAVE RECONCILIATION
  const onSaveReconciliationPayload = () => {
    let payload = {
      data: {
        id: reconciliationID,
      },
    };
    return payload;
  };

  const saveReconciliation = async () => {
    const response = await api('POST', getModelUrl(MODELS.BANK_RECONCILIATION), onSaveReconciliationPayload());
    let status = response.data.status;
    let data = response.data.data;
    if (status !== 0 || !data) return showErrorMessage('LBL_ERROR_SAVING_RECONCILIATION');

    if (data) {
      showSuccessMessage('LBL_RECONCILIATION_SAVED');
      setTimeout(() => {
        navigate(getFeaturePath(subFeature));
      }, 3000);
    }
  };

  // END SAVE RECONCILIATION

  // VALIDATE
  const validateReconciliationPayload = action => {
    let payload = {
      model: MODELS.BANK_RECONCILIATION,
      action: action,
      data: {
        criteria: [],
        context: {
          _model: MODELS.BANK_RECONCILIATION,
          _id: null,
          id: reconciliationID,
        },
      },
    };
    return payload;
  };

  const validateReconciliation = () => {
    setValidateClicked(true);
    let unpostedRecLines = getUnpostedLines(currentReconciliationLines);
    let unpostedMoveLines = getUnpostedLines(currentMoveLines);

    if (unpostedRecLines.length > 0 || unpostedMoveLines.length > 0) {
      if (unpostedRecLines.length > 0) return setShowWarningPopup(true);
      if (unpostedMoveLines.length > 0) return setShowWarningPopup(true);
    } else {
      onValidateHandler(validateFirstAction);
    }
  };

  const onValidateHandler = action => {
    setButtonClicked(true);
    setDisableSave(true);
    validateReconciliationAction(action);
  };

  const validateReconciliationAction = action => {
    api('POST', getActionUrl(), validateReconciliationPayload(action), onValidateReconciliationSuccess, {});
  };

  const onValidateReconciliationSuccess = response => {
    let status = response.data.status;
    let data = response.data.data;
    if (status !== 0 || !data) return showErrorMessage('LBL_ERROR_SAVING_RECONCILIATION');

    if (data) {
      if (data[0].pending && data[0].pending.length > 0) {
        validateReconciliationAction(data[0].pending);
      } else {
        onVerify();
      }
    }
  };

  const onVerifyReconciliationPayload = () => {
    let payload = {
      data: {
        id: reconciliationID,
      },
    };
    return payload;
  };

  const onVerify = async () => {
    const verifyResponse = await api('POST', getVerifyUrl(MODELS.BANK_RECONCILIATION), onVerifyReconciliationPayload());
    let status = verifyResponse.data.status;
    if (status !== 0) return showErrorMessage('LBL_ERROR_SAVING_RECONCILIATION');
    showSuccessMessage('LBL_RECONCILIATION_VALIDATED');
    setTimeout(() => {
      navigate(getFeaturePath(subFeature));
    }, 3000);
  };

  // END VALIDATE

  const getDeletePayload = () => {
    let payload = {
      records: [
        {
          id: reconciliationID,
        },
      ],
    };
    return payload;
  };

  const deleteReconciliationHandler = async () => {
    setButtonClicked(true);
    setDisableSave(true);
    const response = await api('POST', getRemoveAllUrl(MODELS.BANK_RECONCILIATION), getDeletePayload());
    let status = response.data.status;

    if (status === 0) {
      showSuccessMessage('LBL_BANK_RECONCILIATIONS_DELETED');
      setTimeout(() => {
        navigate(getFeaturePath(subFeature));
      }, 3000);
    } else {
      showErrorMessage('LBL_ERROR_DELETE_BANK_RECONCILIATIONS');
    }
  };

  const onReconciliationLineSelect = line => {
    setButtonClicked(true);
    setReconciliationLineSelected(line);
  };

  const onMoveLineSelect = line => {
    setButtonClicked(true);
    setCurrentLineSelected(line);
  };

  return (
    <>
      {buttonClicked && <div className="lodingpage"></div>}
      <div className="page-body">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <Calendar />
              <BreadCrumb feature={feature} subFeature={subFeature} modeText="LBL_EDIT_BANK_RECONCILIATION" />
            </div>
          </div>
          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{formik.values.label}</h4>
              </div>

              <div className="reverse-page float-end">
                <BackButton disabled={disableSave} />
                <PrimaryButton disabled={disableSave} onClick={() => submit()} />
                <PrimaryButton text="LBL_VALIDATE" disabled={disableSave} onClick={() => validateReconciliation(validateFirstAction)} />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <ActionsProgessBar
                feature={feature}
                subfeature={subFeature}
                viewHandler={() => {
                  navigate(getFeaturePath(subFeature, 'view', { id: reconciliationID }));
                }}
                deleteHandler={() => setShowDeletePopup(true)}
                setShowMoreAction={setShowMoreAction}
                statusBarItems={statusBarItems}
                currentStatusLabel={
                  fetchedReconciliation && fetchedReconciliation.statusSelect === 1
                    ? t('LBL_DRAFT')
                    : fetchedReconciliation && fetchedReconciliation.statusSelect === 2
                      ? t('LBL_ACCOUNTED')
                      : t('LBL_DRAFT')
                }
              />
              <div className="card">
                <div className="row">
                  <div className="col-md-4">
                    <TextInput formik={formik} label="LBL_LABEL_NAME" accessor="label" mode="view" />
                  </div>
                  <div className="col-md-4">
                    <TextInput formik={formik} label="LBL_COMPANY" accessor="company" mode="view" />
                  </div>
                  <div className="col-md-4">
                    <TextInput formik={formik} label="LBL_CURRENCY" accessor="currency" mode="view" />
                  </div>
                  <div className="col-md-4">
                    <TextInput formik={formik} label="LBL_BANK_DETAILS" accessor="bankDetails" mode="view" />
                  </div>
                  <div className="col-md-4">
                    <TextInput formik={formik} label="LBL_BANK_STATEMENT" accessor="bankStatement" mode="view" />
                  </div>
                  <div className="col-md-4">
                    <TextInput formik={formik} label="LBL_CASH_ACCOUNT" accessor="cashAccount" mode="view" />
                  </div>
                  <div className="col-md-4">
                    <DateInput formik={formik} label="LBL_FROM" accessor="fromDate" mode="view" />
                  </div>
                  <div className="col-md-4">
                    <DateInput formik={formik} label="LBL_TO" accessor="toDate" mode="view" />
                  </div>
                  <div className="col-md-4">
                    <TextInput formik={formik} label="LBL_JOURNAL" accessor="journal" mode="view" />
                  </div>
                  <div className="border-section"></div>
                  <BalancesRow values={formik.values} />
                  <div className="border-section"></div>
                  <div className="row">
                    <div className="col-md-6">
                      <DateInput
                        formik={formik}
                        label="LBL_FROM"
                        accessor="moveLineFromDate"
                        mode="edit"
                        min={lastYearDate}
                        max={formik.values.toDate}
                      />
                    </div>
                    <div className="col-md-6">
                      <DateInput formik={formik} label="LBL_TO" accessor="moveLineToDate" mode="edit" max={formik.values.toDate} />
                    </div>
                  </div>
                  <div className="col-md-6 mt-3 mb-3">
                    <div className="title-section float-start">
                      <h4>{t('LBL_RECONCILIATION_LINES')}</h4>
                    </div>
                  </div>
                  <div className="col-md-6 mt-3 mb-3 clearfix">
                    <div className="title-section float-start">
                      <h4>{t('LBL_ACCOUNT_MOVELINES')} </h4>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <ReconciliationLines
                      currentReconciliationLines={currentReconciliationLines}
                      validateClicked={validateClicked}
                      onReconciliationLineSelect={onReconciliationLineSelect}
                    />
                  </div>
                  <div className="col-md-6">
                    <MoveLines currentMoveLines={currentMoveLines} validateClicked={validateClicked} onMoveLineSelect={onMoveLineSelect} />
                  </div>
                  <div className="col-md-4 mt-5 mb-3">
                    <PrimaryButton theme="borderedWhite" text="LBL_AUTO_RECONCILE" onClick={autoReconcile} />
                  </div>
                  <div className="col-md-4 mt-5 mb-3">
                    <PrimaryButton theme="borderedWhite" text="LBL_RECONCILE_SELECTED" onClick={onReconcileSelectedOne} />
                  </div>
                  <div className="col-md-4 mt-5 mb-3">
                    <PrimaryButton theme="borderedWhite" text="LBL_UNRECONCILE_SELECTED" onClick={onUnReconcileSelectedOne} />
                  </div>
                </div>
              </div>

              <div className="card col-md-6">
                <div className="col-md-12 mb-3">
                  <button
                    className="btn btn-calculate float-end"
                    onClick={() => {
                      computeBalanceFirstAction();
                    }}
                  >
                    {t('LBL_COMPUTE_BALANCES')}
                  </button>
                </div>
                <BalancesTable values={formik.values} />
              </div>
            </div>
          </div>
        </div>
      </div>
      {showMoreAction && (
        <MoreAction
          viewHandler={() => {
            navigate(getFeaturePath(subFeature, 'view', { id: reconciliationID }));
          }}
          deleteHandler={() => setShowDeletePopup(true)}
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          canSelectAll={false}
        />
      )}
      {showWarningPopup && getUnpostedLines(reconciliationLines).length > 0 && (
        <BRWarningPopup setConfirmationPopup={setShowWarningPopup} items={getUnpostedLines(reconciliationLines)} canValidate={false} />
      )}
      {showWarningPopup && getUnpostedLines(reconciliationLines).length === 0 && (
        <BRWarningPopup
          onClickHandler={onValidateHandler}
          onClickHandlerParams={validateFirstAction}
          setConfirmationPopup={setShowWarningPopup}
          items={getUnpostedLines(movelines)}
          canValidate={true}
        />
      )}
      {showDeletePopup && (
        <ConfirmationPopup
          onClickHandler={deleteReconciliationHandler}
          setConfirmationPopup={setShowDeletePopup}
          item={fetchedReconciliation.name}
        />
      )}
    </>
  );
};

export default EditBankReconciliation;
