import React from 'react';
import 'react-tooltip/dist/react-tooltip.css';

import { Tooltip } from 'react-tooltip';
import ToggleSwitch from './inputs/ToggleSwitch';

function PrintOptionsTooltip({ options, formik, isOpen }) {
  return (
    <Tooltip id="my-tooltip" clickable className="tooltip-container" isOpen={isOpen}>
      <div className="row">
        {options &&
          options.length > 0 &&
          options.map(option => {
            return (
              <div className="col-md-12">
                {option?.type === 'toggle' && (
                  <ToggleSwitch
                    formik={formik}
                    label={option.label}
                    accessor={option?.accessor}
                    isRequired={option?.isRequired ?? false}
                    mode={'add'}
                  />
                )}
              </div>
            );
          })}
      </div>
    </Tooltip>
  );
}

export default PrintOptionsTooltip;
