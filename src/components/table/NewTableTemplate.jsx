import { useEffect, useState, useMemo } from 'react';
import { useTable, useFilters, usePagination, useRowSelect } from 'react-table';
import { Table } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { SpinnerCircular } from 'spinners-react';

import Checkbox from './CheckBox';
import TableDropDown from '../../components/ui/inputs/TableDropDown';
import TableSearchInput from '../ui/inputs/TableSearchInput';
import ModalPagination from '../../parts/ModalPagination';

import { getSearchPayload } from '../../services/getSearchPayload';
import { useAxiosFunction } from '../../hooks/useAxios';
import { getSearchUrl } from '../../services/getUrl';
import useMetaFields from '../../hooks/metaFields/useMetaFields';

const TableTemplate = ({
  MODEL_NAME,
  successFunction,
  COLUMNS,
  DATA,
  select,
  setSelectedRows,
  paginationProps,
  payloadDomain,
  payloadDomainContext,
  extraFields,
  setSaveDisabled,
  currentValue,
}) => {
  let { offset, setOffset, total, pageSize, setPageCount, criteria, setCriteria } = paginationProps;
  const { t } = useTranslation();
  let stateReducerFunc;
  const columns = useMemo(() => COLUMNS, []);
  const data = useMemo(() => DATA, [DATA]);
  const metaFieldColumn = columns.filter(column => column.selectionName)[0];
  const selectionKeys = metaFieldColumn?.keys;
  const selectionName = metaFieldColumn?.selectionName;
  const metaFields = useMetaFields(selectionName);
  const metaFieldTranslate = metaFields.mode === 'enum';
  const metaFieldsList = metaFields.list || [];

  const { api, isLoading } = useAxiosFunction();

  const [values, setValues] = useState([]);
  const [needsSearchCall, setNeedsSearchCall] = useState(false);

  // In case of single we need only one value selected so on toggle we replace the old checked with the new one below
  if (select === 'single') {
    stateReducerFunc = (newState, action, prevState) => {
      if (action.type === 'toggleRowSelected') {
        newState.selectedRowIds = {
          [action.id]: true,
        };
      }

      return newState;
    };
  } else {
    stateReducerFunc = () => {};
  }

  const { getTableProps, getTableBodyProps, headerGroups, prepareRow, page, selectedFlatRows, toggleRowSelected, rows } = useTable(
    {
      columns,
      data,
      stateReducer: stateReducerFunc,
      initialState: { pageIndex: 0, pageSize },
    },
    useFilters,
    usePagination,
    useRowSelect,
    hooks => {
      hooks.visibleColumns.push(columns => {
        var selectcolumns = [];

        if (select === 'all') {
          selectcolumns = [
            {
              id: 'selection',
              Header: ({ getToggleAllRowsSelectedProps }) => {
                return <Checkbox {...getToggleAllRowsSelectedProps()} />;
              },
              Cell: ({ row }) => {
                return <Checkbox {...row.getToggleRowSelectedProps()} />;
              },
            },
            ...columns,
          ];
        } else if (select === 'single') {
          selectcolumns = [
            {
              id: 'selection',
              Cell: ({ row }) => {
                return <Checkbox {...row.getToggleRowSelectedProps()} />;
              },
            },
            ...columns,
          ];
        } else {
          selectcolumns = [...columns];
        }

        return selectcolumns;
      });
    }
  );

  const toggleCheck = () => {
    rows.forEach(row => {
      if (select === 'single' && row?.original?.id === currentValue?.id && row.toggleRowSelected && !row.isSelected)
        row.toggleRowSelected();

      if (select === 'all' && currentValue?.length > 0) {
        currentValue.forEach(currValue => {
          if (row?.original?.id === currValue?.id && row.toggleRowSelected && !row.isSelected) return row.toggleRowSelected();
        });
      }
    });
  };

  useEffect(() => {
    setValues(Array(headerGroups[0].headers.length).fill(''));
  }, []);

  useEffect(() => {
    toggleCheck();
  }, [rows]);

  useEffect(() => {
    if (!selectedFlatRows || selectedFlatRows.length === 0) setSaveDisabled(true);
    else setSaveDisabled(false);
  }, [selectedFlatRows]);

  useEffect(() => {
    if (total && pageSize) {
      setPageCount(Math.ceil(total / pageSize) - 1);
    }

    onSearchButtonClick();
  }, [offset, pageSize]);

  useEffect(() => {
    if (needsSearchCall) {
      onSearchButtonClick();
    }
  }, [criteria]);

  useEffect(() => {
    setSelectedRows(selectedFlatRows);
  }, [selectedFlatRows]);

  const onSearchButtonClick = () => {
    let payload = getSearchPayload({ MODEL_NAME, COLUMNS, criteria, offset, pageSize, payloadDomain, payloadDomainContext, extraFields });
    api('POST', getSearchUrl(MODEL_NAME), payload, successFunction);
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

  return (
    <>
      <div
        className="table-responsive table-responsive-new fade show active"
        id="pills-home"
        role="tabpanel"
        aria-labelledby="pills-home-tab"
      >
        <Table responsive {...getTableProps()} className="table table-responsive-stack dataTable">
          <thead>
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column, index) => {
                  return (
                    <th {...column.getHeaderProps()}>
                      {column.id !== 'selection' ? t(column.render('Header')) : column.render('Header')}

                      {column.id !== 'selection' && (
                        <>
                          {!column.typeSelect && !column.selectionName && (
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
                          {column.typeSelect && (
                            <div className="search-ex">
                              <select
                                className={`form-select placeholder-shown${values[index] !== '' ? ' edit' : ''}`}
                                value={values[index] || ''}
                                onChange={e => {
                                  onDropDownChange(column, index, e.target.value);
                                }}
                              >
                                {column.typeSelect.map((type, i) => {
                                  if (t(type).length > 0)
                                    return (
                                      <option value={i} key={type}>
                                        {t(type)}
                                      </option>
                                    );
                                  return null;
                                })}
                              </select>
                            </div>
                          )}
                        </>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          {!isLoading && (
            <tbody {...getTableBodyProps()}>
              {page.map(row => {
                prepareRow(row);
                return (
                  <tr
                    {...row.getRowProps()}
                    onClick={() => toggleRowSelected(row.id)}
                    className={row.getToggleRowSelectedProps().checked ? 'primary-color' : ''}
                  >
                    {row.cells.map(cell => {
                      if (cell.column.selectionName) {
                        return <td {...cell.getCellProps()}>{getSelectionNameValues(cell.value)}</td>;
                      } else return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
                    })}
                  </tr>
                );
              })}
            </tbody>
          )}
        </Table>

        {!isLoading && page && page.length === 0 && (
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

export default TableTemplate;
