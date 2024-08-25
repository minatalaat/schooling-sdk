import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import Spinner from '../../components/Spinner/Spinner';
import ConfirmationPopup from '../../components/ConfirmationPopup';
import MoreAction from '../../parts/MoreAction';
import BreadCrumb from '../../components/ui/BreadCrumb';
import BackButton from '../../components/ui/buttons/BackButton';
import Toolbar from '../../parts/Toolbar';
import ProductActivityForm from './ProductActivityForm';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';

import { useAxiosFunction } from '../../hooks/useAxios';
import { getTodayDate } from '../../utils/helpers';
import { useFeatures } from '../../hooks/useFeatures';
import { getFetchUrl } from '../../services/getUrl';
import { modelsEnum } from '../../constants/modelsEnum/modelsEnum';
import { MODELS } from '../../constants/models';
import { alertsActions } from '../../store/alerts';

export default function ManageProductActivity({ addNew, enableEdit }) {
  const feature = 'HR_MANAGEMENT';
  const subFeature = 'PRODUCT_ACTIVITY';

  const { api } = useAxiosFunction();
  const { t } = useTranslation();
  const { canView, canEdit, canDelete, getFeaturePath } = useFeatures(feature, subFeature);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [productActivity, setProductActivity] = useState(null);
  const [isSave, setIsSave] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [isLoading, setIsLoading] = useState(addNew ? false : true);

  const { id } = useParams();

  const alertHandler = (title, message) => {
    dispatch(alertsActions.initiateAlert({ title, message }));
    setActionInProgress(false);

    if (title !== 'Success') {
      if (isSave) setIsSave(false);
      if (isDelete) setIsDelete(false);
    }
  };

  const finishedSaveHandler = status => {
    if (status === 'success') {
      alertHandler('Success', t('LBL_ACTIVITY_SAVED_SUCCESS'));
      setTimeout(() => {
        setIsSave(false);
        navigate(getFeaturePath(subFeature));
      }, 3000);
    } else {
      alertHandler('Error', t('SOME_THING_WENT_WORNG'));
    }
  };

  const finishedDeleteHandler = status => {
    if (status === 'success') {
      alertHandler('Success', t('LBL_ACTIVITY_DELETED'));
      setTimeout(() => {
        setIsDelete(false);
        navigate(getFeaturePath(subFeature));
      }, 3000);
    } else {
      alertHandler('Error', t('SOME_THING_WENT_WORNG'));
    }
  };

  const fetchProductActivity = async () => {
    if (addNew) return null;
    if (isLoading === false) setIsLoading(true);
    const productActibityFetchResponse = await api('POST', getFetchUrl(MODELS.PRODUCT, id), {
      fields: ['productFamily', 'code', 'productCategory', 'name'],
      related: {},
    });
    if (
      !productActibityFetchResponse.data ||
      productActibityFetchResponse.data.status !== 0 ||
      !productActibityFetchResponse.data.data ||
      !productActibityFetchResponse.data.data[0]
    )
      return navigate('/error');
    setProductActivity(productActibityFetchResponse.data.data[0]);
    setIsLoading(false);
  };

  const viewHandler = () => {
    navigate(getFeaturePath(subFeature, 'view', { id }));
    setShowMoreAction(false);
  };

  const editHandler = () => {
    navigate(getFeaturePath(subFeature, 'edit', { id }));
    setShowMoreAction(false);
  };

  const deleteHandler = () => {
    setShowDelete(true);
  };

  useEffect(() => {
    fetchProductActivity();
  }, [enableEdit]);

  let isButtonDisabled = isSave || isDelete;
  return (
    <>
      {showMoreAction && (
        <MoreAction
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          editHandler={!enableEdit ? (canEdit ? editHandler : null) : null}
          viewHandler={enableEdit ? (canView ? viewHandler : null) : null}
          deleteHandler={canDelete ? deleteHandler : null}
          canSelectAll={false}
        />
      )}
      {actionInProgress && <div className="lodingpage"></div>}
      {isLoading && <Spinner />}
      <div className="page-body">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <div className="info-date-page float-end">
                <i className="calender-i"></i>
                <p>{t('DATE', getTodayDate())}</p>
              </div>
              <BreadCrumb
                feature={feature}
                subFeature={subFeature}
                modeText={
                  !addNew && enableEdit
                    ? `${t('LBL_EDIT')} ${t(modelsEnum[subFeature].titleSingular)}`
                    : !addNew && !enableEdit
                      ? `${t('LBL_VIEW')} ${t(modelsEnum[subFeature].titleSingular)}`
                      : `${t('LBL_ADD_NEW')} ${t(modelsEnum[subFeature].titleSingular)}`
                }
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{addNew ? t('LBL_NEW_PRODUCT_ACTIVITY') : productActivity?.name ?? ''}</h4>
              </div>
              <div className="reverse-page float-end">
                <BackButton />
                {(addNew || enableEdit) && (
                  <PrimaryButton theme="blue" text="LBL_SAVE" disabled={isButtonDisabled} onClick={() => setIsSave(true)} />
                )}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              {!isLoading && !addNew && (
                <Toolbar
                  setShowMoreAction={setShowMoreAction}
                  editHandler={!enableEdit ? (canEdit ? editHandler : null) : null}
                  viewHandler={enableEdit ? (canView ? viewHandler : null) : null}
                  deleteHandler={canDelete ? deleteHandler : null}
                  canSelectAll={false}
                />
              )}
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              {showDelete && (
                <ConfirmationPopup
                  item={productActivity.name}
                  onClickHandler={() => {
                    setIsDelete(true);
                    setShowDelete(false);
                  }}
                  setConfirmationPopup={setShowDelete}
                />
              )}
              {!isLoading && (
                <>
                  {((productActivity && Object.keys(productActivity).length > 0) || addNew) && (
                    <>
                      {!addNew && (
                        <ProductActivityForm
                          enableEdit={enableEdit}
                          data={productActivity}
                          isSave={isSave}
                          finishedSaveHandler={finishedSaveHandler}
                          isDelete={false}
                          finishedDeleteHandler={finishedDeleteHandler}
                          alertHandler={alertHandler}
                          setActionInProgress={setActionInProgress}
                        />
                      )}
                      {addNew && (
                        <ProductActivityForm
                          data={productActivity}
                          addNew={addNew}
                          isSave={isSave}
                          finishedSaveHandler={finishedSaveHandler}
                          alertHandler={alertHandler}
                          setActionInProgress={setActionInProgress}
                        />
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
