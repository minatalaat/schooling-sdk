import { Link } from 'react-router-dom';

import ImageWithSkeleton from './ui/skeletons/ImageWithSkeleton';

import AddIcon from '../assets/images/Add-icon.svg';

function NoData({ imgSrc, noDataMessage, startAddMessage, addButtontext, addButtonPath, showAdd, stepClass, showAdditionalMessage }) {
  const showStartAddMessage = (showAdd && startAddMessage) || showAdditionalMessage;
  return (
    <div className="page-body">
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-md-4">
            <div className="account-empty">
              <ImageWithSkeleton imgSrc={imgSrc} imgAlt={imgSrc} isNoData={true} />
              <p>{noDataMessage}</p>
              {showStartAddMessage && <span>{startAddMessage}</span>}
              {showAdd && addButtontext && (
                <Link
                  to={addButtonPath}
                  className={stepClass ? `btn-add-empty text-decoration-none ${stepClass}` : 'btn-add-empty text-decoration-none'}
                >
                  <img src={AddIcon} alt={AddIcon} />
                  {addButtontext}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NoData;
