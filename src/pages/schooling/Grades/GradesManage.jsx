import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import ConfirmationPopup from '../../../components/modals/ConfirmationPopup';
import PrimaryButton from '../../../components/ui/buttons/PrimaryButton';
import CircleSkeleton from '../../../components/ui/skeletons/CircleSkeleton';
import GradesForm from './GradesForm';
import { useSchoolStudentServices } from '../../../services/apis/useSchoolStudentServices';
import moment from 'moment';

const GradesManage = ({ addNew, enableEdit }) => {
  const { fetchStudentGrades } = useSchoolStudentServices();
  const ref = useRef();
  const [showDelete, setShowDelete] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const { id } = useParams();

  const importData = async () => {
    setLoading(true);
    const data = await fetchStudentGrades(id, { year: moment().year() }, () => setLoading(false));
    setData(data);
  };

  useEffect(() => {
    if (id) importData();
  }, [id]);

  return (
    <>
      <div className="page-body">
        <div className="container-fluid">
          <div className="row"></div>
          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="reverse-page float-end">
                {(addNew || enableEdit) && (
                  <PrimaryButton
                    btnOptions={{
                      type: 'submit',
                    }}
                    disabled={false}
                  />
                )}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              {showDelete && (
                <ConfirmationPopup item={data?.name} onClickHandler={() => setShowDelete(false)} setConfirmationPopup={setShowDelete} />
              )}

              {loading ? (
                <div style={{ marginTop: '20rem' }}>
                  <CircleSkeleton height="200" isNoData={true} />
                </div>
              ) : (
                ((data && Object.keys(data).length > 0) || addNew) && (
                  <>
                    {!addNew && <GradesForm importData={importData} enableEdit={enableEdit} data={data} submitBtn={ref} />}
                    {addNew && <GradesForm addNew={addNew} submitBtn={ref} />}
                  </>
                )
              )}

              {/* {((data && Object.keys(data).length > 0) || addNew) && (
                <>
                  {!addNew && <StudentsForm enableEdit={enableEdit} data={data} submitBtn={ref} />}
                  {addNew && <StudentsForm addNew={addNew} submitBtn={ref} />}
                </>
              )} */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GradesManage;
