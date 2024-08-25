import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import Spinner from '../../components/Spinner/Spinner';
import ConfirmationPopup from '../../components/ConfirmationPopup';
import MoreAction from '../../parts/MoreAction';
import BreadCrumb from '../../components/ui/BreadCrumb';
import BackButton from '../../components/ui/buttons/BackButton';
import StockLocationForm from './StockLocationsForm';
import Calendar from '../../components/ui/Calendar';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';
import ActionsProgessBar from '../../parts/ActionsProgessBar';

import { useAxiosFunction } from '../../hooks/useAxios';
import { useFeatures } from '../../hooks/useFeatures';
import { getFetchUrl } from '../../services/getUrl';
import { modelsEnum } from '../../constants/modelsEnum/modelsEnum';
import { alertsActions } from '../../store/alerts';

export default function ManageStockLocations({ addNew, enableEdit }) {
  const feature = 'STOCK_MANAGEMENT';
  const subFeature = 'STOCK_LOCATIONS';

  const { api } = useAxiosFunction();
  const { t } = useTranslation();
  const { canView, canEdit, canDelete, getFeaturePath } = useFeatures(feature, subFeature);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fields = [
    'tradingName',
    'address',
    'serialNumber',
    'isNotInCalculStock',
    'usableOnPurchaseOrder',
    'isWorkshop',
    'stockLocationValue',
    'typeSelect',
    'isNotInMrp',
    'usableOnSaleOrder',
    'barCode',
    'isValued',
    'includeVirtualSubLocation',
    'partner',
    'directOrderLocation',
    'usableOnProduction',
    'name',
    'includeOutOfStock',
    'barcodeTypeConfig',
    'parentStockLocation',
    'company',
    'isOutsourcingLocation',
  ];

  const [stockLocation, setStockLocation] = useState({});
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

  const finshedSaveHandler = status => {
    if (status === 'success') {
      alertHandler('Success', t('STOCK_LOCATION_SAVED_SUCCESS'));
      setTimeout(() => {
        setIsSave(false);
        navigate(getFeaturePath(subFeature));
      }, 3000);
    } else {
      alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    }
  };

  const finshedDeleteHandler = status => {
    if (status === 'success') {
      alertHandler('Success', t('STOCK_LOCATION_DELETED_SUCCESS'));
      setTimeout(() => {
        setIsDelete(false);
        navigate(getFeaturePath(subFeature));
      }, 3000);
    } else {
      alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    }
  };

  const getStockLocation = async () => {
    if (addNew) return null;

    if (isLoading === false) setIsLoading(true);
    const stockLocationResponse = await api('POST', getFetchUrl(modelsEnum[subFeature].name, id), { fields: fields, related: {} });
    if (
      !stockLocationResponse.data ||
      stockLocationResponse.data.status !== 0 ||
      !stockLocationResponse.data.data ||
      !stockLocationResponse.data.data[0]
    )
      return navigate('/error');

    setStockLocation(stockLocationResponse.data.data[0]);
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
    getStockLocation();
  }, [addNew, enableEdit]);

  return (
    <>
      {showMoreAction && (
        <MoreAction
          showMoreAction={showMoreAction}
          setShowMoreAction={setShowMoreAction}
          editHandler={!enableEdit ? (canEdit ? editHandler : null) : null}
          viewHandler={enableEdit ? (canView ? viewHandler : null) : null}
          deleteHandler={canDelete ? deleteHandler : null}
          showSearch={false}
          canSelectAll={false}
          bulkActionConfig={{
            canDelete: canDelete,
            modelsEnumKey: 'STOCK_LOCATIONS',
          }}
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
                <h4>{addNew ? t('LBL_NEW_STOCK_LOCATION') : stockLocation.name ? stockLocation.name : ''}</h4>
              </div>

              <div className="reverse-page float-end">
                <BackButton disabled={isSave || isDelete} text={addNew ? 'LBL_CANCEL' : 'LBL_BACK'} />
                {(addNew || enableEdit) && <PrimaryButton onClick={() => setIsSave(true)} disabled={isSave || isDelete} />}
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
                  editHandler={!enableEdit && stockLocation?.typeSelect !== 3 ? (canEdit ? editHandler : null) : null}
                  viewHandler={enableEdit ? (canView ? viewHandler : null) : null}
                  deleteHandler={canDelete && stockLocation?.typeSelect !== 3 ? deleteHandler : null}
                />
              )}
              {showDelete && (
                <ConfirmationPopup
                  item={stockLocation.name}
                  onClickHandler={() => {
                    setIsDelete(true);
                    setShowDelete(false);
                  }}
                  setConfirmationPopup={setShowDelete}
                />
              )}
              {!isLoading && (
                <>
                  {(Object.keys(stockLocation).length > 0 || addNew) && (
                    <>
                      {!addNew && (
                        <StockLocationForm
                          enableEdit={enableEdit}
                          data={stockLocation}
                          isSave={isSave}
                          finshedSaveHandler={finshedSaveHandler}
                          isDelete={isDelete}
                          finshedDeleteHandler={finshedDeleteHandler}
                          alertHandler={alertHandler}
                          setActionInProgress={setActionInProgress}
                        />
                      )}
                      {addNew && (
                        <StockLocationForm
                          data={stockLocation}
                          addNew={addNew}
                          isSave={isSave}
                          finshedSaveHandler={finshedSaveHandler}
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
