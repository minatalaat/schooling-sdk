import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';

import ImageWithSkeleton from '../../ui/skeletons/ImageWithSkeleton';
import PrimaryButton from '../../ui/buttons/PrimaryButton';

import WarningImg from '../../../assets/images/warning2.svg';
import { confirmationPopupActions } from '../../../store/confirmationPopup';

const ConfirmationPopup = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { show, message, onConfirmHandler, title, instruction, actionLabel, showAction } = useSelector(state => state.confirmationPopup);

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
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={() => dispatch(confirmationPopupActions.closePopup())}
            ></button>
          </div>
          <div className="modal-body">
            <ImageWithSkeleton imgSrc={WarningImg} imgAlt="warning" isConfirmIcon={true} />
            {title && <p>{t(title)} </p>}
            {message && <h3>{t(message)}</h3>}
            {instruction && <p>{t(instruction)}</p>}
            <div className="row mt-5">
              <div className={`col-md-${showAction ? 6 : 12}`}>
                <PrimaryButton theme="redModal" text="LBL_CANCEL" onClick={() => dispatch(confirmationPopupActions.closePopup())} />
              </div>
              {showAction && (
                <div className="col-md-6">
                  <PrimaryButton
                    theme="blueModal"
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
