import { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { SpinnerCircular } from 'spinners-react';
import { useDispatch } from 'react-redux';

import TextInput from '../../../components/ui/inputs/TextInput';

import { useAxiosFunction } from '../../../hooks/useAxios';
import { MODELS } from '../../../constants/models';
import { getActionUrl, getModelUrl, getFetchUrl } from '../../../services/getUrl';
import { BANK_FIELDS, RELATED_FIELDS } from './BankDetailsFields';
import { VALID_TEXT_WITH_SPECIAL_CHARS, VALID_SAUDI_SWIFT_CODE } from '../../../constants/regex/Regex';
import { alertsActions } from '../../../store/alerts';

const AddBankIdentifier = props => {
  let { onValidate, isSave, finshedSaveHandler, closeModalHandler, formik } = props;
  const mode = 'add';

  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);

  const alertHandler = (title, message) => {
    setIsLoading(false);
    dispatch(alertsActions.initiateAlert({ title, message }));
  };

  const initVals = {
    id: '',
    bankName: '',
    bankDetailsID: 1,
    code: '',
    address: '',
    fullAddress: '',
  };

  const valSchema = Yup.object().shape({
    bankName: Yup.string()
      .trim()
      .matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS'))
      .required(t('LBL_BANK_NAME_REQUIRED')),
    code: Yup.string().trim().required(t('LBL_SWIFT_CODE_REQUIRED')).matches(VALID_SAUDI_SWIFT_CODE, t('LBL_INVALID_SWIFT_CODE')),
    address: Yup.string().trim().required(t('LBL_ADDRESS_REQUIRED')),
  });

  const submit = values => {};

  const formikBIC = useFormik({
    initialValues: initVals,
    validationSchema: valSchema,
    onSubmit: submit,
  });

  const onSaveError = () => {
    alertHandler('Error', t('LBL_ERROR_SAVING_BIC'));
  };

  const saveBankDetailsPayload = () => {
    let payload = {
      data: {
        bankDetailsTypeSelect: formikBIC.values.bankDetailsID,
        code: formikBIC.values.code,
        bankName: formikBIC.values.bankName,
        bankAddressList: [
          {
            code: formikBIC.values.code,
            address: formikBIC.values.address,
            fullAddress: formikBIC.values.fullAddress,
          },
        ],
      },
    };
    return payload;
  };

  const onSaveBankSuccess = response => {
    let status = response.data.status;
    let data = response.data.data;
    if (status !== 0 || !data) return onSaveError(response);

    if (data && data[0]) {
      fetchBank(data[0].id);
    }
  };

  const fetchBankPayload = () => {
    let payload = {
      fields: BANK_FIELDS,
      related: {
        bankAddressList: RELATED_FIELDS,
      },
    };
    return payload;
  };

  const fetchBank = async id => {
    const response = await api('POST', getFetchUrl(MODELS.BANK, id), fetchBankPayload());
    let status = response.data.status;
    let data = response.data.data;
    if (status !== 0 || !data) return alertHandler('Error', t('LBL_ERROR_SAVING_BIC'));

    if (data && data[0]) {
      let bankAddressList = data[0].bankAddressList;

      formik.setFieldValue('bankAddress', {
        id: bankAddressList[0].id,
        code: formikBIC.values.code,
        fullAddress: formikBIC.values.fullAddress,
      });
      setIsLoading(false);
      finshedSaveHandler(data[0]);
      closeModalHandler();
    }
  };

  const getBankAddressFullNamePayload = () => {
    let payload = {
      model: MODELS.BANK_ADDRESS,
      action: 'action-method-bank-address-fill-full-name',
      data: {
        criteria: [],
        context: {
          _model: MODELS.BANK_ADDRESS,
          code: formikBIC.values.code,
          address: formikBIC.values.address,
          fullAddress: formikBIC.values.fullAddress,
          _source: 'label',
        },
      },
    };
    return payload;
  };

  const getBankAddressFullName = async () => {
    const response = await api('POST', getActionUrl(), getBankAddressFullNamePayload());
    let status = response.data.status;
    let data = response.data.data;
    if (status !== 0) return alertHandler('Error', t('LBL_ERROR_SAVING_PRODUCT'));

    if (data) {
      if (data[0] && data[0].values && data[0].values.fullAddress) {
        let selectedBankAddress = data[0].values;
        formikBIC.setFieldValue('fullAddress', selectedBankAddress.fullAddress);
      }
    }
  };

  useEffect(() => {
    if (isSave) {
      if (formikBIC.isValid) {
        setIsLoading(true);
        api('POST', getModelUrl(MODELS.BANK), saveBankDetailsPayload(), onSaveBankSuccess, onSaveError);
      } else {
        onSaveError();
      }
    }
  }, [isSave]);

  useEffect(() => {
    if (onValidate) onValidate(formikBIC.isValid);
  }, [formikBIC.isValid]);

  return (
    <>
      {isLoading && (
        <div className="text-center">
          <SpinnerCircular size={70} thickness={120} speed={100} color="rgba(31, 79, 222, 1)" secondaryColor="rgba(153, 107, 229, 0.19)" />
        </div>
      )}
      {!isLoading && (
        <>
          <div className="row">
            <div className="col-md-6">
              <TextInput formik={formikBIC} label="LBL_BANK_NAME" accessor="bankName" isRequired={true} mode={mode} />
            </div>
            <div className="col-md-6"></div>
            <div className="col-md-6">
              <TextInput
                formik={formikBIC}
                label="LBL_SWIFT_CODE"
                accessor="code"
                isRequired={true}
                mode={mode}
                onBlur={e => {
                  formikBIC.handleBlur('code')(e);
                  getBankAddressFullName();
                }}
              />
            </div>
            <div className="col-md-6">
              <TextInput
                formik={formikBIC}
                label="LBL_ADDRESS"
                accessor="address"
                isRequired={true}
                mode={mode}
                onBlur={e => {
                  formikBIC.handleBlur('address')(e);
                  getBankAddressFullName();
                }}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default AddBankIdentifier;
