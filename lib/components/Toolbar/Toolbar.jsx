import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { useDispatch } from 'react-redux';
import ExportData from './ExportData';
import ImportData from './ImportData';
import { useAxiosFunction } from '../../hooks/useAxios';
import { alertsActions } from '../../store/alerts';
import { useGetUrl } from '../../services/useGetUrl.js';
import { modelsEnum } from '../../constants/modelsEnum/modelsEnum';
import { confirmationPopupActions } from '../../store/confirmationPopup';
import { featuresEnum } from '../../constants/featuresEnum/featuresEnum';
import { DeleteIcon } from '../ui/actions/Actions';
import TableIcon from '../../assets/svgs/TableIcon.jsx';
import GridIcon from '../../assets/svgs/GridIcon.jsx';

const Toolbar = ({
  show,
  setShow,
  refreshData,
  deleteHandler,
  showSearch = true,
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
  const { getRemoveAllUrl } = useGetUrl();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const [windosSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);

  let pageSizeOptions = [
    { name: 10, value: 10 },
    { name: 25, value: 25 },
    { name: 50, value: 50 },
    { name: 100, value: 100 },
  ];
  let itemTitle = '';

  // if (bulkActionConfig) {
  //   itemTitle =
  //     checked.length > 1
  //       ? checked.length.toString() + ' ' + t(modelsEnum[bulkActionConfig.modelsEnumKey].titlePlural)
  //       : checked.length.toString() + ' ' + t(modelsEnum[bulkActionConfig.modelsEnumKey].titleSingular);
  // }

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
        allChecked.push({ id: record.id, version: record.version });
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
      // setShowBulkDeletePopup(true);
      deleteHandlerrNew();
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

  const deleteHandlerrNew = () => {
    dispatch(
      confirmationPopupActions.openPopup({
        title: 'LBL_BEWARE_ABOUT_TO_DELETE',
        message: itemTitle ? itemTitle : `#`,
        onConfirmHandler: () => onDeleteClick(),
      })
    );
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
  // const deleteHandler = () => {
  //   dispatch(
  //     confirmationPopupActions.openPopup({
  //       title: 'LBL_BEWARE_ABOUT_TO_DELETE',
  //       message:deleteUser.name ? deleteUser.name: `#user`,
  //       onConfirmHandler: () => deleteConfirmHandler(),
  //     })
  //   );
  // };

  return (
    <div className="row">
      <div className="col-12">
        <div className="filter d-xl-flex d-lg-flex d-md-flex d-sm-block justify-content-between">
          <div className="col-xl-3 col-lg-3 col-md-6 col-sm-12">
            <div className={`actions ${!showSearch ? 'fix-toolbar-height' : ''}`}>
              <div className="button-actions">
                <Link
                  to={{
                    pathname: location.pathname,
                    search: location.search,
                  }}
                  onClick={() => setShow('table')}
                  className="list"
                  title={t('TABLE_VIEW')}
                >
                  <TableIcon fill={show === 'table'} />
                </Link>
                <Link
                  to={{
                    pathname: location.pathname,
                    search: location.search,
                  }}
                  onClick={() => setShow('card')}
                  class="grid"
                  title={t('CARDS_VIEW')}
                >
                  <GridIcon stroke={show === 'card'} />
                </Link>
                {/*canSelectAll && (
                <Link
                  to={{
                    pathname: location.pathname,
                    search: location.search,
                  }}
                  onClick={() => {
                    if (typeof selectAllHandler !== 'function' && data) selectAllDataHandler();
                    else selectAllHandler();
                  }}
                  title={t('SELECT_ALL')}
                >
                  <RiCheckboxMultipleFill
                    color={data?.length !== 0 && checked?.length === data?.length ? '#151538' : '#9D9D9D'}
                    size={23}
                  />
                </Link>
              )*/}
              </div>
              {showSearch && (
                <div className="search-input">
                  <i className="search-icon"></i>
                  <input
                    type="text"
                    placeholder={t('LBL_SEARCH')}
                    className="search-text form-control"
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
            </div>
          </div>
          <div className="col-xl-3 col-lg-3 col-md-6 col-sm-12">
            <div className="table-controls">
              <div className="table-icons">
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
                {/*refreshData && (
                <Link
                  to={{
                    pathname: location.pathname,
                    search: location.search,
                  }}
                  class="refresh"
                  onClick={() => {
                    if (showSearch) resetSearchValue();
                    refreshData();
                  }}
                  title={t('REFRESH')}
                >
                  <RefreshIcon />
                </Link>
              )*/}
                {bulkActionConfig?.canDelete && (
                  <Link
                    to={{
                      pathname: location.pathname,
                      search: location.search,
                    }}
                    className="delete"
                    onClick={checkIfSelectedOnDelete}
                    // onClick={deleteHandlerrNew}
                    title={t('DELETE_SELECTED')}
                  >
                    <DeleteIcon />
                  </Link>
                )}
              </div>
              {searchParams.get('pageSize') && (
                <div className="row-select">
                  <select
                    className="form-select"
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
                          {`${option.name} ${t('LBL_ROWS')}`}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
