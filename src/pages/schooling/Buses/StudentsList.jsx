import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useParams } from 'react-router-dom';
import Table from '../../../components/ListingTable/Table';
import TableRow from '../../../components/ListingTable/TableRow';
import CardsList from '../../../components/CardsList/CardsList';
import Card from '../../../components/CardsList/Card';
import Toolbar from '../../../components/Toolbar/Toolbar';
import MoreAction from '../../../components/ui/MoreAction/MoreAction';
import SuccessPopup from '../../../components/modals/SuccessPopup';
import CircleSkeleton from '../../../components/ui/skeletons/CircleSkeleton';
import FailPopup from '../../../components/modals/FailPopup';
import { useBusesServices } from '../../../services/apis/useBusesServices.js';
import PrimaryButton from '../../../components/ui/buttons/PrimaryButton';
import AddStudentToBusPopup from '../../../components/modals/AddStudentToBusPopup';

const StudentsList = () => {
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  const { fetchBusStudent, deleteBusStudent } = useBusesServices();

  const feature = 'SCHOOLING';
  const subFeature = 'STUDENTS';
  const { t } = useTranslation();

  const [show, setShow] = useState('table');
  const [checked, setChecked] = useState([]);
  const [windosSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [fetchedData, setFetchedData] = useState([]);
  const [successPopup, setSuccessPopup] = useState(false);
  const [failPopup, setFailPopup] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState(false);

  const fields = [
    { accessor: 'studentId', Header: t('LBL_CODE'), type: 'text' },
    { accessor: 'participantName', Header: t('LBL_NAME'), type: 'text' },
    { accessor: 'nationalId', Header: t('LBL_STUDENT_NATIONAL_ID'), type: 'text' },
    { accessor: 'parentName', Header: t('LBL_PARANT_NAME'), type: 'text' },
    { accessor: 'parentNationalId', Header: t('LBL_PARANT_NATIONAL_ID'), type: 'text' },
    { accessor: 'parentPhoneNumber', Header: t('LBL_PARANT_PHONE_NUMBER'), type: 'text' },
  ];

  const subTitles = [
    { key: 'id', label: 'LBL_CODE' },
    { key: 'participantName', label: 'LBL_NAME' },
    { key: 'studentId', label: 'LBL_STUDENT_NATIONAL_ID' },
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
    const data = await fetchBusStudent(
      {
        keyword: searchParams.get('search'),
        page: searchParams.get('currentPage') > 0 ? searchParams.get('currentPage') - 1 : 0,
        size: searchParams.get('pageSize') || 10,
      },
      id,
      () => setLoading(false)
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
      deleteBusStudent(
        {
          records: modifiedArray,
        },
        successHandler
      );
    } else {
      deleteBusStudent(
        {
          records: [{ id }],
        },
        successHandler
      );
    }
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

      {!loading ? (
        <div className="page-body">
          <div className="container-fluid">
            <div className="row"></div>
            <div className="row">
              <div className="col-md-12 mb-4">
                <div className="info-tite-page float-start">
                  <h4>{t('LBL_BUS_STUDENTS_LIST')}</h4>
                </div>
                <div className="reverse-page float-end">
                  {/* <ImportData title={t('LBL_IMPORT_STUDENT')} setData={handelImportStudents} /> */}
                  <PrimaryButton
                    text={t('LBL_ADD_STUDENT_TO_BUS')}
                    theme="purpleWithIcon"
                    onClick={() => setShowAddStudent(true)}
                    disabled={false}
                  />
                </div>
                {showAddStudent && (
                  <AddStudentToBusPopup
                    onClickHandler={() => setShowAddStudent(false)}
                    onSuccess={importData}
                    setShowAddStudent={setShowAddStudent}
                  />
                )}
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
                            key={record}
                            keyIdentifier="studentId"
                            record={record}
                            fields={fields}
                            checked={checked}
                            setChecked={setChecked}
                            feature={feature}
                            subFeature={subFeature}
                            isEditable={false}
                            deleteHandler={deleteHandler}
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
                            keyIdentifier="studentId"
                            key={record.studentId}
                            feature={feature}
                            subFeature={subFeature}
                            record={record}
                            title="name"
                            subTitles={subTitles}
                            checked={checked}
                            setChecked={setChecked}
                            isEditable={false}
                            deleteHandler={deleteHandler}
                            setActionInProgress={setActionInProgress}

                          />
                        );
                      })}
                  </CardsList>
                )}

                {successPopup && <SuccessPopup setSuccessPopup={setSuccessPopup} item="" onClickHandler={() => {}} />}
                {failPopup && <FailPopup setFailPopup={setFailPopup} item="" onClickHandler={() => {}} />}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: '20rem' }}>
          <CircleSkeleton height="200" isNoData={true} />
        </div>
      )}
    </>
  );
};

export default StudentsList;
