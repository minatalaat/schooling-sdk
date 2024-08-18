import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import i18next from 'i18next';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import { useAxiosFunction } from '../../hooks/useAxios';
import {
  getCompanyProfileUrl,
  getFetchUrl,
  getPublicKeyUrl,
  getTierFeaturesUrl,
  getMyProfileUrl,
  getUserFavoritesUrl,
  getInvoiceDetailsUrl,
} from '../getUrl';
import { authActions } from '../../store/auth';
import { userFeaturesActions } from '../../store/userFeatures';
import { MODELS } from '../../constants/models';
import { useAuthServices } from './useAuthServices';
import { featuresEnum } from '../../constants/featuresEnum/featuresEnum';
import { getItem, setItem } from '../../utils/localStorage';
import { tourStepsActions } from '../../store/tourSteps';
import { useFeatures } from '../../hooks/useFeatures';
import { confirmationPopupActions } from '../../store/confirmationPopup';
import { useFeatureConfigurationServices } from './useFeatureConfigurationServices';
import { useUpgradeServices } from './useUpgradeServices';
import { upgradeConfirmationPopupActions } from '../../store/upgradeConfirmationPopup';
import { alertsActions } from '../../store/alerts';
import { forceFeatures } from '../../utils/helpers';
import useSubscriptionServices from './useSubscriptionServices';
import { useOBServices } from './useOBServices';
import { offCanvasActions } from '../../store/offCanvas';

export const useInitializationServices = () => {
  const [searchParams] = useSearchParams();
  const isReturnFromPaymentExists = searchParams && searchParams.size > 0 && searchParams.has('isReturnFromPayment');
  const { api } = useAxiosFunction();
  const { t } = useTranslation();

  const { logoutService, checkAutoAuthenticationService } = useAuthServices();
  const { isFeatureAvailable, removeSubFeatureIfAvailable, getFeaturePath, checkPrivilege, isSubFeatureAvailable } = useFeatures();
  const { updateConfigurationsService } = useFeatureConfigurationServices();
  const { getSubscriptionModelsService, updateSubscriptionInvoiceStatusService } = useSubscriptionServices();

  const { generateTokenService } = useOBServices();
  const { getSupscriptionInfoService, updateTier, cancelUpdateTierRequest } = useUpgradeServices();

  let subInfo = null;
  let customerId = null;
  let first_login = false;
  let maxCallbacks = 3;
  const authenticated = getItem('checksum');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const actionEnum = {
    1: 'VIEW',
    2: 'ADD',
    3: 'EDIT',
    4: 'DELETE',
  };

  const alertHandler = (title, message) => dispatch(alertsActions.initiateAlert({ title, message }));

  const getPublicKeyService = async () => {
    const res = await api('GET', getPublicKeyUrl());
    if (!(res?.data?.code === '0') || !res?.data?.returnedObject) return dispatch(authActions.resetLocalStorage());
    dispatch(userFeaturesActions.getPublicKey(res.data.returnedObject));
  };

  const getUserFeaturesService = async (routes, tierFeatures) => {
    const userProfileResponse = await api('GET', getMyProfileUrl(), null, null, () => {});

    if (
      !(userProfileResponse?.data?.status === 'Ok') ||
      !userProfileResponse?.data?.data?.returnedObj ||
      userProfileResponse?.data?.data?.returnedObj?.length === 0
    )
      return logoutService();

    const featuresAllData = userProfileResponse.data.data?.returnedObj?.[0];

    let featuresData = {
      features: featuresAllData.features || [],
      id: featuresAllData.id || -1,
      email: featuresAllData.code || '',
      name: featuresAllData.code || '',
      group: featuresAllData.group || -1,
      userData: featuresAllData,
    };

    let tempFeaturesData = [];
    featuresData &&
      featuresData?.features &&
      featuresData?.features.forEach(item => {
        const isExist = tierFeatures.filter(tierFeature => tierFeature?.featureCode === item?.featureCode).length > 0;

        updateConfigurationsService(item?.featureCode, isExist);
        if (isExist) tempFeaturesData.push(item);
      });
    featuresData.features = tempFeaturesData;

    // You can force features here below

    featuresData.features = forceFeatures(featuresData?.features, [
      { subFeatureCode: '15.1', actions: ['1', '2', '3', '4'] },
      { subFeatureCode: '15.2', actions: ['1', '2', '3', '4'] },
      { subFeatureCode: '15.3', actions: ['1', '2', '3', '4'] },
      { subFeatureCode: '15.4', actions: ['1', '2', '3', '4'] },
      { subFeatureCode: '15.5', actions: ['1', '2', '3', '4'] },
      { subFeatureCode: '15.6', actions: ['1', '2', '3', '4'] },
      { subFeatureCode: '15.7', actions: ['1', '2', '3', '4'] },
      { subFeatureCode: '15.8', actions: ['1', '2', '3', '4'] },
      { subFeatureCode: '15.9', actions: ['1', '2', '3', '4'] },
    ]);

    let displayedRoutes = [];
    let allowedExports = [];

    if (featuresData.features && featuresData.features.length > 0) {
      featuresData.features.forEach(feature => {
        if (feature.subFeatureList && feature.subFeatureList.length > 0) {
          feature.subFeatureList.forEach(item => {
            let subFeatureKey = Object.keys(featuresEnum).find(item2 => featuresEnum[item2].id === item.subFeatureCode);
            if (featuresEnum[subFeatureKey]?.exportName) allowedExports.push(featuresEnum[subFeatureKey]?.exportName);
            routes[subFeatureKey] &&
              routes[subFeatureKey].forEach(route => {
                displayedRoutes.push(route);
              });
            item.actions &&
              item.actions.forEach(action => {
                if (routes[`${subFeatureKey}_${actionEnum[action]}`] !== undefined) {
                  routes[`${subFeatureKey}_${actionEnum[action]}`].forEach(route => {
                    displayedRoutes.push(route);
                  });
                }
              });
          });
        }
      });
    }

    let count = 0;

    featuresData.quickActionsTotal = count;

    dispatch(userFeaturesActions.setAllowedExports(allowedExports));
    dispatch(userFeaturesActions.getUserFeatures(featuresData));
    dispatch(authActions.getRoutes(displayedRoutes));
    return featuresData;
  };

  const getCompanyProfileService = async () => {
    let mainDataPayload = {
      fields: ['address', 'name', 'logo', 'taxNumberList'],
      related: {},
    };
    const companyMainDataResponse = await api('POST', getFetchUrl(MODELS.COMPANY, 1), mainDataPayload, null, () => {});

    if (
      companyMainDataResponse?.data?.status !== 0 ||
      !companyMainDataResponse?.data?.data ||
      companyMainDataResponse?.data?.data?.length === 0
    ) {
      return logoutService();
    }

    const companyProfileResponse = await api('GET', getCompanyProfileUrl(), null);

    if (
      companyProfileResponse?.data?.status !== 'Ok' ||
      !companyProfileResponse?.data?.data?.returnedObj?.[0] ||
      companyProfileResponse?.data?.data?.returnedObj?.length === 0
    ) {
      return logoutService();
    }

    first_login = companyProfileResponse?.data?.data?.returnedObj?.[0]?.companyInfoProvision?.first_login;
    customerId = companyProfileResponse?.data?.data?.returnedObj?.[0]?.companyInfoProvision?.customer_id;
    dispatch(
      userFeaturesActions.getCompanyInfoProvision({
        ...companyProfileResponse?.data?.data?.returnedObj?.[0],
        mainData: companyMainDataResponse.data.data[0],
      })
    );
    dispatch(authActions.getFirstLogin(first_login));

    if (first_login) {
      subInfo = await getSupscriptionInfoService();

      if (subInfo?.status === 'PFP') {
        dispatch(authActions.setPayOnly());
        await proceedUpgradeRequestService();
      } else {
        navigate('/change-password');
      }
    }

    return {
      ...companyProfileResponse?.data?.data?.returnedObj?.[0],
      mainData: companyMainDataResponse.data.data[0],
    };
  };

  const getUserFavoritesService = async () => {
    const res = await api('GET', getUserFavoritesUrl(), null, null, () => {});
    let status = res?.data?.status;
    let data = res?.data?.data?.returnedObj;
    let total = res?.data?.data?.returnedObj?.length;

    if (status !== 'Ok' || total === undefined || total === null)
      if (data?.length > 0) {
        return logoutService();
      }
  };

  const getTierFeaturesService = async id => {
    try {
      const res = await api('GET', getTierFeaturesUrl(id), {}, null, () => {});
      if (!(res?.data?.status === 'Ok') || !res?.data?.data?.returnedObj || res?.data?.data?.returnedObj?.length === 0)
        return logoutService();
      return res?.data?.data?.returnedObj?.[0]?.features;
    } catch (err) {
      return logoutService();
    }
  };

  const fetchInvoiceNoService = async () => {
    const res = await api('GET', getInvoiceDetailsUrl(customerId), undefined, undefined, () => {});
    if (!(res?.data?.statusCode === 'I000000')) return null;

    let invoiceNo = res?.data?.returnedObject?.returnedList?.[0]?.invoiceNo || null;

    if (!invoiceNo && maxCallbacks > 0) {
      maxCallbacks = maxCallbacks - 1;
      return await fetchInvoiceNoService(customerId);
    }

    return invoiceNo;
  };

  const proceedUpgradeRequestService = async () => {
    if (subInfo?.status !== 'PFP') {
      const updateTierRes = await updateTier(
        parseInt(subInfo?.pendingSubscriptionDTO?.tier?.code),
        parseInt(subInfo?.pendingSubscriptionDTO?.tierPlanPriceId),
        parseInt(customerId),
        'telesales'
      );
      if (!updateTierRes) return false;
    }

    let invoiceNo = await fetchInvoiceNoService();
    if (!invoiceNo) return alertHandler('Error', t('LBL_FAILED_TO_PROCEED_TO_PAYMEMNT'));
    return navigate(getFeaturePath('SUBSCRIPTIONS', 'view', { id: invoiceNo }));
  };

  const cancelUpgradeRequest = async () => {
    const cancelUpgradeRequestRes = await cancelUpdateTierRequest();
    if (!cancelUpgradeRequestRes) return alertHandler('Error', t('LBL_ERROR_CANCELLING_REQUEST'));
    return alertHandler('Success', t('LBL_CANCELLING_REQUEST_DONE'));
  };

  const initiateAppService = async routes => {
    const isAutoAuth = await checkAutoAuthenticationService();
    if (isAutoAuth) return null;

    if (!authenticated) return dispatch(authActions.endLoading());

    const { pricePlans } = await getSubscriptionModelsService();

    if (isReturnFromPaymentExists) {
      const updateInvoiceRes = await updateSubscriptionInvoiceStatusService();

      if (updateInvoiceRes) {
        dispatch(authActions.redirectStart({ text: 'PAYMENT_SUCCEESS_REDIRECT' }));
        return setTimeout(() => logoutService(), [5000]);
      }
    }

    const companyResponse = await getCompanyProfileService();

    let tierCode = null;

    tierCode = companyResponse?.companyInfoProvision?.subscriptionTier?.code;

    const tierFeatures = await getTierFeaturesService(tierCode);

    let featuresData = await getUserFeaturesService(routes, tierFeatures);

    subInfo = await getSupscriptionInfoService();
    if (!subInfo) return logoutService();

    const expirationDate = companyResponse?.companyInfoProvision?.subscriptionExpirationDate;
    const date = moment(expirationDate, 'YYYY-MM-DD');
    const today = moment();
    const expireWarningDate = moment(expirationDate).subtract(3, 'days').toDate();

    const isExpired = today.isSameOrAfter(date, 'day');
    const isPendingSubscription = subInfo?.pendingSubscriptionDTO !== null && subInfo?.pendingSubscriptionDTO !== undefined;
    const subStatus = subInfo?.status;
    const canEditSub = checkPrivilege('edit', 'SETTINGS', 'SUBSCRIPTIONS', featuresData?.features);
    const showExpirationWarning =
      canEditSub && !isExpired && !subInfo?.recurringPayment && today?.isBefore(date) && today?.isSameOrAfter(expireWarningDate);
    const isPopup = (isExpired || isPendingSubscription || subStatus === 'PFP') && canEditSub && !isReturnFromPaymentExists;
    const isTour = getItem('isTour') === 'true';

    await getUserFavoritesService();

    if (featuresData?.features) {
      if (isSubFeatureAvailable({ currentFeatures: featuresData?.features, featureCode: '6', subFeatureCode: '6.1' })) {
        await generateTokenService({ onError: () => {} });
      }
    }

    dispatch(authActions.endLoading());

    if (isPopup) {
      setItem('isTour', false);

      const currentPlanMessage = i18next.language === 'en' ? subInfo?.tier?.titleEn : subInfo?.tier?.titleAr;

      const updatePricePlanMessage =
        i18next.language === 'en'
          ? pricePlans.filter(item => item.tierPlanPriceId === parseInt(subInfo?.pendingSubscriptionDTO?.tierPlanPriceId))[0]?.titleEn
          : pricePlans.filter(item => item.tierPlanPriceId === parseInt(subInfo?.pendingSubscriptionDTO?.tierPlanPriceId))[0]?.titleAr;

      if (!first_login && isPendingSubscription) {
        if (subStatus === 'PFP') {
          dispatch(authActions.setPayOnly());

          if (getItem('isPendingRequest') !== 'true') {
            setItem('isPendingRequest', true);
            dispatch(
              upgradeConfirmationPopupActions.openPopup({
                title: t('LBL_PENDING_UPGRADE_REQUEST'),
                message: `${t('LBL_UPGRRADE_FROM')} (${currentPlanMessage}) ${t('LBL_TO_TIER')} (${updatePricePlanMessage})`,
                actionLabel: 'LBL_PROCEED',
                showAction: true,
                cancelLabel: t('LBL_REMIND_ME_LATER'),
                onConfirmHandler: proceedUpgradeRequestService,
              })
            );
          }

          dispatch(
            offCanvasActions.push({
              // icon: action.payload.icon || null,
              message: `${t('LBL_UPGRRADE_FROM')} (${currentPlanMessage}) ${t('LBL_TO_TIER')} (${updatePricePlanMessage})` || null,
              confirmLabel: t('LBL_PROCEED_NOTIFICATION'),
              showConfirmAction: true,
              onConfirmHandler: proceedUpgradeRequestService,
            })
          );
        } else {
          if (getItem('isPendingRequest') !== 'true') {
            setItem('isPendingRequest', true);
            dispatch(
              upgradeConfirmationPopupActions.openPopup({
                title: t('LBL_PENDING_UPGRADE_REQUEST'),
                message: `${t('LBL_UPGRRADE_FROM')} (${currentPlanMessage}) ${t('LBL_TO_TIER')} (${updatePricePlanMessage})`,
                actionLabel: 'LBL_PROCEED',
                showAction: true,
                cancelLabel: t('LBL_REMIND_ME_LATER'),
                thirdActionLabel: t('LBL_CANCEL_UPGRADE_REQUEST'),
                onConfirmHandler: proceedUpgradeRequestService,
                thirdActionHandler: cancelUpgradeRequest,
              })
            );
          }

          dispatch(
            offCanvasActions.push({
              message: `${t('LBL_UPGRRADE_FROM')} (${currentPlanMessage}) ${t('LBL_TO_TIER')} (${updatePricePlanMessage})`,
              confirmLabel: t('LBL_PROCEED'),
              showConfirmAction: true,
              onConfirmHandler: proceedUpgradeRequestService,
              cancelLabel: t('LBL_CANCEL_UPGRADE_REQUEST'),
              showCancelAction: true,
              onCancelHandler: cancelUpgradeRequest,
            })
          );
        }
      } else if (!first_login && subStatus === 'PFP') {
        dispatch(authActions.setPayOnly());

        if (getItem('isPendingRequest') !== 'true') {
          setItem('isPendingRequest', true);
          dispatch(
            upgradeConfirmationPopupActions.openPopup({
              title: t('LBL_PENDING_FOR_PAYMENT'),
              message: `${t('LBL_PENDING_FOR_PAYMENT_MESSAGE')}`,
              actionLabel: 'LBL_PROCEED',
              showAction: true,
              cancelLabel: t('LBL_REMIND_ME_LATER'),
              onConfirmHandler: proceedUpgradeRequestService,
            })
          );
        }

        dispatch(
          offCanvasActions.push({
            message: `${t('LBL_PENDING_FOR_PAYMENT_MESSAGE')}`,
            confirmLabel: t('LBL_PROCEED_NOTIFICATION'),
            showConfirmAction: true,
            onConfirmHandler: proceedUpgradeRequestService,
          })
        );
      }
    }

    if (isTour && !isPopup) {
      dispatch(tourStepsActions.setIsTour('true'));
      dispatch(tourStepsActions.setShowTourWelcome('true'));
      setItem('isTour', false);
    }

    if (showExpirationWarning && getItem('isShowExpirationWarning') !== 'true') {
      setItem('isShowExpirationWarning', true);
      dispatch(
        confirmationPopupActions.openPopup({
          message: 'LBL_EXPIRATION_WARNING_MESSAGE',
          showAction: false,
        })
      );
      dispatch(
        offCanvasActions.push({
          message: `${t('LBL_EXPIRATION_WARNING_MESSAGE')}`,
          showConfirmAction: false,
        })
      );
    }
  };

  return { initiateAppService, getPublicKeyService };
};
