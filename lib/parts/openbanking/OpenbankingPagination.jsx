import { useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';

import ExamplePrevious from '../assets/images/example_previous.svg';
import ExampleNext from '../assets/images/example_next.svg';
import ExamplePreviousAr from '../assets/images/example_previous_ar.svg';
import ExampleNextAr from '../assets/images/example_next_ar.svg';

const OpenbankingPagination = ({ total }) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  let pageSize = parseInt(searchParams.get('pageSize') || 10);
  let currentPage = parseInt(searchParams.get('currentPage') || 1);
  let pageCount = Math.ceil(total / pageSize) - 1;
  let offset = (currentPage - 1) * pageSize;
  let range = [...Array(pageCount + 1).keys()];

  useEffect(() => {
    pageCount = Math.ceil(total / pageSize) - 1;
  }, [total]);

  const isPrevDisabled = () => {
    return offset === 0;
  };

  const isNextDisabled = () => {
    return offset + pageSize >= total;
  };

  const getLocationSearch = page => {
    let params = new URLSearchParams(location.search);
    params.set('currentPage', page);
    return params.toString();
  };

  const getMinRange = () => {
    if (currentPage === 1) return currentPage - 1;
    if (currentPage === pageCount + 1) return Math.max(currentPage - 3, 0);
    return Math.max(currentPage - 2, 0);
  };

  const getMaxRange = () => {
    if (currentPage === 1) return Math.min(currentPage + 2, pageCount + 1);
    if (currentPage === pageCount + 1) return currentPage;
    return currentPage + 1;
  };

  return (
    <>
      <div className="row">
        <div className="col-md-4 mt-4">
          <div className="pagination-new">
            <ul className="pagination">
              <li className={isPrevDisabled() ? 'disabled' : ''}>
                <Link
                  to={{
                    pathname: location.pathname,
                    search: `?${getLocationSearch(currentPage - 1)}`,
                  }}
                  style={{ pointerEvents: isPrevDisabled() ? 'none' : '' }}
                >
                  <img
                    src={localStorage.getItem('code') === 'en' ? ExamplePrevious : ExamplePreviousAr}
                    alt={localStorage.getItem('code') === 'en' ? ExamplePrevious : ExamplePreviousAr}
                  />
                </Link>
              </li>
              {range &&
                range.slice(getMinRange(), getMaxRange()).map(pageNum => {
                  return (
                    <li className={pageNum + 1 === currentPage ? 'active' : ''} key={pageNum}>
                      <Link
                        to={{
                          pathname: location.pathname,
                          search: `?${getLocationSearch(pageNum + 1)}`,
                        }}
                      >
                        {pageNum + 1}
                      </Link>
                    </li>
                  );
                })}
              <li className={isNextDisabled() ? 'disabled' : ''}>
                <Link
                  to={{
                    pathname: location.pathname,
                    search: `?${getLocationSearch(currentPage + 1)}`,
                  }}
                  style={{ pointerEvents: isNextDisabled() ? 'none' : '' }}
                >
                  <img
                    src={localStorage.getItem('code') === 'en' ? ExampleNext : ExampleNextAr}
                    alt={localStorage.getItem('code') === 'en' ? ExampleNext : ExampleNextAr}
                  />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default OpenbankingPagination;
