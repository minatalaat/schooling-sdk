import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import Spinner from '../../components/Spinner/Spinner';
import ConfirmationPopup from '../../components/ConfirmationPopup';
import MoreAction from '../../parts/MoreAction';
import BreadCrumb from '../../components/ui/BreadCrumb';
import BackButton from '../../components/ui/buttons/BackButton';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';
import FixedAssetTypeForm from './FixedAssetTypeForm';
import ActionsProgessBar from '../../parts/ActionsProgessBar';

import { useAxiosFunction } from '../../hooks/useAxios';
import { getTodayDate } from '../../utils/helpers';
import { useFeatures } from '../../hooks/useFeatures';
import { getFetchUrl } from '../../services/getUrl';
import { modelsEnum } from '../../constants/modelsEnum/modelsEnum';
import { alertsActions } from '../../store/alerts';

export default function ManageFixedAssetTypes({ addNew, enableEdit }) {
  const feature = 'FIXED_ASSETS_MANAGEMENT';
  const subFeature = 'FIXED_ASSET_TYPES';

  const { api } = useAxiosFunction();
  const { t } = useTranslation();
  const { canView, canEdit, canDelete, getFeaturePath } = useFeatures(feature, subFeature);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [fixedAssetType, setFixedAssetType] = useState(null);
  const [isSave, setIsSave] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [isLoading, setIsLoading] = useState(addNew ? false : true);

  const { id } = useParams();

  const alertHandler = (title, message) => {
    if (message) dispatch(alertsActions.initiateAlert({ title, message }));
    setActionInProgress(false);

    if (title !== 'Success' || !message) {
      if (isSave) setIsSave(false);
      if (isDelete) setIsDelete(false);
    }
  };

  const finishedSaveHandler = status => {
    if (status === 'success') {
      alertHandler('Success', t('LBL_FIXED_ASSET_TYPE_SAVED_SUCCESS'));
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
      alertHandler('Success', t('LBL_FIXED_ASSET_TYPE_DELETED'));
      setTimeout(() => {
        setIsDelete(false);
        navigate(getFeaturePath(subFeature));
      }, 3000);
    } else {
      alertHandler('Error', t('SOME_THING_WENT_WORNG'));
    }
  };

  const fetchFixedAssetType = async () => {
    if (addNew) return null;
    if (isLoading === false) setIsLoading(true);
    const fixedAssetTypeResponse = await api('POST', getFetchUrl(modelsEnum[subFeature].name, id), {
      fields: ['name', 'code', 'technicalTypeSelect'],
      related: {},
    });
    if (
      !fixedAssetTypeResponse.data ||
      fixedAssetTypeResponse.data.status !== 0 ||
      !fixedAssetTypeResponse.data.data ||
      !fixedAssetTypeResponse.data.data[0]
    )
      return navigate('/error');
    setFixedAssetType(fixedAssetTypeResponse.data.data[0]);
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
    fetchFixedAssetType();
  }, [addNew, enableEdit]);

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
                <h4>{addNew ? t('LBL_NEW_FIXED_ASSET_TYPE') : fixedAssetType?.name ?? ''}</h4>
              </div>
              <div className="reverse-page float-end">
                <BackButton disabled={isButtonDisabled} text={addNew ? 'LBL_CANCEL' : 'LBL_BACK'} />
                {(addNew || enableEdit) && <PrimaryButton disabled={isButtonDisabled} onClick={() => setIsSave(true)} />}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              {!isLoading && !addNew && (
                <ActionsProgessBar
                  feature={feature}
                  subfeature={subFeature}
                  setShowMoreAction={setShowMoreAction}
                  editHandler={!enableEdit ? (canEdit ? editHandler : null) : null}
                  viewHandler={enableEdit ? (canView ? viewHandler : null) : null}
                  deleteHandler={canDelete ? deleteHandler : null}
                />
              )}
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              {showDelete && (
                <ConfirmationPopup
                  item={fixedAssetType.name}
                  onClickHandler={() => {
                    setIsDelete(true);
                    setShowDelete(false);
                  }}
                  setConfirmationPopup={setShowDelete}
                />
              )}
              {!isLoading && (
                <>
                  {((fixedAssetType && Object.keys(fixedAssetType).length > 0) || addNew) && (
                    <>
                      {!addNew && (
                        <FixedAssetTypeForm
                          enableEdit={enableEdit}
                          data={fixedAssetType}
                          isSave={isSave}
                          finishedSaveHandler={finishedSaveHandler}
                          isDelete={false}
                          finishedDeleteHandler={finishedDeleteHandler}
                          alertHandler={alertHandler}
                          setActionInProgress={setActionInProgress}
                        />
                      )}
                      {addNew && (
                        <FixedAssetTypeForm
                          data={fixedAssetType}
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
