import React from 'react';
import EditIconBtn from '../assets/images/edit-icon.svg';
import RefreshIconTb from '../assets/images/refresh-icon-tb-header.svg';
import DeleteIconBtn from '../assets/images/delete-icon.svg';
import AddIcon from '../assets/images/Add-icon.svg';
import CloseSquareDuotone from '../assets/images/Close_square_duotone.svg';
import FilterIconTb from '../assets/images/filter-icon-tb.svg';
import EditIconTb from '../assets/images/edit-icon-tb-header.svg';
import { useState } from 'react';

const Customers2 = () => {
  const bulkActions = [
    { name: 'Bulk Action', value: '' },
    { name: '1', value: '1' },
    { name: '2', value: '2' },
    { name: '3', value: '3' },
  ];
  const showOptions = [
    { name: '10', value: '10' },
    { name: '25', value: '25' },
    { name: '50', value: '50' },
    { name: '100', value: '100' },
  ];
  const companies = [
    { name: 'Ejada Systems', code: 'ESL99', address: 'Riyadh, Saudi Arabia' },
    { name: 'Ejada Systems', code: 'ESL99', address: 'Riyadh, Saudi Arabia' },
    { name: 'Ejada Systems', code: 'ESL99', address: 'Riyadh, Saudi Arabia' },
    { name: 'Ejada Systems', code: 'ESL99', address: 'Riyadh, Saudi Arabia' },
    { name: 'Ejada Systems', code: 'ESL99', address: 'Riyadh, Saudi Arabia' },
    { name: 'Ejada Systems', code: 'ESL99', address: 'Riyadh, Saudi Arabia' },
    { name: 'Ejada Systems', code: 'ESL99', address: 'Riyadh, Saudi Arabia' },
    { name: 'Ejada Systems', code: 'ESL99', address: 'Riyadh, Saudi Arabia' },
    { name: 'Ejada Systems', code: 'ESL99', address: 'Riyadh, Saudi Arabia' },
    { name: 'Ejada Systems', code: 'ESL99', address: 'Riyadh, Saudi Arabia' },
    { name: 'Ejada Systems', code: 'ESL99', address: 'Riyadh, Saudi Arabia' },
    { name: 'Ejada Systems', code: 'ESL99', address: 'Riyadh, Saudi Arabia' },
    { name: 'Ejada Systems', code: 'ESL99', address: 'Riyadh, Saudi Arabia' },
    { name: 'Ejada Systems', code: 'ESL99', address: 'Riyadh, Saudi Arabia' },
    { name: 'Ejada Systems', code: 'ESL99', address: 'Riyadh, Saudi Arabia' },
    { name: 'Ejada Systems', code: 'ESL99', address: 'Riyadh, Saudi Arabia' },
    { name: 'Ejada Systems', code: 'ESL99', address: 'Riyadh, Saudi Arabia' },
    { name: 'Ejada Systems', code: 'ESL99', address: 'Riyadh, Saudi Arabia' },
    { name: 'Ejada Systems', code: 'ESL10', address: 'Riyadh, Saudi Arabia' },
  ];

  const [checkedCompanies, setChecked] = useState(new Array(companies.length).fill(false));

  const toggleCheck = index => {
    setChecked(prev =>
      prev.map((el, i) => {
        if (i === index) {
          el = !el;
          return el;
        } else return el;
      })
    );
  };
  //   useEffect(() => {
  //     let checked = new Array(companies.length)
  //     checked.fill(false)
  //     setChecked(checked);
  //   }, [checkedCompanies, companies]);

  return (
    <div className="page-body">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div id="tabs">
                <nav>
                  <div className="nav nav-tabs" id="nav-tab" role="tablist">
                    <ul className="nav">
                      <li className="nav-item">
                        <button
                          className="nav-link"
                          id="nav-Application-tab"
                          data-bs-toggle="tab"
                          data-bs-target="#nav-1"
                          type="button"
                          role="tab"
                          aria-controls="nav-home"
                          aria-selected="true"
                        >
                          Application Management{' '}
                          <span className="close-tab">
                            <img src={CloseSquareDuotone} alt={CloseSquareDuotone} />
                          </span>
                        </button>
                      </li>
                      <li className="nav-item">
                        <button
                          className="nav-link active"
                          id="nav-Companies-tab"
                          data-bs-toggle="tab"
                          data-bs-target="#nav-2"
                          type="button"
                          role="tab"
                          aria-controls="nav-profile"
                          aria-selected="false"
                        >
                          Companies{' '}
                          <span className="close-tab">
                            <img src={CloseSquareDuotone} alt={CloseSquareDuotone} />
                          </span>
                        </button>
                      </li>

                      <button type="button" className="btn btn-primary btn-add">
                        <img src={AddIcon} alt={AddIcon} /> add company
                      </button>
                    </ul>
                  </div>
                </nav>

                <div className="tab-content d-block" id="nav-tabContent">
                  {/* <div
                    className="tab-pane fade"
                    id="nav-1"
                    role="tabpanel"
                    aria-labelledby="nav-home-tab"
                  >
                    This is some placeholder content the Home tab's associated
                    content. Clicking another tab will toggle the visibility of
                    this one for the next. The tab JavaScript swaps classes to
                    control the content visibility and styling. You can use it
                    with tabs, pills, and any other .nav-powered navigation. 1
                  </div> */}
                  <div className="tab-pane fade show active" id="nav-2" role="tabpanel" aria-labelledby="nav-profile-tab">
                    <div className="left-filter-tb">
                      <select className="form-select select-1 float-end mb-3 col-1">
                        {bulkActions && bulkActions.map(action => <option value={action.value}>{action.name}</option>)}
                      </select>
                      <ul>
                        <li>
                          <a href="/">
                            <img src={EditIconBtn} alt={EditIconBtn} />
                          </a>
                        </li>
                        <li>
                          <a href="/">
                            <img src={RefreshIconTb} alt={RefreshIconTb} />
                          </a>
                        </li>
                        <li>
                          <a href="/">
                            <img src={DeleteIconBtn} alt={DeleteIconBtn} />
                          </a>
                        </li>
                      </ul>
                    </div>
                    <div id="example_wrapper" className="dataTables_wrapper no-footer">
                      <div className="dataTables_length" id="example_length">
                        <label>
                          Show
                          <select name="example_length" aria-controls="example" className="">
                            {showOptions && showOptions.map(option => <option value={option.value}>{option.name}</option>)}
                          </select>
                        </label>
                      </div>
                      <div id="example_filter" className="dataTables_filter ">
                        <label>
                          <ul className="custom-filter">
                            <li>
                              <a href="/">
                                <img src={FilterIconTb} alt={FilterIconTb} />
                              </a>
                            </li>
                            <li>
                              <a href="/">
                                <img src={EditIconTb} alt={EditIconTb} />
                              </a>
                            </li>
                          </ul>
                          <input type="search" className="form-control" placeholder="Search" aria-controls="example" />
                        </label>
                      </div>
                      <table
                        id="example"
                        className="display dataTable no-footer"
                        style={{ width: '100%' }}
                        data-ordering="false"
                        aria-describedby="example_info"
                      >
                        <thead>
                          <tr>
                            <th width="20">
                              <input className="form-check-input" type="checkbox" onClick="toggle(this);" value="" id="defaultCheck1" />
                            </th>
                            <th>Name</th>
                            <th>Code</th>
                            <th>Address</th>
                            <th width="20">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {companies &&
                            companies.map((company, index) => (
                              <tr
                                className={`${index % 2 === 0 ? 'odd' : 'even'} ${
                                  checkedCompanies[index] === true ? ' primary-color' : ''
                                }`}
                              >
                                <td>
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    name="chkOrgRow"
                                    value=""
                                    id="defaultCheck1"
                                    onChange={() => toggleCheck(index)}
                                  />
                                </td>
                                <td>{company.name}</td>
                                <td>{company.code}</td>
                                <td>{company.address}</td>
                                <td>
                                  <ul>
                                    <li className="edit-row">
                                      <a href="/">
                                        <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path
                                            d="M18.0658 17.156C18.0658 18.0903 17.3066 18.8781 16.3726 18.8781H2.82256C1.88831 18.8781 1.12929 18.0903 1.12929 17.156L1.12911 3.60602C1.12911 2.67177 1.88832 1.94029 2.82238 1.94029H10.7262L10.7264 0.812042H2.82256C1.26598 0.812042 0 2.05053 0 3.60711V17.1558C0 18.7123 1.26598 20.0059 2.82256 20.0059H16.3712C17.9278 20.0059 19.1938 18.7113 19.1938 17.1558V9.27969H18.0644V17.1558L18.0658 17.156Z"
                                            fill="#686868"
                                          />
                                          <path
                                            d="M19.3383 0.640226C18.4857 -0.213409 16.9982 -0.213409 16.1446 0.640226L8.57069 8.21411C8.49862 8.28617 8.44661 8.37742 8.42229 8.47593L7.62509 11.6686C7.57734 11.8605 7.63362 12.0641 7.77349 12.2053C7.88053 12.3123 8.02484 12.3707 8.17217 12.3707C8.21779 12.3707 8.26341 12.3654 8.30903 12.3536L11.5028 11.5552C11.6024 11.5309 11.6925 11.4789 11.7646 11.4068L19.3385 3.83295C19.7647 3.40675 20.0001 2.83944 20.0001 2.23606C20.0001 1.6329 19.7656 1.06664 19.3383 0.640258L19.3383 0.640226ZM11.0773 10.498L8.94827 11.0304L9.48062 8.90133L15.7462 2.63574L17.3431 4.23263L11.0773 10.498ZM18.5399 3.03413L18.1412 3.43282L16.5443 1.83592L16.943 1.43724C17.3692 1.01104 18.1137 1.01104 18.5399 1.43724C18.7531 1.65043 18.8708 1.93356 18.8708 2.23566C18.8708 2.53796 18.7531 2.8211 18.5399 3.03409V3.03413Z"
                                            fill="#686868"
                                          />
                                        </svg>
                                      </a>
                                    </li>
                                    <li className="delete-row">
                                      <a href="/">
                                        <svg width="16" height="23" viewBox="0 0 16 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path
                                            d="M15.2819 2.20904H11.3482V0.718138C11.3482 0.321562 11.0267 0 10.6301 0H5.36999C4.97342 0 4.65186 0.321519 4.65186 0.718138V2.20904H0.718138C0.321562 2.20904 0 2.53056 0 2.92718V5.13618C0 5.53275 0.321519 5.85432 0.718138 5.85432H0.936298L1.59267 21.3348C1.60893 21.7192 1.92537 22.0225 2.31012 22.0225H13.6899C14.0747 22.0225 14.3911 21.7192 14.4073 21.3348L15.0637 5.85427H15.2819C15.6784 5.85427 16 5.53275 16 5.13614V2.92718C16.0001 2.53052 15.6786 2.20904 15.2819 2.20904ZM6.08813 1.43623H9.91195V2.20904H6.08813V1.43623V1.43623ZM13.0016 20.5862H2.99845L2.37382 5.85432H13.6262L13.0016 20.5862ZM14.5638 4.41804C13.9113 4.41804 1.82718 4.41804 1.43628 4.41804V3.64528H14.5638V4.41804Z"
                                            fill="#686868"
                                          />
                                          <path
                                            d="M5.1112 8.05644C4.71463 8.05644 4.39307 8.37796 4.39307 8.77458V17.6659C4.39307 18.0625 4.71459 18.384 5.1112 18.384C5.50778 18.384 5.82934 18.0625 5.82934 17.6659V8.77458C5.8293 8.37796 5.50778 8.05644 5.1112 8.05644Z"
                                            fill="#686868"
                                          />
                                          <path
                                            d="M7.99988 8.05644C7.6033 8.05644 7.28174 8.37796 7.28174 8.77458V17.6659C7.28174 18.0625 7.60321 18.384 7.99988 18.384C8.39645 18.384 8.71802 18.0625 8.71802 17.6659V8.77458C8.71797 8.37796 8.39645 8.05644 7.99988 8.05644Z"
                                            fill="#686868"
                                          />
                                          <path
                                            d="M10.8888 8.05644C10.4922 8.05644 10.1707 8.37796 10.1707 8.77458V17.6659C10.1707 18.0625 10.4922 18.384 10.8888 18.384C11.2854 18.384 11.6069 18.0625 11.6069 17.6659V8.77458C11.6069 8.37796 11.2854 8.05644 10.8888 8.05644Z"
                                            fill="#686868"
                                          />
                                        </svg>
                                      </a>
                                    </li>
                                  </ul>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                      <div className="dataTables_info" id="example_info" role="status" aria-live="polite">
                        Showing 1 to 10 of 25{' '}
                      </div>
                      <div className="dataTables_paginate paging_simple_numbers" id="example_paginate">
                        <a
                          className="paginate_button previous disabled"
                          aria-controls="example"
                          data-dt-idx="0"
                          tabIndex="-1"
                          id="example_previous"
                        >
                          Previous
                        </a>
                        <span>
                          <a className="paginate_button current" aria-controls="example" data-dt-idx="1" tabIndex="0">
                            1
                          </a>
                          <a className="paginate_button " aria-controls="example" data-dt-idx="2" tabIndex="0">
                            2
                          </a>
                          <a className="paginate_button " aria-controls="example" data-dt-idx="3" tabIndex="0">
                            3
                          </a>
                        </span>
                        <a className="paginate_button next" aria-controls="example" data-dt-idx="4" tabIndex="0" id="example_next">
                          Next
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customers2;
