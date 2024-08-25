import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from 'react-bootstrap';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { v4 as uuidv4 } from 'uuid';
import { useDispatch } from 'react-redux';

import TextInput from '../../../components/ui/inputs/TextInput';
import PrimaryButton from '../../../components/ui/buttons/PrimaryButton';
import { VALID_TEXT_WITH_SPECIAL_CHARS } from '../../../constants/regex/Regex';
import { alertsActions } from '../../../store/alerts';

export default function ContractSubTypeModal({ show, setShow, contractSubTypeList, setContractSubTypeList, mode, line }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);

  const initialValues = {
    code: line?.code ?? '',
    description: line?.description ?? '',
  };

  const validationSchema = Yup.object({
    code: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).required(t('REQUIRED')),
    description: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: true,
  });

  const alertHandler = (title, message) => dispatch(alertsActions.initiateAlert({ title, message }));

  const submit = () => {
    setIsLoading(true);

    if (formik.isValid) {
      if (mode === 'add') {
        let tempLine = {
          id: null,
          lineId: uuidv4(),
          code: formik.values.code,
          description: formik.values.description,
        };
        setContractSubTypeList(prev => [...prev, tempLine]);
      }

      if (mode === 'edit') {
        let tempLine = { ...line };
        tempLine.code = formik.values.code;
        tempLine.description = formik.values.description;
        let tempList = [...contractSubTypeList];
        let index = tempList.findIndex(l => l.lineId === line.lineId);
        tempList[index] = tempLine;
        setContractSubTypeList(tempList);
      }

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
          {t('LBL_CONTRACT_SUBTYPE')}
        </h5>
        <button type="button" className="btn-close" onClick={() => setShow(false)}></button>
      </Modal.Header>
      <Modal.Body className="modal-body">
        <div className="row">
          <div className="col-md-6">
            <TextInput formik={formik} label="LBL_CODE" accessor="code" mode={mode} isRequired={true} />
          </div>
          <div className="col-md-6">
            <TextInput formik={formik} label="LBL_DESCRIPTION" accessor="description" mode={mode} />
          </div>
        </div>
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
          {mode !== 'view' && <PrimaryButton theme="purple" disabled={isLoading} onClick={submit} />}
        </div>
      </Modal.Footer>
    </Modal>
  );
}
