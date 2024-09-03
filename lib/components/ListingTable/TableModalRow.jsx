import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

import ConfirmationPopup from './../ConfirmationPopup';

import { useAxiosFunction } from './../../hooks/useAxios';
import { useGetUrl } from './../../services/useGetUrl';
import { useFeatures } from './../../hooks/useFeatures';
import { formatFloatNumber } from '../../utils/helpers';
import { DeleteIcon, EditIcon, ViewIcon } from '../ui/actions/Actions';

moment.locale('en');

const TableModalRow = ({
  record,
  fields,
  isViewable = true,
  isEditable = true,
  isDeletable = true,
  hasBulkActions = true,
  deleteModel,
  initView,
  setMessage,
  setErrTitle,
  refreshData,
  checked = [],
  setChecked = () => {},
  setActionInProgress,
  feature,
  subFeature,
  keyIdentifier = 'id',
  infoColors,
  deleteHandler,
  onViewLine,
  onEditLine,
  onDeleteLine,
  customIcons,
}) => {
  const [showDelete, setShowDelete] = useState(false);

  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  const { canEdit, canDelete, canView } = useFeatures(feature, subFeature);
  const { getRemoveAllUrl } = useGetUrl();

  const alertHandler = (type, message) => {
    window.scrollTo(0, 0);
    initView(true);
    setMessage(message);

    if (type === 'Success') {
      setErrTitle('Success');
    } else {
      setErrTitle('Error');
    }
  };

  const fetchRowClass = useMemo(() => {
    if (checked && checked.findIndex(x => x.id === record[keyIdentifier]) !== -1) return 'primary-color';

    if (!infoColors || !infoColors.data || infoColors.data.length === 0 || !infoColors.field) return '';

    const index = infoColors.data.findIndex(color => {
      // POC for different types of conditions and different types of data
      if (infoColors.type === 'date') {
        if (color.label && color.criteria) {
          if (color.criteria.operator === '<=') return moment().diff(color.criteria.value) <= moment().diff(record[infoColors.field]);
        }
      }

      return record[infoColors.field] === color.label;
    });
    if (index !== -1) return `table-color-${infoColors.data[index].colorId}`;

    return '';
  }, [checked, record]);

  const removeAllHandler = () => {
    api(
      'POST',
      getRemoveAllUrl(deleteModel),
      {
        records: [{ id: record[keyIdentifier], version: record.version }],
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

  return (
    <>
      <tr
        className={fetchRowClass}
        onDoubleClick={isViewable ? () => onViewLine(record, record[keyIdentifier]) : () => {}}
        style={{ cursor: 'pointer' }}
      >
        {hasBulkActions && (
          <td>
            <input
              className="form-check-input"
              type="checkbox"
              name="checked"
              value=""
              id="defaultCheck1"
              checked={checked.findIndex(x => x.id === record[keyIdentifier]) !== -1}
              onChange={() => {
                let index = checked.findIndex(x => x.id === record[keyIdentifier]);
                let currentChecked = [...checked];

                if (index !== -1) {
                  currentChecked.splice(index, 1);
                  setChecked([...currentChecked]);
                } else {
                  setChecked([...checked, { id: record[keyIdentifier], version: record.version, name: record?.name }]);
                }
              }}
            />
          </td>
        )}

        {fields.map(field => {
          if (field.isHidden) return null;

          if (field.type === 'checkbox') {
            return (
              <td key={field.accessor}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="chkOrgRow"
                  value={record[field.accessor]}
                  checked={record[field.accessor]}
                  onChange={() => {}}
                  id="defaultCheck1"
                />
              </td>
            );
          }

          if (field.type === 'number') {
            return <td key={field.accessor}>{formatFloatNumber(record[field.accessor])}</td>;
          }

          return <td key={field.accessor}>{field.translate ? t(record[field.accessor]) : record[field.accessor]}</td>;
        })}
        {((canView && isViewable) || (canEdit && isEditable) || (canDelete && isDeletable)) && (
          <td>
            <div className="table-action-button float-end">
              {canView && isViewable && (
                <button
                  type="button"
                  className="clickable btn"
                  onClick={() => onViewLine(record, record[keyIdentifier])}
                  title={t('LBL_VIEW')}
                >
                  <ViewIcon />
                </button>
              )}
              {canEdit && isEditable && (
                <button
                  type="button"
                  className="clickable btn"
                  onClick={() => onEditLine(record, record[keyIdentifier])}
                  title={t('LBL_EDIT')}
                >
                  <EditIcon />
                </button>
              )}
              {canDelete && isDeletable && (
                <button
                  type="button"
                  className="clickable btn"
                  onClick={() => onDeleteLine(record, record[keyIdentifier])}
                  title={t('LBL_DELETE')}
                >
                  <DeleteIcon />
                </button>
              )}
              {customIcons?.length > 0 &&
                customIcons.map(icon => {
                  if (!icon.Component) return null;
                  return (
                    <button
                      type="button"
                      className="clickable btn"
                      onClick={icon.onAction ? () => icon.onAction(record) : () => {}}
                      title={icon.title ? t(icon.title) : ''}
                      key={`icon-${icon.title}`}
                    >
                      <icon.Component line={record} />
                    </button>
                  );
                })}
            </div>
          </td>
        )}
      </tr>
      {showDelete && (
        <ConfirmationPopup
          item={record.name}
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

export default TableModalRow;
