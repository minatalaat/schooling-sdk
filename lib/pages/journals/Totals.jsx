import ExtraInfoItem from '../../components/ui/ExtraInfoItem';

import { formatFloatNumber } from '../../utils/helpers';

const Totals = ({ totals }) => {
  let { difference, totalCredit, totalDebit, totalLines } = totals;

  return (
    <div className="card head-page">
      <div className="row">
        <div className="col-md-3">
          <ExtraInfoItem label="LBL_TOTAL_LINES" value={totalLines} />
        </div>
        {totalDebit && (
          <div className="col-md-3">
            <ExtraInfoItem label="LBL_TOTAL_DEBIT" value={formatFloatNumber(totalDebit)} />
          </div>
        )}
        {totalCredit && (
          <div className="col-md-3">
            <ExtraInfoItem label="LBL_TOTAL_CREDIT" value={formatFloatNumber(totalCredit)} />
          </div>
        )}
        {difference && (
          <div className="col-md-3">
            <ExtraInfoItem
              label="LBL_DIFFERENCE"
              value={formatFloatNumber(difference)}
              valueClassName={parseInt(difference) === 0 ? '' : 'color-text-red'}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Totals;
