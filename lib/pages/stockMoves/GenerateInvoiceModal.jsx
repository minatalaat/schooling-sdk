import { useEffect, useMemo, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { SpinnerCircular } from 'spinners-react';

import DropDown from '../../components/ui/inputs/DropDown';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';
import GenerateInvoiceStockLines from './GenerateInvoiceStockLines';

import { useAxiosFunction } from '../../hooks/useAxios';
import { getActionUrl } from '../../services/getUrl';
import { MODELS } from '../../constants/models';
import { parseFloatFixedTwo } from '../../utils/helpers';
import { generateInvoiceStockMovesLinesActions } from '../../store/generateInvoiceStockMovesLines';
import { VALID_TEXT_WITH_SPECIAL_CHARS } from '../../constants/regex/Regex';
import { alertsActions } from '../../store/alerts';
import { setFieldValue } from '../../utils/formHelpers';

const GenerateInvoiceModal = ({ show, setShow, submit, data, title }) => {
  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const generateInvoiceStockMovesLines = useSelector(state => state.generateInvoiceStockMovesLines.generateInvoiceStockMovesLines);
  const onGenerateInvoiceInitPayload = {
    model: MODELS.STOCK_MOVE,
    data: {
      context: {
        _id: data.id,
      },
    },
  };
  const initialValues = {
    invoiceChoice: '0',
  };

  const validationSchema = Yup.object({
    invoiceChoice: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')).trim().required(t('REQUIRED')),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: false,
  });

  let [invoiceChoices, setInvoiceChoices] = useState([
    { name: 'LBL_INVOICE_ALL', value: '1' },
    { name: 'LBL_INVOICE_PARTIALLY_STOCK_MOVE', value: '2' },
  ]);

  const onGenerateInvoiceInitSuccess = response => {
    if (response.data.status === 0) {
      if (response?.data?.data[0]?.values?.$stockMoveLines?.length > 0) {
        let dataValues = response.data.data[0].values.$stockMoveLines;
        let tempStockMoveLines = [];
        dataValues.forEach(line => {
          let tempStockMoveLine = {
            invoiceAll: false,
            realQty: parseFloatFixedTwo(line.realQty ?? ''),
            qtyInvoiced: parseFloatFixedTwo(line.qtyInvoiced ?? ''),
            productCode: line.productCode ? line.productCode : '',
            qtyToInvoice: parseFloatFixedTwo(line.qtyToInvoice ?? ''),
            remainingQty: parseFloatFixedTwo(line.remainingQty ?? ''),
            productName: line.productName ? line.productName : '',
            stockMoveLineId: line.stockMoveLineId ? line.stockMoveLineId : null,
          };
          tempStockMoveLines.push(tempStockMoveLine);
        });
        dispatch(generateInvoiceStockMovesLinesActions.setLines({ generateInvoiceStockMovesLines: tempStockMoveLines }));

        if (response?.data?.data[0]?.values?.operationSelect !== 1) {
          setInvoiceChoices([{ name: 'LBL_INVOICE_PARTIALLY_STOCK_MOVE', value: '2' }]);
          setFieldValue(formik, 'invoiceChoice', '2');
        } else {
          setFieldValue(formik, 'invoiceChoice', '1');
        }
      } else {
        dispatch(generateInvoiceStockMovesLinesActions.setLines({ generateInvoiceStockMovesLines: [] }));
      }
    } else {
      dispatch(generateInvoiceStockMovesLinesActions.setLines({ generateInvoiceStockMovesLines: [] }));
    }
  };

  useEffect(() => {
    if (import.meta.env.VITE_PROVIDER === 'wso2') {
      api(
        'POST',
        getActionUrl(),
        { ...onGenerateInvoiceInitPayload, action: 'action-get-stock-move-returnable-qty-total-for-invoice' },
        onGenerateInvoiceInitSuccess
      );
    } else {
      api(
        'POST',
        getActionUrl(),
        { ...onGenerateInvoiceInitPayload, action: 'action-get-stock-move-returnable-qty-total-for-invoice' },
        onGenerateInvoiceInitSuccess
      );
    }
  }, []);

  useEffect(() => {
    dispatch(
      generateInvoiceStockMovesLinesActions.setOperationTypeSelect({
        operationTypeSelect: formik.values.invoiceChoice,
      })
    );
  }, [formik.values.invoiceChoice]);

  const checkDisabled = useMemo(() => {
    return !(generateInvoiceStockMovesLines && generateInvoiceStockMovesLines.filter(line => Number(line.qtyToInvoice) > 0).length > 0);
  }, [generateInvoiceStockMovesLines]);

  return (
    <>
      {isLoading && (
        <div className="text-center">
          <SpinnerCircular size={70} thickness={120} speed={100} color="rgba(31, 79, 222, 1)" secondaryColor="rgba(153, 107, 229, 0.19)" />
        </div>
      )}
      {!isLoading && (
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
              {t('LBL_INVOICE')}
            </h5>
          </Modal.Header>
          <Modal.Body>
            <div className="container">
              <div className="row">
                <div className="col-md-6">
                  <DropDown
                    options={invoiceChoices}
                    formik={formik}
                    isRequired={true}
                    label="LBL_OPERATION_CHOICE"
                    accessor="invoiceChoice"
                    keys={{ valueKey: 'value', titleKey: 'name' }}
                    mode="add"
                  />
                </div>
                {formik.values.invoiceChoice === '2' && <GenerateInvoiceStockLines tableTitle={title} />}
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="float-end">
              <PrimaryButton theme="white" onClick={() => setShow(false)} />
              <PrimaryButton
                theme="purple"
                text="LBL_GENERATE_STOCK_INVOICE"
                onClick={() => {
                  if (formik.isValid && generateInvoiceStockMovesLines && generateInvoiceStockMovesLines.length > 0) {
                    setIsLoading(true);
                    submit();
                  } else {
                    dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'INVALID_FORM' }));
                  }
                }}
                disabled={formik.values.invoiceChoice === '1' ? false : checkDisabled}
              />
            </div>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

export default GenerateInvoiceModal;
