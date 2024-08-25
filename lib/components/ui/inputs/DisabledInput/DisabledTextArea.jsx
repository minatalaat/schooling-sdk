import './disabledInput.scss';

export default function DisabledTextArea({ inputValue, labelValue, isInteractiveTable = false }) {
  return (
    <>
      <div className="form-floating mb-3">
        <textarea
          className={isInteractiveTable ? 'form-control diabled-input-width' : 'form-control'}
          id="floatingInput"
          placeholder=""
          value={inputValue}
          disabled
        ></textarea>
        <label htmlFor="floatingInput">{labelValue}</label>
      </div>
    </>
  );
}
