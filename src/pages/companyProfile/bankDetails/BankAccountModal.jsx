import { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { SpinnerCircular } from 'spinners-react';

import PrimaryButton from '../../../components/ui/buttons/PrimaryButton';
import BankAccountInfo from './BankAccountInfo';
import IBANInfo from './IBANInfo';

import { useAxiosFunction } from '../../../hooks/useAxios';
import { MODELS } from '../../../constants/models';
import { bankDetailsActions } from '../../../store/bankDetails';
import { SA_IBAN } from '../../../constants/regex/Regex';
import { getSearchUrl, getActionUrl } from '../../../services/getUrl';
import { PARTNER_FIELDS } from './BankDetailsFields';
import { checkFlashOrError } from '../../../utils/helpers';
import { VALID_TEXT_WITH_SPECIAL_CHARS } from '../../../constants/regex/Regex';
import { alertsActions } from '../../../store/alerts';

const BankAccountModal = ({ show, setShow, companyID, companyName, companyCode, companyPartner, mode, lineId }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { api } = useAxiosFunction();

  const [isLoading, setIsLoading] = useState(false);

  const [bankAccountsIDs, setBankAccountsIDs] = useState([]);

  let bankDetails = useSelector(state => state.bankDetails.bankDetails);

  const initVals = {
    partner: null,
    ownerName: '',
    label: '',
    currency: null,
    bankAccount: null,
    active: true,
    iban: '',
    bankDetailsTypeSelect: 1,
    bic: null,
    bankAddress: null,
  };

  const valSchema = Yup.object().shape({
    ownerName: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')),
    label: Yup.string()
      .matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS'))
      .trim()
      .required(t('LBL_DISPLAY_NAME_REQUIRED')),
    iban: Yup.string()
      .matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS'))
      .trim()
      .required(t('LBL_IBAN_REQUIRED'))
      .when('bankDetailsTypeSelect', {
        is: 1,
        then: Yup.string()
          .matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS'))
          .trim()
          .min(24, t('LBL_IBAN_LENGTH_ERROR'))
          .max(24, t('LBL_IBAN_LENGTH_ERROR'))
          .matches(SA_IBAN, t('LBL_INVALID_IBAN')),
      }),

    bankAddress: Yup.object().nullable().required(t('LBL_SWIFT_ADDRESS_REQUIRED')),
    bankAccount: Yup.object().nullable().required(t('LBL_ACCOUNT_REQUIRED')),
    bic: Yup.object().nullable().required(t('LBL_BIC_REQUIRED')),
    currency: Yup.object().nullable(),
    active: Yup.boolean(),
    bankDetailsTypeSelect: Yup.number(t('LBL_INVALID_NUMBER_VALUE')),
  });

  const submit = values => {
    if (formik.isValid) {
      setIsLoading(true);
      onIBANChange();
    } else {
      alertHandler('Error', t('LBL_ERROR_SAVING_BANK_ACCOUNT'));
    }
  };

  const formik = useFormik({
    initialValues: initVals,
    validationSchema: valSchema,
    onSubmit: submit,
  });

  const alertHandler = (title, message) => {
    dispatch(alertsActions.initiateAlert({ title, message }));
    setIsLoading(false);
  };

  useEffect(() => {
    if (mode === 'add') {
      getPartners();
    } else {
      setFormikFieldsOfAccount();
    }
  }, []);

  useEffect(() => {
    let tempIDs = [];
    bankDetails.forEach(bankDetail => {
      if (bankDetail.bankAccount) tempIDs.push(bankDetail.bankAccount.id);
    });
    if (tempIDs.length === 0) tempIDs.push(-1);
    setBankAccountsIDs(tempIDs);
  }, [bankDetails]);

  const setFormikFieldsOfAccount = () => {
    let data = bankDetails.filter(detail => detail.lineId === lineId)[0];
    formik.setValues({
      partner: data?.partner ?? null,
      ownerName: data?.ownerName ?? '',
      label: data?.label ?? '',
      currency: data?.currency ?? null,
      bankAccount: data?.bankAccount ?? null,
      bic: data?.bank ?? null,
      active: data.active,
      iban: data.iban,
      bankDetailsTypeSelect: data?.bank?.bankDetailsTypeSelect ?? 1,
      bankAddress: data?.bankAddress ?? null,
      version: data.version,
      id: data.id ?? -1,
      lineId: data.lineId,
    });
  };

  const getPartnerSearchPayload = () => {
    let payload = {
      fields: PARTNER_FIELDS,
      sortBy: ['name'],
      data: {
        _domain: 'self.isContact = false',
        _domainContext: {
          company: {
            id: companyID,
          },
          _model: MODELS.BANK_DETAILS,
        },
        operator: 'and',
        criteria: [],
      },
      limit: -1,
      offset: 0,
      translate: true,
    };
    return payload;
  };

  const getPartners = () => {
    api('POST', getSearchUrl(MODELS.PARTNER), getPartnerSearchPayload(), onPartnersSuccess, {});
  };

  const onPartnersSuccess = response => {
    let status = response.data.status;
    let data = response.data.data;
    let total = response.data.total;

    if (status !== 0 || total === undefined || total === null || !data) {
      return alertHandler('Error', t('LBL_ERROR_LOADING_NEW_BANK_ACCOUNT'));
    }

    if (data) {
      let selectedPartner = data.filter(partner => partner.id === companyPartner?.id || 1)[0];
      formik.setFieldValue('partner', selectedPartner);
      getOwnerName();
    }
  };

  const getOwnerNamePayload = () => {
    let payload = {
      model: MODELS.BANK_DETAILS,
      action: 'action-set-owner-name,action-bank-details-attrs-specific-notes',
      data: {
        criteria: [],
        context: {
          _model: MODELS.BANK_DETAILS,
          partner: companyPartner,
        },
      },
    };
    return payload;
  };

  const getOwnerName = async () => {
    const response = await api('POST', getActionUrl(), getOwnerNamePayload());
    let status = response.data.status;
    let data = response.data.data;
    if (status !== 0) return alertHandler('Error', t('LBL_ERROR_LOADING_OWNER_NAME'));

    if (data && checkFlashOrError(data)) {
      return alertHandler('Error', t('LBL_ERROR_LOADING_OWNER_NAME'));
    }

    if (data && data[0] && data[0].values) {
      formik.setFieldValue('ownerName', data[0].values.ownerName);
    }
  };

  const onIBANChangePayload = () => {
    let payload = {
      model: MODELS.BANK_DETAILS,
      action: 'action-group-account-bankdetails-iban-onchange',
      data: {
        criteria: [],
        context: {
          _model: MODELS.BANK_DETAILS,
          active: true,
          'bank.bankDetailsTypeSelect': formik.values.bic.bankDetailsTypeSelect,
          company: {
            parent: null,
            id: companyID,
            code: companyCode,
            name: companyName,
            partner: companyPartner,
          },
          bank: {
            id: formik.values.bic.id,
            code: formik.values.bic.code,
            bankDetailsTypeSelect: formik.values.bic.bankDetailsTypeSelect,
            'country.alpha2Code': formik.values.bic['country.alpha2Code'],
          },
          bankAddress: null,
          iban: formik.values.iban,
        },
      },
    };
    return payload;
  };

  const onIBANChange = async () => {
    const response = await api('POST', getActionUrl(), onIBANChangePayload());
    let status = response.data.status;
    let data = response.data.data;
    if (status !== 0) return alertHandler('Error', t('LBL_ERROR_SAVING_BANK_ACCOUNT'));

    if (data) {
      let details = {};

      if (data[0] && data[0].values) {
        details = data[0].values;
      }

      let newBankDetails = {
        active: formik.values.active,
        'bank.code': formik.values.bic?.code,
        bic: formik.values.bic,
        iban: formik.values.iban,
        ownerName: formik.values.ownerName,
        label: formik.values.label,
        id: formik.values.id > 0 ? formik.values.id : null,
        lineId: formik.values.lineId,
        version: formik.values.version >= 0 ? formik.values.version : undefined,
        balance: '0',
        partner: formik.values.partner,
        currency: formik.values.currency,
        journal: null,
        'bank.bankDetailsTypeSelect': formik.values.bankDetailsTypeSelect,
        bank: formik.values.bic,
        bankAccount: formik.values.bankAccount,
        bankAddress: formik.values.bankAddress,
        code: null,
        accountNbr: details.accountNbr ? details.accountNbr : null,
        bankCode: details.bankCode ? details.bankCode : null,
        bbanKey: details.bbanKey ? details.bbanKey : null,
        sortCode: details.sortCode ? details.sortCode : null,
      };

      if (mode === 'add') {
        newBankDetails.lineId = uuidv4();
        dispatch(bankDetailsActions.addBankDetail({ bankDetail: newBankDetails }));
        setIsLoading(false);
        setShow(false);
      } else {
        dispatch(bankDetailsActions.editBankDetail({ lineId: lineId, bankDetail: newBankDetails }));
        setIsLoading(false);
        setShow(false);
      }
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
          {t('LBL_BANK_DETAILS')}
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
            <BankAccountInfo
              formik={formik}
              alertHandler={alertHandler}
              bankAccountsIDs={bankAccountsIDs}
              companyID={companyID}
              mode={mode}
            />
            <IBANInfo formik={formik} alertHandler={alertHandler} mode={mode} />
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <div className="float-end">
          <PrimaryButton theme="white" onClick={() => setShow(false)} />
          {mode !== 'view' && <PrimaryButton theme="purple" onClick={submit} />}
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default BankAccountModal;
