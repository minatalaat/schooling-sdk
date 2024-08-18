import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import Spinner from '../../components/Spinner/Spinner';
import ConfirmationPopup from '../../components/ConfirmationPopup';
import MoreAction from '../../parts/MoreAction';
import BreadCrumb from '../../components/ui/BreadCrumb';
import BackButton from '../../components/ui/buttons/BackButton';
import SaveButton from '../../components/ui/buttons/SaveButton';
import ActionsProgessBar from '../../parts/ActionsProgessBar';
import FixedAssetForm from './FixedAssetForm';
import DisposalModal from './DisposalModal';

import { useAxiosFunction } from '../../hooks/useAxios';
import { checkFlashOrError, getTodayDate } from '../../utils/helpers';
import { useFeatures } from '../../hooks/useFeatures';
import { getFetchUrl, getSearchUrl } from '../../services/getUrl';
import { modelsEnum } from '../../constants/modelsEnum/modelsEnum';
import { FIXED_ASSET_FETCH_FIELDS, FIXED_ASSET_LINES_SEARCH_FIELDS } from './FixedAssetsPayloadsFields';
import { FIXED_ASSET_STATUS_ENUM, FIXED_ASSET_STATUS_REV_ENUM } from '../../constants/enums/FixedAssetEnum';
import { MODELS } from '../../constants/models';
import { depreciationLinesActions } from '../../store/DepreciationLines';
import { alertsActions } from '../../store/alerts';

export default function ManageFixedAssets({ addNew, enableEdit }) {
  const feature = 'FIXED_ASSETS_MANAGEMENT';
  const subFeature = 'FIXED_ASSETS';
  const { canView, canEdit, canDelete, getFeaturePath } = useFeatures(feature, subFeature);

  const { api } = useAxiosFunction();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const depreciationLines = useSelector(state => state.depreciationLines.depreciationLines);

  const [fixedAsset, setFixedAsset] = useState(null);
  const [isSave, setIsSave] = useState(false);
  const [isComputeDepreciation, setComputeDepreciation] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [isValidate, setValidate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [isDisposal, setDisposal] = useState(false);
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
      className: fixedAsset && fixedAsset.statusSelect >= FIXED_ASSET_STATUS_REV_ENUM['LBL_VALIDATED'] ? 'done' : 'default',
    },
    {
      label: 'LBL_DEPRECIATED',
      className: fixedAsset && fixedAsset.statusSelect >= FIXED_ASSET_STATUS_REV_ENUM['LBL_DEPRECIATED'] ? 'done' : 'default',
    },
    {
      label: 'LBL_TRANSFERED',
      className: fixedAsset && fixedAsset.statusSelect >= FIXED_ASSET_STATUS_REV_ENUM['LBL_TRANSFERED'] ? 'done' : 'default',
    },
  ];

  const { id } = useParams();

  const alertHandler = (title, message) => {
    if (message) {
      dispatch(alertsActions.initiateAlert({ title, message }));
      setActionInProgress(false);

      if (title !== 'Success') {
        if (isSave) setIsSave(false);
        if (isDelete) setIsDelete(false);
        if (isComputeDepreciation) setComputeDepreciation(false);
        if (isValidate) setValidate(false);
        if (isDisposal) setDisposal(false);
      }
    } else {
      if (isSave) setIsSave(false);
      if (isDelete) setIsDelete(false);
      if (isComputeDepreciation) setComputeDepreciation(false);
      if (isValidate) setValidate(false);
      if (isDisposal) setDisposal(false);
    }
  };

  const getFiscalFixedLinesPayload = data => {
    let fetchLineArray = [];

    if (data) {
      data.forEach(item => {
        fetchLineArray.push(item.id);
      });
    }

    if (fetchLineArray && fetchLineArray.length > 0) {
      let payload = {
        fields: FIXED_ASSET_LINES_SEARCH_FIELDS,
        sortBy: ['depreciationDate'],
        data: {
          _domain: 'self.id in (:_field_ids)',
          _domainContext: {
            id: fixedAsset?.id || null,
            _model: MODELS.FIXED_ASSET,
            _field: 'fixedAssetLineList',
            _field_ids: fetchLineArray,
          },
          _archived: true,
        },
        limit: -1,
        offset: 0,
        translate: true,
      };
      return payload;
    } else {
      return null;
    }
  };

  const onFiscalFixedLinesSearchSuccess = response => {
    if (response.data.status === 0) {
      let data = response.data.data;

      if (data && checkFlashOrError(data)) {
        dispatch(depreciationLinesActions.resetDepreciationLines());
      } else {
        let tempDepreciationLines = [];

        if (data) {
          data.forEach(item => {
            tempDepreciationLines.push({
              ...item,
              lineId: Math.floor(Math.random() * 100).toString(),
            });
          });
        }

        dispatch(depreciationLinesActions.setLines({ depreciationLines: tempDepreciationLines }));
      }
    }
  };

  const getDepreciationLines = data => {
    api(
      'POST',
      getSearchUrl(MODELS.FIXED_ASSET_LINE),
      getFiscalFixedLinesPayload(data?.fixedAssetLineList || null),
      onFiscalFixedLinesSearchSuccess
    );
  };

  const fetchFixedAsset = async id => {
    // if (isLoading === false) setIsLoading(true);
    const fixedAssetResponse = await api('POST', getFetchUrl(MODELS.FIXED_ASSET, id), {
      fields: FIXED_ASSET_FETCH_FIELDS,
      related: {},
    });
    if (
      !fixedAssetResponse.data ||
      fixedAssetResponse.data.status !== 0 ||
      !fixedAssetResponse.data.data ||
      !fixedAssetResponse.data.data[0]
    )
      return navigate('/error');
    // let tempFetchedStockCorrection =stockCorrectionResponse.data.data[0]
    // let fetchedStockCorrection={
    //   name:tempFetchedStockCorrection?tempFetchedStockCorrection.product?tempFetchedStockCorrection.product.fullName:'':'':'',
    // }

    if (
      fixedAssetResponse.data.data[0] &&
      fixedAssetResponse.data.data[0].fixedAssetLineList &&
      fixedAssetResponse.data.data[0].fixedAssetLineList.length > 0
    ) {
      getDepreciationLines(fixedAssetResponse.data.data[0]);
    } else {
      dispatch(depreciationLinesActions.resetDepreciationLines());
    }

    // dispatch(stockMoveLineActions.updateExTaxTotal({ exTaxTotal: stockMoveResponse.data.data[0].exTaxTotal || 0 }));
    setIsLoading(false);
    setFixedAsset(fixedAssetResponse.data.data[0]);
    return fixedAssetResponse.data.data[0];
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

  const finishedSaveHandler = (type, msg) => {
    let message = msg ?? 'FIXED_ASSET_SAVED_AS_DRAFT_SUCCESSFULLY';

    if (type === 'Success') {
      alertHandler('Success', t(message));
      setTimeout(() => {
        setIsSave(false);
        navigate(getFeaturePath(subFeature));
      }, [3000]);
    } else {
      alertHandler('error', t('SOMETHING_WENT_WRONG'));
    }
  };

  const finishedComputeDepreciationHandler = (type, message) => {
    if (type === 'Success') {
      alertHandler('Success', message);
      setComputeDepreciation(false);
    } else {
      alertHandler('error', t('SOMETHING_WENT_WRONG'));
    }
  };

  const finishedValidateHandler = (type, msg) => {
    let message = msg ?? 'FIXED_ASSET_VALIDATED_SUCCESSFULLY';

    if (type === 'Success') {
      alertHandler('Success', t(message));
      setTimeout(() => {
        setValidate(false);
        navigate(getFeaturePath(subFeature));
      }, [3000]);
    } else {
      alertHandler('error', t('SOMETHING_WENT_WRONG'));
    }
  };

  const finishedDeleteHandler = status => {
    if (status === 'success') {
      alertHandler('Success', t('LBL_FIXED_ASSET_DELETED'));
      setTimeout(() => {
        setIsDelete(false);
        navigate(getFeaturePath(subFeature));
      }, 3000);
    } else {
      alertHandler('Error', t('SOME_THING_WENT_WORNG'));
    }
  };

  const openDisposalModalHandler = () => {
    if (!(depreciationLines?.length > 0) || !depreciationLines.find(line => line.statusSelect === 2))
      return alertHandler('Error', t('ERROR_DISPOSAL_BEFORE_DEPRECIATION'));
    setDisposal(true);
  };

  useEffect(() => {
    if (addNew) {
      dispatch(depreciationLinesActions.resetDepreciationLines());
    } else {
      fetchFixedAsset(id);
    }
  }, [addNew, enableEdit]);

  let isButtonDisabled = isSave || isDelete || isComputeDepreciation || isValidate;
  return (
    <>
      {showMoreAction && (
        <MoreAction
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          editHandler={
            !enableEdit ? (canEdit && fixedAsset.statusSelect !== FIXED_ASSET_STATUS_REV_ENUM['LBL_TRANSFERED'] ? editHandler : null) : null
          }
          viewHandler={enableEdit ? (canView ? viewHandler : null) : null}
          deleteHandler={
            canDelete && fixedAsset && fixedAsset.statusSelect === FIXED_ASSET_STATUS_REV_ENUM['LBL_DRAFT'] ? deleteHandler : null
          }
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
                <h4>
                  {addNew
                    ? t('LBL_NEW_FIXED_ASSET')
                    : enableEdit
                      ? `${t('LBL_EDIT')} ${t(modelsEnum[subFeature].titleSingular)}`
                      : `${t('LBL_VIEW')} ${t(modelsEnum[subFeature].titleSingular)}`}
                </h4>
              </div>
              <div className="reverse-page float-end">
                <BackButton disabled={isButtonDisabled} text="LBL_BACK" />
                {(addNew || (enableEdit && fixedAsset && fixedAsset.statusSelect < FIXED_ASSET_STATUS_REV_ENUM['LBL_VALIDATED'])) && (
                  <SaveButton disabled={isButtonDisabled} onClick={() => setIsSave(true)} />
                )}
                {enableEdit && fixedAsset && fixedAsset.statusSelect < FIXED_ASSET_STATUS_REV_ENUM['LBL_VALIDATED'] && (
                  <SaveButton text="LBL_VALIDATE" disabled={isButtonDisabled} onClick={() => setValidate(true)} />
                )}
                {enableEdit &&
                  fixedAsset &&
                  fixedAsset.statusSelect >= FIXED_ASSET_STATUS_REV_ENUM['LBL_VALIDATED'] &&
                  fixedAsset.statusSelect !== FIXED_ASSET_STATUS_REV_ENUM['LBL_TRANSFERED'] && (
                    <SaveButton text="LBL_DISPOSAL" disabled={isButtonDisabled} onClick={openDisposalModalHandler} />
                  )}
                {(addNew || (enableEdit && fixedAsset && fixedAsset.statusSelect < FIXED_ASSET_STATUS_REV_ENUM['LBL_VALIDATED'])) && (
                  <SaveButton text="LBL_COMPUTE_DEPRECIATION" disabled={isButtonDisabled} onClick={() => setComputeDepreciation(true)} />
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
                      ? canEdit && fixedAsset.statusSelect !== FIXED_ASSET_STATUS_REV_ENUM['LBL_TRANSFERED']
                        ? editHandler
                        : null
                      : null
                  }
                  viewHandler={enableEdit ? (canView ? viewHandler : null) : null}
                  deleteHandler={
                    canDelete && fixedAsset && fixedAsset.statusSelect === FIXED_ASSET_STATUS_REV_ENUM['LBL_DRAFT'] ? deleteHandler : null
                  }
                  setShowMoreAction={setShowMoreAction}
                  statusBarItems={statusBarItems}
                  currentStatusLabel={(fixedAsset && t(FIXED_ASSET_STATUS_ENUM[fixedAsset.statusSelect])) || t(FIXED_ASSET_STATUS_ENUM[1])}
                />
              )}
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              {showDelete && (
                <ConfirmationPopup
                  item={fixedAsset?.fixedAssetSeq || ''}
                  onClickHandler={() => {
                    setIsDelete(true);
                    setShowDelete(false);
                  }}
                  setConfirmationPopup={setShowDelete}
                />
              )}
              {!isLoading && (
                <>
                  {((fixedAsset && Object.keys(fixedAsset).length > 0) || addNew) && (
                    <>
                      {!addNew && (
                        <FixedAssetForm
                          enableEdit={enableEdit}
                          data={fixedAsset}
                          fetchFixedAsset={fetchFixedAsset}
                          isSave={isSave}
                          isComputeDepreciation={isComputeDepreciation}
                          isValidate={isValidate}
                          isDelete={isDelete}
                          alertHandler={alertHandler}
                          setActionInProgress={setActionInProgress}
                          finishedSaveHandler={finishedSaveHandler}
                          finishedDeleteHandler={finishedDeleteHandler}
                          finishedComputeDepreciationHandler={finishedComputeDepreciationHandler}
                          finishedValidateHandler={finishedValidateHandler}
                        />
                      )}
                      {addNew && (
                        <FixedAssetForm
                          data={fixedAsset}
                          fetchFixedAsset={fetchFixedAsset}
                          addNew={addNew}
                          isSave={isSave}
                          isComputeDepreciation={isComputeDepreciation}
                          isDelete={isDelete}
                          alertHandler={alertHandler}
                          setActionInProgress={setActionInProgress}
                          finishedSaveHandler={finishedSaveHandler}
                          finishedDeleteHandler={finishedDeleteHandler}
                          finishedComputeDepreciationHandler={finishedComputeDepreciationHandler}
                          finishedValidateHandler={finishedValidateHandler}
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

      {isDisposal && (
        <DisposalModal
          show={isDisposal}
          setShow={setDisposal}
          parentContext={fixedAsset}
          header="LBL_DISPOSAL"
          fetchFixedAsset={fetchFixedAsset}
        />
      )}
    </>
  );
}
