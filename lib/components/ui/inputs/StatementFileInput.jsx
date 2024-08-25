import { useTranslation } from 'react-i18next';

import ErrorMessage from './ErrorMessage';

import { FaFileDownload } from 'react-icons/fa';

const StatementFileInput = ({
  formik,
  mode,
  label,
  accessor,
  handleClearFile,
  handleChange,
  fetchedStatement,
  enableDownload,
  downloadStatement,
}) => {
  const { t } = useTranslation();
  return (
    <>
      {mode !== 'view' && (
        <>
          <label className="form-label" htmlFor="full-name">
            {t('LBL_PLEASE_UPLOAD_STATEMENT')}
            <b>{t(label)}</b>
            <span>*</span>
          </label>
          <div className="input-group">
            <span className="input-group-btn">
              <div className="btn btn-default browse-button">
                <span className="browse-button-text">
                  <i className="fa fa-folder-open"></i>
                  {/* {t('LBL_BROWSE')} */}
                </span>
                <input
                  type="file"
                  className="uploadfile"
                  accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  name="uploadedFile"
                  onChange={e => {
                    if (e.currentTarget.files[0]) {
                      handleChange(e);
                      e.currentTarget.value = '';
                    } else {
                      handleClearFile();
                    }
                  }}
                  onBlur={formik.handleBlur}
                />
              </div>
              {formik.values[accessor] && formik.values[accessor].name && (
                <button
                  type="button"
                  className="btn btn-default clear-button"
                  onClick={() => {
                    handleClearFile();
                  }}
                >
                  <span className="browse-button-text">
                    <i className="fa fa-times"></i>
                  </span>
                </button>
              )}
            </span>
            <input
              type="text"
              className="form-control filename"
              disabled="disabled"
              placeholder={t('LBL_PLEASE_CLICK_BROWSE')}
              value={formik.values[accessor]?.name ?? t('LBL_PLEASE_CLICK_BROWSE')}
            />
            {enableDownload && fetchedStatement?.bankStatementFile?.fileName && (
              <span className="input-group-btn">
                <button className="btn btn-primary upload-button" type="button" onClick={downloadStatement}>
                  <FaFileDownload size={24} style={{ color: 'white' }} />
                </button>
              </span>
            )}
          </div>
        </>
      )}
      {mode === 'view' && (
        <>
          <div className="search-ex">
            <label className="form-label" htmlFor="full-name">
              {t('LBL_BANK_STATEMENT')}
            </label>
            {formik.values[accessor]?.name?.length > 0 && (
              <button
                className="btn"
                type="button"
                data-bs-toggle="modal"
                data-bs-target="#open-bank-details"
                style={{ backgroundColor: '#fff' }}
                onClick={downloadStatement}
              >
                <FaFileDownload size={24} style={{ color: '#0984e3' }} />
              </button>
            )}
            <input
              type="text"
              name="uploadedFile"
              value={formik.values[accessor]}
              disabled
              className="form-control"
              id="Label"
              placeholder=""
            />
          </div>
        </>
      )}
      <ErrorMessage formik={formik} mode={mode} identifier={accessor} />
    </>
  );
};

export default StatementFileInput;
