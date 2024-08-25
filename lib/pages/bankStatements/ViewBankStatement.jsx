import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { useDispatch } from 'react-redux';

import ConfirmationPopup from '../../components/ConfirmationPopup';
import MoreAction from '../../parts/MoreAction';
import BreadCrumb from '../../components/ui/BreadCrumb';
import ActionsProgessBar from '../../parts/ActionsProgessBar';
import BackButton from '../../components/ui/buttons/BackButton';
import Calendar from '../../components/ui/Calendar';
import BankStatementForm from './BankStatementForm';

import { useAxiosFunction } from '../../hooks/useAxios';
import { MODELS } from '../../constants/models';
import { useTranslation } from 'react-i18next';
import { checkFlashOrError } from '../../utils/helpers';
import { getSearchUrl, getFetchUrl, getActionUrl } from '../../services/getUrl';
import { useFeatures } from '../../hooks/useFeatures';
import { getStatementErrorLabel } from '../../utils/statementHelpers';
import { STATEMENTS_FIELDS, STATEMENT_LINES_FIELDS, MOVELINES_FIELDS } from './StatementsPayloadsFields';
import { setSelectedValues } from '../../utils/formHelpers';
import { alertsActions } from '../../store/alerts';

const ViewBankStatement = ({ feature, subFeature }) => {
  const brSubFeature = 'BANK_RECONCILIATIONS';
  const mode = 'view';
  const url = window.location.href.split('/');
  const id = parseInt(url[url.length - 1]);

  const navigate = useNavigate();
  const { getFeaturePath } = useFeatures();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { api } = useAxiosFunction();

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [statementLines, setStatementLines] = useState([]);
  const [moveLines, setMoveLines] = useState([]);
  const [fetchedStatement, setFetchedStatement] = useState(null);

  const [buttonClicked, setButtonClicked] = useState(false);
  const [disableSave, setDisableSave] = useState(false);
  const [showMoreAction, setShowMoreAction] = useState(false);

  const initValues = {
    name: '',
    fromDate: '',
    toDate: '',
    fileFormat: null,
    uploadedFile: '',
    statusSelect: 0,
    bankDetails: null,
  };

  const formik = useFormik({
    initialValues: initValues,
  });

  const alertHandler = (title, message) => {
    dispatch(alertsActions.initiateAlert({ title, message }));
    setButtonClicked(false);

    if (title === 'Success') {
      setTimeout(() => {
        setDisableSave(false);
      }, 3000);
    } else {
      setDisableSave(false);
    }
  };

  useEffect(() => {
    fetchBankStatement();
    getBankStatementLines();
    getMoveLines();
  }, []);

  const fetchBankStatementPayload = () => {
    let payload = {
      fields: STATEMENTS_FIELDS,
      related: {},
    };
    return payload;
  };

  const fetchBankStatement = async () => {
    const response = await api('POST', getFetchUrl(MODELS.BANK_STATEMENT, id), fetchBankStatementPayload());
    let status = response.data.status;
    let data = response.data.data;
    if (status !== 0 || data === undefined || data === null) return alertHandler('Error', t('LBL_ERROR_LOADING_BANK_STATEMENT'));

    if (data) {
      let statement = data[0];
      setFetchedStatement(data[0]);
      setSelectedValues(formik, {
        name: statement.name,
        fileFormat: statement.bankStatementFileFormat ?? null,
        fromDate: statement.fromDate,
        toDate: statement.toDate,
        uploadedFile: statement.bankStatementFile ? statement.bankStatementFile.fileName : '',
        statusSelect: statement.statusSelect,
      });
      fetchAdditionalInfo();
    }
  };

  const fetchAdditionalInfoPayload = () => {
    let payload = {
      fields: ['bankStatement', 'bankDetails'],
      sortBy: null,
      data: {
        _domain: 'self.bankStatement.id = :bsID',
        _domainContext: {
          _id: null,
          bsID: parseInt(id),
        },
      },
      limit: -1,
      offset: 0,
      translate: true,
    };
    return payload;
  };

  const fetchAdditionalInfo = async () => {
    const response = await api('POST', getSearchUrl(MODELS.BANK_STATEMENT_ADDITIONAL_INFO), fetchAdditionalInfoPayload());
    let total = response.data.total;
    let data = response.data.data;
    let status = response.data.status;

    if (status !== 0 || total === undefined || total === null || !data) {
      return alertHandler('Error', t('LBL_ERROR_LOADING_BANK_DETAILS'));
    }

    if (data) {
      let rowBankDetails = data[0].bankDetails;
      formik.setFieldValue('bankDetails', rowBankDetails);
    }
  };

  const getStatementLinesPayload = () => {
    let payload = {
      fields: STATEMENT_LINES_FIELDS,
      sortBy: ['lineTypeSelect', 'operationDate'],
      data: {
        _domain: 'self.bankStatement.id = :_id',
        _domainContext: {
          _id: null,
          id: id,
          _model: MODELS.BANK_STATEMENT,
        },
        _domainAction: 'action-bank-statement-view-bank-statement-lines-afb-120',
        operator: 'and',
        criteria: [],
      },
      limit: -1,
      offset: 0,
      translate: true,
    };
    return payload;
  };

  const getBankStatementLines = async () => {
    const response = await api('POST', getSearchUrl(MODELS.BANK_STATEMENT_LINE_AFB), getStatementLinesPayload());
    let total = response.data.total;
    let status = response.data.status;
    let data = response.data.data;
    if (status !== 0 || total === undefined || total === null) return alertHandler('Error', t('LBL_ERROR_LOADING_BANK_STATEMENT'));

    if (!data) {
      setStatementLines([]);
      return;
    }

    if (data) {
      setStatementLines(data);
    }
  };

  const getMoveLinesPayload = () => {
    let payload = {
      fields: MOVELINES_FIELDS,
      sortBy: ['-date', '-name'],
      data: {
        _domain:
          'self.id IN\n    (SELECT brl.moveLine\n    FROM BankReconciliationLine AS brl\n    JOIN BankReconciliation\n    as br\n    ON brl.bankReconciliation = br.id\n    WHERE br.bankStatement = :_id)',
        _domainContext: {
          _id: null,
          id: id,
          _model: MODELS.BANK_STATEMENT,
        },
        _domainAction: 'action-bank-statement-view-move-lines',
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
    const response = await api('POST', getSearchUrl(MODELS.MOVELINE), getMoveLinesPayload());
    let status = response.data.status;
    let data = response.data.data;
    let total = response.data.total;
    if (status !== 0 || total === undefined || total === null) return alertHandler('Error', t('LBL_ERROR_LOADING_BANK_STATEMENT'));

    if (!data) {
      setMoveLines([]);
      return;
    }

    if (data) {
      setMoveLines(data);
    }
  };

  const runBankReconciliationPayload = () => {
    let payload = {
      model: MODELS.BANK_STATEMENT,
      action: 'action-bank-statement-method-run-bank-reconciliation',
      data: {
        criteria: [],
        context: {
          _model: MODELS.BANK_STATEMENT,
          _id: null,
          id: id,
        },
      },
    };
    return payload;
  };

  const runBankReconciliation = async () => {
    const response = await api('POST', getActionUrl(), runBankReconciliationPayload());
    let status = response.data.status;
    let data = response.data.data;
    if (status !== 0 || !data) return alertHandler('Error', t('LBL_ERROR_RUN_BANK_RECONCILIATION'));

    if (data) {
      if (data && checkFlashOrError(data)) {
        return alertHandler('Error', t('LBL_ERROR_RUN_BANK_RECONCILIATION'));
      }

      if (data[0] && data[0].view && data[0].view.domain) {
        let domain = data[0].view.domain;

        if (domain.includes('()')) {
          return alertHandler('Error', t('LBL_ERROR_RUN_BANK_RECONCILIATION'));
        } else {
          let id = domain.slice(domain.indexOf('(') + 1, domain.lastIndexOf(')'));

          if (id.length > 0) {
            navigate(getFeaturePath(brSubFeature, 'edit', { id: id }), {
              state: { status: 1 },
            });
          } else {
            navigate(getFeaturePath(brSubFeature));
          }
        }
      }
    }
  };

  const deleteStatementHandler = () => {
    setButtonClicked(true);
    setDisableSave(true);
    deleteStatement();
  };

  const getDeleteStatementPayload = () => {
    let payload = {
      model: MODELS.BANK_STATEMENT,
      action: 'action-bank-statement-remove-all',
      data: {
        context: {
          ids: [id],
        },
      },
    };
    return payload;
  };

  const deleteStatement = async () => {
    const response = await api('POST', getActionUrl(), getDeleteStatementPayload());
    let status = response.data.status;
    let data = response.data.data;

    if (status === -1) {
      if (data && checkFlashOrError(data)) {
        return alertHandler('Error', t(getStatementErrorLabel(data[0].error)));
      }
    }

    if (status !== 0) {
      return alertHandler('Error', t('LBL_ERROR_DELETE_BANK_STATEMENTS'));
    }

    if (status === 0) {
      alertHandler('Success', t('LBL_BANK_STATEMENTS_DELETED'));
      setTimeout(() => {
        navigate(getFeaturePath(subFeature));
      }, 3000);
    }
  };

  return (
    <>
      {buttonClicked && <div className="lodingpage"></div>}
      <div className="page-body">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <Calendar />
              <BreadCrumb feature={feature} subFeature={subFeature} modeText="LBL_VIEW_BANK_STATEMENT" />
            </div>
          </div>

          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{formik.values.name}</h4>
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
                  fetchedStatement && fetchedStatement.statusSelect === 2
                    ? undefined
                    : () => {
                        navigate(getFeaturePath(subFeature, 'edit', { id: id }));
                      }
                }
                deleteHandler={() => setShowDeletePopup(true)}
                setShowMoreAction={setShowMoreAction}
              />
              <BankStatementForm
                formik={formik}
                mode={mode}
                alertHandler={alertHandler}
                runBankReconciliation={runBankReconciliation}
                moveLines={moveLines}
                statementLines={statementLines}
              />
            </div>
          </div>
        </div>
      </div>
      {showMoreAction && (
        <MoreAction
          editHandler={
            fetchedStatement && fetchedStatement.statusSelect === 2
              ? undefined
              : () => {
                  navigate(getFeaturePath(subFeature, 'edit', { id: id }));
                }
          }
          deleteHandler={() => setShowDeletePopup(true)}
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          canSelectAll={false}
        />
      )}
      {showDeletePopup && (
        <ConfirmationPopup onClickHandler={deleteStatementHandler} setConfirmationPopup={setShowDeletePopup} item={fetchedStatement.name} />
      )}
    </>
  );
};

export default ViewBankStatement;
