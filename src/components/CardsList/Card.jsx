import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import ConfirmationPopup from '../ConfirmationPopup';

import { useFeatures } from '../../hooks/useFeatures';
import { useAxiosFunction } from '../../hooks/useAxios';
import { getRemoveAllUrl } from '../../services/getUrl';
import { useHold } from '../../hooks/useHold';
import { alertsActions } from '../../store/alerts';
import { formatFloatNumber } from '../../utils/helpers';
import { useModelActionsServices } from '../../services/apis/useModelActionsServices';
import { AttendanceIcon, CopyIcon, DeleteIcon, EditIcon, StudentGroupIcon, ViewIcon, ViewPDFIcon } from '../ui/actions/Actions';
import { useLongPress } from 'use-long-press';

const getNestedValue = (object, accessor) => {
  const properties = accessor.split('.');
  let value = object;

  for (const property of properties) {
    value = value[property];

    if (value === undefined) {
      return null; // or handle the case when the nested property doesn't exist
    }
  }

  return value;
};

const Card = ({
  feature,
  subFeature,
  record,
  isViewable = true,
  isEditable = true,
  isDeletable = true,
  isPrintable = false,
  title,
  subTitles,
  keyIdentifier = 'id',
  deleteModel,
  refreshData,
  setActionInProgress,
  checked = [],
  setChecked = () => {},
  navigateToEditState,
  navigationParams = { id: record[keyIdentifier] },
  deleteHandler,
  label1,
  label2,
  viewPDFHandler,
  modelsEnumKey = null,
  setIsOpen,
  viewAttendace,
  viewStudentList,
}) => {
  const navigate = useNavigate();
  const { api } = useAxiosFunction();
  const { t } = useTranslation();
  const { canAdd, canEdit, canView, canDelete, getFeaturePath } = useFeatures(feature, subFeature);
  const dispatch = useDispatch();
  const bind = useLongPress(() => {
    setIsOpen(true);
  });
  const { copyHandler } = useModelActionsServices({
    feature,
    subFeature,
    modelsEnumKey,
    id: record[keyIdentifier],
    setIsLoading: setActionInProgress,
  });

  const [showDelete, setShowDelete] = useState(false);

  const onTouchStart = canDelete ? () => mouseDownHandler(record) : null;
  const onTouchEnd = canDelete ? () => mouseUpHandler(record) : null;

  const alertHandler = (title, message) => dispatch(alertsActions.initiateAlert({ title, message }));

  const removeAllHandler = () => {
    api(
      'POST',
      getRemoveAllUrl(deleteModel),
      {
        records: [
          {
            id: record[keyIdentifier],
            version: record.version,
          },
        ],
      },
      res => {
        setActionInProgress && setActionInProgress(false);

        if (!res.data || !res.data.hasOwnProperty('status') || res.data.status !== 0) {
          if (res.data?.data?.title === 'Reference error') {
            return alertHandler('Error', t('LBL_REFERENCE_ERROR'));
          }

          return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
        }

        refreshData();
        alertHandler('Success', t('DELETED_SUCCESSFULLY'));
      }
    );
  };

  const handleHold = () => {
    let index = checked.findIndex(x => x.id === record[keyIdentifier]);
    let currentChecked = [...checked];

    if (index !== -1) {
      currentChecked.splice(index, 1);
      setChecked([...currentChecked]);
    } else {
      setChecked([...checked, { id: record[keyIdentifier], version: record.version, name: record?.name || record?.busOperator?.username }]);
    }
  };

  const { mouseDownHandler, mouseUpHandler } = useHold(handleHold);

  const navigateToEdit = () => {
    navigate(getFeaturePath(subFeature, 'edit', navigationParams), navigateToEditState);
  };

  const navigateToView = () => {
    navigate(getFeaturePath(subFeature, 'view', navigationParams));
  };

  const navigateToStudentsList = () => {
    navigate(getFeaturePath(subFeature, 'LIST', navigationParams));
  };

  const navigateToStdAttendance = () => {
    navigate(getFeaturePath('CLASSES', 'ATTENDANCE', navigationParams));
  };

  return (
    <>
      <div
        className="col-md-6 margin-bottom-30"
        key={record[keyIdentifier]}
        onDoubleClick={() => {
          if (canView) {
            navigate(getFeaturePath(subFeature, 'view', navigationParams));
          }
        }}
      >
        <div
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onMouseDown={onTouchStart}
          onMouseUp={onTouchEnd}
          className={
            checked.findIndex(x => x.id === record[keyIdentifier]) !== -1 ? 'card-selected card-data-company' : 'card-data-company'
          }
        >
          {((label1 && label1?.value) || (label2 && label2?.value)) && (
            <>
              <div className="card-table-badge-row">
                {label1 && label1?.value?.length > 0 && (
                  <div className="badge-table company-badge-individule">
                    {label1?.type === 'number' ? (
                      <span>{formatFloatNumber(label1.value)}</span>
                    ) : (
                      <span>{label1.isTranslated ? label1.value : t(label1.value)}</span>
                    )}
                  </div>
                )}
                {label2 && label2?.value?.length > 0 && (
                  <div className="badge-table company-badge-Company">
                    {label2?.type === 'number' ? (
                      <span>{formatFloatNumber(label2.value)}</span>
                    ) : (
                      <span>{label2.isTranslated ? label2.value : t(label2.value)}</span>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
          <div className="title-company">
            <a
              style={{
                pointerEvents: 'none',
                textDecoration: 'none',
              }}
            >
              <h4>{record[title]}</h4>
            </a>
            {subTitles &&
              subTitles.map(subTitle => {
                if (!subTitle) return null;

                if (
                  (subTitle.label && subTitle.label.length > 0 && record[subTitle.key] && record[subTitle.key].toString().length > 0) ||
                  subTitle.key
                ) {
                  const value = getNestedValue(record, subTitle.key);
                  return (
                    <p key={subTitle.key}>
                      <span style={{ fontWeight: 'bold' }}>{t(subTitle.label) + ': '}</span>
                      {subTitle.type === 'number' ? formatFloatNumber(value) : subTitle.translate ? t(value) : value}
                    </p>
                  );
                }

                return null;
              })}
          </div>
          {((canView && isViewable) ||
            (canEdit && isEditable) ||
            (canDelete && isDeletable) ||
            (canAdd && modelsEnumKey) ||
            viewStudentList ||
            viewAttendace) && (
            <>
              <div className="action-company-card">
                <ul style={{ cursor: 'pointer' }}>
                  {viewAttendace && (
                    <li title={t('LBL_VEIW_ATTENDANCE')}>
                      <a onClick={navigateToStdAttendance}>
                        <AttendanceIcon />
                      </a>
                    </li>
                  )}
                  {viewStudentList && (
                    <li title={t('LBL_VEIW_STUDENTS')}>
                      <a onClick={navigateToStudentsList}>
                        <StudentGroupIcon />
                      </a>
                    </li>
                  )}
                  {canAdd && modelsEnumKey && (
                    <li title={t('LBL_DUPLICATE')}>
                      <a onClick={copyHandler}>
                        <CopyIcon />
                      </a>
                    </li>
                  )}
                  {canDelete && isDeletable && (
                    <li title={t('LBL_DELETE')}>
                      <a
                        onClick={() => {
                          setShowDelete(true);
                        }}
                      >
                        <DeleteIcon />
                      </a>
                    </li>
                  )}
                  {canEdit && isEditable && (
                    <li title={t('LBL_EDIT')}>
                      <a onClick={navigateToEdit}>
                        <EditIcon />
                      </a>
                    </li>
                  )}
                  {canView && isViewable && (
                    <li title={t('LBL_VIEW')}>
                      <a onClick={navigateToView}>
                        <ViewIcon />
                      </a>
                    </li>
                  )}
                  {viewPDFHandler && isPrintable && (
                    <li title={t('LBL_PRINT')}>
                      <a
                        onClick={() => {
                          viewPDFHandler(record);
                          setIsOpen(false);
                        }}
                        data-tooltip-id="my-tooltip"
                        onMouseEnter={() => setIsOpen(true)}
                        {...bind}
                      >
                        <ViewPDFIcon />
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
      {showDelete && isDeletable && (
        <ConfirmationPopup
          item={record.name || record?.busOperator?.username}
          onClickHandler={() => {
            setActionInProgress && setActionInProgress(true);

            if (typeof deleteHandler !== 'function') {
              removeAllHandler();
            } else {
              deleteHandler(record[keyIdentifier]);
            }

            setShowDelete(false);
          }}
          setConfirmationPopup={setShowDelete}
        />
      )}
    </>
  );
};

export default Card;
