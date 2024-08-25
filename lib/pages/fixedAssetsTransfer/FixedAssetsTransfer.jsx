import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';

import BreadCrumb from '../../components/ui/BreadCrumb';
import Spinner from '../../components/Spinner/Spinner';
import SearchModalAxelor from '../../components/ui/inputs/SearchModal/SearchModalAxelor';
import Calendar from '../../components/ui/Calendar';
import ToggleSwitch from '../../components/ui/inputs/ToggleSwitch';
import Tabs from '../../components/ui/inputs/Tabs';
import InnerTable from '../../components/InnerTable';
import FormNotes from '../../components/ui/FormNotes';

import { useAxiosFunction } from '../../hooks/useAxios';
import { getSearchUrl, getActionUrl, getFetchUrl } from '../../services/getUrl';
import { modelsEnum } from '../../constants/modelsEnum/modelsEnum';
import { setFieldValue, resetForm } from '../../utils/formHelpers';
import { MODELS } from '../../constants/models';
import { useTabs } from '../../hooks/useTabs';
import { alertsActions } from '../../store/alerts';
import { useFormikSubmit } from '../../hooks/useFormikSubmit';
import { useFeatures } from '../../hooks/useFeatures';

const FixedAssetsTransfer = () => {
  let feature = 'FIXED_ASSETS_MANAGEMENT';
  let subFeature = 'FIXED_ASSET_TRANSFER';

  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  const navigate = useNavigate();
  const tabsProps = useTabs();
  const dispatch = useDispatch();
  const { isFeatureAvailable } = useFeatures();

  const [actionInProgress, setActionInProgress] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [costCenterList, setCostCenterList] = useState(null);
  const [locationsList, setLocationsList] = useState(null);

  const initialValues = {
    fixedAsset: null,
    currentLocation: '',
    newLocation: null,
    currentCostCenter: '',
    newCostCenter: null,
    isStockLocationTransfer: false,
    isCostCenterTransfer: false,
  };

  const validationSchema = Yup.object().shape(
    {
      newLocation: Yup.object()
        .nullable()
        .when('newCostCenter', {
          is: newCostCenter => !newCostCenter,
          then: Yup.object().required(t('ERROR_LBL_SELECT_AT_LEAST_ONE_CHANGE')).nullable(),
        }),
      newCostCenter: Yup.object()
        .nullable()
        .when('newLocation', {
          is: newLocation => !newLocation,
          then: Yup.object().required(t('ERROR_LBL_SELECT_AT_LEAST_ONE_CHANGE')).nullable(),
        }),
    },
    [
      ['newLocation', 'newCostCenter'],
      ['newCostCenter', 'newLocation'],
    ]
  );

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: true,
  });

  const stockManagementAvailable = useMemo(() => {
    return isFeatureAvailable({ featureCode: '12' });
  }, []);

  const costCenterAvailable = useMemo(() => {
    return isFeatureAvailable({ featureCode: '13' });
  }, []);

  const alertHandler = (title, message) => {
    if (message) dispatch(alertsActions.initiateAlert({ title, message }));
    if (actionInProgress) setActionInProgress(false);
    if (isLoading) setIsLoading(false);
  };

  const { validateFormForSubmit } = useFormikSubmit(formik, alertHandler);

  const fixedAsset = useMemo(() => formik.values.fixedAsset || null, [formik.values.fixedAsset?.version]);

  const onFixedAssetsSuccess = response => {
    if (response?.data?.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));

    let data = response.data.data || [];
    let tempData = [];

    if (data) {
      data.forEach(item => {
        let listItem = { ...item };
        listItem.category = item['fixedAssetCategory.name'];
        tempData.push(listItem);
      });
    }

    return { displayedData: [...tempData], total: response.data.total || 0 };
  };

  const onStockLocationsSuccess = response => {
    if (response?.data?.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));

    let data = response.data.data || [];

    return { displayedData: [...data], total: response.data.total || 0 };
  };

  const onCostCentersSuccess = response => {
    if (response?.data?.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));

    let data = response.data.data;

    return { displayedData: [...(data || [])], total: response?.data?.total || 0 };
  };

  const fetchFixedAsset = async id => {
    const fixedAssetResponse = await api('POST', getFetchUrl(modelsEnum.FIXED_ASSETS.name, id), {
      fields: ['stockLocation', 'analyticDistributionTemplate'],
      related: {},
    });
    if (
      !fixedAssetResponse.data ||
      fixedAssetResponse.data.status !== 0 ||
      !fixedAssetResponse.data.data ||
      !fixedAssetResponse.data.data[0]
    )
      return navigate('/error');

    let data = fixedAssetResponse.data.data[0];

    setFieldValue(formik, 'isStockLocationTransfer', false);
    setFieldValue(formik, 'isCostCenterTransfer', false);
    setFieldValue(formik, 'fixedAsset', data || null);
    setFieldValue(formik, 'currentLocation', data.stockLocation || null);
    setFieldValue(formik, 'currentCostCenter', data.analyticDistributionTemplate || null);
  };

  const fixedAssetSelectCallback = async (fixedAssetData, loading = true) => {
    if (!fixedAssetData) return resetForm(formik);
    if (loading) setIsLoading(true);

    await fetchFixedAsset(fixedAssetData.id);
    await fetchTransferData(fixedAssetData.id);
    setIsLoading(false);
    setActionInProgress(false);
  };

  const removeFixedAssetHandler = () => resetForm(formik);

  const saveTransfer = async () => {
    const isValid = await validateFormForSubmit();
    if (!isValid) return null;

    if (!fixedAsset?.id) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    setActionInProgress(true);
    const payload = {
      model: MODELS.FIXED_ASSET,
      action: 'action-fixed-asset-transfer-and-update',
      data: {
        criteria: [],
        context: {
          _model: MODELS.FIXED_ASSET,
          fixedAsset: {
            id: fixedAsset.id,
            version: fixedAsset.version,
            stockLocation: formik.values.isStockLocationTransfer ? formik.values.newLocation || null : formik.values.currentLocation,
            analyticDistributionTemplate: formik.values.isCostCenterTransfer
              ? formik.values.newCostCenter || null
              : formik.values.currentCostCenter,
          },
        },
      },
    };
    const res = await api('POST', getActionUrl(), payload);
    if (res.data?.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));

    await fixedAssetSelectCallback(fixedAsset, false);

    setFieldValue(formik, 'newLocation', null);
    setFieldValue(formik, 'newCostCenter', null);

    setTimeout(() => formik.setFieldTouched('newLocation', false));
    setTimeout(() => formik.setFieldTouched('newCostCenter', false));

    setActionInProgress(false);
  };

  const fetchTransferData = async id => {
    const payload = {
      fields: ['transferDate', 'type', 'analyticTemplate', 'fixedAsset', 'stockLocation'],
      sortBy: ['transferDate'],
      data: {
        _domain: `self.fixedAsset.id = ${id}`,
        _domainContext: {
          _id: null,
          _model: MODELS.FIXED_ASSET_TRANSFER,
        },
        operator: 'and',
        criteria: [],
      },
      operator: 'and',
      criteria: [],
      limit: -1,
      offset: 0,
      translate: true,
    };
    const res = await api('POST', getSearchUrl(MODELS.FIXED_ASSET_TRANSFER), payload);
    if (res.data?.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    let initalRecord = res.data.data?.find(record => record.type === 1) || undefined;
    let costCenterData = res.data.data?.filter(record => record.type === 3) || [];
    let locationsData = res.data.data?.filter(record => record.type === 2) || [];

    setCostCenterList([initalRecord, ...costCenterData]);
    setLocationsList([initalRecord, ...locationsData]);
  };

  const locationsLineHeaders = [t('LBL_DATE'), t('LBL_STOCK_LOCATION')];
  const costCentersLineHeaders = [t('LBL_DATE'), t('LBL_COST_CENTER')];

  const locationsLineData = useMemo(() => {
    let tempData = [];
    locationsList &&
      locationsList.length > 0 &&
      locationsList.forEach(line => {
        tempData.push({
          isDeleteable: false,
          isEditable: false,
          isViewable: false,
          tableData: [
            { value: line.transferDate, type: 'text' },
            { value: line.stockLocation?.name || 'LBL_NO_ASSIGNED_LOCATION', type: 'text', translate: !line.stockLocation?.name },
          ],
          data: line,
          key: line.id ? line.id : line.lineId,
          headData: line.transferDate,
        });
      });
    return tempData;
  }, [fixedAsset, locationsList]);

  const costCentersLineData = useMemo(() => {
    let tempData = [];
    costCenterList &&
      costCenterList.length > 0 &&
      costCenterList.forEach(line => {
        tempData.push({
          isDeleteable: false,
          isEditable: false,
          isViewable: false,
          tableData: [
            { value: line.transferDate, type: 'text' },
            { value: line.analyticTemplate?.name || 'LBL_NO_COST_CENTER', type: 'text', translate: !line.analyticTemplate?.name },
          ],
          data: line,
          key: line.id ? line.id : line.lineId,
          headData: line.transferDate,
        });
      });
    return tempData;
  }, [fixedAsset, costCenterList]);

  useEffect(() => {
    tabsProps.setShowTabsContent(true);
  }, []);

  return (
    <>
      {actionInProgress && <div className="lodingpage"></div>}
      {isLoading && <Spinner />}
      <div className="page-body">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <Calendar />
              <BreadCrumb feature={feature} subFeature={subFeature} />
            </div>
          </div>
          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{`${t('LBL_FIXED_ASSET_TRANSFER')}`}</h4>
              </div>
              {fixedAsset && (
                <div className="reverse-page float-end">
                  <button className="btn btn-save" onClick={saveTransfer}>
                    {t('LBL_TRANSFER')}
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <div className="row">
                <div className="col-md-12">
                  <div className="card head-page">
                    <div className="row">
                      <div className="col-md-6">
                        <SearchModalAxelor
                          formik={formik}
                          modelKey="FIXED_ASSETS"
                          mode="add"
                          defaultValueConfig={null}
                          onSuccess={onFixedAssetsSuccess}
                          payloadDomain="self.statusSelect > 1"
                          selectCallback={fixedAssetSelectCallback}
                          removeCallback={removeFixedAssetHandler}
                          removeVersion={false}
                        />
                      </div>
                      {fixedAsset && (
                        <>
                          {stockManagementAvailable && (
                            <div className="col-md-3">
                              <ToggleSwitch
                                formik={formik}
                                label="LBL_TRANSFER_STOCK_LOCATION"
                                accessor="isStockLocationTransfer"
                                mode="edit"
                              />
                            </div>
                          )}
                          {costCenterAvailable && (
                            <div className="col-md-3">
                              <ToggleSwitch formik={formik} label="LBL_TRANSFER_COST_CENTER" accessor="isCostCenterTransfer" mode="edit" />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    {fixedAsset && (
                      <div className="row">
                        {formik.values.isStockLocationTransfer && (
                          <div className="row">
                            <div className="col-md-6">
                              <SearchModalAxelor formik={formik} modelKey="TRANSFER_LOCATION_CURRENT" mode="view" />
                            </div>
                            <div className="col-md-6">
                              <SearchModalAxelor
                                formik={formik}
                                modelKey="TRANSFER_LOCATION_TO"
                                mode="add"
                                defaultValueConfig={null}
                                onSuccess={onStockLocationsSuccess}
                                selectCallback={() => formik.validateForm()}
                              />
                            </div>
                          </div>
                        )}
                        {formik.values.isCostCenterTransfer && (
                          <div className="row">
                            <div className="col-md-6">
                              <SearchModalAxelor formik={formik} modelKey="TRANSFER_COST_CENTER_CURRENT" mode="view" />
                            </div>
                            <div className="col-md-6">
                              <SearchModalAxelor
                                formik={formik}
                                modelKey="TRANSFER_COST_CENTER_TO"
                                mode="add"
                                defaultValueConfig={null}
                                onSuccess={onCostCentersSuccess}
                                selectCallback={() => formik.validateForm()}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <FormNotes
                      notes={[
                        {
                          title: 'LBL_REQUIRED_NOTIFY',
                          type: 3,
                        },
                      ]}
                    />
                  </div>
                  {fixedAsset && (
                    <Tabs
                      {...tabsProps}
                      tabsList={[
                        { accessor: 'locations', label: 'LBL_STOCK_LOCATIONS' },
                        { accessor: 'costCenters', label: 'LBL_COST_CENTERS' },
                      ]}
                    >
                      <InnerTable
                        accessor="locations"
                        title={t('LBL_TRANSFERS')}
                        pageMode="view"
                        lineHeaders={locationsLineHeaders}
                        lineData={locationsLineData}
                        withBorderSection={false}
                      />
                      <InnerTable
                        accessor="costCenters"
                        title={t('LBL_TRANSFERS')}
                        pageMode="view"
                        lineHeaders={costCentersLineHeaders}
                        lineData={costCentersLineData}
                        withBorderSection={false}
                      />
                    </Tabs>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FixedAssetsTransfer;
