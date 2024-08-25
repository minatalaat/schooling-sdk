import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';

import ConfirmationPopup from '../../modals/ConfirmationPopup';
import ImageWithSkeleton from '../skeletons/ImageWithSkeleton';

import { RiCheckboxMultipleFill } from 'react-icons/ri';
import EditIconBtnHeader from '../../../assets/icons/edit-icon.svg';
import viewIcon from '../../../assets/icons/view-icon.svg';
import viewPDFIcon from '../../../assets/icons/h-4.svg';

function MoreAction({
  showMoreAction,
  setShowMoreAction,
  refreshData,
  deleteHandler,
  editHandler,
  viewHandler,
  viewPDFHandler,
  selectAllHandler = '',
  bulkActionConfig,
  setActionInProgress,
  checked = [],
  setChecked = () => {},
  alertHandler,
  data,
  canSelectAll = true,
}) {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showBulkDeletePopup, setShowBulkDeletePopup] = useState(false);

  let pageSizeOptions = [
    { name: 10, value: 10 },
    { name: 25, value: 25 },
    { name: 50, value: 50 },
    { name: 100, value: 100 },
  ];

  let itemTitle = '';

  const checkClose = target => {
    if (target.className === 'b-action is-visible') {
      setShowMoreAction(false);
    }
  };

  const checkIfSelectedOnDelete = () => {
    if (checked && checked.length > 0) {
      onDeleteClick();
    } else {
      alertHandler('Error', t('LBL_ERROR_YOU_SHOULD_SELECT_ITEMS'));
    }
  };

  const removeAllHandler = async () => {};

  const onDeleteClick = () => {
    setActionInProgress(true);

    if (typeof deleteHandler !== 'function') {
      removeAllHandler();
    } else {
      deleteHandler();
    }
  };

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

  const onPageSizeChange = val => {
    setSearchParams(params => {
      params.set('currentPage', 1);
      params.set('pageSize', val);
      return params;
    });
  };

  return (
    <>
      {showBulkDeletePopup && checked.length > 0 && (
        <ConfirmationPopup onClickHandler={onDeleteClick} setConfirmationPopup={setShowBulkDeletePopup} item={itemTitle} />
      )}
      <div className="more-action-mobile" role="alert" onClick={e => checkClose(e.target)}>
        <div className={showMoreAction ? 'b-action is-visible' : 'b-action'} onClick={e => checkClose(e.target)}>
          <div className="b-action-container">
            <div className="border-top"></div>

            <div className="float-start">
              <div className="dataTables_length" id="example_length"></div>
            </div>
            <div className="float-end mb-3">
              <div className="action-right ">
                <div className="right-filter-tb">
                  <ul className="nav nav-pills" id="pills-tab" role="tablist">
                    {editHandler && (
                      <li
                        onClick={() => {
                          editHandler();
                          setShowMoreAction(false);
                        }}
                      >
                        <Link href="/">
                          <ImageWithSkeleton imgSrc={EditIconBtnHeader} imgAlt={EditIconBtnHeader} isListIcon={true} />
                        </Link>
                      </li>
                    )}
                    {viewHandler && (
                      <li
                        onClick={() => {
                          viewHandler();
                          setShowMoreAction(false);
                        }}
                      >
                        <Link href="/">
                          <ImageWithSkeleton imgSrc={viewIcon} imgAlt={viewIcon} isListIcon={true} />
                        </Link>
                      </li>
                    )}
                    {viewPDFHandler && (
                      <li
                        onClick={() => {
                          viewPDFHandler();
                          setShowMoreAction(false);
                        }}
                      >
                        <Link href="/">
                          <ImageWithSkeleton imgSrc={viewPDFIcon} imgAlt={viewPDFIcon} isListIcon={true} />
                        </Link>
                      </li>
                    )}
                    {canSelectAll && (
                      <li
                        onClick={() => {
                          if (typeof selectAllHandler !== 'function' && data) selectAllDataHandler();
                          else selectAllHandler();
                          setShowMoreAction(false);
                        }}
                      >
                        <Link href="/">
                          <RiCheckboxMultipleFill
                            isIcon={true}
                            color={data?.length !== 0 && checked?.length === data?.length ? '#1f4fde' : '#9D9D9D'}
                            size={23}
                          />
                        </Link>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
            <div className="buttons-actions">
              {searchParams.get('pageSize') && (
                <>
                  <div className="float-start">
                    <label>{t('LBL_PER_PAGE')}</label>
                  </div>
                  <select
                    className="form-select mb-2"
                    value={searchParams.get('pageSize') || 10}
                    onChange={event => {
                      onPageSizeChange(parseInt(event.target.value));
                      setShowMoreAction(false);
                    }}
                  >
                    <option value="" hidden>
                      {t('LBL_PLEASE_SELECT')}
                    </option>
                    {pageSizeOptions.map((option, i) => {
                      return (
                        <option key={i} value={option.value}>
                          {option.name}
                        </option>
                      );
                    })}
                  </select>
                </>
              )}
              {refreshData && (
                <button
                  className="btn btn-export"
                  onClick={() => {
                    refreshData();
                    setShowMoreAction(false);
                  }}
                >
                  {t('LBL_RELOAD')}
                </button>
              )}
              {bulkActionConfig?.canDelete && (
                <button
                  className="btn btn-delete"
                  onClick={() => {
                    checkIfSelectedOnDelete();
                    setShowMoreAction(false);
                  }}
                >
                  {t('LBL_DELETE')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MoreAction;
