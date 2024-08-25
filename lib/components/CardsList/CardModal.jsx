import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFeatures } from '../../hooks/useFeatures';
import ConfirmationPopup from '../ConfirmationPopup';
import { useAxiosFunction } from '../../hooks/useAxios';
import { getRemoveAllUrl } from '../../services/getUrl';
import { useHold } from '../../hooks/useHold';
import { DeleteIcon, EditIcon, ViewIcon } from '../ui/actions/Actions';

const Card = ({
  feature,
  subFeature,
  record,
  isViewable = true,
  isEditable = true,
  isDeletable = true,
  title,
  subTitles,
  keyIdentifier = 'id',
  initView,
  setTitle,
  setMessage,
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
  onViewLine,
  onEditLine,
  onDeleteLine,
  customIcons,
}) => {
  const navigate = useNavigate();
  const { api } = useAxiosFunction();
  const { t } = useTranslation();
  const { canEdit, canView, canDelete, getFeaturePath } = useFeatures(feature, subFeature);

  const [showDelete, setShowDelete] = useState(false);

  const onTouchStart = canDelete ? () => mouseDownHandler(record) : null;
  const onTouchEnd = canDelete ? () => mouseUpHandler(record) : null;

  const alertHandler = (type, message) => {
    window.scrollTo(0, 0);
    initView(true);
    setMessage(message);

    if (type === 'Success') {
      setTitle('Success');
    } else {
      setTitle('Error');
    }
  };

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
        setActionInProgress(false);

        if (!res.data || !res.data.hasOwnProperty('status') || res.data.status !== 0) {
          if (res.data?.data?.title === 'Reference error') {
            return alertHandler('Error', t('LBL_REFERENCE_ERROR'));
          }

          return alertHandler('Error', t('SOME_THING_WENT_WORNG'));
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
      setChecked([...checked, { id: record[keyIdentifier], version: record.version, name: record?.name }]);
    }
  };

  const { mouseDownHandler, mouseUpHandler } = useHold(handleHold);

  return (
    <>
      <div
        className="col-md-6"
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
                    <span>{label1.isTranslated ? label1.value : t(label1.value)}</span>
                  </div>
                )}
                {label2 && label2?.value?.length > 0 && (
                  <div className="badge-table company-badge-Company">
                    <span>{label2.isTranslated ? label2.value : t(label2.value)}</span>
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
                if (subTitle.label && subTitle.label.length > 0 && record[subTitle.key] && record[subTitle.key].toString().length > 0)
                  return (
                    <p key={subTitle.key}>
                      <span style={{ fontWeight: 'bold' }}>{t(subTitle.label) + ': '}</span>
                      {record[subTitle.key]}
                    </p>
                  );
                return null;
              })}
          </div>
          {((canView && isViewable) || (canEdit && isEditable) || (canDelete && isDeletable)) && (
            <div className="action-company-card">
              <ul style={{ cursor: 'pointer' }}>
                {canDelete && isDeletable && (
                  <li title={t('LBL_DELETE')}>
                    <a onClick={() => onDeleteLine(record, record[keyIdentifier])} title={t('LBL_DELETE')}>
                      <DeleteIcon />
                    </a>
                  </li>
                )}
                {canEdit && isEditable && (
                  <li title={t('LBL_EDIT')}>
                    <a onClick={() => onEditLine(record, record[keyIdentifier])} title={t('LBL_EDIT')}>
                      <EditIcon />
                    </a>
                  </li>
                )}
                {canView && isViewable && (
                  <li title={t('LBL_VIEW')}>
                    <a onClick={() => onViewLine(record, record[keyIdentifier])} title={t('LBL_VIEW')}>
                      <ViewIcon />
                    </a>
                  </li>
                )}
                {customIcons?.length > 0 &&
                  customIcons.map(icon => {
                    if (!icon.Component) return null;
                    return (
                      <li title={t('LBL_VIEW')}>
                        <a onClick={icon.onAction ? () => icon.onAction(record) : () => {}} title={icon.title ? t(icon.title) : ''}>
                          <icon.Component line={record} />
                        </a>
                      </li>
                    );
                  })}
              </ul>
            </div>
          )}
        </div>
      </div>
      {showDelete && isDeletable && (
        <ConfirmationPopup
          item={record.name ? record.name : ''}
          onClickHandler={() => {
            setActionInProgress(true);

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
