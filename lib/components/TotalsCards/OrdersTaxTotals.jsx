import { formatFloatNumber } from '../../utils/helpers';
import { useTranslation } from 'react-i18next';
import { RECEIPT_STATE_ENUM, DELIVERY_STATE_ENUM } from '../../constants/enums/StockMoveEnums';

const OrdersTaxTotals = ({
  totalWithoutTax,
  totalTax,
  totalWithTax,
  type,
  mode = 'view',
  status,
  fetchedObject,
  onFinishClick,
  onCancelClick,
  isBtnDisabled,
}) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="card right-more">
        <div className="row">
          <div className="col-md-12">
            <div className="list-info">
              <div className="list">
                {type === 'po' && (
                  <>
                    <p>{t('LBL_RECEIPT_STATE')}</p>
                    <h4>{t(RECEIPT_STATE_ENUM[fetchedObject?.receiptState ?? 1])}</h4>
                  </>
                )}
                {type === 'so' && (
                  <>
                    <p>{t('LBL_DELIVERY_STATE')}</p>
                    <h4>{t(DELIVERY_STATE_ENUM[fetchedObject?.deliveryState ?? 1])}</h4>
                  </>
                )}
              </div>
            </div>
            <div className="border-solid"></div>
            <div className="list-info">
              <div className="list">
                <p>{t('LBL_TOTAL_WITHOUT_TAX')}</p>
                <h4>{`${formatFloatNumber(parseFloat(totalWithoutTax).toFixed(2).toString())}  ${t('LBL_SAR')}`}</h4>
              </div>
              <div className="list bold">
                <p>{t('LBL_TOTAL_TAX')}</p>
                <h4>{`${formatFloatNumber(parseFloat(totalTax).toFixed(2).toString())}  ${t('LBL_SAR')}`}</h4>
              </div>
              <div className="list">
                <p>{t('LBL_TOTAL_WITH_TAX')}</p>
                <h4>{`${formatFloatNumber(parseFloat(totalWithTax).toFixed(2).toString())} ${t('LBL_SAR')}`}</h4>
              </div>
            </div>
            {mode === 'edit' && (
              <>
                {onCancelClick && type === 'so' && (status === 'Draft' || status === 'Finished') && (
                  <>
                    <div className="border-solid"></div>
                    <div className="actionbtn-right-page">
                      <button className="btn btn-cancel btn-w-100" onClick={onCancelClick} disabled={isBtnDisabled}>
                        {t('LBL_CANCEL')}
                      </button>
                    </div>
                  </>
                )}
                {type === 'po' && status === 'Validated' && (
                  <>
                    <div className="border-solid"></div>
                    <div className="actionbtn-right-page">
                      <button className="btn btn-req btn-w-100" onClick={onFinishClick} disabled={isBtnDisabled}>
                        {t('LBL_FINISH_PO')}
                      </button>

                      {onCancelClick && fetchedObject?.amountInvoiced && fetchedObject.amountInvoiced !== fetchedObject.exTaxTotal && (
                        <button className="btn btn-cancel btn-w-100" onClick={onCancelClick} disabled={isBtnDisabled}>
                          {t('LBL_CANCEL')}
                        </button>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OrdersTaxTotals;
