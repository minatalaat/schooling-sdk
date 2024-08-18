import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import RectangleSkeleton from '../../../components/ui/skeletons/RectangleSkeleton';

import { formatFloatNumber } from '../../../utils/helpers';

function OpenInvoicesCard({ invoices, isLoading }) {
  const { t } = useTranslation();
  return (
    <div className="col-xl-6 d-flex flex-fill">
      {!isLoading && (
        <div className="card section-card card-no-border">
          <div className="card-header-q">
            <h5 className="float-start mb-0">
              {t('OPEN_INVOICES')} <span>{t(invoices.label)}</span>
            </h5>
            <Link to={invoices.ref} className="clearfix btn pay-now-btn float-end">
              {t('SEE_ALL')}
            </Link>
          </div>
          <div className="card-body-q pt-0">
            <h5 className="open-invoices-header">
              {formatFloatNumber(invoices.amount)} <span>{t(invoices.currency)}</span>
            </h5>
          </div>
        </div>
      )}
      {isLoading && <RectangleSkeleton height="300" />}
    </div>
  );
}

export default OpenInvoicesCard;
