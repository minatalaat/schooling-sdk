import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { useDispatch } from 'react-redux';

import ConfirmationPopup from '../components/ConfirmationPopup';
import ExportData from '../components/Toolbar/ExportData';
import ImportData from '../components/Toolbar/ImportData';

import { useAxiosFunction } from '../hooks/useAxios';
import { getRemoveAllUrl } from '../services/getUrl';
import { modelsEnum } from '../constants/modelsEnum/modelsEnum';

import { RiCheckboxMultipleFill } from 'react-icons/ri';

import { alertsActions } from '../store/alerts';

import {
  DeleteIcon,
  EditIcon,
  FilterIcon,
  MoreActionIcon,
  RefreshIcon,
  ViewIcon,
  MobileSearchIcon,
} from '../components/ui/actions/Actions';
import { featuresEnum } from '../constants/featuresEnum/featuresEnum';
import TableViewIcon from '../components/icons/TableViewIcon';
import CardViewIcon from '../components/icons/CardViewIcon';

const Toolbar = ({
  show,
  setShow,
  refreshData,
  editHandler,
  viewHandler,
  deleteHandler,
  selectAllHandler = '',
  sort,
  filter,
  sortHandler,
  filterHandler,
  showSearch = true,
  setShowMoreAction,
  bulkActionConfig,
  setActionInProgress,
  checked = [],
  setChecked = () => {},
  data,
  canSelectAll = true,
  searchPayload,
}) => {
  const location = useLocation();

  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const [windosSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);
  const [showBulkDeletePopup, setShowBulkDeletePopup] = useState(false);

  let pageSizeOptions = [
    { name: 10, value: 10 },
    { name: 25, value: 25 },
    { name: 50, value: 50 },
    { name: 100, value: 100 },
  ];
  let itemTitle = '';

  if (bulkActionConfig) {
    itemTitle =
      checked.length > 1
        ? checked.length.toString() + ' ' + t(modelsEnum[bulkActionConfig.modelsEnumKey].titlePlural)
        : checked.length.toString() + ' ' + t(modelsEnum[bulkActionConfig.modelsEnumKey].titleSingular);
  }

  const initValues = {
    searchVal: searchParams.get('search') ?? '',
  };

  const formik = useFormik({
    initialValues: initValues,
  });

  const alertHandler = (title, message) => dispatch(alertsActions.initiateAlert({ title, message }));

  const selectAllDataHandler = () => {
    if (checked.length !== data.length) {
      let allChecked = [];
      data.forEach(record => {
        allChecked.push({ id: record.id, version: record.version, name: record?.name || record?.busOperator?.username });
      });
      setChecked([...allChecked]);
    } else {
      setChecked([]);
    }
  };

  useEffect(() => {
    const handleWindowResize = () => {
      setWindowSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  });

  const checkIfSelectedOnDelete = () => {
    if (checked && checked.length > 0) {
      setShowBulkDeletePopup(true);
    } else {
      alertHandler('Error', t('LBL_ERROR_YOU_SHOULD_SELECT_ITEMS'));
    }
  };

  const removeAllHandler = async () => {
    const removeResponse = await api('POST', getRemoveAllUrl(modelsEnum[bulkActionConfig.modelsEnumKey].name), {
      records: checked,
    });
    setActionInProgress(false);
    setChecked([]);

    if (!removeResponse || removeResponse.data.status !== 0 || !removeResponse.data.data) {
      return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    }

    let message = bulkActionConfig.deleteSuccessMessage ?? 'DELETED_SUCCESSFULLY';
    alertHandler('Success', t(message));
    setTimeout(() => {
      return refreshData();
    }, [3000]);
  };

  const onDeleteClick = () => {
    setActionInProgress(true);

    if (typeof deleteHandler !== 'function') {
      removeAllHandler();
    } else {
      deleteHandler();
    }
  };

  const onSearchValueClick = () => {
    if (formik.values.searchVal.length > 0) {
      setSearchParams(params => {
        params.set('search', formik.values.searchVal);
        params.set('currentPage', 1);
        return params;
      });
    } else {
      resetSearchValue();
    }
  };

  const onPageSizeChange = val => {
    setSearchParams(params => {
      params.set('currentPage', 1);
      params.set('pageSize', val);
      return params;
    });
  };

  const resetSearchValue = () => {
    setSearchParams(params => {
      params.set('currentPage', 1);
      params.delete('search');
      return params;
    });
  };

  const handleEnterKeyPress = event => {
    if (event.key === 'Enter') {
      onSearchValueClick();
    }
  };

  const handleInput = event => {
    const inputValue = event.target.value;

    if (inputValue === '') {
      resetSearchValue();
    }
  };

  return (
    <>
      {showBulkDeletePopup && checked.length > 0 && (
        <ConfirmationPopup onClickHandler={onDeleteClick} setConfirmationPopup={setShowBulkDeletePopup} item={itemTitle} />
      )}
      <div className="card head-page">
        <div className="row">
          <div className="col filter-head">
            <div className="col-12">
              <div className="toolbar-mobile">
                {showSearch && (
                  <div className="search-ex float-start">
                    <button className="btn" type="button" onClick={onSearchValueClick}>
                      <MobileSearchIcon />
                    </button>
                    <input
                      type="search"
                      className="form-control"
                      placeholder={t('LBL_SEARCH')}
                      name="searchVal"
                      id="searchVal"
                      value={formik.values.searchVal}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      onKeyPress={handleEnterKeyPress}
                      onInput={handleInput}
                    />
                  </div>
                )}
                <div className="btn-group float-end">
                  <button type="button" className="btn more-popup-trigger" onClick={() => setShowMoreAction(true)}>
                    <MoreActionIcon />
                  </button>
                </div>
              </div>
            </div>
            {windosSize[0] > 1200 && (
              <div className="action-left float-start">
                {searchParams.get('pageSize') && (
                  <div className="dataTables_length float-start" id="example_length">
                    <label>
                      <span>{t('LBL_PER_PAGE')}</span>
                      <select
                        name="example_length"
                        aria-controls="example"
                        className=""
                        value={searchParams.get('pageSize') || 10}
                        onChange={event => {
                          onPageSizeChange(parseInt(event.target.value));
                        }}
                      >
                        <option value="" hidden>
                          {t('LBL_PLEASE_SELECT')}
                        </option>
                        {pageSizeOptions.map(option => {
                          return (
                            <option value={option.value} key={option.value}>
                              {option.name}
                            </option>
                          );
                        })}
                      </select>
                    </label>
                  </div>
                )}
                <ul>
                  {canSelectAll && (
                    <li
                      onClick={() => {
                        if (typeof selectAllHandler !== 'function' && data) selectAllDataHandler();
                        else selectAllHandler();
                      }}
                    >
                      <Link
                        to={{
                          pathname: location.pathname,
                          search: location.search,
                        }}
                      >
                        <RiCheckboxMultipleFill
                          color={data?.length !== 0 && checked?.length === data?.length ? '#1f4fde' : '#9D9D9D'}
                          size={23}
                        />
                      </Link>
                    </li>
                  )}
                  {refreshData && (
                    <li
                      onClick={() => {
                        if (showSearch) resetSearchValue();
                        refreshData();
                      }}
                    >
                      <Link
                        to={{
                          pathname: location.pathname,
                          search: location.search ? location.search : null,
                        }}
                      >
                        <RefreshIcon />
                      </Link>
                    </li>
                  )}
                  {editHandler && (
                    <li onClick={() => editHandler()}>
                      <Link
                        to={{
                          pathname: location.pathname,
                          search: location.search,
                        }}
                      >
                        <EditIcon />
                      </Link>
                    </li>
                  )}
                  {viewHandler && (
                    <li onClick={() => viewHandler()}>
                      <Link
                        to={{
                          pathname: location.pathname,
                          search: location.search,
                        }}
                      >
                        <ViewIcon />
                      </Link>
                    </li>
                  )}
                  {bulkActionConfig?.canDelete && (
                    <li onClick={checkIfSelectedOnDelete}>
                      <Link
                        to={{
                          pathname: location.pathname,
                          search: location.search,
                        }}
                      >
                        <DeleteIcon />
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            )}
            {show && windosSize[0] > 1200 && (
              <div className="action-right float-end">
                <div className="right-filter-tb">
                  <div className="table-view float-end">
                    <ul className="nav nav-pills mb-3" id="pills-tab" role="tablist">
                      <li className="nav-item" role="presentation">
                        <Link
                          to={{
                            pathname: location.pathname,
                            search: location.search,
                          }}
                          className={show === 'table' ? 'nav-link active' : 'nav-link'}
                          onClick={() => setShow('table')}
                          id="pills-home-tab"
                          data-bs-toggle="pill"
                          data-bs-target="#pills-home"
                          type="button"
                          role="tab"
                          aria-controls="pills-home"
                          aria-selected="true"
                        >
                          <TableViewIcon />
                        </Link>
                      </li>
                      <li className="nav-item" role="presentation">
                        <Link
                          to={{
                            pathname: location.pathname,
                            search: location.search,
                          }}
                          className={show === 'card' ? 'nav-link active' : 'nav-link'}
                          onClick={() => setShow('card')}
                          id="pills-profile-tab"
                          data-bs-toggle="pill"
                          data-bs-target="#pills-profile"
                          type="button"
                          role="tab"
                          aria-controls="pills-profile"
                          aria-selected="false"
                        >
                          <CardViewIcon />
                        </Link>
                      </li>
                    </ul>
                  </div>
                  {bulkActionConfig?.isExport && bulkActionConfig?.modelsEnumKey && (
                    <ExportData
                      dataModel={modelsEnum[bulkActionConfig.modelsEnumKey].name}
                      onAlert={alertHandler}
                      isImport={bulkActionConfig?.isImport || false}
                      searchPayload={searchPayload}
                    />
                  )}
                  {bulkActionConfig?.isImport && featuresEnum[bulkActionConfig.subFeature]?.importName && (
                    <ImportData
                      importConfigName={featuresEnum[bulkActionConfig.subFeature].importName}
                      onAlert={alertHandler}
                      refreshData={refreshData}
                    />
                  )}
                  <div id="example_filter" className="dataTables_filter float-end">
                    <label>
                      <ul className="custom-filter">
                        {sort && (
                          <li>
                            <Link
                              to={{
                                pathname: location.pathname,
                                search: location.search,
                              }}
                              onClick={() => sortHandler()}
                            >
                              <EditIcon />
                            </Link>
                          </li>
                        )}
                        {filter && (
                          <li>
                            <Link
                              to={{
                                pathname: location.pathname,
                                search: location.search,
                              }}
                              onClick={() => filterHandler()}
                            >
                              <FilterIcon />
                            </Link>
                          </li>
                        )}
                      </ul>
                      {showSearch && (
                        <input
                          type="search"
                          className="form-control"
                          placeholder={t('LBL_SEARCH')}
                          aria-controls="example"
                          name="searchVal"
                          id="searchVal"
                          value={formik.values.searchVal}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          onClick={onSearchValueClick}
                          onKeyPress={handleEnterKeyPress}
                          onInput={handleInput}
                        />
                      )}
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Toolbar;
