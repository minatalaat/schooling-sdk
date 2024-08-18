import React from 'react';
import WarningImg from '../assets/images/warning2.svg';
import { useTranslation } from 'react-i18next';
import ImageWithSkeleton from '../components/ui/skeletons/ImageWithSkeleton';

const BRWarningPopup = props => {
  let items = props.items;
  let canValidate = props.canValidate ? props.canValidate : false;
  let onClickHandler = props.onClickHandler;
  let onClickHandlerParams = props.onClickHandlerParams;
  let setConfirmationPopup = props.setConfirmationPopup;

  const { t } = useTranslation();
  let secondButton = canValidate ? 'LBL_CANCEL' : 'LBL_OK';
  let followingLBL = canValidate ? 'LBL_FOLLOWING_UNRECONCILED_MOVELINES' : 'LBL_FOLLOWING_UNRECONCILED_LINES';

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
            <p>{t(followingLBL)} </p>
            <div className="itemsContainer">
              <ol type="1">
                {items &&
                  items.map(item => {
                    return <li>{item.name}</li>;
                  })}
              </ol>
            </div>
            {/* <h3>{item}</h3> */}
            {canValidate && <p>{t('LBL_VALIDATION_CONFIRMATION')}</p>}
            <div className="row mt-5">
              <div className={canValidate ? 'col-md-6' : 'col-md-12'}>
                <button
                  type="button"
                  className="btn btn-primary cancel-act"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={() => setConfirmationPopup(false)}
                >
                  {t(secondButton)}
                </button>
              </div>
              {canValidate && (
                <div className="col-md-6">
                  <button
                    type="button"
                    className="btn btn-primary delete-act"
                    onClick={() => {
                      setConfirmationPopup(false);
                      onClickHandler(onClickHandlerParams);
                    }}
                  >
                    {t('LBL_VALIDATE')}
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

export default BRWarningPopup;
