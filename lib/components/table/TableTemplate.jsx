import React, { useMemo } from 'react';
// import "./Table.css"
import { useTable, useFilters, usePagination, useRowSelect } from 'react-table';
import Checkbox from './CheckBox';
import { useEffect } from 'react';
import { FaTrash, FaEdit } from 'react-icons/fa';
import { Table, Pagination } from 'react-bootstrap';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ExamplePrevious from '../../assets/images/example_previous.svg';
import ExampleNext from '../../assets/images/example_next.svg';
import ExamplePreviousAr from '../../assets/images/example_previous_ar.svg';
import ExampleNextAr from '../../assets/images/example_next_ar.svg';
import { EditIcon } from '../ui/actions/Actions';

const TableTemplate = ({ COLUMNS, DATA, select, enableEdit, setSelectedRows, enableDelete, editHandlerParent, deleteHandlerParent }) => {
  const { t } = useTranslation();
  let stateReducerFunc;
  const columns = useMemo(() => COLUMNS, []);
  const data = useMemo(() => DATA, [DATA]);

  const deleteHandler = row => {
    deleteHandlerParent(row);
  };

  const editHandler = row => {
    editHandlerParent(row);
  };

  // const defaultColumn = useMemo(() => {
  //     return {
  //         Filter: ProductColumnFilter
  //     }
  // })
  if (select === 'single') {
    stateReducerFunc = (newState, action) => {
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

  const tableInstance = useTable(
    {
      columns,
      data,
      stateReducer: stateReducerFunc,
      initialState: { pageIndex: 0 },
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
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    state,
    nextPage,
    previousPage,
    canPreviousPage,
    canNextPage,
    pageOptions,
    gotoPage,
    pageCount,
    setPageSize,
    selectedFlatRows,
    toggleRowSelected,
  } = tableInstance;
  const { pageIndex, pageSize, selectedRowIds } = state;

  useEffect(() => {
    setPageSize(8);
  }, []);

  useEffect(() => {
    setSelectedRows(selectedFlatRows);
  }, [selectedFlatRows, setSelectedRows]);

  const [current, setCurrent] = useState(pageIndex);
  // const start = current - 2;
  // const end = current + 2;
  // const step = 1;
  // const arrayLength = Math.floor(((end - start) / step)) + 1;
  // const range = [...Array(arrayLength).keys()].map(x => (x * step) + start);

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
                {headerGroup.headers.map(column => {
                  return (
                    <th {...column.getHeaderProps()}>
                      {column.id !== 'selection' ? t(column.render('Header')) : column.render('Header')}
                      {/* {column.render("Header")} */}
                      <div className="search-ex">{column.canFilter ? column.render('Filter') : null}</div>
                    </th>
                  );
                })}
                {(enableEdit === 'true' || enableDelete === 'true') && <th className="justify-content"></th>}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map(row => {
              prepareRow(row);
              return (
                <tr
                  {...row.getRowProps()}
                  onClick={() => toggleRowSelected(row.id)}
                  className={row.getToggleRowSelectedProps().checked ? 'primary-color' : ''}
                >
                  {row.cells.map(cell => (
                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  ))}
                  {enableEdit === 'true' && (
                    <Link
                      // 	to={ {

                      // 		pathname:el.statusSelect === 3 ?'/journals/editValidatedJournalEntry':'/journals/editJournalEntry',
                      // 		search:`?id=${el.id}`
                      // 	}
                      // }
                      id="button-tb"
                      runat="server"
                      className="clickable"
                      onClick={() => editHandler(row.original)}
                    >
                      <EditIcon />
                    </Link>
                  )}
                  {enableDelete === 'true' && (
                    <FaTrash color="#1B4297" fontSize="40px" className="add-margin" onClick={() => deleteHandler(row.original)}></FaTrash>
                  )}
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
      {/* <div className="pagination-new float-end mt-3"> */}
      <div className="pagination-new float-start mb-3">
        <ul className="pagination">
          <li
            className={!canPreviousPage ? 'disabled' : ''}
            onClick={() => {
              if (canPreviousPage) {
                previousPage();
                setCurrent(pageIndex);
              }
            }}
            disabled={!canPreviousPage}
          >
            <Link>
              <img
                src={localStorage.getItem('code') === 'en' ? ExamplePrevious : ExamplePreviousAr}
                alt={localStorage.getItem('code') === 'en' ? ExamplePrevious : ExamplePreviousAr}
              />
            </Link>
          </li>
          <li className="active">
            <Link>{pageIndex + 1}</Link>
          </li>
          <li
            className={!canNextPage ? 'disabled' : ''}
            onClick={() => {
              if (canNextPage) {
                nextPage();
                setCurrent(pageIndex + 1);
              }
            }}
            disabled={!canNextPage}
          >
            <Link>
              <img
                src={localStorage.getItem('code') === 'en' ? ExampleNext : ExampleNextAr}
                alt={localStorage.getItem('code') === 'en' ? ExampleNext : ExampleNextAr}
              />
            </Link>
          </li>
        </ul>
      </div>

      {/* <div className="pagination-new">
                <Pagination className="page-center">
                    <Pagination.First onClick={() => { gotoPage(0); setCurrent(1) }} disabled={!canPreviousPage} />
                    <Pagination.Prev onClick={() => { previousPage(); setCurrent(pageIndex) }} disabled={!canPreviousPage} />
                    <Pagination.Item disabled>{current}</Pagination.Item>
                    <Pagination.Next onClick={() => { nextPage(); setCurrent(pageIndex + 2) }} disabled={!canNextPage} />
                    <Pagination.Last onClick={() => { gotoPage(pageCount - 1); setCurrent(pageCount) }} disabled={!canNextPage} />
                </Pagination>
            </div> */}
      {/* <div className="page-style">
                <span>
                    Page: {' '}
                    <strong>{pageIndex + 1}</strong> of <strong>{pageOptions.length}</strong>
                </span>
                <span > | Go To Page {' '}
                    <input className="input" type='number' defaultValue={pageIndex + 1} min='1' max={pageCount} onChange={(e) => {
                        const pageNumber = e.target.value && e.target.value <= pageCount ? Number(e.target.value) - 1 : 0;
                        gotoPage(pageNumber)
                    }}
                        style={{ width: '50px' }}></input>
                </span>
                <select className="select" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                    {[10, 20, 50].map((pageSize) => {
                        return (<option key={pageSize} value={pageSize}>Show In {pageSize}</option>)
                    })}
                </select>
                <Button variant="outline-primary" size="sm"className="ms-1" onClick={() => gotoPage(0)} disabled={!canPreviousPage}>{'<<'}</Button>
                <Button  variant="outline-primary" size="sm"className="ms-1" onClick={() => previousPage()} disabled={!canPreviousPage}>{'<'}</Button>
                <Button  variant="outline-primary" size="sm"className="ms-1" onClick={() => nextPage()} disabled={!canNextPage}>{'>'}</Button>
                <Button variant="outline-primary" size="sm"className="ms-1" onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>{'>>'}</Button>
            </div> */}
    </>
  );
};

export default TableTemplate;
