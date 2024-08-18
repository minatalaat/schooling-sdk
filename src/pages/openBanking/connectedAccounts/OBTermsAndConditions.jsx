import React from 'react';
import { Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

function OBTermsAndConditions({ show, setShow, conditions }) {
  const { t } = useTranslation();
  return (
    <Modal
      id="ob-terms-of-service"
      show={show}
      onHide={() => setShow(false)}
      dialogClassName="modal-90w"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      size="xl"
    >
      <Modal.Header closeButton>
        <h5 className="modal-title">{t('LBL_TERMS_AND_CONDITIONS')}</h5>
      </Modal.Header>
      <Modal.Body>
        {conditions &&
          conditions.length > 0 &&
          conditions.map(item => {
            return <p>{t(item)}</p>;
          })}
      </Modal.Body>
    </Modal>
  );
}

export default OBTermsAndConditions;
