// import './formFooter.scss';
// import { useDispatch } from 'react-redux';
// import { useTranslation } from 'react-i18next';

// import PrimaryButton from '../ui/buttons/PrimaryButton';
// import BackButton from '../ui/buttons/BackButton';

// import { confirmationPopupActions } from './../../store/confirmationPopup';
// import { useFeatures } from '../../hooks/useFeatures';
// import { MODES } from '../../constants/enums/FeaturesModes';

// export default function FormFooter({
//   mode,
//   feature,
//   subFeature,
//   deleteHandler,
//   deleteHandlerParams,
//   confirmDelete,
//   itemToDelete,
//   children,
//   StartActions = () => <></>,
// }) {
//   const { t } = useTranslation();
//   const { canDelete } = useFeatures(feature, subFeature);
//   const dispatch = useDispatch();

//   const deleteHandlerFunction = (itemToDelete, confirmDelete) => {
//     dispatch(
//       confirmationPopupActions.openPopup({
//         title: 'LBL_BEWARE_ABOUT_TO_DELETE',
//         message: itemToDelete ? itemToDelete : `#`,
//         onConfirmHandler: () => confirmDelete(),
//       })
//     );
//   };

//   return (
//     <div className="form-footer">
//       <div className="form-footer-start-actions-container">
//         {(mode !== MODES.ADD && canDelete && deleteHandler) || (itemToDelete && confirmDelete) ? (
//           <PrimaryButton
//             theme="formFooterDanger"
//             text={t('LBL_DELETE')}
//             onClick={
//               (itemToDelete && confirmDelete) || !deleteHandler
//                 ? () => deleteHandlerFunction(itemToDelete, confirmDelete)
//                 : () => deleteHandler(deleteHandlerParams)
//             }
//           />
//         ) : null}
//         <StartActions />
//       </div>
//       <div className="form-footer-actions-container">
//         {mode !== MODES.VIEW && <BackButton />}
//         {children}
//       </div>
//     </div>
//   );
// }
import './formFooter.scss';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import PrimaryButton from '../ui/buttons/PrimaryButton';
import BackButton from '../ui/buttons/BackButton';

import { confirmationPopupActions } from './../../store/confirmationPopup';
import { useFeatures } from '../../hooks/useFeatures';
import { MODES } from '../../constants/enums/FeaturesModes';

export default function FormFooter({
  mode,
  feature,
  subFeature,
  deleteHandler,
  deleteHandlerParams,
  confirmDelete,
  itemToDelete,
  children,
  StartActions = () => <></>,
}) {
  const { t } = useTranslation();
  const { canDelete } = useFeatures(feature, subFeature);
  const dispatch = useDispatch();

  const deleteHandlerFunction = (itemToDelete, confirmDelete) => {
    dispatch(
      confirmationPopupActions.openPopup({
        title: 'LBL_BEWARE_ABOUT_TO_DELETE',
        message: itemToDelete ? itemToDelete : `#`,
        onConfirmHandler: () => confirmDelete(),
      })
    );
  };

  return (
    <div
      className="form-footer"  >
      <div className="form-footer-start-actions-container">
        {(mode !== MODES.ADD && canDelete && deleteHandler) || (itemToDelete && confirmDelete) ? (
          <PrimaryButton
            theme="formFooterDanger"
            text={t('LBL_DELETE')}
            onClick={
              (itemToDelete && confirmDelete) || !deleteHandler
                ? () => deleteHandlerFunction(itemToDelete, confirmDelete)
                : () => deleteHandler(deleteHandlerParams)
            }
          />
        ) : null}
        <StartActions />
      </div>
      <div className="form-footer-actions-container">
        {mode !== MODES.VIEW && <BackButton />}
        {children}
      </div>
    </div>
  );
}
