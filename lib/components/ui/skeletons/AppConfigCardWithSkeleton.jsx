import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import RectangleSkeleton from './RectangleSkeleton';
import { useFeatures } from '../../../hooks/useFeatures';

const AppConfigCardWithSkeleton = ({ onCardClick, item }) => {
  const { t } = useTranslation();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgVisible, setImgVisible] = useState(true);
  const { getFeaturePath } = useFeatures();

  const loadedImageHandler = () => {
    setImgLoaded(true);
  };

  const loadingErrorHandler = () => {
    setImgLoaded(true);
    setImgVisible(false);
  };

  return (
    <>
      {imgVisible && (
        <>
          <div
            className="card card-no-border card-active"
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
                    {t(item.label)}
                  </h5>
                </div>
              </div>
            )}
            <div className="card-body-q pt-0">
              {imgLoaded && (
                <>
                  <Link
                    to={getFeaturePath('CONFIG') + item.PATH}
                    style={{
                      fontSize: '18px',
                    }}
                  >
                    {t('LBL_CONFIGURE')}
                  </Link>
                </>
              )}
              {item.img && (
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
                  src={item.img}
                  alt={item.img}
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

export default AppConfigCardWithSkeleton;
