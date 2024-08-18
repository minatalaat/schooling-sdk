import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import moment from 'moment';

import SalesPerMonth from '../parts/dashboard/SalesPerMonth';
import TotalPurchases from '../parts/dashboard/DashboardTotals/TotalPurchases';
import TotalIncome from '../parts/dashboard/DashboardTotals/TotalIncome';
import TotalCharge from '../parts/dashboard/DashboardTotals/TotalCharge';
import TopProducts from '../parts/dashboard/TopProducts';
import TopCustomers from '../parts/dashboard/TopCustomers';
import OpenInvoices from '../parts/dashboard/OpenInvoices/OpenInvoices';
import TopCustomersOpenInvoices from '../parts/dashboard/OpenInvoices/TopCustomersOpenInvoices';
import TopSuppliersOpenInvoices from '../parts/dashboard/OpenInvoices/TopSuppliersOpenInvoices';
import ImageWithSkeleton from '../components/ui/skeletons/ImageWithSkeleton';
import RectangleSkeleton from '../components/ui/skeletons/RectangleSkeleton';
import PurchaseSwiper from '../parts/dashboard/PurchaseSwiper';
import SaleSwiper from '../parts/dashboard/SaleSwiper';
import RevenuesVsExpenses from '../parts/dashboard/RevenuesVsExpenses';
import ProfitAndLoss from '../parts/dashboard/ProfitAndLoss';
// import AgingChart from '../parts/dashboard/AgingChart';

import { MODELS } from '../constants/models';
import { useAxiosFunction } from '../hooks/useAxios';
import { getSearchUrl } from '../services/getUrl';
import { useFeatures } from '../hooks/useFeatures';
import { getItem } from '../utils/localStorage';

const Home = () => {
  const { api } = useAxiosFunction();
  const navigate = useNavigate();
  const { checkPrivilege } = useFeatures();

  const [isLoading, setIsLoading] = useState(false);
  const [offers, setOffers] = useState([]);
  const [windowSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);
  const today = new Date();

  const checkCanViewTP = useMemo(() => checkPrivilege('view', 'DASHBOARD', 'TOTAL_PURCHASE'), []);
  const checkCanViewTS = useMemo(() => checkPrivilege('view', 'DASHBOARD', 'TOTAL_SALE'), []);
  const checkCanViewTE = useMemo(() => checkPrivilege('view', 'DASHBOARD', 'TOTAL_EXPENSE'), []);
  const checkCanViewSO = useMemo(() => checkPrivilege('view', 'DASHBOARD', 'SALE_OVERVIEW'), []);
  const checkCanViewTCS = useMemo(() => checkPrivilege('view', 'DASHBOARD', 'TOP_CUSTOMERS'), []);
  const checkCanViewTPS = useMemo(() => checkPrivilege('view', 'DASHBOARD', 'TOP_PRODUCTS'), []);
  const checkCanViewOIC = useMemo(() => checkPrivilege('view', 'DASHBOARD', 'OPEN_INVOICES_CUSTOMERS'), []);
  const checkCanViewOIS = useMemo(() => checkPrivilege('view', 'DASHBOARD', 'OPEN_INVOICES_SUPPLIERS'), []);
  const checkCanViewTOIC = useMemo(() => checkPrivilege('view', 'DASHBOARD', 'TOP_OPEN_INVOICES_CUSTOMERS'), []);
  const checkCanViewTOIS = useMemo(() => checkPrivilege('view', 'DASHBOARD', 'TOP_OPEN_INVOICES_SUPPLIERS'), []);
  const checkCanViewOFS = useMemo(() => checkPrivilege('view', 'DASHBOARD', 'OFFERS'), []);
  const checkCanViewRevenuesExpenses = useMemo(() => checkPrivilege('view', 'DASHBOARD', 'TOTAL_PURCHASE'), []);
  const checkCanViewProfitAndLoss = useMemo(() => checkPrivilege('view', 'DASHBOARD', 'TOTAL_PURCHASE'), []);
  const checkCanViewPurchase = useMemo(() => checkPrivilege('view', 'DASHBOARD', 'TOTAL_PURCHASE'), []);
  const checkCanViewSale = useMemo(() => checkPrivilege('view', 'DASHBOARD', 'TOTAL_PURCHASE'), []);
  // const checkCanViewCustomerAging = useMemo(() => checkPrivilege('view', 'DASHBOARD', 'TOTAL_PURCHASE'), []);

  let payload = {
    fields: ['id', 'type', 'activationStartDate', 'activationEndDate', 'offerLinkEn', 'offerLinkAr', 'offerImageEn', 'offerImageAr'],
    sortBy: ['-type'],
    data: {
      _domain: `self.activationStartDate < '${moment(today).locale('en').format('YYYY-MM-DD')}' AND self.activationEndDate > '${moment(
        today
      )
        .locale('en')
        .format('YYYY-MM-DD')}'`,
      _domainContext: {
        _model: 'com.liteaccounting.apps.offerbroadcast.db.Offer',
      },
      operator: 'and',
      criteria: [],
    },
    limit: 4,
    offset: 0,
    translate: true,
  };

  useEffect(() => {
    const handleWindowResize = () => {
      setWindowSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  });

  useEffect(() => {
    setOffers([]);
    setIsLoading(true);
    api('POST', getSearchUrl(MODELS.OFFERS), payload, onOffersSuccess);
  }, [navigate]);

  const onOffersSuccess = response => {
    if (response.data.status === 0) {
      if (response.data.total === 0) {
        setOffers([]);
        setIsLoading(false);
      } else {
        let offers = [];
        let data = response.data.data;

        if (data) {
          data.forEach(offer => {
            let temp = {
              offerLinkEn: offer.offerLinkEn,
              offerLinkAr: offer.offerLinkAr,
              offerImageEn: `data:image/png;base64,${offer.offerImageEn}`,
              offerImageAr: `data:image/png;base64,${offer.offerImageAr}`,
            };
            offers.push(temp);
          });
        }

        setOffers(offers);
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  };

  let isOffersAvailable = checkCanViewOFS && !isLoading && offers?.length > 0;

  return (
    <>
      <div className="page-body">
        <div className="container-fluid">
          <div className="row">
            {checkCanViewTP && <TotalPurchases />}
            {checkCanViewTS && <TotalIncome />}
            {checkCanViewTE && <TotalCharge />}
            <div className="d-block"></div>
            <div className=" d-block"></div>
            <div className={`${isOffersAvailable ? 'col-md-9' : 'col-md-12'}`}>
              <div className="row">{checkCanViewSO && <SalesPerMonth isOffersAvailable={isOffersAvailable} />}</div>
              <div className="row">
                {checkCanViewRevenuesExpenses && <RevenuesVsExpenses />}
                {checkCanViewProfitAndLoss && <ProfitAndLoss />}
                {/* {checkCanViewCustomerAging && <AgingChart type='customer'/>} */}
                {/* {checkCanViewSupplierAging && <AgingChart type='supplier'/>} */}
              </div>
              {checkCanViewPurchase && <PurchaseSwiper windowSize={windowSize} isOffersAvailable={isOffersAvailable} />}
              {checkCanViewSale && <SaleSwiper windowSize={windowSize} isOffersAvailable={isOffersAvailable} />}
              <div className="row">
                <div className=" d-block"></div>

                {checkCanViewTCS && <TopCustomers />}
                {checkCanViewTPS && <TopProducts />}
                <div className=" d-block"></div>

                {checkCanViewOIC && <OpenInvoices type="CUSTOMERS" />}

                {checkCanViewOIS && <OpenInvoices type="LBL_SUPPLIERS" />}
                <div className=" d-block"></div>

                {checkCanViewTOIC && <TopCustomersOpenInvoices />}
                {checkCanViewTOIS && <TopSuppliersOpenInvoices />}
              </div>
            </div>
            {isOffersAvailable && (
              <div className="col-xl-3 xl-30 appointment-sec box-col-12">
                {checkCanViewOFS && (
                  <div className="row">
                    {isLoading && offers && offers.length === 0 && <RectangleSkeleton height="900" />}
                    {!isLoading &&
                      offers &&
                      offers.map(offer => {
                        return (
                          <div className="col-xl-12">
                            <div className="card section-card card-banner p-0">
                              <div className="card-body-q pt-0">
                                <Link
                                  onClick={() => {
                                    let link = getItem('code') === 'en' ? offer.offerLinkEn : offer.offerLinkAr;

                                    if (link !== '' && link !== null && link !== undefined) {
                                      window.open(link, '_blank');
                                    }
                                  }}
                                >
                                  <ImageWithSkeleton
                                    imgSrc={getItem('code') === 'en' ? `${offer.offerImageEn}` : `${offer.offerImageAr}`}
                                    imgAlt={getItem('code') === 'en' ? `${offer.offerImageEn}` : `${offer.offerImageAr}`}
                                    height="150"
                                    width="100%"
                                    imgOptions={{ width: '100%' }}
                                  />
                                </Link>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
