import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Spinner from '../../components/Spinner/Spinner';
import i18n from 'i18next';

import NoData from '../../components/NoData';
import BreadCrumb from '../../components/ui/BreadCrumb';
import Calendar from '../../components/ui/Calendar';

import arrowTbDown from '../../assets/images/arrow-tb-down.svg';
import NoAccountsImg from '../../assets/images/icons/chart of account.svg';

import { useFeatures } from '../../hooks/useFeatures';
import { FaCheckCircle } from 'react-icons/fa';

const ChartOfAccountsList = ({ COAData, fetchData, parentsCount, isLoading }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getFeaturePath } = useFeatures();

  const [expanded, setExpanded] = useState([]);
  const [opened, setOpened] = useState([]);

  const HandleExpansion = ({ row, level }) => {
    if (row._children > 0) {
      return (
        <a
          id="button-tb"
          runat="server"
          className="clickable"
          style={i18n.dir() === 'ltr' ? { marginLeft: `${level * 2}rem` } : { marginRight: `${level * 2}rem` }}
          onClick={() => {
            if (typeof row.isExpanded !== 'undefined') {
              row.isExpanded = !row.isExpanded;
            } else {
              row.isExpanded = true;
            }

            let newExpandedArr = [...expanded];

            if (row.isExpanded) {
              newExpandedArr.push(row);
              setExpanded([...newExpandedArr]);
            } else {
              const indexOfObject = expanded.findIndex(object => {
                return object.id === row.id;
              });
              newExpandedArr.splice(indexOfObject, 1);
              setExpanded([...newExpandedArr]);
            }
          }}
        >
          <img
            src={arrowTbDown}
            alt="arrow-tb-down"
            style={
              i18n.dir() === 'ltr'
                ? !row.isExpanded
                  ? {
                      transform: 'rotate(-90deg)',
                      transitionProperty: 'transform',
                      transitionDuration: '0.1s',
                      marginRight: '0.5rem',
                    }
                  : {
                      transform: 'rotate(0)',
                      transitionProperty: 'transform',
                      transitionDuration: '0.1s',
                      marginRight: '0.5rem',
                    }
                : !row.isExpanded
                  ? {
                      transform: 'rotate(90deg)',
                      transitionProperty: 'transform',
                      transitionDuration: '0.1s',
                      marginRight: '0.5rem',
                    }
                  : {
                      transform: 'rotate(0)',
                      transitionProperty: 'transform',
                      transitionDuration: '0.1s',
                      marginRight: '0.5rem',
                    }
            }
          />
        </a>
      );
    } else {
      return (
        <FaCheckCircle
          color="green"
          size={17.5}
          style={{
            marginLeft: i18n.dir() === 'ltr' ? `${level * 2.5}rem` : '0.75rem',
            marginRight: i18n.dir() === 'ltr' ? `0.75rem` : `${level * 2.5}rem`,
            verticalAlign: 'middle',
            marginBottom: '0.15rem',
          }}
        />
      );
    }
  };

  const SubRow = ({ id, level }) => {
    const [loading, setLoading] = useState(false);
    let currentData = [...COAData];
    let filteredAccounts = currentData.filter(record => record.parentId === id);
    let newLevel = level + 1;
    useEffect(() => {
      if (filteredAccounts.length === 0) setLoading(true);
      if (filteredAccounts.length > 0) setLoading(false);
    }, [filteredAccounts]);
    return (
      <>
        {!loading &&
          filteredAccounts.map(account => {
            return (
              <React.Fragment key={account.name}>
                <tr className={!account._children ? 'leaf-color' : ''}>
                  <td>
                    <HandleExpansion row={account} level={newLevel} />
                    <span>{account.name}</span>
                  </td>
                  <td>{account.code}</td>
                  <td>{account['company.name']}</td>
                </tr>
                {account.isExpanded && <SubRow id={account.id} level={newLevel} />}
              </React.Fragment>
            );
          })}
        {loading && (
          <tr>
            <td></td>
            <td>{t('LOADING')}</td>
            <td></td>
          </tr>
        )}
      </>
    );
  };

  useEffect(() => {
    if (expanded.length > 0) {
      const lastAccount = expanded[expanded.length - 1];
      const rowObject = opened.find(object => {
        return object.id === lastAccount.id;
      });

      if (!rowObject) {
        fetchData(lastAccount.id);
        setOpened([...opened, lastAccount]);
      }
    }
  }, [expanded]);

  return (
    <>
      {isLoading && <Spinner />}
      {!isLoading && COAData.length === 0 && (
        <NoData
          imgSrc={NoAccountsImg}
          noDataMessage={t('NO_ACCOUNTS_DATA_MESSAGE')}
          addButtontext={t('LBL_ADD_FINANCIAL_ACCOUNT')}
          addButtonPath={getFeaturePath('FINANCIAL_ACCOUNTS', 'add')}
        />
      )}
      {COAData.length > 0 && (
        <div className="page-body">
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-12">
                <Calendar />
                <BreadCrumb feature="ACCOUNTING" subFeature="CHART_OF_ACCOUNTS" />
              </div>
            </div>
            <div className="row">
              <div className="col-md-12 mb-4">
                <div className="info-tite-page float-start">
                  <h4>{t('LBL_CHART_OF_ACCOUNTS')}</h4>
                </div>

                <div className="reverse-page float-end">
                  <button className="addbtn-action btn d-flex" onClick={() => navigate(getFeaturePath('FINANCIAL_ACCOUNTS'))}>
                    {t('LBL_FINANCIAL_ACCOUNTS')}
                  </button>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                {!isLoading && (
                  <div className="card">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="color-info">
                          <div className="info-2 col">
                            <p style={{ verticalAlign: 'middle' }}>
                              <FaCheckCircle
                                color="green"
                                size={16}
                                style={{
                                  marginLeft: i18n.dir() === 'ltr' ? '' : '0.75rem',
                                  marginRight: i18n.dir() === 'ltr' ? `0.75rem` : '',
                                  marginBottom: '0.15rem',
                                  verticalAlign: 'middle',
                                }}
                              />
                              {t('LBL_ACTIVE_ACCOUNTS')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-12">
                        <div className="tab-content d-block" id="pills-tabContent">
                          <div
                            className="table-responsive-new fade show active table-responsive"
                            id="pills-home"
                            role="tabpanel"
                            aria-labelledby="pills-home-tab"
                          >
                            <table className="table table-responsive-stack dataTable" id="tableOne">
                              <thead>
                                <tr>
                                  <th>{t('LBL_NAME')}</th>
                                  <th>{t('LBL_CODE')}</th>
                                  <th>{t('LBL_COMPANY')}</th>
                                </tr>
                              </thead>
                              <tbody id="table_detail">
                                {COAData.slice(0, parentsCount).map((row, i) => {
                                  row.level = 0;
                                  return (
                                    <React.Fragment key={row.name}>
                                      <tr className={!row._children ? 'leaf-color' : ''}>
                                        <td>
                                          <HandleExpansion row={row} />
                                          <span>{row.name}</span>
                                        </td>
                                        <td>{row.code}</td>
                                        <td>{row['company.name']}</td>
                                      </tr>
                                      {row.isExpanded && <SubRow id={row.id} level={row.level} />}
                                    </React.Fragment>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChartOfAccountsList;
