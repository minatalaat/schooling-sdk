import { useTranslation } from 'react-i18next';
import ImageWithSkeleton from '../components/ui/skeletons/ImageWithSkeleton';
import wrongX from '../assets/images/wrong.svg';
import PrimaryButton from '../components/ui/buttons/PrimaryButton';

const OBErrorPopup = ({ onClickHandler }) => {
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
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-body" style={{ paddingTop: '36px' }}>
            <div className="d-flex flex-column justify-content-center align-items-center">
              <ImageWithSkeleton imgSrc={wrongX} imgAlt="X" isConfirmIcon={true} />
              <h3>{t('SOMETHING_WENT_WRONG')}</h3>
              <p style={{ maxWidth: '80%', textAlign: 'center' }}>{t('LBL_OB_POPUP_MESSAGE')}</p>
            </div>
            <div className="d-flex flex-column justify-content-center align-items-center" style={{ width: '100%' }}>
              <PrimaryButton
                theme="confirmationPopup"
                onClick={onClickHandler}
                btnOptions={{ style: { maxWidth: '50%', textAlign: 'center' } }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OBErrorPopup;
