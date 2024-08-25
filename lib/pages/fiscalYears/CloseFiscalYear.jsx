import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';

import SearchModalAxelor from '../../components/ui/inputs/SearchModal/SearchModalAxelor';

export default function CloseFiscalYear({ updateFYDetails }) {
  const { t } = useTranslation();

  const initialValues = {
    retainedAccount: null,
    closingAccount: null,
    plAccounts: null,
  };

  const formik = useFormik({
    initialValues,
  });

  useEffect(() => {
    updateFYDetails({
      plAccounts: formik.values.plAccounts,
      retainedAccount: formik.values.retainedAccount ? [{ ...formik.values.retainedAccount }] : [],
      closingAccount: formik.values.closingAccount ? [{ ...formik.values.closingAccount }] : [],
    });
  }, [formik.values]);

  return (
    <div className="col-md-9">
      <div className="card">
        <div className="row">
          <div className="row">
            <div className=" col-md-6 section-title mt-2 mb-4">
              <h4>{t('LBL_FISCAL_YEAR_DETAILS')}</h4>
            </div>
          </div>
          <div className="row">
            <div className="col-md-8">
              <SearchModalAxelor
                formik={formik}
                modelKey="PL_ACCOUNTS"
                mode="add"
                tooltip="fiscalYearPlAccount"
                selectIdentifier="label"
                payloadDomain="self.statusSelect = 1 AND self.code NOT LIKE '1%' AND self.code NOT LIKE '2%' AND self.code NOT LIKE '3%'"
                selectionType="all"
                isRequired={true}
                extraFields={['statusSelect']}
              />
            </div>
          </div>
          <div className="border-section"></div>

          <div className="row">
            <div className="col-md-8">
              <SearchModalAxelor
                formik={formik}
                modelKey="PERIOD_END_CLOSING_ACCOUNT"
                mode="add"
                tooltip="fiscalYearPeriodEndAccount"
                selectIdentifier="label"
                payloadDomain="self.statusSelect = 1"
                extraFields={['statusSelect']}
                isRequired={true}
                defaultValueConfig={null}
              />
            </div>
          </div>

          <div className="border-section"></div>

          <div className="row">
            <div className="col-md-8">
              <SearchModalAxelor
                formik={formik}
                modelKey="RETAINED_EARNINGS_ACCOUNT"
                mode="add"
                tooltip="fiscalYearRetainedEarningAccount"
                selectIdentifier="label"
                payloadDomain="self.statusSelect = 1"
                extraFields={['statusSelect']}
                isRequired={true}
                defaultValueConfig={null}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
