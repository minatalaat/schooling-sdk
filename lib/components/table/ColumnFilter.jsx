import { t } from 'i18next';
import React, { useState } from 'react';
import { useAsyncDebounce } from 'react-table';
import SearchIconForm from '../../assets/images/search-icon-form.svg';

// import './Table.css'
const ColumnFilter = ({ column }) => {
  const { filterValue, setFilter } = column;
  const [value, setValue] = useState(filterValue);
  const onChange = useAsyncDebounce(value => {
    setFilter(value);
  }, 1000);
  return (
    <>
      <button className="btn" type="button">
        <img src={SearchIconForm} alt={SearchIconForm} />
      </button>
      <input
        type="text"
        className="form-control"
        id="Label"
        placeholder={t('LBL_SEARCH')}
        value={value || ''}
        onChange={e => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
      />

      {/* // <div>
    //   <span>
    //     Search:{''}
    //     <input
    //       type="text"
    //       value={value || ""}
    //       onChange={(e) => {setValue(e.target.value); onChange(e.target.value);}}
    //     />
    //   </span>
    // </div>
    // <div>
    //   <span>
    //     <input
    //       className="search-input"
    //       type="text"
    //       value={value || ""}
    //       placeholder={t('LBL_SEARCH')}
    //       onChange={(e) => {setValue(e.target.value); onChange(e.target.value);}}
    //     />
    //   </span>
    // </div> */}
    </>
  );
};

export default ColumnFilter;
