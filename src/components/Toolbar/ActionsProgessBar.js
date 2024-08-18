import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import StatusBar from './StatusBar';
import ImageWithSkeleton from '../components/ui/skeletons/ImageWithSkeleton';

import EditIconBtnHeader from '../assets/images/edit-icon.svg';
import deleteIconBtnHrader from '../assets/images/delete-icon.svg';
import viewIcon from '../assets/images/view-icon.svg';
import viewPDFIcon from '../assets/images/h-4.svg';
import MoreAction from '../assets/images/morecircle.svg';
import { useFeatures } from '../services/useFeatures';

const ActionsProgessBar = props => {
  let editHandler = props.editHandler;
  let viewHandler = props.viewHandler;
  let viewPDFHandler = props.viewPDFHandler;
  let deleteHandler = props.deleteHandler;
  let editHandlerParams = props.editHandlerParams;
  let viewHandlerParams = props.viewHandlerParams;
  let deleteHandlerParams = props.deleteHandlerParams;
  let feature = props.feature;
  let subfeature = props.subfeature;
  let setShowMoreAction = props.setShowMoreAction;
  let statusBarItems = props.statusBarItems;
  let currentStatusLabel = props.currentStatusLabel;

  const location = useLocation();
  const { canView, canEdit, canDelete } = useFeatures(feature, subfeature);

  const [windowSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);

  useEffect(() => {
    const handleWindowResize = () => {
      setWindowSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  });

  return (
    <>
      {((canView && viewHandler) || (canEdit && editHandler) || (canDelete && deleteHandler) || statusBarItems || viewPDFHandler) && (
        <div className="card card-progress-bar">
          <div
            className={
              (canView && viewHandler) || (canEdit && editHandler) || (canDelete && deleteHandler) || viewPDFHandler
                ? 'row'
                : 'row justify-content-center'
            }
          >
            {((canView && viewHandler) || (canEdit && editHandler) || (canDelete && deleteHandler) || viewPDFHandler) && (
              <div className="col-md-2 filter-head">
                {windowSize[0] > 1200 && (
                  <div className="action-left float-start">
                    <ul>
                      {canView && viewHandler && (
                        <li onClick={() => viewHandler(viewHandlerParams)}>
                          <Link
                            to={{
                              pathname: location.pathname,
                              search: location.search,
                            }}
                            state={location.state}
                          >
                            <ImageWithSkeleton imgSrc={viewIcon} imgAlt={viewIcon} isListIcon={true} />
                          </Link>
                        </li>
                      )}
                      {canEdit && editHandler && (
                        <li onClick={() => editHandler(editHandlerParams)}>
                          <Link
                            to={{
                              pathname: location.pathname,
                              search: location.search,
                            }}
                            state={location.state}
                          >
                            <ImageWithSkeleton imgSrc={EditIconBtnHeader} imgAlt={EditIconBtnHeader} isListIcon={true} />
                          </Link>
                        </li>
                      )}
                      {canDelete && deleteHandler && (
                        <li onClick={() => deleteHandler(deleteHandlerParams)}>
                          <Link
                            to={{
                              pathname: location.pathname,
                              search: location.search,
                            }}
                            state={location.state}
                          >
                            <ImageWithSkeleton imgSrc={deleteIconBtnHrader} imgAlt={deleteIconBtnHrader} isListIcon={true} />
                          </Link>
                        </li>
                      )}
                      {viewPDFHandler && (
                        <li onClick={() => viewPDFHandler()}>
                          <Link
                            to={{
                              pathname: location.pathname,
                              search: location.search,
                            }}
                            state={location.state}
                          >
                            <ImageWithSkeleton imgSrc={viewPDFIcon} imgAlt={viewPDFIcon} isListIcon={true} />
                          </Link>
                        </li>
                      )}
                    </ul>
                  </div>
                )}
                {windowSize[0] <= 1200 && (
                  <div className="toolbar-mobile">
                    <div className="btn-group float-start">
                      <button
                        type="button"
                        className="btn more-popup-trigger"
                        onClick={() => {
                          setShowMoreAction(true);
                        }}
                      >
                        <ImageWithSkeleton imgSrc={MoreAction} imgAlt={MoreAction} isListIcon={true} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {windowSize[0] > 1200 && statusBarItems && (
              <div className="col-md-10">
                <StatusBar items={statusBarItems} />
              </div>
            )}
            {windowSize[0] <= 1200 && statusBarItems && (
              <div className={canView || canEdit || canDelete ? 'col-md-10' : 'col-md-2'}>
                <StatusBar items={statusBarItems} />
              </div>
            )}
          </div>
        </div>
      )}
      {windowSize[0] < 990 && currentStatusLabel && (
        <div className="current-status">
          <span>{currentStatusLabel}</span>
        </div>
      )}
    </>
  );
};

export default ActionsProgessBar;
