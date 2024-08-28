import { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Table from '../../../components/ListingTable/Table';
import TableRow from '../../../components/ListingTable/TableRow';
import CardsList from '../../../components/CardsList/CardsList';
import Card from '../../../components/CardsList/Card';
import Toolbar from '../../../components/Toolbar/Toolbar';
import MoreAction from '../../../components/ui/MoreAction/MoreAction';
import AddButton from '../../../components/ui/buttons/AddButton';
import { featuresEnum } from '../../../constants/featuresEnum/featuresEnum';
import { useBusesServices } from '../../../services/apis/useBusesServices';
import CircleSkeleton from '../../../components/ui/skeletons/CircleSkeleton';
import { useFeatures } from '../../../hooks/useFeatures';
import { FEATURES } from '../../../constants/Features/features';
import SchoolingContext from '../../../context/SchoolingContext';

const BusesList = () => {
  const feature = 'SCHOOLING';
  const subFeature = 'BUSES';
  const [searchParams] = useSearchParams();
  const { baseRoute } = useContext(SchoolingContext);

  const navigate = useNavigate();
  const { t } = useTranslation();
  const { fetchBuses, deleteBus } = useBusesServices();
  const { canDelete } = useFeatures(feature, subFeature);
  const [actionInProgress, setActionInProgress] = useState(false);

  const [show, setShow] = useState('table');
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState([]);
  const [windosSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [fetchedData, setFetchedData] = useState({ data: [{ id: 1 }] });
  // console.log(fetchedData)
  const fields = [
    { accessor: 'id', Header: t('LBL_ID'), type: 'text' },
    { accessor: 'busModel.name', Header: t('LBL_MODE'), type: 'text' },
    { accessor: 'busOperator.username', Header: t('LBL_OPERATOR_NAME'), type: 'text' },
    { accessor: 'busOperator.phoneNumber', Header: t('LBL_PHONE_NUMBER'), type: 'text' },
    { accessor: 'state', Header: t('LBL_BUS_STATUE'), type: 'text' },
  ];

  const subTitles = [
    { key: 'id', label: 'ID' },
    { key: 'busModel.name', label: 'Mode' },
    { key: 'busOperator.username', label: 'Operator name' },
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

  const importData = async () => {
    setLoading(true);
    const data = await fetchBuses(
      {
        keyword: searchParams.get('search'),
        page: searchParams.get('currentPage') > 0 ? searchParams.get('currentPage') - 1 : 0,
        size: searchParams.get('pageSize') || 10,
      },
      () => {
        setLoading(false);
      }
    );
    setFetchedData(data);
  };

  useEffect(() => {
    importData();
  }, [searchParams]);
  const modifiedArray = checked?.map(obj => {
    return { id: obj.id };
  });

  const deleteHandler = id => {
    setLoading(true);

    const successHandler = () => {
      setLoading(false);
      importData();
    };

    if (checked?.length > 0) {
      deleteBus(
        {
          records: modifiedArray,
        },
        successHandler
      );
    } else {
      deleteBus(
        {
          records: [{ id }],
        },
        successHandler
      );
    }

    // deleteBus(id, successHandler);
  };

  return (
    <>
      {actionInProgress && <div className="lodingpage"></div>}

      <MoreAction
        showMoreAction={showMoreAction}
        setShowMoreAction={setShowMoreAction}
        checked={checked}
        setChecked={setChecked}
        data={fetchedData.data || []}
        deleteHandler={deleteHandler}
        setActionInProgress={setActionInProgress}
      />

      <div className="page-body">
        {loading ? (
          <div style={{ marginTop: '20rem' }}>
            <CircleSkeleton height="200" isNoData={true} />
          </div>
        ) : (
          <div className="container-fluid">
            <div className="row"></div>
            <div className="row">
              <div className="col-md-12 mb-4">
                <div className="info-tite-page float-start">
                  <h4>{t('LBL_BUSES')}</h4>
                </div>

                <div className="reverse-page float-end">
                  <AddButton
                    text="LBL_ADD_BUSES_BTN"
                    id="buttonid"
                    onClick={() => {
                      navigate(baseRoute + FEATURES[subFeature].BASE_PATH + '/add');
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
                  setShowMoreAction={setShowMoreAction}
                  checked={checked}
                  setChecked={setChecked}
                  data={fetchedData.data || []}
                  deleteHandler={deleteHandler}
                  filter={true}
                  refreshData={importData}
                  bulkActionConfig={{
                    canDelete: true,
                  }}
                  setActionInProgress={setActionInProgress}
                />

                {show === 'table' && windosSize[0] > 1200 && (
                  <Table
                    fields={fields}
                    data={fetchedData.data || []}
                    total={fetchedData.total || 0}
                    checked={checked}
                    setChecked={setChecked}
                    feature={feature}
                    subFeature={subFeature}
                  >
                    {fetchedData.data &&
                      fetchedData.data.length > 0 &&
                      fetchedData.data.map(record => {
                        return (
                          <TableRow
                            key={record.id}
                            record={record}
                            fields={fields}
                            checked={checked}
                            setChecked={setChecked}
                            feature={feature}
                            subFeature={subFeature}
                            deleteHandler={deleteHandler}
                            isDeletable={true}
                            isViewable={true}
                            isEditable={true}
                            setActionInProgress={setActionInProgress}
                          />
                        );
                      })}
                  </Table>
                )}
                {(show === 'card' || windosSize[0] <= 1200) && (
                  <CardsList total={fetchedData.total || 0}>
                    {fetchedData.data &&
                      fetchedData.data.length > 0 &&
                      fetchedData.data.map(record => {
                        return (
                          <Card
                            key={record.id}
                            feature={feature}
                            subFeature={subFeature}
                            record={record}
                            title="name"
                            subTitles={subTitles}
                            checked={checked}
                            setChecked={setChecked}
                            deleteHandler={deleteHandler}
                            setActionInProgress={setActionInProgress}
                          />
                        );
                      })}
                  </CardsList>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BusesList;
