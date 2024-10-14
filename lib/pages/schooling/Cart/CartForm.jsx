import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Table from '../../../components/ListingTable/Table';
import TableRow from '../../../components/ListingTable/TableRow';
import PrimaryButton from '../../../components/ui/buttons/PrimaryButton';
import TextInput from '../../../components/ui/inputs/TextInput';
import { useFormik } from 'formik';
import FileInput from '../../../components/ui/inputs/FileInput';
import { useCartServices } from '../../../services/apis/useCartServices';
import CountInput from '../../../components/ui/inputs/CountInput';
import CardsList from '../../../components/CardsList/CardsList';
import { usePreOrderServices } from '../../../services/apis/usePreOrderServices';
import { useStudentsServices } from '../../../services/apis/useStudentsServices';
import SuccessPopup from '../../../components/modals/SuccessPopup';
import { orderSummery, preordersList } from '../../../utils/styles';
import QrcodeReader from '../../../components/modals/QrcodeReader';
import BarcodeReaderPopup from '../../../components/modals/BarcodeReader';
import { alertsActions } from '../../../store/alerts';
import { useDispatch } from 'react-redux';
import Card from '../../../components/Card/Card';

const CartForm = () => {
  const feature = 'SCHOOLING';
  const subFeature = 'CART';
  const { fetchProduct, cartCheckout } = useCartServices();
  const { fetchPreOrders } = usePreOrderServices();
  const { getStudentByBriclitCode } = useStudentsServices();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [studentData, setStudentData] = useState(null);
  const [checked, setChecked] = useState([]);
  const [itemsCountList, setIemsCountList] = useState([]);
  const [fetchedPreordersData, setFetchedPreordersData] = useState([]);
  const [products, setProducts] = useState([]);
  const [successPopup, setSuccessPopup] = useState(false);
  const [qrcodeReaderPopup, setQrcodeReaderPopup] = useState(false);
  const [barcodeReaderPopup, setBarcodeReaderPopup] = useState(false);

  const mappedData =
    products?.length > 0 &&
    products?.map((data, index) => {
      return {
        ...data,
        quntityInput: <CountInput setCount={setIemsCountList} count={itemsCountList} index={index} />,
      };
    });
  const fields = [
    { accessor: 'name', Header: t('LBL_PRODUCT_NAME'), type: 'text' },
    { accessor: 'quntityInput', Header: t('LBL_PRODUCT_QUANTITY'), type: 'text' },
    { accessor: 'sale_price', Header: t('LBL_PRICE'), type: 'text' },
    { accessor: 'vat_price', Header: t('LBL_PRODUCT_TOTAL_VAT'), type: 'text' },
  ];

  const importProductData = async barCode => {
    const data = await fetchProduct(barCode);

    if (data?.data?.returnedObject) {
      setProducts(prevState => [...prevState, data?.data?.returnedObject]);
      formik.resetForm();
      setIemsCountList([...itemsCountList, 1]);
    } else {
      dispatch(alertsActions.initiateAlert({ title: 'Error', message: `${t('LBL_ERROR_GETTING_PRODUCT')}` }));
    }
  };

  const submit = values => {
    if (values?.code) {
      importProductData(values?.code);
    } else {
      setBarcodeReaderPopup(true);
    }
  };

  // const validationSchema = Yup.object().shape({
  //   code: Yup.string()
  //     .required(`* ${t('REQUIRED')}`)
  //     .trim(),
  // });
  const formik = useFormik({
    initialValues: {
      ...studentData,
      code: '',
    },
    // validationSchema,
    validateOnMount: true,
    enableReinitialize: true,
    onSubmit: submit,
  });
  const subTitles = [
    { key: 'id', label: 'LBL_ORDER_NUMBER' },
    { key: 'items/total', label: 'LBL_PARANT_NAME' },
    { key: 'parent_national_id', label: 'LBL_PARANT_NATIONAL_ID' },
  ];

  const importPreOrders = async studentId => {
    const data = await fetchPreOrders({
      student: studentId,
    });
    setFetchedPreordersData(data);
  };

  const importStudent = async token => {
    const data = await getStudentByBriclitCode({
      token,
    });
    setStudentData(data);
  };

  useEffect(() => {
    if (studentData?.id) importPreOrders(studentData?.id);
  }, [studentData?.id]);

  const preordersMappedData = fetchedPreordersData?.data?.map(data => {
    return {
      ...data,
      'items/total': (
        <div>
          {data?.total} / {data?.numberOfItems} items
        </div>
      ),
    };
  });

  const deleteHandler = id => {
    // let oldProducts = products;
    // const filterdeProducts = oldProducts?.filter(data => data?.id != id);
    // setProducts(filterdeProducts);

    const indexToDelete = products.findIndex(product => product.id === id);

    // Filter out the product to be deleted
    const filteredProducts = products.filter(product => product.id !== id);
    setProducts(filteredProducts);

    // Filter out the corresponding count from itemsCountList
    const filteredItemsCountList = itemsCountList.filter((_, index) => index !== indexToDelete);
    setIemsCountList(filteredItemsCountList);
  };

  const checkoutHandler = () => {
    const items = products?.map((data, index) => {
      return {
        itemId: data?.id,
        quantity: itemsCountList[index],
        unitPrice: 10.5,
      };
    });
    cartCheckout({
      userIdentifier: studentData?.id || 102,
      cartItems: items,
    });
    setProducts([]);
    setIemsCountList([]);
    formik.resetForm();
    setSuccessPopup(true);
  };

  const cancelHandler = () => {
    setProducts([]);
    setIemsCountList([]);
    formik.resetForm();
  };

  const itemsCount = itemsCountList?.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

  const handelQrCodeRequest = code => {
    importStudent(code);
  };

  const handelBarcodeReaderRequest = code => {
    importProductData(code);
  };

  const calculateTotal = () => {
    return products.reduce((acc, product, index) => {
      const productTotal = product.sale_price * itemsCountList[index];
      return acc + productTotal;
    }, 0);
  };

  const calculateTotalVat = () => {
    return products.reduce((acc, product, index) => {
      const productTotal = product.vat_price * itemsCountList[index];
      return acc + productTotal;
    }, 0);
  };

  return (
    <div className="page-body position-relative">
      <div className="container-fluid ">
        <div className="row">
          <div className="col-md-12 mb-4">
            <div className="info-tite-page float-start">
              <h4>{t('LBL_CART')}</h4>
            </div>
          </div>
        </div>
        <Card>
          <form onSubmit={formik.handleSubmit} className="position-relative">
            <div className="row">
              <div className="col-md-10">
                <TextInput formik={formik} label="LBL_ADD_BAR_CODE" accessor="code" isRequired={true} mode="add" />
              </div>
              <div className="col-md-2 d-flex align-items-center">
                <button type="submit" className="btn  btn-primary w-100">
                  <i className="add-icon"></i> +
                </button>
              </div>
            </div>
          </form>
        </Card>
        <Card>
          <div className="row">
            <div className="col-md-12  border-bottom-0 mb-0 rounded-0 mb-3">
              {/* order Products list */}

              <div className="col-md-12 ">
                <Table
                  fields={fields}
                  data={mappedData || []}
                  total={mappedData.length || 0}
                  checked={checked}
                  setChecked={setChecked}
                  feature={feature}
                  subFeature={subFeature}
                  hasBulkActions={false}
                  isPagination={false}
                  tableOnly={true}
                >
                  {mappedData &&
                    mappedData.length > 0 &&
                    mappedData.map(record => {
                      return (
                        <TableRow
                          key={record.id}
                          record={record}
                          fields={fields}
                          checked={checked}
                          setChecked={setChecked}
                          feature={feature}
                          subFeature={subFeature}
                          isEditable={false}
                          isViewable={false}
                          hasBulkActions={false}
                          deleteHandler={deleteHandler}
                        />
                      );
                    })}
                </Table>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          {/* student details */}
          <div className="row">
            <div className="col-md-1 d-flex align-items-center">
              <button onClick={() => setQrcodeReaderPopup(true)} type="submit" className="btn  btn-primary w-100">
                <i className="add-icon"></i> +
              </button>
            </div>
            <div className="col-md-5">
              <FileInput formik={formik} identifier="avatar" mode="view" />
            </div>
            <div className="col-md-6">
              <div className="row">
                <div className="col-md-12 ">
                  <TextInput formik={formik} label="LBL_ORDER_STUDENT_NAME" accessor="name" isRequired={true} mode="view" />
                </div>
                <div className="col-md-12 ">
                  <TextInput formik={formik} label="LBL_BRACELET_ID" accessor="barcode" isRequired={true} mode="view" />
                </div>
                <div className="col-md-12 ">
                  <TextInput formik={formik} label="LBL_ORDER_PICKUP_DATE" accessor="date" isRequired={true} mode="view" />
                </div>
              </div>
            </div>
          </div>
          {/* Pre orders  */}
          {preordersMappedData?.length > 0 && (
            <div className="row mb-sm-5">
              <h4 style={{ color: '#A9A9A9' }} className="form-label">
                {t('LBL_PRE_ORDERS')}
              </h4>
              <div style={preordersList}>
                <CardsList total={preordersMappedData?.length || 0} isPagination={false} externalCardStyle="p-0">
                  {preordersMappedData &&
                    preordersMappedData?.length > 0 &&
                    preordersMappedData?.map((record, i) => {
                      return (
                        <div key={i} className="col-md-12 position-relative m-2">
                          <Card
                            key={record.id}
                            feature={feature}
                            subFeature={subFeature}
                            record={record}
                            title="name"
                            subTitles={subTitles}
                            checked={checked}
                            setChecked={setChecked}
                            isEditable={false}
                            deleteHandler={() => {}}
                            isDeletable={false}
                            className="col-md-12"
                            cardStyle=" m-0"
                            label3={record.cartStatus ? { value: record.cartStatus } : null}
                          />
                        </div>
                      );
                    })}
                </CardsList>
              </div>
            </div>
          )}
        </Card>

        {/* order pricing */}
        <Card>
          <div
            className=" row  order-summery"
            style={orderSummery}
          >
            <div className="col-md-2">
              <PrimaryButton text="check out" theme="confirmationPopup" onClick={checkoutHandler} className=" w-100" />
            </div>
            <div className="col-md-2">
              <PrimaryButton theme="red" text="LBL_CANCEL" className="w-100" onClick={cancelHandler} />
            </div>
            <div className="col-md-2">
              <h5 className="text-center fw-bold"> items No : {itemsCount ?? 0}</h5>
            </div>
            <div className="col-md-2">
              <h5 className="text-center fw-bold">Total : {calculateTotal().toFixed(2) ?? 0} </h5>
            </div>
            <div className="col-md-2">
              <h5 className="text-center fw-bold">Total / vat : {calculateTotalVat().toFixed(2) ?? 0}</h5>
            </div>
          </div>
        </Card>
        {successPopup && <SuccessPopup setSuccessPopup={setSuccessPopup} text={t('LBL_CLICK_TO_DONE_SUCCESS')} onClickHandler={() => {}} />}
        {qrcodeReaderPopup && <QrcodeReader setQrcodeReaderPopup={setQrcodeReaderPopup} handelQrCodeRequest={handelQrCodeRequest} />}
        {barcodeReaderPopup && (
          <BarcodeReaderPopup
            handelBarcodeReaderRequest={handelBarcodeReaderRequest}
            setBarcodeReaderPopup={setBarcodeReaderPopup}
            barcodeReaderPopup={barcodeReaderPopup}
          />
        )}
      </div>
    </div>
  );
};

export default CartForm;
