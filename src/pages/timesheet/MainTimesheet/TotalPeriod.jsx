import React from 'react';
import { useTranslation } from 'react-i18next';

import TotalsCardItem from '../../../components/TotalsCards/TotalsCardItem';

import { formatFloatNumber } from '../../../utils/helpers';

function TotalPeriod({ totalPeriod }) {
  const { t } = useTranslation();
  return (
    <div className="card total-card head-page">
      <div className="row">
        <div className="col-md-12">
          <div className="row">
            <div className="col-md-4">
              <TotalsCardItem title={t('LBL_TOTAL_PERIOD_IN_HOURS')} content={formatFloatNumber(totalPeriod)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TotalPeriod;
