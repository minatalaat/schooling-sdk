import React from 'react';
import { useTranslation } from 'react-i18next';

function SearchBox({ searchProps }) {
  let data = searchProps.data;
  let keys = searchProps.columnNames;
  let setSearchResult = searchProps.setSearchResult;
  let displayedData = searchProps.displayedData;
  let setOffset = searchProps.setOffset;
  let setTotal = searchProps.setTotal;
  let setPageCount = searchProps.setPageCount;
  let pageSize = searchProps.pageSize;

  const searchHandler = value => {
    // let result = data.filter((e) =>
    //     keys.forEach((a) => {
    //         if (e[a].includes(value))
    //             return e
    //     })
    // )
    let result = [];
    data.filter(e =>
      keys.forEach(a => {
        if (e[a].toLowerCase().includes(value.toLowerCase())) {
          if (result.findIndex(res => res.id === e.id) === -1) {
            result.push(e);
          }
        }
      })
    );

    if (value === '') {
      setSearchResult(displayedData);
    } else {
      if (result && result.length > 0) {
        result = result.filter(e => e.id);
        setSearchResult(result);
      } else {
        setSearchResult([]);
      }
    }
  };

  const { t } = useTranslation();
  return (
    <input
      type="search"
      className="form-control"
      placeholder={t('LBL_SEARCH')}
      aria-controls="example"
      onChange={e => searchHandler(e.target.value)}
    />
  );
}

export default SearchBox;
