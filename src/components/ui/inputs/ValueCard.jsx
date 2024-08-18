import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function ValueCard({ linkTo = null, isLoading = false, title, content }) {
  const { t } = useTranslation();

  return (
    <Link to={linkTo} className="value-card">
      <div className={`no-background-value-card${linkTo ? ' with-link ' : ''}`}>
        <div className="d-flex flex-column justify-content-between align-items-start w-auto">
          {!isLoading && (
            <div className="debit">
              <p>{t(title)}</p>
              <h4>{content}</h4>
            </div>
          )}
          {isLoading && (
            <div className="debit">
              <p>{t('LOADING')}</p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
