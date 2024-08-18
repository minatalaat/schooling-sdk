import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { useDispatch } from 'react-redux';

import Calendar from '../../components/ui/Calendar';
import BreadCrumb from '../../components/ui/BreadCrumb';
import BackButton from '../../components/ui/buttons/BackButton';
import SearchModalAxelor from '../../components/ui/inputs/SearchModal/SearchModalAxelor';
import StockProductsList from './StockProductsList';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';

import { useAxiosFunction } from '../../hooks/useAxios';
import { alertsActions } from '../../store/alerts';

function StockProducts() {
  const stockLocationDomain = 'self.company = 1 AND self.typeSelect in (1,2)';

  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  const dispatch = useDispatch();

  const [buttonClicked, setButtonClicked] = useState(false);
  const initVals = {
    stockLocation: null,
  };

  const submit = values => {};

  const formik = useFormik({
    initialValues: initVals,
    validateOnMount: true,
    onSubmit: submit,
  });

  const alertHandler = (title, message) => {
    dispatch(alertsActions.initiateAlert({ title, message }));
    setButtonClicked(false);
  };

  const onStockLocationsSearchSuccess = response => {
    let status = response.data.status;
    let data = response.data.data || [];
    let total = response.data.total;

    if (status !== 0 || total === undefined || total === null) {
      return alertHandler('Error', t('LBL_ERROR_LOADING_STOCK_LOCATIONS'));
    }

    return { displayedData: [...data], total: response?.data?.total || 0 };
  };

  const runSearch = () => {
    setButtonClicked(true);
  };

  return (
    <>
      {buttonClicked && <div className="lodingpage"></div>}

      <div className="page-body">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <Calendar />
              <BreadCrumb feature="STOCK_MANAGEMENT" subFeature="STOCK_AVAILABILITY" />
            </div>
          </div>

          <div className="row ">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{t('LBL_STOCK_AVAILABILITY')}</h4>
              </div>

              <div className="reverse-page float-end">
                <BackButton backPath="/home" />
                <PrimaryButton theme="blue" text="LBL_RUN" onClick={() => runSearch()} />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className="row">
                  <div className="col-md-12">
                    <SearchModalAxelor
                      formik={formik}
                      modelKey="STOCK_LOCATIONS"
                      mode="edit"
                      onSuccess={onStockLocationsSearchSuccess}
                      payloadDomain={stockLocationDomain}
                      defaultValueConfig={null}
                      isRequired={false}
                      disabled={false}
                      selectionType="all"
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <StockProductsList api={api} formik={formik} buttonClicked={buttonClicked} setButtonClicked={setButtonClicked} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default StockProducts;
