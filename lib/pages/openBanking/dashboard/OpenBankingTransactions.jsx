import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Doughnut, Pie } from 'react-chartjs-2';

import {
  transactionStatusEnum,
  transactionPaymentModeEnum,
  transactionTypeEnum,
  transactionInstrumentTypeEnum,
  options,
} from './DashboardEnums';
import 'swiper/css';
import 'swiper/css/pagination';
import { SpinnerCircular } from 'spinners-react';
import OBPagination from '../../../parts/OBPagination';

function OpenBankingTransactions({ transactions, windowSize, page, setPage, totalPages, isLoading }) {
  const { t } = useTranslation();

  const [transactionsStatusData, setTransactionsStatusData] = useState([]);
  const [transactionsStatusLabels, setTransactionsStatusLabels] = useState([]);
  const [transactionsStatusColors, setTransactionsStatusColors] = useState([]);
  const [transactionsPaymentModeData, setTransactionsPaymentModeData] = useState([]);
  const [transactionsPaymentModeLabels, setTransactionsPaymentModeLabels] = useState([]);
  const [transactionsPaymentModeColors, setTransactionsPaymentModeColors] = useState([]);
  const [transactionsTypeData, setTransactionsTypeData] = useState([]);
  const [transactionsTypeLabels, setTransactionsTypeLabels] = useState([]);
  const [transactionsTypeColors, setTransactionsTypeColors] = useState([]);
  const [transactionsInstrumentTypeData, setTransactionsInstrumentTypeData] = useState([]);
  const [transactionsInstrumentTypeLabels, setTransactionsInstrumentTypeLabels] = useState([]);
  const [transactionsInstrumentTypeColors, setTransactionsInstrumentTypeColors] = useState([]);

  const transactionPaymentModeData = {
    labels: transactionsPaymentModeLabels,
    datasets: [
      {
        label: t('LBL_TRANSACTIONS'),
        data: transactionsPaymentModeData,
        borderColor: transactionsPaymentModeColors,
        backgroundColor: transactionsPaymentModeColors,
        hoverOffset: 4,
        barThickness: 30,
        borderWidth: 1,
      },
    ],
  };

  const transactionStatusData = {
    labels: transactionsStatusLabels,
    datasets: [
      {
        label: t('LBL_TRANSACTIONS'),
        data: transactionsStatusData,
        borderColor: transactionsStatusColors,
        backgroundColor: transactionsStatusColors,
        hoverOffset: 4,
        barThickness: 30,
        borderWidth: 1,
      },
    ],
  };
  const transactionTypeData = {
    labels: transactionsTypeLabels,
    datasets: [
      {
        label: t('LBL_TRANSACTIONS'),
        data: transactionsTypeData,
        borderColor: transactionsTypeColors,
        backgroundColor: transactionsTypeColors,
        hoverOffset: 4,
        barThickness: 30,
        borderWidth: 1,
      },
    ],
  };
  const transactionInstrumentTypeData = {
    labels: transactionsInstrumentTypeLabels,
    datasets: [
      {
        label: t('LBL_TRANSACTIONS'),
        data: transactionsInstrumentTypeData,
        borderColor: transactionsInstrumentTypeColors,
        backgroundColor: transactionsInstrumentTypeColors,
        hoverOffset: 4,
        barThickness: 30,
        borderWidth: 1,
      },
    ],
  };

  const getTransactionsPaymentModeData = transactions => {
    let tempData = [];
    let tempLabels = [];
    let tempColors = [];
    Object.keys(transactionPaymentModeEnum).map(key => {
      let tempTransactions = transactions.filter(item => item.PaymentModes === transactionPaymentModeEnum[key].value);

      if (tempTransactions && tempTransactions.length > 0) {
        tempData.push(tempTransactions.length);
        tempLabels.push(t(transactionPaymentModeEnum[key].label));
        tempColors.push(transactionPaymentModeEnum[key].color);
      }
    });
    setTransactionsPaymentModeData(tempData);
    setTransactionsPaymentModeLabels(tempLabels);
    setTransactionsPaymentModeColors(tempColors);
  };

  const getTransactionStatusData = transactions => {
    // let tempTransactions = transactions.Data.Transaction;
    let tempData = [];
    let tempLabels = [];
    let tempColors = [];
    Object.keys(transactionStatusEnum).map(key => {
      let tempTransactions = transactions.filter(item => item.Status === transactionStatusEnum[key].value);

      if (tempTransactions && tempTransactions.length > 0) {
        tempData.push(tempTransactions.length);
        tempLabels.push(t(transactionStatusEnum[key].label));
        tempColors.push(transactionStatusEnum[key].color);
      }
    });
    setTransactionsStatusData(tempData);
    setTransactionsStatusLabels(tempLabels);
    setTransactionsStatusColors(tempColors);
  };

  const getTransactionTypeData = transactions => {
    let tempData = [];
    let tempLabels = [];
    let tempColors = [];
    Object.keys(transactionTypeEnum).map(key => {
      let tempTransactions = transactions.filter(item => item.TransactionType === transactionTypeEnum[key].value);

      if (tempTransactions && tempTransactions.length > 0) {
        tempData.push(tempTransactions.length);
        tempLabels.push(t(transactionTypeEnum[key].label));
        tempColors.push(transactionTypeEnum[key].color);
      }
    });
    setTransactionsTypeData(tempData);
    setTransactionsTypeLabels(tempLabels);
    setTransactionsTypeColors(tempColors);
  };

  const getTransactionInstrumentTypeData = transactions => {
    let tempData = [];
    let tempLabels = [];
    let tempColors = [];
    Object.keys(transactionInstrumentTypeEnum).map(key => {
      let tempTransactions = transactions.filter(item => item?.CardInstrument?.InstrumentType === transactionInstrumentTypeEnum[key].value);

      if (tempTransactions && tempTransactions.length > 0) {
        tempData.push(tempTransactions.length);
        tempLabels.push(t(transactionInstrumentTypeEnum[key].label));
        tempColors.push(transactionInstrumentTypeEnum[key].color);
      }
    });
    setTransactionsInstrumentTypeData(tempData);
    setTransactionsInstrumentTypeLabels(tempLabels);
    setTransactionsInstrumentTypeColors(tempColors);
  };

  useEffect(() => {
    if (transactions && transactions.length > 0) {
      getTransactionsPaymentModeData(transactions);
      getTransactionStatusData(transactions);
      getTransactionTypeData(transactions);
      getTransactionInstrumentTypeData(transactions);
    }
  }, [transactions]);
  return (
    <>
      {!isLoading && (
        <>
          {' '}
          {transactions && transactions.length > 0 && (
            <>
              <div className="row">
                <div className="col-md-12">
                  <div className="titlesection mt-5">
                    <h5>{t('LBL_TRANSACTIONS')}</h5>
                  </div>
                </div>
              </div>
              <div className="row">
                <Swiper
                  slidesPerView={windowSize[0] > 1250 ? 3 : windowSize[0] > 500 ? 2 : 1}
                  spaceBetween={30}
                  pagination={{
                    clickable: true,
                  }}
                  modules={[Pagination]}
                  className="mySwiper"
                >
                  <SwiperSlide>
                    <div className="col-md-12 flex-fill">
                      <div className="card banking-card">
                        <div className="card-header-q  mb-2">
                          <h5 className="float-start">{t('LBL_TRANSACTIONS_BY_STATUS')}</h5>
                        </div>
                        <div className="card-body-q pt-0">
                          <Doughnut data={transactionStatusData} options={options} />
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                  <SwiperSlide>
                    <div className="col-md-12 flex-fill">
                      <div className="card banking-card">
                        <div className="card-header-q  mb-2">
                          <h5 className="float-start">{t('LBL_TRANSACTIONS_BY_PAYMENTMODE')}</h5>
                        </div>
                        <div className="card-body-q pt-0">
                          <Doughnut data={transactionPaymentModeData} options={options} />
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                  <SwiperSlide>
                    <div className="col-md-12 flex-fill">
                      <div className="card banking-card">
                        <div className="card-header-q  mb-2">
                          <h5 className="float-start">{t('LBL_TRANSACTIONS_BY_CHANNEL')}</h5>
                        </div>
                        <div className="card-body-q pt-0">
                          <Pie data={transactionInstrumentTypeData} options={options} />
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                  <SwiperSlide>
                    <div className="col-md-12  flex-fill">
                      <div className="card banking-card">
                        <div className="card-header-q  mb-2">
                          <h5 className="float-start">{t('LBL_TRANSACTIONS_BY_TYPE')}</h5>
                        </div>
                        <div className="card-body-q pt-0">
                          <Pie data={transactionTypeData} options={options} />
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                </Swiper>
                <OBPagination OBPage={page} setOBPage={setPage} totalPagesOB={totalPages} />
              </div>
            </>
          )}
          {transactions && transactions.length === 0 && (
            <div className="row">
              <div className="col-md-12">
                <div className="titlesection mt-5">
                  <h5>{t('LBL_TRANSACTIONS')}</h5>
                </div>
                <h4 className="text-center">{t('NO_DATA_AVAILABLE')}</h4>
              </div>
            </div>
          )}
        </>
      )}

      {isLoading && (
        <div className="text-center">
          <SpinnerCircular size={70} thickness={120} speed={100} color="rgba(31, 79, 222, 1)" secondaryColor="rgba(153, 107, 229, 0.19)" />
        </div>
      )}
    </>
  );
}

export default OpenBankingTransactions;
