import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import TextInput from '../../components/ui/inputs/TextInput';
import LocationContent from './tabs/LocationContent';
import Tabs from '../../components/ui/inputs/Tabs';
import Configuration from './tabs/Configuration';
import ValueCard from '../../components/ui/inputs/ValueCard';
import AttachmentInput from '../../components/ui/inputs/AttachmentInput';
import SearchModalAxelor from '../../components/ui/inputs/SearchModal/SearchModalAxelor';
import AddressInputs from '../../components/ui/inputs/AddressInputs';

import { MODELS } from '../../constants/models';
import { useAxiosFunction } from '../../hooks/useAxios';
import { getModelUrl, getRemoveAllUrl } from '../../services/getUrl';
import { useTabs } from '../../hooks/useTabs';
import { VALID_TEXT_WITH_SPECIAL_CHARS } from '../../constants/regex/Regex';
import { useFormikSubmit } from '../../hooks/useFormikSubmit';
import FormNotes from '../../components/ui/FormNotes';

const StockLocationForm = ({
  enableEdit,
  data,
  addNew,
  isSave,
  finshedSaveHandler,
  isDelete,
  finshedDeleteHandler,
  alertHandler,
  setActionInProgress,
}) => {
  const subFeature = 'STOCK_LOCATIONS';
  const { api } = useAxiosFunction();
  const tabsProps = useTabs();
  const { t } = useTranslation();

  const [parentSaveDone, setParentSaveDone] = useState(false);
  const [fetchedObject, setFetchedObject] = useState(false);

  let company = useSelector(state => state.userFeatures.companyInfo.company);

  const initialValues = {
    name: data?.name || '',
    includeOutOfStock: true,
    // includeOutOfStock: addNew ? true : data?.includeOutOfStock || false,
    usableOnSaleOrder: addNew ? true : data?.usableOnSaleOrder || false,
    usableOnPurchaseOrder: addNew ? true : data?.usableOnPurchaseOrder || false,
    isValued: addNew ? true : data?.isValued || false,
    address: data?.address || null,
  };

  const validationSchema = Yup.object({
    name: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).required(t('REQUIRED')).trim(),
    address: Yup.object().nullable().required(t('REQUIRED')),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: addNew ? true : false,
  });

  const { validateFormForSubmit } = useFormikSubmit(formik, alertHandler);

  const saveRecord = async () => {
    const isValid = await validateFormForSubmit();
    if (!isValid) return null;

    setActionInProgress(true);
    let payload = {
      data: {
        usableOnPurchaseOrder: formik.values.usableOnPurchaseOrder,
        typeSelect: 1,
        usableOnSaleOrder: formik.values.usableOnSaleOrder,
        isValued: formik.values.isValued,
        includeOutOfStock: formik.values.includeOutOfStock,
        company: company,
        name: formik.values.name,
        address: formik.values.address || null,
      },
    };

    const res = await api('POST', getModelUrl(MODELS.STOCK_LOCATION), payload);
    if (!(res?.data?.status === 0)) return finshedSaveHandler('error');

    setFetchedObject(res?.data?.data?.[0]);
    setParentSaveDone(true);
  };

  const deleteRecord = async () => {
    setActionInProgress(true);
    const payload = {
      records: [{ id: data.id }],
    };
    const res = await api('POST', getRemoveAllUrl(MODELS.STOCK_LOCATION), payload, () => {
      finshedDeleteHandler('success');
    });
    if (!(res?.data?.status === 0)) return finshedSaveHandler('error');
  };

  useEffect(() => {
    if (isSave) {
      saveRecord();
    }

    if (isDelete) {
      deleteRecord();
    }
  }, [isSave, isDelete, addNew, enableEdit]);

  useEffect(() => {
    tabsProps.setShowTabsContent(true);
  }, []);

  return (
    <>
      <div className="card">
        <div className="row">
          {!addNew && formik.values.isValued && (
            <div className="col-md-12">
              <ValueCard title="LBL_STOCK_LOCATION_VALUE" content={`${data.stockLocationValue || 0} ${t('LBL_SAR')}`} />
            </div>
          )}
          <div className="col-md-6">
            <TextInput
              formik={formik}
              label="LBL_NAME"
              accessor="name"
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
              isRequired={true}
            />
          </div>
          <div className="col-md-6">
            <SearchModalAxelor
              formik={formik}
              modelKey="ADDRESSES"
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
              isRequired={true}
              defaultValueConfig={null}
              selectIdentifier="fullName"
              addConfig={{
                title: 'LBL_ADD_ADDRESS',
                FormComponent: AddressInputs,
              }}
            />
          </div>
          {/* <div className="col-md-6">
            <ToggleSwitch
              formik={formik}
              label="LBL_INCLUDE_OUT_OF_STOCK"
              accessor="includeOutOfStock"
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
            />
          </div> */}
        </div>
        {(addNew || enableEdit) && (
          <FormNotes
            notes={[
              {
                title: 'LBL_REQUIRED_NOTIFY',
                type: 3,
              },
            ]}
          />
        )}
      </div>

      {!addNew && (
        <Tabs
          {...tabsProps}
          tabsList={[
            { accessor: 'location-content', label: 'LBL_LOCATION_CONTENT' },
            { accessor: 'configuration', label: 'LBL_CONFIGURATION' },
          ]}
        >
          <LocationContent accessor="location-content" stockLocationData={data} onAlert={alertHandler} />
          <Configuration accessor="configuration" formik={formik} mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'} />
        </Tabs>
      )}
      <AttachmentInput
        mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
        modelKey={MODELS.STOCK_LOCATION}
        alertHandler={alertHandler}
        fetchedObj={fetchedObject || data || null}
        parentSaveDone={parentSaveDone}
        feature={subFeature}
        navigationParams={{ id: data?.id }}
        onSuccessFn={() => finshedSaveHandler('success')}
      />
    </>
  );
};

export default StockLocationForm;
