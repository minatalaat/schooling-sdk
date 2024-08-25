import { useEffect, useState } from 'react';

export const useWindowSize = () => {
  const [windosSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);

  useEffect(() => {
    const handleWindowResize = () => {
      setWindowSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  });

  return { width: windosSize[0], height: windosSize[1] };
};
