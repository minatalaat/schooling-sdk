import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import Spinner from '../../../components/Spinner/Spinner';
import ConfirmationPopup from '../../../components/ConfirmationPopup';
import PartnersForm from './PartnersForm';
import ActionsProgessBar from '../../../parts/ActionsProgessBar';
import MoreAction from '../../../parts/MoreAction';
import BreadCrumb from '../../../components/ui/BreadCrumb';
import BackButton from '../../../components/ui/buttons/BackButton';
import Calendar from '../../../components/ui/Calendar';
import PrimaryButton from '../../../components/ui/buttons/PrimaryButton';

import { useAxiosFunction } from '../../../hooks/useAxios';
import { getFetchUrl, getSearchUrl, getActionUrl } from '../../../services/getUrl';
import { MODELS } from '../../../constants/models';
import { useFeatures } from '../../../hooks/useFeatures';
import { alertsActions } from '../../../store/alerts';
import { modelsEnum } from '../../../constants/modelsEnum/modelsEnum';
import { checkFlashOrError, formatFloatNumber } from '../../../utils/helpers';
import { PartnerAccountsActions } from '../../../store/partnerAccounts';
import { tourStepsActions } from '../../../store/tourSteps';
import { useTourServices } from '../../../services/useTourServices';

const PartnersManagement = ({ addNew, enableEdit, partnerConfig }) => {
  const { api } = useAxiosFunction();
  const { canView, canEdit, canDelete, getFeaturePath } = useFeatures(partnerConfig.feature, partnerConfig.subFeature);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { id } = useParams();
  const { addStepsOptions } = useTourServices();
  const isTour = useSelector(state => state.tourSteps.isTour);

  const [partner, setPartner] = useState({});
  const [isSave, setIsSave] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [partnerBalance, setPartnerBalance] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [showMoreActionToolbar, setShowMoreActionToolbar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fields = [
    'partnerCategory',
    'fiscalPosition.code',
    'simpleFullName',
    'partnerSeq',
    'emailAddress.address',
    'mainAddress.zip',
    'fixedPhone',
    'registrationCode',
    'mainAddress.city',
    'mainAddress',
    'companyStr',
    'isProspect',
    'isEmployee',
    'isSupplier',
    'isCustomer',
    'partnerTypeSelect',
    'name',
    'phone',
    'fax',
    'mobilePhone',
    'webSite',
    'currency',
    'inPaymentMode',
    'outPaymentMode',
    'paymentCondition',
    'accountingSituationList',
    'partnerAddressList',
    'companySet',
    'taxNbr',
    'registrationCode',
  ];

  const viewHandler = () => {
    navigate(getFeaturePath(partnerConfig.subFeature, 'view', { id }));
    setShowMoreActionToolbar(false);
  };

  const editHandler = () => {
    navigate(getFeaturePath(partnerConfig.subFeature, 'edit', { id }));
    setShowMoreActionToolbar(false);
  };

  const deleteHandler = () => {
    setShowDelete(true);
  };

  const alertHandler = (title, message) => {
    if (message) dispatch(alertsActions.initiateAlert({ title, message }));

    if (title !== 'Success' || !message) {
      setIsSave(false);
      setIsDelete(false);
      setIsLoading(false);
      setActionInProgress(false);
    }
  };

  const finishedActionHandler = (status, message) => {
    setActionInProgress(false);

    if (status === 'Success') {
      alertHandler('Success', message || partnerConfig.messages.saveSuccessMessage);
      setTimeout(() => {
        setIsSave(false);
        setIsDelete(false);
        navigate(getFeaturePath(partnerConfig.subFeature));
      }, 3000);
    } else {
      setIsSave(false);
      setIsDelete(false);
      alertHandler(status || 'Error', message || 'SOMETHING_WENT_WRONG');
    }
  };

  const disableActionButtons = useMemo(() => {
    return isSave || isDelete;
  }, [isSave, isDelete]);

  const fetchPartner = () => {
    const payload = {
      fields: fields,
      related: {
        mainAddress: ['addressL2', 'addressL3', 'addressL4', 'addressL5', 'city', 'addressL6', 'addressL7Country'],
        partnerAddressList: ['$canSelect', 'address', 'isInvoicingAddr', 'isDeliveryAddr', 'isDefaultAddr', 'address.addressL4'],
        emailAddress: ['address'],
        companySet: ['name'],
      },
    };
    return api('POST', getFetchUrl(MODELS.PARTNER, id), payload);
  };

  const fetchElementData = async () => {
    if (addNew) {
      setIsLoading(false);
      dispatch(
        PartnerAccountsActions.setLines({
          partnerAccounts: [],
        })
      );

      return null;
    }

    if (isLoading === false) setIsLoading(true);

    const partnerResponse = await fetchPartner();

    if (
      !partnerResponse ||
      !partnerResponse.data ||
      partnerResponse.data.status !== 0 ||
      !partnerResponse.data.data ||
      !partnerResponse.data.data[0]
    ) {
      setIsLoading(false);
      navigate('/error');
      return null;
    }

    let partnerData = partnerResponse.data.data[0];
    let addressID = partnerData?.partnerAddressList[0]?.address?.id ?? null;

    if (!addressID) {
      setIsLoading(false);
      return setPartner({ ...partnerData });
    }

    const addressResponse = await fetchAddress(addressID);

    if (
      !addressResponse ||
      !addressResponse.data ||
      addressResponse.data.status !== 0 ||
      !addressResponse.data.data ||
      !addressResponse.data.data[0]
    ) {
      setIsLoading(false);
      return setPartner({ ...partnerData });
    }

    let addressList = addressResponse.data.data;
    setPartner({
      ...partnerData,
      country: addressList[0]?.addressL7Country
        ? { id: addressList[0]?.addressL7Country?.id, name: addressList[0]?.addressL7Country['$t:name'] }
        : null,
      city: addressList[0]?.city ? { id: addressList[0]?.city?.id, name: addressList[0]?.city['$t:name'] } : null,
      district: addressList[0]?.addressL3 || '',
      buildingNumber: addressList[0]?.addressL4 || '',
      streetNumber: addressList[0]?.streetNumber || '',
      postalCode: addressList[0].zip || '',
      addressID: addressID,
      addressVersion: addressList[0]?.version || null,
    });

    const partnerAccountingList = partnerData.accountingSituationList || [];

    if (partnerAccountingList?.length === 0) {
      dispatch(
        PartnerAccountsActions.setLines({
          partnerAccounts: [],
        })
      );
      return setIsLoading(false);
    }

    if (!addNew) {
      let accountingList = await getAccountingList(partnerAccountingList);
      let partnerAccount = partnerConfig.subFeatureChecks.isCustomer
        ? accountingList[0].customerAccount
        : accountingList[0].supplierAccount;
      if (!enableEdit) await fetchBalance(partnerAccount);
    }

    setIsLoading(false);
  };

  const fetchAddress = addressID => {
    return api('POST', getFetchUrl(MODELS.ADDRESS, addressID), {
      fields: [
        'zip',
        'certifiedOk',
        'streetNumber',
        'city',
        'street',
        'pickList',
        'addressL2',
        'addressL3',
        'isValidLatLong',
        'addressL4',
        'addressL5',
        'addressL6',
        'addressL7Country',
      ],
      related: {},
    });
  };

  const getAccountingList = async partnerAccountingList => {
    let ids = [];
    partnerAccountingList.forEach(line => {
      ids.push(line.id);
    });
    const payload = {
      fields: [
        'balanceCustAccount',
        'supplierAccount',
        'customerAccount',
        'acceptedCredit',
        'employeeAccount',
        'usedCredit',
        'company',
        'balanceDueCustAccount',
        'balanceDueDebtRecoveryCustAccount',
        'defaultExpenseAccount',
        'defaultIncomeAccount',
      ],
      data: {
        _domain: `self.id in (${ids.join(',')})`,
        _archived: true,
      },
    };

    let accountingResponse = await api('POST', getSearchUrl(MODELS.ACCOUNTINGSITUATIONS), payload);

    let allRecords = accountingResponse.data.data;
    if (!allRecords) return [];
    let idsList = [];
    let finalRecords = [];

    if (allRecords) {
      partnerAccountingList.forEach(situation => {
        let newSituation = { ...situation };
        idsList.push(newSituation.id);
      });
      let newAllRecords = [...allRecords];
      newAllRecords.forEach(record => {
        if (idsList.includes(record.id)) {
          finalRecords.push(record);
        }
      });
    }

    dispatch(
      PartnerAccountsActions.setLines({
        partnerAccounts: finalRecords,
      })
    );
    return allRecords;
  };

  const fetchBalance = async partnerAccount => {
    setIsBalanceLoading(true);
    const response = await api('POST', getActionUrl(), {
      action: 'action-partner-account-opening-balance',
      data: {
        accountId: partnerAccount?.id,
        partnerId: parseInt(id),
      },
    });
    setIsBalanceLoading(false);
    if (response.data.status !== 0 || checkFlashOrError(response?.data?.data)) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    setPartnerBalance(formatFloatNumber(response?.data?.data?.accountOpeningBalance));
  };

  useEffect(() => {
    if (partnerConfig.tourConfig && isTour === 'true' && !isLoading) {
      addStepsOptions(partnerConfig.tourConfig?.addSteps);
      dispatch(tourStepsActions.setIsTour('true'));
      dispatch(tourStepsActions.setSpotlightClick(true));
      dispatch(tourStepsActions.setSteps({ steps: partnerConfig.tourConfig?.addSteps }));
    }
  }, [isTour, isLoading]);

  useEffect(() => {
    fetchElementData();
  }, [addNew, enableEdit]);

  return (
    <>
      {showMoreActionToolbar && (
        <MoreAction
          showMoreAction={showMoreActionToolbar}
          setShowMoreAction={setShowMoreActionToolbar}
          editHandler={!enableEdit ? (canEdit ? editHandler : null) : null}
          viewHandler={enableEdit ? (canView ? viewHandler : null) : null}
          deleteHandler={canDelete ? deleteHandler : null}
          canSelectAll={false}
        />
      )}
      {actionInProgress && <div className="lodingpage"></div>}
      {isLoading && <Spinner />}
      <div className="page-body">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <Calendar />
              <BreadCrumb
                feature={partnerConfig.feature}
                subFeature={partnerConfig.subFeature}
                modeText={
                  !addNew && enableEdit
                    ? `${t('LBL_EDIT')} ${t(modelsEnum[partnerConfig.modelsEnumKey].titleSingular)}`
                    : !addNew && !enableEdit
                      ? `${t('LBL_VIEW')} ${t(modelsEnum[partnerConfig.modelsEnumKey].titleSingular)}`
                      : `${t('LBL_ADD_NEW')} ${t(modelsEnum[partnerConfig.modelsEnumKey].titleSingular)}`
                }
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{addNew ? t(partnerConfig.newLabel) : partner.name ? partner.name : ''}</h4>
              </div>

              <div className="reverse-page float-end">
                <BackButton disabled={isSave || isDelete} text={addNew ? 'LBL_CANCEL' : 'LBL_BACK'} />
                {(addNew || enableEdit) && (
                  <PrimaryButton
                    className={partnerConfig.tourConfig?.stepAddSubmit || undefined}
                    disabled={disableActionButtons}
                    onClick={() => setIsSave(true)}
                  />
                )}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              {!isLoading && !addNew && (
                <ActionsProgessBar
                  feature={partnerConfig.feature}
                  subfeature={partnerConfig.subFeature}
                  viewHandler={canView && enableEdit ? viewHandler : null}
                  editHandler={canEdit && !enableEdit ? editHandler : null}
                  deleteHandler={canDelete ? deleteHandler : null}
                  setShowMoreAction={setShowMoreActionToolbar}
                />
              )}
              {showDelete && (
                <ConfirmationPopup
                  onClickHandler={() => setIsDelete(true)}
                  setConfirmationPopup={setShowDelete}
                  item={partnerConfig.labels.partner}
                />
              )}
              {!isLoading && (
                <div className="row">
                  {(Object.keys(partner).length > 0 || addNew) && (
                    <>
                      {!addNew && (
                        <PartnersForm
                          enableEdit={enableEdit}
                          data={partner}
                          isSave={isSave}
                          isDelete={isDelete}
                          finishedActionHandler={finishedActionHandler}
                          alertHandler={alertHandler}
                          setActionInProgress={setActionInProgress}
                          partnerConfig={partnerConfig}
                          fetchElementData={fetchElementData}
                          isBalanceLoading={isBalanceLoading}
                          partnerBalance={partnerBalance}
                          setPartnerBalance={setPartnerBalance}
                        />
                      )}
                      {addNew && (
                        <PartnersForm
                          data={partner}
                          addNew={addNew}
                          isSave={isSave}
                          isDelete={isDelete}
                          finishedActionHandler={finishedActionHandler}
                          alertHandler={alertHandler}
                          setActionInProgress={setActionInProgress}
                          partnerConfig={partnerConfig}
                        />
                      )}
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
};

export default PartnersManagement;
