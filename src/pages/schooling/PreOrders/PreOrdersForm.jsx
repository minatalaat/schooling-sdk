import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import TextInput from '../../../components/ui/inputs/TextInput';
import { useTabs } from '../../../hooks/useTabs';
import FileInput from '../../../components/ui/inputs/FileInput';
import Table from '../../../components/ListingTable/Table';
import TableRow from '../../../components/ListingTable/TableRow';

const PreOrdersForm = ({ enableEdit, data, addNew, status }) => {
  const { t } = useTranslation();
  const tabsProps = useTabs();
  const [checked, setChecked] = useState([]);

  const initialValues = {
    dropdownInput: data?.dropdownInput?.toString() || '',
    parent_name: data?.student?.parent_name || '',
    id: data?.id || '',
    student_name: data?.student?.name || '',
    status: data?.status || '',
    bracelet_Seq: data?.student?.bracelet_Seq || '',
    emailAddress: data?.emailAddress || '',
    webSite: data?.webSite || '',
    isEnabled: data?.isEnabled || false,
    purchaseDate: data?.purchaseDate?.join('-') || '',
    expectedDate: data?.expectedDate?.join('-') || '',
    textArea: data?.textArea || '',
    avatar: data?.student?.avatar,
    time: data?.time || '',
    instructions: data?.instructions || null,
  };

  const validationSchema = Yup.object().shape({
    dropdownInput: Yup.string().required(`* ${t('REQUIRED')}`),
    name: Yup.string()
      .required(`* ${t('REQUIRED')}`)
      .trim(),
    emailAddress: Yup.string()
      .email(`* ${t('EMAIL_VALIDATION_MESSAGE')}`)
      .trim(),
    mobilePhone: Yup.string()
      .required(`* ${t('REQUIRED')}`)
      .matches('^((?:[+?0?0?966]+)(?:\\s?\\d{2})(?:\\s?\\d{7}))$', `* ${t('PHONE_VALIDATION_MESSAGE')}`)
      .trim(),
    webSite: Yup.string()
      .url(`* ${t('WEBSITE_VALIDATION_MESSAGE')}`)
      .trim(),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    validateOnMount: addNew ? true : false,
  });

  useEffect(() => {
    tabsProps.setShowTabsContent(true);
  }, []);
  const fields = [
    { accessor: 'itemId', Header: t('LBL_PRODUCT_CODE'), type: 'text' },
    { accessor: 'itemId', Header: t('LBL_PRODUCT_NAME'), type: 'text' },
    { accessor: 'quantity', Header: t('LBL_PRODUCT_QUANTITY'), type: 'text' },
    { accessor: 'total', Header: t('LBL_PRICE'), type: 'text' },
  ];
  return (
    <div className="d-flex flex-column col">
      {(status || data?.cartStatusDisplay) && (
        <h4
          className="col-2 p-2 text-center align-self-end"
          style={{
            padding: '0',
            backgroundColor: '#009262',
            marginBottom: '30px',
            color: '#fff',
            borderRadius: '16px',
            fontSize: '17px',
          }}
        >
          {status || data?.cartStatusDisplay}
        </h4>
      )}

      <div className="card">
        <div className="row justify-content-between">
          <div className="row col-md-10 justify-content-between">
            <div className="col-md-6">
              <TextInput
                formik={formik}
                label="LBL_ORDER_NUMBER"
                accessor="id"
                mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                isRequired={true}
              />
            </div>
            <div className="col-md-5">
              <TextInput
                formik={formik}
                label="LBL_ORDER_STUDENT_NAME"
                accessor="student_name"
                mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                isRequired={true}
              />
            </div>
            <div className="col-md-6">
              <TextInput
                formik={formik}
                label="LBL_BRACELET_ID"
                accessor="bracelet_Seq"
                mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                isRequired={true}
              />
            </div>
            <div className="col-md-5">
              <TextInput
                formik={formik}
                label="LBL_PARANT_NAME"
                accessor="parent_name"
                mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                isRequired={true}
              />
            </div>
            <div className="col-md-6">
              <TextInput
                formik={formik}
                label="LBL_ORDER_PICKUP_DATE"
                accessor="expectedDate"
                mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                isRequired={true}
              />
            </div>
            <div className="col-md-5">
              <TextInput
                formik={formik}
                label="LBL_ORDER_CREATED_AT"
                accessor="purchaseDate"
                mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                isRequired={true}
              />
            </div>
          </div>
          <div className="row col-md-2">
            <FileInput
              formik={formik}
              identifier="avatar"
              label="LBL_ORDER_STUDENT_PHOTO"
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
            />
          </div>
        </div>
      </div>
      <div className="card">
        <div className="info-tite-page mb-4">
          <h4>{t('LBL_ORDER_DETAILS_ITEMS')}</h4>
        </div>
        <div className="row justify-content-between">
          <Table
            fields={fields}
            data={data?.cartItems || []}
            total={data?.cartItems?.length || 0}
            checked={checked}
            setChecked={setChecked}
            feature=""
            subFeature=""
            hasBulkActions={false}
            isPagination={false}
            tableOnly={true}
          >
            {data?.cartItems &&
              data?.cartItems.length > 0 &&
              data?.cartItems?.map(record => {
                return (
                  <TableRow
                    key={record.id}
                    record={record}
                    fields={fields}
                    checked={checked}
                    setChecked={setChecked}
                    feature=""
                    subFeature=""
                    isEditable={false}
                    isViewable={false}
                    isDeletable={false}
                    hasBulkActions={false}
                  />
                );
              })}
          </Table>

          <div className="row mt-3">
            <div className="col-md-2">
              <h5 className="text-center fw-bold"> Items No : {data?.numberOfItems}</h5>
            </div>
            <div className="col-md-2">
              <h5 className="text-center fw-bold">Total : {data?.total}</h5>
            </div>
            <div className="col-md-4">
              <h5 className="text-center fw-bold">Total / vat : {data?.total}</h5>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreOrdersForm;
