import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import Spinner from '../../components/Spinner/Spinner';
import ConfirmationPopup from '../../components/ConfirmationPopup';
import PaymentConditionForm from './PaymentConditionForm';
import Toolbar from '../../parts/Toolbar';
import MoreAction from '../../parts/MoreAction';
import BreadCrumb from '../../components/ui/BreadCrumb';
import BackButton from '../../components/ui/buttons/BackButton';
import Calendar from '../../components/ui/Calendar';

import { MODELS } from '../../constants/models';
import { useAxiosFunction } from '../../hooks/useAxios';
import { getFetchUrl } from '../../services/getUrl';
import { useFeatures } from '../../hooks/useFeatures';
import { alertsActions } from '../../store/alerts';
import { newTabActions } from '../../store/newTab';
import FormNotes from '../../components/ui/FormNotes';

const PaymentConditionsEdit = ({ addNew, enableEdit }) => {
  const { api } = useAxiosFunction();
  const { canView, canEdit, canDelete, getFeaturePath } = useFeatures('APP_CONFIG', 'PAYMENT_CONDITIONS');
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const originTab = useSelector(state => state.newTab.originTab);

  const [paymentCondition, setPaymentCondition] = useState({});
  const [isSave, setIsSave] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [isLoading, setIsLoading] = useState(addNew ? false : true);

  const { id } = useParams();

  const fields = ['name', 'code', 'typeSelect', 'paymentTime', 'periodTypeSelect'];

  const alertHandler = (title, message) => {
    if (message) dispatch(alertsActions.initiateAlert({ title, message }));

    if (title !== 'Success' || !message) {
      if (isSave) setIsSave(false);
      if (isDelete) setIsDelete(false);
    }
  };

  const finshedSaveHandler = status => {
    if (status === 'success') {
      alertHandler('Success', t('PAYMENT_CONDITION_SAVED_SUCCESS'));
      setTimeout(() => {
        setIsSave(false);
        if (originTab) return dispatch(newTabActions.returnToOrigin());
        navigate(getFeaturePath('PAYMENT_CONDITIONS'));
      }, 3000);
    } else {
      alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    }
  };

  const finshedDeleteHandler = status => {
    if (status === 'success') {
      alertHandler('Success', t('PAYMENT_CONDITION_DELETED_SUCCESS'));
      setTimeout(() => {
        setIsDelete(false);
        navigate(getFeaturePath('PAYMENT_CONDITIONS'));
      }, 3000);
    } else {
      alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    }
  };

  const fetchPaymentCondition = () => {
    const payload = {
      fields: fields,
      related: {},
    };
    return api('POST', getFetchUrl(MODELS.PAYMENTCONDITION, id), payload);
  };

  const fetchElementData = async () => {
    if (isLoading === false && !addNew) setIsLoading(true);

    if (addNew) return null;

    const paymentConditionResponse = await fetchPaymentCondition();

    if (
      !paymentConditionResponse ||
      !paymentConditionResponse.data ||
      paymentConditionResponse.data.status !== 0 ||
      !paymentConditionResponse.data.data ||
      !paymentConditionResponse.data.data[0]
    ) {
      setIsLoading(false);
      navigate('/error');
      return null;
    }

    setPaymentCondition({ ...paymentConditionResponse.data.data[0] });
    setIsLoading(false);
  };

  const viewHandler = () => {
    navigate(getFeaturePath('PAYMENT_CONDITIONS', 'view', { id }));
    setShowMoreAction(false);
  };

  const editHandler = () => {
    navigate(getFeaturePath('PAYMENT_CONDITIONS', 'edit', { id }));
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
                subFeature="PAYMENT_CONDITIONS"
                modeText={
                  !addNew && enableEdit
                    ? `${t('LBL_EDIT')} ${t('LBL_PAYMENT_CONDITION')}`
                    : !addNew && !enableEdit
                      ? `${t('LBL_VIEW')} ${t('LBL_PAYMENT_CONDITION')}`
                      : 'LBL_ADD_PAYMENT_CONDITION'
                }
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{addNew ? t('LBL_NEW_PAYMENT_TERM') : paymentCondition.name ? paymentCondition.name : ''}</h4>
              </div>

              <div className="reverse-page float-end">
                <BackButton disabled={isSave || isDelete} text={addNew ? 'LBL_CANCEL' : 'LBL_BACK'} />
                {(addNew || enableEdit) && (
                  <button className="btn btn-save" onClick={() => setIsSave(true)} disabled={isSave || isDelete}>
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
                    modelsEnumKey: 'PAYMENT_CONDITIONS',
                  }}
                />
              )}
              {showDelete && (
                <ConfirmationPopup
                  item={paymentCondition.name}
                  onClickHandler={() => {
                    setIsDelete(true);
                    setShowDelete(false);
                  }}
                  setConfirmationPopup={setShowDelete}
                />
              )}
              <div className="card">
                <div className="row">
                  {(Object.keys(paymentCondition).length > 0 || addNew) && (
                    <>
                      {!addNew && (
                        <PaymentConditionForm
                          enableEdit={enableEdit}
                          data={paymentCondition}
                          isSave={isSave}
                          finshedSaveHandler={finshedSaveHandler}
                          isDelete={isDelete}
                          finshedDeleteHandler={finshedDeleteHandler}
                          alertHandler={alertHandler}
                          setActionInProgress={setActionInProgress}
                        />
                      )}
                      {addNew && (
                        <PaymentConditionForm
                          data={paymentCondition}
                          addNew={addNew}
                          isSave={isSave}
                          finshedSaveHandler={finshedSaveHandler}
                          alertHandler={alertHandler}
                          setActionInProgress={setActionInProgress}
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentConditionsEdit;
