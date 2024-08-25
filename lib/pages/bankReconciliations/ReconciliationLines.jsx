import { useTranslation } from 'react-i18next';

import NoDataAvailable from '../../components/NoDataAvailable';

import ArrowRed from '../../assets/images/arrow-red.svg';
import ArrowGreen from '../../assets/images/arrow-green.svg';

import { formatFloatNumber } from '../../utils/helpers';

const ReconciliationLines = ({ currentReconciliationLines, validateClicked, onReconciliationLineSelect }) => {
  const { t } = useTranslation();
  return (
    <div className="table-responsive table-responsive-xxl supplier-po-request">
      <table className="table table-bordered">
        <thead>
          <tr>
            <th width="50"></th>
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
                  <tr
                    className={
                      validateClicked && (!reconciledLine.postedNbr || reconciledLine.postedNbr.length === 0) ? 'unreconciled-lines' : ''
                    }
                  >
                    <td>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="chkOrgRow"
                        value=""
                        id="defaultCheck1"
                        checked={reconciledLine.isSelectedBankReconciliation}
                        onClick={() => onReconciliationLineSelect(reconciledLine)}
                      />
                    </td>
                    <td>{reconciledLine.postedNbr ?? ''}</td>
                    <td>{reconciledLine.effectDate}</td>
                    <td>{reconciledLine.name}</td>
                    <td className="color-text-red">{formatFloatNumber(reconciledLine.debit)}</td>
                    <td className="color-text-green">{formatFloatNumber(reconciledLine.credit)}</td>
                    <td>{reconciledLine.moveLine?.name ?? ''}</td>
                  </tr>{' '}
                </>
              );
            })}
        </tbody>
      </table>
      {currentReconciliationLines && currentReconciliationLines.length === 0 && <NoDataAvailable />}
    </div>
  );
};

export default ReconciliationLines;
