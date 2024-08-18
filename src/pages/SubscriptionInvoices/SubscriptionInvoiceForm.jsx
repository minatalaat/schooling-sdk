import { useFormik } from 'formik';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

import TextInput from '../../components/ui/inputs/TextInput';
import DateInput from '../../components/ui/inputs/DateInput';
import InnerTable from '../../components/InnerTable';
import TermsAndConditions from '../../components/TermsAndConditions/TermsAndConditions';

import { setFieldValue } from '../../utils/formHelpers';
import { formatFloatNumber } from '../../utils/helpers';
import i18next from 'i18next';

export default function SubscriptionInvoiceForm({ data, subscription, isDisablePayNow, setIsPayNow }) {
  const { t } = useTranslation();

  const [lineData, setLineData] = useState([]);
  const [showTerms, setShowTerms] = useState(false);

  const initialValues = {
    invoiceNo: (data.invoiceInfo && data.invoiceInfo.invoiceNo) || '',
    invoiceTitle: (data.invoiceInfo && data.invoiceInfo.invoiceTitle) || '',
    netAmount: (data.invoiceInfo && data.invoiceInfo.netAmount) || '',
    paidAmount: (data.invoiceInfo && data.invoiceInfo.paidAmount) || '',
    currency: (data.invoiceInfo && data.invoiceInfo.currency) || '',
    sttsName: (data.invoiceInfo && data.invoiceInfo.sttsName) || '',
    billStartDt: (data.invoiceInfo && data.invoiceInfo.billStartDt) || '',
    billEndDt: (data.invoiceInfo && data.invoiceInfo.billEndDt) || '',
    paymentDt: (data.invoiceInfo && data.invoiceInfo.paymentDt) || '',
    paymentRef: (data.invoiceInfo && data.invoiceInfo.paymentRef) || '',
    hasAgreedTerms: false,
  };

  const validationSchema = Yup.object({
    hasAgreedTerms: Yup.boolean().isTrue(),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: true,
  });

  const lineHeaders = ['LBL_TYPE', 'LBL_AMOUNT', 'LBL_TITLE', 'LBL_DESCRIPTION'];

  useEffect(() => {
    let tempData = [];
    if (!data.invoiceLineLst || data.invoiceLineLst.length === 0) return;
    data.invoiceLineLst.forEach(line => {
      tempData.push({
        tableData: [
          { value: line.itemTypCd || '', type: 'text' },
          { value: line.amount || 0, type: 'number' },
          { value: line.itemTitle || '', type: 'text' },
          { value: line.itemDesc || '', type: 'text' },
        ],
        data: line,
        key: line.invoiceLineId,
        headData: line.itemTitle || '',
      });
    });
    setLineData(tempData);
  }, []);

  return (
    <div className="row">
      <div className="col-md-8 order-2 order-md-1">
        <div className="card">
          <div className="row">
            <div className="col-md-6">
              <TextInput formik={formik} label="LBL_STATUS" accessor="sttsName" disabled={true} translate={true} />
            </div>
            <div className="col-md-6" />
            <div className="col-md-4">
              <TextInput formik={formik} label="LBL_INVOICE_NUMBER" accessor="invoiceNo" disabled={true} />
            </div>
            <div className="col-md-4">
              <TextInput formik={formik} label="LBL_NET_AMOUNT" accessor="netAmount" disabled={true} />
            </div>
            <div className="col-md-4">
              <TextInput formik={formik} label="LBL_PAID_AMOUNT" accessor="paidAmount" disabled={true} />
            </div>
            <div className="col-md-4">
              <TextInput formik={formik} label="LBL_CURRENCY" accessor="currency" disabled={true} />
            </div>
            <div className="col-md-4">
              <DateInput formik={formik} label="LBL_BILL_START_DATE" accessor="billStartDt" disabled={true} />
            </div>
            <div className="col-md-4">
              <DateInput formik={formik} label="LBL_BILL_END_DATE" accessor="billEndDt" disabled={true} />
            </div>
            <div className="col-md-4">
              <DateInput formik={formik} label="LBL_PAYMENT_DATE" accessor="paymentDt" disabled={true} />
            </div>
            <div className="col-md-4">
              <TextInput formik={formik} label="LBL_PAYMENT_REFERENCE" accessor="paymentRef" disabled={true} />
            </div>
            {lineData.length > 0 && (
              <InnerTable
                title="LBL_INVOICE_LINES"
                pageMode="view"
                lineHeaders={lineHeaders}
                lineData={lineData}
                alternativeID="invoiceLineId"
              />
            )}
          </div>
        </div>
      </div>
      <div className="col-md-4 order-1 order-md-2">
        <div className="card right-more">
          <div className="row">
            <div className="col-md-12">
              <div className="list-info">
                <div className="list">
                  <p>{t('LBL_STATUS')}</p>
                  <h4>{t(formik.values.sttsName)}</h4>
                </div>
                <div className="list">
                  <p>{t('LBL_INVOICE_NUMBER')}</p>
                  <h4>{t(formik.values.invoiceNo)}</h4>
                </div>
                <div className="list">
                  <p>{t('LBL_TIER')}</p>
                  <h4>{`${subscription?.productTier?.[i18next?.language === 'en' ? 'titleEn' : 'titleAr']} / ${t(
                    subscription?.paymentFrequency
                  )}`}</h4>
                </div>
                <div className="list">
                  <p>{t('LBL_NET_AMOUNT')}</p>
                  <h4>{formatFloatNumber(formik.values.netAmount)}</h4>
                </div>
              </div>
              {data.invoiceInfo && data.invoiceInfo.sttsCd !== 'Paid' && data.invoiceInfo.sttsCd !== 'S' && (
                <>
                  <div className="row">
                    <div className="col-12">
                      <TermsAndConditions
                        formik={formik}
                        isOnlyCheckboxesInRow={false}
                        mode="add"
                        accessor="hasAgreedTerms"
                        show={showTerms}
                        setShow={setShowTerms}
                        onAgree={() => {
                          setFieldValue(formik, 'hasAgreedTerms', true);
                          setShowTerms(false);
                        }}
                      />
                    </div>
                  </div>
                  <div className="border-solid"></div>
                  <div className="actionbtn-right-page">
                    <button
                      className="btn btn-req btn-w-100"
                      onClick={() => setIsPayNow(true)}
                      disabled={isDisablePayNow || !formik.isValid}
                    >
                      {t('LBL_PAY_NOW')}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
