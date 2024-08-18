import { useDispatch } from 'react-redux';

import SearchModalAxelor from '../../components/ui/inputs/SearchModal/SearchModalAxelor';
import TextInput from '../../components/ui/inputs/TextInput';
import CheckboxInput from '../../components/ui/inputs/CheckboxInput';
import FileInput from '../../components/ui/inputs/FileInput';
import BorderSection from '../../components/ui/inputs/BorderSection';
import PhoneInputField from '../../components/ui/inputs/PhoneInputField';
import NumberInput from '../../components/ui/inputs/NumberInput';
import FormNotes from '../../components/ui/FormNotes';

import { MODELS } from '../../constants/models';
import { alertsActions } from '../../store/alerts';
import { onCountriesSuccess, onCitiesSuccess } from '../../utils/successFnHelpers';
import { setFieldValue } from '../../utils/formHelpers';
import { defaultSAPayloadDomain } from '../../utils/addressHelpers';

export default function MainDetails({ formik, data }) {
  const dispatch = useDispatch();

  const alertHandler = (title, message) => dispatch(alertsActions.initiateAlert({ title, message }));

  const customDefaultSuccess = async response => {
    if (
      response?.data?.status !== 0 ||
      response?.data?.total === null ||
      response?.data?.total === undefined ||
      response?.data?.total === 0 ||
      response?.data?.data?.length === 0
    )
      return;
    let country = response.data.data[0];
    country.name = country['$t:name'];
    setFieldValue(formik, 'country', country || null);
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-8">
          <div className="row">
            <div className="col-md-6" key="name">
              <TextInput formik={formik} label="LBL_COMPANY_NAME" accessor="name" isRequired={true} mode="edit" />
            </div>
            <div className="col-md-6" key="code">
              <TextInput formik={formik} label="LBL_CODE" accessor="code" isRequired={true} mode="edit" />
            </div>
            {/* <div className="col-md-6" key="parent">
              <SearchModalAxelor formik={formik} modelKey="PARENT_COMPANY" mode="edit" originalData={data?.parent || null} />
            </div> */}
            <div className="col-md-6" key="partner">
              <SearchModalAxelor
                formik={formik}
                modelKey="PARTNERS"
                mode="edit"
                originalData={data?.partner || null}
                payloadDomain="self.isContact = false"
                payloadDomainContext={{
                  _model: MODELS.COMPANY,
                  ...data,
                }}
                selectIdentifier="fullName"
                extraFields={['fullName']}
              />
            </div>
            <div className="col-md-6" key="companyCr">
              <TextInput formik={formik} label="LBL_COMPANY_CR" accessor="companyCr" isRequired={false} mode="view" />
            </div>
            <div className="col-md-6" key="printedCommercialRegister">
              <TextInput
                formik={formik}
                label="LBL_PRINTED_COMPANY_CR"
                accessor="printedCommercialRegister"
                isRequired={false}
                mode="edit"
              />
            </div>
            <div className="col-md-6" key="taxNbr">
              <TextInput formik={formik} label="LBL_TAX_NUMBER" accessor="taxNbr" isRequired={false} mode="edit" maxLength={15} />
            </div>
            <div className="col-md-6">
              <PhoneInputField formik={formik} label="LBL_MOBILE_NUMBER" identifier="telephone" mode="edit" />
            </div>
            <div className="col-md-6">
              <PhoneInputField formik={formik} label="LBL_FAX" identifier="fax" mode="edit" />
            </div>
            <div className="col-md-6" key="webSite">
              <TextInput formik={formik} label="LBL_WEBSITE" accessor="webSite" mode="edit" />
            </div>
            <div className="col-md-6" />
            <div className="col-md-6">
              <CheckboxInput
                formik={formik}
                accessor="zatca_is_enabled"
                label="LBL_ENABLE_ZATICA_V2"
                mode="edit"
                isOnlyCheckboxesInRow={!formik.values.zatca_is_enabled}
              />
            </div>
            {formik.values.zatca_is_enabled && (
              <div className="col-md-6" key="zatca_code">
                <TextInput formik={formik} label="LBL_ZATICA_COMPANY_CODE" accessor="zatca_code" mode="edit" />
              </div>
            )}
          </div>
        </div>

        <div className="col-md-4">
          <div className="row">
            <div className="col-md-6">
              <FileInput
                formik={formik}
                identifier="logo"
                label="LBL_COMPANY_LOGO"
                alertHandler={alertHandler}
                parentId={data.id}
                fileId={data.logo?.id}
                tableModel={MODELS.COMPANY}
                mode="edit"
              />
            </div>

            <div className="col-md-6">
              <div className="row">
                <div className="col-md-12">
                  <NumberInput formik={formik} label="LBL_WIDTH" accessor="width" mode="edit" />
                </div>
                <div className="col-md-12">
                  <NumberInput formik={formik} label="LBL_HEIGHT" accessor="height" mode="edit" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-md-12">
          <div className="row">
            <BorderSection title="LBL_THE_ADDRESS" />
            <div className="col-md-4" key="country">
              <SearchModalAxelor
                formik={formik}
                modelKey="COUNTRIES"
                mode="edit"
                originalData={data?.country || null}
                isRequired={true}
                defaultValueConfig={{
                  payloadDomain: defaultSAPayloadDomain,
                  customDefaultSuccess: customDefaultSuccess,
                }}
                onSuccess={onCountriesSuccess}
                selectCallback={() => {
                  setFieldValue(formik, 'city', null);
                }}
                removeCallback={() => {
                  setFieldValue(formik, 'city', null);
                }}
              />
            </div>
            <div className="col-md-4" key="city">
              <SearchModalAxelor
                formik={formik}
                modelKey="CITY"
                mode="edit"
                isRequired={true}
                defaultValueConfig={formik.values.country?.id ? { payloadDomain: `self.country.id = ${formik.values.country?.id}` } : null}
                payloadDomain={`self.country.id = ${formik.values.country?.id}`}
                onSuccess={onCitiesSuccess}
              />
            </div>
            <div className="col-md-4" key="district">
              <TextInput formik={formik} label="LBL_DISTRICT" accessor="district" isRequired={true} mode="edit" />
            </div>
            <div className="col-md-4" key="buildingNumber">
              <TextInput formik={formik} label="LBL_BUILDING_NUMBER" accessor="buildingNumber" isRequired={true} mode="edit" />
            </div>
            <div className="col-md-4" key="streetNumber">
              <TextInput formik={formik} label="LBL_STREET_NUMBER" accessor="streetNumber" isRequired={true} mode="edit" />
            </div>
            <div className="col-md-4" key="postalCode">
              <TextInput formik={formik} label="LBL_POSTAL_CODE" accessor="postalCode" isRequired={true} mode="edit" />
            </div>
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
  );
}
