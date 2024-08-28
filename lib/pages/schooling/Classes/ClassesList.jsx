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
import CircleSkeleton from '../../../components/ui/skeletons/CircleSkeleton';
import { useClassesServices } from '../../../services/apis/useClassesServices';
import { FEATURES } from '../../../constants/Features/features';
import SchoolingContext from '../../../context/SchoolingContext';

const ClassesList = () => {
  const feature = 'SCHOOLING';
  const subFeature = 'CLASSES';
  const [searchParams] = useSearchParams();
  const { baseRoute } = useContext(SchoolingContext);

  const navigate = useNavigate();
  const { t } = useTranslation();
  const { fetchClasses, deleteClass } = useClassesServices();
  const [actionInProgress, setActionInProgress] = useState(false);
  const [show, setShow] = useState('table');
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState([]);
  const [windosSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [fetchedData, setFetchedData] = useState({});
  // console.log(fetchedData)
  const fields = [
    { accessor: 'id', Header: t('LBL_ID'), type: 'text' },
    { accessor: 'name', Header: t('LBL_NAME'), type: 'text' },
    { accessor: 'grade.name', Header: t('LBL_GRADE'), type: 'text' },
    { accessor: 'numberOfStudents', Header: t('LBL_NUMBER_OF_STUDENTS'), type: 'text' },
  ];

  const subTitles = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'LBL_NAME' },
    { key: 'grade.name', label: 'LBL_GRADE' },
    { key: 'numberOfStudents', label: 'LBL_NUMBER_OF_STUDENTS' },
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
    const data = await fetchClasses(
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
      setLoading(false);
      setActionInProgress(false)
    };

    if (checked?.length > 0) {
      deleteClass(
        {
          records: modifiedArray,
        },
        successHandler
      );
      setLoading(false);
      setActionInProgress(false)
    } else {
      deleteClass(
        {
          records: [{ id }],
        },
        successHandler
      );
      setLoading(false);
      setActionInProgress(false)
    }
    // deleteClass(id, succesHandler);
  };

  return (
    <>
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
                  <h4>{t('LBL_CLASSES')}</h4>
                </div>

                <div className="reverse-page float-end">
                  <AddButton
                    text="LBL_ADD_CLASS_BTN"
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
                  filter={true}
                  deleteHandler={deleteHandler}
                  refreshData={importData}
                  setActionInProgress={setActionInProgress}
                  bulkActionConfig={{
                    canDelete: true,
                  }}
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
                            keyIdentifier="id"
                            navigationParams={{ schoolId: record['schoolId'], classId: record['id'] }}
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
                            isEditable={false}
                            viewStudentList={true}
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
                            keyIdentifier="id"
                            navigationParams={{ schoolId: record['schoolId'], classId: record['id'] }}
                            key={record.id}
                            feature={feature}
                            subFeature={subFeature}
                            record={record}
                            title="name"
                            subTitles={subTitles}
                            checked={checked}
                            setChecked={setChecked}
                            deleteHandler={deleteHandler}
                            viewStudentList={true}
                            isViewable={true}
                            isEditable={false}
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

export default ClassesList;
