import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { useFormik } from 'formik';

import BreadCrumb from '../../components/ui/BreadCrumb';
import BackButton from '../../components/ui/buttons/BackButton';
import SearchModalAxelor from '../../components/ui/inputs/SearchModal/SearchModalAxelor';
import Calendar from '../../components/ui/Calendar';
import TransactionsList from '../TransactionsList';
import FormNotes from '../../components/ui/FormNotes';
import Spinner from '../../components/Spinner/Spinner';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';

function SupplierStatements() {
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(false);
  const [isRun, setIsRun] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);

  const initVals = {
    partner: null,
    fromDate: null,
    toDate: null,
  };

  const valSchema = Yup.object().shape({
    partner: Yup.object().nullable(),
    fromDate: Yup.date().nullable().typeError(t('VALID_DATE_FORMAT')),
    toDate: Yup.date().nullable().typeError(t('VALID_DATE_FORMAT')).min(Yup.ref('fromDate'), t('REPORT_TO_DATE_VALIDATION_MESSAGE_2')),
  });

  const formik = useFormik({
    initialValues: initVals,
    validationSchema: valSchema,
    validateOnMount: true,
  });

  const onCustomersSearchSuccess = response => {
    if (response.data.status === 0) {
      let data = response.data.data;
      let temp2 = [];
      data.map(customer => {
        let obj = {
          id: customer.id ? customer.id : -1,
          partnerSeq: customer.partnerSeq,
          simpleFullName: customer.simpleFullName,
          fixedphone: customer.fixedphone,
          email: customer.emailAddress,
          category: customer.partnerCategory,
          fiscalposition: customer.fiscalPosition,
          registrationcode: customer.registrationcode,
          address: customer.mainAddress,
          companies: customer.companyStr,
          isCustomer: customer.isCustomer,
          isSupplier: customer.isSupplier,
        };
        temp2.push(obj);
      });

      return { displayedData: [...temp2], total: response.data.total || 0 };
    }
  };

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const runStatement = () => {
    if (formik.isValid) {
      setActionInProgress(true);
      setIsRun(true);
    } else {
      setActionInProgress(false);
      setIsRun(false);
    }
  };

  return (
    <>
      {isLoading && <Spinner />}
      {actionInProgress && <div className="lodingpage"></div>}
      <div className="page-body">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <Calendar />
              <BreadCrumb feature="PURCHASE" subFeature="SUPPLIER_STATEMENTS" />
            </div>
          </div>

          <div className="row ">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{t('LBL_SUPPLIER_STATMENTS')}</h4>
              </div>
              <div className="reverse-page float-end">
                <BackButton />
                <PrimaryButton text="LBL_RUN" onClick={runStatement} />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className="row">
                  <div className="col-md-6">
                    <SearchModalAxelor
                      formik={formik}
                      modelKey="SUPPLIERS"
                      mode="add"
                      isRequired={true}
                      onSuccess={onCustomersSearchSuccess}
                      payloadDomain={"self.isSupplier=true and self.name != 'Company'"}
                      selectIdentifier="simpleFullName"
                      defaultValueConfig={null}
                      extraFields={['isCustomer', 'isSupplier']}
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="date-input">
                      <label className="form-label" htmlFor="full-name">
                        {t('LBL_FROM')}
                      </label>
                      <input
                        className="form-control"
                        type="date"
                        name="fromDate"
                        placeholder={t('LBL_FROM_DATE')}
                        value={formik.values.fromDate}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.values.fromDate !== formik.initialValues.fromDate && formik.errors.fromDate && (
                        <label className="color-text-red mb-3">{formik.errors.fromDate}</label>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="date-input">
                      <label className="form-label" htmlFor="full-name">
                        {t('LBL_TO')}
                      </label>
                      <input
                        className="form-control"
                        type="date"
                        name="toDate"
                        placeholder={t('LBL_TO_DATE')}
                        value={formik.values.toDate}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.values.toDate !== formik.initialValues.toDate && formik.errors.toDate && (
                        <label className="color-text-red mb-3">{formik.errors.toDate}</label>
                      )}
                    </div>
                  </div>
                </div>
                <FormNotes
                  notes={[
                    {
                      title: 'LBL_REQUIRED_NOTIFY',
                      type: 3,
                    },
                  ]}
                />
              </div>
              {formik.isValid && (
                <TransactionsList
                  showBack={false}
                  formik={formik}
                  type="supplier"
                  setIsRun={setIsRun}
                  isRun={isRun}
                  setActionInProgress={setActionInProgress}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SupplierStatements;
