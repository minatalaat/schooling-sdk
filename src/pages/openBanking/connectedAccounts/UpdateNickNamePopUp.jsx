import React from 'react';
import WarningOBImg from '../../../assets/images/warning-ob.svg';
import { useTranslation } from 'react-i18next';
import ImageWithSkeleton from '../../../components/ui/skeletons/ImageWithSkeleton';
import { SpinnerCircular } from 'spinners-react';

const UpdateNickNamePopUp = props => {
  let onClickHandler = props.onClickHandler;
  let onClickHandlerParams = props.onClickHandlerParams;
  let setConfirmationPopup = props.setConfirmationPopup;
  let onCancelHandler = props.onCancelHandler;
  let isLoading = props.isLoading;
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
            {isLoading && (
              <SpinnerCircular
                size={71}
                thickness={138}
                speed={100}
                color="rgba(31, 79, 222, 1)"
                secondaryColor="rgba(153, 107, 229, 0.19)"
              />
            )}
            {!isLoading && (
              <>
                <ImageWithSkeleton imgSrc={WarningOBImg} imgAlt="WarningOBImg" isConfirmIcon={true} />
                <h3>{t('LBL_CONFIRM_NICKNAME')}</h3>
                <p>{t('LBL_CONFIRM_NICKNAME_MESSAGE')}</p>

                <div className="row mt-5">
                  <div className="col-md-6">
                    <button
                      type="button"
                      className="btn btn-primary cancel-act"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                      onClick={() => {
                        setConfirmationPopup(false);
                        onCancelHandler();
                      }}
                    >
                      {t('LBL_CANCEL')}
                    </button>
                  </div>
                  <div className="col-md-6">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        onClickHandler(onClickHandlerParams);
                      }}
                    >
                      {t('LBL_CONFIRM')}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateNickNamePopUp;
