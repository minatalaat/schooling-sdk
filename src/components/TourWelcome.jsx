import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import TourNextIcon from '../assets/images/tour-next-icon.svg';
import TourSkipIcon from '../assets/images/tour-skip-icon.svg';
import { useFeatures } from '../hooks/useFeatures';
import { setItem } from '../utils/localStorage';
import { featuresEnum } from '../constants/featuresEnum/featuresEnum';

const TourWelcome = ({ setShowTourSteps, setShowSideMenu, setToggle, setIsTour, setShowTourWelcome, setSteps, addStepsOptions }) => {
  const { t } = useTranslation();
  const { canAdd: canAddProduct } = useFeatures('PRODUCT_MASTER_DATA', 'PRODUCTS');
  const { canAdd: canAddCustomer } = useFeatures('SALES', 'CUSTOMERS');
  const { canAdd: canAddCustInvoice } = useFeatures('INVOICES', 'CUSTOMERS_INVOICES');
  const { canAdd: canAddPurchaseOrder } = useFeatures('PURCHASE', 'PURCHASE_ORDERS');
  const { getFeaturePath } = useFeatures();
  let tourFeaturesList = [];

  const checkCanAdd = () => {
    if (canAddProduct)
      tourFeaturesList.push({ name: 'LBL_ADD_PRODUCT', path: getFeaturePath('PRODUCTS', 'add'), id: featuresEnum['PRODUCTS'].id });
    if (canAddCustomer)
      tourFeaturesList.push({ name: 'LBL_ADD_CUSTOMER', path: getFeaturePath('CUSTOMERS', 'add'), id: featuresEnum['CUSTOMERS'].id });
    if (canAddCustInvoice)
      tourFeaturesList.push({
        name: 'LBL_ADD_CUSTOMER_INVOICE',
        path: getFeaturePath('CUSTOMERS_INVOICES', 'add'),
        id: featuresEnum['CUSTOMERS_INVOICES'].id,
      });
    if (canAddPurchaseOrder)
      tourFeaturesList.push({
        name: 'LBL_ADD_PURCHASE_ORDER',
        path: getFeaturePath('PURCHASE_ORDERS', 'add'),
        id: featuresEnum['PURCHASE_ORDERS']?.id,
      });
  };

  checkCanAdd();

  return (
    <div className="producttour">
      <div className="welcome">
        <div className="tour-skip">
          <Link
            onClick={() => {
              setItem('isTour', 'false');
              setIsTour('false');
            }}
          >
            {t('LBL_SKIP')} <img src={TourSkipIcon} alt="tour step icon" />
          </Link>
        </div>
        <div className="tour-title">
          <h5>
            <span>
              {t('LBL_WELCOME_TO')} <br />
            </span>{' '}
            {t('LBL_QAEMA_ACCOUNTING_SOL')}
          </h5>
        </div>
        <div className="tour-description">
          <p>{t('LBL_QAEMA_TOUR_DESC')}</p>
        </div>
        <div className="tour-next">
          <Link
            onClick={() => {
              setShowTourSteps(true);
              setShowSideMenu(true);
              setToggle(false);
            }}
          >
            {t('LBL_NEXT')} <img src={TourNextIcon} alt="tour next icon" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TourWelcome;
