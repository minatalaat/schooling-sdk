import { useTranslation } from 'react-i18next';
import i18n from 'i18next';

import { handleChange } from '../../utils/formHelpers';
import TermsAndConditionsModal from './TermsAndConditionsModal';

const TermsAndConditions = ({
  disabled = false,
  formik,
  accessor,
  mode,
  onChange,
  value,
  className = '',
  isOnlyCheckboxesInRow,
  isFirstLoginStyle = false,
  show,
  setShow,
  onAgree,
}) => {
  const { t } = useTranslation();
  return (
    <>
      <div
        className={`form-check checkbox-input ${i18n.dir() === 'ltr' ? 'm-r-30' : 'm-l-30'}  ${
          isOnlyCheckboxesInRow ? 'checkboxe-only' : ''
        } ${className}`}
      >
        <input
          className="form-check-input"
          type="checkbox"
          id="flexCheckDefault"
          name={accessor}
          value={value || formik.values[accessor]}
          checked={value ? formik.values[accessor]?.includes(value) : formik.values[accessor]}
          onChange={
            mode === 'view' || disabled
              ? () => {}
              : typeof onChange === 'function'
                ? e => onChange(e)
                : (e, value) => handleChange(formik, e, value)
          }
          onBlur={formik.handleBlur}
        />
        <label className={`form-check-label terms-and-conditions-label  ${isFirstLoginStyle ? 'mb-0' : ''}`} htmlFor={accessor}>
          {`${t('ACCEPT_AND_AGREE')} `}
          <span onClick={() => setShow(true)} className="terms-and-conditions">{`${t('LBL_TERMS_OF_USE')}`}</span>
        </label>
      </div>
      {show && <TermsAndConditionsModal show={show} setShow={setShow} onAgree={onAgree} />}
    </>
  );
};

export default TermsAndConditions;
