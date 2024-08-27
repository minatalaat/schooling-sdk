import { useEffect, useState } from 'react';
import TextInput from './TextInput';
import FormModal from '../modals/FormModal';
import { useFormik } from 'formik';
import { setAllValues } from '../../../utils/formHelpers';

function ClickableInput({ rowFormik, label, accessor, mode, selectCallback, FormComponent, additionalProps, isInteractiveTable }) {
  const [show, setShow] = useState();

  const copyFormik = useFormik({
    initialValues: rowFormik.values,
    validationSchema: rowFormik.validationSchema,
    validateOnMount: true,
  });

  useEffect(() => {
    setAllValues(copyFormik, rowFormik.values);
  }, [rowFormik.values]);
  return (
    <>
      <TextInput
        formik={rowFormik}
        label={label}
        accessor={accessor}
        mode={mode}
        onChange={() => {}}
        onClick={() => {
          if (rowFormik.isValid) {
            if (additionalProps?.onClickExtraHandler) {
              additionalProps?.onClickExtraHandler({ rowFormik: copyFormik });
            }

            setShow(true);
          }
        }}
        isInteractiveTable={isInteractiveTable}
      />
      {show && (
        <FormModal
          FormComponent={FormComponent}
          title={label}
          show={show}
          setShow={setShow}
          selectCallback={selectCallback ? values => selectCallback({ values: values, rowFormik: rowFormik }) : null}
          additionalProps={{ parentFormik: copyFormik, superFormik: rowFormik, ...additionalProps }}
        />
      )}
    </>
  );
}

export default ClickableInput;
