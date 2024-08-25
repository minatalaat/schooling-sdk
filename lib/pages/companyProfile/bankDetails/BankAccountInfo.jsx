import { useTranslation } from 'react-i18next';

import TextInput from '../../../components/ui/inputs/TextInput';
import SearchModalAxelor from '../../../components/ui/inputs/SearchModal/SearchModalAxelor';

import { MODELS } from '../../../constants/models';

const BankAccountInfo = ({ formik, alertHandler, bankAccountsIDs, companyID, mode }) => {
  const { t } = useTranslation();
  const bankAccountDomain =
    "self.statusSelect = 1 AND self.company = :company AND self.accountType.technicalTypeSelect = 'cash' AND self.id not in :bankAccountsIDs";
  const currencyDomain = "self.name = 'Saudi Riyal'";

  const onGetCurrencySuccess = response => {
    let status = response.data.status;
    let data = response.data.data || [];
    let total = response.data.total;

    if (status !== 0 || total === undefined || total === null) {
      return alertHandler('Error', t('LBL_ERROR_LOADING_NEW_BANK_ACCOUNT'));
    }

    return { displayedData: [...data], total: response.data.total || 0 };
  };

  const onAccountsSuccess = response => {
    let status = response.data.status;
    let data = response.data.data || [];
    let total = response.data.total;

    if (status !== 0 || total === undefined || total === null) {
      return alertHandler('Error', t('LBL_ERROR_LOADING_ACCOUNTS'));
    }

    return { displayedData: [...data], total: response.data.total || 0 };
  };

  return (
    <>
      <div className="switch-popup float-end">
        <div className="form-check form-switch">
          <label className="form-label float-start">{t('LBL_ACTIVE')}</label>
          <input
            name="active"
            type="checkbox"
            id="switch"
            value={formik.values.active}
            onChange={formik.handleChange}
            checked={formik.values.active}
            disabled={mode === 'view'}
          />
          <label className="switch" htmlFor="switch">
            Toggle
          </label>
        </div>
      </div>
      {/* <div className="section-title">
        <h4>{t('LBL_OWNER')}</h4>
      </div> */}
      <div className="row">
        <div className="col-md-4">
          <TextInput formik={formik} label="LBL_DISPLAY_NAME" accessor="label" isRequired={true} mode={mode} />
        </div>
        <div className="col-md-4">
          <SearchModalAxelor
            formik={formik}
            modelKey="BANK_ACCOUNTING_ACCOUNTS"
            mode={mode}
            onSuccess={onAccountsSuccess}
            selectIdentifier="label"
            defaultValueConfig={{
              payloadDomain: bankAccountDomain,
              payloadDomainContext: {
                bankAccountsIDs: bankAccountsIDs,
                company: {
                  id: companyID,
                },
                _model: MODELS.BANK_DETAILS,
              },
            }}
            payloadDomain={bankAccountDomain}
            payloadDomainContext={{
              bankAccountsIDs: bankAccountsIDs,
              company: {
                id: companyID,
              },
              _model: MODELS.BANK_DETAILS,
            }}
          />
        </div>
        <div className="col-md-4">
          <SearchModalAxelor
            formik={formik}
            modelKey="CURRENCIES"
            mode={mode}
            onSuccess={onGetCurrencySuccess}
            defaultValueConfig={{
              payloadDomain: currencyDomain,
            }}
            disabled={true}
          />
        </div>
      </div>
    </>
  );
};

export default BankAccountInfo;
