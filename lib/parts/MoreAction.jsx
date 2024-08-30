import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';

import ConfirmationPopup from '../components/ConfirmationPopup';
import { useAxiosFunction } from '../hooks/useAxios';
import { useGetUrl } from '../services/useGetUrl';
import { modelsEnum } from '../constants/modelsEnum/modelsEnum';
import { useModelActionsServices } from '../services/apis/useModelActionsServices';
import { useFeatures } from '../hooks/useFeatures';

import { RiCheckboxMultipleFill } from 'react-icons/ri';
import { CopyIcon, EditIcon, ViewIcon, ViewPDFIcon } from '../components/ui/actions/Actions';
import { FaCamera } from 'react-icons/fa';

function MoreAction({
  showMoreAction,
  setShowMoreAction,
  refreshData,
  deleteHandler,
  editHandler,
  viewHandler,
  viewPDFHandler,
  printSnapShotHandler,
  selectAllHandler = '',
  bulkActionConfig,
  setActionInProgress,
  checked = [],
  setChecked = () => {},
  alertHandler,
  data,
  canSelectAll = true,
  feature,
  subFeature,
  modelsEnumKey,
  id,
}) {
  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  const { getRemoveAllUrl } = useGetUrl();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showBulkDeletePopup, setShowBulkDeletePopup] = useState(false);
  const { canAdd } = useFeatures(feature, subFeature);
  const { copyHandler } = useModelActionsServices({ feature, subFeature, modelsEnumKey, id });

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

  const removeAllHandler = async () => {
    const removeResponse = await api('POST', getRemoveAllUrl(modelsEnum[bulkActionConfig.modelsEnumKey].name), {
      records: checked,
    });
    setActionInProgress(false);
    setChecked([]);

    if (!removeResponse || removeResponse.data.status !== 0) {
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
                          <EditIcon />
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
                          <ViewIcon />
                        </Link>
                      </li>
                    )}
                    {canAdd && modelsEnumKey && id && (
                      <li onClick={() => copyHandler()}>
                        <Link href="/">
                          <CopyIcon />
                        </Link>
                      </li>
                    )}
                    {viewPDFHandler && (
                      <li
                        onClick={() => {
                          viewPDFHandler(data);
                          setShowMoreAction(false);
                        }}
                      >
                        <Link href="/">
                          <ViewPDFIcon />
                        </Link>
                      </li>
                    )}
                    {printSnapShotHandler && (
                      <li
                        onClick={() => {
                          setShowMoreAction(false);
                          printSnapShotHandler(data);
                        }}
                      >
                        <Link href="/">
                          <FaCamera size={24} />
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
                    {pageSizeOptions.map(option => {
                      return (
                        <option key={option.value} value={option.value}>
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
