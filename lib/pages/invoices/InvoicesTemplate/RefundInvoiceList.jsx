import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatFloatNumber } from '../../../utils/helpers';
import { useEffect } from 'react';
import { invoiceStatusEnum, refundStatusEnum } from '../../../constants/enums/InvoicingEnums';
import ImageWithSkeleton from '../../../components/ui/skeletons/ImageWithSkeleton';
import viewIconBtn from '../../../assets/images/view-icon.svg';
import { useFeatures } from '../../../hooks/useFeatures';
import { useNavigate } from 'react-router-dom';

function RefundInvoiceList({ fetchedInvoice, showRows, setShowRows, type }) {
  const { t } = useTranslation();
  const [windosSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);
  const navigate = useNavigate();
  const { canView, getFeaturePath } = useFeatures('INVOICES', type);

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

  const handleNavigate = data => {
    navigate(
      getFeaturePath(type, 'view', {
        id: data.id,
        status: data ? (data.statusSelect ? invoiceStatusEnum[data.statusSelect] : 'Draft') : 'Draft',
      })
    );
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
          <h4>
            {type === 'CUSTOMERS_INVOICES' || type === 'SUPPLIERS_INVOICES'
              ? t('LBL_INVOICE_LIST')
              : type === 'CUSTOMERS_REFUNDS'
                ? t('LBL_INVOICE_REFUND_LIST')
                : t('LBL_SUPPLIER_REFUNDS_LIST')}
          </h4>
        </div>
      </div>
      <div className="tab-content d-block" id="pills-tabContent">
        {windosSize[0] > 1200 && (
          <div className="table-responsive table-responsive-new fade show active">
            <table className="table table-responsive-stack dataTable" id="tableOne">
              <thead>
                <tr>
                  <th>
                    {t('LBL_INVOICE_NUMBER')} <span className="spacex">:</span>
                  </th>
                  <th>
                    {type === 'CUSTOMERS_INVOICES' || type === 'CUSTOMERS_REFUNDS' ? t('LBL_CUSTOMER') : t('LBL_SUPPLIER')}{' '}
                    <span className="spacex">:</span>
                  </th>

                  <th>
                    {t('LBL_CURRENCY')} <span className="spacex">:</span>
                  </th>
                  <th>
                    {t('LBL_PAYMENT_MODE')} <span className="spacex">:</span>
                  </th>
                  <th>
                    {t('LBL_INVOICE_DATE')} <span className="spacex">:</span>
                  </th>
                  <th>
                    {t('Invoicing_Duedate')} <span className="spacex">:</span>
                  </th>
                  <th>
                    {t('LBL_TOTAL_WITH_TAX')} <span className="spacex">:</span>
                  </th>

                  <th>
                    {t('LBL_STATUS')} <span className="spacex">:</span>
                  </th>
                  {canView && <th></th>}
                </tr>
              </thead>
              <tbody id="table_detail">
                {fetchedInvoice.refundInvoiceList &&
                  fetchedInvoice.refundInvoiceList
                    .filter(line => line.statusSelect === 3)
                    .map(line => {
                      return (
                        <tr key={line?.invoiceId}>
                          <td>{line.invoiceId ? (line.invoiceId ? line.invoiceId : '') : ''}</td>
                          <td>{line.partner ? (line.partner.fullName ? line.partner.fullName : '') : ''}</td>
                          <td>{line.currency ? (line.currency.name ? line.currency.name : '') : ''}</td>
                          <td>{line.paymentMode ? (line.paymentMode.name ? line.paymentMode.name : '') : ''}</td>
                          <td>{line.invoiceDate ? line.invoiceDate : ''}</td>
                          <td>{line.dueDate ? line.dueDate : ''}</td>
                          <td>{line.inTaxTotal ? formatFloatNumber(parseFloat(line.inTaxTotal).toFixed(2).toString()) : ''}</td>

                          <td>{line ? (line.statusSelect ? t(refundStatusEnum[line.statusSelect]) : '') : ''}</td>

                          {canView && (
                            <td>
                              <div className="table-action-button float-end">
                                <button type="button" className="clickable btn" onClick={() => handleNavigate(line)} title={t('LBL_VIEW')}>
                                  <ImageWithSkeleton imgSrc={viewIconBtn} imgAlt="view-icon" isListIcon={true} />
                                </button>
                              </div>
                            </td>
                          )}
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
                  <th>{t('LBL_INVOICE_REFUND_LIST')}</th>
                  {/* <th></th> */}
                </tr>
              </thead>
              <tbody>
                {fetchedInvoice.refundInvoiceList &&
                  fetchedInvoice.refundInvoiceList
                    .filter(line => line.statusSelect === 3)
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
                            <td colSpan="2">{line.invoiceId ? (line.invoiceId ? line.invoiceId : '') : ''}</td>
                          </tr>
                          {showRows.indexOf(parseInt(i)) > -1 && (
                            <>
                              <tr id="id-1" className="show">
                                <td>{t('LBL_INVOICE_NUMBER')}</td>
                                <td colSpan="3">{line.invoiceId ? (line.invoiceId ? line.invoiceId : '') : ''}</td>
                                {/* <td></td> */}
                              </tr>
                              <tr id="id-2" className="show">
                                <td>{t('LBL_CUSTOMER')}</td>
                                <td colSpan="3">{line.partner ? (line.partner.fullName ? line.partner.fullName : '') : ''}</td>
                                {/* <td></td> */}
                              </tr>
                              <tr id="id-3" className="show">
                                <td>{t('LBL_CURRENCY')}</td>
                                <td colSpan="3">{line.currency ? (line.currency.name ? line.currency.name : '') : ''}</td>
                                {/* <td></td> */}
                              </tr>
                              <tr id="id-4" className="show">
                                <td>{t('LBL_PAYMENT_MODE')}</td>
                                <td colSpan="3">{line.paymentMode ? (line.paymentMode.name ? line.paymentMode.name : '') : ''}</td>
                                {/* <td></td> */}
                              </tr>
                              <tr id="id-5" className="show">
                                <td>{t('LBL_INVOICE_DATE')}</td>
                                <td colSpan="3">{line.invoiceDate ? line.invoiceDate : ''}</td>
                                {/* <td></td> */}
                              </tr>
                              <tr id="id-6" className="show">
                                <td>{t('Invoicing_Duedate')}</td>
                                <td colSpan="3">{line.dueDate ? line.dueDate : ''}</td>
                                {/* <td></td> */}
                              </tr>
                              <tr id="id-6" className="show">
                                <td>{t('LBL_TOTAL_WITH_TAX')}</td>
                                <td colSpan="3" className="color-text-red">
                                  {line.inTaxTotal ? formatFloatNumber(parseFloat(line.inTaxTotal).toFixed(2).toString()) : ''}
                                </td>
                                {/* <td></td> */}
                              </tr>
                              <tr id="id-6" className="show">
                                <td>{t('LBL_STATUS')}</td>
                                <td colSpan="3">{line ? (line.statusSelect ? t(refundStatusEnum[line.statusSelect]) : '') : ''}</td>
                                {/* <td></td> */}
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

export default RefundInvoiceList;
