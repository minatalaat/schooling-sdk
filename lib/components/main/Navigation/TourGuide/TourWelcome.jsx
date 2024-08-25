import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import TourNextIcon from '../../../../assets/images/tour-next-icon.svg';
import TourSkipIcon from '../../../../assets/images/tour-skip-icon.svg';

import { setItem } from '../../../../utils/localStorage';
import { useFeatures } from '../../../../hooks/useFeatures';
import { featuresEnum } from '../../../../constants/featuresEnum/featuresEnum';
import { tourStepsActions } from '../../../../store/tourSteps';

const TourWelcome = ({ setShowSideMenu, setToggle, addStepsOptions, setTourName, fillTourSteps, features, setActive, setShowMenu }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [buttonClicked, setButtonClicked] = useState('');

  const tourNameStore = useSelector(state => state.tourSteps.tourName);

  let productTourLocale = {
    back: t('LBL_BACK'),
    close: t('LBL_CLOSE'),
    last: t('LBL_NEXT'),
    next: t('LBL_NEXT'),
    open: t('LBL_OPEN'),
    skip: t('LBL_SKIP'),
  };

  let productSteps = [
    {
      target: `.step-${featuresEnum['PRODUCT_MASTER_DATA'].id}`,
      title: <strong>{t('LBL_PRODUCT_MASTER_DATA')}</strong>,
      content: t('LBL_PRODUCT_MASTER_DATA_DESC'),
    },
    {
      target: `.step-${featuresEnum['PRODUCTS'].id.replace('.', '-')}`,
      title: <strong>{t('LBL_PRODUCTS')}</strong>,
      content: t('LBL_PRODUCTS_DESC'),
    },
    {
      target: `.step-dummy`,
      title: <strong>{t('LBL_ADD_PRODUCT_DETAILS')}</strong>,
      content: t('LBL_ADD_PRODUCT_DETAILS_DESC'),
    },
  ];
  let customerSteps = [
    {
      target: `.step-${featuresEnum['SALES'].id}`,
      title: <strong>{t('LBL_SALES')}</strong>,
      content: t('LBL_SALES_DESC'),
    },
    {
      target: `.step-${featuresEnum['CUSTOMERS'].id.replace('.', '-')}`,
      title: <strong>{t('LBL_CUSTOMERS')}</strong>,
      content: t('LBL_CUSTOMERS_DESC'),
    },
    {
      target: `.step-dummy`,
      title: <strong>{t('LBL_ADD_PRODUCT_DETAILS')}</strong>,
      content: t('LBL_ADD_PRODUCT_DETAILS_DESC'),
    },
  ];

  let customerInvoiceSteps = [
    {
      target: `.step-${featuresEnum['INVOICES'].id}`,
      title: <strong>{t('LBL_INVOICES')}</strong>,
      content: t('LBL_INVOICES_DESC'),
    },
    {
      target: `.step-${featuresEnum['CUSTOMERS_INVOICES'].id.replace('.', '-')}`,
      title: <strong>{t('LBL_CUSTOMERS_INVOICES')}</strong>,
      content: t('LBL_CUSTOMERS_INVOICES_DESC'),
    },
    {
      target: `.step-dummy`,
      title: <strong>{t('LBL_ADD_PRODUCT_DETAILS')}</strong>,
      content: t('LBL_ADD_PRODUCT_DETAILS_DESC'),
    },
  ];

  let purchaseOrderSteps = [
    {
      target: `.step-${featuresEnum['PURCHASE'].id}`,
      title: <strong>{t('LBL_PURCHASES')}</strong>,
      content: t('LBL_PURCHASES_DESC'),
    },
    {
      target: `.step-${featuresEnum['PURCHASE_ORDERS'].id.replace('.', '-')}`,
      title: <strong>{t('LBL_PURCHASE_ORDERS')}</strong>,
      content: t('LBL_PURCHASE_ORDERS_DESC'),
    },
    {
      target: `.step-dummy`,
      title: <strong>{t('LBL_ADD_PRODUCT_DETAILS')}</strong>,
      content: t('LBL_ADD_PRODUCT_DETAILS_DESC'),
    },
  ];
  const { canAdd: canAddProduct } = useFeatures('PRODUCT_MASTER_DATA', 'PRODUCTS');
  const { canAdd: canAddCustomer } = useFeatures('SALES', 'CUSTOMERS');
  const { canAdd: canAddCustInvoice } = useFeatures('INVOICES', 'CUSTOMERS_INVOICES');
  const { canAdd: canAddPurchaseOrder } = useFeatures('PURCHASE', 'PURCHASE_ORDERS');
  const { getFeaturePath } = useFeatures();

  let tourFeaturesList = [];

  const checkCanAdd = () => {
    if (canAddProduct)
      tourFeaturesList.push({
        name: 'LBL_ADD_PRODUCT',
        path: getFeaturePath('PRODUCTS', 'add'),
        parentFeatureID: 'PRODUCT_MASTER_DATA',
        featureID: featuresEnum['PRODUCTS'].id,
      });
    if (canAddCustomer)
      tourFeaturesList.push({
        name: 'LBL_ADD_CUSTOMER',
        path: getFeaturePath('CUSTOMERS', 'add'),
        parentFeatureID: 'SALES',
        featureID: featuresEnum['CUSTOMERS'].id,
      });
    if (canAddCustInvoice)
      tourFeaturesList.push({
        name: 'LBL_ADD_CUSTOMER_INVOICE',
        path: getFeaturePath('CUSTOMERS_INVOICES', 'add'),
        parentFeatureID: 'INVOICES',
        featureID: featuresEnum['CUSTOMERS_INVOICES'].id,
      });
    if (canAddPurchaseOrder)
      tourFeaturesList.push({
        name: 'LBL_ADD_PURCHASE_ORDER',
        path: getFeaturePath('PURCHASE_ORDERS', 'add'),
        parentFeatureID: 'PURCHASE',
        featureID: featuresEnum['PURCHASE_ORDERS'].id,
      });
  };

  checkCanAdd();

  const handleLinkClick = featureID => {
    setToggle(false);
    setShowSideMenu(true);
    dispatch(tourStepsActions.setTourName(featureID));
    setTimeout(() => {
      dispatch(tourStepsActions.setShowTourWelcome('false'));
    }, [100]);
  };

  useEffect(() => {
    if (buttonClicked !== '') {
      if (tourNameStore === featuresEnum['PURCHASE_ORDERS'].id) {
        addStepsOptions(purchaseOrderSteps, productTourLocale);
        setButtonClicked('');
        handleShowSideMenu();
        dispatch(tourStepsActions.setSteps({ steps: purchaseOrderSteps }));
        dispatch(tourStepsActions.setShowTourSteps(true));
      }

      if (tourNameStore === featuresEnum['CUSTOMERS_INVOICES'].id) {
        addStepsOptions(customerInvoiceSteps, productTourLocale);
        setButtonClicked('');
        handleShowSideMenu();
        dispatch(tourStepsActions.setSteps({ steps: customerInvoiceSteps }));
        dispatch(tourStepsActions.setShowTourSteps(true));
      }

      if (tourNameStore === featuresEnum['CUSTOMERS'].id) {
        addStepsOptions(customerSteps, productTourLocale);
        setButtonClicked('');
        handleShowSideMenu();
        dispatch(tourStepsActions.setSteps({ steps: customerSteps }));
        dispatch(tourStepsActions.setShowTourSteps(true));
      }

      if (tourNameStore === featuresEnum['PRODUCTS'].id) {
        addStepsOptions(productSteps, productTourLocale);
        setButtonClicked('');
        handleShowSideMenu();
        dispatch(tourStepsActions.setSteps({ steps: productSteps }));
        dispatch(tourStepsActions.setShowTourSteps(true));
      }

      if (tourNameStore === 'SIDE_MENU') {
        setButtonClicked('');
        handleShowSideMenu();

        fillTourSteps(features);
        dispatch(tourStepsActions.setShowTourSteps(true));
      }

      setTourName(tourNameStore);
    }
  }, [tourNameStore, buttonClicked]);

  useEffect(() => {
    setToggle(false);
    setShowSideMenu(true);
  }, []);

  const handleShowSideMenu = () => {
    if (
      tourNameStore === featuresEnum['PRODUCTS'].id ||
      tourNameStore === featuresEnum['CUSTOMERS_INVOICES'].id ||
      tourNameStore === featuresEnum['PURCHASE_ORDERS'].id ||
      tourNameStore === featuresEnum['CUSTOMERS'].id ||
      tourNameStore === 'SIDE_MENU'
    ) {
      setShowSideMenu(true);
      setToggle(false);
    }
  };

  const handleSkipTour = () => {
    setItem('isTour', 'false');
    dispatch(tourStepsActions.setIsTour('false'));
    dispatch(tourStepsActions.setShowTourWelcome('false'));
    dispatch(tourStepsActions.setShowTourSteps(false));
  };

  return (
    <div className="producttour">
      <div className="welcome">
        <div className="tour-skip">
          <Link onClick={handleSkipTour}>
            {t('LBL_SKIP')} <img src={TourSkipIcon} alt="skip" />
          </Link>
        </div>
        <div className="tour-title">
          <h5>
            <span>
              {t('LBL_WELCOME_TO')} <br />
            </span>
            {t('LBL_QAEMA_ACCOUNTING_SOL')}
          </h5>
        </div>
        <div className="tour-description">
          <p>{t('LBL_QAEMA_TOUR_DESC')}</p>
        </div>
        <div className="tour-features-list">
          <ul>
            {tourFeaturesList &&
              tourFeaturesList.slice(0, 2).map(feature => (
                <li key={feature.featureID}>
                  <Link
                    to={{
                      pathname: '/home',
                    }}
                    onClick={() => {
                      setActive(feature.parentFeatureID);
                      setShowMenu(true);
                      handleLinkClick(feature.featureID);
                      setButtonClicked(feature.featureID);
                    }}
                  >
                    {t(feature.name)}
                  </Link>
                </li>
              ))}
          </ul>
          <ul>
            {tourFeaturesList &&
              tourFeaturesList.slice(2).map(feature => (
                <li key={feature.featureID}>
                  <Link
                    to={{
                      pathname: '/home',
                    }}
                    onClick={() => {
                      setActive(feature.parentFeatureID);
                      setShowMenu(true);
                      handleLinkClick(feature.featureID);
                      setButtonClicked(feature.featureID);
                    }}
                  >
                    {t(feature.name)}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
        <div className="tour-next">
          <Link
            to={{
              pathname: '/home',
            }}
            onClick={() => {
              setButtonClicked('SIDE_MENU');
              handleLinkClick('SIDE_MENU');
              handleShowSideMenu();
              setShowMenu(false);
            }}
          >
            {t('LBL_NEXT')} <img src={TourNextIcon} alt="next" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TourWelcome;
