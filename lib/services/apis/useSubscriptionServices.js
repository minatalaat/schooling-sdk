import { useDispatch, useSelector } from 'react-redux';
import i18next from 'i18next';
import { useSearchParams } from 'react-router-dom';

import { packagesActions } from '../../store/packages';
import { useAxiosFunction } from '../../hooks/useAxios';
import {
  geSubscriptionDetailsUrl,
  getActionUrl,
  getSubscriptionModelsUrl,
  getUpdateSubscriptionRecurringUrl,
  getUpdateSubscriptionRenewalUrl,
  updateTierURL,
} from '../../services/getUrl';
import { alertsActions } from '../../store/alerts';

export default function useSubscriptionServices() {
  const { api } = useAxiosFunction();
  const dispatch = useDispatch();

  const [searchParams] = useSearchParams();

  let maxCallbacks = 3;

  const companyInfoProvision = useSelector(state => state.userFeatures.companyInfo?.companyInfoProvision);

  const ar = i18next.getFixedT('ar');
  const en = i18next.getFixedT('en');

  const getSubscriptionModelsService = async () => {
    dispatch(packagesActions.setLoadingStart());

    const res = await api('GET', getSubscriptionModelsUrl(import.meta.env.VITE_PRODUCT_ID));

    if (!(res?.data?.statusCode === 'I000000')) {
      dispatch(packagesActions.setLoadingFailed());
      return false;
    }

    if (!(res?.data?.returnedObject?.[0]?.tierLst?.length > 0)) {
      dispatch(packagesActions.setLoadingFailed());
      return false;
    }

    let packages = [...res.data.returnedObject[0].tierLst];

    packages.forEach(tier => {
      let newFeatures = [];
      if (!tier.productTierFeatureLst || tier.productTierFeatureLst.length === 0) return;
      let features = tier.productTierFeatureLst;
      if (!features) return;
      features.forEach(feature => {
        let productFeature = feature.productFeature;
        if (!productFeature) return;
        let isParentExist = newFeatures.find(newFeature => newFeature.featureCd === productFeature.parentFeatureCd);

        if (!productFeature.parentFeatureCd && !isParentExist) {
          newFeatures.push({
            featureCd: productFeature.featureCd,
            featureArDesc: productFeature.featureArDesc,
            featureEnDesc: productFeature.featureEnDesc,
            featureArNm: productFeature.featureArNm,
            featureEnNm: productFeature.featureEnNm,
            subFeatures: [],
          });
        } else {
          let parent = newFeatures.find(newFeature => newFeature.featureCd === productFeature.parentFeatureCd);

          if (parent) {
            parent.subFeatures.push({
              featureCd: productFeature.featureCd,
              featureArDesc: productFeature.featureArDesc,
              featureEnDesc: productFeature.featureEnDesc,
              featureArNm: productFeature.featureArNm,
              featureEnNm: productFeature.featureEnNm,
            });
          }
        }
      });
      tier.newFeatures = newFeatures;
    });

    let freeTierId = null;
    let freeTierPriceId = null;
    let tiers = [...res.data.returnedObject[0].tierLst];
    let pricePlans = [];

    tiers.forEach(tier => {
      if (!tier.tierPlanPriceLst || tier.tierPlanPriceLst.length === 0) {
        dispatch(packagesActions.setLoadingFailed());
        return false;
      }

      tier.tierPlanPriceLst.forEach(tierPrice => {
        if (+tierPrice.baseFare === 0) {
          freeTierId = tier.tierId;
          freeTierPriceId = tier.tierPlanPriceLst.find(tier => tier.paymentPlan.paymentFreq === 'MONTHLY')?.tierPlanPriceId;
          return pricePlans.push({
            ...tierPrice,
            tierId: tier.tierId,
            titleAr: tier.titleAr,
            titleEn: tier.titleEn,
          });
        }

        pricePlans.push({
          ...tierPrice,
          tierId: tier.tierId,
          titleAr: `${tier.titleAr} / ${tierPrice?.paymentPlan?.paymentFreq === 'MONTHLY' ? ar('MONTHLY') : ar('ANNUAL')}`,
          titleEn: `${tier.titleEn} / ${tierPrice?.paymentPlan?.paymentFreq === 'MONTHLY' ? en('MONTHLY') : en('ANNUAL')}`,
        });
      });
    });

    dispatch(packagesActions.setPackages({ freeTierId, freeTierPriceId, packages, pricePlans }));
    return { freeTierId, freeTierPriceId, packages, pricePlans };
  };

  const manageTierService = async data => {
    let payload = {
      data: {
        requestObject: {
          tierCode: +data?.updateTierId || undefined,
          tierPlanPriceCode: +data?.updateTierPlanPriceId || undefined,
          referralCode: data?.referralCode || undefined,
          channel: data?.channel ?? 'qaema',
        },
      },
    };

    try {
      const res = await api('POST', updateTierURL(), payload);

      if (res?.data?.fault?.statusDescription === 'Total Billed Amount Is Greater Than Total Paid Amount') {
        dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'YOU_HAVE_UNPAID_INVOICE' }));
        return false;
      }

      if (res?.data?.code !== 200) {
        dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'FAIL_IN_UPDATE_TIER' }));
        return false;
      }

      return true;
    } catch (err) {
      dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'FAIL_IN_UPDATE_TIER' }));
      return false;
    }
  };

  const getSubscriptionDetailsService = async id => {
    const res = await api('GET', geSubscriptionDetailsUrl(companyInfoProvision?.customer_id, id));

    if (!(res?.data?.statusCode === 'I000000') || !(res?.data?.returnedObject?.returnedList?.length > 0)) return null;

    return res.data.returnedObject.returnedList[0];
  };

  const updateSubscriptionRenewalService = async (id, isAutoRenewal) => {
    const payload = {
      subscriptionId: id,
      isAutoRenewal: isAutoRenewal ? 'Y' : 'N',
    };

    try {
      const res = await api('POST', getUpdateSubscriptionRenewalUrl(), payload);

      if (!res?.data?.success) {
        dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'ERROR_SUBSCRIPTION_RENEWAL' }));
        return false;
      }

      return true;
    } catch (err) {
      return false;
    }
  };

  const updateSubscriptionRecurringService = async (id, isAutoRecurring) => {
    const payload = {
      subscriptionId: id,
      isAutoRecurring: isAutoRecurring ? 'Y' : 'N',
    };

    try {
      const res = await api('POST', getUpdateSubscriptionRecurringUrl(), payload);

      if (!res?.data?.success) {
        dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'ERROR_SUBSCRIPTION_RECURRING' }));
        return false;
      }

      return true;
    } catch (err) {
      return false;
    }
  };

  const updateSubscriptionInvoiceStatusService = async () => {
    const payload = {
      action: 'action-update-payment',
      data: {
        context: {
          isMoaeen: false,
          ps_authorized_amount: searchParams.get('ps_authorized_amount') || null,
          ps_merchant_transaction_ref: searchParams.get('ps_merchant_transaction_ref') || null,
          ps_status_cd: searchParams.get('ps_status_cd') || null,
          ps_adapter_response_cd: searchParams.get('ps_adapter_response_cd') || null,
          ps_transaction_ref: searchParams.get('ps_transaction_ref') || null,
          ps_status_desc: searchParams.get('ps_status_desc') || null,
          ps_secure_hash: searchParams.get('ps_secure_hash') || null,
          ps_adapter_response_message: searchParams.get('ps_adapter_response_message') || null,
          ps_captured_amount: searchParams.get('ps_captured_amount') || null,
          ps_merchant_order_info: searchParams.get('ps_merchant_order_info') || null,
          ps_currency: searchParams.get('ps_currency') || null,
          ps_access_code: searchParams.get('ps_access_code') || null,
          ps_invoice_number: searchParams.get('ps_invoice_number') || null,
          ps_adapter_transaction_ref: searchParams.get('ps_adapter_transaction_ref') || null,
          ps_card_type: searchParams.get('ps_card_type') || null,
          ps_is_apple_pay: searchParams.get('ps_is_apple_pay') || null,
        },
      },
    };

    try {
      const res = await api('POST', getActionUrl(), payload);

      if (res?.data?.data?.[0]?.statusCode !== 'I000000' && maxCallbacks > 0) {
        maxCallbacks = maxCallbacks - 1;
        return await updateSubscriptionInvoiceStatusService();
      }

      if (res?.data?.data?.[0]?.statusCode === 'E010002') return true;
      if (res?.data?.status !== 0 || res?.data?.data?.[0]?.statusCode !== 'I000000' || !res?.data?.data?.[0]?.returnedObject) return false;
      if (res?.data?.data?.[0]?.returnedObject?.invoiceSttsCd === 'A') return false;

      return true;
    } catch (err) {
      return false;
    }
  };

  return {
    getSubscriptionModelsService,
    manageTierService,
    getSubscriptionDetailsService,
    updateSubscriptionRenewalService,
    updateSubscriptionRecurringService,
    updateSubscriptionInvoiceStatusService,
  };
}
