import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useSearchParams } from 'react-router-dom';

const Pagination = ({ total }) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const { t } = useTranslation();

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

  const lastPage = Number(range.length);
  const firstPage = Number(range[0] + 1);

  return (
    <>
      <nav className="pagination-container">
        <div className="pagination-wrapper">
          <span href="#" className="next-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21" fill="none">
              <path
                d="M12.5 5.10004L7.5 10.1L12.5 15.1"
                stroke="#151538"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
            <span className="next-text">
              <Link
                to={{
                  pathname: location.pathname,
                  search: `?${getLocationSearch(currentPage - 1)}`,
                }}
                style={{ pointerEvents: isPrevDisabled() ? 'none' : '' }}
              >
                {t('Invoicing_btnPrevious')}
              </Link>
            </span>
          </span>
          <div className="page-numbers">
            {currentPage - firstPage >= 2 ? (
              <>
                <Link
                  to={{
                    pathname: location.pathname,
                    search: `?${getLocationSearch(firstPage)}`,
                  }}
                  className="page-link"
                >
                  {firstPage}
                </Link>
                <span className="ellipsis">...</span>
              </>
            ) : null}
            {range &&
              range.slice(getMinRange(), getMaxRange()).map(pageNum => {
                return (
                  <>
                    <Link
                      to={{
                        pathname: location.pathname,
                        search: `?${getLocationSearch(pageNum + 1)}`,
                      }}
                      className={pageNum + 1 === currentPage ? 'current-page' : 'page-link'}
                      key={pageNum}
                    >
                      {pageNum + 1}
                    </Link>
                  </>
                );
              })}
            {lastPage - currentPage >= 2 ? (
              <>
                <span className="ellipsis">...</span>
                <Link
                  to={{
                    pathname: location.pathname,
                    search: `?${getLocationSearch(lastPage)}`,
                  }}
                  className="page-link"
                >
                  {lastPage}
                </Link>
              </>
            ) : null}
          </div>
          <a className="previous-button">
            <span className="previous-text">
              <Link
                to={{
                  pathname: location.pathname,
                  search: `?${getLocationSearch(currentPage + 1)}`,
                }}
                style={{ pointerEvents: isNextDisabled() ? 'none' : '' }}
              >
                {t('LBL_NEXT')}
              </Link>
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21" fill="none">
              <path d="M8 5.10004L13 10.1L8 15.1" stroke="#151538" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </a>
        </div>
      </nav>
    </>
  );
};

export default Pagination;
