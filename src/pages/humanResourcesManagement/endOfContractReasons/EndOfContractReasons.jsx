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
import { alertsActions } from '../../../store/alerts';

import NoProductsImg from '../../../assets/images/icons/Products.svg';

const EndOfContractReasons = () => {
  const feature = 'HR_MANAGEMENT';
  const subFeature = 'END_OF_CONTRACT_REASONS';

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getFeaturePath } = useFeatures();
  const { api } = useAxiosFunction();
  const { canAdd, canDelete } = useFeatures(feature, subFeature);
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(true);
  const [endOfContractReasons, setEndOfContractReasons] = useState([]);
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

  const fields = [{ accessor: 'reason', Header: t('LBL_REASON'), type: 'text' }];

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
    getEndOfContractReasons();
  }, [searchParams]);

  const searchPayload = {
    fields: ['reason'],
    sortBy: null,
    data: {
      _domain: null,
      _domainContext: {
        _id: null,
        _model: MODELS.END_OF_CONTRACT_REASON,
      },
    },
    limit: pageSize,
    offset: offset,
    translate: true,
  };

  const searchPayloadwithValue = {
    fields: ['reason'],
    sortBy: null,
    data: {
      _domain: null,
      _domainContext: {
        _id: null,
        _model: MODELS.END_OF_CONTRACT_REASON,
      },
      operator: 'or',
      criteria: [
        {
          fieldName: 'reason',
          operator: 'like',
          value: searchValue,
        },
      ],
    },
    limit: pageSize,
    offset: offset,
    translate: true,
  };

  const getEndOfContractReasons = async () => {
    if (searchValue === '') {
      setEndOfContractReasons([]);
      setIsLoading(true);
    }

    let payload = searchValue && searchValue !== '' ? searchPayloadwithValue : searchPayload;
    let response = await api('POST', getSearchUrl(MODELS.END_OF_CONTRACT_REASON), payload);
    let status = response.data.status;
    let data = response.data.data;
    let total = response.data.total;
    setIsLoading(false);

    if (status !== 0 || total === undefined || total === null) {
      setEndOfContractReasons([]);
      return alertHandler('Error', t('LBL_ERROR_LOADING_END_OF_CONTRACT_REASONS'));
    }

    setTotal(total);

    if (data === undefined || data === null) {
      setEndOfContractReasons([]);
    }

    if (data) {
      setEndOfContractReasons(data);
    }
  };

  return (
    <>
      {actionInProgress && <div className="lodingpage"></div>}
      {isLoading && <Spinner />}
      {((!isLoading && searchValue !== '') || (endOfContractReasons && endOfContractReasons.length > 0)) && (
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
                  <h4>{t('LBL_END_OF_CONTRACT_REASONS')}</h4>
                </div>

                {canAdd && (
                  <div className="reverse-page float-end">
                    <PrimaryButton
                      theme="purpleWithIcon"
                      text="LBL_ADD_END_OF_CONTRACT_REASON"
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
                  refreshData={getEndOfContractReasons}
                  setShowMoreAction={setShowMoreAction}
                  checked={checked}
                  setChecked={setChecked}
                  data={endOfContractReasons}
                  setActionInProgress={setActionInProgress}
                  bulkActionConfig={{
                    canDelete: canDelete,
                    modelsEnumKey: 'END_OF_CONTRACT_REASONS',
                  }}
                />
                {!isLoading && show === 'table' && windowSize[0] > 1200 && (
                  <Table
                    fields={fields}
                    data={endOfContractReasons}
                    total={total}
                    checked={checked}
                    setChecked={setChecked}
                    feature={feature}
                    subFeature={subFeature}
                  >
                    {endOfContractReasons.length > 0 &&
                      endOfContractReasons.map(record => {
                        return (
                          <TableRow
                            key={record.id}
                            record={record}
                            fields={fields}
                            deleteModel={MODELS.END_OF_CONTRACT_REASON}
                            refreshData={getEndOfContractReasons}
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
                    {endOfContractReasons &&
                      endOfContractReasons.map(record => {
                        return (
                          <Card
                            key={record.id}
                            feature={feature}
                            subFeature={subFeature}
                            record={record}
                            title="name"
                            deleteModel={MODELS.END_OF_CONTRACT_REASON}
                            refreshData={getEndOfContractReasons}
                            setActionInProgress={setActionInProgress}
                            checked={checked}
                            setChecked={setChecked}
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
          refreshData={getEndOfContractReasons}
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          checked={checked}
          setChecked={setChecked}
          data={endOfContractReasons}
          alertHandler={alertHandler}
          setActionInProgress={setActionInProgress}
          bulkActionConfig={{
            canDelete: canDelete,
            modelsEnumKey: 'END_OF_CONTRACT_REASONS',
          }}
        />
      )}
      {!isLoading && endOfContractReasons && endOfContractReasons.length === 0 && searchValue === '' && (
        <NoData
          imgSrc={NoProductsImg}
          noDataMessage={t('NO_END_OF_CONTRACT_REASONS_DATA_MESSAGE')}
          showAdd={canAdd}
          addButtontext={t('LBL_ADD_END_OF_CONTRACT_REASON')}
          addButtonPath={getFeaturePath(subFeature, 'add')}
        />
      )}
    </>
  );
};

export default EndOfContractReasons;
