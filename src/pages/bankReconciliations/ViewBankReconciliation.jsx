import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';

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
import NoDataAvailable from '../../components/NoDataAvailable';

import ArrowRed from '../../assets/images/arrow-red.svg';
import ArrowGreen from '../../assets/images/arrow-green.svg';

import { useAxiosFunction } from '../../hooks/useAxios';
import { MODELS } from '../../constants/models';
import { useTranslation } from 'react-i18next';
import { formatFloatNumber } from '../../utils/helpers';
import { useDispatch, useSelector } from 'react-redux';
import { reconciliationLineActions } from '../../store/reconciliationLines';
import { RECONCILIATION_FIELDS, RECONCILIATION_LINES_FIELDS, MOVELINES_FIELDS } from './ReconciliationsPayloadsFields';
import { getSearchUrl, getFetchUrl, getRemoveAllUrl } from '../../services/getUrl';
import { useFeatures } from '../../hooks/useFeatures';
import { alertsActions } from '../../store/alerts';

const ViewBankReconciliation = ({ feature, subFeature }) => {
  const navigate = useNavigate();
  const { getFeaturePath } = useFeatures();
  const { t } = useTranslation();

  const { api } = useAxiosFunction();

  const url = window.location.href.split('/');
  const reconciliationID = parseInt(url[url.length - 1]);

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [reconciliationLinesIDs, setReconciliationLinesIDs] = useState([]);
  const [fetchedReconciliation, setFetchedReconciliation] = useState(null);
  let statusBarItems = [
    {
      label: 'LBL_DRAFT',
      className: 'done',
    },
    {
      label: 'LBL_ACCOUNTED',
      className: fetchedReconciliation && fetchedReconciliation.statusSelect === 2 ? 'done' : 'default',
    },
  ];
  let movelines = useSelector(state => state.reconciliationLines.movelines);
  let reconciliationLines = useSelector(state => state.reconciliationLines.reconciliationLines);
  const dispatch = useDispatch();

  const [currentMoveLines, setCurrentMoveLines] = useState([]);
  const [currentReconciliationLines, setCurrentReconciliationLines] = useState([]);

  const [buttonClicked, setButtonClicked] = useState(false);
  const [disableSave, setDisableSave] = useState(false);
  const [showMoreAction, setShowMoreAction] = useState(false);

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
  };

  const formik = useFormik({
    initialValues: initValues,
  });

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
    if (fetchedReconciliation && reconciliationLinesIDs && reconciliationLinesIDs.length > 0) {
      getBankReconciliationLines();
    }
  }, [fetchedReconciliation]);

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

  // FETCH RECONCILIATION
  const fetchReconciliationPayload = () => {
    let payload = {
      fields: RECONCILIATION_FIELDS,
      related: {},
    };
    return payload;
  };

  const fetchReconciliation = () => {
    api('POST', getFetchUrl(MODELS.BANK_RECONCILIATION, reconciliationID), fetchReconciliationPayload(), onFetchReconciliationSuccess, {});
  };

  const onFetchReconciliationSuccess = response => {
    let status = response.data.status;
    let data = response.data.data;
    if (status !== 0) return showErrorMessage('LBL_ERROR_LOADING_BANK_RECONCILIATION');
    if (data === undefined || data === null) return showErrorMessage('LBL_ERROR_LOADING_BANK_RECONCILIATION');

    if (data) {
      let reconciliation = data[0];
      setFetchedReconciliation(reconciliation);
      formik.setValues({
        label: reconciliation.name,
        company: reconciliation.company ? reconciliation.company.name : '',
        currency: reconciliation.currency ? reconciliation.currency.name : '',
        bankDetails: reconciliation.bankDetails ? reconciliation.bankDetails.fullName : '',
        bankStatement: reconciliation.bankStatement ? reconciliation.bankStatement.name : '',
        fromDate: reconciliation.fromDate,
        toDate: reconciliation.toDate,
        journal: reconciliation.journal ? reconciliation.journal.name : '',
        cashAccount: reconciliation.cashAccount ? reconciliation.cashAccount.label : '',
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
      reconciliation.bankReconciliationLineList.forEach(line => {
        if (line.id) {
          tempIDs.push(line.id);
        }
      });
      setReconciliationLinesIDs(tempIDs);
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

  const getBankReconciliationLines = () => {
    api('POST', getSearchUrl(MODELS.BANK_RECONCILIATION_LINE), getReconciliationLinesPayload(), onGetReconciliationLinesSuccess, {});
  };

  const onGetReconciliationLinesSuccess = response => {
    let status = response.data.status;
    let total = response.data.total;
    let data = response.data.data;
    if (status !== 0) return showErrorMessage('LBL_ERROR_LOADING_BANK_RECONCILIATION');
    if (total === undefined || total === null) return showErrorMessage('LBL_ERROR_LOADING_BANK_RECONCILIATION');

    if (data) {
      dispatch(reconciliationLineActions.setReconciliationLines({ lines: data }));
      getMovelines();
    }
  };

  const getMovelinesPayload = () => {
    let payload = {
      fields: MOVELINES_FIELDS,
      sortBy: ['date', 'postedNbr'],
      data: {
        _domain:
          'self.id in (select ML.id from BankReconciliationLine as BRL left join\n    BRL.moveLine as ML where BRL.bankReconciliation.id = :bankReconciliationId)',
        _domainContext: {
          bankReconciliationId: reconciliationID,
          _id: reconciliationID,
          _model: MODELS.MOVELINE,
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

  const getMovelines = () => {
    api('POST', getSearchUrl(MODELS.MOVELINE), getMovelinesPayload(), onGetMovelinesSuccess, {});
  };

  const onGetMovelinesSuccess = response => {
    let status = response.data.status;
    let total = response.data.total;
    let data = response.data.data;
    if (status !== 0) return showErrorMessage('LBL_ERROR_LOADING_BANK_RECONCILIATION');
    if (total === undefined || total === null) return showErrorMessage('LBL_ERROR_LOADING_BANK_RECONCILIATION');

    if (data) {
      dispatch(reconciliationLineActions.setMovelines({ lines: data }));
    }
  };
  // END FETCH RECONCILIATION

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

  const deleteReconciliationHandler = () => {
    setButtonClicked(true);
    setDisableSave(true);
    api('POST', getRemoveAllUrl(MODELS.BANK_RECONCILIATION), getDeletePayload(), onReconciliationDeleteSuccess);
  };

  const onReconciliationDeleteSuccess = response => {
    let status = response.data.status;

    if (status !== 0) {
      return showErrorMessage('LBL_ERROR_DELETE_BANK_RECONCILIATIONS');
    }

    showSuccessMessage('LBL_BANK_RECONCILIATIONS_DELETED');
    setTimeout(() => {
      navigate(getFeaturePath(subFeature));
    }, 3000);
  };

  return (
    <>
      {buttonClicked && <div className="lodingpage"></div>}
      <div className="page-body">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <Calendar />
              <BreadCrumb feature={feature} subFeature={subFeature} modeText="LBL_VIEW_BANK_RECONCILIATION" />
            </div>
          </div>
          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{formik.values.label}</h4>
              </div>

              <div className="reverse-page float-end">
                <BackButton disabled={disableSave} />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <ActionsProgessBar
                feature={feature}
                subfeature={subFeature}
                editHandler={
                  fetchedReconciliation && fetchedReconciliation.statusSelect === 2
                    ? undefined
                    : () => {
                        navigate(getFeaturePath(subFeature, 'edit', { id: reconciliationID }), {
                          state: { status: fetchedReconciliation.statusSelect },
                        });
                      }
                }
                deleteHandler={
                  fetchedReconciliation && fetchedReconciliation.statusSelect === 2 ? undefined : () => setShowDeletePopup(true)
                }
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
                    <div className="table-responsive table-responsive-xxl supplier-po-request">
                      <table className="table table-bordered">
                        <thead>
                          <tr>
                            <th width="20">{t('LBL_POSTED_NUMBER')}</th>
                            <th width="110">{t('LBL_EFFECT_DATE')}</th>
                            <th width="200">{t('LBL_LABEL_NAME')}</th>
                            <th width="160">
                              {t('LBL_DEBIT')} <img src={ArrowRed} alt="red-arrow" />
                            </th>
                            <th width="160">
                              {t('LBL_CREDIT')} <img src={ArrowGreen} alt="green-arrow" />
                            </th>
                            <th width="20">{t('LBL_MOVE_LINE')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentReconciliationLines &&
                            currentReconciliationLines.map(reconciledLine => {
                              return (
                                <>
                                  <tr>
                                    <td>{reconciledLine.postedNbr ? reconciledLine.postedNbr : ''}</td>
                                    <td>{reconciledLine.effectDate}</td>
                                    <td>{reconciledLine.name}</td>
                                    <td className="color-text-red">{formatFloatNumber(reconciledLine.debit)}</td>
                                    <td className="color-text-green">{formatFloatNumber(reconciledLine.credit)}</td>
                                    <td>{reconciledLine.moveLine ? reconciledLine.moveLine.name : ''}</td>
                                  </tr>
                                </>
                              );
                            })}
                        </tbody>
                      </table>
                      {currentReconciliationLines && currentReconciliationLines.length === 0 && <NoDataAvailable />}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="table-responsive table-responsive-xxl supplier-po-request">
                      <table className="table table-bordered">
                        <thead>
                          <tr>
                            <th width="20">{t('LBL_POSTED_NUMBER')}</th>
                            <th width="110">{t('LBL_DATE')}</th>
                            <th width="200">{t('LBL_NAME')}</th>
                            <th width="160">
                              {t('LBL_DEBIT')} <img src={ArrowGreen} alt="green-arrow" />
                            </th>
                            <th width="160">
                              {t('LBL_CREDIT')} <img src={ArrowRed} alt="red-arrow" />
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentMoveLines &&
                            currentMoveLines.map(moveline => {
                              return (
                                <>
                                  <tr>
                                    <td>{moveline.postedNbr ? moveline.postedNbr : ''}</td>
                                    <td>{moveline.date}</td>
                                    <td>{moveline.name}</td>
                                    <td className="color-text-green">{formatFloatNumber(moveline.debit)}</td>
                                    <td className="color-text-red">{formatFloatNumber(moveline.credit)}</td>
                                  </tr>
                                </>
                              );
                            })}
                        </tbody>
                      </table>
                      {currentMoveLines && currentMoveLines.length === 0 && <NoDataAvailable />}
                    </div>
                  </div>
                </div>
              </div>

              <div className="card col-md-6">
                <BalancesTable values={formik.values} />
              </div>
            </div>
          </div>
        </div>
      </div>
      {showMoreAction && (
        <MoreAction
          editHandler={
            fetchedReconciliation && fetchedReconciliation.statusSelect === 2
              ? undefined
              : () => {
                  navigate(getFeaturePath(subFeature, 'edit', { id: reconciliationID }), {
                    state: { status: fetchedReconciliation.statusSelect },
                  });
                }
          }
          deleteHandler={fetchedReconciliation && fetchedReconciliation.statusSelect === 2 ? undefined : () => setShowDeletePopup(true)}
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          canSelectAll={false}
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

export default ViewBankReconciliation;
