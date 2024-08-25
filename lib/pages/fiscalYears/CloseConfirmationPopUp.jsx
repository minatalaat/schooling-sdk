import { useTranslation } from 'react-i18next';

import WarningImg from '../../assets/images/warning2.svg';
import ImageWithSkeleton from '../../components/ui/skeletons/ImageWithSkeleton';

const CloseConfirmationPopUp = props => {
  let message = props.message;
  let onClickHandler = props.onClickHandler;
  let onClickHandlerParams = props.onClickHandlerParams;
  let setConfirmationPopup = props.setConfirmationPopup;

  const { t } = useTranslation();

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
              onClick={() => setConfirmationPopup(false)}
            ></button>
          </div>
          <div className="modal-body">
            <ImageWithSkeleton imgSrc={WarningImg} imgAlt="warning" isConfirmIcon={true} />
            <p>{t(message)}</p>
            <div className="row mt-5">
              <div className="col-md-6">
                <button
                  type="button"
                  className="btn btn-primary cancel-act"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={() => setConfirmationPopup(false)}
                >
                  {t('LBL_CANCEL')}
                </button>
              </div>
              <div className="col-md-6">
                <button
                  type="button"
                  className="btn btn-primary delete-act"
                  onClick={() => {
                    onClickHandler(onClickHandlerParams);
                    setConfirmationPopup(false);
                  }}
                >
                  {t('LBL_CONFIRM')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloseConfirmationPopUp;
