import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { IoStarOutline, IoStar } from 'react-icons/io5';

import RectangleSkeleton from './RectangleSkeleton';

import { getAddFavoriteUrl, getRemoveFavoriteUrl } from '../../../services/getUrl';
import { useFeatures } from '../../../hooks/useFeatures';
import { captilazeFirstWord } from '../../../utils/helpers';

const QuickActionsCardWithSkeleton = ({ onCardClick, currentSubFeature, favorites, setFavorites, showErrorMessage, api }) => {
  const { t } = useTranslation();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgVisible, setImgVisible] = useState(true);
  const { checkPrivilegeBySubFeatureCode } = useFeatures();

  const loadedImageHandler = () => setImgLoaded(true);

  const loadingErrorHandler = () => {
    setImgLoaded(true);
    setImgVisible(false);
  };

  const addToFavoritesPayload = code => {
    let payload = {
      data: {
        requestObject: {
          subFeature: {
            subFeatureCode: code,
          },
        },
      },
    };
    return payload;
  };

  const removeFromFavoritesPayload = code => {
    let payload = {
      action: 'action-delete-favorite-subfeature',
      data: {
        context: {
          subFeature: { subFeatureCode: code },
        },
      },
    };
    return payload;
  };

  const toggleFavorite = async id => {
    let tempFavorites = [...favorites];
    let index = tempFavorites.indexOf(id);

    if (index >= 0) {
      tempFavorites.splice(index, 1);
      setFavorites(tempFavorites);
      const response = await api('DELETE', getRemoveFavoriteUrl(id));
      let status = response.data.status;
      if (status !== 'Ok') return showErrorMessage('LBL_ERROR_REMOVING_FEATURE_TO_FAVORITES');
    } else {
      tempFavorites.push(id);
      setFavorites(tempFavorites);
      const response = await api('POST', getAddFavoriteUrl(), addToFavoritesPayload(id));
      let status = response.data.status;
      if (status !== 'Ok') return showErrorMessage('LBL_ERROR_ADDING_FEATURE_TO_FAVORITES');
    }
  };

  const isFavorite = id => {
    let index = favorites.indexOf(id);

    if (index >= 0) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <>
      {imgVisible && (
        <>
          <div
            className="card card-no-border card-active"
            key={currentSubFeature.id}
            style={
              !imgLoaded
                ? { height: 0, width: 0, margin: 0, padding: 0, letterSpacing: 0, lineHeight: 0, position: 'fixed', top: 0, left: '50%' }
                : {}
            }
          >
            {imgLoaded && (
              <div className="card-header-q" onClick={onCardClick}>
                <div className="float-start header">
                  <h5
                    className="mb-0"
                    style={{
                      fontSize: '24px',
                    }}
                  >
                    {captilazeFirstWord(t(currentSubFeature.LABEL))}
                  </h5>
                </div>
                <div
                  style={{ height: '40px' }}
                  className="float-end star-icon"
                  onClick={e => {
                    e.stopPropagation();
                    toggleFavorite(currentSubFeature.id);
                  }}
                >
                  {!isFavorite(currentSubFeature.id) && <IoStarOutline size={30} color="#1f4fde" />}
                  {isFavorite(currentSubFeature.id) && <IoStar size={30} color="#e47200" />}
                </div>
              </div>
            )}
            <div className="card-body-q pt-0">
              {imgLoaded && (
                <>
                  {checkPrivilegeBySubFeatureCode('add', currentSubFeature?.id) ? (
                    <Link
                      to={currentSubFeature?.ADD_PATH}
                      style={{
                        fontSize: '18px',
                      }}
                    >
                      {captilazeFirstWord(t('LBL_ADD'))}
                    </Link>
                  ) : (
                    <Link
                      style={{
                        fontSize: '18px',
                      }}
                      to={currentSubFeature?.PATH}
                    >
                      {captilazeFirstWord(t('LBL_VIEW'))}
                    </Link>
                  )}
                </>
              )}
              {currentSubFeature.NO_DATA_IMG && (
                <img
                  style={
                    !imgLoaded
                      ? {
                          height: 0,
                          width: 0,
                          margin: 0,
                          padding: 0,
                          letterSpacing: 0,
                          lineHeight: 0,
                          position: 'fixed',
                          top: 0,
                          left: '50%',
                        }
                      : { width: '50px', height: '50px' }
                  }
                  src={currentSubFeature.NO_DATA_IMG}
                  alt={currentSubFeature.NO_DATA_IMG}
                  onLoad={loadedImageHandler}
                  onError={loadingErrorHandler}
                  onClick={onCardClick}
                />
              )}
            </div>
          </div>
        </>
      )}
      {!imgLoaded && <RectangleSkeleton height={190} position="fixed" top={0} left="50%" isIcon={true} />}
    </>
  );
};

export default QuickActionsCardWithSkeleton;
