import BorderSection from '../../../../components/ui/inputs/BorderSection';
import PhoneInputField from '../../../../components/ui/inputs/PhoneInputField';
import DateInput from '../../../../components/ui/inputs/DateInput';
import DropDown from '../../../../components/ui/inputs/DropDown';
import SearchModalAxelor from '../../../../components/ui/inputs/SearchModal/SearchModalAxelor';
import TextInput from '../../../../components/ui/inputs/TextInput';
import ToggleSwitch from '../../../../components/ui/inputs/ToggleSwitch';

import useMetaFields from '../../../../hooks/metaFields/useMetaFields';

export default function BasicInformation({ formik, addNew, enableEdit }) {
  const maritalStatus = useMetaFields('hr.employee.marital.status');
  const sexSelect = useMetaFields('employee.hr.sex.select');

  return (
    <div className="row">
      <div className="col-md-4">
        <DateInput
          formik={formik}
          label="LBL_BIRTH_DATE"
          accessor="birthDate"
          mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
          isRequired={true}
        />
      </div>
      <div className="col-md-4">
        <DropDown
          options={maritalStatus.list}
          formik={formik}
          isRequired={false}
          label="LBL_MARITAL_STATUS"
          accessor="maritalStatus"
          translate={maritalStatus.mode === 'enum'}
          keys={{ valueKey: 'value', titleKey: 'label' }}
          mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
          initialValue={0}
        />
      </div>
      <div className="col-md-4">
        <DropDown
          options={sexSelect.list}
          formik={formik}
          isRequired={false}
          label="LBL_GENDER"
          accessor="sexSelect"
          translate={sexSelect.mode === 'enum'}
          keys={{ valueKey: 'value', titleKey: 'label' }}
          mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
          initialValue={0}
        />
      </div>
      <div className="col-md-4">
        <SearchModalAxelor
          formik={formik}
          modelKey="COUNTRY_OF_BIRTH"
          mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
          isRequired={true}
        />
      </div>
      <div className="col-md-4">
        <SearchModalAxelor
          formik={formik}
          modelKey="DEPARTMENT_OF_BIRTH"
          mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
          defaultValueConfig={false}
        />
      </div>
      <div className="col-md-4">
        <SearchModalAxelor
          formik={formik}
          modelKey="CITY_OF_BIRTH"
          mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
          defaultValueConfig={false}
        />
      </div>
      <div className="col-md-4">
        <SearchModalAxelor
          formik={formik}
          modelKey="CITIZENSHIP"
          mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
          defaultValueConfig={false}
        />
      </div>
      <div className="col-md-4">
        <TextInput formik={formik} label="LBL_MARITAL_NAME" accessor="maritalName" mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'} />
      </div>
      <div className="col-md-4">
        <TextInput
          formik={formik}
          label="LBL_IQAMA_OR_NATIONAL_ID"
          accessor="socialSecurityNumber"
          mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
          maxLength={15}
        />
      </div>
      <BorderSection title="LBL_CONTACT_IN_CASE_OF_EMERGENCY" />
      <div className="col-md-4">
        <TextInput formik={formik} label="LBL_NAME" accessor="emergencyContact" mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'} />
      </div>
      <div className="col-md-4">
        <PhoneInputField
          formik={formik}
          label="LBL_PHONE"
          accessor="emergencyNumber"
          mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
        />
      </div>
      <div className="col-md-4">
        <TextInput
          formik={formik}
          label="LBL_RELATIONSHIP"
          accessor="emergencyContactRelationship"
          mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
        />
      </div>
      <BorderSection title="LBL_HR_INFORMATION" />
      <div className="row">
        <div className="col-md-4">
          <SearchModalAxelor
            formik={formik}
            modelKey="MANAGER_USERS"
            mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
            selectIdentifier="fullName"
            extraFields={['fullName']}
          />
        </div>
        <div className="col-md-4">
          <ToggleSwitch formik={formik} label="LBL_MANAGER" accessor="hrManager" mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'} />
        </div>
        <div className="col-md-4">
          <ToggleSwitch formik={formik} label="LBL_EXTERNAL" accessor="external" mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'} />
        </div>
      </div>
      <div className="row">
        <div className="col-md-4">
          <SearchModalAxelor
            formik={formik}
            modelKey="WEEKLY_PLANNING"
            mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
            isRequired={true}
          />
        </div>
        <div className="col-md-4">
          <SearchModalAxelor
            formik={formik}
            modelKey="PUBLIC_HOLIDAYS_PLAN"
            mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
            isRequired={true}
          />
        </div>
        <div className="col-md-4">
          <SearchModalAxelor formik={formik} modelKey="IMPOSED_HOLIDAYS_PLAN" mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'} />
        </div>
      </div>
    </div>
  );
}
