import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { RiCheckboxMultipleFill } from 'react-icons/ri';

import ConfirmationPopup from '../modals/ConfirmationPopup';
import ImageWithSkeleton from '../ui/skeletons/ImageWithSkeleton';

import EditIconBtnHeader from '../../assets/icons/edit-icon.svg';
import deleteIconBtnHrader from '../../assets/icons/delete-icon.svg';
import filterIconTb from '../../assets/icons/filter-icon-tb.svg';
import editIconTbHeader from '../../assets/icons/edit-icon-tb-header.svg';
import refreshIcon from '../../assets/icons/h-2.svg';
import viewIcon from '../../assets/icons/view-icon.svg';
import MoreAction from '../../assets/icons/morecircle.svg';
import MobileSearchIcon from '../../assets/icons/mobile-icon-search.svg';

const Toolbar = ({
  show,
  setShow,
  refreshData,
  editHandler,
  viewHandler,
  selectAllHandler = '',
  sort,
  filter,
  sortHandler,
  filterHandler,
  showSearch = true,
  setShowMoreAction,
  bulkActionConfig,
  checked = [],
  showMore = true,
  setChecked = () => {},
  data,
  deleteHandler,
  canSelectAll = true,
}) => {
  const location = useLocation();
  const checkedNames = checked?.map(item => item?.name).join(', ');

  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [windosSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);
  const [showBulkDeletePopup, setShowBulkDeletePopup] = useState(false);
  let pageSizeOptions = [
    { name: 10, value: 10 },
    { name: 25, value: 25 },
    { name: 50, value: 50 },
    { name: 100, value: 100 },
  ];
  const initValues = {
    searchVal: searchParams.get('search') ?? '',
  };

  const formik = useFormik({
    initialValues: initValues,
  });

  const alertHandler = (type, message) => {};

  console.log(checked);

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
        <ConfirmationPopup onClickHandler={deleteHandler} setConfirmationPopup={setShowBulkDeletePopup} item={checkedNames} />
      )}
      <div className="card head-page">
        <div className="row">
          <div className="col filter-head">
            <div className="col-12">
              <div className="toolbar-mobile">
                {showSearch && (
                  <div className="search-ex float-start">
                    <button className="btn" type="button" onClick={onSearchValueClick}>
                      <img src={MobileSearchIcon} alt={MobileSearchIcon} />
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
                {showMore && (
                  <div className="btn-group float-end">
                    <button type="button" className="btn more-popup-trigger" onClick={() => setShowMoreAction(true)}>
                      <ImageWithSkeleton imgSrc={MoreAction} imgAlt={MoreAction} isListIcon={true} />
                    </button>
                  </div>
                )}
              </div>
            </div>
            {windosSize[0] > 1024 && (
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
                          return <option value={option.value}>{option.name}</option>;
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
                          isIcon={true}
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
                        <ImageWithSkeleton imgSrc={refreshIcon} imgAlt={refreshIcon} isListIcon={true} />
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
                        <ImageWithSkeleton imgSrc={EditIconBtnHeader} imgAlt={EditIconBtnHeader} isListIcon={true} />
                        aa
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
                        <ImageWithSkeleton imgSrc={viewIcon} imgAlt={viewIcon} isListIcon={true} />
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
                        <ImageWithSkeleton imgSrc={deleteIconBtnHrader} imgAlt={deleteIconBtnHrader} isListIcon={true} />
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            )}
            {show && windosSize[0] > 1024 && (
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
                          <svg width="24" height="24" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                              d="M5.76 1.92C5.76 1.53809 5.91171 1.17182 6.18177 0.901766C6.45182 0.631714 6.81809 0.48 7.2 0.48H22.56C22.9419 0.48 23.3082 0.631714 23.5782 0.901766C23.8483 1.17182 24 1.53809 24 1.92C24 2.30191 23.8483 2.66818 23.5782 2.93823C23.3082 3.20829 22.9419 3.36 22.56 3.36H7.2C6.81809 3.36 6.45182 3.20829 6.18177 2.93823C5.91171 2.66818 5.76 2.30191 5.76 1.92ZM22.56 8.16H7.2C6.81809 8.16 6.45182 8.31171 6.18177 8.58177C5.91171 8.85182 5.76 9.21809 5.76 9.6C5.76 9.98191 5.91171 10.3482 6.18177 10.6182C6.45182 10.8883 6.81809 11.04 7.2 11.04H22.56C22.9419 11.04 23.3082 10.8883 23.5782 10.6182C23.8483 10.3482 24 9.98191 24 9.6C24 9.21809 23.8483 8.85182 23.5782 8.58177C23.3082 8.31171 22.9419 8.16 22.56 8.16ZM22.56 15.84H7.2C6.81809 15.84 6.45182 15.9917 6.18177 16.2618C5.91171 16.5318 5.76 16.8981 5.76 17.28C5.76 17.6619 5.91171 18.0282 6.18177 18.2982C6.45182 18.5683 6.81809 18.72 7.2 18.72H22.56C22.9419 18.72 23.3082 18.5683 23.5782 18.2982C23.8483 18.0282 24 17.6619 24 17.28C24 16.8981 23.8483 16.5318 23.5782 16.2618C23.3082 15.9917 22.9419 15.84 22.56 15.84ZM1.92 7.68C1.54026 7.68 1.16905 7.79261 0.853306 8.00358C0.537564 8.21455 0.291472 8.51441 0.146152 8.86525C0.0008319 9.21608 -0.0371905 9.60213 0.0368931 9.97457C0.110977 10.347 0.293839 10.6891 0.562356 10.9576C0.830872 11.2262 1.17298 11.409 1.54543 11.4831C1.91787 11.5572 2.30392 11.5192 2.65475 11.3738C3.00559 11.2285 3.30545 10.9824 3.51642 10.6667C3.72739 10.351 3.84 9.97974 3.84 9.6C3.84 9.09078 3.63772 8.60242 3.27765 8.24235C2.91758 7.88228 2.42922 7.68 1.92 7.68ZM1.92 0C1.54026 0 1.16905 0.112606 0.853306 0.323578C0.537564 0.534551 0.291472 0.834413 0.146152 1.18525C0.0008319 1.53608 -0.0371905 1.92213 0.0368931 2.29457C0.110977 2.66702 0.293839 3.00913 0.562356 3.27764C0.830872 3.54616 1.17298 3.72902 1.54543 3.80311C1.91787 3.87719 2.30392 3.83917 2.65475 3.69385C3.00559 3.54853 3.30545 3.30244 3.51642 2.98669C3.72739 2.67095 3.84 2.29974 3.84 1.92C3.84 1.41078 3.63772 0.922425 3.27765 0.562355C2.91758 0.202285 2.42922 0 1.92 0ZM1.92 15.36C1.54026 15.36 1.16905 15.4726 0.853306 15.6836C0.537564 15.8945 0.291472 16.1944 0.146152 16.5452C0.0008319 16.8961 -0.0371905 17.2821 0.0368931 17.6546C0.110977 18.027 0.293839 18.3691 0.562356 18.6376C0.830872 18.9062 1.17298 19.089 1.54543 19.1631C1.91787 19.2372 2.30392 19.1992 2.65475 19.0538C3.00559 18.9085 3.30545 18.6624 3.51642 18.3467C3.72739 18.031 3.84 17.6597 3.84 17.28C3.84 16.7708 3.63772 16.2824 3.27765 15.9224C2.91758 15.5623 2.42922 15.36 1.92 15.36Z"
                              fill="#9D9D9D"
                            />
                          </svg>
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
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                              d="M0 1.71429C0 1.25963 0.180612 0.823593 0.502103 0.502103C0.823593 0.180612 1.25963 0 1.71429 0H5.14286C5.59751 0 6.03355 0.180612 6.35504 0.502103C6.67653 0.823593 6.85714 1.25963 6.85714 1.71429V5.14286C6.85714 5.59751 6.67653 6.03355 6.35504 6.35504C6.03355 6.67653 5.59751 6.85714 5.14286 6.85714H1.71429C1.25963 6.85714 0.823593 6.67653 0.502103 6.35504C0.180612 6.03355 0 5.59751 0 5.14286V1.71429ZM8.57143 1.71429C8.57143 1.25963 8.75204 0.823593 9.07353 0.502103C9.39502 0.180612 9.83106 0 10.2857 0H13.7143C14.1689 0 14.605 0.180612 14.9265 0.502103C15.248 0.823593 15.4286 1.25963 15.4286 1.71429V5.14286C15.4286 5.59751 15.248 6.03355 14.9265 6.35504C14.605 6.67653 14.1689 6.85714 13.7143 6.85714H10.2857C9.83106 6.85714 9.39502 6.67653 9.07353 6.35504C8.75204 6.03355 8.57143 5.59751 8.57143 5.14286V1.71429ZM17.1429 1.71429C17.1429 1.25963 17.3235 0.823593 17.645 0.502103C17.9665 0.180612 18.4025 0 18.8571 0H22.2857C22.7404 0 23.1764 0.180612 23.4979 0.502103C23.8194 0.823593 24 1.25963 24 1.71429V5.14286C24 5.59751 23.8194 6.03355 23.4979 6.35504C23.1764 6.67653 22.7404 6.85714 22.2857 6.85714H18.8571C18.4025 6.85714 17.9665 6.67653 17.645 6.35504C17.3235 6.03355 17.1429 5.59751 17.1429 5.14286V1.71429ZM0 10.2857C0 9.83106 0.180612 9.39502 0.502103 9.07353C0.823593 8.75204 1.25963 8.57143 1.71429 8.57143H5.14286C5.59751 8.57143 6.03355 8.75204 6.35504 9.07353C6.67653 9.39502 6.85714 9.83106 6.85714 10.2857V13.7143C6.85714 14.1689 6.67653 14.605 6.35504 14.9265C6.03355 15.248 5.59751 15.4286 5.14286 15.4286H1.71429C1.25963 15.4286 0.823593 15.248 0.502103 14.9265C0.180612 14.605 0 14.1689 0 13.7143V10.2857ZM8.57143 10.2857C8.57143 9.83106 8.75204 9.39502 9.07353 9.07353C9.39502 8.75204 9.83106 8.57143 10.2857 8.57143H13.7143C14.1689 8.57143 14.605 8.75204 14.9265 9.07353C15.248 9.39502 15.4286 9.83106 15.4286 10.2857V13.7143C15.4286 14.1689 15.248 14.605 14.9265 14.9265C14.605 15.248 14.1689 15.4286 13.7143 15.4286H10.2857C9.83106 15.4286 9.39502 15.248 9.07353 14.9265C8.75204 14.605 8.57143 14.1689 8.57143 13.7143V10.2857ZM17.1429 10.2857C17.1429 9.83106 17.3235 9.39502 17.645 9.07353C17.9665 8.75204 18.4025 8.57143 18.8571 8.57143H22.2857C22.7404 8.57143 23.1764 8.75204 23.4979 9.07353C23.8194 9.39502 24 9.83106 24 10.2857V13.7143C24 14.1689 23.8194 14.605 23.4979 14.9265C23.1764 15.248 22.7404 15.4286 22.2857 15.4286H18.8571C18.4025 15.4286 17.9665 15.248 17.645 14.9265C17.3235 14.605 17.1429 14.1689 17.1429 13.7143V10.2857ZM0 18.8571C0 18.4025 0.180612 17.9665 0.502103 17.645C0.823593 17.3235 1.25963 17.1429 1.71429 17.1429H5.14286C5.59751 17.1429 6.03355 17.3235 6.35504 17.645C6.67653 17.9665 6.85714 18.4025 6.85714 18.8571V22.2857C6.85714 22.7404 6.67653 23.1764 6.35504 23.4979C6.03355 23.8194 5.59751 24 5.14286 24H1.71429C1.25963 24 0.823593 23.8194 0.502103 23.4979C0.180612 23.1764 0 22.7404 0 22.2857V18.8571ZM8.57143 18.8571C8.57143 18.4025 8.75204 17.9665 9.07353 17.645C9.39502 17.3235 9.83106 17.1429 10.2857 17.1429H13.7143C14.1689 17.1429 14.605 17.3235 14.9265 17.645C15.248 17.9665 15.4286 18.4025 15.4286 18.8571V22.2857C15.4286 22.7404 15.248 23.1764 14.9265 23.4979C14.605 23.8194 14.1689 24 13.7143 24H10.2857C9.83106 24 9.39502 23.8194 9.07353 23.4979C8.75204 23.1764 8.57143 22.7404 8.57143 22.2857V18.8571ZM17.1429 18.8571C17.1429 18.4025 17.3235 17.9665 17.645 17.645C17.9665 17.3235 18.4025 17.1429 18.8571 17.1429H22.2857C22.7404 17.1429 23.1764 17.3235 23.4979 17.645C23.8194 17.9665 24 18.4025 24 18.8571V22.2857C24 22.7404 23.8194 23.1764 23.4979 23.4979C23.1764 23.8194 22.7404 24 22.2857 24H18.8571C18.4025 24 17.9665 23.8194 17.645 23.4979C17.3235 23.1764 17.1429 22.7404 17.1429 22.2857V18.8571Z"
                              fill="#9D9D9D"
                            />
                          </svg>
                        </Link>
                      </li>
                    </ul>
                  </div>
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
                              <ImageWithSkeleton imgSrc={editIconTbHeader} imgAlt={editIconTbHeader} isListIcon={true} />
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
                              <ImageWithSkeleton imgSrc={filterIconTb} imgAlt={filterIconTb} isListIcon={true} />
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
