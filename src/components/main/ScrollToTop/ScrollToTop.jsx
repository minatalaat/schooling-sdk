import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();
  const [prevPath, setPrevPath] = useState(pathname);

  useEffect(() => {
    if (prevPath !== pathname) {
      setPrevPath(pathname);
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}
