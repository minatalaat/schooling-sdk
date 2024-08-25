import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import Toolbar from '../../../parts/Toolbar';
import NoData from '../../../components/NoData';
import MoreAction from '../../../parts/MoreAction';
import BreadCrumb from '../../../components/ui/BreadCrumb';
import Table from '../../../components/ListingTable/Table';
import TableRow from '../../../components/ListingTable/TableRow';
import CardsList from '../../../components/CardsList/CardsList';
import Card from '../../../components/CardsList/Card';
import Spinner from '../../../components/Spinner/Spinner';
import PrimaryButton from '../../../components/ui/buttons/PrimaryButton';
import Calendar from '../../../components/ui/Calendar';

import { useAxiosFunction } from '../../../hooks/useAxios';
import { MODELS } from '../../../constants/models';
import { getSearchUrl } from '../../../services/getUrl';
import { useFeatures } from '../../../hooks/useFeatures';
import { AMENDMENT_TYPE_ENUMS, CONTRACT_STATUS_ENUMS } from '../../../constants/enums/HREnums';
import { alertsActions } from '../../../store/alerts';

import NoProductsImg from '../../../assets/images/icons/Products.svg';

const EmploymentContracts = () => {
  const feature = 'HR_MANAGEMENT';
  const subFeature = 'EMPLOYMENT_CONTRACTS';

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getFeaturePath } = useFeatures();
  const { api } = useAxiosFunction();
  const { canAdd, canDelete } = useFeatures(feature, subFeature);
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(true);
  const [contracts, setContracts] = useState([]);
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
    { accessor: 'employeeName', Header: t('LBL_EMPLOYEE'), type: 'text' },
    { accessor: 'contractTypeName', Header: t('LBL_CONTRACT_TYPE'), type: 'text' },
    { accessor: 'startDate', Header: t('LBL_START_DATE'), type: 'text' },
    { accessor: 'endDate', Header: t('LBL_END_DATE'), type: 'text' },
    { accessor: 'amendmentType', Header: t('LBL_AMENDMENT_TYPE'), type: 'text', translate: true },
    { accessor: 'status', Header: t('LBL_STATUS'), type: 'text', translate: true },
  ];

  const subTitles = [
    { label: 'LBL_CONTRACT_TYPE', key: 'contractTypeName' },
    { label: 'LBL_START_DATE', key: 'startDate' },
    { label: 'LBL_END_DATE', key: 'endDate' },
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
    getContracts();
  }, [searchParams]);

  const searchPayload = {
    fields: ['endDate', 'contractType', 'amendmentTypeSelect', 'employee', 'startDate', 'status'],
    sortBy: null,
    data: {
      _domain: null,
      _domainContext: {
        _id: null,
        _model: MODELS.EMPLOYMENT_CONTRACT,
      },
    },
    limit: pageSize,
    offset: offset,
    translate: true,
  };

  const searchPayloadwithValue = {
    fields: ['endDate', 'contractType', 'amendmentTypeSelect', 'employee', 'startDate', 'status'],
    sortBy: null,
    data: {
      _domain: null,
      _domainContext: {
        _id: null,
        _model: MODELS.EMPLOYMENT_CONTRACT,
      },
      operator: 'or',
      criteria: [
        {
          fieldName: 'employee',
          operator: 'like',
          value: searchValue,
        },
        {
          fieldName: 'contractType',
          operator: 'like',
          value: searchValue,
        },
      ],
    },
    limit: pageSize,
    offset: offset,
    translate: true,
  };

  const getContracts = async () => {
    if (searchValue === '') {
      setContracts([]);
      setIsLoading(true);
    }

    let payload = searchValue && searchValue !== '' ? searchPayloadwithValue : searchPayload;
    let response = await api('POST', getSearchUrl(MODELS.EMPLOYMENT_CONTRACT), payload);
    let status = response.data.status;
    let data = response.data.data;
    let total = response.data.total;
    setIsLoading(false);

    if (status !== 0 || total === undefined || total === null) {
      setContracts([]);
      return alertHandler('Error', t('LBL_ERROR_LOADING_CONTRACTS'));
    }

    setTotal(total);

    if (data === undefined || data === null) {
      setContracts([]);
    }

    if (data) {
      let tempData = [...data];
      tempData.forEach(item => {
        item.name = item?.employee?.name;
        item.employeeName = item?.employee?.name;
        item.contractTypeName = item?.contractType?.name;
        item.amendmentType = AMENDMENT_TYPE_ENUMS[item?.amendmentTypeSelect];
        item.status = CONTRACT_STATUS_ENUMS[item?.status];
      });
      setContracts(data);
    }
  };

  return (
    <>
      {actionInProgress && <div className="lodingpage"></div>}
      {isLoading && <Spinner />}
      {((!isLoading && searchValue !== '') || (contracts && contracts.length > 0)) && (
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
                  <h4>{t('LBL_EMPLOYMENT_CONTRACTS')}</h4>
                </div>

                {canAdd && (
                  <div className="reverse-page float-end">
                    <PrimaryButton
                      theme="purpleWithIcon"
                      text="LBL_ADD_EMPLOYMENT_CONTRACT"
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
                  refreshData={getContracts}
                  setShowMoreAction={setShowMoreAction}
                  checked={checked}
                  setChecked={setChecked}
                  data={contracts}
                  setActionInProgress={setActionInProgress}
                  bulkActionConfig={{
                    canDelete: canDelete,
                    modelsEnumKey: 'EMPLOYMENT_CONTRACTS',
                  }}
                />
                {!isLoading && show === 'table' && windowSize[0] > 1200 && (
                  <Table
                    fields={fields}
                    data={contracts}
                    total={total}
                    checked={checked}
                    setChecked={setChecked}
                    feature={feature}
                    subFeature={subFeature}
                  >
                    {contracts.length > 0 &&
                      contracts.map(record => {
                        return (
                          <TableRow
                            key={record.id}
                            record={record}
                            fields={fields}
                            deleteModel={MODELS.EMPLOYMENT_CONTRACT}
                            refreshData={getContracts}
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
                    {contracts &&
                      contracts.map(record => {
                        return (
                          <Card
                            key={record.id}
                            feature={feature}
                            subFeature={subFeature}
                            record={record}
                            title="employee.name"
                            subTitles={subTitles}
                            deleteModel={MODELS.EMPLOYMENT_CONTRACT}
                            refreshData={getContracts}
                            setActionInProgress={setActionInProgress}
                            checked={checked}
                            setChecked={setChecked}
                            label1={{ value: record.amendmentType }}
                            label2={{ value: record.status }}
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
          refreshData={getContracts}
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          checked={checked}
          setChecked={setChecked}
          data={contracts}
          alertHandler={alertHandler}
          setActionInProgress={setActionInProgress}
          bulkActionConfig={{
            canDelete: canDelete,
            modelsEnumKey: 'EMPLOYMENT_CONTRACTS',
          }}
        />
      )}
      {!isLoading && contracts && contracts.length === 0 && searchValue === '' && (
        <NoData
          imgSrc={NoProductsImg}
          noDataMessage={t('NO_CONTRACTS_DATA_MESSAGE')}
          showAdd={canAdd}
          addButtontext={t('LBL_ADD_EMPLOYMENT_CONTRACT')}
          addButtonPath={getFeaturePath(subFeature, 'add')}
        />
      )}
    </>
  );
};

export default EmploymentContracts;
