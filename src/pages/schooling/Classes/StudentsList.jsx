import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useParams } from 'react-router-dom';
import Table from '../../../components/ListingTable/Table.jsx';
import TableRow from '../../../components/ListingTable/TableRow.jsx';
import CardsList from '../../../components/CardsList/CardsList.jsx';
import Card from '../../../components/CardsList/Card.jsx';
import Toolbar from '../../../components/Toolbar/Toolbar.jsx';
import MoreAction from '../../../components/ui/MoreAction/MoreAction.jsx';
import CircleSkeleton from '../../../components/ui/skeletons/CircleSkeleton.jsx';
import FailPopup from '../../../components/modals/FailPopup.jsx';
import PrimaryButton from '../../../components/ui/buttons/PrimaryButton.jsx';
import AddStudentToBusPopup from '../../../components/modals/AddStudentToBusPopup.jsx';
import { useSchoolStudentServices } from '../../../services/apis/useSchoolStudentServices.js';
import SuccessPopup from '../../../components/modals/SuccessPopup.jsx';

const StudentsList = () => {
  const [searchParams] = useSearchParams();
  const { schoolId, classId } = useParams();
  const { fetchClassStudents, deleteStudentFromClass } = useSchoolStudentServices();

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

  const fields = [
    { accessor: 'id', Header: t('LBL_CODE'), type: 'text' },
    { accessor: 'name', Header: t('LBL_STUDENT_NAME'), type: 'text' },
    { accessor: 'national_id', Header: t('LBL_STUDENT_NATIONAL_ID'), type: 'text' },
  ];

  const subTitles = [
    { key: 'id', label: 'LBL_CODE' },
    { key: 'name', label: 'LBL_STUDENT_NAME' },
    { key: 'national_id', label: 'LBL_STUDENT_NATIONAL_ID' },
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
    const data = await fetchClassStudents(
      {
        keyword: searchParams.get('search'),
        page: searchParams.get('currentPage') > 0 ? searchParams.get('currentPage') - 1 : 0,
        size: searchParams.get('pageSize') || 10,
      },
      schoolId,
      classId,
      () => setLoading(false)
    );
    setFetchedData(data);
  };

  useEffect(() => {
    importData();
  }, [searchParams]);

  const modifiedArray = checked?.map(obj => obj?.id);

  const deleteHandler = async id => {
    setLoading(true);

    if (checked?.length > 0) {
      const data = await deleteStudentFromClass(schoolId, classId, { records: modifiedArray }, () => setLoading(false));
      setFetchedData(data);
    } else {
      const data = await deleteStudentFromClass(schoolId, classId, { records: [id] }, () => setLoading(false));
      setFetchedData(data);
    }

    const successHandler = () => {
      setLoading(false);
      importData();
    };

    if (checked?.length > 0) {
      deleteStudentFromClass(
        {
          records: modifiedArray,
        },
        successHandler
      );
    } else {
      deleteStudentFromClass(
        {
          records: [{ id }],
        },
        successHandler
      );
    }
  };

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
                  <h4>{t('LBL_CLASS_STUDENT_LIST')} </h4>
                </div>
                <div className="reverse-page float-end">
                  {/* <ImportData title={t('LBL_IMPORT_STUDENT')} setData={handelImportStudents} /> */}
                  <PrimaryButton
                    text={t('LBL_ADD_STUDENT_TO_CLASS')}
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
                  refreshData={() => {}}
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
                            viewAttendace={true}
                            navigationParams={{ studentId: record['id'], classId: classId, id: record['id'] }}
                            key={record}
                            keyIdentifier="id"
                            record={record}
                            fields={fields}
                            checked={checked}
                            setChecked={setChecked}
                            feature={feature}
                            subFeature={subFeature}
                            isEditable={false}
                            deleteHandler={deleteHandler}
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
                            viewAttendace={true}
                            navigationParams={{ studentId: record['id'], classId: classId, id: record['id'] }}
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
