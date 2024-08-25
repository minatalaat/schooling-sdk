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
import NoProductActivitiesImg from '../../assets/images/icons/Products.svg';
import MoreAction from '../../parts/MoreAction';
import AddButton from '../../components/ui/buttons/AddButton';
import Calendar from '../../components/ui/Calendar';

import { useAxiosFunction } from '../../hooks/useAxios';
import { MODELS } from '../../constants/models';
import { getSearchUrl } from '../../services/getUrl';
import { useFeatures } from '../../hooks/useFeatures';
import { alertsActions } from '../../store/alerts';

const ProductActivity = () => {
  const feature = 'HR_MANAGEMENT';
  const subFeature = 'PRODUCT_ACTIVITY';
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getFeaturePath } = useFeatures();
  const { api } = useAxiosFunction();
  const { canAdd, canDelete } = useFeatures(feature, subFeature);
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [productActivity, setProductActivity] = useState([]);
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
    fields: ['productFamily', 'code', 'name', 'productCategory'],
    sortBy: ['code', 'name'],
    data: {
      _domain: `self.isActivity = true AND self.dtype = 'Product'`,
      _domainContext: {
        _id: null,
        _model: MODELS.PRODUCT,
      },
      operator: 'and',
      criteria: [],
    },
    limit: pageSize,
    offset: offset,
    translate: true,
  };

  const searchPayloadwithValue = {
    fields: ['productFamily', 'code', 'name', 'productCategory'],
    sortBy: ['code', 'name'],
    data: {
      _domain: `self.isActivity = true AND self.dtype = 'Product'`,
      _domainContext: {
        _id: null,
        _model: MODELS.PRODUCT,
      },
      operator: 'or',
      criteria: [
        {
          fieldName: 'name',
          operator: 'like',
          value: searchValue,
        },
        {
          fieldName: 'code',
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
    { accessor: 'code', Header: t('LBL_CODE'), type: 'text' },
    { accessor: 'productCategory', Header: t('LBL_PRODUCT_CATEGORY'), type: 'text' },
    { accessor: 'productFamily', Header: t('LBL_ACCOUNTING_FAMILY'), type: 'text' },
  ];

  const subTitles = [
    { label: 'LBL_CODE', key: 'code' },
    { label: 'LBL_PRODUCT_CATEGORY', key: 'productCategory' },
    { label: 'LBL_ACCOUNTING_FAMILY', key: 'productFamily' },
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
    getProductActivities();
  }, [searchParams]);

  const getProductActivities = () => {
    if (searchValue === '') {
      setProductActivity([]);
      setIsLoading(true);
    }

    let payload = searchValue && searchValue !== '' ? searchPayloadwithValue : searchPayload;
    api('POST', getSearchUrl(MODELS.PRODUCT), payload, onProductActivitesSearchSuccess);
  };

  const onProductActivitesSearchSuccess = response => {
    let status = response.data.status;
    let data = response.data.data;
    let total = response.data.total;
    setIsLoading(false);

    if (status !== 0 || total === undefined || total === null) {
      setProductActivity([]);
      return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    }

    setTotal(total);

    if (data === undefined || data === null) {
      setProductActivity([]);
    }

    if (data) {
      let tempData = [];
      data.forEach(item => {
        let listItem = { ...item };
        listItem.productCategory = item ? (item.productCategory ? item.productCategory.name : '') : '';
        listItem.productFamily = item ? (item.productFamily ? item.productFamily.name : '') : '';
        tempData.push(listItem);
      });
      setProductActivity(tempData);
    }
  };

  return (
    <>
      {actionInProgress && <div className="lodingpage"></div>}
      {isLoading && <Spinner />}
      {((!isLoading && searchValue !== '') || (productActivity && productActivity.length > 0)) && (
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
                  <h4>{t('LBL_PRODUCT_ACTIVITY')}</h4>
                </div>
                {canAdd && (
                  <div className="reverse-page float-end">
                    <AddButton
                      text="LBL_ADD_PRODUCT_ACTIVITY"
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
                  refreshData={getProductActivities}
                  setShowMoreAction={setShowMoreAction}
                  checked={checked}
                  setChecked={setChecked}
                  data={productActivity}
                  setActionInProgress={setActionInProgress}
                  bulkActionConfig={{
                    canDelete: canDelete,
                    deleteSuccessMessage: 'LBL_ACTIVITY_DELETED_SUCCESS',
                    modelsEnumKey: 'PRODUCT_ACTIVITY',
                  }}
                />
                {!isLoading && show === 'table' && windowSize[0] > 1200 && (
                  <Table
                    fields={fields}
                    data={productActivity}
                    total={total}
                    checked={checked}
                    setChecked={setChecked}
                    feature={feature}
                    subFeature={subFeature}
                  >
                    {productActivity.length > 0 &&
                      productActivity.map(record => {
                        return (
                          <TableRow
                            record={record}
                            fields={fields}
                            deleteModel={MODELS.PRODUCT}
                            refreshData={getProductActivities}
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
                    {productActivity &&
                      productActivity.map(record => {
                        return (
                          <Card
                            feature={feature}
                            subFeature={subFeature}
                            record={record}
                            title="name"
                            subTitles={subTitles}
                            deleteModel={MODELS.PRODUCT}
                            refreshData={getProductActivities}
                            setActionInProgress={setActionInProgress}
                            checked={checked}
                            setChecked={setChecked}
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
          refreshData={getProductActivities}
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          checked={checked}
          setChecked={setChecked}
          data={productActivity}
          setActionInProgress={setActionInProgress}
          alertHandler={alertHandler}
          bulkActionConfig={{
            canDelete: canDelete,
            deleteSuccessMessage: 'LBL_ACTIVITY_DELETED_SUCCESS',
            modelsEnumKey: 'PRODUCT_ACTIVITY',
          }}
        />
      )}
      {!isLoading && productActivity && productActivity.length === 0 && searchValue === '' && (
        <NoData
          imgSrc={NoProductActivitiesImg}
          noDataMessage={t('NO_PRODUCT_ACTIVITIES_DATA_MESSAGE')}
          showAdd={canAdd}
          addButtontext={t('LBL_ADD_PRODUCT_ACTIVITY')}
          addButtonPath={getFeaturePath(subFeature, 'add')}
        />
      )}
    </>
  );
};

export default ProductActivity;
