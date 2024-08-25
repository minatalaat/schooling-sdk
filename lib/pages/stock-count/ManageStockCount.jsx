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
import StockCountForm from './StockCountForm';
import Calendar from '../../components/ui/Calendar';

import { useAxiosFunction } from '../../hooks/useAxios';
import { checkFlashOrError } from '../../utils/helpers';
import { useFeatures } from '../../hooks/useFeatures';
import { getFetchUrl, getSearchUrl } from '../../services/getUrl';
import { modelsEnum } from '../../constants/modelsEnum/modelsEnum';
import { STOCK_COUNT_FETCH_FIELDS, STOCK_COUNT_LINES_SEARCH_FIELDS } from './StockCountPayloadsFields';
import { STOCK_COUNT_STATUS_ENUM, STOCK_COUNT_STATUS_REV_ENUM } from '../../constants/enums/StockCountEnum';
import { MODELS } from '../../constants/models';
import { inventoryLinesActions } from '../../store/inventoryLines';
import { alertsActions } from '../../store/alerts';

export default function ManageStockCount({ addNew, enableEdit }) {
  const feature = 'STOCK_MANAGEMENT';
  const subFeature = 'STOCK_COUNT';

  const { api } = useAxiosFunction();
  const { t } = useTranslation();
  const { canView, canEdit, canDelete, getFeaturePath } = useFeatures(feature, subFeature);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [stockCount, setStockCount] = useState(null);
  const [isSave, setIsSave] = useState(false);
  const [isFillInventory, setFillInventory] = useState(false);
  const [isPlan, setPlan] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [isStart, setStart] = useState(false);
  const [isComplete, setComplete] = useState(false);
  const [isValidate, setValidate] = useState(false);
  const [isCancel, setCancel] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [isLoading, setIsLoading] = useState(addNew ? false : true);
  let mode = addNew ? 'add' : enableEdit ? 'edit' : 'view';
  let statusBarItems = [];

  if (stockCount && stockCount.statusSelect === STOCK_COUNT_STATUS_REV_ENUM['LBL_CANCELED']) {
    statusBarItems = [
      {
        label: 'LBL_CANCELED',
        className: stockCount && stockCount.statusSelect >= STOCK_COUNT_STATUS_REV_ENUM['LBL_CANCELED'] ? 'done' : 'default',
      },
    ];
  } else {
    statusBarItems = [
      {
        label: 'LBL_DRAFT',
        className: mode === 'add' ? 'default' : 'done',
      },
      {
        label: 'LBL_PLANNED',
        className: stockCount && stockCount.statusSelect >= STOCK_COUNT_STATUS_REV_ENUM['LBL_PLANNED'] ? 'done' : 'default',
      },
      {
        label: 'LBL_IN_PROGRESS',
        className: stockCount && stockCount.statusSelect >= STOCK_COUNT_STATUS_REV_ENUM['LBL_IN_PROGRESS'] ? 'done' : 'default',
      },
      {
        label: 'LBL_REVIEW',
        className: stockCount && stockCount.statusSelect >= STOCK_COUNT_STATUS_REV_ENUM['LBL_REVIEW'] ? 'done' : 'default',
      },
      {
        label: 'LBL_VALIDATED',
        className: stockCount && stockCount.statusSelect >= STOCK_COUNT_STATUS_REV_ENUM['LBL_VALIDATED'] ? 'done' : 'default',
      },
    ];
  }

  const { id } = useParams();

  const alertHandler = (title, message) => {
    if (message) {
      dispatch(alertsActions.initiateAlert({ title, message }));
      setActionInProgress(false);

      if (title !== 'Success') {
        if (isSave) setIsSave(false);
        if (isDelete) setIsDelete(false);
        if (isPlan) setPlan(false);
        if (isFillInventory) setFillInventory(false);
        if (isStart) setStart(false);
        if (isComplete) setComplete(false);
        if (isValidate) setValidate(false);
        if (isCancel) setCancel(false);
      }
    } else {
      if (isSave) setIsSave(false);
      if (isStart) setStart(false);
      if (isDelete) setIsDelete(false);
      if (isPlan) setPlan(false);
      if (isFillInventory) setFillInventory(false);
      if (isStart) setStart(false);
      if (isComplete) setComplete(false);
      if (isValidate) setValidate(false);
      if (isCancel) setCancel(false);
    }
  };

  const getInventoryLinesPayload = data => {
    let fetchLineArray = [];

    if (data) {
      data.forEach(item => {
        fetchLineArray.push(item.id);
      });
    }

    if (fetchLineArray && fetchLineArray.length > 0) {
      let payload = {
        fields: STOCK_COUNT_LINES_SEARCH_FIELDS,
        sortBy: ['product.code'],
        data: {
          _domain: 'self.id in (:_field_ids)',
          _domainContext: {
            id: id,
            _model: 'com.axelor.apps.stock.db.Inventory',
            _field: 'inventoryLineList',
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

  const onInventoryLinesSearchSuccess = response => {
    if (response.data.status === 0) {
      let data = response.data.data;

      if (data && checkFlashOrError(data)) {
        dispatch(inventoryLinesActions.resetInventoryLines());
      } else {
        let tempInventoryLines = [];

        if (data) {
          data.forEach(item => {
            tempInventoryLines.push({
              ...item,
              lineId: Math.floor(Math.random() * 100000).toString(),
            });
          });
        }

        dispatch(inventoryLinesActions.setLines({ inventoryLines: tempInventoryLines }));
      }
    }
  };

  const getInventoryLines = data => {
    api(
      'POST',
      getSearchUrl(MODELS.INVENTORY_LINE),
      getInventoryLinesPayload(data?.inventoryLineList || null),
      onInventoryLinesSearchSuccess
    );
  };

  const finishedExportInventoryLines = (status, data) => {
    if (status === 'success') {
      fetchStockCount(data?.id || null);
    } else {
      alertHandler('Error');
    }
  };

  const finishedImportInventoryLines = (status, data) => {
    if (status === 'success') {
      fetchStockCount(data?.id || null);
      alertHandler('Success', t('LBL_INVENTORY_LINES_IMPORTED_SUCCESSFULLY'));
    } else {
      alertHandler('Error');
    }
  };

  const fetchStockCount = async id => {
    // if (isLoading === false) setIsLoading(true);
    const stockCountResponse = await api('POST', getFetchUrl(MODELS.INVENTORY, id), {
      fields: STOCK_COUNT_FETCH_FIELDS,
      related: {},
    });
    if (
      !stockCountResponse.data ||
      stockCountResponse.data.status !== 0 ||
      !stockCountResponse.data.data ||
      !stockCountResponse.data.data[0]
    )
      return navigate('/error');
    // let tempFetchedStockCorrection =stockCorrectionResponse.data.data[0]
    // let fetchedStockCorrection={
    //   name:tempFetchedStockCorrection?tempFetchedStockCorrection.product?tempFetchedStockCorrection.product.fullName:'':'':'',
    // }

    if (
      stockCountResponse.data.data[0] &&
      stockCountResponse.data.data[0].inventoryLineList &&
      stockCountResponse.data.data[0].inventoryLineList.length > 0
    ) {
      getInventoryLines(stockCountResponse.data.data[0]);
    } else {
      dispatch(inventoryLinesActions.resetInventoryLines());
    }

    // dispatch(stockMoveLineActions.updateExTaxTotal({ exTaxTotal: stockMoveResponse.data.data[0].exTaxTotal || 0 }));
    setIsLoading(false);
    setStockCount(stockCountResponse.data.data[0]);
    return stockCountResponse.data.data[0];
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

  const finishedSaveHandler = status => {
    if (status === 'success') {
      alertHandler('Success', t('LBL_STOCK_COUNT_SAVED_SUCCESS'));
      setTimeout(() => {
        setIsSave(false);
        navigate(getFeaturePath(subFeature));
      }, 3000);
    } else {
      alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    }
  };

  const finishedFillInventoryHandler = (status, data, attach) => {
    if (status === 'success') {
      setFillInventory(false);

      if (!attach) {
        fetchStockCount(data?.id || null);
      }
    } else {
      alertHandler('Error');
    }
  };

  const finishedPlanHandler = status => {
    if (status === 'success') {
      alertHandler('Success', t('LBL_STOCK_COUNT_PLANNED_SUCCESS'));
      setTimeout(() => {
        setPlan(false);
        navigate(getFeaturePath(subFeature));
      }, 3000);
    } else {
      alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    }
  };

  const finishedStartInventoryCountHandler = status => {
    if (status === 'success') {
      // fetchStockCount(data?.id || null);
      alertHandler('Success', t('STOCK_COUNT_STARTED_SUCCESSFULLY'));
      setTimeout(() => {
        setStart(false);
        navigate(getFeaturePath(subFeature));
      }, 3000);
    } else {
      alertHandler('Error');
    }
  };

  const finishedDeleteHandler = status => {
    if (status === 'success') {
      alertHandler('Success', t('LBL_STOCK_COUNT_DELETED'));
      setTimeout(() => {
        setIsDelete(false);
        navigate(getFeaturePath(subFeature));
      }, 3000);
    } else {
      alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    }
  };

  const finishedCompleteHandler = status => {
    if (status === 'success') {
      alertHandler('Success', t('STOCK_COUNT_REVIEWED_SUCCESSFULLY'));
      setTimeout(() => {
        setComplete(false);
        navigate(getFeaturePath(subFeature));
      }, 3000);
    } else {
      alertHandler('Error');
    }
  };

  const finishedValidateHandler = status => {
    if (status === 'success') {
      alertHandler('Success', t('STOCK_COUNT_VALIDATED_SUCCESSFULLY'));
      setTimeout(() => {
        setValidate(false);
        navigate(getFeaturePath(subFeature));
      }, 3000);
    } else {
      alertHandler('Error');
    }
  };

  const finishedCancelHandler = status => {
    if (status === 'success') {
      alertHandler('Success', t('STOCK_COUNT_CANCELED_SUCCESSFULLY'));
      setTimeout(() => {
        setCancel(false);
        navigate(getFeaturePath(subFeature));
      }, 3000);
    } else {
      alertHandler('Error');
    }
  };

  useEffect(() => {
    if (addNew) {
      dispatch(inventoryLinesActions.resetInventoryLines());
    } else {
      fetchStockCount(id);
    }
  }, [addNew, enableEdit]);

  let isButtonDisabled = isSave || isDelete || isPlan || isStart || isFillInventory || isComplete || isValidate || isCancel;
  return (
    <>
      {showMoreAction && (
        <MoreAction
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          editHandler={
            !enableEdit
              ? canEdit && stockCount && stockCount.statusSelect !== STOCK_COUNT_STATUS_REV_ENUM['LBL_CANCELED']
                ? editHandler
                : null
              : null
          }
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
                    ? t('LBL_ADD_STOCK_COUNT')
                    : enableEdit
                      ? `${t('LBL_EDIT')} ${t(modelsEnum[subFeature].titleSingular)}`
                      : `${t('LBL_VIEW')} ${t(modelsEnum[subFeature].titleSingular)}`}
                </h4>
              </div>

              <div className="reverse-page float-end">
                <BackButton text="LBL_BACK" />
                {enableEdit && stockCount && stockCount.statusSelect >= STOCK_COUNT_STATUS_REV_ENUM['LBL_DRAFT'] && (
                  <PrimaryButton theme="red" text="LBL_CANCEL" disabled={isButtonDisabled} onClick={() => setCancel(true)} />
                )}
                {(addNew || (enableEdit && stockCount && stockCount.statusSelect < STOCK_COUNT_STATUS_REV_ENUM['LBL_PLANNED'])) && (
                  <PrimaryButton disabled={isButtonDisabled} onClick={() => setIsSave(true)} />
                )}
                {enableEdit && stockCount && stockCount.statusSelect < STOCK_COUNT_STATUS_REV_ENUM['LBL_PLANNED'] && (
                  <PrimaryButton text="LBL_PLAN" disabled={isButtonDisabled} onClick={() => setPlan(true)} />
                )}
                {enableEdit && stockCount && stockCount.statusSelect === STOCK_COUNT_STATUS_REV_ENUM['LBL_PLANNED'] && (
                  <PrimaryButton text="LBL_START" disabled={isButtonDisabled} onClick={() => setStart(true)} />
                )}
                {enableEdit && stockCount && stockCount.statusSelect === STOCK_COUNT_STATUS_REV_ENUM['LBL_IN_PROGRESS'] && (
                  <PrimaryButton text="LBL_END_COUNT" disabled={isButtonDisabled} onClick={() => setComplete(true)} />
                )}
                {enableEdit && stockCount && stockCount.statusSelect === STOCK_COUNT_STATUS_REV_ENUM['LBL_REVIEW'] && (
                  <PrimaryButton text="LBL_VALIDATE" disabled={isButtonDisabled} onClick={() => setValidate(true)} />
                )}

                {(addNew || (enableEdit && stockCount && stockCount.statusSelect < STOCK_COUNT_STATUS_REV_ENUM['LBL_PLANNED'])) && (
                  <PrimaryButton text="LBL_FILL_INVENTORY" disabled={isButtonDisabled} onClick={() => setFillInventory(true)} />
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
                      ? canEdit && stockCount && stockCount.statusSelect !== STOCK_COUNT_STATUS_REV_ENUM['LBL_CANCELED']
                        ? editHandler
                        : null
                      : null
                  }
                  viewHandler={enableEdit ? (canView ? viewHandler : null) : null}
                  deleteHandler={canDelete ? deleteHandler : null}
                  setShowMoreAction={setShowMoreAction}
                  statusBarItems={statusBarItems}
                  currentStatusLabel={(stockCount && t(STOCK_COUNT_STATUS_ENUM[stockCount.statusSelect])) || t(STOCK_COUNT_STATUS_ENUM[1])}
                />
              )}
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              {showDelete && (
                <ConfirmationPopup
                  item={stockCount?.inventorySeq || ''}
                  onClickHandler={() => {
                    setIsDelete(true);
                    setShowDelete(false);
                  }}
                  setConfirmationPopup={setShowDelete}
                />
              )}
              {!isLoading && (
                <>
                  {((stockCount && Object.keys(stockCount).length > 0) || addNew) && (
                    <>
                      {!addNew && (
                        <StockCountForm
                          enableEdit={enableEdit}
                          data={stockCount}
                          fetchStockCount={fetchStockCount}
                          isSave={isSave}
                          isFillInventory={isFillInventory}
                          isPlan={isPlan}
                          isStart={isStart}
                          isComplete={isComplete}
                          isValidate={isValidate}
                          isCancel={isCancel}
                          isDelete={isDelete}
                          finishedDeleteHandler={finishedDeleteHandler}
                          alertHandler={alertHandler}
                          setActionInProgress={setActionInProgress}
                          finishedSaveHandler={finishedSaveHandler}
                          finishedPlanHandler={finishedPlanHandler}
                          finishedExportInventoryLines={finishedExportInventoryLines}
                          finishedImportInventoryLines={finishedImportInventoryLines}
                          finishedFillInventoryHandler={finishedFillInventoryHandler}
                          finishedStartInventoryCountHandler={finishedStartInventoryCountHandler}
                          finishedCompleteHandler={finishedCompleteHandler}
                          finishedValidateHandler={finishedValidateHandler}
                          finishedCancelHandler={finishedCancelHandler}
                        />
                      )}
                      {addNew && (
                        <StockCountForm
                          data={stockCount}
                          addNew={addNew}
                          isSave={isSave}
                          isFillInventory={isFillInventory}
                          finishedSaveHandler={finishedSaveHandler}
                          alertHandler={alertHandler}
                          setActionInProgress={setActionInProgress}
                          finishedFillInventoryHandler={finishedFillInventoryHandler}
                          fetchStockCount={fetchStockCount}
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
