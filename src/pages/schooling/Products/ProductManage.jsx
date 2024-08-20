import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import PrimaryButton from '../../../components/ui/buttons/PrimaryButton';
import { useProductsServices } from '../../../services/apis/useProductsServices';
import BackButton from '../../../components/ui/buttons/BackButton';
import ProductsForm from './ProductForm';
import CircleSkeleton from '../../../components/ui/skeletons/CircleSkeleton';
import FormAction from '../../../components/FormAction/FormAction';
import { confirmationPopupActions } from '../../../store/confirmationPopup';
import { useDispatch } from 'react-redux';
import { useFeatures } from '../../../hooks/useFeatures';
import FormFooter from '../../../components/FormFooter/FormFooter';
import { alertsActions } from '../../../store/alerts';

const ProductManage = ({ addNew, enableEdit }) => {
  const feature = 'SCHOOLING';
  const subFeature = 'CANTEEN_PRODUCTS';
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isDelete, setIsDelete] = useState(false);
  const { canView, canEdit, canDelete, getFeaturePath } = useFeatures(feature, subFeature);
  const mode = addNew ? 'add' : enableEdit ? 'edit' : 'view';
  const [isSave, setIsSave] = useState(false);

  const { t } = useTranslation();
  const btnRef = useRef();
  const { fetchProduct } = useProductsServices();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});
  const [actionInProgress, setActionInProgress] = useState(false);

  const { id } = useParams();

  const importData = async () => {
    setLoading(true);
    const data = await fetchProduct(id, () => setLoading(false));
    setData(data);
  };

  useEffect(() => {
    if (id) importData();
  }, [id]);

  const alertHandler = (title, message) => {
    if (message) dispatch(alertsActions.initiateAlert({ title, message }));

    if (title !== 'Success' || !message) {
      setIsSave(false);
      setIsDelete(false);
      setLoading(false);
      setActionInProgress(false);
    }
  };

  const finishedActionHandler = (status, message) => {
    setActionInProgress(false);

    if (status === 'Success') {
      alertHandler('Success', message || partnerConfig.messages.saveSuccessMessage);
      setTimeout(() => {
        setIsSave(false);
        setIsDelete(false);
        navigate(getFeaturePath(partnerConfig.subFeature));
      }, 3000);
    } else {
      setIsSave(false);
      setIsDelete(false);
      alertHandler(status || 'Error', message || 'SOMETHING_WENT_WRONG');
    }
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
                <h4>{addNew ? t('LBL_ADD_PRODUCT') : enableEdit ? t('LBL_EDIT_PRODUCT') : t('LBL_VIEW_PRODUCT')}</h4>
              </div>

              {/* <div className="reverse-page float-end">
                <BackButton text={addNew ? 'LBL_CANCEL' : 'LBL_BACK'} />
                {(addNew || enableEdit) && <PrimaryButton onClick={() => btnRef.current.click()} disabled={false} />}
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
              {/* {!addNew && <ProductsForm mode={enableEdit ? 'edit' : 'view'} btnRef={btnRef} data={data} />}
              {addNew && <ProductsForm mode="add" btnRef={btnRef} />} */}

              {loading ? (
                <div style={{ marginTop: '20rem' }}>
                  <CircleSkeleton height="200" isNoData={true} />
                </div>
              ) : (
                (Object.keys(data).length > 0 || addNew) && (
                  <>
                    {!addNew && <ProductsForm mode={enableEdit ? 'edit' : 'view'} btnRef={btnRef} data={data} />}
                    {addNew && <ProductsForm mode="add" btnRef={btnRef} />}
                  </>
                )
              )}
            </div>
          </div>
          <FormFooter mode={mode} feature={feature} subFeature={subFeature} deleteHandler={canDelete ? deleteHandler : null}>
            {/* <BackButton text={addNew ? 'LBL_CANCEL' : 'LBL_BACK'} /> */}
            {(addNew || enableEdit) && <PrimaryButton onClick={() => {btnRef.current.click()  }} disabled={false} />}
            {/* {(addNew || enableEdit) && <PrimaryButton onClick={() => setIsSave(true)} disabled={false} />} */}
          </FormFooter>
        </div>
      </div>
    </>
  );
};

export default ProductManage;
