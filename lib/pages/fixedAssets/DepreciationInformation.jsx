import { useEffect } from 'react';
import { useFormik } from 'formik';

import TextInput from '../../components/ui/inputs/TextInput';
import DepreciationLines from './DepreciationLines';

function DepreciationInformation({ mode, data, parentContext, setDurationData, hasCustomAction, customActionIcon, customActionHandler }) {
  const initialValues = {
    w: data
      ? data[1]
        ? data[1].values
          ? data[1].values.computationMethodSelect
            ? data[1].values.computationMethodSelect
            : ''
          : ''
        : ''
      : '',
    depreciationPeriodInMonth: data
      ? data[1]
        ? data[1].values
          ? data[1].values.numberOfDepreciation
            ? data[1].values.numberOfDepreciation
            : ''
          : ''
        : ''
      : '',
  };

  const formik = useFormik({
    initialValues,
  });

  useEffect(() => {
    formik.setValues({
      computationMethod: data
        ? data[1]
          ? data[1].values
            ? data[1].values.computationMethodSelect
              ? data[1].values.computationMethodSelect
              : ''
            : ''
          : ''
        : '',
      depreciationPeriodInMonth: data
        ? data[1]
          ? data[1].values
            ? data[1].values.numberOfDepreciation
              ? data[1].values.numberOfDepreciation
              : ''
            : ''
          : ''
        : '',
    });
    setDurationData({
      computationMethod: data
        ? data[1]
          ? data[1].values
            ? data[1].values.computationMethodSelect
              ? data[1].values.computationMethodSelect
              : ''
            : ''
          : ''
        : '',
      durationInMonth: data
        ? data[1]
          ? data[1].values
            ? data[1].values.numberOfDepreciation
              ? data[1].values.numberOfDepreciation
              : ''
            : ''
          : ''
        : '',
    });
  }, [data]);

  return (
    <div className="row d-contents">
      <div className="row">
        <div className="col-md-6">
          <TextInput
            formik={formik}
            label="LBL_DEPRECIATION_PERIOD_IN_MONTH"
            accessor="depreciationPeriodInMonth"
            mode="view"
            disabled={true}
          />
        </div>
      </div>
      <DepreciationLines
        pageMode={mode}
        tableTitle="LBL_DEPRECIATION_LINES"
        hasCustomAction={hasCustomAction}
        customActionIcon={customActionIcon}
        customActionHandler={customActionHandler}
        parentContext={parentContext}
      />
    </div>
  );
}

export default DepreciationInformation;
