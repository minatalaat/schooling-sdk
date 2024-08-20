// import { useMemo, useState } from 'react';
// import { useTranslation } from 'react-i18next';
// import { useNavigate } from 'react-router-dom';
// import { useDispatch } from 'react-redux';
// import ConfirmationPopup from './../ConfirmationPopup';
// import PrimaryButton from '../ui/buttons/PrimaryButton';
// import { useAxiosFunction } from './../../hooks/useAxios';
// import { getRemoveAllUrl } from './../../services/getUrl';
// import { useFeatures } from './../../hooks/useFeatures';
// import { alertsActions } from '../../store/alerts';
// import { formatFloatNumber } from '../../utils/helpers';
// import { useModelActionsServices } from '../../services/apis/useModelActionsServices';
// import { AttendanceIcon, CopyIcon, DeleteIcon, EditIcon, StudentGroupIcon, ViewIcon, ViewPDFIcon } from '../ui/actions/Actions';

// const getNestedValue = (object, accessor) => {
//   const properties = accessor.split('.');
//   let value = object;

//   for (const property of properties) {
//     value = value[property];

//     if (value === undefined) {
//       return null; // or handle the case when the nested property doesn't exist
//     }
//   }

//   return value;
// };

// const TableRow = ({
//   record,
//   fields,
//   isViewable = true,
//   isEditable = true,
//   isDeletable = true,
//   viewStudentList = false,
//   viewAttendace = false,
//   isPrintable = false,
//   hasBulkActions = true,
//   deleteModel,
//   refreshData,
//   checked = [],
//   setChecked = () => {},
//   setActionInProgress,
//   feature,
//   subFeature,
//   keyIdentifier = 'id',
//   infoColors,
//   deleteHandler,
//   viewPDFHandler,
//   navigateToEditState,
//   navigationParams = { id: record[keyIdentifier] },
//   modelsEnumKey = null,
//   setIsOpen,
// }) => {
//   const [showDelete, setShowDelete] = useState(false);

//   const navigate = useNavigate();
//   const { t } = useTranslation();
//   const { api } = useAxiosFunction();
//   const { canAdd, canEdit, canDelete, canView, getFeaturePath } = useFeatures(feature, subFeature);
//   const dispatch = useDispatch();
//   const { copyHandler } = useModelActionsServices({
//     feature,
//     subFeature,
//     modelsEnumKey,
//     id: record[keyIdentifier],
//     setIsLoading: setActionInProgress,
//   });

//   const alertHandler = (title, message) => dispatch(alertsActions.initiateAlert({ title, message }));

//   const fetchRowClass = useMemo(() => {
//     if (checked && checked.findIndex(x => x.id === record[keyIdentifier]) !== -1) return 'primary-color';

//     if (!infoColors || !infoColors.data || infoColors.data.length === 0 || !infoColors.field) return '';

//     const index = infoColors.data.findIndex(color => record[infoColors.field] === color.label);
//     if (index !== -1) return `table-color-${infoColors.data[index].colorId}`;

//     return '';
//   }, [checked, record]);

//   const removeAllHandler = () => {
//     api(
//       'POST',
//       getRemoveAllUrl(deleteModel),
//       {
//         records: [{ id: record[keyIdentifier], version: record.version }],
//       },
//       res => {
//         setActionInProgress && setActionInProgress(false);

//         if (!res.data || !res.data.hasOwnProperty('status') || res.data.status !== 0) {
//           if (res.data?.data?.title === 'Reference error') {
//             return alertHandler('Error', t('LBL_REFERENCE_ERROR'));
//           }

//           return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
//         }

//         refreshData();
//         alertHandler('Success', t('DELETED_SUCCESSFULLY'));
//       }
//     );
//   };

//   const navigateToEdit = () => {
//     navigate(getFeaturePath(subFeature, 'edit', navigationParams), navigateToEditState);
//   };

//   const navigateToView = () => {
//     navigate(getFeaturePath(subFeature, 'view', navigationParams));
//   };

//   const navigateToStudentsList = () => {
//     navigate(getFeaturePath(subFeature, 'LIST', navigationParams));
//   };

//   const navigateToStdAttendance = () => {
//     navigate(getFeaturePath('CLASSES', 'ATTENDANCE', navigationParams));
//   };

//   let checkedNames = checked.map(item => item?.name)?.join(',');
//   return (
//     <>
//       <tr
//         className={fetchRowClass}
//         onDoubleClick={isViewable ? navigateToView : () => {}}
//         style={{ cursor: 'pointer' }}
//         key={record[keyIdentifier]}
//       >
//         {hasBulkActions && (
//           <td>
//             <input
//               className="form-check-input"
//               type="checkbox"
//               name="checked"
//               value=""
//               id="defaultCheck1"
//               checked={checked.findIndex(x => x.id === record[keyIdentifier]) !== -1}
//               onChange={() => {
//                 let index = checked.findIndex(x => x.id === record[keyIdentifier]);
//                 let currentChecked = [...checked];

//                 if (index !== -1) {
//                   currentChecked.splice(index, 1);
//                   setChecked([...currentChecked]);
//                 } else {
//                   setChecked([
//                     ...checked,
//                     { id: record[keyIdentifier], version: record.version, name: record?.name || record?.busOperator?.username },
//                   ]);
//                 }
//               }}
//             />
//           </td>
//         )}
//         {fields.map(field => {
//           if (!field) return null;
//           if (field.isHidden) return null;

//           if (field.type === 'checkbox') {
//             return (
//               <td key={field.accessor}>
//                 <input
//                   className="form-check-input"
//                   type="checkbox"
//                   name="chkOrgRow"
//                   value={record[field.accessor]}
//                   checked={record[field.accessor]}
//                   onChange={() => {}}
//                   id="defaultCheck1"
//                 />
//               </td>
//             );
//           }

//           if (field.type === 'number') {
//             return <td key={field.accessor}>{formatFloatNumber(record[field.accessor])}</td>;
//           }

//           // return <td key={field.accessor}>{field.translate ? t(record[field.accessor]) : record[field.accessor]}</td>;
//           const value = getNestedValue(record, field.accessor);
//           return <td key={field.accessor}>{field.translate ? t(value) : value}</td>;
//         })}
//         {((canView && isViewable) || (canEdit && isEditable) || (canDelete && isDeletable) || viewStudentList || viewAttendace) && (
//           <td>
//             <div className="table-action-button float-end">
//               {viewAttendace && (
//                 <PrimaryButton theme="clickableIcon" onClick={navigateToStdAttendance} title={t('LBL_VEIW_ATTENDANCE')}>
//                   <AttendanceIcon />
//                 </PrimaryButton>
//               )}
//               {viewStudentList && (
//                 <PrimaryButton theme="clickableIcon" onClick={navigateToStudentsList} title={t('LBL_VEIW_STUDENTS')}>
//                   <StudentGroupIcon />
//                 </PrimaryButton>
//               )}
//               {canView && isViewable && (
//                 <PrimaryButton theme="clickableIcon" onClick={navigateToView} title={t('LBL_VIEW')}>
//                   <ViewIcon />
//                 </PrimaryButton>
//               )}
//               {canEdit && isEditable && (
//                 <PrimaryButton theme="clickableIcon" onClick={navigateToEdit} title={t('LBL_EDIT')}>
//                   <EditIcon />
//                 </PrimaryButton>
//               )}
//               {canDelete && isDeletable && (
//                 <PrimaryButton theme="clickableIcon" onClick={() => setShowDelete(true)} title={t('LBL_DELETE')}>
//                   <DeleteIcon />
//                 </PrimaryButton>
//               )}
//               {viewPDFHandler && isPrintable && (
//                 <PrimaryButton
//                   theme="clickableIcon"
//                   setIsOpen={setIsOpen}
//                   onClick={() => {
//                     setIsOpen(false);
//                     viewPDFHandler(record);
//                   }}
//                   title={t('LBL_PRINT')}
//                 >
//                   <div data-tooltip-id="my-tooltip">
//                     <ViewPDFIcon />
//                   </div>
//                 </PrimaryButton>
//               )}
//               {canAdd && modelsEnumKey && (
//                 <PrimaryButton theme="clickableIcon" onClick={() => copyHandler()} title={t('LBL_DUPLICATE')}>
//                   <CopyIcon />
//                 </PrimaryButton>
//               )}
//             </div>
//           </td>
//         )}
//       </tr>
//       {showDelete && (
//         <ConfirmationPopup
//           item={checkedNames || record.name || record?.busOperator?.username}
//           onClickHandler={() => {
//             setActionInProgress && setActionInProgress(true);

//             if (typeof deleteHandler !== 'function') {
//               removeAllHandler();
//             } else {
//               deleteHandler(record[keyIdentifier]);
//             }

//             setShowDelete(false);
//           }}
//           setConfirmationPopup={setShowDelete}
//         />
//       )}
//     </>
//   );
// };

// export default TableRow;
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import PrimaryButton from '../ui/buttons/PrimaryButton';

import { useAxiosFunction } from './../../hooks/useAxios';
import { getRemoveAllUrl } from './../../services/getUrl';
import { useFeatures } from './../../hooks/useFeatures';
import { alertsActions } from '../../store/alerts';
import { formatFloatNumber } from '../../utils/helpers';
import { useModelActionsServices } from '../../services/apis/useModelActionsServices';
import { CopyIcon, DeleteIcon, EditIcon, ViewIcon, ViewPDFIcon } from '../ui/actions/Actions';
import check from '../../assets/images/check.png';
// import notChecked from '../../assets/images/x.svg';
import { confirmationPopupActions } from '../../store/confirmationPopup';

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

const TableRow = ({
  record,
  fields,
  isViewable = true,
  isEditable = true,
  isDeletable = true,
  isPrintable = false,
  hasBulkActions = true,
  deleteModel,
  refreshData,
  checked = [],
  setChecked = () => {},
  setActionInProgress,
  feature,
  subFeature,
  keyIdentifier = 'id',
  infoColors,
  deleteHandler,
  viewPDFHandler,
  navigateToEditState,
  navigationParams = { id: record[keyIdentifier] },
  modelsEnumKey = null,
  setIsOpen = () => {},
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  const { canAdd, canEdit, canDelete, canView, getFeaturePath } = useFeatures(feature, subFeature);
  const dispatch = useDispatch();
  const { copyHandler } = useModelActionsServices({
    feature,
    subFeature,
    modelsEnumKey,
    id: record[keyIdentifier],
    setIsLoading: setActionInProgress,
  });

  const alertHandler = (title, message) => dispatch(alertsActions.initiateAlert({ title, message }));

  const fetchRowClass = useMemo(() => {
    if (checked && checked.findIndex(x => x.id === record[keyIdentifier]) !== -1) return 'primary-color';

    if (!infoColors || !infoColors.data || infoColors.data.length === 0 || !infoColors.field) return '';

    const index = infoColors.data.findIndex(color => record[infoColors.field] === color.label);
    if (index !== -1) return `table-${infoColors.data[index].colorId}`;

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

        if (!res.data || !Object.prototype.hasOwnProperty.call(res?.data ?? {}, 'status') || res.data.status !== 0) {
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

  const defaultDeleteHandler = () => {
    setActionInProgress(true);

    if (typeof deleteHandler !== 'function') {
      removeAllHandler();
    } else {
      deleteHandler(record[keyIdentifier]);
    }
  };

  return (
    <>
      <tr
        className={fetchRowClass}
        onDoubleClick={isViewable ? navigateToView : () => {}}
        style={{ cursor: 'pointer' }}
        key={record[keyIdentifier]}
      >
        {hasBulkActions && (
          <td>
            <input
              className="checkbox-input"
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
                  setChecked([...checked, { id: record[keyIdentifier], version: record.version }]);
                }
              }}
            />
          </td>
        )}
        {fields.map(field => {
          if (!field) return null;
          if (field.isHidden) return null;

          if (field.type === 'checkbox') {
            return (
              <>
                <td>
                  <img src={record[field.accessor] ? check : check} />
                </td>
              </>
            );
          }

          if (field.type === 'number') {
            return <td key={field.accessor}>{formatFloatNumber(record[field.accessor])}</td>
          }
          
          const value = getNestedValue(record, field.accessor);
                    return <td key={field.accessor}>{field.translate ? t(value) : value}</td>;
          // return <td key={field.accessor}>{field.translate ? t(record[field.accessor]) : record[field.accessor]}</td>;
        })}
        {((canView && isViewable) || (canEdit && isEditable) || (canDelete && isDeletable)) && (
          <td>
            <div className="table-action d-flex justify-content-end gap-3">
              {canView && isViewable && (
                <PrimaryButton theme="clickableIcon" onClick={navigateToView} btnOptions={{ title: t('LBL_VIEW') }}>
                  <ViewIcon />
                </PrimaryButton>
              )}
              {canEdit && isEditable && (
                <PrimaryButton theme="clickableIcon" onClick={navigateToEdit} btnOptions={{ title: t('LBL_EDIT') }}>
                  <EditIcon />
                </PrimaryButton>
              )}
              {canDelete && isDeletable && (
                <PrimaryButton
                  theme="clickableIcon"
                  onClick={() => {
                    dispatch(
                      confirmationPopupActions.openPopup({
                        title: 'LBL_BEWARE_ABOUT_TO_DELETE',
                        message: record.name ? record.name : `#${record.id}`,
                        onConfirmHandler: defaultDeleteHandler,
                      })
                    );
                  }}
                  btnOptions={{ title: t('LBL_DELETE') }}
                >
                  <DeleteIcon />
                </PrimaryButton>
              )}
              {viewPDFHandler && isPrintable && (
                <PrimaryButton
                  theme="clickableIcon"
                  setIsOpen={setIsOpen}
                  onClick={() => {
                    setIsOpen(false);
                    viewPDFHandler(record);
                  }}
                  title={t('LBL_PRINT')}
                >
                  <ViewPDFIcon />
                </PrimaryButton>
              )}
              {canAdd && modelsEnumKey && (
                <PrimaryButton theme="clickableIcon" onClick={() => copyHandler()} title={t('LBL_DUPLICATE')}>
                  <CopyIcon />
                </PrimaryButton>
              )}
            </div>
          </td>
        )}
      </tr>
    </>
  );
};

export default TableRow;
