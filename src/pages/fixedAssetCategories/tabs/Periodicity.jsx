import React from 'react';

import TextInput from '../../../components/ui/inputs/TextInput';

const Periodicity = ({ formik, mode, onDepreciationBlur }) => {
  return (
    <>
      <div className="row">
        {/* <div className="col-md-6">
          <TextInput formik={formik} label="LBL_COMPUTATION_METHOD" accessor="computationMethodSelect" mode={mode} disabled={true} />
        </div> */}
        <div className="col-md-6">
          <TextInput
            formik={formik}
            label="LBL_NUMBER_OF_DEPRECIATION"
            accessor="numberOfDepreciation"
            mode={mode}
            isRequired={true}
            onBlur={onDepreciationBlur}
          />
        </div>
      </div>
      {/* <div className="row">
        <div className="col-md-6">
          <TextInput formik={formik} label="LBL_DURATION_IN_MONTH" accessor="durationInMonth" mode="view" />
        </div>
      </div> */}
    </>
  );
};

export default Periodicity;
