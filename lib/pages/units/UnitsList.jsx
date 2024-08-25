import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import Spinner from '../../components/Spinner/Spinner';
import Table from '../../components/ListingTable/Table';
import TableRow from '../../components/ListingTable/TableRow';
import CardsList from '../../components/CardsList/CardsList';
import Card from '../../components/CardsList/Card';
import NoData from '../../components/NoData';
import Toolbar from '../../parts/Toolbar';
import MoreAction from '../../parts/MoreAction';
import BreadCrumb from '../../components/ui/BreadCrumb';
import AddButton from '../../components/ui/buttons/AddButton';
import Calendar from '../../components/ui/Calendar';

import { MODELS } from '../../constants/models';
import NoUnitsImg from '../../assets/images/icons/unit.svg';
import { useAxiosFunction } from '../../hooks/useAxios';
import { getSearchUrl } from '../../services/getUrl';
import { useFeatures } from '../../hooks/useFeatures';
import useMetaFields from '../../hooks/metaFields/useMetaFields';
import { alertsActions } from '../../store/alerts';

const UnitsList = () => {
  let feature = 'APP_CONFIG';
  let subFeature = 'UNITS';

  const navigate = useNavigate();
  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  const { canAdd, canDelete, getFeaturePath } = useFeatures(feature, subFeature);
  const [searchParams] = useSearchParams();
  const unitTypeSelect = useMetaFields('unit.unit.type.select');
  const dispatch = useDispatch();

  const [show, setShow] = useState('table');
  const [checked, setChecked] = useState([]);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [windosSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [noData, setNoData] = useState(false);

  let searchValue = searchParams.get('search') || '';
  let currentPage = parseInt(searchParams.get('currentPage') || 1);
  let pageSize = parseInt(searchParams.get('pageSize') || 10);
  let offset = (currentPage - 1) * pageSize;

  const [searchTimeout, setSearchTimeout] = useState(0);
  const [unitsList, setUnitsList] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const fields = [
    { accessor: 'name', Header: t('LBL_UNIT'), type: 'text' },
    {
      accessor: 'labelToPrinting',
      Header: t('LBL_LABEL_TO_PRINTING'),
      type: 'text',
    },
    {
      accessor: 'unitTypeSelect',
      Header: t('LBL_UNIT_TYPE'),
      type: 'text',
      translate: true,
    },
  ];

  const subTitles = [{ label: 'LBL_LABEL_TO_PRINTING', key: 'labelToPrinting' }];

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
        fieldName: 'labelToPrinting',
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
          _model: MODELS.UNIT,
        },
        operator: 'or',
        criteria: searchValue !== '' ? criteria : [],
      },
      limit: pageSize,
      offset: offset,
      translate: true,
    };
  }, [searchValue, pageSize, offset]);

  const fetchUnits = () => {
    return api('POST', getSearchUrl(MODELS.UNIT), searchPayload);
  };

  const fetchListingData = async () => {
    if (isLoading === false && searchValue === '') setIsLoading(true);

    const unitsResponse = await fetchUnits();

    if (!unitsResponse || !unitsResponse.data || unitsResponse.data.status !== 0) {
      setIsLoading(false);
      navigate('/error');
      return null;
    }

    if ((!unitsResponse.data.data || !unitsResponse.data.total) && searchValue === '') {
      setIsLoading(false);
      setNoData(true);
      return null;
    }

    let unitTemp = { ...unitsResponse.data };

    if (searchValue !== '' && !unitsResponse.data.total) {
      setIsLoading(false);
      setUnitsList({ ...unitTemp });
      return null;
    }

    let newUnits = await unitTypeSelect.convertValues(unitTemp.data);
    setIsLoading(false);
    return setUnitsList({
      ...unitTemp,
      data: [...newUnits],
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
          imgSrc={NoUnitsImg}
          noDataMessage={t('NO_UNITS_DATA_MESSAGE')}
          addButtontext={t('LBL_ADD_UNIT')}
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
          data={unitsList.data || []}
          alertHandler={alertHandler}
          setActionInProgress={setActionInProgress}
          bulkActionConfig={{
            isExport: true,
            isImport: true,
            canDelete: canDelete,
            deleteSuccessMessage: 'DELETED_SUCCESSFULLY',
            modelsEnumKey: 'UNITS',
            importConfigName: 'Unit',
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
                  <h4>{t('LBL_UNITS')}</h4>
                </div>

                <div className="reverse-page float-end">
                  {canAdd && (
                    <AddButton
                      text="LBL_ADD_UNIT"
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
                  data={unitsList.data || []}
                  setActionInProgress={setActionInProgress}
                  bulkActionConfig={{
                    isExport: true,
                    isImport: false,
                    subFeature: subFeature,
                    canDelete: canDelete,
                    modelsEnumKey: 'UNITS',
                  }}
                  searchPayload={searchPayload}
                />
                {show === 'table' && windosSize[0] > 1200 && (
                  <Table
                    fields={fields}
                    data={unitsList.data || []}
                    total={unitsList.total || 0}
                    checked={checked}
                    setChecked={setChecked}
                    feature={feature}
                    subFeature={subFeature}
                  >
                    {unitsList.data &&
                      unitsList.data.length > 0 &&
                      unitsList.data.map(record => {
                        return (
                          <TableRow
                            record={record}
                            fields={fields}
                            deleteModel={MODELS.UNIT}
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
                  <CardsList total={unitsList.total || 0}>
                    {unitsList.data &&
                      unitsList.data.length > 0 &&
                      unitsList.data.map(record => {
                        return (
                          <Card
                            feature={feature}
                            subFeature={subFeature}
                            record={record}
                            title="name"
                            subTitles={subTitles}
                            deleteModel={MODELS.UNIT}
                            refreshData={fetchListingData}
                            setActionInProgress={setActionInProgress}
                            checked={checked}
                            setChecked={setChecked}
                            label1={record.unitTypeSelect ? { value: record.unitTypeSelect } : null}
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

export default UnitsList;
