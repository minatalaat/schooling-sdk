import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { SpinnerCircular } from 'spinners-react';

import PrimaryButton from '../buttons/PrimaryButton';

import { alertsActions } from '../../../store/alerts';

export default function FormModal({ FormComponent = <></>, title, show, setShow, selectCallback = () => {}, additionalProps = {} }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [isValid, setIsValid] = useState(false);
  const [isSave, setIsSave] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const postSave = addedData => {
    selectCallback(addedData);
    setIsSave(false);
    closeModalHandler();
  };

  const closeModalHandler = () => setShow(false);

  const alertHandler = (title, message) => {
    if (message) dispatch(alertsActions.initiateAlert({ title, message: t(message) }));

    if (title !== 'Success' || !message) {
      setIsSave(false);
      setIsLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={closeModalHandler}
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
        {isLoading && (
          <div className="text-center">
            <SpinnerCircular
              size={70}
              thickness={120}
              speed={100}
              color="rgba(31, 79, 222, 1)"
              secondaryColor="rgba(153, 107, 229, 0.19)"
            />
          </div>
        )}
        {!isLoading && (
          <>
            <FormComponent
              setIsValid={setIsValid}
              postSave={postSave}
              isSave={isSave}
              setIsSave={setIsSave}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              closeModalHandler={closeModalHandler}
              alertHandler={alertHandler}
              {...additionalProps}
            />
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <div className="float-end">
          <PrimaryButton theme="tertiary" onClick={closeModalHandler} />
          <PrimaryButton theme="secondary" text="LBL_SAVE_CONTINUTE" onClick={() => setIsSave(true)} />
        </div>
      </Modal.Footer>
    </Modal>
  );
}
