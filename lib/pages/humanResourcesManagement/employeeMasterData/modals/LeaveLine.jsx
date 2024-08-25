import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from 'react-bootstrap';
import * as Yup from 'yup';
import { useFormik } from 'formik';

import SearchModalAxelor from '../../../../components/ui/inputs/SearchModal/SearchModalAxelor';
import TextInput from '../../../../components/ui/inputs/TextInput';
import PrimaryButton from '../../../../components/ui/buttons/PrimaryButton';

export default function LeaveLine({ showConfiguration, setShowConfiguration, data, checked, setChecked, parentFormik, edit }) {
  const { t } = useTranslation();

  const initialValues = {
    leaveReason: checked?.leaveReason || null,
    quantity: checked?.quantity || '0.00',
    totalQuantity: checked?.totalQuantity || '0.00',
    daysValidated: checked?.daysValidated || '0.00',
    leaveManagementList: checked?.leaveManagementList || null,
    daysToValidate: checked?.daysToValidate || '0.00',
  };
  const validationSchema = Yup.object({
    leaveReason: Yup.object().nullable().required(t('REQUIRED')),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: true,
  });

  const handleSaveConfiguration = () => {
    // if (formik.isValid) {
    //   const companyObject = company;
    //   if (edit) {
    //     let tempConfigurations = [...configurationList];
    //     let selectedConfiguration = tempConfigurations.findIndex(conf => (checked ? conf.lineId === checked.lineId : false));
    //     if (selectedConfiguration === -1)
    //       selectedConfiguration = tempConfigurations.findIndex(conf => (checked ? conf.id === checked.id : false));
    //     if (selectedConfiguration !== -1) {
    //       tempConfigurations[selectedConfiguration] = {
    //         ...tempConfigurations[selectedConfiguration],
    //         id: tempConfigurations[selectedConfiguration].id ? tempConfigurations[selectedConfiguration].id : null,
    //         lineId: tempConfigurations[selectedConfiguration].lineId ? tempConfigurations[selectedConfiguration].lineId : null,
    //         selected: false,
    //         typeSelect: 3,
    //         company: companyObject ? companyObject : null,
    //         bankDetails: formik.values.bankDetails ? (formik.values.bankDetails ? formik.values.bankDetails : checked.bankDetails) : null,
    //         journal: formik.values.journal ? (formik.values.journal ? formik.values.journal : checked.journal) : null,
    //         cashAccount: formik.values.cashAccount ? (formik.values.cashAccount ? formik.values.cashAccount : checked.cashAccount) : null,
    //         sequence: formik.values.sequence ? (formik.values.sequence ? formik.values.sequence : checked.sequence) : null,
    //       };
    //       if (tempConfigurations[selectedConfiguration].id)
    //         tempConfigurations[selectedConfiguration] = {
    //           ...tempConfigurations[selectedConfiguration],
    //           version: tempConfigurations[selectedConfiguration].version ? tempConfigurations[selectedConfiguration].version : 0,
    //         };
    //       setConfigurationList([...tempConfigurations]);
    //       setChecked({ ...tempConfigurations[selectedConfiguration] });
    //     }
    //   } else {
    //     if (configurationList) {
    //       setConfigurationList([
    //         ...configurationList,
    //         {
    //           id: null,
    //           lineId: Math.floor(Math.random() * 10 + 1),
    //           selected: false,
    //           typeSelect: 3,
    //           company: companyObject ? companyObject : null,
    //           bankDetails: formik.values.bankDetails ? formik.values.bankDetails : null,
    //           journal: formik.values.journal ? formik.values.journal : null,
    //           cashAccount: formik.values.cashAccount ? formik.values.cashAccount : null,
    //           sequence: formik.values.sequence ? formik.values.sequence : null,
    //         },
    //       ]);
    //     } else {
    //       setConfigurationList([
    //         {
    //           id: null,
    //           lineId: Math.floor(Math.random() * 10 + 1),
    //           selected: false,
    //           typeSelect: 3,
    //           company: companyObject ? companyObject : null,
    //           bankDetails: formik.values.bankDetails ? formik.values.bankDetails : null,
    //           journal: formik.values.journal ? formik.values.journal : null,
    //           cashAccount: formik.values.cashAccount ? formik.values.cashAccount : null,
    //           sequence: formik.values.sequence ? formik.values.sequence : null,
    //         },
    //       ]);
    //     }
    //   }
    //   setShowConfiguration(false);
    // } else {
    //   alerthandler('Error', t('INVALID_FORM'));
    // }
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
      show={showConfiguration}
      onHide={() => setShowConfiguration(false)}
      dialogClassName="modal-90w"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      size="xl"
      id="add-new-line"
    >
      <Modal.Header>
        <h5 className="modal-title" id="add-new-conf">
          {t('LBL_LEAVE_LINE')}
        </h5>
        <button type="button" className="btn-close" onClick={() => setShowConfiguration(false)}></button>
      </Modal.Header>
      <Modal.Body className="modal-body">
        <div className="row">
          <div className="col-md-6">
            <SearchModalAxelor
              formik={formik}
              modelKey="LEAVE_REASONS"
              mode={!edit ? 'add' : 'edit'}
              isRequired={true}
              defaultValueConfig={null}
              payloadDomain="self.manageAccumulation = true"
            />
          </div>
          <div className="col-md-6">
            <TextInput formik={formik} label="LBL_REMAINING" accessor="quantity" mode="view" />
          </div>

          <div className="col-md-4">
            <TextInput formik={formik} label="LBL_WAITING_FOR_VALIDATION" accessor="daysToValidate" mode="view" />
          </div>
          <div className="col-md-4">
            <TextInput formik={formik} label="LBL_VALIDATED" accessor="daysValidated" mode="view" />
          </div>
          <div className="col-md-4">
            <TextInput formik={formik} label="LBL_TOTAL" accessor="totalQuantity" mode="view" />
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="float-end">
          <PrimaryButton theme="white" onClick={() => setShowConfiguration(false)} />
          <PrimaryButton theme="purple" onClick={handleSaveConfiguration} disabled={!formik.isValid} />
        </div>
      </Modal.Footer>
    </Modal>
  );
}
