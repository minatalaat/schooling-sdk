import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import Toolbar from '../../parts/Toolbar';
import NoData from '../../components/NoData';
import MoreAction from '../../parts/MoreAction';
import BreadCrumb from '../../components/ui/BreadCrumb';
import Table from '../../components/ListingTable/Table';
import TableRow from '../../components/ListingTable/TableRow';
import CardsList from '../../components/CardsList/CardsList';
import Card from '../../components/CardsList/Card';
import Spinner from '../../components/Spinner/Spinner';
import AddButton from '../../components/ui/buttons/AddButton';
import Calendar from '../../components/ui/Calendar';

import { useAxiosFunction } from '../../hooks/useAxios';
import { MODELS } from '../../constants/models';
import { getSearchUrl } from '../../services/getUrl';
import { useFeatures } from '../../hooks/useFeatures';
import { alertsActions } from '../../store/alerts';

import NoProductsImg from '../../assets/images/icons/Products.svg';

const StockLocations = () => {
  const feature = 'STOCK_MANAGEMENT';
  const subFeature = 'STOCK_LOCATIONS';

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getFeaturePath } = useFeatures();
  const { api } = useAxiosFunction();
  const { canAdd, canDelete } = useFeatures(feature, subFeature);
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(true);
  const [stockLocations, setStockLocations] = useState([]);
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

  const fields = [
    { accessor: 'name', Header: t('LBL_NAME'), type: 'text' },
    { accessor: 'address', Header: t('LBL_ADDRESS'), type: 'text', translate: true },
  ];

  const typeSelectEnum = {
    1: 'LBL_INTERNAL',
    2: 'LBL_EXTERNAL',
    3: 'LBL_VIRTUAL',
  };

  const alertHandler = (title, message) => dispatch(alertsActions.initiateAlert({ title, message }));

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
    getStockLocations();
  }, [searchParams]);

  const STOCK_LOCATION_SEARCH_FIELDS = [
    'address',
    'serialNumber',
    'partner',
    'name',
    'parentStockLocation',
    'stockLocationValue',
    'company',
    'typeSelect',
  ];

  const searchPayload = {
    fields: STOCK_LOCATION_SEARCH_FIELDS,
    sortBy: null,
    data: {
      _domain: null,
      _domainContext: {
        _id: null,
        _model: MODELS.STOCK_LOCATION,
      },
    },
    limit: pageSize,
    offset: offset,
    translate: true,
  };

  const searchPayloadwithValue = {
    fields: STOCK_LOCATION_SEARCH_FIELDS,
    sortBy: null,
    data: {
      _domain: null,
      _domainContext: {
        _id: null,
        _model: MODELS.STOCK_LOCATION,
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

  const getStockLocations = async () => {
    if (searchValue === '') {
      setStockLocations([]);
      setIsLoading(true);
    }

    let payload = searchValue && searchValue !== '' ? searchPayloadwithValue : searchPayload;
    let response = await api('POST', getSearchUrl(MODELS.STOCK_LOCATION), payload);
    let status = response.data.status;
    let data = response.data.data;
    let total = response.data.total;
    setIsLoading(false);

    if (status !== 0 || total === undefined || total === null) {
      setStockLocations([]);
      return alertHandler('Error', t('LBL_ERROR_LOADING_PRODUCTS'));
    }

    setTotal(total);

    if (data === undefined || data === null) {
      setStockLocations([]);
    }

    if (data) {
      let tempData = [];
      data.forEach(item => {
        let listItem = { ...item };
        listItem.address = listItem.address?.fullName ?? '';
        listItem.typeSelect = typeSelectEnum[listItem.typeSelect];
        tempData.push(listItem);
      });
      setStockLocations(tempData);
    }
  };

  return (
    <>
      {actionInProgress && <div className="lodingpage"></div>}
      {isLoading && <Spinner />}
      {((!isLoading && searchValue !== '') || (stockLocations && stockLocations.length > 0)) && (
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
                  <h4>{t('LBL_STOCK_LOCATIONS')}</h4>
                </div>

                {canAdd && (
                  <div className="reverse-page float-end">
                    <AddButton
                      text="LBL_ADD_STOCK_LOCATION"
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
                  refreshData={getStockLocations}
                  setShowMoreAction={setShowMoreAction}
                  checked={checked}
                  setChecked={setChecked}
                  data={stockLocations}
                  setActionInProgress={setActionInProgress}
                  bulkActionConfig={{
                    canDelete: canDelete,
                    modelsEnumKey: 'STOCK_LOCATIONS',
                    isExport: true,
                  }}
                  searchPayload={searchValue && searchValue !== '' ? searchPayloadwithValue : searchPayload}
                />
                {!isLoading && show === 'table' && windowSize[0] > 1200 && (
                  <Table
                    fields={fields}
                    data={stockLocations}
                    total={total}
                    checked={checked}
                    setChecked={setChecked}
                    feature={feature}
                    subFeature={subFeature}
                  >
                    {stockLocations.length > 0 &&
                      stockLocations.map(record => {
                        return (
                          <TableRow
                            key={record.id}
                            record={record}
                            fields={fields}
                            deleteModel={MODELS.STOCK_LOCATION}
                            refreshData={getStockLocations}
                            checked={checked}
                            setChecked={setChecked}
                            setActionInProgress={setActionInProgress}
                            feature={feature}
                            subFeature={subFeature}
                            isEditable={record.typeSelect !== typeSelectEnum[3]}
                            isDeletable={record.typeSelect !== typeSelectEnum[3]}
                          />
                        );
                      })}
                  </Table>
                )}
                {!isLoading && (show === 'card' || windowSize[0] <= 1200) && (
                  <CardsList total={total}>
                    {stockLocations &&
                      stockLocations.map(record => {
                        return (
                          <Card
                            key={record.id}
                            feature={feature}
                            subFeature={subFeature}
                            record={record}
                            title="name"
                            deleteModel={MODELS.STOCK_LOCATION}
                            refreshData={getStockLocations}
                            setActionInProgress={setActionInProgress}
                            checked={checked}
                            setChecked={setChecked}
                            label1={{ value: record.typeSelect }}
                            isEditable={record.typeSelect !== typeSelectEnum[3]}
                            isDeletable={record.typeSelect !== typeSelectEnum[3]}
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
          refreshData={getStockLocations}
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          checked={checked}
          setChecked={setChecked}
          data={stockLocations}
          alertHandler={alertHandler}
          setActionInProgress={setActionInProgress}
          bulkActionConfig={{
            canDelete: canDelete,
            modelsEnumKey: 'STOCK_LOCATIONS',
          }}
        />
      )}
      {!isLoading && stockLocations && stockLocations.length === 0 && searchValue === '' && (
        <NoData
          imgSrc={NoProductsImg}
          noDataMessage={t('NO_STOCK_LOCATIONS_DATA_MESSAGE')}
          showAdd={canAdd}
          addButtontext={t('LBL_ADD_STOCK_LOCATION')}
          addButtonPath={getFeaturePath(subFeature, 'add')}
        />
      )}
    </>
  );
};

export default StockLocations;
