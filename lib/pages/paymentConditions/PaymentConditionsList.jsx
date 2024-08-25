import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import Spinner from '../../components/Spinner/Spinner';
import Table from '../../components/ListingTable/Table';
import TableRow from '../../components/ListingTable/TableRow';
import CardsList from '../../components/CardsList/CardsList';
import Card from '../../components/CardsList/Card';
import Toolbar from '../../parts/Toolbar';
import NoData from '../../components/NoData';
import MoreAction from '../../parts/MoreAction';
import BreadCrumb from '../../components/ui/BreadCrumb';
import AddButton from '../../components/ui/buttons/AddButton';
import Calendar from '../../components/ui/Calendar';

import { MODELS } from '../../constants/models';
import NoPaymentConditionsImg from '../../assets/images/icons/Payment Conditions.svg';
import { useAxiosFunction } from '../../hooks/useAxios';
import { getSearchUrl } from '../../services/getUrl';
import { useFeatures } from '../../hooks/useFeatures';
import { alertsActions } from '../../store/alerts';

const PaymentConditionsList = ({ typeSelect, periodTypeSelect }) => {
  let feature = 'APP_CONFIG';
  let subFeature = 'PAYMENT_CONDITIONS';

  const navigate = useNavigate();
  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  const { canAdd, canDelete, getFeaturePath } = useFeatures(feature, subFeature);
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const [show, setShow] = useState('table');
  const [checked, setChecked] = useState([]);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [windosSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);
  const [showMoreAction, setShowMoreAction] = useState(false);

  let searchValue = searchParams.get('search') || '';
  let currentPage = parseInt(searchParams.get('currentPage') || 1);
  let pageSize = parseInt(searchParams.get('pageSize') || 10);
  let offset = (currentPage - 1) * pageSize;

  const [searchTimeout, setSearchTimeout] = useState(0);
  const [paymentConditionsList, setPaymentConditionsList] = useState({});
  const [noData, setNoData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fields = [
    { accessor: 'name', Header: t('LBL_NAME'), type: 'text' },
    { accessor: 'code', Header: t('LBL_CODE'), type: 'text' },
    // {
    //   accessor: 'typeSelect',
    //   Header: t('LBL_TYPE'),
    //   type: 'text',
    // },
    {
      accessor: 'paymentTime',
      Header: t('LBL_PAYMENT_PERIOD'),
      type: 'text',
    },

    {
      accessor: 'periodTypeSelect',
      Header: t('LBL_PERIOD_TYPE'),
      type: 'text',
    },
  ];

  const subTitles = [
    { label: 'LBL_TYPE', key: 'typeSelect' },
    { label: 'LBL_PAYMENT_PERIOD', key: 'paymentTime' },
  ];

  const alertHandler = (title, message) => dispatch(alertsActions.initiateAlert({ title, message }));

  const fetchKeys = arr => {
    let keysArray = [];
    arr.map(obj => keysArray.push(obj.accessor));
    return keysArray;
  };

  const searchPayload = useMemo(() => {
    const criteria = [
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
    ];
    return {
      fields: fetchKeys(fields),
      sortBy: ['name'],
      data: {
        _searchText: searchValue !== '' ? searchValue : null,
        _domain: null,
        _domainContext: {
          _id: null,
          _model: MODELS.PAYMENTCONDITION,
        },
        operator: 'or',
        criteria: searchValue !== '' ? criteria : [],
      },
      limit: pageSize,
      offset: offset,
      translate: true,
    };
  }, [searchValue, pageSize, offset]);

  const fetchPaymentConditions = () => {
    return api('POST', getSearchUrl(MODELS.PAYMENTCONDITION), searchPayload);
  };

  const fetchListingData = async () => {
    if (isLoading === false && searchValue === '') setIsLoading(true);

    let typeSelectList = typeSelect.data;
    let periodTypeSelectList = periodTypeSelect.data;

    if (!typeSelectList || !periodTypeSelectList) {
      const metaDataResponse = await typeSelect.fetchData();

      if (
        !metaDataResponse ||
        !metaDataResponse.data ||
        metaDataResponse.data.status !== 0 ||
        !metaDataResponse.data.data ||
        !metaDataResponse.data.data.fields
      ) {
        setIsLoading(false);
        navigate('/error');
        return null;
      }

      typeSelectList = metaDataResponse.data.data.fields.find(field => field.selection === 'account.payment.condition.type.select');

      if (!typeSelectList) {
        setIsLoading(false);
        navigate('/error');
        return null;
      }

      typeSelectList = [...typeSelectList.selectionList];
      typeSelect.setData(typeSelectList);

      periodTypeSelectList = metaDataResponse.data.data.fields.find(
        field => field.selection === 'account.payment.condition.period.type.select'
      );

      if (!periodTypeSelectList) {
        setIsLoading(false);
        navigate('/error');
        return null;
      }

      periodTypeSelectList = [...periodTypeSelectList.selectionList];
      periodTypeSelect.setData(periodTypeSelectList);
    }

    const paymentConditionsResponse = await fetchPaymentConditions();

    if (!paymentConditionsResponse || !paymentConditionsResponse.data || paymentConditionsResponse.data.status !== 0) {
      setIsLoading(false);
      navigate('/error');
      return null;
    }

    if ((!paymentConditionsResponse.data.data || !paymentConditionsResponse.data.total) && searchValue === '') {
      setIsLoading(false);
      setNoData(true);
      return null;
    }

    let paymentTemp = { ...paymentConditionsResponse.data };

    if (searchValue !== '' && !paymentConditionsResponse.data.total) {
      setIsLoading(false);
      setPaymentConditionsList({ ...paymentTemp });
      return null;
    }

    let newConditions = [];

    if (paymentTemp.data) {
      paymentTemp.data.forEach(condition => {
        let newCondition = { ...condition };

        if (newCondition.typeSelect !== null && newCondition.typeSelect !== undefined && newCondition.typeSelect !== 0) {
          let paymentTypeObj = typeSelectList.find(type => Number(type.value) === Number(newCondition.typeSelect));
          if (paymentTypeObj) newCondition.typeSelect = paymentTypeObj.title;
          if (!paymentTypeObj) newCondition.typeSelect = '';
        } else {
          newCondition.typeSelect = '';
        }

        if (newCondition.periodTypeSelect !== null && newCondition.periodTypeSelect !== undefined && newCondition.periodTypeSelect !== 0) {
          let periodTypeObj = periodTypeSelectList.find(type => Number(type.value) === Number(newCondition.periodTypeSelect));
          if (periodTypeObj) newCondition.periodTypeSelect = periodTypeObj.title;
          if (!periodTypeObj) newCondition.periodTypeSelect = '';
        } else {
          newCondition.periodTypeSelect = '';
        }

        newConditions.push(newCondition);
      });
    }

    setIsLoading(false);
    return setPaymentConditionsList({
      ...paymentTemp,
      data: [...newConditions],
    });
  };

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
    clearTimeout(searchTimeout);

    if (searchValue !== '') {
      setSearchTimeout(
        setTimeout(() => {
          fetchListingData();
        }, 1500)
      );
    } else {
      fetchListingData();
    }
  }, [offset, pageSize, searchValue]);

  return (
    <>
      {actionInProgress && <div className="lodingpage"></div>}
      {isLoading && <Spinner />}
      {!isLoading && noData && (
        <NoData
          imgSrc={NoPaymentConditionsImg}
          noDataMessage={t('NO_PAYMENT_CONDITIONS_DATA_MESSAGE')}
          addButtontext={t('LBL_ADD_PAYMENT_CONDITION')}
          addButtonPath={getFeaturePath(subFeature, 'add')}
          showAdd={canAdd}
        />
      )}
      {showMoreAction && (
        <MoreAction
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          refreshData={fetchListingData}
          checked={checked}
          setChecked={setChecked}
          data={paymentConditionsList.data || []}
          alertHandler={alertHandler}
          setActionInProgress={setActionInProgress}
          bulkActionConfig={{
            canDelete: canDelete,
            modelsEnumKey: 'PAYMENT_CONDITIONS',
          }}
        />
      )}
      {!isLoading && !noData && (
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
                  <h4>{t('LBL_PAYMENT_CONDITIONS')}</h4>
                </div>

                <div className="reverse-page float-end">
                  {canAdd && (
                    <AddButton
                      text="LBL_ADD_PAYMENT_CONDITION"
                      onClick={() => {
                        navigate(getFeaturePath(subFeature, 'add'));
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <Toolbar
                  show={show}
                  setShow={setShow}
                  refreshData={fetchListingData}
                  setShowMoreAction={setShowMoreAction}
                  checked={checked}
                  setChecked={setChecked}
                  data={paymentConditionsList.data || []}
                  setActionInProgress={setActionInProgress}
                  bulkActionConfig={{
                    canDelete: canDelete,
                    modelsEnumKey: 'PAYMENT_CONDITIONS',
                    isExport: true,
                  }}
                  searchPayload={searchPayload}
                />

                {show === 'table' && windosSize[0] > 1200 && (
                  <Table
                    fields={fields}
                    data={paymentConditionsList.data || []}
                    total={paymentConditionsList.total || 0}
                    checked={checked}
                    setChecked={setChecked}
                    feature={feature}
                    subFeature={subFeature}
                  >
                    {paymentConditionsList.data &&
                      paymentConditionsList.data.length > 0 &&
                      paymentConditionsList.data.map(record => {
                        return (
                          <TableRow
                            record={record}
                            fields={fields}
                            deleteModel={MODELS.PAYMENTCONDITION}
                            refreshData={fetchListingData}
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
                {(show === 'card' || windosSize[0] <= 1200) && (
                  <CardsList total={paymentConditionsList.total || 0}>
                    {paymentConditionsList.data &&
                      paymentConditionsList.data.length > 0 &&
                      paymentConditionsList.data.map(record => {
                        return (
                          <Card
                            feature={feature}
                            subFeature={subFeature}
                            record={record}
                            title="name"
                            subTitles={subTitles}
                            deleteModel={MODELS.PAYMENTCONDITION}
                            refreshData={fetchListingData}
                            setActionInProgress={setActionInProgress}
                            checked={checked}
                            setChecked={setChecked}
                            label1={record.code ? { value: record.code } : null}
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
    </>
  );
};

export default PaymentConditionsList;
