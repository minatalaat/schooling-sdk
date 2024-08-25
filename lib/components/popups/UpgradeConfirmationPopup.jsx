import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';

import ImageWithSkeleton from '../ui/skeletons/ImageWithSkeleton';

import WarningImg from '../../assets/images/warning2.svg';
import { confirmationPopupActions } from '../../store/confirmationPopup';
import { upgradeConfirmationPopupActions } from '../../store/upgradeConfirmationPopup';

const UpgradeConfirmationPopup = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const {
    show,
    message,
    onConfirmHandler,
    title,
    instruction,
    actionLabel,
    showAction,
    cancelLabel,
    thirdActionLabel,
    thirdActionHandler,
  } = useSelector(state => state.upgradeConfirmationPopup);
  if (!show) return null;

  return (
    <div
      className="modal fade show"
      id="delete-row"
      aria-labelledby="exampleModalToggleLabel2"
      tabIndex="-1"
      aria-modal="true"
      role="dialog"
      style={{ display: 'block' }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={() => dispatch(upgradeConfirmationPopupActions.closePopup())}
            ></button>
          </div>
          <div className="modal-body">
            <ImageWithSkeleton imgSrc={WarningImg} imgAlt="warning" isConfirmIcon={true} />
            {title && <p>{t(title)} </p>}
            {message && <h3>{t(message)}</h3>}
            {instruction && <p>{t(instruction)}</p>}
            <div className="row mt-5">
              <div className={thirdActionLabel ? 'col-md-4' : `col-md-${showAction ? 6 : 12}`}>
                <button
                  type="button"
                  className="btn  cancel-act"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={() => dispatch(upgradeConfirmationPopupActions.closePopup())}
                >
                  {cancelLabel ? cancelLabel : t('LBL_CANCEL')}
                </button>
              </div>
              {thirdActionLabel && (
                <div className={thirdActionLabel ? 'col-md-4' : `col-md-${showAction ? 6 : 12}`}>
                  <button
                    type="button"
                    className="btn btn-primary delete-act"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                    onClick={() => {
                      thirdActionHandler();
                      dispatch(upgradeConfirmationPopupActions.closePopup());
                    }}
                  >
                    {thirdActionLabel}
                  </button>
                </div>
              )}
              {showAction && (
                <div className={thirdActionLabel ? 'col-md-4' : 'col-md-6'}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      onConfirmHandler();
                      dispatch(upgradeConfirmationPopupActions.closePopup());
                    }}
                  >
                    {t(actionLabel)}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeConfirmationPopup;
