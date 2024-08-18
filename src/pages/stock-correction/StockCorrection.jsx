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
import { formatFloatNumber } from '../../utils/helpers';
import { getSearchUrl } from '../../services/getUrl';
import { useFeatures } from '../../hooks/useFeatures';
import { STOCK_CORRECTION_SEARCH_FIELDS } from './StockCorrectionPayloadsFields';
import { STOCK_CORRECTION_STATUS } from '../../constants/enums/StockCorrectionEnum';
import { alertsActions } from '../../store/alerts';

import NoStockCorrectionImg from '../../assets/images/icons/Products.svg';

const StockCorrection = () => {
  let feature = 'STOCK_MANAGEMENT';
  let subFeature = 'STOCK_CORRECTION';

  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getFeaturePath } = useFeatures();
  const { api } = useAxiosFunction();
  const { canAdd, canDelete } = useFeatures(feature, subFeature);
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(true);
  const [stockCorrections, setStockCorrections] = useState([]);
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

  const searchPayload = {
    fields: STOCK_CORRECTION_SEARCH_FIELDS,
    sortBy: null,
    data: {
      _domain: null,
      _domainContext: { _id: null, _model: MODELS.STOCK_CORRECTION },
      operator: 'and',
      criteria: [],
    },
    limit: pageSize,
    offset: offset,
    translate: true,
  };

  const searchPayloadwithValue = {
    fields: STOCK_CORRECTION_SEARCH_FIELDS,
    sortBy: null,
    data: {
      _domain: null,
      _domainContext: { _id: null, _model: MODELS.STOCK_CORRECTION },
      operator: 'or',
      criteria: [
        {
          fieldName: 'stockLocation.name',
          operator: 'like',
          value: 'Air',
        },
        {
          fieldName: 'product.fullName',
          operator: 'like',
          value: 'Air',
        },
        {
          fieldName: 'trackingNumber.trackingNumberSeq',
          operator: 'like',
          value: 'Air',
        },
        {
          fieldName: 'stockCorrectionReason.name',
          operator: 'like',
          value: 'Air',
        },
      ],
    },
    limit: pageSize,
    offset: offset,
    translate: true,
  };

  const fields = [
    { accessor: 'name', Header: t('LBL_PRODUCT'), type: 'text' },
    { accessor: 'stockLocation', Header: t('LBL_STOCK_LOCATION'), type: 'text' },
    { accessor: 'baseQty', Header: t('LBL_BASE_QTY'), type: 'text' },
    { accessor: 'realQty', Header: t('LBL_REAL_QTY'), type: 'text' },
    { accessor: 'statusSelect', Header: t('LBL_STATUS'), type: 'text', translate: true },
  ];

  const subTitles = [
    { label: 'LBL_STOCK_LOCATION', key: 'stockLocation' },
    { label: 'LBL_BASE_QTY', key: 'baseQty' },
    { label: 'LBL_REAL_QTY', key: 'realQty' },
  ];

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
    getStockCorrection();
  }, [searchParams]);

  const getStockCorrection = () => {
    if (searchValue === '') {
      setStockCorrections([]);
      setIsLoading(true);
    }

    let payload = searchValue && searchValue !== '' ? searchPayloadwithValue : searchPayload;
    api('POST', getSearchUrl(MODELS.STOCK_CORRECTION), payload, onStockCorrectionSearchSuccess);
  };

  const onStockCorrectionSearchSuccess = response => {
    let status = response.data.status;
    let data = response.data.data;
    let total = response.data.total;
    setIsLoading(false);

    if (status !== 0 || total === undefined || total === null) {
      setStockCorrections([]);
      return alertHandler('Error', t('LBL_ERROR_LOADING_STOCK_CORRECTION'));
    }

    setTotal(total);

    if (data === undefined || data === null) {
      setStockCorrections([]);
    }

    if (data) {
      let tempData = [];
      data.forEach(item => {
        let listItem = { ...item };
        listItem.name = listItem.product?.fullName ?? '';
        listItem.stockLocation = listItem.stockLocation?.name ?? '';
        listItem.baseQty = listItem.baseQty ? formatFloatNumber(listItem.baseQty) : '';
        listItem.realQty = listItem.realQty ? formatFloatNumber(listItem.realQty) : '';
        listItem.stockCorrectionReason = listItem.stockCorrectionReason ? listItem.stockCorrectionReason : null;
        listItem.statusSelect = STOCK_CORRECTION_STATUS[listItem.statusSelect];
        tempData.push(listItem);
      });
      setStockCorrections(tempData);
    }
  };

  return (
    <>
      {actionInProgress && <div className="lodingpage"></div>}
      {isLoading && <Spinner />}
      {((!isLoading && searchValue !== '') || (stockCorrections && stockCorrections.length > 0)) && (
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
                  <h4>{t('LBL_STOCK_CORRECTION')}</h4>
                </div>
                {canAdd && (
                  <div className="reverse-page float-end">
                    <AddButton
                      text="LBL_ADD_STOCK_CORRECTION"
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
                  refreshData={getStockCorrection}
                  setShowMoreAction={setShowMoreAction}
                  checked={checked}
                  setChecked={setChecked}
                  data={stockCorrections}
                  setActionInProgress={setActionInProgress}
                  bulkActionConfig={{
                    canDelete: canDelete,
                    deleteSuccessMessage: 'LBL_STOCK_CORRECTION_DELETED',
                    modelsEnumKey: 'STOCK_CORRECTION',
                    isExport: true,
                  }}
                  searchPayload={searchValue && searchValue !== '' ? searchPayloadwithValue : searchPayload}
                />
                {!isLoading && show === 'table' && windowSize[0] > 1200 && (
                  <Table
                    fields={fields}
                    data={stockCorrections}
                    total={total}
                    checked={checked}
                    setChecked={setChecked}
                    feature={feature}
                    subFeature={subFeature}
                  >
                    {stockCorrections.length > 0 &&
                      stockCorrections.map(record => {
                        return (
                          <TableRow
                            record={record}
                            fields={fields}
                            deleteModel={MODELS.STOCK_CORRECTION}
                            refreshData={getStockCorrection}
                            checked={checked}
                            setChecked={setChecked}
                            setActionInProgress={setActionInProgress}
                            feature={feature}
                            subFeature={subFeature}
                            isEditable={record.statusSelect === 'LBL_DRAFT'}
                            isDeletable={record.statusSelect === 'LBL_DRAFT'}
                          />
                        );
                      })}
                  </Table>
                )}
                {!isLoading && (show === 'card' || windowSize[0] <= 1200) && (
                  <CardsList total={total}>
                    {stockCorrections &&
                      stockCorrections.map(record => {
                        return (
                          <Card
                            feature={feature}
                            subFeature={subFeature}
                            record={record}
                            title="name"
                            subTitles={subTitles}
                            deleteModel={MODELS.STOCK_CORRECTION}
                            refreshData={getStockCorrection}
                            setActionInProgress={setActionInProgress}
                            checked={checked}
                            setChecked={setChecked}
                            label1={{ value: record.statusSelect }}
                            isEditable={record.statusSelect === 'LBL_DRAFT'}
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
          refreshData={getStockCorrection}
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          checked={checked}
          setChecked={setChecked}
          data={stockCorrections}
          alertHandler={alertHandler}
          setActionInProgress={setActionInProgress}
          bulkActionConfig={{
            canDelete: canDelete,
            deleteSuccessMessage: 'LBL_STOCK_CORRECTION_DELETED',
            modelsEnumKey: 'STOCK_CORRECTION',
          }}
        />
      )}
      {!isLoading && stockCorrections && stockCorrections.length === 0 && searchValue === '' && (
        <NoData
          imgSrc={NoStockCorrectionImg}
          noDataMessage={t('NO_STOCK_CORRECTION_DATA_MESSAGE')}
          showAdd={canAdd}
          addButtontext={t('LBL_ADD_STOCK_CORRECTION')}
          addButtonPath={getFeaturePath(subFeature, 'add')}
        />
      )}
    </>
  );
};

export default StockCorrection;
