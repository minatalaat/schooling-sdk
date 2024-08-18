import { getItem } from '../../../utils/localStorage';

function IntegrationCard({ integrationItem }) {
  return (
    <div className="section-card-body-app">
      <img src={integrationItem?.icon} alt={integrationItem?.code} />
      <h5>{getItem('code') === 'ar' ? integrationItem?.nameAr : integrationItem?.nameEn}</h5>
    </div>
  );
}

export default IntegrationCard;
