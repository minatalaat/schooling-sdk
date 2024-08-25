import React from 'react';
import SearchModalAxelor from '../../../components/ui/inputs/SearchModal/SearchModalAxelor';

const AccountingInfo = ({ formik, mode }) => {
  const depreciationAccountDomain = "self.accountType.technicalTypeSelect = 'immobilisation' AND self.statusSelect = 1";
  const journalDomain = "self.code = 'FAJ'";
  const chargeAccountDomain = "self.accountType.technicalTypeSelect = 'charge' AND self.statusSelect = 1";
  const debtReceivableAccountDomain = "self.statusSelect = 1 AND  self.accountType.technicalTypeSelect = 'receivable'";
  const realizedAssetValueAccountDomain = "self.statusSelect = 1  AND self.accountType.technicalTypeSelect = 'charge'";
  const realizedAssetIncomeAccountDomain = "self.statusSelect = 1 AND self.accountType.technicalTypeSelect = 'income' ";

  const onChargeAccountsSearchSuccess = response => {
    if (response.data.status === 0) {
      let responseData = response.data.data || [];
      return { displayedData: [...responseData], total: response.data.total || 0 };
    }
  };

  const onDepreciationAccountsSearchSuccess = response => {
    if (response.data.status === 0) {
      let responseData = response.data.data || [];
      return { displayedData: [...responseData], total: response.data.total || 0 };
    }
  };

  const onDebtRecivableAccountsSearchSuccess = response => {
    if (response.data.status === 0) {
      let responseData = response.data.data || [];
      return { displayedData: [...responseData], total: response.data.total || 0 };
    }
  };

  const onRealizedAssetIncomeAccountsSearchSuccess = response => {
    if (response.data.status === 0) {
      let responseData = response.data.data || [];
      return { displayedData: [...responseData], total: response.data.total || 0 };
    }
  };

  const onRealizedAssetValueAccountsSearchSuccess = response => {
    if (response.data.status === 0) {
      let responseData = response.data.data || [];
      return { displayedData: [...responseData], total: response.data.total || 0 };
    }
  };

  const onJournalsSearchSuccess = response => {
    if (response.data.status === 0) {
      let responseData = response.data.data || [];
      return { displayedData: [...responseData], total: response.data.total || 0 };
    }
  };

  return (
    <div className="row">
      <div className="col-md-4">
        <SearchModalAxelor
          formik={formik}
          modelKey="JOURNALS"
          mode={mode}
          onSuccess={onJournalsSearchSuccess}
          defaultValueConfig={{ payloadDomain: journalDomain }}
          selectIdentifier="name"
          payloadDomain={journalDomain}
          isRequired={true}
        />
      </div>
      <div className="col-md-4">
        <SearchModalAxelor
          formik={formik}
          modelKey="CHARGE_ACCOUNTS"
          mode={mode}
          onSuccess={onChargeAccountsSearchSuccess}
          defaultValueConfig={null}
          selectIdentifier="label"
          isRequired={true}
          payloadDomain={chargeAccountDomain}
        />
      </div>
      <div className="col-md-4">
        <SearchModalAxelor
          formik={formik}
          modelKey="DEPRECIATION_ACCOUNTS"
          mode={mode}
          onSuccess={onDepreciationAccountsSearchSuccess}
          defaultValueConfig={null}
          selectIdentifier="label"
          isRequired={true}
          payloadDomain={depreciationAccountDomain}
        />
      </div>
      <div className="col-md-4">
        <SearchModalAxelor
          formik={formik}
          modelKey="DEBT_RECEIVABLE_ACCOUNTS"
          mode={mode}
          onSuccess={onDebtRecivableAccountsSearchSuccess}
          defaultValueConfig={null}
          selectIdentifier="label"
          isRequired={true}
          payloadDomain={debtReceivableAccountDomain}
        />
      </div>
      <div className="col-md-4">
        <SearchModalAxelor
          formik={formik}
          modelKey="REALIZED_ASSETS_VALUE_ACCOUNTS"
          mode={mode}
          onSuccess={onRealizedAssetValueAccountsSearchSuccess}
          defaultValueConfig={null}
          selectIdentifier="label"
          isRequired={true}
          payloadDomain={realizedAssetValueAccountDomain}
        />
      </div>
      <div className="col-md-4">
        <SearchModalAxelor
          formik={formik}
          modelKey="REALIZED_ASSETS_INCOME_ACCOUNTS"
          mode={mode}
          onSuccess={onRealizedAssetIncomeAccountsSearchSuccess}
          defaultValueConfig={null}
          selectIdentifier="label"
          isRequired={true}
          payloadDomain={realizedAssetIncomeAccountDomain}
        />
      </div>
    </div>
  );
};

export default AccountingInfo;
