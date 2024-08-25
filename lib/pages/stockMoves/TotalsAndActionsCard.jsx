import React from 'react';
import { formatFloatNumber } from '../../utils/helpers';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import ValueCard from '../../components/ui/inputs/ValueCard';
import { INVOICING_STATUS_ENUM } from '../../constants/enums/StockMoveEnums';

const TotalsAndActionsCard = ({
  mode = 'view',
  fetchedObject,
  onGenerateInvoiceClick,
  onCancelClick,
  isBtnDisabled,
  isInvoiceAndReverseEnabled,
}) => {
  const { t } = useTranslation();
  let exTaxTotal = useSelector(state => state.stockMoveLines.exTaxTotal);

  let isGenerateInvoiceEnabled =
    fetchedObject?.statusSelect === 3 &&
    fetchedObject?.invoicingStatusSelect < 2 &&
    !fetchedObject?.isReversion &&
    isInvoiceAndReverseEnabled;
  let isCancelEnabled = fetchedObject?.statusSelect === 2;

  return (
    <div className="card right-more">
      <div className="row">
        <div className="col-md-12">
          <ValueCard title="LBL_TOTAL_WITHOUT_TAX" content={`${formatFloatNumber(exTaxTotal ?? 0) || 0} ${t('LBL_SAR')}`} />
          <ValueCard title="LBL_INVOICING_STATUS" content={t(INVOICING_STATUS_ENUM[fetchedObject?.invoicingStatusSelect ?? 0])} />
          {mode === 'edit' && (
            <>
              {(isGenerateInvoiceEnabled || isCancelEnabled) && <div className="border-solid"></div>}
              <div className="actionbtn-right-page">
                {isGenerateInvoiceEnabled && (
                  <button className="btn btn-req btn-w-100" onClick={onGenerateInvoiceClick} disabled={isBtnDisabled}>
                    {t('LBL_GENERATE_STOCK_INVOICE')}
                  </button>
                )}
                {isCancelEnabled && (
                  <button className="btn btn-cancel btn-w-100" onClick={onCancelClick} disabled={isBtnDisabled}>
                    {t('LBL_CANCEL')}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TotalsAndActionsCard;
