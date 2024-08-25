import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import TextInput from '../../../components/ui/inputs/TextInput';
import SearchModalAxelor from '../../../components/ui/inputs/SearchModal/SearchModalAxelor';
import AddBankIdentifier from './AddBankIdentifier';

import { BANK_DETAILS_IDS } from '../../../constants/enums/BankEnums';
import { MODELS } from '../../../constants/models';
import { getActionUrl } from '../../../services/getUrl';
import { checkFlashOrError } from '../../../utils/helpers';
import { useAxiosFunction } from '../../../hooks/useAxios';
import BorderSection from '../../../components/ui/inputs/BorderSection';

const IBANInfo = ({ formik, alertHandler, mode }) => {
  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  const [addressDomain, setAddressDomain] = useState([]);

  useEffect(() => {
    if (formik.values.bankAddress && !formik.values.bankAddress?.fullAddress?.includes(formik.values.bic.code))
      formik.setFieldValue('bankAddress', null);
    if (mode !== 'view' && formik.values.bic) getAddressDomain();
  }, [formik.values.bic]);

  const getAddressDomainPayload = () => {
    let payload = {
      model: MODELS.BANK_DETAILS,
      action: 'action-attrs-account-bankdetails-bank-set-address-domain',
      data: {
        criteria: [],
        context: {
          _model: MODELS.BANK_DETAILS,
          bank: {
            id: formik.values.bic.id,
          },
          _source: 'bankAddress',
        },
      },
    };
    return payload;
  };

  const getAddressDomain = async () => {
    const response = await api('POST', getActionUrl(), getAddressDomainPayload());
    let status = response.data.status;
    let data = response.data.data;
    if (status !== 0) return alertHandler('Error', t('LBL_ERROR_LOADING_SWIFT_ADDRESS'));

    if (data && checkFlashOrError(data)) {
      return alertHandler('Error', t('LBL_ERROR_LOADING_SWIFT_ADDRESS'));
    }

    if (data) {
      if (data[0]?.attrs?.bankAddress?.domain) {
        setAddressDomain(data[0]?.attrs?.bankAddress?.domain);
      } else {
        return alertHandler('Error', t('LBL_ERROR_LOADING_SWIFT_ADDRESS'));
      }
    }
  };

  const onGetBICSuccess = response => {
    let status = response.data.status;
    let data = response.data.data || [];
    let total = response.data.total;

    if (status !== 0 || total === undefined || total === null) {
      return alertHandler('Error', t('LBL_ERROR_LOADING_BIC'));
    }

    return { displayedData: [...data], total: response.data.total || 0 };
  };

  const onBankAddressSearchSuccess = response => {
    let status = response.data.status;
    let data = response.data.data || [];
    let total = response.data.total;

    if (status !== 0 || total === undefined || total === null) {
      return alertHandler('Error', t('LBL_ERROR_LOADING_SWIFT_ADDRESS'));
    }

    let tempArr = [];

    if (data) {
      data.forEach(address => {
        let tempAddress = { ...address };
        tempAddress.bankCode = tempAddress['bank.code'];
        tempArr.push(tempAddress);
      });
    }

    return { displayedData: [...tempArr], total: response.data.total || 0 };
  };

  const selectBICHandler = selectedBIC => {
    if (selectedBIC?.code && selectedBIC.code.length > 0) {
      formik.setFieldValue('bankDetailsTypeSelect', selectedBIC.bankDetailsTypeSelect ?? 1);
    } else {
      alertHandler('Error', t('LBL_PLEASE_SELECT_BIC'));
    }
  };

  return (
    <>
      <BorderSection title="LBL_IBAN" />
      <div className="row">
        <div className="col-md-6">
          <SearchModalAxelor
            formik={formik}
            modelKey="BIC"
            mode={mode}
            onSuccess={onGetBICSuccess}
            defaultValueConfig={null}
            selectIdentifier="code"
            selectCallback={selectBICHandler}
            addConfig={{
              title: 'LBL_BANK_IDENTIFIER_CODE',
              selectCallback: selectBICHandler,
              FormComponent: AddBankIdentifier,
              additionalProps: { formik },
            }}
            extraFields={['bankDetailsTypeSelect']}
          />
        </div>
        {!formik.values.bic && <div className="col-md-6"></div>}
        {formik.values.bic && (
          <div className="col-md-6">
            <SearchModalAxelor
              formik={formik}
              modelKey="SWIFT_ADDRESSES"
              mode={mode}
              selectIdentifier="fullAddress"
              onSuccess={onBankAddressSearchSuccess}
              defaultValueConfig={{
                payloadDomain: addressDomain,
              }}
              extraFields={['fullAddress']}
            />
          </div>
        )}
        <div className="col-md-6">
          <label className="form-label" htmlFor="full-name">
            {t('LBL_BANK_DETAILS_ID_TYPE')}
          </label>
          <input
            type="text"
            className="form-control"
            id="Label"
            name="bankDetailsTypeSelect"
            value={t(BANK_DETAILS_IDS[formik.values.bankDetailsTypeSelect])}
            onBlur={formik.handleBlur}
            disabled
          />
        </div>
        {formik.values.bic && (
          <div className="col-md-6">
            <TextInput
              formik={formik}
              label="LBL_IBAN"
              accessor="iban"
              isRequired={true}
              mode={mode}
              onChange={e => {
                formik.setFieldValue('iban', e.target.value.toUpperCase());
              }}
              maxLength={24}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default IBANInfo;
