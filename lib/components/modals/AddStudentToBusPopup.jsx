import { useTranslation } from 'react-i18next';

import { useStudentsServices } from '../../services/apis/useStudentsServices';
import { useEffect, useState } from 'react';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import Toolbar from '../Toolbar/Toolbar.jsx';
import TableRow from '../ListingTable/TableRow.jsx';
import CardsList from '../CardsList/CardsList.jsx';
import Card from '../CardsList/Card.jsx';
import Table from '../ListingTable/Table.jsx';
import CircleSkeleton from '../ui/skeletons/CircleSkeleton.jsx';
import { useBusesServices } from '../../services/apis/useBusesServices.js';
import { useSchoolStudentServices } from '../../services/apis/useSchoolStudentServices.js';

const AddStudentToBusPopup = props => {
  const feature = 'SCHOOLING';
  const subFeature = 'STUDENTS';
  let setShowAddStudent = props.setShowAddStudent;
  let onSuccess = props.onSuccess;
  const { id, schoolId, classId } = useParams();
  const { t } = useTranslation();
  const location = useLocation();
  let currentPath = location.pathname;

  const submit = values => {
    // onClickHandler(onClickHandlerParams);
    const modifiedArray = checked?.map(obj => {
      return {
        studentId: obj.id,
      };
    });
    setShowAddStudent(false);

    const success = () => {
      setTimeout(() => onSuccess());
    };

    if (currentPath.includes('classes')) {
      //Add Students to Class if in class case
      const modifiedArray = checked?.map(obj => obj.id);
      addStudentToClass(
        schoolId,
        classId,
        {
          studentIds: [...modifiedArray],
        },
        success
      );
    } else {
      //Add Students to bus if in buses case
      addBusStudent(
        id,
        {
          students: modifiedArray,
        },
        success
      );
    }
  };

  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);

  const [fetchedData, setFetchedData] = useState([]);
  const [show, setShow] = useState('table');
  const [checked, setChecked] = useState([]);
  const [windosSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);
  const { fetchStudents } = useStudentsServices();
  const { addStudentToClass } = useSchoolStudentServices();
  const { addBusStudent } = useBusesServices();
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

  const importData = async () => {
    setLoading(true);

    const successHandler = () => {
      setLoading(false);
      // setSuccessPopup(true);
      // onSuccess();
      // setFetchedData(data);
    };

    const errorHandler = () => {
      setLoading(false);
      // setFailPopup(true);
    };

    const data = await fetchStudents(
      {
        keyword: searchParams.get('search'),
        page: searchParams.get('currentPage') > 0 ? searchParams.get('currentPage') - 1 : 0,
        size: searchParams.get('pageSize'),
      },
      successHandler,
      errorHandler
    );
    setFetchedData(data);
  };

  useEffect(() => {
    importData();
  }, [searchParams]);

  useEffect(() => {
    const handleWindowResize = () => {
      setWindowSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  });

  return (
    <div
      className="modal fade show"
      id="delete-row"
      aria-labelledby="exampleModalToggleLabel2"
      tabIndex="-1"
      aria-modal="true"
      role="dialog"
      style={{ display: 'block' }}
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '80%' }}>
        <div className="modal-content">
          <div className="modal-header">
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={() => setShowAddStudent(false)}
            ></button>
          </div>
          {loading ? (
            <div style={{ marginTop: '50px', marginBottom: '100px' }}>
              <CircleSkeleton height="200" isNoData={true} />
            </div>
          ) : (
            <div className="modal-body" style={{ padding: 0 }}>
              <h3 className="text-primary fw-normal fs-3">Add student to bus </h3>
              <hr />
              <>
                {/* <MoreAction
        showMoreAction={showMoreAction}
        setShowMoreAction={setShowMoreAction}
        checked={checked}
        setChecked={setChecked}
        data={fetchedData.data || []}
      /> */}

                {/* {!loading ? ( */}
                {/* <div className="page-body"> */}
                {/* <div className="container-fluid"> */}

                <div className="row ">
                  <div className=" mt-3" style={{ width: '100%' }}>
                    <Toolbar
                      show={show}
                      setShow={setShow}
                      showMore={false}
                      // setShowMoreAction={setShowMoreAction}
                      checked={checked}
                      setChecked={setChecked}
                      data={fetchedData.data || []}
                      filter={false}
                      refreshData={() => {}}
                      bulkActionConfig={{
                        canDelete: false,
                      }}
                    />

                    {show === 'table' && windosSize[0] > 1200 && (
                      <Table
                        customStyle={true}
                        fields={fields}
                        data={fetchedData.data || []}
                        total={fetchedData.total || 0}
                        checked={checked}
                        setChecked={setChecked}
                        feature={feature}
                        subFeature={subFeature}
                        hasActions={false}
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
                                isEditable={false}
                                isDeletable={false}
                                isViewable={false}
                                // deleteHandler={deleteHandler}
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
                                isEditable={false}
                                isDeletable={false}
                                isViewable={false}
                                // deleteHandler={deleteHandler}
                              />
                            );
                          })}
                      </CardsList>
                    )}

                    {/* 
                {successPopup && <SuccessPopup setSuccessPopup={setSuccessPopup} item={''} onClickHandler={() => {}} />}
                {failPopup && <FailPopup setFailPopup={setFailPopup} item={''} onClickHandler={() => {}} />} */}
                  </div>
                </div>
                {/* </div> */}
                {/* </div> */}
                {/* ) : (
        <div style={{ marginTop: '20rem' }}>
          <CircleSkeleton height="200" isNoData={true} />
        </div>
      )} */}
              </>

              <div className="row" style={{ justifyContent: 'center' }}>
                <div className="col-md-6" style={{ width: 'fit-content' }}>
                  <button
                    type="button"
                    className="btn btn-primary cancel-act"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                    onClick={() => setShowAddStudent(false)}
                    style={{ paddingInline: '40px' }}
                  >
                    {t('LBL_CANCEL')}
                  </button>
                </div>
                <div className="col-md-6" style={{ width: 'fit-content' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={submit}
                    style={{ paddingInline: '40px' }}
                    disabled={checked?.length === 0}
                  >
                    {t('LBL_CONFIRM')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddStudentToBusPopup;
