import { useTranslation } from 'react-i18next';

import ImageWithSkeleton from '../ui/skeletons/ImageWithSkeleton';

import WarningImg from '../../assets/icons/warningGreen.svg';

const SuccessPopup = props => {
  let setSuccessPopup = props.setSuccessPopup;
  let text = props?.text;

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
              onClick={() => setSuccessPopup(false)}
            ></button>
          </div>
          <div className="modal-body">
            <ImageWithSkeleton imgSrc={WarningImg} imgAlt="warning" isConfirmIcon={true} />
            <p>{text || t('LBL_CLICK_TO_DONE')} </p>
            <div className="row mt-5">
              <div className="col-md-6">
                <button
                  type="button"
                  className="btn btn-primary cancel-act"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={() => setSuccessPopup(false)}
                >
                  {t('LBL_CANCEL')}
                </button>
              </div>
              <div className="col-md-6">
                <button
                  type="button"
                  style={{ backgroundColor: '#40c9a8', border: 'solid 2px #40c9a8', color: 'white' }}
                  onClick={() => {
                    setSuccessPopup(false);
                  }}
                >
                  {t('LBL_DONE')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPopup;
