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
import SuccessPopup from '../../../components/modals/SuccessPopup.jsx';
import CircleSkeleton from '../../../components/ui/skeletons/CircleSkeleton.jsx';
import FailPopup from '../../../components/modals/FailPopup.jsx';
import { useSchoolStudentServices } from '../../../services/apis/useSchoolStudentServices.js';

const GradesList = () => {
  const [searchParams] = useSearchParams();
  const { fetchGrades, importGrades } = useSchoolStudentServices();

  const feature = 'SCHOOLING';
  const subFeature = 'GRADES';

  const { t } = useTranslation();

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
    { accessor: 'studentName', Header: t('LBL_STUDENT_NAME'), type: 'text' },
    { accessor: 'nationalId', Header: t('LBL_STUDENT_NATIONAL_ID'), type: 'text' },
    { accessor: 'totalGrade', Header: t('LBL_TOTAL_GRADE'), type: 'text' },
    { accessor: 'gradePoints', Header: t('LBL_GRADE_POINTS'), type: 'text' },
  ];

  const subTitles = [
    { key: 'studentName', label: 'LBL_STUDENT_NAME' },
    { key: 'nationalId', label: 'LBL_STUDENT_NATIONAL_ID' },
    { key: 'totalGrade', label: 'LBL_TOTAL_GRADE' },
    { key: 'gradePoints', label: 'LBL_GRADE_POINTS' },
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
    const data = await fetchGrades(
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

  const handelImportStudentGrade = async file => {
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

    const data = await importGrades(formData, successHandler, errorHandler);
  };

  return (
    <>
      <MoreAction
        showMoreAction={showMoreAction}
        setShowMoreAction={setShowMoreAction}
        checked={checked}
        setChecked={setChecked}
        data={fetchedData?.data || []}
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
                  <h4>{t('LBL_GRADES')}</h4>
                </div>

                <div className="reverse-page float-end">
                  <ImportData title={t('LBL_IMPORT_STUDENT_GRADE')} setData={handelImportStudentGrade} />
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
                  refreshData={importData}
                />

                <>
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
                              isEditable={false}
                              isDeletable={false}
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
                              isDeletable={false}
                            />
                          );
                        })}
                    </CardsList>
                  )}

                  {successPopup && <SuccessPopup setSuccessPopup={setSuccessPopup} item="" onClickHandler={() => {}} />}
                  {failPopup && <FailPopup setFailPopup={setFailPopup} item="" onClickHandler={() => {}} />}
                </>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default GradesList;
