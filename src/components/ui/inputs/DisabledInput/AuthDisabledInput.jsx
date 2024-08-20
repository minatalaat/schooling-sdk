import { useId } from 'react';
import './disabledInput.scss';
import { useOverflowDetector } from 'react-detectable-overflow';
import { Tooltip } from 'react-tooltip';

export default function AuthDisabledInput({ inputValue, labelValue, tooltipIdentifier, formikFieldValues, isInteractiveTable = false }) {
  const { ref, overflow } = useOverflowDetector({ handleWidth: true, handleHeight: true });
  const generatedId = useId();
  return (
    <>
      <div className="" data-tooltip-id={generatedId}>
          <label htmlFor="floatingInput">{labelValue}</label>
        <input
          type="text"
          className={isInteractiveTable ? 'form-control border' : 'form-control border'}
          id="floatingInput"
          placeholder=""
          value={inputValue}
          disabled
          ref={ref}
        />
        {tooltipIdentifier && (
          <Tooltip place="top" id={generatedId}>
            {formikFieldValues?.[tooltipIdentifier] ?? ''}
          </Tooltip>
        )}
        {!tooltipIdentifier && overflow && (
          <Tooltip place="top" id={generatedId}>
            {inputValue}
          </Tooltip>
        )}
      </div>
    </>
  );
}
