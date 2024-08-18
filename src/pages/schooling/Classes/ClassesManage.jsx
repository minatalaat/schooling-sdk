import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';
import ConfirmationPopup from '../../../components/modals/ConfirmationPopup';
import BackButton from '../../../components/ui/buttons/BackButton';
import PrimaryButton from '../../../components/ui/buttons/PrimaryButton';
import CircleSkeleton from '../../../components/ui/skeletons/CircleSkeleton';
import { useSchoolStudentServices } from '../../../services/apis/useSchoolStudentServices';
import { useClassesServices } from '../../../services/apis/useClassesServices';
import ClassesForm from './ClassesForm';

const ClassesManage = ({ addNew, enableEdit }) => {
  const { t } = useTranslation();
  const btnRef = useRef(null);
  const { fetchClassStudents } = useSchoolStudentServices();
  const { fetchClass } = useClassesServices();
  const [showDelete, setShowDelete] = useState(false);
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({});

  const { schoolId, classId } = useParams();

  const importData = async () => {
    setLoading(true);
    const data = await fetchClassStudents(schoolId, classId, () => setLoading(false));
    setData(data);
  };

  const importClassData = async () => {
    setLoading(true);

    const data = await fetchClass(classId, () => setLoading(false));
    setData(data);
  };

  useEffect(() => {
    if (schoolId) importData();
  }, [schoolId]);

  useEffect(() => {
    if (classId) importClassData();
  }, [classId]);
  const location = useLocation();
  const editPage = location.pathname.includes('edit');
  return (
    <>
      <div className="page-body">
        <div className="container-fluid">
          <div className="row"></div>
          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{addNew ? t('LBL_ADD_CLASS') : editPage ? t('LBL_EDIT_CLASS') : data?.name}</h4>
              </div>

              <div className="reverse-page float-end">
                {(addNew || enableEdit) && <BackButton text={addNew ? 'LBL_CANCEL' : 'LBL_BACK'} />}
                {(addNew || enableEdit) && <PrimaryButton onClick={() => btnRef.current.click()} disabled={false} />}
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
                (Object.keys(data).length > 0 || addNew) && (
                  <>
                    {!addNew && <ClassesForm enableEdit={enableEdit} data={data} btnRef={btnRef} />}
                    {addNew && <ClassesForm addNew={addNew} btnRef={btnRef} />}
                  </>
                )
              )}
              {/* {(Object.keys(data).length > 0 || addNew) && (
                <>
                  {!addNew && <CanteenCategoriesForm enableEdit={enableEdit} data={data} btnRef={btnRef} />}
                  {addNew && <CanteenCategoriesForm addNew={addNew} btnRef={btnRef} />}
                </>
              )} */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClassesManage;
