import { useTranslation } from 'react-i18next';

import NoDataAvailable from '../../components/NoDataAvailable';

import ArrowRed from '../../assets/images/arrow-red.svg';
import ArrowGreen from '../../assets/images/arrow-green.svg';

import { formatFloatNumber } from '../../utils/helpers';

const MoveLines = ({ currentMoveLines, validateClicked, onMoveLineSelect }) => {
  const { t } = useTranslation();
  return (
    <div className="table-responsive table-responsive-xxl supplier-po-request">
      <table className="table table-bordered">
        <thead>
          <tr>
            <th width="50"></th>
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
            currentMoveLines.map((moveline, index) => {
              return (
                <>
                  <tr className={validateClicked && (!moveline.postedNbr || moveline.postedNbr.length === 0) ? 'unreconciled-lines' : ''}>
                    <td>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="chkOrgRow"
                        value=""
                        id="defaultCheck1"
                        checked={moveline.isSelectedBankReconciliation}
                        onClick={() => onMoveLineSelect(moveline)}
                      />
                    </td>
                    <td>{moveline.postedNbr ?? ''}</td>
                    <td>{moveline.date}</td>
                    <td>{moveline.name}</td>
                    <td className="color-text-green">{formatFloatNumber(moveline.debit)}</td>
                    <td className="color-text-red">{formatFloatNumber(moveline.credit)}</td>
                  </tr>{' '}
                </>
              );
            })}
        </tbody>
      </table>
      {currentMoveLines && currentMoveLines.length === 0 && <NoDataAvailable />}
    </div>
  );
};

export default MoveLines;
