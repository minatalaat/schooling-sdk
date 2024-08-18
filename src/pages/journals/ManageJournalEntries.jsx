import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import moment from 'moment';
import jsPDF from 'jspdf';
// import domtoimage from 'dom-to-image';
import { domToPng } from 'modern-screenshot';

import BreadCrumb from '../../components/ui/BreadCrumb';
import BackButton from '../../components/ui/buttons/BackButton';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';
import ActionsProgessBar from '../../parts/ActionsProgessBar';
import Calendar from '../../components/ui/Calendar';
import ConfirmationPopup from '../../components/ConfirmationPopup';
import JournalsForm from './JournalsForm';
import MoreAction from '../../parts/MoreAction';
import Spinner from '../../components/Spinner/Spinner';
import ReverseModal from './ReverseModal';
import REVEICON from '../../assets/images/reve-icon.svg';

import { useAxiosFunction } from '../../hooks/useAxios';
import { useFeatures } from '../../hooks/useFeatures';
import { getSearchUrl, getActionUrl, getFetchUrl } from '../../services/getUrl';
import { MOVE_STATUS } from '../../constants/enums/MoveEnums';
import { alertsActions } from '../../store/alerts';
import { MODELS } from '../../constants/models';
import { MOVES_SEARCH_FIELDS, MOVELINES_SEARCH_FIELDS } from './JournalsPayloadsFields';
import { checkFlashOrError } from '../../utils/helpers';
import { getMode, MODES } from '../../constants/enums/FeaturesModes';

export default function ManageJournalEntries({ addNew, enableEdit, feature, subFeature }) {
  const mode = getMode(addNew, enableEdit);
  const modelsEnumKey = 'JOURNAL_ENTRIES';
  const targetRef = useRef();
  const { api } = useAxiosFunction();
  const { t } = useTranslation();
  const { canView, canEdit, canDelete, getFeaturePath } = useFeatures(feature, subFeature);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  let { state } = useLocation();
  const { duplicateObject } = state || {};

  const date = new Date();
  let tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { id } = useParams();
  let company = useSelector(state => state.userFeatures.companyInfo.company);

  const [fetchedMove, setFetchedMove] = useState();
  const [showMoreAction, setShowMoreAction] = useState(false);

  const [totalDebit, setTotalDebit] = useState('0');
  const [totalCredit, setTotalCredit] = useState('0');
  const [totalLines, setTotalLines] = useState(0);
  const [difference, setDifference] = useState('0');
  const [totalCurrency, setTotalCurrency] = useState('0');
  let totals = { difference, totalCredit, totalDebit, totalLines, totalCurrency };

  const [actionInProgress, setActionInProgress] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalLoading, setIsModalLoading] = useState(true);

  const [isSave, setIsSave] = useState(false);
  const [isAccountMove, setIsAccountMove] = useState(false);
  const [isReverseMove, setIsReverseMove] = useState(false);
  const [isDateChange, setIsDateChange] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showReverseModal, setShowReverseModal] = useState(false);

  let statusBarItems = [
    {
      label: 'LBL_DRAFT',
      className: mode === MODES.ADD ? 'default' : 'done',
    },
    {
      label: 'LBL_ACCOUNTED',
      className: mode === MODES.ADD || fetchedMove?.statusSelect !== 3 ? 'default' : 'done',
    },
  ];

  const alertHandler = (title, message) => {
    dispatch(alertsActions.initiateAlert({ title, message }));
    setActionInProgress(false);

    if (title !== 'Success') {
      if (isSave) setIsSave(false);
      if (isReverseMove) setIsReverseMove(false);
      if (isAccountMove) setIsAccountMove(false);
      if (isDelete) setIsDelete(false);
      if (isDateChange) setIsDateChange(false);
    }
  };

  const finishedSaveHandler = status => {
    if (status === 'success') {
      alertHandler('Success', 'LBL_MOVE_SAVED');
      setTimeout(() => {
        setIsSave(false);
        navigate(getFeaturePath(subFeature));
      }, 3000);
    } else {
      alertHandler('Error', 'LBL_ERROR_SAVING_MOVE');
    }
  };

  const finishedDeleteHandler = status => {
    if (status === 'success') {
      alertHandler('Success', 'LBL_MOVES_DELETED');
      setTimeout(() => {
        setIsDelete(false);
        navigate(getFeaturePath(subFeature));
      }, 3000);
    } else {
      alertHandler('Error', 'SOMETHING_WENT_WRONG');
    }
  };

  const finishedAccountHandler = status => {
    if (status === 'success') {
      alertHandler('Success', 'LBL_MOVE_ACCOUNTED');
      setTimeout(() => {
        setIsAccountMove(false);
        navigate(getFeaturePath(subFeature));
      }, 3000);
    } else {
      alertHandler('Error', 'SOMETHING_WENT_WRONG');
    }
  };

  const finishedReverseHandler = (status, id) => {
    setIsModalLoading(false);

    if (status === 'success') {
      alertHandler('Success', 'LBL_MOVE_REVERSED');
      setIsReverseMove(false);
      setShowReverseModal(false);
      setTimeout(() => {
        if (id) navigate(getFeaturePath(subFeature, 'view', { id }));
        else navigate(getFeaturePath(subFeature));
      }, 3000);
    } else {
      alertHandler('Error', 'LBL_ERROR_REVERSING_MOVE');
    }
  };

  const fetchMove = async () => {
    if (isLoading === false) setIsLoading(true);
    if (mode === MODES.ADD && !duplicateObject) return onNewMove();
    if (mode === MODES.ADD && duplicateObject) return handleDuplicateMove();

    const response = await api('POST', getFetchUrl(MODELS.MOVE, id), {
      fields: MOVES_SEARCH_FIELDS,
      related: {},
    });
    let status = response?.data?.status;
    let data = response?.data?.data;
    if (status !== 0 || !data || !data[0]) return navigate('/error');

    if (data && data[0]) {
      let tempMove = data[0];

      let tempFetchedMove = await fetchMoveLines(tempMove);
      await onMoveLoad();

      if (tempMove?.journal?.code.includes('INJ')) {
        tempFetchedMove.stockMove = await getStockMove(tempMove);
      }

      setFetchedMove({ ...tempFetchedMove });
    }
  };

  const handleDuplicateMove = () => {
    let tempMoveLines = [];
    duplicateObject.moveLineList.forEach(moveLine => {
      let tempLine = { ...moveLine };
      tempLine.lineId = uuidv4();
      tempMoveLines.push(tempLine);
    });
    let tempFetchedMove = { ...duplicateObject };
    tempFetchedMove.moveLineList = tempMoveLines;
    setFetchedMove(tempFetchedMove);
    computeTotals(tempMoveLines);
  };

  const getMoveLinesFetchPayload = moveLinesIDs => {
    let payload = {
      fields: MOVELINES_SEARCH_FIELDS,
      sortBy: null,
      data: {
        _domain: 'self.id in (:_field_ids)',
        _domainContext: {
          id: id,
          _model: MODELS.MOVE,
          _field: 'moveLineList',
          _field_ids: moveLinesIDs,
        },
        _archived: true,
      },
      limit: -1,
      offset: 0,
      translate: true,
    };
    return payload;
  };

  const fetchMoveLines = async tempFetchedMove => {
    let tempIDs = [];
    tempFetchedMove.moveLineList.forEach(moveline => {
      if (moveline.id) {
        tempIDs.push(moveline.id);
      }
    });

    if (!tempIDs || tempIDs.length === 0) {
      setFetchedMove(tempFetchedMove);
      return onMoveLoad();
    }

    const response = await api('POST', getSearchUrl(MODELS.MOVELINE), getMoveLinesFetchPayload(tempIDs));
    let status = response?.data?.status;
    let data = response?.data?.data;
    let total = response?.data?.total;

    if (status !== 0 || total === undefined || total === null || !data) {
      return alertHandler('Error', 'LBL_ERROR_LOADING_MOVE_LINES');
    }

    if (data) {
      let tempMoveLines = [];
      data.forEach(moveLine => {
        let tempLine = { ...moveLine };
        tempLine.lineId = uuidv4();
        tempMoveLines.push(tempLine);
      });
      tempFetchedMove.moveLineList = tempMoveLines;
      return tempFetchedMove;
    }
  };

  const getStockMovePayload = fetchedMove => {
    let payload = {
      fields: ['stockMove', 'stockMoveDate', 'costMove'],
      sortBy: ['stockMove'],
      data: {
        _domain: 'self.costMove.id = :_costMoveId',
        _domainContext: {
          _costMoveId: fetchedMove?.id,
        },
        operator: 'and',
        criteria: [],
      },
      limit: 1,
      offset: 0,
      translate: true,
    };
    return payload;
  };

  const getStockMove = async tempFetchedMove => {
    const stockMoveDateResponse = await api('POST', getSearchUrl(MODELS.STOCK_MOVE_ADDITIONAL_DATA), getStockMovePayload(tempFetchedMove));
    let status = stockMoveDateResponse?.data?.status;
    let total = stockMoveDateResponse?.data?.total;
    let data = stockMoveDateResponse?.data?.data;

    if (status !== 0 || total === undefined || total === null || !data) {
      return;
    }

    return data?.[0]?.stockMove?.stockMoveSeq ?? null;
  };

  const getComputeTotalPayload = tempMoveLines => {
    let payload = {
      model: MODELS.MOVE,
      action: 'action-account-move-method-compute-totals,action-method-hide-axis-analytic-account-move-line',
      data: {
        criteria: [],
        context: {
          _model: MODELS.MOVE,
          _isActivateSimulatedMoves: null,
          _id: null,
          functionalOriginSelect: null,
          getInfoFromFirstMoveLineOk: true,
          statusSelect: 1,
          technicalOriginSelect: 1,
          moveLineList: tempMoveLines,
          journalTechnicalTypeSelect: 5,
        },
      },
    };
    // payload.data.context = addFormikValuesToPayload(payload.data.context);
    payload.data.context = addTotalsToPayload(payload.data.context);
    return payload;
  };

  const computeTotals = async tempMoveLines => {
    let response = await api('POST', getActionUrl(), getComputeTotalPayload(tempMoveLines));
    let status = response?.data?.status;
    let data = response?.data?.data;

    if (status !== 0 || !data || (data && checkFlashOrError(data))) {
      return alertHandler('LBL_ERROR_COMPUTING_TOTALS');
    }

    if (data) {
      let values = data.find(el => el.values)?.values;

      if (values) {
        setTotalValues(values);
      }

      setIsLoading(false);
    }
  };

  const moveLoadPayload = () => {
    let payload = {
      model: MODELS.MOVE,
      action: 'action-account-move-group-onload,com.axelor.meta.web.MetaController:moreAttrs',
      data: {
        criteria: [],
        context: {
          _model: MODELS.MOVE,
          id: id,
        },
      },
    };
    return payload;
  };

  const onMoveLoad = async () => {
    const response = await api('POST', getActionUrl(), moveLoadPayload());
    let status = response?.data?.status;
    let data = response?.data?.data;
    if (!response || !response.data || status !== 0 || !data || (data && checkFlashOrError(data)))
      return alertHandler('Error', 'LBL_ERROR_LOADING_MOVE');

    if (data && data.length > 0) {
      let total = data.find(el => el.values && '$totalLines' in el.values)?.values;

      if (total) {
        setTotalValues(total);
      }
    }

    setIsLoading(false);
  };

  const onNewMovePayload = () => {
    let payload = {
      model: MODELS.MOVE,
      action: 'action-account-move-onnew-group,com.axelor.meta.web.MetaController:moreAttrs',
      data: {
        criteria: [],
        context: {
          _model: MODELS.MOVE,
          _id: null,
        },
      },
    };
    return payload;
  };

  const onNewMove = async () => {
    const response = await api('POST', getActionUrl(), onNewMovePayload());
    let status = response?.data?.status;
    let data = response?.data?.data;
    if (status !== 0 || !data) return alertHandler('Error', 'LBL_ERROR_LOADING_NEW_MOVE');

    if (data && checkFlashOrError(data)) {
      return alertHandler('Error', 'LBL_ERROR_LOADING_NEW_MOVE');
    }

    if (data) {
      let period = data.find(el => el.values && 'period' in el.values)?.values?.period;
      let date = data.find(el => el.values && 'date' in el.values)?.values?.date;
      let companyCurrency = data.find(el => el.values && 'companyCurrency' in el.values)?.values?.companyCurrency;
      let currency = data.find(el => el.values && 'currency' in el.values)?.values?.currency;
      let journal = data.find(el => el.values && 'journal' in el.values)?.values?.journal;
      let companyCurrencyCodeIso = data.find(el => el.values && '$companyCurrencyCodeIso' in el.values)?.values?.[
        '$companyCurrencyCodeIso'
      ];
      setFetchedMove({
        company,
        period,
        date,
        currency,
        journal,
        companyCurrency,
        companyCurrencyCodeIso,
      });
    }

    setIsLoading(false);
  };

  const addTotalsToPayload = object => {
    object.totalLines = totalLines;
    object.totalCurrency = totalCurrency;
    object.totalDebit = totalDebit;
    object.totalCredit = totalCredit;
    object.difference = difference;
    return object;
  };

  const setTotalValues = values => {
    setDifference(values.$difference ?? '0');
    setTotalCredit(values.$totalCredit ?? '0');
    setTotalDebit(values.$totalDebit ?? '0');
    setTotalLines(values.$totalLines ?? 0);
    setTotalCurrency(values.$totalCurrency ?? '0');
  };

  const viewHandler = () => {
    navigate(getFeaturePath(subFeature, MODES.VIEW, { id }));
    if (showMoreAction) setShowMoreAction(false);
  };

  const editHandler = () => {
    navigate(getFeaturePath(subFeature, MODES.EDIT, { id }), { state: { status: fetchedMove?.statusSelect } });
    if (showMoreAction) setShowMoreAction(false);
  };

  const deleteHandler = () => {
    setShowDelete(true);
  };

  const filter = node => {
    const exclusionClasses = ['card-progress-bar', 'info-date-page', 'breadcrumb-page', 'cancel-btn'];
    return !exclusionClasses.some(classname => node.classList?.contains(classname));
  };

  const printSnapShotHandler = () => {
    const input = document.getElementsByClassName('container-fluid')[0];

    domToPng(input, {
      backgroundColor: '#f5f7fe',
      height: input?.scrollHeight,
      width: input?.scrollWidth,
      style: {
        overflowX: 'none',
        left: '0px',
        right: '0px',
      },
      filter: filter,
    }).then(item => {
      const pdf = new jsPDF('p', 'px', [1200, input?.scrollHeight], true);
      pdf.addImage(item, 'PNG', 0, 0, 1200, input?.scrollHeight);
      pdf.save(`${fetchedMove?.reference}.pdf`);
    });
  };

  useEffect(() => {
    fetchMove();
  }, [addNew, enableEdit]);

  const reverseInitVals = {
    autoReconcile: false,
    autoAccounting: false,
    unReconsileOrginalMove: false,
    hideMoveLines: false,
    dateOfReversion: '',
    dateOfReversionSelect: '',
  };

  const validationSchema = Yup.object({
    dateOfReversion: Yup.date().required(t('LBL_DATE_REQUIRED')).min(moment(fetchedMove?.date), t('LBL_ERROR_MIN_DATE')),
  });

  const reverseModalFormik = useFormik({
    initialValues: reverseInitVals,
    validationSchema,
  });

  let isButtonDisabled = isSave || isDelete || isReverseMove || isAccountMove || isDateChange;

  return (
    <>
      {actionInProgress && <div className="lodingpage"></div>}
      {isLoading && <Spinner />}
      {showMoreAction && (
        <MoreAction
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          viewHandler={mode === MODES.EDIT && canView ? viewHandler : null}
          editHandler={mode === MODES.VIEW && canEdit ? editHandler : null}
          deleteHandler={mode !== MODES.ADD && canDelete && fetchedMove?.statusSelect < 3 ? deleteHandler : null}
          canSelectAll={false}
          feature={feature}
          subFeature={subFeature}
          modelsEnumKey={modelsEnumKey}
          id={id}
          printSnapShotHandler={mode === MODES.VIEW && fetchedMove && fetchedMove?.statusSelect === 3 ? printSnapShotHandler : null}
        />
      )}
      {showReverseModal && (
        <ReverseModal
          fetchedMove={fetchedMove}
          reverseModalFormik={reverseModalFormik}
          show={showReverseModal}
          setShow={setShowReverseModal}
          submit={() => setIsReverseMove(true)}
          isLoading={isModalLoading}
          setIsLoading={setIsModalLoading}
          alertHandler={alertHandler}
        />
      )}
      {!isLoading && (
        <div className="page-body">
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-12">
                <Calendar />
                <BreadCrumb feature={feature} subFeature={subFeature} modelsEnumKey={modelsEnumKey} mode={mode} />
              </div>
            </div>
            <div className="row">
              <div className="col-md-12 mb-4">
                <div className="info-tite-page float-start">
                  <h4>{mode === MODES.ADD ? t('LBL_NEW_JOURNAL_ENTRY') : fetchedMove?.reference ?? ''}</h4>
                </div>
                <div className="reverse-page float-end">
                  <BackButton text={mode === MODES.ADD ? 'LBL_CANCEL' : 'LBL_BACK'} disabled={isButtonDisabled} />
                  {(mode === MODES.ADD || (mode === MODES.EDIT && fetchedMove?.statusSelect < 3)) && (
                    <PrimaryButton disabled={isButtonDisabled} onClick={() => setIsSave(true)} />
                  )}
                  {(mode === MODES.ADD || (mode === MODES.EDIT && fetchedMove?.statusSelect < 3)) && (
                    <PrimaryButton text="LBL_ACCOUNT_MOVE" disabled={isButtonDisabled} onClick={() => setIsAccountMove(true)} />
                  )}
                  {mode === MODES.EDIT && fetchedMove?.statusSelect === 3 && (
                    <PrimaryButton
                      disabled={isButtonDisabled}
                      text="LBL_REVERSE"
                      onClick={() => {
                        setShowReverseModal(true);
                      }}
                    >
                      <img src={REVEICON} alt="reverse-icon" />
                    </PrimaryButton>
                  )}
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <ActionsProgessBar
                  feature={feature}
                  subfeature={subFeature}
                  statusBarItems={statusBarItems}
                  viewHandler={mode === MODES.EDIT && canView ? viewHandler : null}
                  editHandler={mode === MODES.VIEW && canEdit ? editHandler : null}
                  deleteHandler={mode !== MODES.ADD && canDelete && fetchedMove?.statusSelect < 3 ? deleteHandler : null}
                  setShowMoreAction={setShowMoreAction}
                  currentStatusLabel={(fetchedMove && t(MOVE_STATUS[fetchedMove?.statusSelect])) || t(MOVE_STATUS[1])}
                  modelsEnumKey={mode !== MODES.ADD ? modelsEnumKey : null}
                  setIsLoading={setActionInProgress}
                  printSnapShotHandler={mode === MODES.VIEW && fetchedMove && fetchedMove?.statusSelect === 3 ? printSnapShotHandler : null}
                />
                {showDelete && (
                  <ConfirmationPopup
                    item={fetchedMove?.reference}
                    onClickHandler={() => setIsDelete(true)}
                    setConfirmationPopup={setShowDelete}
                  />
                )}
                {fetchedMove && (
                  <JournalsForm
                    mode={mode}
                    data={fetchedMove}
                    totals={totals}
                    isSave={isSave}
                    isDelete={isDelete}
                    isAccountMove={isAccountMove}
                    isReverseMove={isReverseMove}
                    finishedSaveHandler={finishedSaveHandler}
                    finishedDeleteHandler={finishedDeleteHandler}
                    finishedAccountHandler={finishedAccountHandler}
                    finishedReverseHandler={finishedReverseHandler}
                    alertHandler={alertHandler}
                    setActionInProgress={setActionInProgress}
                    setIsLoading={setIsLoading}
                    setTotalValues={setTotalValues}
                    addTotalsToPayload={addTotalsToPayload}
                    reverseModalFormik={reverseModalFormik}
                    setIsModalLoading={setIsModalLoading}
                    setFetchedData={setFetchedMove}
                    setIsDateChange={setIsDateChange}
                    isButtonDisabled={isButtonDisabled}
                    targetRef={targetRef}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
