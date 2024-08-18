import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import moment from 'moment';
import { useDispatch } from 'react-redux';

import Table from '../../components/ListingTable/Table';
import TableModalRow from '../../components/ListingTable/TableModalRow';
import CardsList from '../../components/CardsList/CardsList';
import CardModal from '../../components/CardsList/CardModal';
import Toolbar from '../../parts/Toolbar';
import MoreAction from '../../parts/MoreAction';
import BreadCrumb from '../../components/ui/BreadCrumb';
import DepreciationLineModal from '../../components/depreciation/DepreciationLineModal';
import DateInput from '../../components/ui/inputs/DateInput';
import Spinner from '../../components/Spinner/Spinner';

import { getTodayDate } from '../../utils/helpers';
import { MODELS } from '../../constants/models';
import { useAxiosFunction } from '../../hooks/useAxios';
import { getSearchUrl, getModelFieldsUrl } from '../../services/getUrl';
import { BsCheckCircle } from 'react-icons/bs';
import { alertsActions } from '../../store/alerts';
import { useDepreciationServices } from '../../services/apis/useDepreciationServices';

moment.locale('en');

const ListingDepreciations = () => {
  let feature = 'FIXED_ASSETS_MANAGEMENT';
  let subFeature = 'DEPRECIATION';

  const [show, setShow] = useState('table');
  const [windosSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [depreciationList, setDepreciationList] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusSelectData, setStatusSelectData] = useState(null);
  const [showViewLine, setShowViewLine] = useState(false);
  const [selectedLine, setSelectedLine] = useState({});

  const maxDate = useMemo(() => {
    return moment().endOf('month').format('YYYY-MM-DD');
  }, []);

  const dispatch = useDispatch();

  const alertHandler = (title, message) => {
    dispatch(alertsActions.initiateAlert({ title, message }));
    setActionInProgress(false);
    setIsLoading(false);
  };

  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  const { bulkRealizeService, realizeLineService } = useDepreciationServices(alertHandler);
  const navigate = useNavigate();

  const initialValues = {
    depreciationToDate: maxDate,
  };

  const validationSchema = Yup.object().shape({
    depreciationToDate: Yup.date().required(t('REQUIRED')).max(maxDate, t('VALIDATION_SELECT_DATE_WITHIN_THIS_MONTH')),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: true,
  });

  const fields = [
    { accessor: 'fixedAsset.name', Header: t('LBL_FIXED_ASSET_NAME'), type: 'text' },
    { accessor: 'depreciationDate', Header: t('LBL_DEPRECIATION_DATE'), type: 'text' },
    { accessor: 'depreciationBase', Header: t('LBL_DEPRECIATION_BASE'), type: 'number' },
    {
      accessor: 'depreciation',
      Header: t('LBL_DEPRECIATION'),
      type: 'number',
    },
    { accessor: 'cumulativeDepreciation', Header: t('LBL_CUMUALATIVE_DEPRECIATION'), type: 'number' },
    { accessor: 'accountingValue', Header: t('LBL_ACCOUNTING_VALUE'), type: 'number' },
    { accessor: 'statusSelect', Header: t('LBL_STATUS'), type: 'text' },
  ];

  const subTitles = [
    { label: 'LBL_DEPRECIATION', key: 'depreciation', type: 'number' },
    { label: 'LBL_CUMUALATIVE_DEPRECIATION', key: 'cumulativeDepreciation', type: 'number' },
    { label: 'LBL_DEPRECIATION_BASE', key: 'depreciationBase', type: 'number' },
  ];

  const fetchKeys = arr => {
    let keysArray = [];
    arr.map(obj => keysArray.push(obj.accessor));
    return keysArray;
  };

  const searchPayload = useMemo(() => {
    const lineFields = [
      ...fetchKeys(fields),
      'fixedAsset.statusSelect',
      'fixedAsset.acquisitionDate',
      'fixedAsset.id',
      'fixedAsset.reference',
      'fixedAsset.durationInMonth',
      'fixedAsset.computationMethodSelect',
      'fixedAsset.firstDepreciationDateInitSelect',
      'fixedAsset.firstServiceDate',
      'fixedAsset.firstDepreciationDate',
      'fixedAsset.fiscalNbrOfPastDepreciations',
      'fixedAsset.fiscalAlreadyDepreciatedAmount',
      'fixedAsset.nbrOfPastDepreciations',
      'fixedAsset.purchaseAccount',
      'fixedAsset.version',
      'fixedAsset.grossValue',
      'fixedAsset.name',
      'fixedAsset.fiscalFirstDepreciationDateInitSelect',
      'fixedAsset.numberOfDepreciation',
      'fixedAsset.correctedAccountingValue',
      'fixedAsset.residualValue',
      'fixedAsset.fiscalFirstDepreciationDate',
      'fixedAsset.journal',
      'fixedAsset.company',
      'fixedAsset.fiscalNumberOfDepreciation',
      'fixedAsset.periodicityInMonth',
      'fixedAsset.disposalValue',
      'fixedAsset.fiscalPeriodicityInMonth',
      'fixedAsset.originSelect',
      'fixedAsset.partner',
      'fixedAsset.fixedAssetSeq',
      'fixedAsset.accountingValue',
      'fixedAsset.fiscalPeriodicityTypeSelect',
      'fixedAsset.fixedAssetCategory',
      'fixedAsset.fiscalComputationMethodSelect',
      'fixedAsset.fiscalDurationInMonth',
      'fixedAsset.statusSelect',
      'ifrsFixedAsset.statusSelect',
      'fixedAsset.alreadyDepreciatedAmount',
    ];
    const criteria = [
      {
        fieldName: 'fixedAsset.statusSelect',
        operator: '>=',
        value: 2,
      },
      {
        fieldName: 'statusSelect',
        operator: '=',
        value: 1,
      },
      {
        fieldName: 'depreciationDate',
        operator: '<=',
        value: formik.values.depreciationToDate,
      },
    ];
    return {
      fields: lineFields,
      sortBy: ['depreciationDate'],
      data: {
        _domainContext: { _model: MODELS.FIXED_ASSET_LINE },
        operator: 'and',
        criteria,
      },
      operator: 'and',
      criteria: [],
      limit: -1,
      offset: 0,
      translate: true,
    };
  }, [formik.values.depreciationToDate]);

  const fetchDepreciationLines = () => {
    return api('POST', getSearchUrl(MODELS.FIXED_ASSET_LINE), searchPayload);
  };

  const fetchListingData = async type => {
    if (!actionInProgress && type === 'realize') setActionInProgress(true);
    if (!isLoading && type !== 'realize') setIsLoading(true);

    let statusList = null;

    if (!statusSelectData) {
      const metaDataResponse = await api('GET', getModelFieldsUrl(MODELS.FIXED_ASSET_LINE));

      if (
        !metaDataResponse ||
        !metaDataResponse.data ||
        metaDataResponse.data.status !== 0 ||
        !metaDataResponse.data.data ||
        !metaDataResponse.data.data.fields
      ) {
        setActionInProgress(false);
        setIsLoading(false);
        navigate('/error');
        return null;
      }

      statusList = metaDataResponse.data.data.fields.find(field => field.selection === 'account.fixed.asset.line.status.select');

      if (!statusList) {
        setActionInProgress(false);
        setIsLoading(false);
        navigate('/error');
        return null;
      }

      statusList = [...statusList.selectionList];
      setStatusSelectData(statusList);
    } else {
      statusList = [...statusSelectData];
    }

    const depreciationResponse = await fetchDepreciationLines();

    if (!depreciationResponse || !depreciationResponse.data || depreciationResponse.data.status !== 0) {
      setActionInProgress(false);
      setIsLoading(false);
      navigate('/error');
      return null;
    }

    if (!depreciationResponse.data.data || !depreciationResponse.data.total) {
      setActionInProgress(false);
      setIsLoading(false);
      setDepreciationList([]);
      return null;
    }

    let depreciationTemp = { ...depreciationResponse.data };

    if (!depreciationResponse.data.total) {
      setActionInProgress(false);
      setIsLoading(false);
      setDepreciationList({ ...depreciationTemp });
      return null;
    }

    let newDepreciationList = [];

    if (depreciationTemp.data) {
      depreciationTemp.data.forEach(depreciationData => {
        let newDepreciation = { ...depreciationData };

        if (newDepreciation.statusSelect !== null && newDepreciation.statusSelect !== undefined && newDepreciation.statusSelect !== 0) {
          let newDepreciationObject = statusList.find(el => Number(el.value) === Number(newDepreciation.statusSelect));
          if (newDepreciationObject) newDepreciation.statusSelect = newDepreciationObject.title;
          if (!newDepreciationObject) newDepreciation.statusSelect = '';
        } else {
          newDepreciation.statusSelect = '';
        }

        newDepreciationList.push(newDepreciation);
      });
    }

    setActionInProgress(false);
    setIsLoading(false);
    return setDepreciationList({
      ...depreciationTemp,
      data: [...newDepreciationList],
    });
  };

  const bulkRealizeHandler = async () => {
    setActionInProgress(true);

    const { successfulCount, total } = await bulkRealizeService(depreciationList);
    await fetchListingData('realize');

    alertHandler('Info', `${t('POSTED')} ${successfulCount} ${t('OUT_OF')} ${total} ${t('DEPRECIATION_LINES_SM')}`);

    setActionInProgress(false);
  };

  const realizeLineHandler = async line => {
    setActionInProgress(true);
    const res = await realizeLineService(line);

    if (res) {
      await fetchListingData('realize');
      alertHandler('Success', t('DEPRECIATION_LINE_REAILZED_SUCCESSFULLY'));
    }

    setActionInProgress(false);
  };

  const RealizeIcon = ({ line }) => {
    return (
      <BsCheckCircle
        color={selectedLine && line.statusSelect === 'Planned' ? '#256FAB' : '#83B1D6'}
        style={{
          width: '24px',
          height: '24px',
          verticalAlign: 'middle',
        }}
      />
    );
  };

  const viewLineHandler = line => {
    setSelectedLine(line);
    setShowViewLine(true);
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

  return (
    <>
      {actionInProgress && <div className="lodingpage"></div>}
      {isLoading && <Spinner />}
      {showMoreAction && (
        <MoreAction showMoreAction={showMoreAction} setShowMoreAction={setShowMoreAction} refreshData={fetchListingData} />
      )}

      <div className="page-body">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <div className="info-date-page float-end">
                <i className="calender-i"></i>
                <p>{t('DATE', getTodayDate())}</p>
              </div>

              <BreadCrumb feature={feature} subFeature={subFeature} />
            </div>
          </div>
          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{`${t('LBL_DEPRECIATION')}${depreciationList ? ` ${t('LBL_TO_DATE')} ${formik.values.depreciationToDate}` : ''}`}</h4>
              </div>
              <div className="reverse-page float-end">
                {depreciationList?.data?.length > 0 && (
                  <button className="btn btn-save" onClick={bulkRealizeHandler} disabled={!(depreciationList?.data?.length > 0)}>
                    {t('LBL_POST_ALL')}
                  </button>
                )}

                {!depreciationList && (
                  <button className="btn btn-save" onClick={fetchListingData} disabled={!formik.isValid}>
                    {t('LBL_SEARCH')}
                  </button>
                )}
                {depreciationList && (
                  <button className="btn cancel-btn" onClick={() => setDepreciationList(null)}>
                    {t('LBL_NEW_SEARCH')}
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              {depreciationList && (
                <Toolbar
                  setShow={setShow}
                  show={show}
                  refreshData={depreciationList && fetchListingData}
                  showSearch={false}
                  setShowMoreAction={setShowMoreAction}
                  canSelectAll={false}
                  bulkActionConfig={{
                    modelsEnumKey: 'DEPRECIATIONS',
                    isExport: true,
                  }}
                  searchPayload={searchPayload}
                />
              )}
              {!depreciationList && (
                <div className="row">
                  <div className="col-md-12">
                    <div className="card head-page">
                      <div className="row">
                        <div className="col-md-6">
                          <DateInput
                            formik={formik}
                            label="LBL_TO_DATE"
                            accessor="depreciationToDate"
                            mode="add"
                            isRequired={false}
                            disabled={false}
                            max={maxDate}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {depreciationList && (
                <>
                  {show === 'table' && windosSize[0] > 1200 && (
                    <Table
                      fields={fields}
                      data={depreciationList.data || []}
                      total={depreciationList.total || 0}
                      feature={feature}
                      subFeature={subFeature}
                      hasBulkActions={false}
                      hasActions={true}
                      isPagination={false}
                    >
                      {depreciationList.data &&
                        depreciationList.data.length > 0 &&
                        depreciationList.data.map(record => {
                          return (
                            <TableModalRow
                              key={record.id}
                              record={record}
                              fields={fields}
                              refreshData={fetchListingData}
                              feature={feature}
                              subFeature={subFeature}
                              isViewable={true}
                              isDeletable={false}
                              isEditable={false}
                              hasBulkActions={false}
                              customIcons={[{ Component: RealizeIcon, onAction: realizeLineHandler, title: 'LBL_POST' }]}
                              onViewLine={viewLineHandler}
                            />
                          );
                        })}
                    </Table>
                  )}
                  {(show === 'card' || windosSize[0] <= 1200) && (
                    <CardsList total={depreciationList.total || 0} isPagination={false}>
                      {depreciationList.data &&
                        depreciationList.data.length > 0 &&
                        depreciationList.data.map(record => {
                          return (
                            <CardModal
                              key={record.id}
                              feature={feature}
                              subFeature={subFeature}
                              record={record}
                              title="fixedAsset.name"
                              subTitles={subTitles}
                              refreshData={fetchListingData}
                              label1={record.depreciationDate ? { value: record.depreciationDate } : null}
                              isViewable={true}
                              isDeletable={false}
                              isEditable={false}
                              customIcons={[{ Component: RealizeIcon, onAction: realizeLineHandler, title: 'LBL_POST' }]}
                              onViewLine={viewLineHandler}
                            />
                          );
                        })}
                    </CardsList>
                  )}
                  {showViewLine && (
                    <DepreciationLineModal
                      show={showViewLine}
                      setShow={setShowViewLine}
                      header={t('LBL_DEPRECIATION_LINE')}
                      line={selectedLine}
                      mode="view"
                      onRealizeLine={realizeLineHandler}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ListingDepreciations;
