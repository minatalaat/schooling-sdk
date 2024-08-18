import SearchModalAxelor from '../../../../components/ui/inputs/SearchModal/SearchModalAxelor';

export default function UserCreation({ formik, addNew, enableEdit }) {
  return (
    <div className="row">
      <div className="col-md-4">
        <SearchModalAxelor
          formik={formik}
          modelKey="USERS"
          mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
          payloadDomain="self.group.name = 'Tier Test Standard'"
          isRequired={true}
          defaultValueConfig={false}
          selectIdentifier="fullName"
          extraFields={['fullName']}
        />
      </div>
    </div>
  );
}
