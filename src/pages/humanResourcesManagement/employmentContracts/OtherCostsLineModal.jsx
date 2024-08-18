import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from 'react-bootstrap';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { v4 as uuidv4 } from 'uuid';
import { SpinnerCircular } from 'spinners-react';
import { useDispatch } from 'react-redux';

import TextInput from '../../../components/ui/inputs/TextInput';
import NumberInput from '../../../components/ui/inputs/NumberInput';
import PrimaryButton from '../../../components/ui/buttons/PrimaryButton';

import { otherCostsLinesActions } from '../../../store/otherCostsLines';
import { MODELS } from '../../../constants/models';
import { useAxiosFunction } from '../../../hooks/useAxios';
import { getModelUrl } from '../../../services/getUrl';
import { VALID_TEXT_WITH_SPECIAL_CHARS } from '../../../constants/regex/Regex';
import { alertsActions } from '../../../store/alerts';

export default function OtherCostsLineModal({ show, setShow, mode, line }) {
  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);

  const initialValues = {
    amount: line?.amount ?? '',
    description: line?.description ?? '',
  };

  const validationSchema = Yup.object({
    amount: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).required(t('REQUIRED')),
    description: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).required(t('REQUIRED')),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: true,
  });

  const alertHandler = (title, message) => {
    dispatch(alertsActions.initiateAlert({ title, message }));
    setIsLoading(false);
  };

  const submit = async () => {
    setIsLoading(true);

    if (formik.isValid) {
      let payload = {
        data: {
          amount: formik.values.amount,
          description: formik.values.description,
        },
      };

      if (mode === 'edit') {
        payload = { ...payload, data: { ...payload.data, id: line.id, version: line.version } };
      }

      const saveResponse = await api('POST', getModelUrl(MODELS.OTHER_COSTS_EMPLOYEE), payload);
      if (saveResponse.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      let data = saveResponse.data.data;
      if (!data || !data[0]) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      let newLine = data[0];

      if (mode === 'add') {
        let tempLine = {
          id: newLine.id,
          version: newLine.version,
          lineId: uuidv4(),
          amount: newLine.amount,
          description: newLine.description,
        };

        dispatch(
          otherCostsLinesActions.addLine({
            line: tempLine,
          })
        );
      }

      if (mode === 'edit') {
        dispatch(
          otherCostsLinesActions.updateLine({
            line: { ...newLine, lineId: line.lineId },
          })
        );
      }

      setIsLoading(false);
      setShow(false);
    } else {
      alertHandler('Error', t('LBL_REQUIRED_FIELDS'));
    }
  };

  return (
    <Modal
      show={show}
      onHide={() => setShow(false)}
      dialogClassName="modal-90w"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      size="xl"
      id="add-new-line"
    >
      <Modal.Header>
        <h5 className="modal-title" id="add-new-conf">
          {t('LBL_OTHER')}
        </h5>
        <button type="button" className="btn-close" onClick={() => setShow(false)}></button>
      </Modal.Header>
      <Modal.Body className="modal-body">
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
          <div className="row">
            <div className="col-md-6">
              <NumberInput formik={formik} label="LBL_AMOUNT" accessor="amount" mode={mode} isRequired={true} step={0.1} />
            </div>
            <div className="col-md-6">
              <TextInput formik={formik} label="LBL_DESCRIPTION" accessor="description" mode={mode} isRequired={true} />
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <div className="float-end">
          <PrimaryButton
            theme="white"
            disabled={isLoading}
            onClick={() => {
              setShow(false);
            }}
          />
          {mode !== 'view' && <PrimaryButton theme="purple" disabled={isLoading || !formik.isValid} onClick={submit} />}
        </div>
      </Modal.Footer>
    </Modal>
  );
}
