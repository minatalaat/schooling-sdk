import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import ConfirmationPopup from '../../../components/modals/ConfirmationPopup';
import BackButton from '../../../components/ui/buttons/BackButton';
import PrimaryButton from '../../../components/ui/buttons/PrimaryButton';
import StudentsForm from './StudentsForm';
import { useStudentsServices } from '../../../services/apis/useStudentsServices';
import CircleSkeleton from '../../../components/ui/skeletons/CircleSkeleton';
import { useDispatch } from 'react-redux';
import { useFeatures } from '../../../hooks/useFeatures';
import FormAction from '../../../components/FormAction/FormAction';
import FormFooter from '../../../components/FormFooter/FormFooter';
import { confirmationPopupActions } from '../../../store/confirmationPopup';

const StudentsManage = ({ addNew, enableEdit }) => {
  const feature = 'SCHOOLING';
  const subFeature = 'STUDENTS';
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isDelete, setIsDelete] = useState(false);
  const { canView, canEdit, canDelete, getFeaturePath } = useFeatures(feature, subFeature);
  const mode = addNew ? 'add' : enableEdit ? 'edit' : 'view';

  const { t } = useTranslation();
  const { fetchStudent } = useStudentsServices();
  const ref = useRef();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const { id } = useParams();

  const importData = async () => {
    setLoading(true);
    const data = await fetchStudent(id, () => setLoading(false));
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
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{addNew ? t('LBL_NEW_RECORD') : data?.name ? `${data?.name} ${t('LBL_DETAILS')}` : ''}</h4>
              </div>

              {/* <div className="reverse-page float-end">
                <BackButton text={addNew ? 'LBL_CANCEL' : 'LBL_BACK'} />
                {(addNew || enableEdit) && (
                  <PrimaryButton
                    btnOptions={{
                      type: 'submit',
                    }}
                    disabled={false}
                  />
                )}
              </div> */}
              <FormAction
                feature={feature}
                subFeature={subFeature}
                viewHandler={canView && enableEdit ? viewHandler : null}
                editHandler={canEdit && !enableEdit ? editHandler : null}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              {/* {showDelete && (
                <ConfirmationPopup item={data?.name} onClickHandler={() => setShowDelete(false)} setConfirmationPopup={setShowDelete} />
              )} */}

              {loading ? (
                <div style={{ marginTop: '20rem' }}>
                  <CircleSkeleton height="200" isNoData={true} />
                </div>
              ) : (
                ((data && Object.keys(data).length > 0) || addNew) && (
                  <>
                    {!addNew && <StudentsForm enableEdit={enableEdit} data={data} submitBtn={ref} />}
                    {addNew && <StudentsForm addNew={addNew} submitBtn={ref} />}
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
          <FormFooter mode={mode} feature={feature} subFeature={subFeature} deleteHandler={canDelete ? deleteHandler : null}>
          {(addNew || enableEdit) && (
                  <PrimaryButton
                  onClick={() => {ref.current.click()  }}
                    btnOptions={{
                      type: 'submit',
                    }}
                    disabled={false}
                  />
                )}
          </FormFooter>
        </div>
      </div>
    </>
  );
};

export default StudentsManage;
