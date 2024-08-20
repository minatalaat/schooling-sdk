import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import ConfirmationPopup from '../../../components/modals/ConfirmationPopup';
import BackButton from '../../../components/ui/buttons/BackButton';
import PrimaryButton from '../../../components/ui/buttons/PrimaryButton';
import BusChangePasswordPopup from '../../../components/modals/BusChangePassword';
import CircleSkeleton from '../../../components/ui/skeletons/CircleSkeleton';
import SupervisorsForm from './SupervisorsForm';
import { useSchoolStudentServices } from '../../../services/apis/useSchoolStudentServices';
import { useDispatch } from 'react-redux';
import { useFeatures } from '../../../hooks/useFeatures';
import { confirmationPopupActions } from '../../../store/confirmationPopup';
import FormAction from '../../../components/FormAction/FormAction';
import FormFooter from '../../../components/FormFooter/FormFooter';

const SupervisorsManage = ({ addNew, enableEdit }) => {
  const feature = 'SCHOOLING';
  const subFeature = 'SUPERVISORS';
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isDelete, setIsDelete] = useState(false);
  const { canView, canEdit, canDelete, getFeaturePath } = useFeatures(feature, subFeature);
  const mode = addNew ? 'add' : enableEdit ? 'edit' : 'view';

  const { t } = useTranslation();
  const btnRef = useRef(null);
  const { fetchSupervisor, updateSupervisor } = useSchoolStudentServices();
  const [showDelete, setShowDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const [data, setData] = useState({});

  const { id } = useParams();

  const importData = async () => {
    setLoading(true);
    const data = await fetchSupervisor(id, () => setLoading(false));
    setData(data);
  };

  useEffect(() => {
    if (id) importData();
  }, [id]);

  const onClickHandler = values => {
    updateSupervisor(data?.id, { ...values }, () => {
      setShowChangePassword(false);
    });
  };

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
                <h4>{addNew ? t('LBL_ADD_SUPERVISOR') : t('LBL_DETAILS_SUPERVISOR')}</h4>
              </div>

              {/* <div className="reverse-page float-end">
                {(addNew || enableEdit) && <BackButton text={addNew ? 'LBL_CANCEL' : 'LBL_BACK'} />}
                {(addNew || enableEdit) && <PrimaryButton onClick={() => btnRef.current.click()} disabled={false} />}
                {!addNew && !enableEdit && (
                  <>
                    <PrimaryButton
                      onClick={() => setShowChangePassword(true)}
                      disabled={false}
                      text={t('LBL_CHANGE_PASSWORD')}
                      className="bg-transparent border-2 border-primary text-primary"
                    />
                  </>
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
              {showDelete && (
                <ConfirmationPopup item={data?.name} onClickHandler={() => setShowDelete(false)} setConfirmationPopup={setShowDelete} />
              )}
              {showChangePassword && (
                <BusChangePasswordPopup
                  item={data}
                  onClickHandler={onClickHandler}
                  setShowChangePassword={setShowChangePassword}
                  setShowDelete={setShowDelete}
                />
              )}
              {loading ? (
                <div style={{ marginTop: '20rem' }}>
                  <CircleSkeleton height="200" isNoData={true} />
                </div>
              ) : (
                (Object.keys(data).length > 0 || addNew) && (
                  <>
                    {!addNew && <SupervisorsForm enableEdit={enableEdit} data={data} btnRef={btnRef} />}
                    {addNew && <SupervisorsForm addNew={addNew} btnRef={btnRef} />}
                  </>
                )
              )}
            </div>
            <FormFooter mode={mode} feature={feature} subFeature={subFeature} deleteHandler={canDelete ? deleteHandler : null}>
              {(addNew || enableEdit) && <PrimaryButton onClick={() => btnRef.current.click()} disabled={false} />}
              {!addNew && !enableEdit && (
                <>
                  <PrimaryButton
                    onClick={() => setShowChangePassword(true)}
                    disabled={false}
                    text={t('LBL_CHANGE_PASSWORD')}
                    className="bg-transparent border-2 border-primary text-primary"
                  />
                </>
              )}
            </FormFooter>
          </div>
        </div>
      </div>
    </>
  );
};

export default SupervisorsManage;
