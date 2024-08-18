import { useTranslation } from 'react-i18next';

// import "react-quill/dist/quill.snow.css";

// import { setFieldValue } from "../../../utils/formHelpers";

export default function TextAreaFormat({ disabled, isRequired, label, identifier, mode = 'view' }) {
  const { t } = useTranslation();

  // const toolbarModule = {
  //   toolbar: [
  //     [{ header: [1, 2, 3, 4, 5, 6, false] }],
  //     ["bold", "italic", "underline", { color: [] }], // toggled buttons
  //     [{ list: "ordered" }, { list: "bullet" }],
  //     [{ indent: "-1" }, { indent: "+1" }, { direction: "rtl" }, { align: [] }],
  //     ["clean"],
  //   ],
  // };
  return (
    <>
      <label htmlFor={identifier} className="form-label">
        {t(label)}
        {isRequired && !disabled && mode !== 'view' && <span>*</span>}
      </label>
      {/* <ReactQuill
        theme="snow"
        value={formik.values.instruction}
        onChange={value => setFieldValue(formik, identifier, value)}
        onBlur={() => formik.setFieldTouched(identifier, true)}
        modules={toolbarModule}
        readOnly={disabled || mode === 'view'}
      /> */}
    </>
  );
}
