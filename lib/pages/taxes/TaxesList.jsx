import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import Spinner from '../../components/Spinner/Spinner';
import MoreAction from '../../parts/MoreAction';
import Toolbar from '../../parts/Toolbar';
import Table from '../../components/ListingTable/Table';
import TableRow from '../../components/ListingTable/TableRow';
import CardsList from '../../components/CardsList/CardsList';
import Card from '../../components/CardsList/Card';
import NoData from '../../components/NoData';
import BreadCrumb from '../../components/ui/BreadCrumb';
import AddButton from '../../components/ui/buttons/AddButton';
import Calendar from '../../components/ui/Calendar';

import { MODELS } from '../../constants/models';
import { useAxiosFunction } from '../../hooks/useAxios';
import { getSearchUrl } from '../../services/getUrl';
import { useFeatures } from '../../hooks/useFeatures';
import { alertsActions } from '../../store/alerts';

import NoTaxesImg from '../../assets/images/icons/taxes.svg';
import useMetaFields from '../../hooks/metaFields/useMetaFields';

const TaxesList = ({ typeSelect }) => {
  let feature = 'APP_CONFIG';
  let subFeature = 'TAXES';

  const navigate = useNavigate();
  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  const { canAdd, canDelete, getFeaturePath } = useFeatures(feature, subFeature);
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const typeSelectMetaFields = useMetaFields('account.tax.type.select');

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
  const [taxesList, setTaxesList] = useState({});
  const [noData, setNoData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fields = [
    { accessor: 'name', Header: t('LBL_NAME'), type: 'text' },
    { accessor: 'code', Header: t('LBL_CODE'), type: 'text' },
    {
      accessor: 'typeSelect',
      Header: t('LBL_TAX_TYPE'),
      type: 'text',
      translate: true,
    },
    {
      accessor: 'rate',
      Header: t('LBL_RATE'),
      type: 'text',
    },
  ];

  const subTitles = [
    { label: 'LBL_TAX_TYPE', key: 'typeSelect' },
    { label: 'LBL_RATE', key: 'rate' },
  ];

  const alertHandler = (title, message) => dispatch(alertsActions.initiateAlert({ title, message }));

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
      fields: ['name', 'code', 'typeSelect', 'taxLineList'],
      sortBy: ['name'],
      data: {
        _searchText: searchValue !== '' ? searchValue : null,
        _domain: null,
        _domainContext: {
          _id: null,
          _model: MODELS.TAXES,
        },
        operator: 'or',
        criteria: searchValue !== '' ? criteria : [],
      },
      limit: pageSize,
      offset: offset,
      translate: true,
    };
  }, [searchValue, pageSize, offset]);

  const fetchTaxes = () => {
    return api('POST', getSearchUrl(MODELS.TAXES), searchPayload);
  };

  const getTaxLineSearchPayload = (id, fieldId) => {
    let payload = {
      fields: ['endDate', 'value', 'startDate'],
      sortBy: null,
      data: {
        _domain: 'self.id in (:_field_ids)',
        _domainContext: {
          id: id,
          _model: MODELS.TAXES,
          _field: 'taxLineList',
          _field_ids: [fieldId],
        },
        _archived: true,
      },
      limit: -1,
      offset: 0,
      translate: true,
    };
    return payload;
  };

  const fetchListingData = async () => {
    if (isLoading === false && searchValue === '') setIsLoading(true);

    let typeSelectList = typeSelect.data;

    if (!typeSelectList) {
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

      typeSelectList = metaDataResponse.data.data.fields.find(field => field.selection === 'account.tax.type.select');

      if (!typeSelectList) {
        setIsLoading(false);
        navigate('/error');
        return null;
      }

      typeSelectList = [...typeSelectList.selectionList];
      typeSelect.setData(typeSelectList);
    }

    const taxesResponse = await fetchTaxes();

    if (!taxesResponse || !taxesResponse.data || taxesResponse.data.status !== 0) {
      setIsLoading(false);
      navigate('/error');
      return null;
    }

    if ((!taxesResponse.data.data || !taxesResponse.data.total) && searchValue === '') {
      setIsLoading(false);
      setNoData(true);
      return null;
    }

    let taxTemp = { ...taxesResponse.data };

    if (searchValue !== '' && !taxesResponse.data.total) {
      setIsLoading(false);
      setTaxesList({ ...taxTemp });
      return null;
    }

    let newTaxes = [];

    if (taxTemp.data) {
      for (const tax of taxTemp.data) {
        let newTax = { ...tax };

        if (newTax.typeSelect !== null && newTax.typeSelect !== undefined && newTax.typeSelect !== 0) {
          let newTypeObj = typeSelectMetaFields?.list.find(type => Number(type.value) === Number(newTax.typeSelect));
          if (newTypeObj) newTax.typeSelect = t(newTypeObj.label);
          if (!newTypeObj) newTax.typeSelect = '';
        } else {
          newTax.typeSelect = '';
        }

        if (newTax && newTax.taxLineList && newTax.taxLineList.length > 0) {
          const taxLineResponse = await api(
            'POST',
            getSearchUrl(MODELS.TAXLINE),
            getTaxLineSearchPayload(newTax.id, newTax.taxLineList[0].id)
          );
          newTax.rate = taxLineResponse.data.data[0].value;
        }

        newTaxes.push(newTax);
      }
    }

    setIsLoading(false);
    return setTaxesList({
      ...taxTemp,
      data: [...newTaxes],
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
          imgSrc={NoTaxesImg}
          noDataMessage={t('NO_TAXES_DATA_MESSAGE')}
          addButtontext={`${t('LBL_ADD')} ${t('LBL_TAX')}`}
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
          data={taxesList.data || []}
          alertHandler={alertHandler}
          setActionInProgress={setActionInProgress}
          bulkActionConfig={{
            isExport: false,
            isImport: false,
            canDelete: canDelete,
            modelsEnumKey: 'TAXES',
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
                  <h4>{t('LBL_TAXES')}</h4>
                </div>

                <div className="reverse-page float-end">
                  {canAdd && (
                    <AddButton
                      text="LBL_ADD_TAX"
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
                  data={taxesList.data || []}
                  setActionInProgress={setActionInProgress}
                  bulkActionConfig={{
                    isExport: true,
                    canDelete: canDelete,
                    modelsEnumKey: 'TAXES',
                  }}
                  searchPayload={searchPayload}
                />
                {show === 'table' && windosSize[0] > 1200 && (
                  <Table
                    fields={fields}
                    data={taxesList.data || []}
                    total={taxesList.total || 0}
                    checked={checked}
                    setChecked={setChecked}
                    feature={feature}
                    subFeature={subFeature}
                  >
                    {taxesList.data &&
                      taxesList.data.length > 0 &&
                      taxesList.data.map(record => {
                        return (
                          <TableRow
                            record={record}
                            fields={fields}
                            deleteModel={MODELS.TAXES}
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
                  <CardsList total={taxesList.total || 0}>
                    {taxesList.data &&
                      taxesList.data.length > 0 &&
                      taxesList.data.map(record => {
                        return (
                          <Card
                            feature={feature}
                            subFeature={subFeature}
                            record={record}
                            title="name"
                            subTitles={subTitles}
                            deleteModel={MODELS.TAXES}
                            refreshData={fetchListingData}
                            setActionInProgress={setActionInProgress}
                            checked={checked}
                            setChecked={setChecked}
                            label1={record.typeSelect ? { value: record.typeSelect } : null}
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

export default TaxesList;
