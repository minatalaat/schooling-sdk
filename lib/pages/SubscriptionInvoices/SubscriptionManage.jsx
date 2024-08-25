import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import i18next from 'i18next';
import { useNavigate } from 'react-router-dom';
import { Accordion } from 'react-bootstrap';

import Spinner from '../../components/Spinner/Spinner';
import BreadCrumb from '../../components/ui/BreadCrumb';
import BackButton from '../../components/ui/buttons/BackButton';
import Calendar from '../../components/ui/Calendar';
import BorderSection from '../../components/ui/inputs/BorderSection';
import DropDown from '../../components/ui/inputs/DropDown';
import TextInput from '../../components/ui/inputs/TextInput';
import DateInput from '../../components/ui/inputs/DateInput';
import ValueCard from '../../components/ui/inputs/ValueCard';

import { alertsActions } from '../../store/alerts';
import useSubscriptionServices from '../../services/apis/useSubscriptionServices';
import { setFieldValue } from '../../utils/formHelpers';
import { confirmationPopupActions } from '../../store/confirmationPopup';
import { useFeatures } from '../../hooks/useFeatures';
import { upgradeConfirmationPopupActions } from '../../store/upgradeConfirmationPopup';
import { useAxiosFunction } from '../../hooks/useAxios';
import { getCancelSubscriptionUrl, getInvoiceDetailsUrl, getReactivateSubscriptionUrl } from '../../services/getUrl';
import { useUpgradeServices } from '../../services/apis/useUpgradeServices';
import { subscriptionStatus } from '../../constants/subscriptions/subscriptions';
import moment from 'moment';
import CancelButton from '../../components/ui/buttons/CancelButton';

export default function SubscriptionManage({ mainConfig }) {
  const { api } = useAxiosFunction();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const { cancelUpdateTierRequest } = useUpgradeServices();
  const { t } = useTranslation();
  const { getSubscriptionModelsService, manageTierService } = useSubscriptionServices();
  const { getSupscriptionInfoService } = useUpgradeServices();
  const { getFeaturePath } = useFeatures();
  const { pricePlans, loading, freeTierId, packages } = useSelector(state => state.packages);
  const companyInfoProvision = useSelector(state => state.userFeatures.companyInfo?.companyInfoProvision);
  const subInfo = useSelector(state => state.userFeatures?.subInfo);
  const currentTierID = useSelector(state => state.userFeatures.companyInfo?.companyInfoProvision?.subscriptionTier?.code);
  const screenLoading = useMemo(() => loading || isLoading, [loading, isLoading]);
  const currentPaymentFreq = companyInfoProvision?.subscriptionPaymentFrequency;

  const isAutoRenewal = subInfo && subInfo.autoRenewal !== undefined ? subInfo.autoRenewal : false;
  const expirationDate = companyInfoProvision?.subscriptionExpirationDate;
  const date = moment(expirationDate, 'YYYY-MM-DD');
  const today = moment();
  const isExpired = today.isSameOrAfter(date, 'day');

  const [activeKey, setActiveKey] = useState(-1);

  const [disableButton, setDisableButton] = useState(false);

  const updatePricePlans = useMemo(() => {
    if (isExpired) {
      return pricePlans
        ?.filter(plan => +plan.tierId !== +freeTierId && plan.channelCd === 'qaema')
        .sort((item1, item2) => item1?.baseFare - item2?.baseFare);
    } else {
      if (+currentTierID !== +freeTierId) {
        return pricePlans
          ?.filter(
            plan =>
              +plan.tierId !== +currentTierID &&
              +plan.tierId !== +freeTierId &&
              plan.channelCd === 'qaema' &&
              plan.paymentPlan?.paymentFreq === currentPaymentFreq &&
              plan.baseFare > +subInfo?.subscriptionAmount
          )
          .sort((item1, item2) => item1?.baseFare - item2?.baseFare);
      } else {
        return pricePlans
          ?.filter(plan => +plan.tierId !== +freeTierId && plan.channelCd === 'qaema')
          .sort((item1, item2) => item1?.baseFare - item2?.baseFare);
      }
    }
  }, [pricePlans, currentTierID]);

  const initialValues = {
    currentPlan: i18next.language === 'en' ? subInfo?.tier?.titleEn : subInfo?.tier?.titleAr,
    updateTierId: 0,
    updateTierPlanPriceId: 0,
    referralCode: '',
    subscriptionStatus: t(subscriptionStatus?.find(sub => sub?.code === subInfo?.status)?.label ?? ''),
    startDt: subInfo?.startDt ?? '',
    endDt: subInfo?.endDt ?? '',
    isAutoRenewal: true,
    isAutoRecurring: true,
  };

  const validationSchema = Yup.object({
    tier: Yup.string(),
    referralCode: Yup.string(),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: true,
  });
  const alertHandler = (title, message) => {
    setDisableButton(false);
    dispatch(alertsActions.initiateAlert({ title, message }));
  };

  const { selectedPricePlan, selectedPackage } = useMemo(() => {
    const pack = packages.find(pack => +pack.tierId === +formik.values.updateTierId);
    const pricePlan = pricePlans.find(plan => +plan.tierPlanPriceId === +formik.values.updateTierPlanPriceId);

    return { selectedPricePlan: pricePlan, selectedPackage: pack };
  }, [packages, pricePlans, formik.values.updateTierId, formik.values.updateTierPlanPriceId]);

  const fetchSubscribtionModels = async () => {
    setIsLoading(true);
    const modelsResponse = await getSubscriptionModelsService();
    if (!modelsResponse) return navigate('/error');

    const infoResponse = await getSupscriptionInfoService();
    if (!infoResponse) return navigate('/error');

    setIsLoading(false);
  };

  const onFetchInvoiceError = () => {};

  const openHandler = (event, item, index) => {
    if (item?.subFeatures?.length !== 0) {
      setActiveKey(index);
    }

    if (activeKey === index) {
      setActiveKey(-1);
    }
  };

  const fetchInvoiceNo = async () => {
    const res = await api('GET', getInvoiceDetailsUrl(companyInfoProvision?.customer_id), undefined, undefined, onFetchInvoiceError);
    if (!(res?.data?.statusCode === 'I000000')) return 'error';

    let invoiceNo = res?.data?.returnedObject?.returnedList?.[0]?.invoiceNo || null;
    if (!invoiceNo) return await fetchInvoiceNo(companyInfoProvision?.customer_id);
    return invoiceNo;
  };

  const proceedUpgradeRequest = async () => {
    setDisableButton(true);
    if (subInfo?.status !== 'PFP') {
      const updateTierRes = await updateTier(
        parseInt(companyInfoProvision?.pendingSubscriptionTier?.code),
        parseInt(companyInfoProvision?.pendingSubscriptionTierPlanPriceId),
        ''
      );
      if (!updateTierRes) return false;
    }

    let invoiceNo = await fetchInvoiceNo();
    if (!invoiceNo) return alertHandler('Error', t('LBL_FAILED_TO_PROCEED_TO_PAYMEMNT'));
    return navigate(getFeaturePath('SUBSCRIPTIONS', 'view', { id: invoiceNo }));
  };

  const cancelUpgradeRequest = async () => {
    setDisableButton(true);
    const cancelUpgradeRequestRes = await cancelUpdateTierRequest();
    if (!cancelUpgradeRequestRes) return alertHandler('Error', t('LBL_ERROR_CANCELLING_REQUEST'));
    alertHandler('Success', t('LBL_CANCELLING_REQUEST_DONE'));
    setTimeout(() => {
      window.location.reload();
    }, [2000]);
  };

  const isOpenPendingRequest = useMemo(() => {
    return companyInfoProvision?.pendingSubscriptionRequestExist;
  }, [companyInfoProvision?.pendingSubscriptionRequestExist]);

  const handleOpenPendingRequest = async () => {
    let subStatus = subInfo?.status;
    const currentPlanMessage = i18next.language === 'en' ? subInfo?.tier?.titleEn ?? '' : subInfo?.tier?.titleAr ?? '';
    const updatePricePlanMessage =
      i18next.language === 'en'
        ? pricePlans.filter(item => item.tierPlanPriceId === parseInt(subInfo?.pendingSubscriptionDTO?.tierPlanPriceId))[0]?.titleEn
        : pricePlans.filter(item => item.tierPlanPriceId === parseInt(subInfo?.pendingSubscriptionDTO?.tierPlanPriceId))[0]?.titleAr;

    if (subStatus === 'A') {
      dispatch(
        upgradeConfirmationPopupActions.openPopup({
          title: t('LBL_PENDING_UPGRADE_REQUEST'),
          message: `${t('LBL_UPGRRADE_FROM')} (${currentPlanMessage}) ${t('LBL_TO_TIER')} (${updatePricePlanMessage})`,
          actionLabel: 'LBL_PROCEED',
          showAction: true,
          cancelLabel: t('LBL_REMIND_ME_LATER'),
          thirdActionLabel: t('LBL_CANCEL_UPGRADE_REQUEST'),
          onConfirmHandler: proceedUpgradeRequest,
          thirdActionHandler: cancelUpgradeRequest,
        })
      );
    } else if (subStatus === 'PFP') {
      dispatch(
        upgradeConfirmationPopupActions.openPopup({
          title: t('LBL_PENDING_UPGRADE_REQUEST'),
          message: `${t('LBL_UPGRRADE_FROM')} (${currentPlanMessage}) ${t('LBL_TO_TIER')} (${updatePricePlanMessage})`,
          actionLabel: 'LBL_PROCEED',
          showAction: true,
          cancelLabel: t('LBL_REMIND_ME_LATER'),
          onConfirmHandler: proceedUpgradeRequest,
        })
      );
    }
  };

  const changeTierClickHandler = () => {
    dispatch(
      confirmationPopupActions.openPopup({
        message: 'LBL_CHANGE_TIER_WARNING',
        onConfirmHandler: () => {
          updateTier(null, null, formik.values.referralCode.toString());
        },
      })
    );
  };

  const updateTier = async (tierId, pricePlanId, referralCode) => {
    setDisableButton(true);
    setIsLoading(true);
    const res = await manageTierService({
      updateTierId: tierId ? tierId : parseInt(formik.values.updateTierId),
      updateTierPlanPriceId: pricePlanId ? pricePlanId : parseInt(formik.values.updateTierPlanPriceId),
      customerId: companyInfoProvision?.customer_id,
      referralCode: referralCode && referralCode !== '' ? referralCode : null,
      channel: 'qaema',
    });

    if (!res) return setIsLoading(false);

    setIsLoading(false);
    dispatch(alertsActions.initiateAlert({ title: 'Success', message: 'UPDATE_TIER_REQUEST_SUCCESS' }));
    setTimeout(() => {
      navigate(getFeaturePath('SUBSCRIPTIONS'));
    }, [3000]);
  };

  const changePricePlanHandler = e => {
    const selectedPricePlan = pricePlans?.find(el => +el.tierPlanPriceId === +e.target.value) || null;
    setFieldValue(formik, 'updateTierPlanPriceId', +e.target.value || 0);
    setFieldValue(formik, 'updateTierId', +selectedPricePlan?.tierId || 0);
  };

  const cancelSubscription = async () => {
    setDisableButton(true);
    const cancelSubscriptionResponse = await api('POST', getCancelSubscriptionUrl(), {});
    if (cancelSubscriptionResponse?.data?.code !== 200) return alertHandler('Error', t('LBL_ERROR_DURING_CANCEL_SUBSCRIPTION'));
    alertHandler('Success', t('LBL_CANCEL_SUBSCRIPTION_SUCCESS'));
    setTimeout(() => {
      window.location.reload();
    }, [2000]);
  };

  const cancelSubscriptionConfirmation = () => {
    dispatch(
      upgradeConfirmationPopupActions.openPopup({
        message: 'LBL_YOU_ARE_ABOUT_TO_CANCEL_YOUR_SUBSCRIPTION',
        actionLabel: 'LBL_CONFIRM',
        showAction: true,
        cancelLabel: t('LBL_BACK'),
        onConfirmHandler: cancelSubscription,
      })
    );
  };

  const reactiveSubscription = async () => {
    try {
      setDisableButton(true);
      const reactiveSubscriptionResponse = await api('POST', getReactivateSubscriptionUrl(), {
        data: {
          requestObject: {
            quotationInfo: {
              tierId: formik.values.updateTierId,
              tierPlanPriceId: formik.values.updateTierPlanPriceId,
            },
          },
        },
      });
      if (reactiveSubscriptionResponse?.data?.code !== 200) return alertHandler('Error', t('LBL_ERROR_DURING_REACTIVATION'));
      alertHandler('Success', t('LBL_REACTIVATION_SUCCESS'));
      setTimeout(() => {
        window.location.reload();
      }, [2000]);
    } catch (err) {
      return alertHandler('Error', t('LBL_ERROR_DURING_REACTIVATION'));
    }
  };

  const reactiveSubscriptionConfirm = () => {
    dispatch(
      upgradeConfirmationPopupActions.openPopup({
        message: 'LBL_YOU_ARE_ABOUT_TO_REACTIVATE_YOUR_SUBSCRIPTION',
        actionLabel: 'LBL_CONFIRM',
        showAction: true,
        cancelLabel: t('LBL_BACK'),
        onConfirmHandler: reactiveSubscription,
      })
    );
  };

  useEffect(() => {
    fetchSubscribtionModels();
  }, []);

  useEffect(() => {
    if (isOpenPendingRequest) handleOpenPendingRequest();
  }, []);

  return (
    <>
      {screenLoading && <Spinner />}
      <div className="page-body">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <Calendar />
              <BreadCrumb feature={mainConfig.feature} subFeature={mainConfig.subFeature} modeText={t('MANAGE_SUBSCRIPTION')} />
            </div>
          </div>
          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{t('MANAGE_SUBSCRIPTION')}</h4>
              </div>

              <div className="reverse-page float-end">
                <BackButton text="LBL_BACK" />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              {!screenLoading && (
                <div className="card">
                  <div className="row">
                    <div className="col-12">
                      <BorderSection withBorder={false} title="LBL_CURRENT_SUBSCRIPTION" />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-12">
                      <div className="row">
                        <div className="col-md-4">
                          <TextInput formik={formik} label="CURRENT_TIER" accessor="currentPlan" mode="view" />
                        </div>
                        <div className="col-md-4">
                          <TextInput formik={formik} label="LBL_STATUS" accessor="subscriptionStatus" mode="view" />
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-4">
                          <DateInput formik={formik} label="LBL_START_DATE" accessor="startDt" disabled={true} />
                        </div>
                        <div className="col-md-4">
                          <DateInput formik={formik} label="LBL_END_DATE" accessor="endDt" disabled={true} />
                        </div>
                      </div>
                    </div>
                  </div>
                  {updatePricePlans?.length > 0 && (isAutoRenewal || (!isAutoRenewal && isExpired)) && (
                    <>
                      <div className="col-12">
                        <BorderSection title={isExpired ? 'LBL_REACTIVATE_YOUR_SUBSCRIPTION' : 'MANAGE_TIER'} />
                      </div>
                      <div className="col-12">
                        <div className="row">
                          <div className="col-md-4">
                            <DropDown
                              formik={formik}
                              label={isExpired ? 'REACTIVE_TO' : 'UPGRADE_TO'}
                              accessor="updateTierPlanPriceId"
                              mode="add"
                              keys={{ valueKey: 'tierPlanPriceId', titleKey: i18next.language === 'en' ? 'titleEn' : 'titleAr' }}
                              options={updatePricePlans}
                              onChange={changePricePlanHandler}
                            />
                          </div>
                          {+formik.values.updateTierId > 0 && +formik.values.updateTierPlanPriceId > 0 && (
                            <>
                              <div className="col-md-8 d-flex justify-content-center justify-content-md-end">
                                <ValueCard
                                  title="LBL_PLAN_PRICE"
                                  content={`${new Intl.NumberFormat('en-IN').format(Number(selectedPricePlan.baseFare))} ${t('LBL_SAR')}`}
                                />
                              </div>
                            </>
                          )}
                        </div>
                        <div className="row">
                          {+formik.values.updateTierId > 0 && +formik.values.updateTierPlanPriceId > 0 && (
                            <Accordion defaultActiveKey="0" className="mb-3" activeKey={activeKey}>
                              {selectedPackage?.newFeatures?.length > 0 &&
                                selectedPackage?.newFeatures.map((item, index) => {
                                  return (
                                    <Accordion.Item eventKey={index} key={item?.featureCd}>
                                      <Accordion.Header
                                        onClick={event => openHandler(event, item, index)}
                                        bsPrefix={item.subFeatures.length === 0 ? 'accordin-header nodata' : 'accordin-header'}
                                      >
                                        {i18next?.language === 'en' ? item?.featureEnNm : item?.featureArNm}
                                      </Accordion.Header>
                                      <Accordion.Body>
                                        {item?.subFeatures?.length > 0 &&
                                          item?.subFeatures.map(item1 => {
                                            return (
                                              <div className="tier-subfeature" key={item1?.featureCd}>
                                                <p>{i18next.language === 'en' ? item1?.featureEnNm : item1?.featureArNm}</p>
                                              </div>
                                            );
                                          })}
                                      </Accordion.Body>
                                    </Accordion.Item>
                                  );
                                })}
                            </Accordion>
                          )}
                        </div>
                        {+formik.values.updateTierId > 0 && +formik.values.updateTierPlanPriceId > 0 && (
                          <div className="row">
                            <div className="col-md-4">
                              <TextInput formik={formik} label="LBL_REFERRAL_CODE" accessor="referralCode" mode="add" />
                            </div>
                            <div className="col-md-4" />
                            <div className="col-md-4 d-flex align-items-center">
                              <div className="form-button">
                                <button
                                  className="btn btn-action w-100"
                                  onClick={
                                    isExpired
                                      ? reactiveSubscriptionConfirm
                                      : isOpenPendingRequest
                                        ? handleOpenPendingRequest
                                        : changeTierClickHandler
                                  }
                                  disabled={disableButton}
                                >
                                  {isExpired ? t('LBL_REACTIVATE_SUBSCRIPTION') : t('LBL_CHANGE_TIER')}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  {!isExpired && (
                    <>
                      <BorderSection title={isAutoRenewal ? t('LBL_CANCEL_SUBSCRIPTION') : t('LBL_CANCELED_SUBSCRIPTION')} />
                      <div className="row cancel-subscription">
                        <div className={isAutoRenewal ? 'col-md-9 cancel-subscription-left' : 'cancel-subscription-left-canceled'}>
                          <h5>
                            {isAutoRenewal ? t('LBL_TO_CANCEL_SUBSCRIPTION') : `${t('LBL_SUBSCRIPTION_ENDS_AT')} `}
                            {!isAutoRenewal && (
                              <>
                                <span className="expiration-date">{expirationDate}</span>
                                {t('LBL_YOU_CAN_REACTIVATE_AFTER')}
                              </>
                            )}
                          </h5>

                          {isAutoRenewal && <p> {t('LBL_CANCEL_SUBSCRIPTION_DISCLAMER')}</p>}
                        </div>

                        {isAutoRenewal && (
                          <div className="col-md-3 cancel-subscription-right">
                            <CancelButton
                              text={t('LBL_CANCEL_SUBSCRIPTION')}
                              onClick={cancelSubscriptionConfirmation}
                              disabled={disableButton}
                            />
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
