import { useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { SpinnerCircular } from 'spinners-react';

import PrimaryButton from '../../components/ui/buttons/PrimaryButton';
import CheckboxInput from '../../components/ui/inputs/CheckboxInput';
import DateInput from '../../components/ui/inputs/DateInput';
import FormNotes from '../../components/ui/FormNotes';

import { useAxiosFunction } from '../../hooks/useAxios';
import { getActionUrl } from '../../services/getUrl';
import { MODELS } from '../../constants/models';
import { setFieldValue, setSelectedValues } from '../../utils/formHelpers';

const ReverseModal = ({ fetchedMove, reverseModalFormik, show, setShow, submit, isLoading, setIsLoading, alertHandler }) => {
  const { t } = useTranslation();
  const { api } = useAxiosFunction();

  const today = new Date();
  let tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  useEffect(() => {
    reverseJournal();
  }, []);

  const reverseJournal = async () => {
    setIsLoading(true);
    const response = await api('POST', getActionUrl(), {
      model: MODELS.MOVE,
      action: 'action-move-attrs-set-generate-reverse-wizard-defaults,com.axelor.meta.web.MetaController:moreAttrs',
      data: {
        criteria: [],
        context: {
          _model: MODELS.MOVE,
          _moveDate: fetchedMove.date,
          _id: fetchedMove.id,
          date: fetchedMove.date,
          accountingDate: fetchedMove.accountingDate,
        },
      },
    });
    setIsLoading(false);
    let status = response.data.status;
    let data = response.data.data;
    if (status !== 0) return alertHandler('Error', 'LBL_ERROR_LOADING_MOVE');

    if (!data) {
      return alertHandler('Error', 'LBL_ERROR_LOADING_MOVE');
    }

    if (data) {
      data.forEach(attr => {
        setSelectedValues(reverseModalFormik, {
          autoReconcile: attr?.attrs?.isAutomaticReconcile?.value ?? false,
          autoAccounting: attr?.attrs?.isAutomaticAccounting?.value ?? false,
          hideMoveLines: attr?.attrs?.isHiddenMoveLinesInBankReconciliation?.value ?? false,
          unReconsileOrginalMove: attr?.attrs?.isUnreconcileOriginalMove?.value ?? false,
          dateOfReversionSelect: attr?.attrs?.dateOfReversionSelect?.value.toString() ?? '2',
          dateOfReversion: attr?.attrs?.dateOfReversion?.value ?? '',
        });
      });
    }
  };

  const onTypeChange = () => {
    if (reverseModalFormik.values.dateOfReversionSelect === '1') {
      setFieldValue(reverseModalFormik, 'dateOfReversion', moment(today).locale('en').format('YYYY-MM-DD'));
    } else if (reverseModalFormik.values.dateOfReversionSelect === '2') {
      setFieldValue(reverseModalFormik, 'dateOfReversion', fetchedMove.date);
    } else if (reverseModalFormik.values.dateOfReversionSelect === '3') {
      setFieldValue(reverseModalFormik, 'dateOfReversion', moment(tomorrow).locale('en').format('YYYY-MM-DD'));
    }
  };

  useEffect(() => {
    onTypeChange();
  }, [reverseModalFormik.values.dateOfReversionSelect]);

  return (
    <Modal
      id="add-new-line"
      show={show}
      onHide={() => setShow(false)}
      dialogClassName="modal-90w"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      size="lg"
    >
      <Modal.Header>
        <h5 className="modal-title" id="add-new-line">
          {t('LBL_REVERSE_MOVE')}
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
          <>
            <div className="row">
              <div className="col-md-6">
                <CheckboxInput
                  formik={reverseModalFormik}
                  label="LBL_AUTOMATIC_RECONCILE"
                  accessor="autoReconcile"
                  mode="add"
                  isOnlyCheckboxesInRow={true}
                />
              </div>
              <div className="col-md-6">
                <CheckboxInput
                  formik={reverseModalFormik}
                  label="LBL_AUTOMATIC_ACCOUNTING"
                  accessor="autoAccounting"
                  mode="add"
                  isOnlyCheckboxesInRow={true}
                />
              </div>
              <div className="col-md-6">
                <CheckboxInput
                  formik={reverseModalFormik}
                  label="LBL_UNRECONCILE_ORIGINAL_MOVE"
                  accessor="unReconsileOrginalMove"
                  mode="add"
                  isOnlyCheckboxesInRow={true}
                />
              </div>
              <div className="col-md-6">
                <CheckboxInput
                  formik={reverseModalFormik}
                  label="LBL_HIDE_MOVELINES_IN_BANK_RECONCILATION"
                  accessor="hideMoveLines"
                  mode="add"
                  isOnlyCheckboxesInRow={true}
                />
              </div>
            </div>

            <div className="titlesection-popup">
              <h4>{t('LBL_DATE_OF_REVERSION')}</h4>
            </div>

            <div className="col-md-12">
              <div className="form-group">
                <select
                  className="form-select"
                  aria-label="Default select example"
                  name="dateOfReversionSelect"
                  value={reverseModalFormik.values.dateOfReversionSelect}
                  onChange={reverseModalFormik.handleChange}
                  onBlur={reverseModalFormik.handleBlur}
                >
                  <option value="1">{t('LBL_TODAY')}</option>
                  <option value="2">{t('LBL_DATE_OF_ORIGINAL_JOURNAL')}</option>
                  <option value="3">{t('LBL_TODAY')}+1</option>
                  <option value="4">{t('LBL_SELECT_DATE')}</option>
                </select>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <DateInput
                  formik={reverseModalFormik}
                  label="LBL_DATE_OF_REVERSION"
                  accessor="dateOfReversion"
                  mode="add"
                  disabled={!(reverseModalFormik.values.dateOfReversionSelect === '4')}
                  isRequired={true}
                  min={fetchedMove?.date}
                />
              </div>
            </div>
            <FormNotes
              notes={[
                {
                  title: 'LBL_REQUIRED_NOTIFY',
                  type: 3,
                },
              ]}
            />
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <div className="float-end">
          <PrimaryButton theme="white" onClick={() => setShow(false)} disabled={isLoading} />
          <PrimaryButton
            theme="purple"
            text="LBL_REVERSE"
            onClick={() => {
              setIsLoading(true);
              submit();
            }}
            disabled={isLoading || !reverseModalFormik.isValid}
          />
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ReverseModal;
