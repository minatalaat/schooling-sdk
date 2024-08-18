import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const OBListingCard = ({ badge, title, subTitles, cardInfo, canManage }) => {
  const { t } = useTranslation();

  const badges = [
    { label: 'LBL_ACTIVE', className: 'badge active' },
    { label: 'LBL_DISCONNECTED', className: 'badge disconnected' },
  ];

  return (
    <div className="card-obca">
      <div className="badge active">
        <span>{t(badge)}</span>
      </div>
      <div className="data-body">
        <h5>{title}</h5>
        {subTitles &&
          subTitles.map(subtitle => (
            <p>
              {t(subtitle.label)} ({subtitle.value})
            </p>
          ))}
      </div>

      {cardInfo && (
        <>
          <hr />
          <div className="card-info">
            <div className="Last-update">
              {cardInfo.map(info => (
                <p>
                  <i className="calender-i"></i>
                  <strong>{t(info.label)} </strong> <span>{info.value}</span>
                </p>
              ))}
            </div>

            {canManage && (
              <div className="action">
                <Link>{t('LBL_MANAGE')}</Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default OBListingCard;
