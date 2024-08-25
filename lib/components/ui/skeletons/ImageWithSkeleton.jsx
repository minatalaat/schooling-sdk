import { useState } from 'react';

import RectangleSkeleton from './RectangleSkeleton';
import CircleSkeleton from './CircleSkeleton';

export default function ImageWithSkeleton({ imgSrc, imgAlt, height, width, imgOptions, isCircle, isListIcon, isNoData, isConfirmIcon }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgVisible, setImgVisible] = useState(true);
  isCircle = isCircle ? true : false;
  isListIcon = isListIcon ? true : false;
  isNoData = isNoData ? true : false;
  isConfirmIcon = isConfirmIcon ? true : false;
  let isIcon = false;

  if (isConfirmIcon) {
    isIcon = true;
    width = 60;
    height = 66;
  }

  if (isListIcon) {
    width = 24;
    height = 28;
    isIcon = true;
    isCircle = false;
  }

  if (isNoData) {
    height = 240;
    isCircle = true;
  }

  const loadedImageHandler = () => {
    setImgLoaded(true);
  };

  const loadingErrorHandler = () => {
    setImgLoaded(true);
    setImgVisible(false);
  };

  return (
    <>
      {!imgLoaded && !isCircle && <RectangleSkeleton height={height} isIcon={isIcon} width={width} position="fixed" top={0} left="50%" />}
      {!imgLoaded && isCircle && <CircleSkeleton height={height} isNoData={isNoData} width={width} position="fixed" top={0} left="50%" />}
      {imgVisible && (
        <img
          src={imgSrc}
          alt={imgAlt}
          onLoad={loadedImageHandler}
          onError={loadingErrorHandler}
          {...imgOptions}
          style={
            !imgLoaded
              ? { height: 0, width: 0, margin: 0, padding: 0, letterSpacing: 0, lineHeight: 0, position: 'fixed', top: 0, left: '50%' }
              : {}
          }
        />
      )}
    </>
  );
}
