import CheckboxInput from '../../../components/ui/inputs/CheckboxInput';
import ToggleSwitch from '../../../components/ui/inputs/ToggleSwitch';
import DateTimeInput from '../../../components/ui/inputs/DateTimeInput';
import TextArea from '../../../components/ui/inputs/TextArea';
import FileInput from '../../../components/ui/inputs/FileInput';
import TimeInput from '../../../components/ui/inputs/TimeInput';

export default function Tab1({ formik, mode }) {
  return (
    <div className="row">
      <div className="col-md-9">
        <div className="row">
          <div className="col-md-4">
            <DateTimeInput formik={formik} label="LBL_DATE_TIME" accessor="dateTime" mode={mode} isRequired={true} />
          </div>
          <div className="col-md-4">
            <TimeInput formik={formik} label="LBL_TIME" accessor="time" mode={mode} isRequired={true} />
          </div>
          <div className="col-md-4">
            <TextArea formik={formik} label="LBL_TEXT_AREA" accessor="textArea" mode={mode} isRequired={true} />
          </div>
          <div className="col-md-6">
            <ToggleSwitch formik={formik} label="LBL_IS_ENABLED" accessor="isEnabled" mode={mode} />
          </div>
          <div className="col-md-6 mt-5">
            <div className="form-check float-start m-r-30">
              <CheckboxInput formik={formik} accessor="isEnabled" label="LBL_IS_ENABLED" mode={mode} />
            </div>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <FileInput formik={formik} identifier="logo" label="LBL_LOGO" mode={mode} />
      </div>
    </div>
  );
}
