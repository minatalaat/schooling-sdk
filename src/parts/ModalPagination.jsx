import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import ExamplePrevious from '../assets/images/example_previous.svg';
import ExampleNext from '../assets/images/example_next.svg';
import ExamplePreviousAr from '../assets/images/example_previous_ar.svg';
import ExampleNextAr from '../assets/images/example_next_ar.svg';

const ModalPagination = props => {
  const location = useLocation();
  let offset = props.offset;
  let total = props.total;
  let setOffset = props.setOffset;
  let pageSize = props.pageSize;
  let currentPage = offset / pageSize + 1;

  const onPrevClick = () => {
    if (offset > 0) {
      setOffset(offset - pageSize);
    }
  };

  const isPrevDisabled = () => {
    return offset === 0;
  };

  const isNextDisabled = () => {
    return offset + pageSize >= total;
  };

  const onNextClick = () => {
    if (offset + pageSize < total) {
      setOffset(offset + pageSize);
    }
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
                    search: location.search,
                  }}
                  state={location.state}
                  onClick={() => onPrevClick()}
                  style={{ pointerEvents: isPrevDisabled() ? 'none' : '' }}
                >
                  <img
                    src={localStorage.getItem('code') === 'en' ? ExamplePrevious : ExamplePreviousAr}
                    alt={localStorage.getItem('code') === 'en' ? ExamplePrevious : ExamplePreviousAr}
                  />
                </Link>
              </li>
              <li className="active">
                <Link
                  to={{
                    pathname: location.pathname,
                    search: location.search,
                  }}
                  state={location.state}
                >
                  {currentPage}
                </Link>
              </li>
              <li className={isNextDisabled() ? 'disabled' : ''}>
                <Link
                  to={{
                    pathname: location.pathname,
                    search: location.search,
                  }}
                  state={location.state}
                  onClick={() => onNextClick()}
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

export default ModalPagination;
