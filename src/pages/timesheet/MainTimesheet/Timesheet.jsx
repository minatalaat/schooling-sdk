import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import BreadCrumb from '../../../components/ui/BreadCrumb';
import Table from '../../../components/ListingTable/Table';
import TableRow from '../../../components/ListingTable/TableRow';
import CardsList from '../../../components/CardsList/CardsList';
import Card from '../../../components/CardsList/Card';
import Spinner from '../../../components/Spinner/Spinner';
import Toolbar from '../../../parts/Toolbar';
import NoData from '../../../components/NoData';
import NoTimeSheetsImg from '../../../assets/images/icons/Products.svg';
import MoreAction from '../../../parts/MoreAction';
import Calendar from '../../../components/ui/Calendar';
import SaveButton from '../../../components/ui/buttons/SaveButton';

import { useAxiosFunction } from '../../../hooks/useAxios';
import { MODELS } from '../../../constants/models';
import { getActionWithSlashUrl, getSearchUrl } from '../../../services/getUrl';
import { useFeatures } from '../../../hooks/useFeatures';
import useMetaFields from '../../../hooks/metaFields/useMetaFields';
import { alertsActions } from '../../../store/alerts';

const Timesheet = () => {
  const feature = 'HR_MANAGEMENT';
  const subFeature = 'MY_TIMESHEETS';
  const navigate = useNavigate();
  const { t } = useTranslation();
  let userId = useSelector(state => state.userFeatures.id);
  const statusSelect = useMetaFields('hrs.timesheet.status.select').list;
  const { getFeaturePath } = useFeatures();
  const { api } = useAxiosFunction();
  const [isLoading, setIsLoading] = useState(false);
  const { canDelete } = useFeatures(feature, subFeature);
  const dispatch = useDispatch();

  const [currentTimesheetID, setCurrentTimesheetID] = useState(null);
  const [searchParams] = useSearchParams();

  const [timesheets, setTimesheets] = useState(null);
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
    fields: ['fromDate', 'statusSelect', 'sentDate', 'toDate', 'company'],
    sortBy: ['-fromDate'],
    data: {
      _domain: 'self.employee.user.id = :user_id',
      _domainContext: {
        user_id: userId ? userId : null,
        _id: null,
        _model: MODELS.TIMESHEET,
      },
      operator: 'and',
      criteria: [],
    },
    limit: pageSize,
    offset: offset,
    translate: true,
  };

  const searchPayloadwithValue = {
    fields: ['fromDate', 'statusSelect', 'sentDate', 'toDate', 'company'],
    sortBy: ['-fromDate'],
    data: {
      _domain: 'self.employee.user.id = :user_id',
      _domainContext: {
        user_id: userId ? userId : null,
        _id: null,
        _model: MODELS.TIMESHEET,
      },
      operator: 'or',
      criteria: [
        {
          fieldName: 'company.name',
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
    { accessor: 'name', Header: t('LBL_FROM_DATE'), type: 'text' },
    { accessor: 'toDate', Header: t('LBL_TO_DATE'), type: 'text' },
    { accessor: 'statusSelect', Header: t('LBL_STATUS'), type: 'text', translate: true },
  ];

  const subTitles = [
    { label: 'LBL_FROM_DATE', key: 'name' },
    { label: 'LBL_TO_DATE', key: 'toDate' },
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
    setIsLoading(true);
    getTimesheets();
  }, [searchParams]);

  const getDefaultTimeSheetData = async () => {
    const defaultTimeSheetDataResponse = await api('POST', getActionWithSlashUrl('edit.timesheet'), {
      model: 'com.axelor.meta.db.MetaAction',
    });
    let data = defaultTimeSheetDataResponse.data.data[0];
    setCurrentTimesheetID(
      data
        ? data.view
          ? data.view.context
            ? data.view.context['_showRecord']
              ? data.view.context['_showRecord']
              : null
            : null
          : null
        : null
    );
  };

  useEffect(() => {
    getDefaultTimeSheetData();
    // getTimesheets();
  }, []);

  const getTimesheets = () => {
    // setIsLoading(true);

    if (searchValue === '') {
      // setTimesheets([]);
      setIsLoading(true);
    }

    let payload = searchValue && searchValue !== '' ? searchPayloadwithValue : searchPayload;
    api('POST', getSearchUrl(MODELS.TIMESHEET), payload, onTimesheetsSearchSuccess);
  };

  const onTimesheetsSearchSuccess = response => {
    let status = response.data.status;
    let data = response.data.data;
    let total = response.data.total;

    if (status !== 0 || total === undefined || total === null) {
      setTimesheets([]);
      return alertHandler('Error', t('LBL_ERROR_LOADING_TIMESHEETS'));
    }

    setTotal(total);

    if (data === undefined || data === null) {
      setTimesheets([]);
    }

    if (data) {
      let tempData = [];
      data.forEach(item => {
        let listItem = { ...item };
        listItem.name = item?.fromDate || '';
        listItem.statusSelect = statusSelect[listItem.statusSelect - 1].label;
        tempData.push(listItem);
      });
      setTimesheets(tempData);
    }

    setIsLoading(false);
  };

  return (
    <>
      {actionInProgress && <div className="lodingpage"></div>}
      {isLoading && <Spinner />}
      {((!isLoading && searchValue !== '') || (timesheets && timesheets.length > 0)) && (
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
                  <h4>{t('LBL_MY_TIMESHEETS')}</h4>
                </div>
                <div className="reverse-page float-end">
                  <SaveButton
                    text="LBL_COMPLETE_MY_TIMESHEET"
                    onClick={() => {
                      if (currentTimesheetID) {
                        navigate(getFeaturePath(subFeature, 'edit', { id: parseInt(currentTimesheetID) }));
                      } else {
                        navigate(getFeaturePath(subFeature, 'edit', { id: 0 }));
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <Toolbar
                  show={show}
                  setShow={setShow}
                  refreshData={getTimesheets}
                  setShowMoreAction={setShowMoreAction}
                  checked={checked}
                  setChecked={setChecked}
                  data={timesheets}
                  setActionInProgress={setActionInProgress}
                  bulkActionConfig={{
                    canDelete: canDelete,
                    deleteSuccessMessage: 'LBL_TIMESHEET_DELETED_SUCCESS',
                    modelsEnumKey: 'TIMESHEET',
                  }}
                />
                {!isLoading && show === 'table' && windowSize[0] > 1200 && (
                  <Table
                    fields={fields}
                    data={timesheets}
                    total={total}
                    checked={checked}
                    setChecked={setChecked}
                    feature={feature}
                    subFeature={subFeature}
                  >
                    {timesheets.length > 0 &&
                      timesheets.map(record => {
                        return (
                          <TableRow
                            record={record}
                            fields={fields}
                            deleteModel={MODELS.TIMESHEET}
                            refreshData={getTimesheets}
                            checked={checked}
                            setChecked={setChecked}
                            setActionInProgress={setActionInProgress}
                            feature={feature}
                            subFeature={subFeature}
                            isEditable={record && (record.statusSelect === 'LBL_DRAFT' || record.statusSelect === 'LBL_WAITING_VALIDATION')}
                            isDeletable={
                              record && (record.statusSelect === 'LBL_DRAFT' || record.statusSelect === 'LBL_WAITING_VALIDATION')
                            }
                          />
                        );
                      })}
                  </Table>
                )}
                {!isLoading && (show === 'card' || windowSize[0] <= 1200) && (
                  <CardsList total={total}>
                    {timesheets &&
                      timesheets.map(record => {
                        return (
                          <Card
                            feature={feature}
                            subFeature={subFeature}
                            record={record}
                            title="fromDate"
                            subTitles={subTitles}
                            deleteModel={MODELS.TIMESHEET}
                            refreshData={getTimesheets}
                            setActionInProgress={setActionInProgress}
                            checked={checked}
                            setChecked={setChecked}
                            label1={{ value: record.statusSelect }}
                            isEditable={record && (record.statusSelect === 'LBL_DRAFT' || record.statusSelect === 'LBL_WAITING_VALIDATION')}
                            isDeletable={
                              record && (record.statusSelect === 'LBL_DRAFT' || record.statusSelect === 'LBL_WAITING_VALIDATION')
                            }
                            // label2={record.technicalTypeSelect === 3 ? { value: record.technicalType } : null}
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
          refreshData={getTimesheets}
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          checked={checked}
          setChecked={setChecked}
          data={timesheets}
          setActionInProgress={setActionInProgress}
          alertHandler={alertHandler}
          bulkActionConfig={{
            canDelete: canDelete,
            deleteSuccessMessage: 'LBL_TIMESHEET_DELETED_SUCCESS',
            modelsEnumKey: 'TIMESHEET',
          }}
        />
      )}
      {!isLoading && timesheets && timesheets.length === 0 && searchValue === '' && (
        <NoData
          imgSrc={NoTimeSheetsImg}
          noDataMessage={t('NO_TIMESHEETS_DATA_MESSAGE')}
          startAddMessage={null}
          showAdd={true}
          addButtontext={t('LBL_COMPLETE_MY_TIMESHEET')}
          addButtonPath={
            currentTimesheetID
              ? getFeaturePath(subFeature, 'edit', { id: currentTimesheetID })
              : getFeaturePath(subFeature, 'edit', { id: 0 })
          }
        />
      )}
    </>
  );
};

export default Timesheet;
