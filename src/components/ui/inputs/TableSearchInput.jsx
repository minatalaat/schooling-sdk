import { useTranslation } from 'react-i18next';
import SearchIconForm from '../../../assets/images/search-icon-form.svg';

const TableSearchInput = ({ onSearchButtonClick, values, index, column, onInputChange, handleEnterKeyPress }) => {
  const { t } = useTranslation();
  return (
    <>
      <button
        className="btn"
        type="button"
        onClick={e => {
          onSearchButtonClick();
        }}
      >
        <img src={SearchIconForm} alt={SearchIconForm} />
      </button>
      <input
        type="text"
        className="form-control"
        id="Label"
        placeholder={t('LBL_SEARCH')}
        value={values[index] || ''}
        onChange={e => {
          onInputChange(e, column, index);
        }}
        onKeyPress={handleEnterKeyPress}
      />
    </>
  );
};

export default TableSearchInput;
