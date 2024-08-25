import React from 'react';
import AddIcon from '../assets/images/Add-icon.svg';
import SettingsIconHeader from '../assets/images/Setting-icon-header.svg';
import AlrajhiBankLogo from '../assets/images/alrajhi-logo.png';
import RiyadLogo from '../assets/images/riyad-logo.png';
import TsibLogo from '../assets/images/tsib-logo.png';
import AnbLogo from '../assets/images/anb-logo.png';
import NcbLogo from '../assets/images/ncb-logo.png';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

function Banking() {
  const { t } = useTranslation();
  let balances = [
    {
      label: 'TOTAL_BANK_BALANCE',
      balance: '2,033.00',
      totalReconsilation: '228',
      transactions: '120',
      percentage: '90',
    },
    {
      label: 'ACCOUNT_NAME',
      balance: '2,033.00',
      totalReconsilation: '230',
      transactions: '119',
      percentage: '72',
    },
    {
      label: 'TOTAL_BANK_BALANCE',
      balance: '2,033.00',
      totalReconsilation: '228',
      transactions: '120',
      percentage: '55',
    },
    {
      label: 'ACCOUNT_NAME',
      balance: '2,033.00',
      totalReconsilation: '230',
      transactions: '119',
      percentage: '65',
    },
  ];
  let accounts = [
    {
      accountName: 'ACCOUNT_NAME',
      balance: '2,033.00',
      currentBalance: '-3,423',
      bank: {
        imgSrc: AlrajhiBankLogo,
      },
      reconcile: '29',
      transactions: '100',
      latestStatments: '120,000',
    },
    {
      accountName: 'ACCOUNT_NAME',
      balance: '2,033.00',
      currentBalance: '1500',
      bank: {
        imgSrc: RiyadLogo,
      },
      reconcile: '28',
      transactions: '150',
      latestStatments: '120,000',
    },
    {
      accountName: 'ACCOUNT_NAME',
      balance: '2,033.00',
      currentBalance: '-1800',
      bank: {
        imgSrc: TsibLogo,
      },
      reconcile: '30',
      transactions: '200',
      latestStatments: '120,000',
    },
  ];
  let bankStatments = [
    {
      statementBalance: '3,423',
      closingBalance: '1,423',
      currentBalance: '-2,000',
      accounts: [
        {
          accountName: 'ACCOUNT_NAME',
          numberOfTimes: 12,
        },
        {
          accountName: 'ACCOUNT_NAME',
          numberOfTimes: 12,
        },
        {
          accountName: 'ACCOUNT_NAME',
          numberOfTimes: 12,
        },
        {
          accountName: 'ACCOUNT_NAME',
          numberOfTimes: 12,
        },
      ],
    },
    {
      statementBalance: '3,423',
      closingBalance: '1,423',
      currentBalance: '-2,000',
      accounts: [
        {
          accountName: 'ACCOUNT_NAME',
          numberOfTimes: 12,
        },
        {
          accountName: 'ACCOUNT_NAME',
          numberOfTimes: 12,
        },
        {
          accountName: 'ACCOUNT_NAME',
          numberOfTimes: 12,
        },
        {
          accountName: 'ACCOUNT_NAME',
          numberOfTimes: 12,
        },
      ],
    },
  ];
  let supportedBanks = [
    {
      imgSrc: AlrajhiBankLogo,
      bankName: 'ALRAJHI_BANK',
    },
    {
      imgSrc: RiyadLogo,
      bankName: 'RIYAD_BANK',
    },
    {
      imgSrc: TsibLogo,
      bankName: 'THE_SAUDI_INVESTMENT_BANK',
    },
    {
      imgSrc: AnbLogo,
      bankName: 'ALARABY_NATIONAL_BANK',
    },
    {
      imgSrc: NcbLogo,
      bankName: 'NATIONAL_CAPITAL_BANK',
    },
    {
      imgSrc: NcbLogo,
      bankName: 'NATIONAL_CAPITAL_BANK',
    },
  ];
  return (
    <div className="page-body">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12 mt-3">
            <div className="titlesection float-start">
              <h5>{t('Footer_Banking')}</h5>
            </div>
            <div className="actionesection float-end">
              <Link to="/accounts/addaccount" className="btn-action-section text-decoration-none">
                {t('ACCOUNT_LINKING')}
              </Link>
            </div>
          </div>
        </div>

        <div className="row">
          {balances.map((balance, index) => {
            return (
              <div className="col-md-6">
                <div className="card banking-card card-color-1">
                  <div className="card-header-color-1">
                    <h5 className="float-start mb-0">{t(balance.label)}</h5>
                  </div>
                  <div className="card-body-q pt-0">
                    <div className="cel-top-chart float-end">
                      <div className="circlechart" data-percentage="92">
                        <svg className="circle-chart" viewBox="0 0 33.83098862 33.83098862" xmlns="http://www.w3.org/2000/svg">
                          <circle className="circle-chart__background" cx="16.9" cy="16.9" r="15.9"></circle>
                          <circle
                            className="circle-chart__circle stroke-1"
                            strokeDasharray={`${balance.percentage},100`}
                            cx="16.9"
                            cy="16.9"
                            r="15.9"
                          ></circle>
                          <g className="circle-chart__info">
                            {' '}
                            <text className="circle-chart__percent" x="17.9" y="15.5">{`${balance.percentage}%`}</text>
                          </g>
                        </svg>
                      </div>
                    </div>

                    <div className="cel-top-chart float-start">
                      <h1>
                        {balance.balance} <span>{t('LBL_SAR')}</span>
                      </h1>
                      <ul>
                        <li>
                          <p>
                            {t('TOTAL_RECONCILATION')} <span>{balance.totalReconsilation}</span>
                          </p>
                        </li>
                        <li>
                          <p>
                            {t('LBL_TRANSACTIONS')} <span>{balance.transactions}</span>
                          </p>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {/* <div className="col-md-6">
                        <div className="card banking-card card-color-1">
                            <div className="card-header-color-1">
                                <h5 className="float-start mb-0">{t('TOTAL_BANK_BALANCE')}</h5>
                            </div>
                            <div className="card-body-q pt-0">

                                <div className="cel-top-chart float-end">

                                    <div className="circlechart" data-percentage="92"><svg className="circle-chart" viewBox="0 0 33.83098862 33.83098862" xmlns="http://www.w3.org/2000/svg">
                                        <circle className="circle-chart__background" cx="16.9" cy="16.9" r="15.9"></circle>
                                        <circle className="circle-chart__circle stroke-1" strokeDasharray="75,100" cx="16.9" cy="16.9" r="15.9"></circle>
                                        <g className="circle-chart__info"> <text className="circle-chart__percent" x="17.9" y="15.5">75%</text></g>
                                    </svg></div>

                                </div>

                                <div className="cel-top-chart float-start">
                                    <h1>2,033.00 <span>{t('LBL_SAR')}</span></h1>
                                    <ul>
                                        <li>
                                            <p>{t('TOTAL_RECONCILATION')} <span>228</span></p>
                                        </li>
                                        <li>
                                            <p>{t('LBL_TRANSACTIONS')} <span>120</span></p>
                                        </li>
                                    </ul>
                                </div>

                            </div>
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="card banking-card card-color-2">
                            <div className="card-header-color-2">
                                <h5 className="float-start mb-0">{t('ACCOUNT_NAME')} </h5>
                            </div>
                            <div className="card-body-q pt-0">
                                <div className="cel-top-chart float-end">
                                    <div className="circlechart" data-percentage="92"><svg className="circle-chart" viewBox="0 0 33.83098862 33.83098862" xmlns="http://www.w3.org/2000/svg">
                                        <circle className="circle-chart__background" cx="16.9" cy="16.9" r="15.9"></circle>
                                        <circle className="circle-chart__circle stroke-2" strokeDasharray="75,100" cx="16.9" cy="16.9" r="15.9"></circle>
                                        <g className="circle-chart__info"> <text className="circle-chart__percent" x="17.9" y="15.5">75%</text></g>
                                    </svg></div>
                                </div>

                                <div className="cel-top-chart float-start">
                                    <h1>2,033.00 <span>{t('LBL_SAR')}</span></h1>
                                    <ul>
                                        <li>
                                            <p>{t('TOTAL_RECONCILATION')}<span>228</span></p>
                                        </li>
                                        <li>
                                            <p>{t('LBL_TRANSACTIONS')}  <span>120</span></p>
                                        </li>
                                    </ul>
                                </div>

                            </div>
                        </div>
                    </div> */}
        </div>

        <div className="row">
          <div className="col-md-12 mt-5">
            <div className="titlesection float-start">
              <h5>{t('BANK_ACCOUNTS')}</h5>
            </div>

            <div className="actionesection float-end">
              <Link to="/accounts/addaccount" className="btn-add-section  text-decoration-none">
                <img src={AddIcon} alt={AddIcon} />
                {t('ADD_ACCOUNT')}
              </Link>
            </div>
          </div>
        </div>

        <div className="row">
          {accounts.map(account => {
            return (
              <div className="col-md-4">
                <div className="card banking-card">
                  <div className="card-header">
                    <h5 className="float-start mb-0">{t(account.accountName)} </h5>
                    <div className="float-end mb-0">
                      <div className="btn-group">
                        <button type="button" className="btn dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                          <img src={SettingsIconHeader} alt={SettingsIconHeader} />
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                          <li>
                            <button className="dropdown-item" type="button">
                              {t('ACTION')}
                            </button>
                          </li>
                          <li>
                            <button className="dropdown-item" type="button">
                              {t('ACTION')}
                            </button>
                          </li>
                          <li>
                            <button className="dropdown-item" type="button">
                              {t('ACTION')}
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="card-body-q pt-0">
                    <div className="cel-card-normal">
                      <div className="float-start code-1">
                        <h4>{t('BALANCE')}</h4>
                        <h1>
                          {account.balance}
                          <span>{t('LBL_SAR')}</span>
                        </h1>
                      </div>

                      <div className="float-end code-2">
                        <h4>{t('CURRENT_BALANCE')}</h4>
                        <h1>
                          {account.currentBalance} <span>{t('LBL_SAR')}</span>
                        </h1>
                      </div>
                    </div>

                    <div className="cel-card-normal">
                      <div className="float-start code-1">
                        <h2>{t('LBL_BANK_NAME')}</h2>
                      </div>

                      <div className="float-end code-2">
                        <img src={account.bank.imgSrc} alt={account.bank.imgSrc} />
                      </div>
                    </div>

                    <div className="cel-card-normal mb-0">
                      <div className="cel-text code-1">
                        <p className="title-cel float-start">{t('LBL_RECONCILE')}</p>
                        <p className="value-cel float-end">{account.reconcile}</p>
                      </div>

                      <div className="cel-text code-1">
                        <p className="title-cel float-start">{t('LBL_TRANSACTIONS')}</p>
                        <p className="value-cel float-end">{account.transactions}</p>
                      </div>

                      <div className="cel-text code-1">
                        <p className="title-cel float-start">{t('LASTEST_STATEMENT')}</p>
                        <p className="value-cel float-end">
                          {t('LBL_SAR')} {account.latestStatments}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* <div className="col-md-4">
                        <div className="card banking-card">
                            <div className="card-header">
                                <h5 className="float-start mb-0">{t('ACCOUNT_NAME')} </h5>
                                <div className="float-end mb-0">
                                    <div className="btn-group">
                                        <button type="button" className="btn dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                                            <img src={SettingsIconHeader} alt={SettingsIconHeader} />
                                        </button>
                                        <ul className="dropdown-menu dropdown-menu-end">
                                            <li><button className="dropdown-item" type="button">{t('ACTION')}</button></li>
                                            <li><button className="dropdown-item" type="button">{t('ACTION')}</button></li>
                                            <li><button className="dropdown-item" type="button">{t('ACTION')}</button></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body-q pt-0">

                                <div className="cel-card-normal">

                                    <div className="float-start code-1">
                                        <h4>{t('BALANCE')}</h4>
                                        <h1>2,033.00 <span>{t('LBL_SAR')}</span></h1>
                                    </div>

                                    <div className="float-end code-2">
                                        <h4>{t('CURRENT_BALANCE')}</h4>
                                        <h1>-3,423 <span>{t('LBL_SAR')}</span></h1>
                                    </div>

                                </div>

                                <div className="cel-card-normal">

                                    <div className="float-start code-1">
                                        <h2>{t('LBL_BANK_NAME')}</h2>
                                    </div>

                                    <div className="float-end code-2">
                                        <img src={AlrajhiBankLogo} alt={AlrajhiBankLogo} />
                                    </div>

                                </div>

                                <div className="cel-card-normal mb-0">

                                    <div className="cel-text code-1">
                                        <p className="title-cel float-start">{t('LBL_RECONCILE')}</p>
                                        <p className="value-cel float-end">28</p>
                                    </div>

                                    <div className="cel-text code-1">
                                        <p className="title-cel float-start">{t('LBL_TRANSACTIONS')}</p>
                                        <p className="value-cel float-end">120</p>
                                    </div>

                                    <div className="cel-text code-1">
                                        <p className="title-cel float-start">{t('LASTEST_STATEMENT')}</p>
                                        <p className="value-cel float-end">{t('LBL_SAR')} 120,000</p>
                                    </div>

                                </div>

                            </div>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card banking-card">
                            <div className="card-header">
                                <h5 className="float-start mb-0">{t('ACCOUNT_NAME')} </h5>
                                <div className="float-end mb-0">
                                    <div className="btn-group">
                                        <button type="button" className="btn dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                                            <img src={SettingsIconHeader} alt={SettingsIconHeader} />
                                        </button>
                                        <ul className="dropdown-menu dropdown-menu-end">
                                            <li><button className="dropdown-item" type="button">{t('ACTION')}</button></li>
                                            <li><button className="dropdown-item" type="button">{t('ACTION')}</button></li>
                                            <li><button className="dropdown-item" type="button">{t('ACTION')}</button></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body-q pt-0">

                                <div className="cel-card-normal">

                                    <div className="float-start code-1">
                                        <h4>{t('BALANCE')}</h4>
                                        <h1>2,033.00 <span>{t('LBL_SAR')}</span></h1>
                                    </div>

                                    <div className="float-end code-2">
                                        <h4>{t('CURRENT_BALANCE')}</h4>
                                        <h1>-3,423<span>{t('LBL_SAR')}</span></h1>
                                    </div>

                                </div>

                                <div className="cel-card-normal">

                                    <div className="float-start code-1">
                                        <h2>{t('LBL_BANK_NAME')}</h2>
                                    </div>

                                    <div className="float-end code-2">
                                        <img src={RiyadLogo} alt={RiyadLogo} />
                                    </div>

                                </div>

                                <div className="cel-card-normal mb-0">

                                    <div className="cel-text code-1">
                                        <p className="title-cel float-start">{t('LBL_RECONCILE')}</p>
                                        <p className="value-cel float-end">28</p>
                                    </div>

                                    <div className="cel-text code-1">
                                        <p className="title-cel float-start">{t('LBL_TRANSACTIONS')}</p>
                                        <p className="value-cel float-end">120</p>
                                    </div>

                                    <div className="cel-text code-1">
                                        <p className="title-cel float-start">{t('LASTEST_STATEMENT')}</p>
                                        <p className="value-cel float-end">{t('LBL_SAR')} 120,000</p>
                                    </div>

                                </div>

                            </div>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card banking-card">
                            <div className="card-header">
                                <h5 className="float-start mb-0">{t('ACCOUNT_NAME')} </h5>
                                <div className="float-end mb-0">
                                    <div className="btn-group">
                                        <button type="button" className="btn dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                                            <img src={SettingsIconHeader} alt={SettingsIconHeader} />
                                        </button>
                                        <ul className="dropdown-menu dropdown-menu-end">
                                            <li><button className="dropdown-item" type="button">{t('ACTION')}</button></li>
                                            <li><button className="dropdown-item" type="button">{t('ACTION')}</button></li>
                                            <li><button className="dropdown-item" type="button">{t('ACTION')}</button></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body-q pt-0">

                                <div className="cel-card-normal">

                                    <div className="float-start code-1">
                                        <h4>{t('BALANCE')}</h4>
                                        <h1>2,033.00 <span>{t('LBL_SAR')}</span></h1>
                                    </div>

                                    <div className="float-end code-2">
                                        <h4>{t('CURRENT_BALANCE')}</h4>
                                        <h1>-3,423 SAR <span>{t('LBL_SAR')}</span></h1>
                                    </div>

                                </div>

                                <div className="cel-card-normal">

                                    <div className="float-start code-1">
                                        <h2>{t('LBL_BANK_NAME')}</h2>
                                    </div>

                                    <div className="float-end code-2">
                                        <img src={TsibLogo} alt={TsibLogo} />
                                    </div>

                                </div>

                                <div className="cel-card-normal mb-0">

                                    <div className="cel-text code-1">
                                        <p className="title-cel float-start">{t('LBL_RECONCILE')}</p>
                                        <p className="value-cel float-end">28</p>
                                    </div>

                                    <div className="cel-text code-1">
                                        <p className="title-cel float-start">{t('LBL_TRANSACTIONS')}</p>
                                        <p className="value-cel float-end">120</p>
                                    </div>

                                    <div className="cel-text code-1">
                                        <p className="title-cel float-start">{t('LASTEST_STATEMENT')}</p>
                                        <p className="value-cel float-end">{t('LBL_SAR')} 120,000</p>
                                    </div>

                                </div>

                            </div>
                        </div>
                    </div> */}
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="titlesection mt-5">
              <h5>{t('BANK_ACCOUNTS')}</h5>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-8">
            <div className="card banking-card">
              <div className="card-header-q">
                <h5 className="float-start mb-0">{t('BANKS')}</h5>
                <a href="/" className="clearfix float-end btn pay-now-btn mt-0">
                  {t('LBL_RECONCILE')}
                </a>
              </div>
              <div className="card-body-q pt-0">
                {bankStatments.map(statement => {
                  return (
                    <>
                      <div className="row">
                        <div className="col-md-6 mt-5">
                          <div className="cel-right">
                            <div className="col float-start">
                              <svg xmlns="http://www.w3.org/2000/svg" id="sv" width="230" height="230" viewBox="0 0 180 180">
                                <path
                                  id="0"
                                  fill="#986BE5"
                                  d="M90, 0 A90,90 0 0 1 171.8689556950493,127.38280478244053 L144.57930379669952,114.92186985496035 A60,60 0 0 0 90,30 Z"
                                ></path>
                                <path
                                  id="1"
                                  fill="#1F4FDE"
                                  d="M171.8689556950493, 127.38280478244053 A90,90 0 0 1 8.137570082123943,127.3970930413158 L35.42504672141596,114.9313953608772 A60,60 0 0 0 144.57930379669952,114.92186985496035 Z"
                                ></path>
                                <path
                                  id="2"
                                  fill="#FA5858"
                                  d="M8.137570082123943, 127.3970930413158 A90,90 0 0 1 89.98429203681187,0.0000013707783779182137 L89.98952802454124,30.000000913852254 A60,60 0 0 0 35.42504672141596,114.9313953608772 Z"
                                ></path>
                              </svg>
                            </div>

                            <div className="col float-end">
                              <div className="cel-chart-info-1">
                                <p>{t('STATEMENT_BALANCE')}</p>
                                <h5>
                                  {statement.statementBalance} <span>{t('LBL_SAR')}</span>
                                </h5>
                              </div>

                              <div className="cel-chart-info-2">
                                <p>{t('CLOSING_BALANCE')}</p>
                                <h5>
                                  {statement.closingBalance}
                                  <span>{t('LBL_SAR')}</span>
                                </h5>
                              </div>

                              <div className="cel-chart-info-3">
                                <p>{t('CURRENT_BALANCE')}</p>
                                <h5>
                                  {statement.currentBalance} <span>{t('LBL_SAR')}</span>
                                </h5>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6 mt-5">
                          {statement.accounts.map(account => {
                            return (
                              <div className="cel-top">
                                <p className="float-end up">{account.numberOfTimes}</p>
                                <span>{t(account.accountName)}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card banking-card">
              <div className="card-header-q">
                <h5 className="float-start mb-0">{t('BANKS')}</h5>
                <button type="button" className="see-all-btn float-end btn">
                  {t('SEE_ALL')}
                </button>
              </div>
              <div className="card-body-q pt-0">
                {supportedBanks.map(bank => (
                  <div className="cel-top-3">
                    <img src={bank.imgSrc} alt={bank.imgSrc} className="float-start" />
                    <p className="float-end up">{t(bank.bankName)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Banking;
