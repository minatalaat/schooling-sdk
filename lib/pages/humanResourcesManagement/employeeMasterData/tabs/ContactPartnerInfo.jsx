import TextInput from '../../../../components/ui/inputs/TextInput';
import FileInput from '../../../../components/ui/inputs/FileInput';
import PhoneInputField from '../../../../components/ui/inputs/PhoneInputField';

import { MODELS } from '../../../../constants/models';

export default function ContactPartnerInfo({ formik, addNew, enableEdit, data, alertHandler }) {
  return (
    <div className="row">
      <div className="col-md-3">
        <div className="row">
          <div className="col-md-12 d-flex justify-content-center">
            <FileInput
              formik={formik}
              identifier="picture"
              alertHandler={alertHandler}
              parentId={data?.contactPartner?.id}
              fileId={data?.contactPartner?.picture?.id}
              tableModel={MODELS.PARTNER}
            />
          </div>
        </div>
      </div>
      <div className="col-md-9">
        <div className="row">
          <div className="col-md-6">
            <TextInput
              formik={formik}
              label="LBL_FULL_NAME"
              accessor="name"
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
              isRequired={true}
            />
          </div>
          <div className="col-md-6">
            <TextInput
              formik={formik}
              label="LBL_EMAIL_ADDRESS"
              accessor="emailAddress"
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
            />
          </div>
          <div className="col-md-4">
            <PhoneInputField
              formik={formik}
              label="LBL_FIXED_PHONE"
              identifier="fixedPhone"
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
            />
          </div>
          <div className="col-md-4">
            <PhoneInputField
              formik={formik}
              label="LBL_MOBILE_NUMBER"
              identifier="mobilePhone"
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
            />
          </div>
          <div className="col-md-4">
            <PhoneInputField
              formik={formik}
              label="LBL_WORK_PHONE"
              identifier="fixedProPhone"
              mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
