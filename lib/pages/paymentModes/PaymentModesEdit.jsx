import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import Spinner from '../../components/Spinner/Spinner';
import PaymentModesForm from './PaymentModesForm';
import Toolbar from '../../parts/Toolbar';
import MoreAction from '../../parts/MoreAction';
import BreadCrumb from '../../components/ui/BreadCrumb';
import BackButton from '../../components/ui/buttons/BackButton';
import Calendar from '../../components/ui/Calendar';

import { useAxiosFunction } from '../../hooks/useAxios';
import { MODELS } from '../../constants/models';
import ConfirmationPopup from '../../components/ConfirmationPopup';
import { getFetchUrl, getSearchUrl } from '../../services/getUrl';
import { useFeatures } from '../../hooks/useFeatures';
import { alertsActions } from '../../store/alerts';
import { newTabActions } from '../../store/newTab';
import FormNotes from '../../components/ui/FormNotes';

const PaymentModesEdit = ({ addNew, enableEdit }) => {
  const { api } = useAxiosFunction();
  const { canView, canEdit, canDelete, getFeaturePath } = useFeatures('APP_CONFIG', 'PAYMENT_MODES');
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [paymentMode, setPaymentMode] = useState({});
  const [isSave, setIsSave] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [configurationList, setConfigurationList] = useState(null);
  const [isLoading, setIsLoading] = useState(addNew ? false : true);

  const { id } = useParams();
  const originTab = useSelector(state => state.newTab.originTab);

  const fields = ['name', 'code', 'typeSelect', 'accountManagementList', 'inOutSelect'];

  const alertHandler = (title, message) => {
    if (message) dispatch(alertsActions.initiateAlert({ title, message }));

    if (title !== 'Success' || !message) {
      if (isSave) setIsSave(false);
      if (isDelete) setIsDelete(false);
    }
  };

  const finshedSaveHandler = status => {
    if (status === 'success') {
      alertHandler('Success', t('PAYMENT_MODE_SAVED_SUCCESS'));
      setTimeout(() => {
        if (originTab) return dispatch(newTabActions.returnToOrigin());
        setIsSave(false);
        navigate(getFeaturePath('PAYMENT_MODES'));
      }, 3000);
    } else {
      alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    }
  };

  const finshedDeleteHandler = status => {
    if (status === 'success') {
      alertHandler('Success', t('PAYMENT_MODE_DELETED_SUCCESS'));
      setTimeout(() => {
        setIsDelete(false);
        navigate(getFeaturePath('PAYMENT_MODES'));
      }, 3000);
    } else {
      alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    }
  };

  const fetchPaymentMode = () => {
    const payload = {
      fields: fields,
      related: {},
    };
    return api('POST', getFetchUrl(MODELS.PAYMENTMODES, id), payload);
  };

  const getAccountManagement = (paymentModeData, idList) => {
    return api('POST', getSearchUrl(MODELS.ACCOUNT_MANAGEMENT), {
      data: {
        _archived: true,
        _domain: 'self.id in (:_field_ids)',
        _domainContext: {
          id: paymentModeData.id,
          _field: 'accountManagementList',
          _field_ids: idList,
          _model: MODELS.PAYMENTMODES,
        },
      },
      fields: ['bankDetails', 'sequence', 'journal', 'cashAccount', 'typeSelect', 'company'],
      limit: -1,
      offset: 0,
      sortBy: null,
      translate: true,
    });
  };

  const fetchElementData = async () => {
    if (isLoading === false && !addNew) setIsLoading(true);

    if (addNew) return null;

    const paymentModeResponse = await fetchPaymentMode();

    if (
      !paymentModeResponse ||
      !paymentModeResponse.data ||
      paymentModeResponse.data.status !== 0 ||
      !paymentModeResponse.data.data ||
      !paymentModeResponse.data.data[0]
    ) {
      setIsLoading(false);
      navigate('/error');
      return null;
    }

    let paymentModeData = paymentModeResponse.data.data[0];

    if (paymentModeData.accountManagementList && paymentModeData.accountManagementList.length > 0) {
      let idList = [];
      paymentModeData.accountManagementList.forEach(accountManagement => idList.push(accountManagement.id));

      const accountManagementResponse = await getAccountManagement(paymentModeData, idList);

      if (
        !accountManagementResponse ||
        !accountManagementResponse.data ||
        accountManagementResponse.data.status !== 0 ||
        !accountManagementResponse.data.data
      ) {
        setIsLoading(false);
        navigate('/error');
        return null;
      }

      setConfigurationList([...accountManagementResponse.data.data]);
    }

    setPaymentMode({ ...paymentModeData });
    setIsLoading(false);
  };

  const viewHandler = () => {
    navigate(getFeaturePath('PAYMENT_MODES', 'view', { id }));
    setShowMoreAction(false);
  };

  const editHandler = () => {
    navigate(getFeaturePath('PAYMENT_MODES', 'edit', { id }));
    setShowMoreAction(false);
  };

  const deleteHandler = () => {
    setShowDelete(true);
  };

  useEffect(() => {
    fetchElementData();
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
                feature="APP_CONFIG"
                subFeature="PAYMENT_MODES"
                modeText={
                  !addNew && enableEdit
                    ? `${t('LBL_EDIT')} ${t('LBL_PAYMENT_MODE')}`
                    : !addNew && !enableEdit
                      ? `${t('LBL_VIEW')} ${t('LBL_PAYMENT_MODE')}`
                      : 'LBL_ADD_PAYMENT_MODE'
                }
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{addNew ? t('LBL_NEW_PAYMENT_MODE') : paymentMode.name ? paymentMode.name : ''}</h4>
              </div>

              <div className="reverse-page float-end">
                <BackButton disabled={isSave || isDelete} text={addNew ? 'LBL_CANCEL' : 'LBL_BACK'} />
                {(addNew || enableEdit) && (
                  <button className="btn btn-save" onClick={() => setIsSave(true)} disabled={isSave || isDelete}>
                    {' '}
                    {t('LBL_SAVE')}
                  </button>
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
                  showSearch={false}
                  canSelectAll={false}
                  bulkActionConfig={{
                    canDelete: canDelete,
                    modelsEnumKey: 'PAYMENT_MODES',
                  }}
                />
              )}
              {showDelete && (
                <ConfirmationPopup
                  item={paymentMode.name}
                  onClickHandler={() => {
                    setIsDelete(true);
                    setShowDelete(false);
                  }}
                  setConfirmationPopup={setShowDelete}
                />
              )}
              {!isLoading && (
                <div className="card">
                  <div className="row">
                    {(Object.keys(paymentMode).length > 0 || addNew) && (
                      <>
                        {!addNew && (
                          <PaymentModesForm
                            enableEdit={enableEdit}
                            data={paymentMode}
                            isSave={isSave}
                            finshedSaveHandler={finshedSaveHandler}
                            isDelete={isDelete}
                            finshedDeleteHandler={finshedDeleteHandler}
                            alertHandler={alertHandler}
                            setActionInProgress={setActionInProgress}
                            configurationList={configurationList}
                            setConfigurationList={setConfigurationList}
                          />
                        )}
                        {addNew && (
                          <PaymentModesForm
                            data={paymentMode}
                            addNew={addNew}
                            isSave={isSave}
                            finshedSaveHandler={finshedSaveHandler}
                            alertHandler={alertHandler}
                            setActionInProgress={setActionInProgress}
                            configurationList={configurationList}
                            setConfigurationList={setConfigurationList}
                          />
                        )}
                      </>
                    )}
                  </div>
                  {(addNew || enableEdit) && (
                    <FormNotes
                      notes={[
                        {
                          title: 'LBL_REQUIRED_NOTIFY',
                          type: 3,
                        },
                      ]}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentModesEdit;
