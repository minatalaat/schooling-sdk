import TextAreaFormat from '../../../components/ui/inputs/TextAreaFormat';

export default function Tab2({ formik, mode }) {
  return (
    <div className="row">
      <div className="col-md-12">
        <TextAreaFormat formik={formik} mode={mode} accessor="instruction" label="LBL_INSTRUCTIONS" />
      </div>
    </div>
  );
}
