import { useTranslation } from 'react-i18next';

import ImageWithSkeleton from '../ui/skeletons/ImageWithSkeleton';

import WarningImg from '../../assets/icons/warning2.svg';
import WarningYellow from '../../assets/icons/warningYellow.svg';

const ConfirmationPopup = ({ onClickHandler, onClickHandlerParams, setConfirmationPopup, item, mode }) => {
  const { t } = useTranslation();

  const getMode = () => {
    switch (mode) {
      case 'preOrder':
        return {
          title: t('LBL_TITLE_WARNING_PREORDER'),
          subTitle: `[ ${t('LBL_ORDER_PICKUP')} ]`,
          action: t('LBL_SUB_TITLE_WARNING_PREORDER'),
          button: t('LBL_ORDER_PICKUP'),
          skeleton: WarningYellow,
        };
      default:
        return {
          title: t('LBL_BEWARE_ABOUT_TO_DELETE'),
          subTitle: item,
          action: t('LBL_CLICK_TO_DELETE'),
          button: t('LBL_DELETE'),
          skeleton: WarningImg,
        };
    }
  };

  const popupMode = getMode();
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
            <ImageWithSkeleton imgSrc={popupMode.skeleton} imgAlt="warning" isConfirmIcon={true} />
            <p>{popupMode.title}</p>
            <h3 className="fs-5">{popupMode.subTitle}</h3>
            <p>{popupMode.action}</p>
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
                  className="btn btn-primary warning"
                  onClick={() => {
                    onClickHandler(onClickHandlerParams);
                    setConfirmationPopup(false);
                  }}
                >
                  {popupMode.button}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPopup;
