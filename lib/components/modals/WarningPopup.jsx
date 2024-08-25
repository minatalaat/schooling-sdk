import { useTranslation } from 'react-i18next';

import ImageWithSkeleton from '../ui/skeletons/ImageWithSkeleton';

import WarningImg from '../../assets/icons/warning2.svg';

const WarningPopup = ({ onClickHandler, onClickHandlerParams, setConfirmationPopup, item }) => {
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
            <p>{t('LBL_BEWARE_ABOUT_TO_DELETE')} </p>
            <h3>{item}</h3>
            <p>{t('LBL_CLICK_TO_DELETE')}</p>
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
                  {t('LBL_DELETE')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarningPopup;
