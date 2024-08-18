import { useTranslation } from 'react-i18next';

import ImageWithSkeleton from '../ui/skeletons/ImageWithSkeleton';

import WarningImg from '../../assets/icons/warning2.svg';
import TextInput from '../ui/inputs/TextInput';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const BusChangePasswordPopup = props => {
  let item = props.item;
  let onClickHandler = props.onClickHandler;
  let onClickHandlerParams = props.onClickHandlerParams;
  let setShowChangePassword = props.setShowChangePassword;
  let setShowDelete = props.setShowDelete;

  const { t } = useTranslation();

  const submit = values => {
    onClickHandler(values);
    // setShowChangePassword(false);
    // setShowDelete(true);
  };

  const validationSchema = Yup.object().shape({
    password: Yup.string().required(`* ${t('REQUIRED')}`),
    passwordConfirmation: Yup.string()
      .required(`* ${t('REQUIRED')}`)
      .oneOf([Yup.ref('password'), null], `* ${t('PASSWORD_MATCH_VALIDATION_MESSAGE')}`),
  });

  const formik = useFormik({
    validationSchema,
    initialValues: {
      password: '',
      passwordConfirmation: '',
    },
    validateOnMount: true,
    onSubmit: submit,
  });
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
              onClick={() => setShowChangePassword(false)}
            ></button>
          </div>
          <div className="modal-body">
            <ImageWithSkeleton imgSrc={WarningImg} imgAlt="warning" isConfirmIcon={true} />
            <h3 className="text-secondary">Change Password</h3>
            <p>Enter new password </p>
            <form className="login-form" onSubmit={formik.handleSubmit}>
              <div className="row justify-content-between gap-3 mt-5">
                <div className="col-md-12">
                  <TextInput formik={formik} label="LBL_NEW_PASSWORD" accessor="password" mode="add" isRequired={true} />
                </div>
                <div className="col-md-12">
                  <TextInput
                    formik={formik}
                    label="LBL_CONFIRM_NEW_PASSWORD"
                    accessor="passwordConfirmation"
                    mode="add"
                    isRequired={true}
                  />
                </div>
              </div>

              <div className="row mt-5">
                <div className="col-md-6">
                  <button
                    type="button"
                    className="btn btn-primary cancel-act"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                    onClick={() => setShowChangePassword(false)}
                  >
                    {t('LBL_CANCEL')}
                  </button>
                </div>
                <div className="col-md-6">
                  <button type="submit" className="btn btn-primary">
                    {t('LBL_DONE')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusChangePasswordPopup;
