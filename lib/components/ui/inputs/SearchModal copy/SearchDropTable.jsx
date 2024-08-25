import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import SearchDropRow from './SearchDropRow';

import { useSearchServices } from '../../../../services/apis/useSearchServices';
// import { useMainAxelorServices } from '../../../../services/apis/useMainAxelorServices';
import { useAxiosFunction } from '../../../../hooks/useAxios';
import { getSearchUrl } from '../../../../services/getUrl';

const SearchDropTable = ({
  MODEL_NAME,
  columns,
  successFunction,
  criteria,
  offset,
  pageSize,
  payloadDomain,
  payloadDomainContext,
  extraFields,
  data,
  showTable,
  selectHandler,
  selectionType,
  checked,
  // defaultValueConfig,
  //   setData,
}) => {
  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  //   const { searchService } = useMainAxelorServices();

  const { getSearchPayload } = useSearchServices({
    MODEL_NAME,
    COLUMNS: columns,
    criteria,
    offset,
    pageSize,
    payloadDomain,
    payloadDomainContext,
    extraFields,
    operator: 'or',
  });

  const searchModel = async () => {
    //TODO: add isLoading spinner
    //   setIsLoading(true);
    let payload = getSearchPayload();
    const res = await api('POST', getSearchUrl(MODEL_NAME), payload);
    // const resData = await searchService(MODEL_NAME, payload);
    if (res) await successFunction(res);
    //   setIsLoading(false);
  };

  useEffect(() => {
    if (showTable) {
      searchModel();
    }
  }, [showTable, criteria]);

  // useEffect(() => {
  //   searchModel();
  // }, [criteria]);

  return (
    <>
      <div className="table-responsive">
        <table className="table table-borderless table-striped">
          <thead>
            <tr>
              {selectionType === 'all' && (
                <th
                  scope="col"
                  style={{
                    width: '10px',
                  }}
                ></th>
              )}
              {columns.map(column => (
                <th key={column.accessor}>{t(column.Header)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data &&
              data?.map(row => (
                <SearchDropRow
                  key={row.id}
                  row={row}
                  columns={columns}
                  selectHandler={selectHandler}
                  selectionType={selectionType}
                  checked={checked}
                />
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default SearchDropTable;
