import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { Link } from 'react-router-dom';

import { linkStatusEnum } from '../../constants/enums/OBEnums';
import { useFeatures } from '../../hooks/useFeatures';
import i18next from 'i18next';

function OpenbankingCard({ link }) {
  const { t } = useTranslation();
  const { getFeaturePath } = useFeatures();
  return (
    <div className="col-md-12">
      <div className="card-obca">
        <div className={`badge ${link?.Status}`}>
          <span>{t(linkStatusEnum[link?.Status])}</span>
        </div>
        <div className="data-body">
          <h5>{i18next.language === 'en' ? link?.FinancialInstitution?.NameEn || '' : link?.FinancialInstitution?.NameAr}</h5>
          {/* {link?.Accounts?.map(account => {
            return <p>{account} </p>;
          })} */}
        </div>

        {link?.Status == 'Active' && (
          <>
            <hr />
            <div className="card-info">
              <div className="Last-update">
                <p>
                  <i className="calender-i"></i>
                  <strong>{t('LBL_TRANSACTION_FROM')} </strong>{' '}
                  <span>{moment(link?.TransactionFromDateTime).locale('en').format('YYYY-MM-DD')}</span>
                </p>
                <p>
                  <i className="calender-i"></i>
                  <strong>{t('LBL_EXPIRY_DATE')} </strong> <span>{moment(link?.ExpirationDateTime).locale('en').format('YYYY-MM-DD')}</span>
                </p>
              </div>
              <div className="action">
                <Link to={getFeaturePath('BANKING_ACCOUNTS', 'VIEW', { id: link?.AccountsLinkId })}>{t('LBL_MANAGE')}</Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default OpenbankingCard;
