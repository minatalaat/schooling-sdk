import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import Toolbar from '../../parts/Toolbar';
import NoData from '../../components/NoData';
import NoStockCountImg from '../../assets/images/icons/Products.svg';
import MoreAction from '../../parts/MoreAction';
import BreadCrumb from '../../components/ui/BreadCrumb';
import Table from '../../components/ListingTable/Table';
import TableRow from '../../components/ListingTable/TableRow';
import CardsList from '../../components/CardsList/CardsList';
import Card from '../../components/CardsList/Card';
import Spinner from '../../components/Spinner/Spinner';
import Calendar from '../../components/ui/Calendar';

import { getSearchUrl } from '../../services/getUrl';
import { useFeatures } from '../../hooks/useFeatures';
import { useAxiosFunction } from '../../hooks/useAxios';
import { MODELS } from '../../constants/models';
import { FIXED_ASSET_SEARCH_FIELDS } from './FixedAssetsPayloadsFields';
import { FIXED_ASSET_STATUS_ENUM } from '../../constants/enums/FixedAssetEnum';
import { alertsActions } from '../../store/alerts';

const FixedAssets = () => {
  const feature = 'FIXED_ASSETS_MANAGEMENT';
  const subFeature = 'FIXED_ASSETS';
  const { t } = useTranslation();
  const { getFeaturePath } = useFeatures();
  const { api } = useAxiosFunction();
  const { canDelete } = useFeatures(feature, subFeature);
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(true);
  const [fixedAssets, setFixedAssets] = useState([]);
  const [show, setShow] = useState('table');
  const [checked, setChecked] = useState([]);

  const [total, setTotal] = useState(0);
  let searchValue = searchParams.get('search') || '';
  let currentPage = parseInt(searchParams.get('currentPage') || 1);
  let pageSize = parseInt(searchParams.get('pageSize') || 10);
  let offset = (currentPage - 1) * pageSize;

  const [windowSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);

  const alertHandler = (title, message) => dispatch(alertsActions.initiateAlert({ title, message }));

  const searchPayload = {
    fields: FIXED_ASSET_SEARCH_FIELDS,
    sortBy: ['-id'],
    data: {
      _domain: null,
      _domainContext: { _id: null, _model: MODELS.FIXED_ASSET },
      operator: 'and',
      criteria: [],
    },
    limit: pageSize,
    offset: offset,
    translate: true,
  };

  const searchPayloadwithValue = {
    fields: FIXED_ASSET_SEARCH_FIELDS,
    sortBy: ['-id'],
    data: {
      _domain: null,
      _domainContext: { _id: null, _model: MODELS.FIXED_ASSET },
      operator: 'or',
      criteria: [
        {
          fieldName: 'fixedAssetSeq',
          operator: 'like',
          value: searchValue,
        },
        {
          fieldName: 'name',
          operator: 'like',
          value: searchValue,
        },
        {
          fieldName: 'partner.fullName',
          operator: 'like',
          value: searchValue,
        },
        {
          fieldName: 'fixedAssetCategory.name',
          operator: 'like',
          value: searchValue,
        },
        {
          fieldName: 'acquisitionDate',
          operator: 'between',
          value: searchValue,
          value2: searchValue,
        },
        {
          fieldName: 'firstDepreciationDate',
          operator: 'between',
          value: searchValue,
          value2: searchValue,
        },
      ],
    },
    limit: pageSize,
    offset: offset,
    translate: true,
  };

  const fields = [
    { accessor: 'fixedAssetSeq', Header: t('LBL_FIXED_ASSET_SEQ'), type: 'text' },
    { accessor: 'name', Header: t('LBL_FIXED_ASSET'), type: 'text' },
    { accessor: 'partner', Header: t('LBL_SUPPLIER'), type: 'text' },
    { accessor: 'fixedAssetCategory', Header: t('LBL_CATEGORY'), type: 'text' },
    { accessor: 'acquisitionDate', Header: t('LBL_ACQUISITION_DATE'), type: 'text' },
    { accessor: 'firstDepreciationDate', Header: t('LBL_FIRST_DEPRECIATION_DATE'), type: 'text' },
    { accessor: 'statusSelect', Header: t('LBL_STATUS'), type: 'text', translate: true },
  ];

  const subTitles = [
    { label: 'LBL_FIXED_ASSET_SEQ', key: 'fixedAssetSeq' },
    { label: 'LBL_SUPPLIER', key: 'partner' },
    { label: 'LBL_CATEGORY', key: 'fixedAssetCategory' },
    { label: 'LBL_FIRST_DEPRECIATION_DATE', key: 'firstDepreciationDate' },
  ];

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
    window.scrollTo(0, 0);
    setChecked([]);
    getFixedAsset();
  }, [searchParams]);

  const getFixedAsset = () => {
    if (searchValue === '') {
      setFixedAssets([]);
      setIsLoading(true);
    }

    let payload = searchValue && searchValue !== '' ? searchPayloadwithValue : searchPayload;
    api('POST', getSearchUrl(MODELS.FIXED_ASSET), payload, onFixedAssetSearchSuccess);
  };

  const onFixedAssetSearchSuccess = response => {
    let status = response.data.status;
    let data = response.data.data;
    let total = response.data.total;
    setIsLoading(false);

    if (status !== 0 || total === undefined || total === null) {
      setFixedAssets([]);
      return alertHandler('Error', t('LBL_ERROR_LOADING_FIXED_ASSETS'));
    }

    setTotal(total);

    if (data === undefined || data === null) {
      setFixedAssets([]);
    }

    if (data) {
      let tempData = [];
      data.forEach(item => {
        let listItem = { ...item };
        listItem.name = listItem?.name?.replace(' (1.00)', '') || '';
        listItem.fixedAssetSeq = listItem.fixedAssetSeq ? listItem.fixedAssetSeq : '';
        listItem.partner = listItem.partner?.fullName ?? '';
        listItem.fixedAssetCategory = listItem.fixedAssetCategory?.name ?? '';
        listItem.acquisitionDate = listItem.acquisitionDate ? listItem.acquisitionDate : null;
        listItem.firstDepreciationDate = listItem.firstDepreciationDate ? listItem.firstDepreciationDate : null;
        listItem.statusSelect = listItem.statusSelect ? FIXED_ASSET_STATUS_ENUM[listItem.statusSelect] : '';
        tempData.push(listItem);
      });
      setFixedAssets(tempData);
    }
  };

  return (
    <>
      {actionInProgress && <div className="lodingpage"></div>}
      {isLoading && <Spinner />}
      {((!isLoading && searchValue !== '') || (fixedAssets && fixedAssets.length > 0)) && (
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
                  <h4>{t('LBL_FIXED_ASSET')}</h4>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <Toolbar
                  show={show}
                  setShow={setShow}
                  refreshData={getFixedAsset}
                  setShowMoreAction={setShowMoreAction}
                  checked={checked}
                  setChecked={setChecked}
                  data={fixedAssets}
                  setActionInProgress={setActionInProgress}
                  bulkActionConfig={{
                    canDelete: canDelete,
                    deleteSuccessMessage: 'LBL_FIXED_ASSET_DELETED',
                    modelsEnumKey: 'FIXED_ASSETS',
                    isExport: true,
                  }}
                  searchPayload={searchValue && searchValue !== '' ? searchPayloadwithValue : searchPayload}
                />
                {!isLoading && show === 'table' && windowSize[0] > 1200 && (
                  <Table
                    fields={fields}
                    data={fixedAssets}
                    total={total}
                    checked={checked}
                    setChecked={setChecked}
                    feature={feature}
                    subFeature={subFeature}
                  >
                    {fixedAssets.length > 0 &&
                      fixedAssets.map(record => {
                        return (
                          <TableRow
                            record={record}
                            fields={fields}
                            deleteModel={MODELS.FIXED_ASSET}
                            refreshData={getFixedAsset}
                            checked={checked}
                            setChecked={setChecked}
                            setActionInProgress={setActionInProgress}
                            feature={feature}
                            subFeature={subFeature}
                            isEditable={record.statusSelect !== 'LBL_TRANSFERED'}
                            isDeletable={record.statusSelect === 'LBL_DRAFT'}
                          />
                        );
                      })}
                  </Table>
                )}
                {!isLoading && (show === 'card' || windowSize[0] <= 1200) && (
                  <CardsList total={total}>
                    {fixedAssets &&
                      fixedAssets.map(record => {
                        return (
                          <Card
                            feature={feature}
                            subFeature={subFeature}
                            record={record}
                            title="name"
                            subTitles={subTitles}
                            deleteModel={MODELS.FIXED_ASSET}
                            refreshData={getFixedAsset}
                            setActionInProgress={setActionInProgress}
                            checked={checked}
                            setChecked={setChecked}
                            label1={{ value: record.statusSelect }}
                            isEditable={record.statusSelect !== 'LBL_TRANSFERED'}
                            isDeletable={record.statusSelect === 'LBL_DRAFT'}
                          />
                        );
                      })}
                  </CardsList>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {showMoreAction && (
        <MoreAction
          show={show}
          setShow={setShow}
          refreshData={getFixedAsset}
          checked={checked}
          setChecked={setChecked}
          data={fixedAssets}
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          setActionInProgress={setActionInProgress}
          alertHandler={alertHandler}
          bulkActionConfig={{
            canDelete: canDelete,
            deleteSuccessMessage: 'LBL_FIXED_ASSET_DELETED',
            modelsEnumKey: 'FIXED_ASSETS',
          }}
        />
      )}
      {!isLoading && fixedAssets && fixedAssets.length === 0 && searchValue === '' && (
        <NoData
          imgSrc={NoStockCountImg}
          noDataMessage={t('NO_FIXED_ASSETS_DATA_MESSAGE')}
          showAdditionalMessage={false}
          addButtontext={t('LBL_ADD_FIXED_ASSET')}
          addButtonPath={getFeaturePath(subFeature, 'add')}
        />
      )}
    </>
  );
};

export default FixedAssets;
