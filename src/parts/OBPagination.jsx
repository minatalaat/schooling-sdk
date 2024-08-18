import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import ExamplePrevious from '../assets/images/example_previous.svg';
import ExampleNext from '../assets/images/example_next.svg';
import ExamplePreviousAr from '../assets/images/example_previous_ar.svg';
import ExampleNextAr from '../assets/images/example_next_ar.svg';

const OBPagination = props => {
  const location = useLocation();
  let OBPage = props.OBPage;
  let setOBPage = props.setOBPage;
  let totalPagesOB = props.totalPagesOB;


  const onPrevClick = () => {
    if (OBPage > 1) {
      setOBPage(OBPage - 1);
    }
  };

  const isPrevDisabled = () => {
    return OBPage === 1;
  };

  const isNextDisabled = () => {
    if (OBPage && totalPagesOB) {
      return OBPage >= totalPagesOB;
    }
  };

  const onNextClick = () => {
    if (OBPage && totalPagesOB) {
      if (OBPage < totalPagesOB) {
        setOBPage(OBPage + 1);
      }
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
                  {OBPage}
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

export default OBPagination;
