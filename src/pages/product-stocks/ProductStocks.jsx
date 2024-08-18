import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';

import Calendar from '../../components/ui/Calendar';
import BreadCrumb from '../../components/ui/BreadCrumb';
import BackButton from '../../components/ui/buttons/BackButton';
import SearchModalAxelor from '../../components/ui/inputs/SearchModal/SearchModalAxelor';
import ProductStocksList from './ProductStocksList';

import { useAxiosFunction } from '../../hooks/useAxios';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';

function ProductStocks() {
  const productDomain = "self.isModel = false AND self.dtype = 'Product' AND self.isActivity = false";

  const { t } = useTranslation();
  const { api } = useAxiosFunction();

  const [buttonClicked, setButtonClicked] = useState(false);
  const initVals = {
    product: null,
  };

  const submit = values => {};

  const formik = useFormik({
    initialValues: initVals,
    validateOnMount: true,
    onSubmit: submit,
  });

  const onProductSearchSuccess = response => {
    if (response.data.status === 0) {
      let data = response.data.data;
      let products = [];

      if (data) {
        data.forEach(product => {
          let temp = {
            id: product?.id ?? null,
            picture: product?.picture ?? '',
            code: product?.code ?? '',
            name: product?.name ?? '',
            fullName: product?.fullName ?? '',
            type: 'Product',
            productCode: product?.code ?? '',
            productName: product?.name ?? '',
            productCategory: product?.productCategory ?? '',
            accountingFamily: product?.accountingFamily ?? '',
            salePrice: product?.salePrice ?? '',
            unit: product?.unit?.name ?? '',
            internalDescription: product?.internalDescription ?? '',
            productTypeSelect: product?.productTypeSelect ?? '',
            serialNumber: product?.serialNumber ?? '',
          };
          products.push(temp);
        });
      }

      return { displayedData: [...products], total: response.data.total || 0 };
    }
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
              <BreadCrumb feature="STOCK_MANAGEMENT" subFeature="PRODUCT_STOCK" />
            </div>
          </div>

          <div className="row ">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{t('LBL_PRODUCT_STOCK')}</h4>
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
                      modelKey="PRODUCTS"
                      mode="add"
                      isRequired={false}
                      disabled={false}
                      onSuccess={onProductSearchSuccess}
                      selectIdentifier="fullName"
                      payloadDomain={productDomain}
                      defaultValueConfig={null}
                      extraFields={['fullName', 'productTypeSelect']}
                      selectionType="all"
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <ProductStocksList api={api} formik={formik} buttonClicked={buttonClicked} setButtonClicked={setButtonClicked} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductStocks;
