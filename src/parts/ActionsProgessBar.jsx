import { useState, useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import StatusBar from './StatusBar/StatusBar';

import { useFeatures } from '../hooks/useFeatures';
import { useModelActionsServices } from '../services/apis/useModelActionsServices';
import { CopyIcon, DeleteIcon, EditIcon, MoreActionIcon, ViewIcon, ViewPDFIcon } from '../components/ui/actions/Actions';
import { FaCamera } from 'react-icons/fa';

const ActionsProgessBar = ({
  editHandler,
  viewHandler,
  viewPDFHandler,
  printSnapShotHandler,
  deleteHandler,
  editHandlerParams,
  viewHandlerParams,
  deleteHandlerParams,
  feature,
  subfeature,
  setShowMoreAction,
  statusBarItems,
  currentStatusLabel,
  modelsEnumKey = null,
  setIsLoading,
}) => {
  const location = useLocation();
  const { id } = useParams();
  const { canAdd, canView, canEdit, canDelete } = useFeatures(feature, subfeature);
  const { t } = useTranslation();
  const { copyHandler } = useModelActionsServices({ feature, subFeature: subfeature, modelsEnumKey, id, setIsLoading });

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
                            <ViewIcon />
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
                            <EditIcon />
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
                            <DeleteIcon />
                          </Link>
                        </li>
                      )}
                      {canAdd && modelsEnumKey && (
                        <li onClick={() => copyHandler()}>
                          <Link
                            to={{
                              pathname: location.pathname,
                              search: location.search,
                            }}
                            state={location.state}
                          >
                            <CopyIcon />
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
                            <ViewPDFIcon />
                          </Link>
                        </li>
                      )}
                      {printSnapShotHandler && (
                        <li onClick={() => printSnapShotHandler()}>
                          <Link
                            to={{
                              pathname: location.pathname,
                              search: location.search,
                            }}
                            state={location.state}
                          >
                            <FaCamera size={24} />
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
                        <MoreActionIcon />
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
          <span>{t(currentStatusLabel)}</span>
        </div>
      )}
    </>
  );
};

export default ActionsProgessBar;
