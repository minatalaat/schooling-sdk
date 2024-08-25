import { useTranslation } from 'react-i18next';
// import { SpinnerCircular } from 'spinners-react';
import { OverlayTrigger } from 'react-bootstrap';

import Tooltip from 'react-bootstrap/Tooltip';
import RectangleSkeleton from '../../../components/ui/skeletons/RectangleSkeleton';

import InfoIcon from '../../../assets/images/info-button.svg';
import { formatFloatNumber } from '../../../utils/helpers';
import { getItem } from '../../../utils/localStorage';

function DashboardCard({ label, cost, currency, imgSrc, isLoading, toolTipMessage }) {
  const { t } = useTranslation();
  return (
    <div className="col-xl-4 col-md-4 col-xl-4 box-col-12 d-flex flex-fill">
      {!isLoading && (
        <div className="card card-no-border w-100">
          <div className="card-header-q">
            <h5 className="mb-0">
              {t(label)}

              <OverlayTrigger
                key={getItem('code') === 'en' ? 'right' : 'left'}
                placement={getItem('code') === 'en' ? 'right' : 'left'}
                overlay={<Tooltip id={`tooltip-${getItem('code') === 'en' ? 'right' : 'left'}`}>{toolTipMessage}</Tooltip>}
              >
                <span
                  data-bs-toggle="tooltip"
                  data-bs-placement="right"
                  title=""
                  data-bs-original-title="Hover over the buttons below to see the four tooltips directions: top, right, bottom, and left. Directions are mirrored when using Bootstrap in RTL."
                >
                  <img src={InfoIcon} alt={InfoIcon} />
                </span>
              </OverlayTrigger>
            </h5>
          </div>
          <div className="card-body-q pt-0">
            <h5>
              {formatFloatNumber(cost)} <span>{t(currency)}</span>
            </h5>
            <img src={imgSrc} alt={imgSrc} />
          </div>
        </div>
      )}
      {/* {isLoading && (
        <div className="d-flex align-items-center justify-content-center">
          <SpinnerCircular size={100} thickness={120} speed={100} color="rgba(31, 79, 222, 1)" secondaryColor="rgba(153, 107, 229, 0.19)" />
        </div>
      )} */}
      {isLoading && <RectangleSkeleton height="180" />}
    </div>
  );
}

export default DashboardCard;
