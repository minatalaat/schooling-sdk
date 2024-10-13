import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useParams } from 'react-router-dom';
import Table from '../../../components/ListingTable/Table.jsx';
import TableRow from '../../../components/ListingTable/TableRow.jsx';
import CardsList from '../../../components/CardsList/CardsList.jsx';
import Card from '../../../components/CardsList/Card.jsx';
import Toolbar from '../../../components/Toolbar/Toolbar.jsx';
import MoreAction from '../../../components/ui/MoreAction/MoreAction.jsx';
import SuccessPopup from '../../../components/modals/SuccessPopup.jsx';
import CircleSkeleton from '../../../components/ui/skeletons/CircleSkeleton.jsx';
import FailPopup from '../../../components/modals/FailPopup.jsx';
import AddStudentToBusPopup from '../../../components/modals/AddStudentToBusPopup.jsx';
import { useClassesServices } from '../../../services/apis/useClassesServices.js';
import BackButton from '../../../components/ui/buttons/BackButton.jsx';

const StudentsAttendance = () => {
  const [searchParams] = useSearchParams();
  const { classId, studentId } = useParams();
  const { fetchStudentAttendance } = useClassesServices();

  const feature = 'SCHOOLING';
  const subFeature = 'CLASSES';

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

  const fields = [
    { accessor: 'date', Header: t('LBL_DATE'), type: 'text' },
    { accessor: 'checkInTime', Header: t('LBL_CHECK_IN_TIME'), type: 'text' },
  ];

  const subTitles = [
    { key: 'date', label: 'LBL_DATE' },
    { key: 'checkInTime', label: 'LBL_CHECK_IN_TIME' },
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
    const data = await fetchStudentAttendance(
      {
        keyword: searchParams.get('search'),
        page: searchParams.get('currentPage') > 0 ? searchParams.get('currentPage') - 1 : 0,
        size: searchParams.get('pageSize') || 10,
      },
      studentId,
      classId,
      () => setLoading(false)
    );
    setFetchedData(data);
  };

  useEffect(() => {
    importData();
  }, [searchParams]);

  //   const deleteHandler = id => {
  //     deleteStudentFromClass(schoolId, classId, { studentIds: [id] });
  //   };
  return (
    <>
      <MoreAction
        showMoreAction={showMoreAction}
        setShowMoreAction={setShowMoreAction}
        checked={checked}
        setChecked={setChecked}
        data={fetchedData.data || []}
      />

      {!loading ? (
        <div className="page-body">
          <div className="container-fluid">
            <div className="row"></div>
            <div className="row">
              <div className="col-md-12 mb-4">
                <div className="info-tite-page float-start">
                  <h4>{`${fetchedData?.data?.student?.name} ${t('LBL_ATTENDANCE')}`} </h4>
                </div>
                <div className="reverse-page float-end">
                  <BackButton text="LBL_BACK" />
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
                    canDelete: false,
                  }}
                  canSelectAll={false}
                />

                {show === 'table' && windosSize[0] > 1200 && (
                  <Table
                    hasActions={false}
                    hasBulkActions={false}
                    fields={fields}
                    data={fetchedData.data || []}
                    total={fetchedData.total || 0}
                    checked={checked}
                    setChecked={setChecked}
                    feature={feature}
                    subFeature={subFeature}
                  >
                    {fetchedData.data?.records &&
                      fetchedData.data?.records?.length > 0 &&
                      fetchedData.data?.records?.map(record => {
                        return (
                          <TableRow
                            hasBulkActions={false}
                            viewAttendace={true}
                            externalId={classId}
                            key={record}
                            keyIdentifier="id"
                            record={record}
                            fields={fields}
                            checked={checked}
                            setChecked={setChecked}
                            feature={feature}
                            subFeature={subFeature}
                            isEditable={false}
                            isViewable={false}
                            isDeletable={false}
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
                            key={record.studentId}
                            feature={feature}
                            subFeature={subFeature}
                            record={record}
                            title="name"
                            subTitles={subTitles}
                            checked={checked}
                            setChecked={setChecked}
                            isEditable={false}
                            isViewable={false}
                            isDeletable={false}
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

export default StudentsAttendance;
