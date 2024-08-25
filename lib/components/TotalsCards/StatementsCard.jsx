import React from 'react';
import { formatFloatNumber } from '../../utils/helpers';
import { useTranslation } from 'react-i18next';
import TotalsCardItem from './TotalsCardItem';

const StatementsCard = ({ openingBalance, closingBalance }) => {
  const { t } = useTranslation();
  return (
    <div className="card total-card head-page">
      <div className="row">
        <div className="col-md-12">
          <div className="row d-flex flex-row justify-content-start align-items-center gap-3">
            <div className="col-md-3 py-0">
              <TotalsCardItem title={t('LBL_OPENING_BAlANCE')} content={`${formatFloatNumber(openingBalance)} ${t('LBL_SAR')}`} />
            </div>
            <div className="col-md-3 py-0">
              <TotalsCardItem title={t('LBL_CLOSING_BAlANCE')} content={`${formatFloatNumber(closingBalance)} ${t('LBL_SAR')}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatementsCard;
