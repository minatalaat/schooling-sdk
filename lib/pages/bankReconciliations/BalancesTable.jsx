import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatFloatNumber } from '../../utils/helpers';

const BalancesTable = ({ values }) => {
  const { t } = useTranslation();

  return (
    <div className="col-md-12">
      <div className="tab-content d-block" id="pills-tabContent">
        <div
          className="table-responsive table-responsive-new fade show active"
          id="pills-home"
          role="tabpanel"
          aria-labelledby="pills-home-tab"
        >
          <table className="table table-responsive-stack dataTable" id="tableOne">
            <thead>
              <tr>
                <th>{t('LBL_BANK_STATEMENT')}</th>
                <th></th>
                <th>{t('LBL_ACCOUNTING')}</th>
              </tr>
            </thead>
            <tbody id="table_detail">
              <tr>
                <td>{formatFloatNumber(values.statementReconciledLineBalance)}</td>
                <td>{t('LBL_ALREADY_RECONCILED')}</td>
                <td>{formatFloatNumber(values.movesReconciledLineBalance)}</td>
              </tr>
              <tr>
                <td>{formatFloatNumber(values.statementUnreconciledLineBalance)}</td>
                <td>{t('LBL_NOT_RECONCILED_ONGOING')}</td>
                <td>{formatFloatNumber(values.movesUnreconciledLineBalance)}</td>
              </tr>
              <tr>
                <td>{formatFloatNumber(values.statementOngoingReconciledBalance)}</td>
                <td>{t('LBL_ONGOING')}</td>
                <td>{formatFloatNumber(values.movesOngoingReconciledBalance)}</td>
              </tr>
              <tr>
                <td>{formatFloatNumber(values.statementAmountRemainingToReconcile)}</td>
                <td>{t('LBL_REMAINS_TO_RECONCILE')}</td>
                <td>{formatFloatNumber(values.movesAmountRemainingToReconcile)}</td>
              </tr>
              <tr>
                <td>{formatFloatNumber(values.statementTheoreticalBalance)}</td>
                <td>{t('LBL_NEW_THEORETICAL_BALANCE')}</td>
                <td>{formatFloatNumber(values.movesTheoreticalBalance)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BalancesTable;
