import React from 'react';
import { formatFloatNumber } from '../../utils/helpers';
import { useTranslation } from 'react-i18next';
import TotalsCardItem from './TotalsCardItem';

const InvoicesTaxTotals = ({ totalWithoutTax, totalTax, totalWithTax }) => {
  const { t } = useTranslation();
  return (
    <div className="card total-card head-page">
      <div className="row">
        <div className="col-md-12">
          <div className="row">
            <div className="col-md-4">
              <TotalsCardItem title={t('LBL_TOTAL_WITHOUT_TAX')} content={`${formatFloatNumber(totalWithoutTax)} ${t('LBL_SAR')}`} />
            </div>
            <div className="col-md-4">
              <TotalsCardItem
                title={t('LBL_TOTAL_TAX')}
                content={`${formatFloatNumber(totalTax)} ${t('LBL_SAR')}`}
                contentColor="color-text-red"
              />
            </div>
            <div className="col-md-4">
              <TotalsCardItem title={t('LBL_TOTAL_WITH_TAX')} content={`${formatFloatNumber(totalWithTax)} ${t('LBL_SAR')}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicesTaxTotals;
