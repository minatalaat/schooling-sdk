import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ConfirmationPopup from '../../../components/modals/ConfirmationPopup';
import PrimaryButton from '../../../components/ui/buttons/PrimaryButton';
import CircleSkeleton from '../../../components/ui/skeletons/CircleSkeleton';
import GradesForm from './GradesForm';
import { useSchoolStudentServices } from '../../../services/apis/useSchoolStudentServices';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import { useFeatures } from '../../../hooks/useFeatures';
import { confirmationPopupActions } from '../../../store/confirmationPopup';
import FormAction from '../../../components/FormAction/FormAction';
import FormFooter from '../../../components/FormFooter/FormFooter';

const GradesManage = ({ addNew, enableEdit }) => {
  const feature = 'SCHOOLING';
  const subFeature = 'GRADES';
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isDelete, setIsDelete] = useState(false);
  const { canView, canEdit, canDelete, getFeaturePath } = useFeatures(feature, subFeature);
  const mode = addNew ? 'add' : enableEdit ? 'edit' : 'view';

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

  const viewHandler = () => {
    navigate(getFeaturePath(subFeature, 'view', { id }));
  };

  const editHandler = () => {
    navigate(getFeaturePath(subFeature, 'edit', { id }));
  };

  const deleteHandler = () => {
    dispatch(
      confirmationPopupActions.openPopup({
        title: 'LBL_BEWARE_ABOUT_TO_DELETE',
        message: data?.name ? data.name : `#${data?.id}`,
        onConfirmHandler: () => setIsDelete(true),
      })
    );
  };

  return (
    <>
      <div className="page-body">
        <div className="container-fluid">
          <div className="row"></div>
          <div className="row">
            <div className="col-md-12">
              {/* <div className="reverse-page float-end">
                {(addNew || enableEdit) && (
                  <PrimaryButton
                    btnOptions={{
                      type: 'submit',
                    }}
                    disabled={false}
                  />
                )}
              </div> */}
           
            </div>
            <FormAction
                feature={feature}
                subFeature={subFeature}
                viewHandler={canView && enableEdit ? viewHandler : null}
                editHandler={canEdit && !enableEdit ? editHandler : null}
              />
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
            <FormFooter mode={mode} feature={feature} subFeature={subFeature} deleteHandler={canDelete ? deleteHandler : null}>
            {(addNew || enableEdit) && (
                  <PrimaryButton
                    btnOptions={{
                      type: 'submit',
                    }}
                    disabled={false}
                  />
                )}
          </FormFooter>
          </div>
        </div>
      </div>
    </>
  );
};

export default GradesManage;
