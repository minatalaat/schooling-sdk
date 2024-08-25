import { useTranslation } from 'react-i18next';
import { formatFloatNumber } from '../../utils/helpers';
import ExtraInfoItem from '../../components/ui/ExtraInfoItem';

const BalancesRow = ({ values }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="col-md-12 mb-4 clearfix">
        <div className="title-section float-start">
          <h4>{t('LBL_BALANCE')} </h4>
        </div>
      </div>
      <div className="row">
        <div className="col-md-3">
          <ExtraInfoItem label="LBL_TOTAL_PAID" value={formatFloatNumber(values.totalPaid)} />
        </div>
        <div className="col-md-3">
          <ExtraInfoItem label="LBL_TOTAL_CASHED" value={formatFloatNumber(values.totalCashed)} />
        </div>
        <div className="col-md-3">
          <ExtraInfoItem label="LBL_BANK_STARTING_BALANCE" value={formatFloatNumber(values.startingBalance)} />
        </div>
        <div className="col-md-3">
          <ExtraInfoItem label="LBL_BANK_ENDING_BALANCE" value={formatFloatNumber(values.endingBalance)} />
        </div>
      </div>
    </>
  );
};

export default BalancesRow;
