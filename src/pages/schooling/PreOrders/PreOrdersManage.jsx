import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import ConfirmationPopup from '../../../components/modals/ConfirmationPopup';
import BackButton from '../../../components/ui/buttons/BackButton';
import PrimaryButton from '../../../components/ui/buttons/PrimaryButton';
import StudentsForm from './PreOrdersForm';
import { usePreOrderServices } from '../../../services/apis/usePreOrderServices';
import CircleSkeleton from '../../../components/ui/skeletons/CircleSkeleton';
import { useFeatures } from '../../../hooks/useFeatures';
import { useDispatch } from 'react-redux';
import FormAction from '../../../components/FormAction/FormAction';
import { confirmationPopupActions } from '../../../store/confirmationPopup';
import FormFooter from '../../../components/FormFooter/FormFooter';

const PreOrdersManage = ({ addNew, enableEdit }) => {
  const feature = 'SCHOOLING';
  const subFeature = 'PRE_ORDERS';
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isDelete, setIsDelete] = useState(false);
  const { canView, canEdit, canDelete, getFeaturePath } = useFeatures(feature, subFeature);
  const mode = addNew ? 'add' : enableEdit ? 'edit' : 'view';
  const { t } = useTranslation();
  const { fetchPreOrder, collectPreorder } = usePreOrderServices();

  const [showDelete, setShowDelete] = useState(false);
  const [data, setData] = useState({});
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const { id } = useParams();

  const importData = async () => {
    setLoading(true);

    const successHandler = () => {
      setLoading(false);
    };

    const data = await fetchPreOrder(id, successHandler);
    setData(data);
  };

  useEffect(() => {
    if (id) importData();
  }, [id]);

  const handelCollect = async () => {
    setLoading(true);

    const successHandler = data => {
      // console.log(data);
      setShowDelete(false);
      setStatus(data?.data?.returnedObject?.cartStatusDisplay);
      setLoading(false);
      setData(data?.data?.returnedObject);
    };

    await collectPreorder(id, successHandler);
    // setStatus('SUCCESS');
    // setShowDelete(true);
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
                  <h4>{addNew ? t('LBL_NEW_RECORD') : data.name ? data.name : ''}</h4>
                </div>

                {/* <div className="reverse-page float-end">
                  <BackButton text={addNew ? 'LBL_CANCEL' : 'LBL_BACK'} />
                  {data?.cartStatus != 'SUCCESS' && (
                    <PrimaryButton onClick={() => setShowDelete(true)} disabled={false} text="LBL_ORDER_PICKUP" />
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
                {showDelete && <ConfirmationPopup mode="preOrder" onClickHandler={handelCollect} setConfirmationPopup={setShowDelete} />}

                {(Object.keys(data).length > 0 || addNew) && (
                  <>
                    {!addNew && <StudentsForm enableEdit={enableEdit} data={data} status={status} />}
                    {addNew && <StudentsForm addNew={addNew} status={status} />}
                  </>
                )}
              </div>
            </div>
            <FormFooter mode={mode} feature={feature} subFeature={subFeature} deleteHandler={canDelete ? deleteHandler : null}>
          {data?.cartStatus != 'SUCCESS' && (
                    <PrimaryButton onClick={() => setShowDelete(true)} disabled={false} text="LBL_ORDER_PICKUP" />
                  )}
          </FormFooter>
          </div>
        )}
      </div>
    </>
  );
};

export default PreOrdersManage;
