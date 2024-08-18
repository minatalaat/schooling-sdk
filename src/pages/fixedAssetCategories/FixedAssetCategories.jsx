import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import BreadCrumb from '../../components/ui/BreadCrumb';
import Table from '../../components/ListingTable/Table';
import TableRow from '../../components/ListingTable/TableRow';
import CardsList from '../../components/CardsList/CardsList';
import Card from '../../components/CardsList/Card';
import Spinner from '../../components/Spinner/Spinner';
import Toolbar from '../../parts/Toolbar';
import NoData from '../../components/NoData';
import NoFixedAssetCategoriesImg from '../../assets/images/icons/Products.svg';
import MoreAction from '../../parts/MoreAction';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';
import Calendar from '../../components/ui/Calendar';

import { useAxiosFunction } from '../../hooks/useAxios';
import { MODELS } from '../../constants/models';
import { getSearchUrl } from '../../services/getUrl';
import { useFeatures } from '../../hooks/useFeatures';
import { alertsActions } from '../../store/alerts';

const FixedAssetCategories = () => {
  const feature = 'FIXED_ASSETS_MANAGEMENT';
  const subFeature = 'FIXED_ASSET_CATEGORIES';
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getFeaturePath } = useFeatures();
  const { api } = useAxiosFunction();
  const { canAdd, canDelete } = useFeatures(feature, subFeature);
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(true);
  const [fixedAssetCategories, setFixedAssetCategories] = useState([]);
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
    fields: ['fixedAssetType', 'journal', 'computationMethodSelect', 'chargeAccount', 'name', 'company', 'depreciationAccount'],
    sortBy: ['company', 'fixedAssetType', 'name'],
    data: {
      _domain: null,
      _domainContext: {
        _id: null,
        _model: MODELS.FIXED_ASSET_CATEGORY,
      },
      operator: 'and',
      criteria: [],
    },
    limit: pageSize,
    offset: offset,
    translate: true,
  };

  const searchPayloadwithValue = {
    fields: ['fixedAssetType', 'journal', 'computationMethodSelect', 'chargeAccount', 'name', 'company', 'depreciationAccount'],
    sortBy: ['company', 'fixedAssetType', 'name'],
    data: {
      _domain: null,
      _domainContext: {
        _id: null,
        _model: MODELS.FIXED_ASSET_CATEGORY,
      },
      operator: 'or',
      criteria: [
        {
          fieldName: 'name',
          operator: 'like',
          value: searchValue,
        },
      ],
    },
    limit: pageSize,
    offset: offset,
    translate: true,
  };

  const fields = [
    { accessor: 'name', Header: t('LBL_NAME'), type: 'text' },
    { accessor: 'fixedAssetTypeName', Header: t('LBL_FIXED_ASSET_TYPE'), type: 'text' },
    { accessor: 'chargeAccountName', Header: t('LBL_CHARGE_ACCOUNT'), type: 'text' },
  ];

  const subTitles = [{ label: 'LBL_CHARGE_ACCOUNT', key: 'chargeAccountName' }];

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
    getFixedAssetCategories();
  }, [searchParams]);

  const getFixedAssetCategories = () => {
    if (searchValue === '') {
      setFixedAssetCategories([]);
      setIsLoading(true);
    }

    let payload = searchValue && searchValue !== '' ? searchPayloadwithValue : searchPayload;
    api('POST', getSearchUrl(MODELS.FIXED_ASSET_CATEGORY), payload, onFixedAssetCategoriesSearchSuccess);
  };

  const onFixedAssetCategoriesSearchSuccess = response => {
    let status = response.data.status;
    let data = response.data.data;
    let total = response.data.total;
    setIsLoading(false);

    if (status !== 0 || total === undefined || total === null) {
      setFixedAssetCategories([]);
      return alertHandler('Error', t('LBL_ERROR_LOADING_FIXED_ASSET_CATEGORIES'));
    }

    setTotal(total);

    if (data === undefined || data === null) {
      setFixedAssetCategories([]);
    }

    if (data) {
      let tempData = [];
      data.forEach(item => {
        let listItem = { ...item };
        listItem.fixedAssetTypeName = listItem?.fixedAssetType?.name ?? '';
        listItem.chargeAccountName = listItem?.chargeAccount?.label ?? '';
        tempData.push(listItem);
      });
      setFixedAssetCategories(tempData);
    }
  };

  return (
    <>
      {actionInProgress && <div className="lodingpage"></div>}
      {isLoading && <Spinner />}
      {((!isLoading && searchValue !== '') || (fixedAssetCategories && fixedAssetCategories.length > 0)) && (
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
                  <h4>{t('LBL_FIXED_ASSET_CATEGORIES')}</h4>
                </div>
                {canAdd && (
                  <div className="reverse-page float-end">
                    <PrimaryButton
                      theme="purpleWithIcon"
                      text="LBL_ADD_FIXED_ASSET_CATEGORY"
                      onClick={() => {
                        navigate(getFeaturePath(subFeature, 'add'));
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <Toolbar
                  show={show}
                  setShow={setShow}
                  refreshData={getFixedAssetCategories}
                  setShowMoreAction={setShowMoreAction}
                  checked={checked}
                  setChecked={setChecked}
                  data={fixedAssetCategories}
                  setActionInProgress={setActionInProgress}
                  bulkActionConfig={{
                    canDelete: canDelete,
                    deleteSuccessMessage: 'LBL_FIXED_ASSET_CATEGORY_DELETED',
                    modelsEnumKey: 'FIXED_ASSET_CATEGORIES',
                    isExport: true,
                  }}
                  searchPayload={searchValue && searchValue !== '' ? searchPayloadwithValue : searchPayload}
                />
                {!isLoading && show === 'table' && windowSize[0] > 1200 && (
                  <Table
                    fields={fields}
                    data={fixedAssetCategories}
                    total={total}
                    checked={checked}
                    setChecked={setChecked}
                    feature={feature}
                    subFeature={subFeature}
                  >
                    {fixedAssetCategories.length > 0 &&
                      fixedAssetCategories.map(record => {
                        return (
                          <TableRow
                            record={record}
                            fields={fields}
                            deleteModel={MODELS.FIXED_ASSET_CATEGORY}
                            refreshData={getFixedAssetCategories}
                            checked={checked}
                            setChecked={setChecked}
                            setActionInProgress={setActionInProgress}
                            feature={feature}
                            subFeature={subFeature}
                          />
                        );
                      })}
                  </Table>
                )}
                {!isLoading && (show === 'card' || windowSize[0] <= 1200) && (
                  <CardsList total={total}>
                    {fixedAssetCategories &&
                      fixedAssetCategories.map(record => {
                        return (
                          <Card
                            feature={feature}
                            subFeature={subFeature}
                            record={record}
                            title="name"
                            subTitles={subTitles}
                            deleteModel={MODELS.FIXED_ASSET_CATEGORY}
                            refreshData={getFixedAssetCategories}
                            setActionInProgress={setActionInProgress}
                            checked={checked}
                            setChecked={setChecked}
                            label1={{ value: record.fixedAssetTypeName }}
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
          refreshData={getFixedAssetCategories}
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          checked={checked}
          setChecked={setChecked}
          data={fixedAssetCategories}
          setActionInProgress={setActionInProgress}
          alertHandler={alertHandler}
          bulkActionConfig={{
            canDelete: canDelete,
            deleteSuccessMessage: 'LBL_FIXED_ASSET_CATEGORY_DELETED',
            modelsEnumKey: 'FIXED_ASSET_CATEGORIES',
          }}
        />
      )}
      {!isLoading && fixedAssetCategories && fixedAssetCategories.length === 0 && searchValue === '' && (
        <NoData
          imgSrc={NoFixedAssetCategoriesImg}
          noDataMessage={t('NO_FIXED_ASSET_CATEGORIES_DATA_MESSAGE')}
          showAdd={canAdd}
          addButtontext={t('LBL_ADD_FIXED_ASSET_CATEGORY')}
          addButtonPath={getFeaturePath(subFeature, 'add')}
        />
      )}
    </>
  );
};

export default FixedAssetCategories;
