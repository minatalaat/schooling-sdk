import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import i18n from 'i18next';

import LoadingLoop from '../../../../assets/images/loading-loop-ob.svg';

const TransferToPasP = () => {
  const { t } = useTranslation();
  const selectedFinancialInstitution = useSelector(state => state.financialInstitutions.selectedFinancialInstitution);
  let institutionName =
    i18n.language === 'en'
      ? selectedFinancialInstitution?.FinancialInstitutionName?.NameEn ?? ''
      : selectedFinancialInstitution?.FinancialInstitutionName?.NameAr ?? '';
  return (
    <div className="card form-steps">
      <div className="col-md-6 offset-md-3">
        <h4>
          {t('LBL_TRANSFERRING_YOU')}
          <br /> {institutionName}
        </h4>

        <img src={LoadingLoop} alt="Loading" className="loding-rotate-animation" />

        <p>{t('SECURELY_TRANSFERRING') + institutionName + t('FOR_AUTHENTICATION')}</p>
      </div>
    </div>
  );
};

export default TransferToPasP;
