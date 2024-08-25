import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import ImageWithSkeleton from './ui/skeletons/ImageWithSkeleton';

function OBServiceCard({ to, img, title, desc, className }) {
  const { t } = useTranslation();
  return (
    <Link to={to}>
      <div className={className ? `card-banking ${className}` : 'card-banking'}>
        <ImageWithSkeleton isCircle={false} imgSrc={img} imgAlt={img} />
        <div className="title_discription">
          <h5>{t(title)}</h5>
          <p>{t(desc)}</p>
        </div>
      </div>
    </Link>
  );
}

export default OBServiceCard;
