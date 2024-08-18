import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from 'react-bootstrap';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useDispatch } from 'react-redux';

import TextInput from '../../../components/ui/inputs/TextInput';
import DateInput from '../../../components/ui/inputs/DateInput';

import { setFieldValue } from '../../../utils/formHelpers';
import { VALID_TEXT_WITH_SPECIAL_CHARS } from '../../../constants/regex/Regex';
import { alertsActions } from '../../../store/alerts';

export default function PublicHolidayLine({ show, setShow, checked, setChecked, parentFormik, edit }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const initialValues = {
    date: checked?.date || '',
    description: checked?.description || '',
  };
  const validationSchema = Yup.object({
    date: Yup.date().required(t('REQUIRED')),
    description: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).required(t('REQUIRED')),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: true,
  });

  const alertHandler = (title, message) => dispatch(alertsActions.initiateAlert({ title, message }));

  const handleSaveConfiguration = () => {
    if (formik.isValid) {
      const date = new Date(formik.values.date);
      const year = date.getFullYear();

      if (edit) {
        let tempConfigurations = [...parentFormik.values.eventsPlanningLineList];
        let selectedConfiguration = tempConfigurations.findIndex(conf => (checked ? conf.lineId === checked.lineId : false));
        if (selectedConfiguration === -1)
          selectedConfiguration = tempConfigurations.findIndex(conf => (checked ? conf.id === checked.id : false));

        if (selectedConfiguration !== -1) {
          tempConfigurations[selectedConfiguration] = {
            ...tempConfigurations[selectedConfiguration],
            id: tempConfigurations[selectedConfiguration].id ? tempConfigurations[selectedConfiguration].id : null,
            lineId: tempConfigurations[selectedConfiguration].lineId ? tempConfigurations[selectedConfiguration].lineId : null,
            selected: false,
            date: formik.values.date,
            description: formik.values.description,
            year: year,
          };
          if (tempConfigurations[selectedConfiguration].id)
            tempConfigurations[selectedConfiguration] = {
              ...tempConfigurations[selectedConfiguration],
              version: tempConfigurations[selectedConfiguration].version ? tempConfigurations[selectedConfiguration].version : 0,
            };
          setFieldValue(parentFormik, 'eventsPlanningLineList', [...tempConfigurations]);
          setChecked({ ...tempConfigurations[selectedConfiguration] });
        }
      } else {
        setFieldValue(parentFormik, 'eventsPlanningLineList', [
          ...parentFormik.values.eventsPlanningLineList,
          {
            id: null,
            lineId: Math.floor(Math.random() * 10 + 1),
            selected: false,
            date: formik.values.date,
            description: formik.values.description,
            year: year,
          },
        ]);
      }

      setShow(false);
    } else {
      alertHandler('Error', t('INVALID_FORM'));
    }
  };

  useEffect(() => {
    if (checked) {
      formik.resetForm({
        values: {
          ...initialValues,
        },
      });
    }
  }, [checked]);

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
          {t('LBL_PUBLIC_HOLIDAYS_PLAN')}
        </h5>
        <button type="button" className="btn-close" onClick={() => setShow(false)}></button>
      </Modal.Header>
      <Modal.Body className="modal-body">
        <div className="row">
          <div className="col-md-6">
            <DateInput formik={formik} label="LBL_DATE" accessor="date" mode={edit ? 'edit' : 'add'} isRequired={true} />
          </div>
          <div className="col-md-6">
            <TextInput formik={formik} label="LBL_DESCRIPTION" accessor="description" mode={edit ? 'edit' : 'add'} isRequired={true} />
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="float-end">
          <button className="btn cancel-act" onClick={() => setShow(false)}>
            {t('LBL_CLOSE')}
          </button>
          <button
            className="btn add-btn"
            onClick={() => {
              handleSaveConfiguration();
            }}
            disabled={!formik.isValid}
          >
            {t('LBL_SAVE')}
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
