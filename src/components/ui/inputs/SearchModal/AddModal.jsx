import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import PrimaryButton from '../../buttons/PrimaryButton';

export default function AddModal({ FormComponent = <></>, title, show, setShow, selectCallback = () => {}, additionalProps = {} }) {
  const { t } = useTranslation();

  const [isValid, setIsValid] = useState(false);
  const [isSave, setIsSave] = useState(false);

  const finshedSaveHandler = addedData => {
    selectCallback(addedData);
    setIsSave(false);
  };

  const closeModalHandler = () => setShow(false);

  return (
    <Modal
      show={show}
      onHide={() => setShow(false)}
      dialogClassName="modal-90w"
      aria-labelledby="contained-modal-title-vcenter"
      id="add-new-line"
      centered
      size="xl"
    >
      <Modal.Header closeButton>
        <h5 className="modal-title" id="add-new-line">
          {title && t(title)}
        </h5>
      </Modal.Header>
      <Modal.Body>
        <FormComponent
          onValidate={setIsValid}
          finshedSaveHandler={finshedSaveHandler}
          isSave={isSave}
          closeModalHandler={closeModalHandler}
          {...additionalProps}
        />
      </Modal.Body>
      <Modal.Footer>
        <div className="float-end">
          <PrimaryButton theme="white" onClick={() => setShow(false)} />
          <PrimaryButton theme="purple" text="LBL_SAVE_CONTINUTE" disabled={!isValid} onClick={() => setIsSave(true)} />
        </div>
      </Modal.Footer>
    </Modal>
  );
}
