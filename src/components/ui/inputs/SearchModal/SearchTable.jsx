import { useEffect, useState, useMemo } from 'react';
import { Table } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { SpinnerCircular } from 'spinners-react';

import TableDropDown from '../TableDropDown';
import TableSearchInput from '../TableSearchInput';
import ModalPagination from './ModalPagination';

import { getSearchPayload } from '../../../../services/getSearchPayload';
import { useAxiosFunction } from '../../../../hooks/useAxios';
import { getSearchUrl } from '../../../../services/getUrl';
import useMetaFields from '../../../../hooks/metaFields/useMetaFields';

const SearchTable = ({
  MODEL_NAME,
  successFunction,
  COLUMNS,
  DATA,
  select,
  paginationProps,
  payloadDomain,
  payloadDomainContext,
  extraFields,
  currentValue,
  checked,
  setChecked,
  isLoading,
  setIsLoading = () => {},
}) => {
  let { offset, setOffset, total, pageSize, setPageCount, criteria, setCriteria } = paginationProps;
  const { t } = useTranslation();

  const metaFieldColumn = COLUMNS.filter(column => column.selectionName)[0];
  const selectionKeys = metaFieldColumn?.keys;
  const selectionName = metaFieldColumn?.selectionName;
  const metaFields = useMetaFields(selectionName);
  const metaFieldTranslate = metaFields.mode === 'enum';
  const metaFieldsList = metaFields.list || [];

  const { api } = useAxiosFunction();

  const [values, setValues] = useState([]);
  const [needsSearchCall, setNeedsSearchCall] = useState(false);

  const onSearchButtonClick = async () => {
    setIsLoading(true);
    let payload = getSearchPayload({ MODEL_NAME, COLUMNS, criteria, offset, pageSize, payloadDomain, payloadDomainContext, extraFields });
    const res = await api('POST', getSearchUrl(MODEL_NAME), payload);
    if (res) await successFunction(res);
    setIsLoading(false);
  };

  const onDropDownChange = (column, index, value) => {
    setNeedsSearchCall(true);
    if (!column.isString) value = parseInt(value);
    let tempValues = [...values];
    tempValues[index] = value;
    setOffset(0);
    setValues([...tempValues]);

    if (column.id && column.operator) {
      updateCriteria(column, value);
    }
  };

  const onInputChange = (e, column, index) => {
    setNeedsSearchCall(false);
    let tempValues = [...values];
    tempValues[index] = e.target.value;
    setOffset(0);
    setValues([...tempValues]);

    if (column.id && column.operator) {
      updateCriteria(column, e.target.value);
    }
  };

  const updateCriteria = (column, value) => {
    let tempCriteria = [...criteria];
    let newCriteria = { fieldName: column.id, operator: column.operator, value: value };
    const i = tempCriteria.findIndex(temp => temp.fieldName === column.id);
    if (column.operator === '=') {
      if (column.isBoolean) handleBooleanOperator(column, value, i, tempCriteria, newCriteria);
      else if (column.typeSelect) handleEnumOperator(value, i, tempCriteria, newCriteria);
      else handleNumericOperator(column, value, i, tempCriteria, newCriteria);
    } else handleStringOperator(value, i, tempCriteria, newCriteria);
  };

  const handleBooleanOperator = (column, value, i, tempCriteria) => {
    let boolVal = true;

    if (value.length > 0) {
      if ('true'.includes(value)) {
        boolVal = true;
      } else boolVal = false;
      if (i >= 0) tempCriteria[i] = { fieldName: column.id, operator: column.operator, value: boolVal };
      else tempCriteria.push({ fieldName: column.id, operator: column.operator, value: boolVal });
    } else {
      if (i >= 0) tempCriteria.splice(i, 1);
    }

    setCriteria([...tempCriteria]);
  };

  const handleEnumOperator = (value, i, tempCriteria, newCriteria) => {
    value = parseInt(value);

    if (value > 0) {
      if (i >= 0) tempCriteria[i] = newCriteria;
      else tempCriteria.push(newCriteria);
    } else {
      if (i >= 0) tempCriteria.splice(i, 1);
    }

    setCriteria([...tempCriteria]);
  };

  const handleStringOperator = (value, i, tempCriteria, newCriteria) => {
    if (value.length > 0) {
      if (i >= 0) tempCriteria[i] = newCriteria;
      else tempCriteria.push(newCriteria);
    } else {
      if (i >= 0) tempCriteria.splice(i, 1);
    }

    setCriteria([...tempCriteria]);
  };

  const handleNumericOperator = (column, value, i, tempCriteria) => {
    value = parseInt(value);

    if (value > 0) {
      if (i >= 0) tempCriteria[i] = { fieldName: column.id, operator: column.operator, value: value };
      else tempCriteria.push({ fieldName: column.id, operator: column.operator, value: value });
    } else {
      if (i >= 0) tempCriteria.splice(i, 1);
    }

    setCriteria([...tempCriteria]);
  };

  const handleEnterKeyPress = event => {
    if (event.key === 'Enter') {
      onSearchButtonClick();
    }
  };

  const getSelectionNameValues = cellValue => {
    if (selectionKeys.valueKey && selectionKeys.titleKey) {
      let selectedOption = metaFieldsList.find(option => Number(option[selectionKeys.valueKey]) === Number(cellValue));
      if (!selectedOption) return '';
      if (metaFieldTranslate) return t(selectedOption[selectionKeys.titleKey]);
      return selectedOption[selectionKeys.titleKey];
    }
  };

  const toggleAllHandler = e => {
    let tempChecked = [...checked];

    if (e.target.checked) {
      DATA.forEach(data => {
        if (tempChecked.find(el => el.id === data.id)) return;
        tempChecked.push(data);
      });
    } else {
      DATA.forEach(data => {
        let index = tempChecked.findIndex(el => el.id === data.id);
        if (index === -1) return;
        tempChecked.splice(index, 1);
      });
    }

    setChecked(tempChecked);
  };

  const toggleSingleHandler = (check, row) => {
    if (check) {
      if (select === 'single') return setChecked([row]);
      setChecked(prevState => [...prevState, row]);
    } else {
      if (select === 'single') return setChecked([]);
      setChecked(prevState => prevState.filter(el => el?.id !== row?.id));
    }
  };

  const checkAllToggled = useMemo(() => {
    let allChecked = checked.length > 0 ? true : false;
    DATA.forEach(data => {
      if (checked.find(el => el.id === data.id)) return;
      allChecked = false;
    });
    return allChecked;
  }, [checked, DATA]);

  useEffect(() => {
    if (total && pageSize) setPageCount(Math.ceil(total / pageSize) - 1);

    onSearchButtonClick();
  }, [offset, pageSize]);

  useEffect(() => {
    if (needsSearchCall) onSearchButtonClick();
  }, [criteria]);

  useEffect(() => {
    if (select === 'single' && currentValue) setChecked([currentValue]);
    if (select === 'all' && currentValue) setChecked(currentValue);
  }, []);

  return (
    <>
      <div
        className="table-responsive table-responsive-new fade show active"
        id="pills-home"
        role="tabpanel"
        aria-labelledby="pills-home-tab"
      >
        <Table responsive className="table table-responsive-stack dataTable">
          <thead>
            <tr>
              <th>
                {select === 'all' && !isLoading && (
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="chkOrgRow"
                    value=""
                    id="defaultCheck1"
                    onChange={toggleAllHandler}
                    checked={checkAllToggled}
                  />
                )}
              </th>
              {COLUMNS.map((column, index) => {
                return (
                  <th key={column.accessor}>
                    {t(column.Header)}
                    {!column.selectionName && (
                      <div className="search-ex">
                        <TableSearchInput
                          values={values}
                          index={index}
                          column={column}
                          onInputChange={onInputChange}
                          onSearchButtonClick={onSearchButtonClick}
                          handleEnterKeyPress={handleEnterKeyPress}
                        />
                      </div>
                    )}
                    {column.selectionName && (
                      <div className="search-ex">
                        <TableDropDown
                          onDropDownChange={onDropDownChange}
                          values={values}
                          index={index}
                          column={column}
                          options={metaFieldsList || []}
                        />
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          {!isLoading && (
            <tbody>
              {DATA.map(row => {
                return (
                  <tr
                    className={checked.find(el => el.id === row.id) ? 'primary-color' : ''}
                    key={row.id}
                    onClick={e => {
                      const checkbox = e.target.closest('tr').querySelector('input[type="checkbox"]');
                      if (e.target.id !== 'defaultCheck1') checkbox.checked = !checkbox.checked;
                      toggleSingleHandler(checkbox.checked, row);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="checked"
                        value=""
                        id="defaultCheck1"
                        checked={checked.findIndex(x => x.id === row.id) !== -1}
                        onChange={() => {}}
                      />
                    </td>
                    {COLUMNS.map(column => {
                      if (column.selectionName) return <td key={column.accessor}>{getSelectionNameValues(row[column.accessor])}</td>;
                      return <td key={column.accessor}>{row[column.accessor]}</td>;
                    })}
                  </tr>
                );
              })}
            </tbody>
          )}
        </Table>

        {!isLoading && DATA && DATA.length === 0 && (
          <div>
            <h5 className="text-center">{t('NO_DATA_AVAILABLE')}</h5>
          </div>
        )}
        {isLoading && (
          <div className="d-flex align-items-center justify-content-center pt-5">
            <SpinnerCircular
              size={71}
              thickness={138}
              speed={100}
              color="rgba(31, 79, 222, 1)"
              secondaryColor="rgba(153, 107, 229, 0.19)"
            />
          </div>
        )}
      </div>
      <ModalPagination offset={offset} total={total} setOffset={setOffset} pageSize={pageSize} />
    </>
  );
};

export default SearchTable;
