import { useEffect, useState } from 'react';
import { featuresEnum } from '../../../../constants/featuresEnum/featuresEnum';
import Joyride, { ACTIONS, LIFECYCLE } from 'react-joyride';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import TourWelcome from './TourWelcome';

import { setItem } from '../../../../utils/localStorage';
import { useFeatures } from '../../../../hooks/useFeatures';
import { tourStepsActions } from '../../../../store/tourSteps';
import { useTourServices } from '../../../../services/useTourServices';

function TourGuide({ showSideMenu, setShowSideMenu, setToggle, setActive, setShowMenu, setShow, isTour, setCurrentActive }) {
  let features = useSelector(state => state.userFeatures.userFeatures);
  const tourStepsStore = useSelector(state => state.tourSteps);

  const buttonStyleEn = {
    fontSize: '18px',
    borderRadius: '12px',
    padding: '8px 18px',
    width: '46%',
    height: '48px',
    marginLeft: '8px',
    textTransform: 'capitalize',
  };
  const buttonStyleAr = {
    fontSize: '18px',
    borderRadius: '12px',
    padding: '8px 18px',
    width: '46%',
    height: '48px',
    marginRight: '8px',
    marginLeft: '0',
    textTransform: 'capitalize',
  };
  const tourStylesEn = {
    tooltipContent: {
      fontSize: '14px',
      color: 'black',
      textAlign: 'center',
      lineHeight: '1.5',
    },
    buttonNext: {
      ...buttonStyleEn,
      border: 'solid 1px #ffffff',
      backgroundColor: '#0984E3',
      color: '#FFFFFF',
    },
    buttonBack: {
      ...buttonStyleEn,
      marginRight: '0px',
      border: 'solid 1px #0984E3',
      backgroundColor: '#FFFFFF',
      color: '#0984E3',
    },
    buttonClose: {
      ...buttonStyleEn,
      border: 'solid 1px #0984E3',
      backgroundColor: '#FFFFFF',
      color: '#0984E3',
    },
    buttonSkip: {
      height: '48px',
      width: '90%',
      marginRight: '8px',
      marginLeft: '8px',
      fontSize: '18px',
      borderRadius: '12px',
      textTransform: 'capitalize',
      padding: '8px 18px',
      border: 'solid 1px #0984E3',
      backgroundColor: '#FFFFFF',
      color: '#0984E3',
    },
  };
  const tourStylesAr = {
    tooltipContent: {
      fontSize: '14px',
      color: 'black',
      textAlign: 'center',
      lineHeight: '1.5',
    },
    buttonNext: {
      ...buttonStyleAr,
      border: 'solid 1px #ffffff',
      backgroundColor: '#0984E3',
      color: '#FFFFFF',
    },
    buttonBack: {
      ...buttonStyleAr,
      marginRight: '0px',
      border: 'solid 1px #0984E3',
      backgroundColor: '#FFFFFF',
      color: '#0984E3',
    },
    buttonClose: {
      ...buttonStyleAr,
      border: 'solid 1px #0984E3',
      backgroundColor: '#FFFFFF',
      color: '#0984E3',
    },
    buttonSkip: {
      height: '48px',
      width: '90%',
      marginRight: '0px',
      marginLeft: '8px',
      fontSize: '18px',
      borderRadius: '12px',
      textTransform: 'capitalize',
      padding: '8px 18px',
      border: 'solid 1px #0984E3',
      backgroundColor: '#FFFFFF',
      color: '#0984E3',
    },
  };
  const [steps, setSteps] = useState(null);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { addStepsOptions } = useTourServices();

  const [showTourWelcome, setShowTourWelcome] = useState(isTour ? isTour : 'false');
  const [spotlightClicks, setSpotlightClick] = useState(false);

  const [run, setRun] = useState(tourStepsStore.isRun ? tourStepsStore.isRun : false);
  //   const [steps, setSteps] = useState([]);
  const [tourName, setTourName] = useState('');
  const [showTourSteps, setShowTourSteps] = useState(false);
  const navigate = useNavigate();
  const { getFeaturePath } = useFeatures();

  useEffect(() => {
    setSteps([...tourStepsStore.tourSteps]);
    setShowTourWelcome(tourStepsStore.showTourWelcome);
    setShowTourSteps(tourStepsStore.showTourSteps);
    setRun(tourStepsStore.isRun);
    setTourName(tourStepsStore.tourName);
    setSpotlightClick(tourStepsStore.spotlightClicks);
  }, [tourStepsStore]);

  useEffect(() => {
    if (steps && steps.length > 0) setRun(true);
  }, [steps]);

  const getInitialTourSteps = () => {
    return [
      {
        target: '.step-profile',
        title: <strong>{t('LBL_USER_PROFILE')}</strong>,
        content: t('LBL_USER_PROFILE_DESC'),
      },
      {
        target: '.step-nav-open',
        title: <strong>{t('LBL_USER_PROFILE')}</strong>,
        content: t('LBL_USER_PROFILE_NAV_DESC'),
      },
      {
        target: '.step-0',
        title: <strong>{t('LBL_QUICK_ACTIONS')}</strong>,
        content: t('LBL_QUICK_ACTIONS_DESC'),
      },
    ];
  };

  const getFeature = id => {
    return featuresEnum[Object.keys(featuresEnum).filter(key => featuresEnum[key].id === id)[0]];
  };

  const addDashboardToTop = (features, tempSteps) => {
    let dashboardFeature = features.filter(feature => feature.featureCode === featuresEnum['DASHBOARD'].id);
    if (dashboardFeature.length > 0)
      tempSteps.push({
        target: '.step-' + featuresEnum['DASHBOARD'].id,
        title: <strong>{t(getFeature(featuresEnum['DASHBOARD'].id).LABEL)}</strong>,
        content: t(getFeature(featuresEnum['DASHBOARD'].id).DESC),
      });
  };

  const addAvailableFeatures = (features, tempSteps) => {
    Object.keys(featuresEnum).forEach(item => {
      if (featuresEnum[item].id !== featuresEnum['DASHBOARD'].id) {
        if (!getFeature(featuresEnum[item].id)) return null;
        else {
          if (featuresEnum[item].id.split('.').length === 1) {
            let feature = getFeature(featuresEnum[item].id);
            tempSteps.push({
              target: '.step-' + feature.id,
              title: <strong>{t(getFeature(feature.id).LABEL)}</strong>,
              content: t(getFeature(feature.id).DESC),
            });
          }
        }
      }
    });
    // features.forEach(feature => {
    //   if (!getFeature(feature.featureCode)) return null;

    //   if (feature.featureCode !== featuresEnum['DASHBOARD'].id) {
    //     tempSteps.push({
    //       target: '.step-' + feature.featureCode,
    //       title: <strong>{t(getFeature(feature.featureCode).LABEL)}</strong>,
    //       content: t(getFeature(feature.featureCode).DESC),
    //     });
    //   }
    // });
  };

  const fillTourSteps = features => {
    let tempSteps = getInitialTourSteps();
    addDashboardToTop(features, tempSteps);
    addAvailableFeatures(features, tempSteps);
    addStepsOptions(tempSteps);
    dispatch(tourStepsActions.setSteps({ steps: tempSteps }));
  };

  useEffect(() => {
    if (isTour === 'true' && features && features.length > 0) {
      dispatch(tourStepsActions.setShowTourWelcome(isTour));
      fillTourSteps(features);
    }
  }, [isTour]);

  const handleJoyrideCallback = data => {
    if (tourStepsStore.tourName === 'SIDE_MENU') handleSideMenuTour(data);
    if (tourStepsStore.tourName === featuresEnum['PRODUCTS'].id) handleProductTour(data);
    if (tourStepsStore.tourName === 'ADD_PRODUCT') handleAddProductTour(data);
    if (tourStepsStore.tourName === 'ADD_PRODUCT_DETAILS') handleAddProductDetailsTour(data);
    if (tourStepsStore.tourName === featuresEnum['CUSTOMERS'].id) handleCustomerTour(data);
    if (tourStepsStore.tourName === 'ADD_CUSTOMER') handleAddCustomerTour(data);
    if (tourStepsStore.tourName === 'ADD_CUSTOMER_DETAILS') handleAddCustomerDetailsTour(data);
    if (tourStepsStore.tourName === featuresEnum['CUSTOMERS_INVOICES'].id) handleCustomerInvoiceTour(data);
    if (tourStepsStore.tourName === 'ADD_CUSTOMER_INVOICE') handleAddCustomerInvoiceTour(data);
    if (tourStepsStore.tourName === 'ADD_CUSTOMER_INVOICES_DETAILS') handleAddCustomerInvoiceDetailsTour(data);
    if (tourStepsStore.tourName === featuresEnum['PURCHASE_ORDERS'].id) handlePurchaseOrderTour(data);
    if (tourStepsStore.tourName === 'ADD_PURCHASE_ORDER') handleAddPurchaseOrderTour(data);
    if (tourStepsStore.tourName === 'ADD_PURCHASE_ORDER_DETAILS') handleAddPurchaseOrderDetailsTour(data);
  };

  const handleSideMenuTour = data => {
    const { action, index, type } = data;

    if (action === 'skip') {
      setShow(false);
      setShowSideMenu(false);
      setToggle(true);
      dispatch(tourStepsActions.setIsTour('false'));
      return;
    }

    if ((index === 0 && action !== 'reset') || (index === 2 && action === 'prev')) {
      setShow(true);
    }

    if (index === 3 && action === 'next') {
      setShow(false);
    }

    if (type === 'tour:end' && action === 'next') {
      setItem('isTour', 'false');
      setShow(false);
      setShowSideMenu(false);
      setToggle(true);
      dispatch(tourStepsActions.setIsTour('false'));
    }
  };

  const handleProductTour = data => {
    const { action, index, lifecycle } = data;

    if (action === ACTIONS.SKIP) {
      setItem('isTour', 'false');
      setShow(false);
      setShowSideMenu(false);
      setToggle(true);
      setActive('LBL_PRODUCT_MASTER_DATA');
      dispatch(tourStepsActions.setIsTour('false'));
      //   setIsTour('false');

      return;
    }

    if (index === 0 && action === ACTIONS.START && lifecycle === LIFECYCLE.READY) {
      setActive('LBL_PRODUCT_MASTER_DATA');
      setShowMenu(true);
      setToggle(true);
    }

    if (index === 1 && action === ACTIONS.NEXT && lifecycle === LIFECYCLE.COMPLETE) {
      // setShow(false);
      // setShowSideMenu(false);
      setShowSideMenu(false);
      setToggle(true);
      setShow(false);
      dispatch(tourStepsActions.setIsRun(false));
      dispatch(tourStepsActions.setTourName('ADD_PRODUCT'));
      navigate(getFeaturePath('PRODUCTS'));
      //   addStepsOptions(addProductSteps);
      //   setSteps(addProductSteps);
    }
    // if (index === 1 && type === 'tour:end' && action === ACTIONS.NEXT) {
    //   //   setItem('isTour', 'false');
    //   //   dispatch(tourStepsActions.setIsTour('false'));

    //   //   setIsTour('false');

    //   setShow(false);
    //   setShowSideMenu(false);
    //   setToggle(true);
    //   dispatch(tourStepsActions.setIsRun(false));
    //   dispatch(tourStepsActions.setTourName('ADD_PRODUCT'));
    //   navigate(getFeaturePath('PRODUCTS'));
    // }
  };

  const handleAddProductTour = data => {
    const { action, index, lifecycle } = data;

    if (action === ACTIONS.SKIP) {
      setItem('isTour', 'false');
      setShow(false);
      setShowSideMenu(false);
      setToggle(true);
      dispatch(tourStepsActions.setIsTour('false'));
      //   setIsTour('false');
      return;
    }

    if (index === 0 && action === ACTIONS.NEXT && lifecycle === LIFECYCLE.COMPLETE) {
      setShow(false);
      setShowSideMenu(false);
      setToggle(true);
      dispatch(tourStepsActions.setIsRun(false));
      dispatch(tourStepsActions.setTourName('ADD_PRODUCT_DETAILS'));
      navigate(getFeaturePath('PRODUCTS', 'add'));
    }
  };

  const handleAddProductDetailsTour = data => {
    const { action, type } = data;

    if (action === ACTIONS.SKIP) {
      setItem('isTour', 'false');
      setShow(false);
      setShowSideMenu(false);
      setToggle(true);
      dispatch(tourStepsActions.setIsTour('false'));
      //   setIsTour('false');
      return;
    }

    if (type === 'tour:end' && action === ACTIONS.NEXT) {
      setShow(false);
      setShowSideMenu(false);
      setToggle(true);
      dispatch(tourStepsActions.setIsRun(false));
      dispatch(tourStepsActions.setIsTour('false'));
      dispatch(tourStepsActions.setShowTourWelcome('false'));
      dispatch(tourStepsActions.setShowTourSteps(false));
      dispatch(tourStepsActions.setSteps({ steps: [] }));
    }
  };

  const handleCustomerTour = data => {
    const { action, index, lifecycle } = data;

    if (action === ACTIONS.SKIP) {
      setItem('isTour', 'false');
      setShow(false);
      setShowSideMenu(false);
      setToggle(true);
      dispatch(tourStepsActions.setIsTour('false'));
      //   setIsTour('false');

      return;
    }

    if (index === 0 && action === ACTIONS.START && lifecycle === LIFECYCLE.READY) {
      setActive('LBL_SALES');
      setShowMenu(true);
      setToggle(true);
    }

    if (index === 1 && action === ACTIONS.NEXT && lifecycle === LIFECYCLE.COMPLETE) {
      setShow(false);
      setShowSideMenu(false);
      setToggle(true);
      dispatch(tourStepsActions.setIsRun(false));
      dispatch(tourStepsActions.setTourName('ADD_CUSTOMER'));
      navigate(getFeaturePath('CUSTOMERS'));
      //   addStepsOptions(addProductSteps);
      //   setSteps(addProductSteps);
    }
    // if (index === 1 && type === 'tour:end' && action === ACTIONS.NEXT) {
    //   //   setItem('isTour', 'false');
    //   //   dispatch(tourStepsActions.setIsTour('false'));

    //   //   setIsTour('false');

    //   setShow(false);
    //   setShowSideMenu(false);
    //   setToggle(true);
    //   dispatch(tourStepsActions.setIsRun(false));
    //   dispatch(tourStepsActions.setTourName('ADD_PRODUCT'));
    //   navigate(getFeaturePath('PRODUCTS'));
    // }
  };

  const handleAddCustomerTour = data => {
    const { action, index, status, type, size, lifecycle } = data;

    if (action === ACTIONS.SKIP) {
      setItem('isTour', 'false');
      setShow(false);
      setShowSideMenu(false);
      setToggle(true);
      dispatch(tourStepsActions.setIsTour('false'));
      //   setIsTour('false');
      return;
    }

    if (index === 0 && action === ACTIONS.NEXT && lifecycle === LIFECYCLE.COMPLETE) {
      setShow(false);
      setShowSideMenu(false);
      setToggle(true);
      dispatch(tourStepsActions.setIsRun(false));
      dispatch(tourStepsActions.setTourName('ADD_CUSTOMER_DETAILS'));
      navigate(getFeaturePath('CUSTOMERS', 'add'));
    }
  };

  const handleAddCustomerDetailsTour = data => {
    const { action, index, status, type, size, lifecycle } = data;

    if (action === ACTIONS.SKIP) {
      setItem('isTour', 'false');
      setShow(false);
      setShowSideMenu(false);
      setToggle(true);
      dispatch(tourStepsActions.setIsTour('false'));
      //   setIsTour('false');
      return;
    }

    if (type === 'tour:end' && action === ACTIONS.NEXT) {
      setShow(false);
      setShowSideMenu(false);
      setToggle(true);
      dispatch(tourStepsActions.setIsRun(false));
      dispatch(tourStepsActions.setIsTour('false'));
      dispatch(tourStepsActions.setShowTourWelcome('false'));
      dispatch(tourStepsActions.setShowTourSteps(false));
      dispatch(tourStepsActions.setSteps({ steps: [] }));
    }
  };

  const handleCustomerInvoiceTour = data => {
    const { action, index, lifecycle } = data;

    if (action === ACTIONS.SKIP) {
      setItem('isTour', 'false');
      setShow(false);
      setShowSideMenu(false);
      setToggle(true);
      dispatch(tourStepsActions.setIsTour('false'));
      //   setIsTour('false');

      return;
    }

    if (index === 0 && action === ACTIONS.START && lifecycle === LIFECYCLE.READY) {
      setActive('LBL_INVOICES');
      setShowMenu(true);
      setToggle(true);
    }

    if (index === 1 && action === ACTIONS.NEXT && lifecycle === LIFECYCLE.COMPLETE) {
      setShow(false);
      setShowSideMenu(false);
      setToggle(true);
      dispatch(tourStepsActions.setIsRun(false));
      dispatch(tourStepsActions.setTourName('ADD_CUSTOMER_INVOICE'));
      navigate(getFeaturePath('CUSTOMERS_INVOICES'));
      //   addStepsOptions(addProductSteps);
      //   setSteps(addProductSteps);
    }
    // if (index === 1 && type === 'tour:end' && action === ACTIONS.NEXT) {
    //   //   setItem('isTour', 'false');
    //   //   dispatch(tourStepsActions.setIsTour('false'));

    //   //   setIsTour('false');

    //   setShow(false);
    //   setShowSideMenu(false);
    //   setToggle(true);
    //   dispatch(tourStepsActions.setIsRun(false));
    //   dispatch(tourStepsActions.setTourName('ADD_PRODUCT'));
    //   navigate(getFeaturePath('PRODUCTS'));
    // }
  };

  const handleAddCustomerInvoiceTour = data => {
    const { action, index, status, type, size, lifecycle } = data;

    if (action === ACTIONS.SKIP) {
      setItem('isTour', 'false');
      setShow(false);
      setShowSideMenu(false);
      setToggle(true);
      dispatch(tourStepsActions.setIsTour('false'));
      //   setIsTour('false');
      return;
    }

    if (index === 0 && action === ACTIONS.NEXT && lifecycle === LIFECYCLE.COMPLETE) {
      setShow(false);
      setShowSideMenu(false);
      setToggle(true);
      dispatch(tourStepsActions.setIsRun(false));
      dispatch(tourStepsActions.setTourName('ADD_CUSTOMER_INVOICES_DETAILS'));
      navigate(getFeaturePath('CUSTOMERS_INVOICES', 'add'));
    }
  };

  const handleAddCustomerInvoiceDetailsTour = data => {
    const { action, index, status, type, size, lifecycle } = data;

    dispatch(tourStepsActions.setStepIndex(index));

    if (action === ACTIONS.SKIP) {
      setItem('isTour', 'false');
      setShow(false);
      setShowSideMenu(false);
      setToggle(true);
      dispatch(tourStepsActions.setIsTour('false'));
      //   setIsTour('false');
      return;
    }

    if (type === 'tour:end' && action === ACTIONS.NEXT) {
      setShow(false);
      setShowSideMenu(false);
      setToggle(true);
      dispatch(tourStepsActions.setIsRun(false));
      dispatch(tourStepsActions.setIsTour('false'));
      dispatch(tourStepsActions.setShowTourWelcome('false'));
      dispatch(tourStepsActions.setShowTourSteps(false));
      dispatch(tourStepsActions.setSteps({ steps: [] }));
    }
  };

  const handlePurchaseOrderTour = data => {
    const { action, index, lifecycle } = data;

    if (action === ACTIONS.SKIP) {
      setItem('isTour', 'false');
      setShow(false);
      setShowSideMenu(false);
      setToggle(true);
      dispatch(tourStepsActions.setIsTour('false'));
      //   setIsTour('false');

      return;
    }

    if (index === 0 && action === ACTIONS.START && lifecycle === LIFECYCLE.READY) {
      setActive('LBL_PURCHASE');
      setShowMenu(true);
      setToggle(true);
    }

    if (index === 1 && action === ACTIONS.NEXT && lifecycle === LIFECYCLE.COMPLETE) {
      setShow(false);
      setShowSideMenu(false);
      setToggle(true);
      dispatch(tourStepsActions.setIsRun(false));
      dispatch(tourStepsActions.setTourName('ADD_PURCHASE_ORDER'));
      navigate(getFeaturePath('PURCHASE_ORDERS'));
      //   addStepsOptions(addProductSteps);
      //   setSteps(addProductSteps);
    }
    // if (index === 1 && type === 'tour:end' && action === ACTIONS.NEXT) {
    //   //   setItem('isTour', 'false');
    //   //   dispatch(tourStepsActions.setIsTour('false'));

    //   //   setIsTour('false');

    //   setShow(false);
    //   setShowSideMenu(false);
    //   setToggle(true);
    //   dispatch(tourStepsActions.setIsRun(false));
    //   dispatch(tourStepsActions.setTourName('ADD_PRODUCT'));
    //   navigate(getFeaturePath('PRODUCTS'));
    // }
  };

  const handleAddPurchaseOrderTour = data => {
    const { action, index, status, type, size, lifecycle } = data;

    if (action === ACTIONS.SKIP) {
      setItem('isTour', 'false');
      setShow(false);
      setShowSideMenu(false);
      setToggle(true);
      dispatch(tourStepsActions.setIsTour('false'));
      //   setIsTour('false');
      return;
    }

    if (index === 0 && action === ACTIONS.NEXT && lifecycle === LIFECYCLE.COMPLETE) {
      setShow(false);
      setShowSideMenu(false);
      setToggle(true);
      dispatch(tourStepsActions.setIsRun(false));
      dispatch(tourStepsActions.setTourName('ADD_PURCHASE_ORDER_DETAILS'));
      navigate(getFeaturePath('PURCHASE_ORDERS', 'add'));
    }
  };

  const handleAddPurchaseOrderDetailsTour = data => {
    const { action, index, status, type, size, lifecycle } = data;

    dispatch(tourStepsActions.setStepIndex(index));

    if (action === ACTIONS.SKIP) {
      setItem('isTour', 'false');
      setShow(false);
      setShowSideMenu(false);
      setToggle(true);
      dispatch(tourStepsActions.setIsTour('false'));
      //   setIsTour('false');
      return;
    }

    if (type === 'tour:end' && action === ACTIONS.NEXT) {
      setShow(false);
      setShowSideMenu(false);
      setToggle(true);
      dispatch(tourStepsActions.setIsRun(false));
      dispatch(tourStepsActions.setIsTour('false'));
      dispatch(tourStepsActions.setShowTourWelcome('false'));
      dispatch(tourStepsActions.setShowTourSteps(false));
      dispatch(tourStepsActions.setSteps({ steps: [] }));
    }
  };

  return (
    <>
      {showTourWelcome === 'true' && !showTourSteps && (
        <TourWelcome
          setShowTourSteps={setShowTourSteps}
          showSideMenu={showSideMenu}
          setShowSideMenu={setShowSideMenu}
          setToggle={setToggle}
          //   setIsTour={setIsTour}
          showTourWelcome={showTourWelcome}
          //   setShowTourWelcome={setShowTourWelcome}
          steps={steps}
          //   setSteps={setSteps}
          addStepsOptions={addStepsOptions}
          tourName={tourName}
          setTourName={setTourName}
          features={features}
          fillTourSteps={fillTourSteps}
          setActive={setActive}
          setShowMenu={setShowMenu}
        />
      )}
      {/* {showTourSteps && ( */}
      {steps && steps.length > 0 && showTourSteps && (
        <Joyride
          steps={steps}
          run={run}
          styles={localStorage.getItem('code') === 'en' ? tourStylesEn : tourStylesAr}
          continuous={true}
          showSkipButton={true}
          scrollDuration={20}
          scrollOffset={300}
          spotlightClicks={spotlightClicks}
          // showProgress={true}
          hideCloseButton={true}
          disableOverlayClose={true}
          // disableScrolling={true}
          // disableScrollParentFix={true}
          callback={handleJoyrideCallback}
        />
      )}

      {/* )} */}
    </>
  );
}

export default TourGuide;
