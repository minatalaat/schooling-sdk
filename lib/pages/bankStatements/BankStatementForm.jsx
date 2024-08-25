import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import TextInput from '../../components/ui/inputs/TextInput';
import DateInput from '../../components/ui/inputs/DateInput';
import StatementFileInput from '../../components/ui/inputs/StatementFileInput';
import SearchModalAxelor from '../../components/ui/inputs/SearchModal/SearchModalAxelor';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';
import FormNotes from '../../components/ui/FormNotes';

import { FILE_FORMAT_SELECT } from '../../constants/enums/StatementEnums';

import { useAxiosFunction } from '../../hooks/useAxios';
import { checkFlashOrError } from '../../utils/helpers';
import { setFieldValue } from '../../utils/formHelpers';
import { MODELS } from '../../constants/models';
import { getActionUrl } from '../../services/getUrl';

import { FaFileDownload } from 'react-icons/fa';
import StatementLines from './StatementLines';
import MoveLines from './MoveLines';

const BankStatementForm = ({
  formik,
  mode,
  alertHandler,
  disableImport,
  onImportClick,
  setDisableImport,
  fetchedStatement,
  runBankReconciliation,
  moveLines,
  statementLines,
  setIsAutoReconcile,
}) => {
  const { t } = useTranslation();
  const { api, downloadDocument } = useAxiosFunction();
  const [bsLabel, setBSLabel] = useState('LBL_BANK_STATEMENT_LITE');
  const [enableDownload, setEnableDownload] = useState(true);
  const [fromDateDisabled, setFromDateDisabled] = useState(true);

  const onGetFileFormatSuccess = response => {
    let status = response.data.status;
    let data = response.data.data || [];
    let total = response.data.total;

    if (status !== 0 || total === undefined || total === null) {
      return alertHandler('Error', t('LBL_ERROR_LOADING_FILE_FORMAT'));
    }

    return { displayedData: [...data], total: response?.data?.total || 0 };
  };

  const onGetBankDetailsSuccess = response => {
    let status = response.data.status;
    let data = response.data.data;
    let total = response.data.total;

    if (status !== 0 || total === undefined || total === null) {
      return alertHandler('Error', t('LBL_ERROR_LOADING_BANK_DETAILS'));
    }

    let tempData = [];

    if (data) {
      data.forEach(detail => {
        let obj = {
          ...detail,
          swiftAddress: detail['bankAddress.fullAddress'] ?? '',
          bic: detail['bank.code'] ?? '',
          id: detail.id,
        };
        tempData.push(obj);
      });
    }

    return { displayedData: [...tempData], total: response?.data?.total || 0 };
  };

  const onBankDetailsChangePayload = bankDetails => {
    let payload = {
      model: MODELS.BANK_RECONCILIATION,
      action: 'action-bank-reconciliatoin-initial-data',
      data: {
        context: {
          _model: MODELS.BANK_RECONCILIATION,
          bankDetails: {
            id: bankDetails.id,
          },
        },
      },
    };
    return payload;
  };

  const onBankDetailsChange = async bankDetails => {
    const response = await api('POST', getActionUrl(), onBankDetailsChangePayload(bankDetails));
    let status = response.data.status;
    let data = response.data.data;
    if (status !== 0 || !data) return alertHandler('Error', t('LBL_ERROR_LOADING_BANK_DETAILS'));

    if (data && checkFlashOrError(data)) {
      return alertHandler('Error', t('LBL_ERROR_LOADING_BANK_DETAILS'));
    }

    if (data) {
      if (data.fromDate && data.fromDate.length > 0) {
        setFromDateDisabled(true);
      } else {
        setFromDateDisabled(false);
      }

      await setFieldValue(formik, 'fromDate', data.fromDate?.length > 0 ? data.fromDate : '');
      await setFieldValue(formik, 'toDate', '');
    }
  };

  const handleChange = e => {
    setDisableImport(false);
    setFieldValue(formik, 'uploadedFile', e.currentTarget.files[0]);
    if (mode !== 'add') setEnableDownload(true);
  };

  const handleClearFile = () => {
    setFieldValue(formik, 'uploadedFile', {});
    setDisableImport(true);
    setEnableDownload(false);
  };

  const changeBankStatementLabel = fileFormat => {
    if (fileFormat.statementFileFormatSelect === FILE_FORMAT_SELECT[0]) setBSLabel('LBL_BANK_STATEMENT_LITE');
    else if (fileFormat.statementFileFormatSelect === FILE_FORMAT_SELECT[1]) setBSLabel('LBL_BANK_STATEMENT_RAJHI');
    else if (fileFormat.statementFileFormatSelect === FILE_FORMAT_SELECT[2]) setBSLabel('LBL_BANK_STATEMENT_INMA');
    else if (fileFormat.statementFileFormatSelect === FILE_FORMAT_SELECT[3]) setBSLabel('LBL_BANK_STATEMENT_AHLI');
  };

  const downloadStatement = () => {
    const link = document.createElement('a');
    link.target = '_blank';
    link.download = fetchedStatement.bankStatementFile.fileName;
    downloadDocument(
      fetchedStatement.id,
      fetchedStatement.bankStatementFile.id,
      MODELS.BANK_STATEMENT,
      data => {
        link.href = URL.createObjectURL(new Blob([data]));
        link.click();
      },
      () => {
        alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      }
    );
  };

  return (
    <>
      <div className="card">
        {mode !== 'view' && (
          <div className="row mb-4">
            <div className="col-md-6 ">
              <Link to="/Bank_Statement_Template_Example.xlsx" className="template-download" target="_blank" download>
                <FaFileDownload size={35} color="primary" />
              </Link>
              <label className="form-label template-download-label">
                <strong> {t('LBL_DOWNLOAD_BANK_STATMENT_TEMPLATE')}</strong>
              </label>
            </div>
          </div>
        )}
        <div className="row">
          <div className="col-md-6">
            <TextInput formik={formik} label="LBL_NAME" accessor="name" mode={mode} isRequired={true} />
          </div>
          <div className="col-md-6">
            <SearchModalAxelor
              formik={formik}
              modelKey="BANK_DETAILS"
              mode={mode}
              onSuccess={onGetBankDetailsSuccess}
              selectIdentifier="fullName"
              extraFields={['fullName', 'code', 'bankAddress', 'bank', 'bankAccount', 'bankAccount.label']}
              defaultValueConfig={null}
              isRequired={true}
              selectCallback={onBankDetailsChange}
            />
          </div>
          {formik.values.bankDetails && (
            <>
              <div className="col-md-6">
                <DateInput
                  formik={formik}
                  label="LBL_FROM"
                  accessor="fromDate"
                  mode={mode}
                  isRequired={true}
                  disabled={fromDateDisabled || mode === 'view'}
                />
              </div>
              <div className="col-md-6">
                <DateInput formik={formik} label="LBL_TO" accessor="toDate" mode={mode} isRequired={true} />
              </div>
            </>
          )}
          <div className="col-md-6">
            <SearchModalAxelor
              formik={formik}
              modelKey="FILE_FORMATS"
              mode={mode}
              onSuccess={onGetFileFormatSuccess}
              defaultValueConfig={null}
              isRequired={true}
              extraFields={['statementFileFormatSelect']}
              selectCallback={changeBankStatementLabel}
            />
          </div>
          <div className="col-md-6">
            <StatementFileInput
              formik={formik}
              mode={mode}
              label={bsLabel}
              accessor="uploadedFile"
              handleChange={handleChange}
              handleClearFile={handleClearFile}
              enableDownload={enableDownload}
              fetchedStatement={fetchedStatement}
              downloadStatement={downloadStatement}
            />
          </div>
          {mode !== 'view' && (
            <>
              <div className="col-md-12">
                <label className="form-label" htmlFor="full-name">
                  {t('LBL_CLICK_SAVE')}
                </label>
              </div>
              <div className="col-md-12">
                <label className="form-label" htmlFor="full-name">
                  {t('LBL_CLICK_IMPORT')}
                </label>
              </div>
              <div className="col-md-6"></div>
              <div className="col-md-3 mt-2">
                <PrimaryButton
                  text="LBL_MANUAL_RECONCILE"
                  theme="green"
                  className="w-100"
                  onClick={() => {
                    setIsAutoReconcile(false);
                    onImportClick();
                  }}
                  disabled={disableImport || !formik.isValid}
                />
              </div>
              <div className="col-md-3 mt-2">
                <PrimaryButton
                  text="LBL_AUTO_RECONCILE"
                  theme="green"
                  className="w-100"
                  onClick={() => {
                    setIsAutoReconcile(true);
                    onImportClick();
                  }}
                  disabled={disableImport || !formik.isValid}
                />
              </div>
            </>
          )}
          {mode === 'view' && (
            <>
              {formik.values.statusSelect >= 2 && (
                <>
                  <div className="border-section"></div>
                  <StatementLines statementLines={statementLines} formik={formik} runBankReconciliation={runBankReconciliation} />
                  <MoveLines moveLines={moveLines} />
                </>
              )}
            </>
          )}
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
    </>
  );
};

export default BankStatementForm;
