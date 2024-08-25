import { Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import moment from 'moment';

import TextInput from '../../../components/ui/inputs/TextInput';
import CloseButton from '../../../components/ui/buttons/CloseButton';
import PurpleSaveButton from '../../../components/ui/buttons/PurpleSaveButton';
import TimeInput from '../../../components/ui/inputs/TimeInput';
import NumberInput from '../../../components/ui/inputs/NumberInput';

import { weekDaysActions } from '../../../store/weekDays';
import { VALID_TEXT_WITH_SPECIAL_CHARS } from '../../../constants/regex/Regex';
import { alertsActions } from '../../../store/alerts';

function WeekDayModal({ show, setShow, header, mode, line }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const initialValues = {
    name: line ? (line.name ? line.name : '') : '',
    morningFrom: line ? (line.morningFrom ? line.morningFrom : '') : '',
    morningTo: line ? (line.morningTo ? line.morningTo : '') : '',
    afternoonFrom: line ? (line.afternoonFrom ? line.afternoonFrom : '') : '',
    afternoonTo: line ? (line.afternoonTo ? line.afternoonTo : '') : '',
    sequence: line ? (line.sequence !== null ? line.sequence : 0) : 0,
  };
  const validationSchema = Yup.object({
    name: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).required(t('REQUIRED')).trim(),
    morningFrom: Yup.string().required(t('REQUIRED')).trim(),
    morningTo: Yup.string().when('morningFrom', {
      is: morningFrom => {
        return morningFrom && morningFrom.length > 0;
      },
      then: Yup.string()
        .required(t('REQUIRED'))
        .test('is-greater', t('TO_TIME_SHOULD_BE_AFTER_FROM_TIME'), function (value) {
          const { morningFrom } = this.parent;
          return moment(value, 'HH:mm').isSameOrAfter(moment(morningFrom, 'HH:mm'));
        }),
    }),
    afternoonFrom: Yup.string().trim(),
    afternoonTo: Yup.string().when('afternoonFrom', {
      is: afternoonFrom => {
        return afternoonFrom && afternoonFrom.length > 0;
      },
      then: Yup.string()
        .required(t('REQUIRED'))
        .test('is-greater', t('TO_TIME_SHOULD_BE_AFTER_FROM_TIME'), function (value) {
          const { afternoonFrom } = this.parent;
          return moment(value, 'HH:mm').isSameOrAfter(moment(afternoonFrom, 'HH:mm'));
        }),
    }),
    sequence: Yup.number().integer(t('INTEGER_ONLY')).required(t('REQUIRED')),
  });

  const lineFormik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: true,
  });
  const alertHandler = (title, message) => dispatch(alertsActions.initiateAlert({ title, message }));

  const saveLine = () => {
    if (lineFormik.isValid) {
      if (mode === 'add') {
        dispatch(
          weekDaysActions.addLine({
            weekDay: {
              id: null,
              lineId: Math.floor(Math.random() * 100).toString(),
              name: lineFormik.values.name,
              morningFrom: lineFormik.values.morningFrom,
              morningTo: lineFormik.values.morningTo,
              afternoonFrom: lineFormik.values.afternoonFrom,
              afternoonTo: lineFormik.values.afternoonTo,
              selected: false,
              sequence: parseInt(lineFormik.values.sequence),
            },
          })
        );
      } else {
        dispatch(
          weekDaysActions.editLine({
            lineId: line.lineId,
            weekDay: {
              id: line?.id || null,
              lineId: line.lineId,
              version: line && line.version !== null ? line.version : null,
              name: lineFormik.values.name,
              morningFrom: lineFormik.values.morningFrom,
              morningTo: lineFormik.values.morningTo,
              afternoonFrom: lineFormik.values.afternoonFrom,
              afternoonTo: lineFormik.values.afternoonTo,
              selected: false,
              sequence: parseInt(lineFormik.values.sequence),
            },
          })
        );
      }

      setShow(false);
    } else {
      alertHandler('Error', t('INVALID_FORM'));
    }
  };

  return (
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
          {t(header)}
        </h5>
      </Modal.Header>
      <Modal.Body>
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <TextInput formik={lineFormik} label="LBL_DAY" accessor="name" mode={mode} isRequired={mode === 'add' || mode === 'edit'} />
            </div>

            <div className="col-md-6">
              <TimeInput
                formik={lineFormik}
                label="LBL_FIRST_PERIOD_FROM"
                accessor="morningFrom"
                mode={mode}
                isRequired={mode === 'add' || mode === 'edit'}
              />
            </div>
            <div className="col-md-6">
              <TimeInput
                formik={lineFormik}
                label="LBL_FIRST_PERIOD_TO"
                accessor="morningTo"
                mode={mode}
                isRequired={mode === 'add' || mode === 'edit'}
              />
            </div>
            <div className="col-md-6">
              <TimeInput
                formik={lineFormik}
                label="LBL_SECOND_PERIOD_FROM"
                accessor="afternoonFrom"
                mode={mode}
                isRequired={(mode === 'add' || mode === 'edit') && lineFormik.values.afternoonFrom !== ''}
              />
            </div>
            <div className="col-md-6">
              <TimeInput
                formik={lineFormik}
                label="LBL_SECOND_PERIOD_TO"
                accessor="afternoonTo"
                mode={mode}
                isRequired={(mode === 'add' || mode === 'edit') && lineFormik.values.afternoonFrom !== ''}
              />
            </div>
            <div className="col-md-6">
              <NumberInput
                step={1}
                formik={lineFormik}
                label="LBL_ORDER"
                accessor="sequence"
                mode={mode}
                isRequired={mode === 'add' || mode === 'edit'}
              />
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="float-end">
          <CloseButton onClick={() => setShow(false)} />
          {mode !== 'view' && (
            <PurpleSaveButton
              onClick={() => {
                saveLine();
              }}
            />
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default WeekDayModal;
