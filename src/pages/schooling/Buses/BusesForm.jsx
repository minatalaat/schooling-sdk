import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import TextInput from '../../../components/ui/inputs/TextInput';
import { useTabs } from '../../../hooks/useTabs';
import FileInput from '../../../components/ui/inputs/FileInput';
import { useBusesServices } from '../../../services/apis/useBusesServices';
import BorderSection from '../../../components/ui/inputs/BorderSection';
import DropDown from '../../../components/ui/inputs/DropDown';
import { useModelsServices } from '../../../services/apis/useModelsServices';
import moment from 'moment/moment';
import { useNavigate } from 'react-router-dom';

const BusesForm = ({ enableEdit, data, addNew, btnRef }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const tabsProps = useTabs();
  const { addBus, updateBus } = useBusesServices();
  const { fetchModels } = useModelsServices();
  const [models, setModels] = useState([]);
  const initialValues = {
    ...data,
  };
  const validationSchema = Yup.object().shape({
    busModel: Yup.object().shape({
      id: Yup.number().required(`* ${t('REQUIRED')}`),
    }),
    capacity: Yup.string()
      .required(`* ${t('REQUIRED')}`)
      .trim(),
    plateNumber: Yup.string()
      .required(`* ${t('REQUIRED')}`)
      .trim(),
    productionYear: Yup.string()
      .required(`* ${t('REQUIRED')}`)
      .trim(),
    state: Yup.string()
      .required(`* ${t('REQUIRED')}`)
      .trim(),
    busOperator: Yup.object().shape({
      username: Yup.string()
        .required(`* ${t('REQUIRED')}`)
        .trim(),
      email: Yup.string()
        .required(`* ${t('REQUIRED')}`)
        .trim(),
      phoneNumber: Yup.string()
        .required(`* ${t('REQUIRED')}`)
        .trim(),
      operatorState: Yup.string()
        .required(`* ${t('REQUIRED')}`)
        .trim(),
      nationalId: Yup.string()
        .required(`* ${t('REQUIRED')}`)
        .trim(),
      ...(addNew && {
        password: Yup.string().required(`* ${t('REQUIRED')}`),
        passwordConfirmation: Yup.string()
          .required(`* ${t('REQUIRED')}`)
          .oneOf([Yup.ref('password'), null], `* ${t('PASSWORD_MATCH_VALIDATION_MESSAGE')}`),
      }),
    }),
  });

  const submit = values => {
    // Exclude passwordConfirmation field
    const { ...dataToSend } = values.busOperator;

    // Update values with the modified data
    values = {
      ...values,
      busOperator: dataToSend,
      capacity: +values.capacity,
      productionYear: +values.productionYear,
      busModel: {
        id: +values.busModel.id,
      },
    };

    if (formik.isValid) {
      if (addNew) {
        addBus(values, () => {
          navigate(-1);
        });
      } else {
        updateBus(data?.id, { ...values, id: data?.id }, () => {
          navigate(-1);
        });
      }
    }
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: addNew ? true : false,
    onSubmit: submit,
    validateOnChange: true, // Add this line
    validateOnBlur: true, // Add this line
  });

  const importModels = async () => {
    const data = await fetchModels({
      page: 0,
      size: 100,
    });
    setModels(data?.data);
  };

  useEffect(() => {
    tabsProps.setShowTabsContent(true);
    importModels();
  }, []);

  const modelsOptions = models?.map(data => {
    return {
      name: data?.name,
      value: data?.id,
    };
  });

  const operatorStatus = [
    { name: 'PENDING', value: 'PENDING' },
    { name: 'ACTIVE', value: 'ACTIVE' },
    { name: 'DEACTIVATED', value: 'DEACTIVATED' },
  ];

  const generateYearsArray = () => {
    const currentYear = moment().year();
    const minYear = currentYear - 50;
    const yearsArray = [];

    for (let year = currentYear; year >= minYear; year--) {
      yearsArray.push({ value: year, name: year.toString() });
    }

    return yearsArray;
  };

  const yearsArray = generateYearsArray();
  return (
    <div className="flex col">
      <form className="login-form" onSubmit={formik.handleSubmit}>
        <div className="card">
          <div className="row justify-content-between gap-3">
            {enableEdit || addNew ? (
              <div className="col-md-5">
                <DropDown
                  placeholder={formik?.values?.busModel?.name}
                  options={modelsOptions}
                  formik={formik}
                  isRequired={true}
                  disabled={false}
                  label="LBL_MODEL"
                  accessor="busModel.id"
                  initialValue="busModel.id"
                  // translate={unitTypeSelect.mode === 'enum'}
                  keys={{ valueKey: 'value', titleKey: 'name' }}
                  mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                />
              </div>
            ) : (
              <div className="col-md-5">
                <TextInput
                  formik={formik}
                  label="LBL_MODEL"
                  accessor="busModel.name"
                  mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                  isRequired={true}
                />
              </div>
            )}

            <div className="col-md-5">
              {enableEdit || addNew ? (
                <DropDown
                  options={yearsArray}
                  formik={formik}
                  isRequired={true}
                  disabled={false}
                  label="LBL_YEAR"
                  accessor="productionYear"
                  // translate={unitTypeSelect.mode === 'enum'}
                  initialValue="productionYear"
                  keys={{ valueKey: 'value', titleKey: 'name' }}
                  mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                />
              ) : (
                <TextInput
                  formik={formik}
                  label="LBL_YEAR"
                  accessor="productionYear"
                  mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                  isRequired={true}
                />
              )}
            </div>
          </div>
          <div className="row justify-content-between gap-3">
            <div className="col-md-5">
              <TextInput
                formik={formik}
                label="LBL_CAPACITY"
                accessor="capacity"
                mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                isRequired={true}
              />
            </div>
            <div className="col-md-5">
              <TextInput
                formik={formik}
                label="LBL_PLATE_NUMBER"
                accessor="plateNumber"
                mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                isRequired={true}
              />
            </div>
            {enableEdit || addNew ? (
              <div className="col-md-5">
                <DropDown
                  options={operatorStatus}
                  formik={formik}
                  isRequired={true}
                  disabled={false}
                  label="LBL_STATE"
                  accessor="state"
                  // translate={unitTypeSelect.mode === 'enum'}
                  keys={{ valueKey: 'value', titleKey: 'name' }}
                  mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                />
              </div>
            ) : (
              <div className="col-md-5">
                <TextInput
                  formik={formik}
                  label="LBL_STATE"
                  accessor="state"
                  mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                  isRequired={true}
                />
              </div>
            )}

            {/* <div className="col-md-5">
              <TextInput
                formik={formik}
                label="LBL_BUS_REGISTRATION_EXPIRY"
                accessor="name_ar"
                mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                isRequired={true}
              />
            </div> */}
          </div>

          <>
            <BorderSection title="LBL_OPERATION_INFO" />
            <div className="row justify-content-between gap-3">
              <div className="col-md-8">
                <div className="row justify-content-between gap-3">
                  <div className="col-md-5">
                    <TextInput
                      formik={formik}
                      label="LBL_NAME"
                      accessor="busOperator.username"
                      mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                      isRequired={true}
                    />
                  </div>
                  <div className="col-md-5">
                    <TextInput
                      formik={formik}
                      label="LBL_EMAIL"
                      accessor="busOperator.email"
                      mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                      isRequired={true}
                    />
                  </div>
                </div>
                <div className="row justify-content-between gap-3">
                  <div className="col-md-5">
                    <TextInput
                      formik={formik}
                      label="LBL_PHONE_NUMBER"
                      accessor="busOperator.phoneNumber"
                      mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                      isRequired={true}
                    />
                  </div>
                  {enableEdit || addNew ? (
                    <div className="col-md-5">
                      <DropDown
                        placeholder={formik?.values?.busOperator?.operatorState}
                        options={operatorStatus}
                        formik={formik}
                        isRequired={true}
                        disabled={false}
                        label="LBL_STATE"
                        accessor="busOperator.operatorState"
                        // translate={unitTypeSelect.mode === 'enum'}
                        keys={{ valueKey: 'value', titleKey: 'name' }}
                        mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                      />
                    </div>
                  ) : (
                    <div className="col-md-5">
                      <TextInput
                        formik={formik}
                        label="LBL_STATE"
                        accessor="busOperator.operatorState"
                        mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                        isRequired={true}
                      />
                    </div>
                  )}
                </div>

                {/* <div className="row justify-content-between gap-3">
                  <div className="col-md-5">
                    <TextInput
                      formik={formik}
                      label="LBL_NATIONAL_ID"
                      accessor="name_ar"
                      mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                      isRequired={true}
                    />
                  </div>
                  <div className="col-md-5">
                    <DropDown
                      options={costTypeOptions}
                      formik={formik}
                      isRequired={true}
                      disabled={false}
                      label="LBL_NATIONALITY"
                      accessor="costTypeSelect"
                      // translate={unitTypeSelect.mode === 'enum'}
                      keys={{ valueKey: 'value', titleKey: 'name' }}
                      mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                    />
                  </div>
                </div> */}
                <div className="row justify-content-between gap-3">
                  <div className="col-md-5">
                    <TextInput
                      formik={formik}
                      label="LBL_NATIONAL_ID"
                      accessor="busOperator.nationalId"
                      mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                      isRequired={true}
                    />
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <FileInput formik={formik} identifier="logo" label="LBL_LOGO" mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'} />
              </div>
            </div>
          </>
          {addNew && (
            <div className="row justify-content-between gap-3">
              <div className="col-md-5">
                <TextInput
                  formik={formik}
                  label="LBL_PASSWORD"
                  accessor="busOperator.password"
                  mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                  isRequired={true}
                />
              </div>
              <div className="col-md-5">
                <TextInput
                  formik={formik}
                  label="LBL_CONFIRM_PASSWORD"
                  accessor="busOperator.passwordConfirmation"
                  mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
                  isRequired={true}
                />
              </div>
            </div>
          )}
        </div>
        <button type="submit" ref={btnRef} hidden></button>
      </form>
    </div>
  );
};

export default BusesForm;
