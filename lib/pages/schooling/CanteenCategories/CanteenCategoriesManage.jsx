import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import PrimaryButton from '../../../components/ui/buttons/PrimaryButton';
import CanteenCategoriesForm from './CanteenCategoriesForm';
import { useCategoriesServices } from '../../../services/apis/useCategoriesServices';
import CircleSkeleton from '../../../components/ui/skeletons/CircleSkeleton';
import { useDispatch } from 'react-redux';
import { useFeatures } from '../../../hooks/useFeatures';
import { confirmationPopupActions } from '../../../store/confirmationPopup';
import FormAction from '../../../components/FormAction/FormAction';
import FormFooter from '../../../components/FormFooter/FormFooter';
import { alertsActions } from '../../../store/alerts';

const CanteenCategoriesManage = ({ addNew, enableEdit }) => {
  const feature = 'SCHOOLING';
  const subFeature = 'CANTEEN_CATEGORIES';
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isDelete, setIsDelete] = useState(false);
  const { canView, canEdit, canDelete, getFeaturePath } = useFeatures(feature, subFeature);
  const mode = addNew ? 'add' : enableEdit ? 'edit' : 'view';
  const { t } = useTranslation();
  const btnRef = useRef(null);
  const { fetchCategory,deleteCategory } = useCategoriesServices();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});

  const { id } = useParams();

  const importData = async () => {
    setLoading(true);
    const data = await fetchCategory(id, () => setLoading(false));
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

  const alertHandler = (title, message) => {
    if (message) dispatch(alertsActions.initiateAlert({ title, message }));

    if (title !== 'Success' || !message) {
      setIsDelete(false);
      setLoading(false);
    }
  };

  const deleteRecordHandler = id => {

    setLoading(true);

    const successHandler = () => {
      alertHandler('Success',' message' );
      setTimeout(() => {
        setIsDelete(false);
        navigate(getFeaturePath(subFeature));
      }, 3000);
    };

    deleteCategory(id, successHandler);

  };

  const deleteHandler = () => {
    dispatch(
      confirmationPopupActions.openPopup({
        title: 'LBL_BEWARE_ABOUT_TO_DELETE',
        message: data?.name ? data.name : `#${id}`,
        onConfirmHandler: () => deleteRecordHandler(id),
      })
    );
  };

  return (
    <>
      <div className="page-body">
        <div className="container-fluid">

          <FormAction
                feature={feature}
                subFeature={subFeature}
                viewHandler={canView && enableEdit ? viewHandler : null}
                editHandler={canEdit && !enableEdit ? editHandler : null}
              />
          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{addNew ? t('LBL_NEW_RECORD') : data.name ? data.name : ''}</h4>
              </div>

              {/* <div className="reverse-page float-end">
                <BackButton text={addNew ? 'LBL_CANCEL' : 'LBL_BACK'} />
                {(addNew || enableEdit) && <PrimaryButton onClick={() => btnRef.current.click()} disabled={false} />}
              </div> */}
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              {/* {showDelete && (
                <ConfirmationPopup item={data.name} onClickHandler={() => setShowDelete(false)} setConfirmationPopup={setShowDelete} />
              )} */}

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
            </div>
          </div>
          <FormFooter mode={mode} feature={feature} subFeature={subFeature} deleteHandler={canDelete ? deleteHandler : null}>
          {(addNew || enableEdit) && <PrimaryButton onClick={() => btnRef.current.click()} disabled={false} />}
          </FormFooter>
        </div>
      </div>
    </>
  );
};

export default CanteenCategoriesManage;
