import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from 'react-bootstrap';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { useDispatch } from 'react-redux';

import SearchModalAxelor from '../../components/ui/inputs/SearchModal/SearchModalAxelor';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';

import { MODELS } from '../../constants/models';
import { setFieldValue } from '../../utils/formHelpers';
import { useMainAxelorServices } from '../../services/apis/useMainAxelorServices';
import { alertsActions } from '../../store/alerts';
import { useFormikSubmit } from '../../hooks/useFormikSubmit';
import FormNotes from '../../components/ui/FormNotes';

export default function PeriodModal({
  showConfiguration,
  setShowConfiguration,
  data,
  checked,
  setChecked,
  configurationList,
  setConfigurationList,
  edit,
}) {
  const { t } = useTranslation();
  const { searchService } = useMainAxelorServices();
  const dispatch = useDispatch();

  const company = useSelector(state => state.userFeatures.companyInfo.company);

  const initialValues = {
    bankDetails: edit && checked ? checked?.bankDetails || null : null,
    journal: edit && checked ? checked?.journal || null : null,
    cashAccount: edit && checked ? checked?.cashAccount || null : null,
  };
  const validationSchema = Yup.object({
    bankDetails: Yup.object().nullable().required(t('REQUIRED')),
    cashAccount: Yup.object().nullable().required(t('REQUIRED')),
    journal: Yup.object().nullable().required(t('REQUIRED')),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: true,
  });

  const { validateFormForSubmit } = useFormikSubmit(formik, undefined, 'modal');

  const domainContext = useMemo(() => {
    const companyObject = company;
    return checked
      ? {
          ...checked,
          id: checked.id ? checked.id : null,
          _form: true,
          _model: MODELS.ACCOUNT_MANAGEMENT,
          _parent: data ? { ...data, _model: MODELS.PAYMENTMODES } : { id: null, _model: MODELS.PAYMENTMODES },
        }
      : {
          company: companyObject ? companyObject : null,
          id: null,
          typeSelect: 3,
          version: null,
          _form: true,
          _model: MODELS.ACCOUNT_MANAGEMENT,
          _parent: data ? { ...data, _model: MODELS.PAYMENTMODES } : { id: null, _model: MODELS.PAYMENTMODES },
        };
  }, [checked, data]);

  const onBankDetailsSuccess = res => {
    if (res.data.status === 0) {
      if (!res.data.data || (res.data.data && res.data.data.length === 0)) {
        return alertHandler('Error', t('ERROR_ADD_BANK_DETAILS'));
      }

      let data = res.data.data;
      let tempData = [];

      if (data) {
        data.forEach(acc => {
          tempData.push({
            bic: acc['bank.code'],
            ownerName: acc.ownerName,
            iban: acc.iban,
            active: acc.active,
            id: acc.id,
            version: acc.version,
            swiftAddress: acc.bankAddress ? acc.bankAddress.fullAddress : '',
            bankAccount: acc.bankAccount,
            fullName: acc.fullName ? acc.fullName : '',
            'bankAccount.label': acc['bankAccount.label'],
          });
        });
      }

      return { displayedData: [...(tempData || [])], total: res.data.total || 0 };
    } else {
      alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    }
  };

  const alertHandler = (title, message) => dispatch(alertsActions.initiateAlert({ title, message }));

  const handleSaveConfiguration = async () => {
    const isValid = await validateFormForSubmit();
    if (!isValid) return null;

    const companyObject = company;

    if (edit) {
      let tempConfigurations = [...configurationList];
      let selectedConfiguration = tempConfigurations.findIndex(conf => (checked ? conf.lineId === checked.lineId : false));
      if (selectedConfiguration === -1)
        selectedConfiguration = tempConfigurations.findIndex(conf => (checked ? conf.id === checked.id : false));

      if (selectedConfiguration !== -1) {
        tempConfigurations[selectedConfiguration] = {
          ...tempConfigurations[selectedConfiguration],
          id: tempConfigurations[selectedConfiguration].id ? tempConfigurations[selectedConfiguration].id : null,
          lineId: tempConfigurations[selectedConfiguration].lineId ? tempConfigurations[selectedConfiguration].lineId : null,
          selected: false,
          typeSelect: 3,
          company: companyObject ? companyObject : null,
          bankDetails: formik.values.bankDetails ? (formik.values.bankDetails ? formik.values.bankDetails : checked.bankDetails) : null,
          journal: formik.values.journal ? (formik.values.journal ? formik.values.journal : checked.journal) : null,
          cashAccount: formik.values.cashAccount ? (formik.values.cashAccount ? formik.values.cashAccount : checked.cashAccount) : null,
          sequence: checked?.sequence || null,
        };
        if (tempConfigurations[selectedConfiguration].id)
          tempConfigurations[selectedConfiguration] = {
            ...tempConfigurations[selectedConfiguration],
            version: tempConfigurations[selectedConfiguration].version ? tempConfigurations[selectedConfiguration].version : 0,
          };
        setConfigurationList([...tempConfigurations]);
        setChecked({ ...tempConfigurations[selectedConfiguration] });
      }
    } else {
      const sequenceResponse = await searchService(MODELS.SEQUENCE, {
        fields: ['fullName'],
        sortBy: null,
        data: {
          _domain: "self.company = :company  AND self.codeSelect='paymentVoucher' AND self.fullName='PVXXXXX - Payment voucher'",
          _domainContext: {
            company: company,
            id: null,
            typeSelect: 3,
            version: null,
            _form: true,
            _model: MODELS.ACCOUNT_MANAGEMENT,
            _parent: { _model: MODELS.PAYMENTMODES },
          },
          operator: 'and',
          criteria: [],
        },
        limit: 1,
        offset: 0,
        translate: true,
      });

      if (configurationList) {
        setConfigurationList([
          ...configurationList,
          {
            id: null,
            lineId: uuidv4(),
            selected: false,
            typeSelect: 3,
            company: companyObject ? companyObject : null,
            bankDetails: formik.values.bankDetails ? formik.values.bankDetails : null,
            journal: formik.values.journal ? formik.values.journal : null,
            cashAccount: formik.values.cashAccount ? formik.values.cashAccount : null,
            sequence: sequenceResponse[0] || null,
          },
        ]);
      } else {
        setConfigurationList([
          {
            id: null,
            lineId: uuidv4(),
            selected: false,
            typeSelect: 3,
            company: companyObject ? companyObject : null,
            bankDetails: formik.values.bankDetails ? formik.values.bankDetails : null,
            journal: formik.values.journal ? formik.values.journal : null,
            cashAccount: formik.values.cashAccount ? formik.values.cashAccount : null,
            sequence: sequenceResponse[0] || null,
          },
        ]);
      }
    }

    setShowConfiguration(false);
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

  const onBankDetailsSelect = bankDetails => {
    if (bankDetails?.bankAccount) setFieldValue(formik, 'cashAccount', bankDetails.bankAccount);
    else setFieldValue(formik, 'cashAccount', null);
  };

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
          {t('LBL_ACCOUNTING_CONFIGURATION')}
        </h5>
        <button type="button" className="btn-close" onClick={() => setShowConfiguration(false)}></button>
      </Modal.Header>
      <Modal.Body className="modal-body">
        <div className="row">
          <div className="col-md-6">
            <SearchModalAxelor
              formik={formik}
              modelKey="BANK_DETAILS"
              mode={!edit ? 'add' : 'edit'}
              onSuccess={onBankDetailsSuccess}
              tooltip="bankDetails"
              isRequired={true}
              payloadDomain="self.active = true"
              payloadDomainContext={domainContext}
              selectIdentifier="fullName"
              defaultValueConfig={null}
              extraFields={['bankAccount', 'bankAccount.label']}
              selectCallback={onBankDetailsSelect}
            />
          </div>
          <div className="col-md-6">
            <SearchModalAxelor
              formik={formik}
              modelKey="JOURNALS"
              mode={!edit ? 'add' : 'edit'}
              payloadDomain="self.company = :company AND self.statusSelect = 1"
              payloadDomainContext={domainContext}
              isRequired={true}
              defaultValueConfig={null}
            />
          </div>
          {formik.values.bankDetails && (
            <div className="col-md-12">
              <SearchModalAxelor
                formik={formik}
                modelKey="CASH_ACCOUNTS"
                mode="view"
                payloadDomain="self.statusSelect = 1 AND self.company = :company AND self.accountType.technicalTypeSelect = 'cash'"
                payloadDomainContext={domainContext}
                isRequired={true}
                selectIdentifier="label"
                defaultValueConfig={null}
              />
            </div>
          )}
          {edit && (
            <FormNotes
              notes={[
                {
                  title: 'LBL_REQUIRED_NOTIFY',
                  type: 3,
                },
              ]}
            />
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="float-end">
          <PrimaryButton theme="white" onClick={() => setShowConfiguration(false)} />
          <PrimaryButton theme="purple" onClick={handleSaveConfiguration} />
        </div>
      </Modal.Footer>
    </Modal>
  );
}
