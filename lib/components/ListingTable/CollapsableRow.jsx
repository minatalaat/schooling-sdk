import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import ConfirmationPopup from './../ConfirmationPopup';

import { useAxiosFunction } from './../../hooks/useAxios';
import { useGetUrl } from './../../services/useGetUrl';
import { useFeatures } from './../../hooks/useFeatures';
import { alertsActions } from '../../store/alerts';
import { formatFloatNumber } from '../../utils/helpers';
import { DeleteIcon, EditIcon, ToggleIcon, ViewIcon, ViewPDFIcon } from '../ui/actions/Actions';

const CollapsableRow = ({
  record,
  fields,
  isViewable = true,
  isEditable = true,
  isDeletable = true,
  isPrintable = false,
  hasBulkActions = true,
  deleteModel,
  refreshData,
  checked,
  setChecked,
  setActionInProgress,
  feature,
  subFeature,
  keyIdentifier = 'id',
  infoColors,
  deleteHandler,
  navigateToEditState,
  navigationParams = { id: record[keyIdentifier] },
  collapsableFieldsOne,
  collapsableFieldsTwo,
  showRows,
  setShowRows,
  viewPDFHandler,
  setIsOpen,
}) => {
  const [showDelete, setShowDelete] = useState(false);

  const navigate = useNavigate();
  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  const { canEdit, canDelete, canView, getFeaturePath } = useFeatures(feature, subFeature);
  const { getRemoveAllUrl } = useGetUrl();
  const dispatch = useDispatch();

  const alertHandler = (title, message) => dispatch(alertsActions.initiateAlert({ title, message }));

  const fetchRowClass = useMemo(() => {
    if (checked && checked.findIndex(x => x.id === record[keyIdentifier]) !== -1) return 'primary-color';

    if (!infoColors || !infoColors.data || infoColors.data.length === 0 || !infoColors.field) return '';

    const index = infoColors.data.findIndex(color => record[infoColors.field] === color.label);
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

          return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
        }

        refreshData();
        alertHandler('Success', t('DELETED_SUCCESSFULLY'));
      }
    );
  };

  const navigateToEdit = () => {
    navigate(getFeaturePath(subFeature, 'edit', navigationParams), navigateToEditState);
  };

  const navigateToView = () => {
    navigate(getFeaturePath(subFeature, 'view', navigationParams));
  };

  const toggleShowHiddenRow = id => {
    let tempRows = [...showRows];
    let index = tempRows.indexOf(id);

    if (index > -1) {
      tempRows.splice(index, 1);
    } else {
      tempRows.push(id);
    }

    setShowRows([...tempRows]);
  };

  return (
    <>
      <tr className={fetchRowClass} onDoubleClick={isViewable ? navigateToView : () => {}} style={{ cursor: 'pointer' }}>
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
        <td>
          <div className="table-action-button float-end">
            {canView && isViewable && (
              <button type="button" className="clickable btn" onClick={navigateToView} title={t('LBL_VIEW')}>
                <ViewIcon />
              </button>
            )}
            {canEdit && isEditable && (
              <button type="button" className="clickable btn" onClick={navigateToEdit} title={t('LBL_EDIT')}>
                <EditIcon />
              </button>
            )}
            {canDelete && isDeletable && (
              <button type="button" className="clickable btn" onClick={() => setShowDelete(true)} title={t('LBL_DELETE')}>
                <DeleteIcon />
              </button>
            )}
            {viewPDFHandler && isPrintable && (
              <button
                type="button"
                data-tooltip-id="my-tooltip"
                className="clickable btn"
                onMouseEnter={() => setIsOpen(true)}
                onClick={() => {
                  setIsOpen(false);
                  viewPDFHandler(record);
                }}
                title={t('LBL_PRINT')}
              >
                <ViewPDFIcon />
              </button>
            )}
            <button
              type="button"
              className="clickable btn"
              onClick={() => {
                toggleShowHiddenRow(parseInt(record.id));
              }}
            >
              <ToggleIcon />
            </button>
          </div>
        </td>
      </tr>
      <tr
        id="hidden_row1"
        className="hidden_row"
        style={showRows.indexOf(parseInt(record.id)) > -1 ? { display: 'table-row' } : { display: 'none' }}
      >
        <td colSpan="10" className="td-sub-view">
          <table className="subtable dataTable">
            <thead>
              <tr>
                {collapsableFieldsOne.map(field => {
                  if (!field.isHidden) return <th key={field.Header}>{field.Header}</th>;
                  return null;
                })}
              </tr>
            </thead>
            <tbody>
              <tr>
                {collapsableFieldsOne.map(field => {
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
              </tr>
            </tbody>
            <thead>
              <tr>
                {collapsableFieldsTwo.map(field => {
                  if (!field.isHidden) return <th key={field.Header}>{field.Header}</th>;
                  return null;
                })}
              </tr>
            </thead>
            <tbody>
              <tr>
                {collapsableFieldsTwo.map(field => {
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
              </tr>
            </tbody>
          </table>
        </td>
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

export default CollapsableRow;
