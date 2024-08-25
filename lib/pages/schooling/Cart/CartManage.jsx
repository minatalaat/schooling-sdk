import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import ConfirmationPopup from '../../components/modals/ConfirmationPopup';
import BackButton from '../../components/ui/buttons/BackButton';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';
import { recordsData } from '../../constants/dummyData/dummyData';
import CanteenCategoriesForm from './CartForm';
import { useDispatch } from 'react-redux';
import { useFeatures } from '../../../hooks/useFeatures';
import FormAction from '../../../components/FormAction/FormAction';
import FormFooter from '../../../components/FormFooter/FormFooter';
import { confirmationPopupActions } from '../../../store/confirmationPopup';

const CartManage = ({ addNew, enableEdit }) => {
  const feature = 'SCHOOLING';
  const subFeature = 'CART';
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isDelete, setIsDelete] = useState(false);
  const { canView, canEdit, canDelete, getFeaturePath } = useFeatures(feature, subFeature);
  const mode = addNew ? 'add' : enableEdit ? 'edit' : 'view';

  const { t } = useTranslation();

  const [showDelete, setShowDelete] = useState(false);

  const { id } = useParams();

  const data = useMemo(() => recordsData.data.find(rec => +rec.id === +id) || [], [id]);
  
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
                <h4>{addNew ? t('LBL_NEW_RECORD') : data.name ? data.name : ''}</h4>
              </div>

              {/* <div className="reverse-page float-end">
                <BackButton text={addNew ? 'LBL_CANCEL' : 'LBL_BACK'} />
                {(addNew || enableEdit) && <PrimaryButton onClick={() => {}} disabled={false} />}
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
                <ConfirmationPopup item={data.name} onClickHandler={() => setShowDelete(false)} setConfirmationPopup={setShowDelete} />
              )}

              {(Object.keys(data).length > 0 || addNew) && (
                <>
                  {!addNew && <CanteenCategoriesForm enableEdit={enableEdit} data={data} />}
                  {addNew && <CanteenCategoriesForm addNew={addNew} />}
                </>
              )}
            </div>
         
          <FormFooter mode={mode} feature={feature} subFeature={subFeature} deleteHandler={canDelete ? deleteHandler : null}>
          {/* <BackButton text={addNew ? 'LBL_CANCEL' : 'LBL_BACK'} /> */}
          {(addNew || enableEdit) && <PrimaryButton onClick={() => {}} disabled={false} />}          </FormFooter>
        </div>
        </div>
      </div>
    </>
  );
};

export default CartManage;
