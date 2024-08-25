import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';

import PrimaryButton from '../../ui/buttons/PrimaryButton';

import { confirmationPopupActions } from '../../../store/confirmationPopup';

import './confirmPopup.scss';

const ConfirmationPopup = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const {
    show,
    message,
    onConfirmHandler = () => {},
    onCancelHandler = () => {},
    title,
    instruction,
    actionLabel,
    showAction,
  } = useSelector(state => state.confirmationPopup);

  if (!show) return null;

  return (
    <div
      className="modal fade show confirm-popup"
      id="delete-row"
      aria-labelledby="exampleModalToggleLabel2"
      tabIndex="-1"
      aria-modal="true"
      role="dialog"
      style={{ display: 'block' }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-body">
            <div className="icon-container">
              <div className="warning-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-alert-triangle"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
            </div>
            {title && <p>{t(title)} </p>}
            {message && <h3>{t(message)}</h3>}
            {instruction && <p>{t(instruction)}</p>}
            <div className="row mt-4">
              <div className={`col-md-${showAction ? 6 : 12}`}>
                <PrimaryButton
                  theme="tertiary"
                  text="LBL_CANCEL"
                  onClick={() => {
                    onCancelHandler();
                    dispatch(confirmationPopupActions.closePopup());
                  }}
                />
              </div>
              {showAction && (
                <div className="col-md-6">
                  <PrimaryButton
                    theme="primary"
                    text={actionLabel}
                    onClick={() => {
                      onConfirmHandler();
                      dispatch(confirmationPopupActions.closePopup());
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPopup;
