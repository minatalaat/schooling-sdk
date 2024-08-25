import * as Yup from 'yup';
import { Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { useDispatch } from 'react-redux';
import moment from 'moment';

import CloseButton from '../ui/buttons/CloseButton';
import PurpleSaveButton from '../ui/buttons/PurpleSaveButton';
import DateInput from '../ui/inputs/DateInput';
import NumberInput from '../ui/inputs/NumberInput';

import { depreciationLinesActions } from '../../store/DepreciationLines';

function DepreciationLineModal({ show, setShow, header, mode, line, onRealizeLine, canRealize = true }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const initVals = {
    depreciationDate: line ? line.depreciationDate : '',
    depreciationBase: line ? line.depreciationBase : '',
    depreciation: line ? line.depreciation : '',
    cumulativeDepreciation: line ? line.cumulativeDepreciation : '',
    accountingValue: line ? line.accountingValue : '',
  };

  const valSchema = Yup.object({
    depreciationDate: Yup.date(t('VALID_DATE_FORMAT')).required(t('REQUIRED')),
    depreciationBase: Yup.number().required(t('REQUIRED')).min(0.0, t('LBL_NUMBER_MUST_NOT_BE_ZERO')),
    depreciation: Yup.number().required(t('REQUIRED')).min(0.0, t('LBL_NUMBER_MUST_NOT_BE_ZERO')),
    cumulativeDepreciation: Yup.number().required(t('REQUIRED')).min(0.0, t('LBL_NUMBER_MUST_NOT_BE_ZERO')),
    accountingValue: Yup.number().required(t('REQUIRED')).min(0.0, t('LBL_NUMBER_MUST_NOT_BE_ZERO')),
  });

  const lineFormik = useFormik({
    initialValues: initVals,
    validationSchema: valSchema,
    validateOnMount: true,
  });

  const saveLine = () => {
    if (lineFormik.isValid) {
      dispatch(
        depreciationLinesActions.editLine({
          lineId: line.lineId,
          depreciationLine: {
            id: line?.id || null,
            lineId: line.lineId,
            version: line && line.version !== null ? line.version : null,
            depreciationDate: moment(lineFormik.values.depreciationDate).locale('en').format('YYYY-MM-DD'),
            depreciationBase: parseFloat(lineFormik.values.depreciationBase).toFixed(2).toString(),
            depreciation: parseFloat(lineFormik.values.depreciation).toFixed(2).toString(),
            cumulativeDepreciation: parseFloat(lineFormik.values.cumulativeDepreciation).toFixed(2).toString(),
            accountingValue: parseFloat(lineFormik.values.accountingValue).toFixed(2).toString(),
            statusSelect: line.statusSelect ? line.statusSelect : '',
          },
        })
      );
      setShow(false);
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
              <DateInput
                formik={lineFormik}
                label="LBL_DEPRECIATION_DATE"
                accessor="depreciationDate"
                mode={mode}
                isRequired={mode !== 'view'}
                disabled={mode === 'view'}
              />
            </div>
            <div className="col-md-6">
              <NumberInput
                formik={lineFormik}
                label="LBL_DEPRECIATION_BASE"
                accessor="depreciationBase"
                mode={mode}
                isRequired={mode !== 'view'}
                disabled={mode === 'view'}
              />
            </div>
            <div className="col-md-6">
              <NumberInput
                formik={lineFormik}
                label="LBL_DEPRECIATION"
                accessor="depreciation"
                mode={mode}
                isRequired={mode !== 'view'}
                disabled={mode === 'view'}
              />
            </div>
            <div className="col-md-6">
              <NumberInput
                formik={lineFormik}
                label="LBL_CUMUALATIVE_DEPRECIATION"
                accessor="cumulativeDepreciation"
                mode={mode}
                isRequired={mode !== 'view'}
                disabled={mode === 'view'}
              />
            </div>
            <div className="col-md-6">
              <NumberInput
                formik={lineFormik}
                label="LBL_ACCOUNTING_VALUE"
                accessor="accountingValue"
                mode={mode}
                isRequired={mode !== 'view'}
                disabled={mode === 'view'}
              />
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="float-end">
          <CloseButton onClick={() => setShow(false)} />
          {mode !== 'view' && <PurpleSaveButton onClick={saveLine} />}
          {mode === 'view' && canRealize && (
            <PurpleSaveButton
              text="LBL_POST"
              onClick={() => {
                setShow(false);
                onRealizeLine(line);
              }}
            />
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default DepreciationLineModal;
