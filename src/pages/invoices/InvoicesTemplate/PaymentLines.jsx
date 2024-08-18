import { useEffect } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatFloatNumber } from '../../../utils/helpers';
import { paymentStatusSelectEnum } from '../../../constants/enums/InvoicingEnums';

function PaymentLines({ fetchedInvoice, showRows, setShowRows }) {
  const { t } = useTranslation();
  const [windosSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);

  const toggleShowHiddenRow = id => {
    let tempRows = [...showRows];
    let index = tempRows.indexOf(id);

    if (index > -1) {
      tempRows.splice(index, 1);
    } else {
      tempRows.push(id);
    }

    setShowRows([...tempRows]);
  };

  useEffect(() => {
    const handleWindowResize = () => {
      setWindowSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  });

  return (
    <>
      <div className="row d-contents">
        <div className="col-md-6 section-title mt-4">
          <h4>{t('LBL_PAYMENTS_DETAILS')}</h4>
        </div>
      </div>
      <div className="tab-content d-block" id="pills-tabContent">
        {windosSize[0] > 1200 && (
          <div className="table-responsive table-responsive-new fade show active">
            <table className="table table-responsive-stack dataTable" id="tableOne">
              <thead>
                <tr>
                  <th>{t('LBL_DATE')}</th>
                  <th>{t('LBL_AMOUNT')}</th>
                  <th>{t('LBL_CURRENCY')}</th>
                  <th>{t('LBL_PAYMENT_MODE')}</th>
                  <th>{t('LBL_BANK_DETAILS')}</th>
                  <th>{t('LBL_STATUS')}</th>
                </tr>
              </thead>
              <tbody id="table_detail">
                {fetchedInvoice.invoicePaymentList &&
                  fetchedInvoice.invoicePaymentList
                    .filter(payment => payment.typeSelect === 2)
                    .map(line => {
                      return (
                        <tr key={line.id}>
                          <td>{line?.paymentDate ?? ''}</td>
                          <td>{line ? formatFloatNumber(line.amount) : ''}</td>
                          <td>{line.currency?.name ?? ''}</td>
                          <td>{line.paymentMode?.name ?? ''}</td>
                          <td>{line.companyBankDetails?.fullName ?? ''}</td>
                          <td>{line.statusSelect ? t(paymentStatusSelectEnum[line.statusSelect]) : ''}</td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        )}
        {windosSize[0] <= 1200 && (
          <div
            className="table-responsive table-responsive-new show active"
            id="pills-home"
            role="tabpanel"
            aria-labelledby="pills-home-tab"
          >
            <table id="table-mobile" className="table table-responsive-stack dataTable">
              <thead>
                <tr>
                  <th width="40%">#</th>
                  <th>{t('LBL_PAYMENTS_DETAILS')}</th>
                </tr>
              </thead>
              <tbody>
                {fetchedInvoice.invoicePaymentList &&
                  fetchedInvoice.invoicePaymentList
                    .filter(payment => payment.typeSelect === 2)
                    .map((line, i) => {
                      return (
                        <>
                          <tr className={showRows.indexOf(parseInt(i)) > -1 ? 'open' : ''}>
                            <td>
                              <button
                                type="button"
                                id="row-mob-1"
                                className="btn-toggle"
                                aria-expanded={showRows.indexOf(parseInt(i)) > -1 ? 'true' : 'false'}
                                aria-controls="id-1 id-2 id-3 id-4 id-5 id-6"
                                onClick={() => {
                                  toggleShowHiddenRow(parseInt(i));
                                }}
                              >
                                <i className="icon"></i>
                              </button>
                            </td>
                            <td colSpan={2}>{line.amount ? formatFloatNumber(line.amount) : ''}</td>
                          </tr>
                          {showRows.indexOf(parseInt(i)) > -1 && (
                            <>
                              <tr id="id-1" className="show">
                                <td>{t('LBL_DATE')}</td>
                                <td colSpan="3">{line.paymentDate ? (line.paymentDate ? line.paymentDate : '') : ''}</td>
                              </tr>
                              <tr id="id-2" className="show">
                                <td>{t('LBL_AMOUNT')}</td>
                                <td colSpan="3">{line.amount ? formatFloatNumber(parseFloat(line.amount).toFixed(2).toString()) : ''}</td>
                              </tr>
                              <tr id="id-3" className="show">
                                <td>{t('LBL_CURRENCY')}</td>
                                <td colSpan="3">{line.currency ? (line.currency.name ? line.currency.name : '') : ''}</td>
                              </tr>
                              <tr id="id-4" className="show">
                                <td>{t('LBL_PAYMENT_MODE')}</td>
                                <td colSpan="3">{line.paymentMode ? (line.paymentMode.name ? line.paymentMode.name : '') : ''}</td>
                              </tr>
                              <tr id="id-6" className="show">
                                <td>{t('LBL_BANK_DETAILS')}</td>
                                <td colSpan="3">
                                  {line.companyBankDetails
                                    ? line.companyBankDetails.fullName
                                      ? line.companyBankDetails.fullName
                                      : ''
                                    : ''}
                                </td>
                              </tr>

                              <tr id="id-6" className="show">
                                <td>{t('LBL_STATUS')}</td>
                                <td colSpan="3">{line.statusSelect ? t(paymentStatusSelectEnum[line.statusSelect]) : ''}</td>
                              </tr>
                            </>
                          )}
                        </>
                      );
                    })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export default PaymentLines;
