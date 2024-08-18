import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import TextInput from '../../components/ui/inputs/TextInput';
import NumberInput from '../../components/ui/inputs/NumberInput';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';

import { parseFloatFixedTwo } from '../../utils/helpers';
import { generateInvoiceStockMovesLinesActions } from '../../store/generateInvoiceStockMovesLines';

function GenerateInvoiceStockLineModal({ show, setShow, mode, header, line }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const generateInvoiceStockMovesLines = useSelector(state => state.generateInvoiceStockMovesLines.generateInvoiceStockMovesLines);

  const getMinQty = () => {
    if (generateInvoiceStockMovesLines?.length > 0) {
      for (let l of generateInvoiceStockMovesLines) {
        if (line?.stockMoveLineId === l?.stockMoveLineId) {
          continue;
        }

        if (Number(l.qtyToInvoice) > 0.0) {
          return Number(Number(0.0).toFixed(2));
        }
      }

      return Number(Number(0.01).toFixed(2));
    } else {
      return Number(Number(0.01).toFixed(2));
    }
  };

  const initialValues = {
    productCode: line?.productCode ?? '',
    productName: line?.productName ?? '',
    realQty: parseFloatFixedTwo(line?.realQty ?? 0.0),
    qtyInvoiced: parseFloatFixedTwo(line?.qtyInvoiced ?? 0.0),
    qtyToInvoice: parseFloatFixedTwo(line?.qtyToInvoice ?? 0.0),
    remainingQty: parseFloatFixedTwo(line?.remainingQty ?? 0.0),
  };

  const validationSchema = Yup.object({
    qtyToInvoice: Yup.number()
      .required(t('REQUIRED'))
      .min(getMinQty(), t('LBL_NUMBER_MUST_NOT_BE_LESS_THAN') + getMinQty())
      .max(Yup.ref('remainingQty'), t('LBL_ERROR_QTY_TO_BE_INVOICED_MORETHEN_REMAINING_QTY')),
  });

  const lineFormik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: false,
  });

  const saveLine = () => {
    if (lineFormik.isValid) {
      dispatch(
        generateInvoiceStockMovesLinesActions.editLine({
          stockMoveLineId: line.stockMoveLineId,
          generateInvoiceStockMovesLine: {
            invoiceAll: false,
            realQty: parseFloatFixedTwo(line.realQty ?? ''),
            qtyInvoiced: parseFloatFixedTwo(line.qtyInvoiced ?? ''),
            productCode: line.productCode ? line.productCode : '',
            qtyToInvoice: parseFloatFixedTwo(lineFormik.values.qtyToInvoice ?? ''),
            remainingQty: parseFloatFixedTwo(line.remainingQty ?? ''),
            productName: line.productName ? line.productName : '',
            stockMoveLineId: line.stockMoveLineId ? line.stockMoveLineId : null,
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
              <TextInput formik={lineFormik} label="LBL_PRODUCT_CODE" accessor="productCode" mode={mode} disabled={true} />
            </div>
            <div className="col-md-6">
              <TextInput formik={lineFormik} label="LBL_PRODUCT_NAME" accessor="productName" mode={mode} disabled={true} />
            </div>
            <div className="col-md-6">
              <NumberInput
                formik={lineFormik}
                label="LBL_QUANITY_TO_BE_INVOICED"
                accessor="qtyToInvoice"
                mode={mode}
                isRequired={mode === 'edit'}
              />
            </div>

            <div className="col-md-6">
              <NumberInput formik={lineFormik} label="LBL_QUANTITY_REMAINIG" accessor="remainingQty" mode={mode} disabled={true} />
            </div>
            <div className="col-md-6">
              <NumberInput formik={lineFormik} label="LBL_REAL_QTY" accessor="realQty" mode={mode} disabled={true} />
            </div>
            <div className="col-md-6">
              <NumberInput formik={lineFormik} label="LBL_INVOICED_QTY" accessor="qtyInvoiced" mode={mode} disabled={true} />
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="float-end">
          <PrimaryButton theme="white" onClick={() => setShow(false)} />
          {mode !== 'view' && <PrimaryButton theme="purple" onClick={saveLine} />}
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default GenerateInvoiceStockLineModal;
