import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { financialInstitutionsActions } from '../../../../store/financialInstitutions';
import { useOBServices } from '../../../../services/apis/useOBServices';
import defaultLogo from '../../../../assets/images/building-bank.svg';

const Consent = ({ errors, handleBlur, setFieldValue }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { setCurrentFinancialInstitution } = useOBServices();

  let financialInstitutions = useSelector(state => state.financialInstitutions.financialInstitutions);
  let selectedFinancialInstitution = useSelector(state => state.financialInstitutions.selectedFinancialInstitution);

  const [currentFinancialInstitutions, setCurrentFinancialInstitutions] = useState([]);
  const [searchArray, setSearchArray] = useState([]);

  useEffect(() => {
    setCurrentFinancialInstitutions([...financialInstitutions]);
    setSearchArray([...financialInstitutions]);
  }, [financialInstitutions]);

  const handleCheck = (e, index) => {
    if (e.target.value === selectedFinancialInstitution?.FinancialInstitutionId) {
      setFieldValue('accountProvider', null);
      dispatch(financialInstitutionsActions.resetSelectedFinancialInstitution());
    } else {
      setFieldValue('accountProvider', currentFinancialInstitutions[index]);
      setCurrentFinancialInstitution(currentFinancialInstitutions[index]);
    }
  };

  const handleSearchChange = e => {
    let searchVal = e.target.value.toLowerCase();

    if (searchVal.trim().length === 0) {
      setSearchArray([...currentFinancialInstitutions]);
    } else {
      let tempArr = currentFinancialInstitutions.filter(
        institution =>
          institution?.FinancialInstitutionName?.NameAr.toLowerCase().includes(searchVal) ||
          institution?.FinancialInstitutionName?.NameEn.toLowerCase().includes(searchVal)
      );
      setSearchArray(tempArr);
    }
  };

  return (
    <>
      <div className="card form-steps">
        <div className="col-md-6 offset-md-3 ">
          <h4>{t('SELECT_PROVIDER_MESSAGE')}</h4>
          <p>{t('DATA_SHARING_CONFIRM_MESSAGE')}</p>
          <div className="search-input">
            <i className="search-icon-form"></i>
            <input className="form-control" type="text" placeholder={t('LBL_ENTER_PROVIDER')} onChange={handleSearchChange} />
          </div>
          <div className="text-with-border">
            <h1>{t('LBL_OR')}</h1>
          </div>

          <div className="select-list">
            <h5 className="title-list">{t('LBL_SELECT_FROM_LIST_BELOW')}</h5>
            {errors.accountProvider && <label className="mb-3 color-text-red">{errors.accountProvider}</label>}
            {searchArray.map((provider, index) => {
              return (
                <>
                  <div className="cel-select">
                    {provider.image && <img src={provider.image} alt="BankLogo" />}
                    {!provider.image && <img src={defaultLogo} alt="BankLogo" style={{ height: '57px' }} />}
                    <div className="financial-institution">
                      <p>{provider?.FinancialInstitutionName?.NameAr}</p>
                      <p>{provider?.FinancialInstitutionName?.NameEn}</p>
                    </div>

                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="check1"
                      name="accountProviderSelect"
                      onChange={e => handleCheck(e, index)}
                      onBlur={handleBlur}
                      value={provider.FinancialInstitutionId}
                      checked={selectedFinancialInstitution?.FinancialInstitutionId === provider?.FinancialInstitutionId}
                    />
                  </div>
                </>
              );
            })}
          </div>
          {errors.accountProvider && <label className="mt-3 color-text-red">{errors.accountProvider}</label>}
        </div>
      </div>
    </>
  );
};

export default Consent;
