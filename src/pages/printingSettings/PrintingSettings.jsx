import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import BreadCrumb from '../../components/ui/BreadCrumb';
import Table from '../../components/ListingTable/Table';
import TableRow from '../../components/ListingTable/TableRow';
import CardsList from '../../components/CardsList/CardsList';
import Card from '../../components/CardsList/Card';
import Spinner from '../../components/Spinner/Spinner';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';
import Toolbar from '../../parts/Toolbar';
import MoreAction from '../../parts/MoreAction';
import NoData from '../../components/NoData';
import Calendar from '../../components/ui/Calendar';

import { useAxiosFunction } from '../../hooks/useAxios';
import { MODELS } from '../../constants/models';
import { getSearchUrl } from '../../services/getUrl';
import { useFeatures } from '../../hooks/useFeatures';
import { alertsActions } from '../../store/alerts';

import NoPrintingSettingsImg from '../../assets/images/icons/Priniting Settings.svg';

const PrintingSettings = () => {
  const feature = 'APP_CONFIG';
  const subFeature = 'PRINTING_SETTINGS';
  const navigate = useNavigate();
  const { api } = useAxiosFunction();
  const { canAdd, canDelete, getFeaturePath } = useFeatures(feature, subFeature);
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(true);
  const [printingSettings, setPrintingSettings] = useState([]);
  const [displayedSettings, setDisplayedSettings] = useState([]);
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

  const searchPayload = useMemo(() => {
    let payload = '';

    if (searchValue && searchValue !== '') {
      payload = {
        fields: ['name', 'pdfHeader'],
        sortBy: ['-id'],
        data: {
          _domain: null,
          _domainContext: {
            _id: null,
            _model: MODELS.PRINTING_SETTINGS,
          },
          operator: 'or',
          criteria: [
            {
              fieldName: 'name',
              operator: 'like',
              value: searchValue,
            },
          ],
          _searchText: searchValue,
          _domains: [],
        },
        limit: pageSize,
        offset: offset,
        translate: true,
      };
    } else {
      payload = {
        fields: ['name', 'pdfHeader'],
        sortBy: ['id'],
        data: {
          _domain: null,
          _domainContext: {
            _id: null,
            _model: MODELS.PRINTING_SETTINGS,
          },
          operator: 'and',
          criteria: [],
        },
        limit: pageSize,
        offset: offset,
        translate: true,
      };
    }

    return payload;
  }, [searchValue, pageSize, offset]);

  const fields = [
    { accessor: 'id', Header: t('LBL_CODE'), type: 'text' },
    { accessor: 'name', Header: t('LBL_NAME'), type: 'text' },
  ];

  const subTitles = [{ label: 'LBL_COMPANY_HEADER', key: 'pdfHeader' }];

  const getPrintingSettings = () => {
    if (searchValue === '') {
      setPrintingSettings([]);
      setDisplayedSettings([]);
      setIsLoading(true);
    }

    api('POST', getSearchUrl(MODELS.PRINTING_SETTINGS), searchPayload, onPrintingSearchSuccess);
  };

  const onPrintingSearchSuccess = response => {
    let status = response.data.status;
    let data = response.data.data;
    let total = response.data.total;
    setIsLoading(false);

    if (status !== 0 || total === undefined || total === null) {
      setPrintingSettings([]);
      setDisplayedSettings([]);
      return alertHandler('Error', t('LBL_ERROR_LOADING_PRINTING_SETTINGS'));
    }

    setTotal(total);

    if (data === undefined || data === null) {
      setPrintingSettings([]);
      setDisplayedSettings([]);
    }

    if (data) {
      setPrintingSettings(data);
      let tempData = [];
      data.forEach(item => {
        let listItem = { ...item };
        tempData.push(listItem);
      });
      setDisplayedSettings(tempData);
    }
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
    window.scrollTo(0, 0);
    setChecked([]);
    getPrintingSettings();
  }, [searchParams]);

  return (
    <>
      {actionInProgress && <div className="lodingpage"></div>}
      {isLoading && <Spinner />}
      {((!isLoading && searchValue !== '') || (printingSettings && printingSettings.length > 0)) && (
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
                  <h4>{t('LBL_PRINTING_SETTINGS')}</h4>
                </div>
                {canAdd && (
                  <div className="reverse-page float-end">
                    <PrimaryButton
                      theme="purpleWithIcon"
                      text="LBL_ADD_PRINTING_SETTING"
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
                  refreshData={getPrintingSettings}
                  setShowMoreAction={setShowMoreAction}
                  checked={checked}
                  setChecked={setChecked}
                  data={displayedSettings}
                  setActionInProgress={setActionInProgress}
                  bulkActionConfig={{
                    canDelete: canDelete,
                    deleteSuccessMessage: 'LBL_PRINTING_SETTINGS_DELETED',
                    modelsEnumKey: 'PRINTING_SETTINGS',
                    isExport: true,
                  }}
                  searchPayload={searchPayload}
                />
                {!isLoading && show === 'table' && windowSize[0] > 1200 && (
                  <Table
                    fields={fields}
                    data={displayedSettings}
                    total={total}
                    checked={checked}
                    setChecked={setChecked}
                    feature={feature}
                    subFeature={subFeature}
                  >
                    {displayedSettings.length > 0 &&
                      displayedSettings.map(record => {
                        return (
                          <TableRow
                            record={record}
                            fields={fields}
                            deleteModel={MODELS.PRINTING_SETTINGS}
                            refreshData={getPrintingSettings}
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
                    {displayedSettings &&
                      displayedSettings.map(record => {
                        return (
                          <Card
                            feature={feature}
                            subFeature={subFeature}
                            record={record}
                            title="name"
                            subTitles={subTitles}
                            deleteModel={MODELS.PRINTING_SETTINGS}
                            refreshData={getPrintingSettings}
                            setActionInProgress={setActionInProgress}
                            checked={checked}
                            setChecked={setChecked}
                            label1={record.id.toString().length > 0 ? { value: record.id.toString(), isTranslated: true } : null}
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
          refreshData={getPrintingSettings}
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          checked={checked}
          setChecked={setChecked}
          data={displayedSettings}
          alertHandler={alertHandler}
          setActionInProgress={setActionInProgress}
          bulkActionConfig={{
            canDelete: canDelete,
            deleteSuccessMessage: 'LBL_PRINTING_SETTINGS_DELETED',
            modelsEnumKey: 'PRINTING_SETTINGS',
          }}
        />
      )}
      {!isLoading && printingSettings && printingSettings.length === 0 && searchValue === '' && (
        <NoData
          imgSrc={NoPrintingSettingsImg}
          noDataMessage={t('NO_PRINTING_SETTINGS_DATA_MESSAGE')}
          addButtontext={t('LBL_ADD_PRINTING_SETTING')}
          addButtonPath={getFeaturePath('PRINTING_SETTINGS', 'add')}
          showAdd={canAdd}
        />
      )}
    </>
  );
};

export default PrintingSettings;
