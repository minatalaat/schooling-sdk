import React from 'react';
import { formatFloatNumber } from '../../utils/helpers';
import { useTranslation } from 'react-i18next';
import TotalsCardItem from './TotalsCardItem';
import { zatcaStatusEnum } from '../../constants/enums/InvoicingEnums';

const InvoicesTaxTotalsTop = ({ zatcaIsEnabled, fetchedInvoice, totalWithTax, amountRemaining }) => {
  const { t } = useTranslation();
  return (
    <div className="card total-card head-page">
      <div className="row">
        <div className="col-md-12">
          <div className="row">
            {fetchedInvoice && fetchedInvoice?.originalInvoice?.invoiceId && (
              <div className="col-md-3">
                <TotalsCardItem title="LBL_ORIGINAL_INVOICE" content={fetchedInvoice?.originalInvoice?.invoiceId} />
              </div>
            )}
            <div className="col-md-3">
              <TotalsCardItem title={t('LBL_TOTAL_WITH_TAX')} content={`${formatFloatNumber(totalWithTax)} ${t('LBL_SAR')}`} />
            </div>
            {fetchedInvoice && fetchedInvoice?.statusSelect !== 1 && (
              <div className="col-md-3">
                <TotalsCardItem title={t('LBL_REMAINING_AMOUNT')} content={`${formatFloatNumber(amountRemaining)} ${t('LBL_SAR')}`} />
              </div>
            )}
            {zatcaIsEnabled && fetchedInvoice && fetchedInvoice?.zatcaIntegrationStatus?.status !== 'REPORTED' && (
              <div className="col-md-3">
                <TotalsCardItem
                  title="LBL_ZATCA_REPORTING_STATUS"
                  content={t(zatcaStatusEnum[fetchedInvoice?.zatcaIntegrationStatus?.status])}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicesTaxTotalsTop;
