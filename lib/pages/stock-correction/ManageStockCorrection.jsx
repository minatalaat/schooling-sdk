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
import ActionsProgessBar from '../../parts/ActionsProgessBar';
import StockCorrectionForm from './StockCorrectionForm';
import Calendar from '../../components/ui/Calendar';

import { useAxiosFunction } from '../../hooks/useAxios';
import { useFeatures } from '../../hooks/useFeatures';
import { getFetchUrl } from '../../services/getUrl';
import { MODELS } from '../../constants/models';
import { modelsEnum } from '../../constants/modelsEnum/modelsEnum';
import { STOCK_CORRECTION_FETCH_FIELDS } from './StockCorrectionPayloadsFields';
import { STOCK_CORRECTION_STATUS, STOCK_CORRECTION_STATUS_REV_ENUM } from '../../constants/enums/StockCorrectionEnum';
import { alertsActions } from '../../store/alerts';

export default function ManageStockCorrection({ addNew, enableEdit }) {
  const feature = 'STOCK_MANAGEMENT';
  const subFeature = 'STOCK_CORRECTION';

  const { api } = useAxiosFunction();
  const { t } = useTranslation();
  const { canView, canEdit, canDelete, getFeaturePath } = useFeatures(feature, subFeature);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [stockCorrection, setStockCorrection] = useState(null);
  const [isSave, setIsSave] = useState(false);
  const [isValidate, setValidate] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [isShowStockMove, setShowStockMove] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [isLoading, setIsLoading] = useState(addNew ? false : true);
  let mode = addNew ? 'add' : enableEdit ? 'edit' : 'view';

  let statusBarItems = [
    {
      label: 'LBL_DRAFT',
      className: mode === 'add' ? 'default' : 'done',
    },
    {
      label: 'LBL_VALIDATED',
      className: stockCorrection && stockCorrection.statusSelect === STOCK_CORRECTION_STATUS_REV_ENUM['LBL_VALIDATED'] ? 'done' : 'default',
    },
  ];

  const { id } = useParams();

  const alertHandler = (title, message) => {
    if (message) dispatch(alertsActions.initiateAlert({ title, message }));
    setActionInProgress(false);

    if (title !== 'Success' || !message) {
      if (isSave) setIsSave(false);
      if (isValidate) setValidate(false);
      if (isDelete) setIsDelete(false);
      if (isShowStockMove) setShowStockMove(false);
    }
  };

  const finishedSaveHandler = status => {
    if (status === 'success') {
      alertHandler('Success', t('LBL_STOCK_CORRECTION_SAVED_SUCCESS'));
      setTimeout(() => {
        setIsSave(false);
        navigate(getFeaturePath(subFeature));
      }, 3000);
    } else {
      alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    }
  };

  const finishedValidateHandler = status => {
    if (status === 'success') {
      alertHandler('Success', t('LBL_STOCK_CORRECTION_VALIDATED_SUCCESS'));
      setTimeout(() => {
        setValidate(false);
        navigate(getFeaturePath(subFeature));
      }, 3000);
    } else {
      alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    }
  };

  const finishedDeleteHandler = status => {
    if (status === 'success') {
      alertHandler('Success', t('LBL_STOCK_CORRECTION_DELETED'));
      setTimeout(() => {
        setIsDelete(false);
        navigate(getFeaturePath(subFeature));
      }, 3000);
    } else {
      alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    }
  };

  //show internal move handler when finished
  const finishedShowStockMoveHandler = (status, id) => {
    if (status === 'success') {
      setActionInProgress(false);
      setShowStockMove(false);
      navigate(getFeaturePath('STOCK_TRANSFERS', 'view', { id: id }));
    }
  };

  const fetchStockMove = async () => {
    if (addNew) return null;
    if (isLoading === false) setIsLoading(true);
    const stockCorrectionResponse = await api('POST', getFetchUrl(MODELS.STOCK_CORRECTION, id), {
      fields: STOCK_CORRECTION_FETCH_FIELDS,
      related: {},
    });
    if (
      !stockCorrectionResponse.data ||
      stockCorrectionResponse.data.status !== 0 ||
      !stockCorrectionResponse.data.data ||
      !stockCorrectionResponse.data.data[0]
    )
      return navigate('/error');
    setStockCorrection(stockCorrectionResponse.data.data[0]);
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
    fetchStockMove();
  }, [addNew, enableEdit]);

  let isButtonDisabled = isSave || isDelete || isValidate;
  return (
    <>
      {showMoreAction && (
        <MoreAction
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          editHandler={!enableEdit ? (canEdit ? editHandler : null) : null}
          viewHandler={enableEdit ? (canView ? viewHandler : null) : null}
          deleteHandler={canDelete && stockCorrection.statusSelect === STOCK_CORRECTION_STATUS_REV_ENUM['LBL_DRAFT'] ? deleteHandler : null}
          canSelectAll={false}
        />
      )}
      {actionInProgress && <div className="lodingpage"></div>}
      {isLoading && <Spinner />}
      <div className="page-body">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <Calendar />
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
                <h4>
                  {addNew
                    ? t('LBL_ADD_STOCK_CORRECTION')
                    : enableEdit
                      ? `${t('LBL_EDIT')} ${t(modelsEnum[subFeature].titleSingular)}`
                      : `${t('LBL_VIEW')} ${t(modelsEnum[subFeature].titleSingular)}`}
                </h4>
              </div>

              <div className="reverse-page float-end">
                <BackButton disabled={isButtonDisabled} text="LBL_BACK" />
                {(addNew || enableEdit) && <PrimaryButton disabled={isButtonDisabled} onClick={() => setIsSave(true)} />}
                {enableEdit && stockCorrection && stockCorrection.statusSelect === STOCK_CORRECTION_STATUS_REV_ENUM['LBL_DRAFT'] && (
                  <PrimaryButton text="LBL_VALIDATE" disabled={isButtonDisabled} onClick={() => setValidate(true)} />
                )}
                {!enableEdit && stockCorrection && stockCorrection.statusSelect === STOCK_CORRECTION_STATUS_REV_ENUM['LBL_VALIDATED'] && (
                  <PrimaryButton text="LBL_SHOW_STOCK_MOVE" disabled={isButtonDisabled} onClick={() => setShowStockMove(true)} />
                )}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              {!isLoading && !addNew && (
                <ActionsProgessBar
                  feature={feature}
                  subfeature={subFeature}
                  editHandler={
                    !enableEdit
                      ? canEdit && stockCorrection && stockCorrection.statusSelect === STOCK_CORRECTION_STATUS_REV_ENUM['LBL_DRAFT']
                        ? editHandler
                        : null
                      : null
                  }
                  viewHandler={enableEdit ? (canView ? viewHandler : null) : null}
                  deleteHandler={
                    canDelete && stockCorrection.statusSelect === STOCK_CORRECTION_STATUS_REV_ENUM['LBL_DRAFT'] ? deleteHandler : null
                  }
                  setShowMoreAction={setShowMoreAction}
                  statusBarItems={statusBarItems}
                  currentStatusLabel={
                    (stockCorrection && t(STOCK_CORRECTION_STATUS[stockCorrection.statusSelect])) || t(STOCK_CORRECTION_STATUS[1])
                  }
                />
              )}
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              {showDelete && (
                <ConfirmationPopup
                  item={stockCorrection.product.fullName}
                  onClickHandler={() => {
                    setIsDelete(true);
                    setShowDelete(false);
                  }}
                  setConfirmationPopup={setShowDelete}
                />
              )}
              {!isLoading && (
                <>
                  {((stockCorrection && Object.keys(stockCorrection).length > 0) || addNew) && (
                    <>
                      {!addNew && (
                        <StockCorrectionForm
                          enableEdit={enableEdit}
                          data={stockCorrection}
                          isSave={isSave}
                          isValidate={isValidate}
                          finishedSaveHandler={finishedSaveHandler}
                          finishedValidateHandler={finishedValidateHandler}
                          isDelete={isDelete}
                          finishedDeleteHandler={finishedDeleteHandler}
                          alertHandler={alertHandler}
                          setActionInProgress={setActionInProgress}
                          isShowStockMove={isShowStockMove}
                          finishedShowStockMoveHandler={finishedShowStockMoveHandler}
                        />
                      )}
                      {addNew && (
                        <StockCorrectionForm
                          data={stockCorrection}
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
