import { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import ConfirmationPopup from '../../../components/modals/ConfirmationPopup';
import BackButton from '../../../components/ui/buttons/BackButton';
import PrimaryButton from '../../../components/ui/buttons/PrimaryButton';
import CanteenCategoriesForm from './BusesForm';
import { useBusesServices } from '../../../services/apis/useBusesServices';
import CircleSkeleton from '../../../components/ui/skeletons/CircleSkeleton';
import BusChangePasswordPopup from '../../../components/modals/BusChangePassword';
import FormFooter from '../../../components/FormFooter/FormFooter';
import { confirmationPopupActions } from '../../../store/confirmationPopup';
import { useFeatures } from '../../../hooks/useFeatures';
import { useDispatch } from 'react-redux';
import FormAction from '../../../components/FormAction/FormAction';
import { alertsActions } from '../../../store/alerts';

const BusesManage = ({ addNew, enableEdit }) => {
  const { t } = useTranslation();
  const btnRef = useRef(null);
  const { fetchBus, updateBus, deleteBus } = useBusesServices();
  const navigate = useNavigate();
  const [showDelete, setShowDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const dispatch = useDispatch();
  const [isSave, setIsSave] = useState(false);

  const [data, setData] = useState({});

  const { id } = useParams();
  const mode = addNew ? 'add' : enableEdit ? 'edit' : 'view';
  const feature = 'SCHOOLING';
  const subFeature = 'BUSES';
  const { canView, canEdit, canDelete, getFeaturePath } = useFeatures(feature, subFeature);

  const importData = async () => {
    setLoading(true);
    const data = await fetchBus(id, () => setLoading(false));
    setData(data);
  };

  useEffect(() => {
    if (id) importData();
  }, [id]);

  const onClickHandler = values => {
    updateBus(data?.id, { ...values }, () => {
      setShowChangePassword(false);
    });
  };

  const viewHandler = () => {
    navigate(getFeaturePath(subFeature, 'view', { id }));
    setShowMoreActionToolbar(false);
  };

  const editHandler = () => {
    navigate(getFeaturePath(subFeature, 'edit', { id }));
    setShowMoreActionToolbar(false);
  };

  // const deleteHandler = () => {
  //   dispatch(
  //     confirmationPopupActions.openPopup({
  //       title: 'LBL_BEWARE_ABOUT_TO_DELETE',
  //       message: data?.name ? data.name : `#${data?.id}`,
  //       onConfirmHandler: () => {
  //         setIsDelete(true)
  //       },
  //     })
  //   );
  // };
  
  const alertHandler = (title, message) => {
    if (message) dispatch(alertsActions.initiateAlert({ title, message }));

    if (title !== 'Success' || !message) {
      setIsSave(false);
      setIsDelete(false);
      setLoading(false);
    }
  };

  const deleteRecordHandler = id => {

    setLoading(true);

    const successHandler = () => {
      alertHandler('Success',' message' );
      setTimeout(() => {
        setIsSave(false);
        setIsDelete(false);
        navigate(getFeaturePath(subFeature));
      }, 3000);
    };

    deleteBus({records: [{id: id}]}, successHandler);

  };

  const deleteHandler = () => {
    dispatch(
      confirmationPopupActions.openPopup({
        title: 'LBL_BEWARE_ABOUT_TO_DELETE',
        message: data?.name ? data.name : `#${data?.id}`,
        onConfirmHandler: () => deleteRecordHandler(data?.id),
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
                <h4>{addNew ? t('LBL_ADD_BUSES') : data?.name ? data?.name : t('LBL_DETAILS_BUSES')}</h4>
              </div>
              <div className="reverse-page d-flex justify-content-end">
                {/* {(addNew || enableEdit) && <BackButton text={addNew ? 'LBL_CANCEL' : 'LBL_BACK'} />}
                {(addNew || enableEdit) && <PrimaryButton onClick={() => btnRef.current.click()} disabled={false} />} */}
                {!addNew && !enableEdit && (
                  <>
                    {/* <PrimaryButton
                      onClick={() => setShowChangePassword(true)}
                      disabled={false}
                      text={t('LBL_CHANGE_PASSWORD')}
                      className="bg-transparent border-2 border-primary text-primary"
                    />
                    <PrimaryButton
                      onClick={() => navigate(`/school/buses/student-list/${id}?page=0&size=10`)}
                      disabled={false}
                      text={t('LBL_STUDENT_LIST')}
                    /> */}
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="row">
            {!loading && !addNew && (
              <FormAction
                feature={feature}
                subFeature={subFeature}
                viewHandler={canView && enableEdit ? viewHandler : null}
                editHandler={canEdit && !enableEdit ? editHandler : null}
              />
            )}
            <div className="col-md-12">
              {/* {showDelete && (
                <ConfirmationPopup item={data?.name} onClickHandler={() => setShowDelete(false)} setConfirmationPopup={setShowDelete} />
              )} */}
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
                 
                    {!addNew && <CanteenCategoriesForm enableEdit={enableEdit} data={data} btnRef={btnRef} />}     
                    {addNew && <CanteenCategoriesForm addNew={addNew} btnRef={btnRef} />}
                  </>
                )
              )}

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
                    <PrimaryButton
                      onClick={() => navigate(`/school/buses/student-list/${id}?page=0&size=10`)}
                      disabled={false}
                      text={t('LBL_STUDENT_LIST')}
                    /> 
                    </>
                    )}
                  
              </FormFooter>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BusesManage;
