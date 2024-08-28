import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import Table from '../../../components/ListingTable/Table.jsx';
import TableRow from '../../../components/ListingTable/TableRow.jsx';
import CardsList from '../../../components/CardsList/CardsList.jsx';
import Card from '../../../components/CardsList/Card.jsx';
import Toolbar from '../../../components/Toolbar/Toolbar.jsx';
import MoreAction from '../../../components/ui/MoreAction/MoreAction.jsx';
import ImportData from '../../../components/Toolbar/ImportFileData.jsx';
import { useStudentsServices } from '../../../services/apis/useStudentsServices.js';
import SuccessPopup from '../../../components/modals/SuccessPopup.jsx';
import CircleSkeleton from '../../../components/ui/skeletons/CircleSkeleton.jsx';
import FailPopup from '../../../components/modals/FailPopup.jsx';

const StudentsList = () => {
  const [searchParams] = useSearchParams();
  const { fetchStudents, deleteStudent, importStudents } = useStudentsServices();

  const feature = 'SCHOOLING';
  const subFeature = 'STUDENTS';

  const { t } = useTranslation();
  const [actionInProgress, setActionInProgress] = useState(false);
  const [show, setShow] = useState('table');
  const [checked, setChecked] = useState([]);
  const [windosSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [fetchedData, setFetchedData] = useState([]);
  const [successPopup, setSuccessPopup] = useState(false);
  const [failPopup, setFailPopup] = useState(false);

  const [loading, setLoading] = useState(true);

  const fields = [
    { accessor: 'id', Header: t('LBL_CODE'), type: 'text' },
    { accessor: 'name', Header: t('LBL_NAME'), type: 'text' },
    { accessor: 'national_id', Header: t('LBL_STUDENT_NATIONAL_ID'), type: 'text' },
    { accessor: 'parent_name', Header: t('LBL_PARANT_NAME'), type: 'text' },
    { accessor: 'parent_national_id', Header: t('LBL_PARANT_NATIONAL_ID'), type: 'text' },
    { accessor: 'parent_phone_number', Header: t('LBL_PARANT_PHONE_NUMBER'), type: 'text' },
  ];

  const subTitles = [
    { key: 'national_id', label: 'LBL_STUDENT_NATIONAL_ID' },
    { key: 'parent_name', label: 'LBL_PARANT_NAME' },
    { key: 'parent_national_id', label: 'LBL_PARANT_NATIONAL_ID' },
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
    const data = await fetchStudents(
      {
        keyword: searchParams.get('search'),
        page: searchParams.get('currentPage') > 0 ? searchParams.get('currentPage') - 1 : 0,
        size: searchParams.get('pageSize'),
      },
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
      setActionInProgress(false)
    };

    if (checked?.length > 0) {
      deleteStudent(
        {
          records: modifiedArray,
        },
        successHandler
      );
      setActionInProgress(false)
    } else {
      deleteStudent(
        {
          records: [{ id }],
        },
        successHandler
      );
      setActionInProgress(false)
    }
  };

  const handelImportStudents = async file => {
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    const successHandler = () => {
      setLoading(false);

      setSuccessPopup(true);
      setFetchedData(preState => {
        return { ...preState, data: [...preState.data, ...data] };
      });
    };

    const errorHandler = () => {
      setLoading(false);
      setFailPopup(true);
    };

    const data = await importStudents(formData, successHandler, errorHandler);
  };

  return (
    <>
     {actionInProgress && <div className="lodingpage"></div>}
      <MoreAction
        showMoreAction={showMoreAction}
        setShowMoreAction={setShowMoreAction}
        checked={checked}
        setChecked={setChecked}
        data={fetchedData?.data || []}
        setActionInProgress={setActionInProgress}
      />

      {!loading ? (
        <div className="page-body">
          <div className="container-fluid">
            <div className="row"></div>
            <div className="row">
              <div className="col-md-12 mb-4">
                <div className="info-tite-page float-start">
                  <h4>{t('LBL_STUDENTS')}</h4>
                </div>

                <div className="reverse-page float-end">
                  <ImportData title={t('LBL_IMPORT_STUDENT')} setData={handelImportStudents} />
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
                  data={fetchedData?.data || []}
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
                    data={fetchedData?.data || []}
                    total={fetchedData?.total || 0}
                    checked={checked}
                    setChecked={setChecked}
                    feature={feature}
                    subFeature={subFeature}
                  >
                    {fetchedData?.data &&
                      fetchedData?.data.length > 0 &&
                      fetchedData?.data.map(record => {
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
                            setActionInProgress={setActionInProgress}
                          />
                        );
                      })}
                  </Table>
                )}
                {(show === 'card' || windosSize[0] <= 1200) && (
                  <CardsList total={fetchedData?.total || 0}>
                    {fetchedData?.data &&
                      fetchedData?.data.length > 0 &&
                      fetchedData?.data.map(record => {
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
                            isEditable={false}
                            deleteHandler={deleteHandler}
                            setActionInProgress={setActionInProgress}                          />
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
