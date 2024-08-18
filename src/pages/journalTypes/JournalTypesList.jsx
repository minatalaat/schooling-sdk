import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

import Spinner from '../../components/Spinner/Spinner';
import Table from '../../components/ListingTable/Table';
import TableRow from '../../components/ListingTable/TableRow';
import CardsList from '../../components/CardsList/CardsList';
import Card from '../../components/CardsList/Card';
import NoData from '../../components/NoData';
import Toolbar from '../../parts/Toolbar';
import MoreAction from '../../parts/MoreAction';
import BreadCrumb from '../../components/ui/BreadCrumb';
import Calendar from '../../components/ui/Calendar';

import NoJournalTypesImg from '../../assets/images/icons/Journal Entries Types.svg';
import { MODELS } from '../../constants/models';
import { useAxiosFunction } from '../../hooks/useAxios';
import { getSearchUrl } from '../../services/getUrl';

const JournalTypesList = ({ technicalTypeSelect }) => {
  let feature = 'ACCOUNTING';
  let subFeature = 'JOURNAL_TYPES';

  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [show, setShow] = useState('table');
  const [windosSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);
  const [showMoreAction, setShowMoreAction] = useState(false);
  let searchValue = searchParams.get('search') || '';
  let currentPage = parseInt(searchParams.get('currentPage') || 1);
  let pageSize = parseInt(searchParams.get('pageSize') || 10);
  let offset = (currentPage - 1) * pageSize;

  const [searchTimeout, setSearchTimeout] = useState(0);
  const [jounalTypesList, setJournalTypesList] = useState({});
  const [noData, setNoData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fields = [
    { accessor: 'name', Header: t('LBL_NAME'), type: 'text' },
    { accessor: 'code', Header: t('LBL_CODE'), type: 'text' },
    {
      accessor: 'technicalTypeSelect',
      Header: t('LBL_TECHNICAL_TYPE'),
      type: 'text',
    },
  ];

  const subTitles = [{ label: 'LBL_TECHNICAL_TYPE', key: 'technicalTypeSelect' }];

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
          _model: MODELS.JOURNALTYPES,
        },
        operator: 'or',
        criteria: searchValue !== '' ? criteria : [],
      },
      limit: pageSize,
      offset: offset,
      translate: true,
    };
  }, [searchValue, pageSize, offset]);

  const fetchJournalTypes = () => {
    return api('POST', getSearchUrl(MODELS.JOURNALTYPES), searchPayload);
  };

  const fetchListingData = async () => {
    if (isLoading === false && searchValue === '') setIsLoading(true);

    let technicalTypeSelectList = technicalTypeSelect.data;

    if (!technicalTypeSelectList) {
      const metaDataResponse = await technicalTypeSelect.fetchData();

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

      technicalTypeSelectList = metaDataResponse.data.data.fields.find(
        field => field.selection === 'account.journal.type.technical.type.select'
      );

      if (!technicalTypeSelectList) {
        setIsLoading(false);
        navigate('/error');
        return null;
      }

      technicalTypeSelectList = [...technicalTypeSelectList.selectionList];
      technicalTypeSelect.setData(technicalTypeSelectList);
    }

    const journalTypesResponse = await fetchJournalTypes();

    if (!journalTypesResponse || !journalTypesResponse.data || journalTypesResponse.data.status !== 0) {
      setIsLoading(false);
      navigate('/error');
      return null;
    }

    if ((!journalTypesResponse.data.data || !journalTypesResponse.data.total) && searchValue === '') {
      setIsLoading(false);
      setNoData(true);
      return null;
    }

    let journalTypesTemp = { ...journalTypesResponse.data };

    if (searchValue !== '' && !journalTypesResponse.data.total) {
      setIsLoading(false);
      setJournalTypesList({ ...journalTypesTemp });
      return null;
    }

    let newJournalTypes = [];

    if (journalTypesTemp.data) {
      journalTypesTemp.data.forEach(type => {
        let newType = { ...type };

        if (newType.technicalTypeSelect !== null && newType.technicalTypeSelect !== undefined && newType.technicalTypeSelect !== 0) {
          let newTypeObj = technicalTypeSelectList.find(type => Number(type.value) === Number(newType.technicalTypeSelect));
          if (newTypeObj) newType.technicalTypeSelect = newTypeObj.title;
          if (!newTypeObj) newType.technicalTypeSelect = '';
        } else {
          newType.technicalTypeSelect = '';
        }

        newJournalTypes.push(newType);
      });
    }

    setIsLoading(false);
    return setJournalTypesList({
      ...journalTypesTemp,
      data: [...newJournalTypes],
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
      {isLoading && <Spinner />}
      {!isLoading && noData && <NoData imgSrc={NoJournalTypesImg} noDataMessage={t('NO_JOURNAL_TYPES_DATA_MESSAGE')} />}
      {showMoreAction && (
        <MoreAction
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          refreshData={fetchListingData}
          data={jounalTypesList.data || []}
          bulkActionConfig={{
            isExport: true,
            isImport: false,
            modelsEnumKey: 'JOURNAL_TYPES',
          }}
          canSelectAll={false}
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
                  <h4>{t('LBL_JOURNALTYPES')}</h4>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <Toolbar
                  setShow={setShow}
                  show={show}
                  refreshData={fetchListingData}
                  setShowMoreAction={setShowMoreAction}
                  data={jounalTypesList.data || []}
                  bulkActionConfig={{
                    isExport: true,
                    modelsEnumKey: 'JOURNAL_TYPES',
                  }}
                  canSelectAll={false}
                  searchPayload={searchPayload}
                />
                {show === 'table' && windosSize[0] > 1200 && (
                  <Table
                    fields={fields}
                    data={jounalTypesList.data || []}
                    total={jounalTypesList.total || 0}
                    feature={feature}
                    subFeature={subFeature}
                    hasBulkActions={false}
                    hasActions={false}
                  >
                    {jounalTypesList.data &&
                      jounalTypesList.data.length > 0 &&
                      jounalTypesList.data.map(record => {
                        return (
                          <TableRow
                            record={record}
                            fields={fields}
                            refreshData={fetchListingData}
                            feature={feature}
                            subFeature={subFeature}
                            isViewable={false}
                            isDeletable={false}
                            isEditable={false}
                            hasBulkActions={false}
                          />
                        );
                      })}
                  </Table>
                )}
                {(show === 'card' || windosSize[0] <= 1200) && (
                  <CardsList total={jounalTypesList.total || 0}>
                    {jounalTypesList.data &&
                      jounalTypesList.data.length > 0 &&
                      jounalTypesList.data.map(record => {
                        return (
                          <Card
                            feature={feature}
                            subFeature={subFeature}
                            record={record}
                            title="name"
                            subTitles={subTitles}
                            refreshData={fetchListingData}
                            label1={record.code ? { value: record.code } : null}
                            isViewable={false}
                            isDeletable={false}
                            isEditable={false}
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

export default JournalTypesList;
