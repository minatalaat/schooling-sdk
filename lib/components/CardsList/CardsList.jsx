import { useTranslation } from 'react-i18next';
import Pagination from '../../parts/Pagination';

function CardsList({ total, children, isPagination = true, cardsOnly }) {
  const { t } = useTranslation();

  return (
    <div className={cardsOnly ? '' : 'card'}>
      <div className="row">
        <div className="col-md-12">
          <div className="tab-content d-block" id="pills-tabContent">
            <div className="table-card-new fade show active" id="pills-profile" role="tabpanel" aria-labelledby="pills-profile-tab">
              <div className="div div-card-new">
                <div className="row">{children}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {total === 0 && (
        <div>
          <h4 className="text-center">{t('NO_DATA_AVAILABLE')}</h4>
        </div>
      )}
      {total > 0 && isPagination && <Pagination total={total} />}
    </div>
  );
}

export default CardsList;
