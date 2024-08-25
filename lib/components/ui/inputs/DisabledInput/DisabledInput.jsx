import { useId } from 'react';
import './disabledInput.scss';
import { useOverflowDetector } from 'react-detectable-overflow';
import { Tooltip } from 'react-tooltip';

export default function DisabledInput({ inputValue, labelValue, tooltipIdentifier, formikFieldValues, isInteractiveTable = false }) {
  const { ref, overflow } = useOverflowDetector({ handleWidth: true, handleHeight: true });
  const generatedId = useId();
  return (
    <>
      <div className="form-floating" data-tooltip-id={generatedId}>
        <input
          type="text"
          className={isInteractiveTable ? 'form-control diabled-input-width' : 'form-control'}
          id="floatingInput"
          placeholder=""
          value={inputValue}
          disabled
          ref={ref}
        />
        <label htmlFor="floatingInput">{labelValue}</label>
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
