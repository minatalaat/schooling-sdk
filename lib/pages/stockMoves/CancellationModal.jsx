import { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { SpinnerCircular } from 'spinners-react';
import { useDispatch } from 'react-redux';

import ErrorMessage from '../../components/ui/inputs/ErrorMessage';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';

import { useAxiosFunction } from '../../hooks/useAxios';
import { getSearchUrl } from '../../services/getUrl';
import { MODELS } from '../../constants/models';
import { setFieldValue } from '../../utils/formHelpers';
import { VALID_TEXT_WITH_SPECIAL_CHARS } from '../../constants/regex/Regex';
import { alertsActions } from '../../store/alerts';

const CancellationModal = ({ title, show, setShow, submit, setCancelReason }) => {
  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);

  const initialValues = {
    cancellationReason: 0,
    choices: [],
  };

  const validationSchema = Yup.object({
    invoiceAll: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).required(),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: false,
  });

  const alertHandler = (title, message) => dispatch(alertsActions.initiateAlert({ title, message }));

  useEffect(() => {
    getCancellationReasons();
  }, []);

  const cancellationReasonsPayload = () => {
    let payload = {
      fields: ['id', 'name'],
      sortBy: null,
      data: {
        _domain: 'self.applicationType = :_xApplicationType',
        _domainContext: {
          _xApplicationType: MODELS.STOCK_MOVE,
        },
      },
      limit: -1,
      offset: 0,
      translate: true,
    };
    return payload;
  };

  const getCancellationReasons = async () => {
    let cancellationReasonsResponse = await api('POST', getSearchUrl(MODELS.CANCEL_REASON), cancellationReasonsPayload());
    if (cancellationReasonsResponse.data.status !== 0 || !cancellationReasonsResponse.data.total)
      alertHandler('Error', 'LBL_ERROR_LOADING_REASONS');
    let data = cancellationReasonsResponse.data.data || [];
    let tempData = [];

    if (data) {
      data.forEach(reason => tempData.push({ value: reason.id, name: reason.name }));
    }

    setFieldValue(formik, 'choices', tempData);
    return { displayedData: [...tempData], total: cancellationReasonsResponse.data.total || 0 };
  };

  return (
    <>
      <Modal
        id="add-new-line"
        show={show}
        onHide={() => setShow(false)}
        dialogClassName="modal-90w"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        size="xl"
      >
        <Modal.Header closeButton>
          <h5 className="modal-title" id="add-new-line">
            {t(title)}
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
            <div className="container">
              <div className="row">
                <div className="col-md-6">
                  <label htmlFor="exampleDataList" className="form-label">
                    {t('LBL_CANCELLATION_REASON')}
                    <span>*</span>
                  </label>
                  <select
                    className="form-select placeholder-shown"
                    placeholder=""
                    name="cancellationReason"
                    value={formik.values.cancellationReason}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <option value={0} hidden>
                      {t('LBL_PLEASE_SELECT')}
                    </option>
                    {formik.values.choices && formik.values.choices.map(type => <option key={type} value={type.value}>{type.name}</option>)}
                  </select>
                  <ErrorMessage formik={formik} mode="edit" identifier="cancellationReason" />
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <div className="float-end">
            <PrimaryButton theme="white" onClick={() => setShow(false)} />
            <PrimaryButton
              theme="purple"
              text={title}
              onClick={() => {
                setIsLoading(true);
                setCancelReason({ id: formik.values.cancellationReason });
                submit();
              }}
              disabled={formik.values.cancellationReason === 0}
            />
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CancellationModal;
