import { Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import PrimaryButton from '../../../components/ui/buttons/PrimaryButton';
import TextInput from '../../../components/ui/inputs/TextInput';

const OTPModal = ({ formik, showOTPModal, setShowOTPModal, onCloseHandler, onConfirmHandler }) => {
  const { t } = useTranslation();

  const onClose = () => {
    setShowOTPModal(false);
    onCloseHandler();
  };

  return (
    <Modal
      id="add-new-line"
      show={showOTPModal}
      onHide={() => setShowOTPModal(false)}
      dialogClassName="modal-90w"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      size="lg"
    >
      <Modal.Header closeButton>
        <h5 className="modal-title" id="add-new-line">
          {t('LBL_ZATCA_OTP')}
        </h5>
      </Modal.Header>
      <Modal.Body>
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <div className="search-ex">
                <TextInput formik={formik} label="LBL_ZATCA_OTP" accessor="otp" mode="add" disabled={false} isRequired={true} />{' '}
              </div>
              {formik.values.otp !== formik.initialValues.otp && formik.errors.otp && (
                <label className="color-text-red mb-3">{formik.errors.otp}</label>
              )}
            </div>
          </div>
          <div className="row mb-3">
            <label className="form-label color-text-red" htmlFor="full-name">
              {t('LBL_ON_CANCEL_ZATCA_WARNING')}
            </label>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="float-end">
          <PrimaryButton theme="white" text="LBL_CANCEL" onClick={onClose} />
          <PrimaryButton theme="purple" text="LBL_CONFIRM" onClick={onConfirmHandler} />
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default OTPModal;
