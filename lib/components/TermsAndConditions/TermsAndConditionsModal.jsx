import Modal from 'react-bootstrap/Modal';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';

import TermsAndConditionsContentEn from './TermsAndConditionsContentEn';

import { useWindowSize } from '../../hooks/useWindowSize';
import TermsAndConditionsContentAr from './TermsAndConditionsContentAr';

export default function TermsAndConditionsModal({ show, setShow, onAgree = () => {} }) {
  const { t } = useTranslation();
  const { width } = useWindowSize();

  return (
    <Modal
      id="add-new-line"
      show={show}
      onHide={() => setShow(false)}
      dialogClassName="modal-90w"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      size="lg"
    >
      <Modal.Body dir={i18next.dir()}>
        {i18next.language === 'en' ? <TermsAndConditionsContentEn /> : <TermsAndConditionsContentAr />}
      </Modal.Body>
      <Modal.Footer>
        <div className="row">
          <div className="col-md-6 float-start ">
            <button type="button" className="btn cancel-act w-100 mx-0" data-bs-dismiss="modal" onClick={() => setShow(false)}>
              {t('LBL_CANCEL')}
            </button>
          </div>
          <div className={width > 830 ? 'col-md-6 float-start' : 'col-md-6  float-start mt-3'}>
            <button type="button" className="btn add-btn w-100 mx-0" onClick={onAgree}>
              {t('LBL_AGREE_TO_TERMS')}
            </button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
