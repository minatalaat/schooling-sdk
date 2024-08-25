import { useTranslation } from 'react-i18next';

import SearchIconForm from '../../assets/images/search-icon-form.svg';
import ErrorMessage from '../ui/inputs/ErrorMessage';
import { get } from 'lodash';

export default function SearchModalContainer({ formik, selectIdentifier = 'name', label, mode = 'view', disabled }) {
  const { t } = useTranslation();
  const nestedAccessor = selectIdentifier.split('.');
  const accessorValue = get(formik.values, nestedAccessor, '');
  return (
    <>
      <div className="search-ex">
        <label htmlFor="exampleDataList" className="form-label">
          {t(label)}
          {mode !== 'view' && <span>*</span>}
        </label>
        <>
          <button className="btn" type="button" onClick={() => {}}>
            <img src={SearchIconForm} alt="search-icon" />
          </button>
          <input
            type="text"
            className="form-control"
            id="Label"
            placeholder={`${t('LBL_SELECT')} ${t(label)}`}
            name={selectIdentifier}
            value={accessorValue}
            onBlur={formik.handleBlur}
            // onClick={() => {}}
            onChange={formik.handleChange}
            disabled={disabled || mode === 'view'}
            autoComplete="off"
            style={{ overflow: 'hidden' }}
          />
          <ErrorMessage formik={formik} mode={mode} identifier={selectIdentifier} />
        </>
      </div>
    </>
  );
}
