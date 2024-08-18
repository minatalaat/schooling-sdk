import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import NoDataAvailable from '../../components/NoDataAvailable';

import ArrowRed from '../../assets/images/arrow-red.svg';
import ArrowGreen from '../../assets/images/arrow-green.svg';

import { formatFloatNumber } from '../../utils/helpers';

const StatementLines = ({ statementLines, formik, runBankReconciliation }) => {
  const { t } = useTranslation();

  const LINE_TYPE_SELECT = ['', 'LBL_STARTING_BALANCE', 'LBL_MOVEMENT', 'LBL_ENDING_BALANCE'];
  return (
    <>
      <div className="col-md-12 mt-3 mb-3">
        <div className="title-section float-start">
          <h4>{t('LBL_BANK_STATEMENT_LINES')}</h4>
        </div>
        {formik.values.statusSelect >= 2 && (
          <div className="action-btn-new-head float-end">
            <Link className="btn btn-add-new" onClick={runBankReconciliation}>
              <i className="add-icon"></i>
              {t('LBL_RUN_BANK_RECONCILIATION')}
            </Link>
          </div>
        )}
      </div>
      <div className="table-responsive table-responsive-xxl supplier-po-request">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>{t('LBL_SEQUENCE')}</th>
              <th>{t('LBL_LINE_TYPE')}</th>
              <th>{t('LBL_OPERATION_DATE')}</th>
              <th>{t('LBL_AMOUNT_REMAINING_RECONCILIATION')}</th>
              <th>{t('LBL_CURRENCY')}</th>
              <th>
                {t('LBL_DEBIT')} <img src={ArrowRed} alt="red-arrow" />
              </th>
              <th>
                {t('LBL_CREDIT')} <img src={ArrowGreen} alt="green-arrow" />
              </th>
            </tr>
          </thead>
          <tbody>
            {statementLines &&
              statementLines.map(statementLine => {
                return (
                  <tr>
                    <td>{statementLine.sequence}</td>
                    <td>{t(LINE_TYPE_SELECT[statementLine.lineTypeSelect])}</td>
                    <td>{statementLine.operationDate}</td>
                    <td>{formatFloatNumber(statementLine.amountRemainToReconcile)}</td>
                    <td>{statementLine['currency.code'] ? statementLine['currency.code'] : ''}</td>
                    <td className="color-text-red">{formatFloatNumber(statementLine.debit)}</td>
                    <td className="color-text-green">{formatFloatNumber(statementLine.credit)}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
        {statementLines && statementLines.length === 0 && <NoDataAvailable />}
      </div>
    </>
  );
};

export default StatementLines;
