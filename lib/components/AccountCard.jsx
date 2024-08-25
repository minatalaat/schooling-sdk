import React from 'react';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import { accountSubTypesEnum } from '../constants/enums/OBEnums';

function AccountCard({ hasSettings, account }) {
  const { t } = useTranslation();

  return (
    <div className="card banking-card ob-account-card">
      <div className="card-table-badge-row">
        {account?.Status && (
          <div className="badge-table company-badge-individule">
            <span>{account?.Status}</span>
          </div>
        )}
      </div>

      <div className="card-body-q pt-0">
        {account?.AccountHolderName && (
          <div className="cel-card-normal">
            <div className="float-start code-1">
              <h4>{t('LBL_ACCOUNT_HOLDER_NAME')}</h4>
              <h2>{account?.AccountHolderName || ''}</h2>
            </div>
          </div>
        )}
        {account?.AccountIdentifiers && account?.AccountIdentifiers.filter(idy => idy?.IdentificationType === 'KSAOB.IBAN')[0] && (
          <div className="cel-card-normal">
            <div className="float-start code-1">
              <h4>{t('LBL_ACCOUNT_NUMBER')}</h4>
              <h2>{account?.AccountIdentifiers.filter(idy => idy?.IdentificationType === 'KSAOB.IBAN')[0]?.Identification}</h2>
            </div>
          </div>
        )}
        {account && account?.accountLink && account?.accountLink?.provider && (
          <div className="cel-card-normal">
            <div className="float-start code-1">
              <h2>
                {i18next.language === 'en'
                  ? account?.accountLink?.provider?.financialInstitutionName?.nameEn || ''
                  : account?.accountLink?.provider?.financialInstitutionName?.nameAr || ''}
              </h2>
            </div>
            {account?.accountLink?.provider?.image && (
              <div className="float-end code-2">
                <img src={account?.accountLink?.provider?.image} alt="AlRajhiLogo" />
              </div>
            )}
          </div>
        )}
        {account.AccountSubType && account.Currency && (
          <div className="cel-card-normal mb-0 p-0">
            {account.AccountSubType && (
              <div className="float-start code-2">
                <h4>{t('LBL_ACCOUNT_TYPE')}</h4>
                <h1>
                  <span>{t(accountSubTypesEnum[account.AccountSubType])}</span>
                </h1>
              </div>
            )}
            {account.Currency && (
              <div className="float-end code-2">
                <h4>{t('LBL_CURRENCY')}</h4>
                <h1>
                  <span>{account.Currency}</span>
                </h1>
              </div>
            )}
          </div>
        )}

        {/* <div className="cel-card-normal mb-0">
          <div className="cel-text code-1">
            <p className="title-cel float-start">{t('LBL_RECONCILE')}</p>
            <p className="value-cel float-end">{account.reconcile}</p>
          </div>

          <div className="cel-text code-1">
            <p className="title-cel float-start">{t('LBL_TRANSACTIONS')}</p>
            <p className="value-cel float-end">{account.transactions}</p>
          </div>

          <div className="cel-text code-1">
            <p className="title-cel float-start">{t('LASTEST_STATEMENT')}</p>
            <p className="value-cel float-end">
              {t('LBL_SAR')} {account.latestStatments}
            </p>
          </div>
        </div> */}
      </div>
    </div>
  );
}

export default AccountCard;
