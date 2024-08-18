import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import FinancialAccountForm from './FinancialAccountForm';
import ConfirmationPopup from '../../components/ConfirmationPopup';
import Toolbar from '../../parts/Toolbar';
import MoreAction from '../../parts/MoreAction';
import BreadCrumb from '../../components/ui/BreadCrumb';
import BackButton from '../../components/ui/buttons/BackButton';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';
import Calendar from '../../components/ui/Calendar';
import Spinner from '../../components/Spinner/Spinner';

import { checkFlashOrError } from '../../utils/helpers';
import { useFeatures } from '../../hooks/useFeatures';
import { useFinancialAccountsServices } from '../../services/apis/useFinancialAccountsServices';
import { alertsActions } from '../../store/alerts';

const FinancialAccountsEdit = ({ commonPosition, addNew, enableEdit }) => {
  const { canView, canDelete, canEdit, getFeaturePath } = useFeatures('ACCOUNTING', 'FINANCIAL_ACCOUNTS');
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { fetchAccountBalanceService, fetchFinancialAccountService } = useFinancialAccountsServices();
  const dispatch = useDispatch();

  const [account, setAccount] = useState({});
  const [balance, setBalance] = useState({});
  const [isSave, setIsSave] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [isLoading, setIsLoading] = useState(addNew ? false : true);

  const { id } = useParams();

  const alertHandler = (title, message) => {
    if (message) dispatch(alertsActions.initiateAlert({ title, message }));
    if (isSave) setIsSave(false);
    if (isDelete) setIsDelete(false);
  };

  const finshedSaveHandler = (status, message) => {
    if (status === 'success') {
      alertHandler('Success', t('FINANCIAL_ACCOUNT_SAVED_SUCCESS'));
      setTimeout(() => {
        setIsSave(false);
        navigate(getFeaturePath('FINANCIAL_ACCOUNTS'));
      }, 3000);
    } else {
      alertHandler('Error', t(message ? message : 'SOMETHING_WENT_WRONG'));
    }
  };

  const finshedDeleteHandler = status => {
    if (status === 'success') {
      alertHandler('Success', t('FINANCIAL_ACCOUNT_DELETED_SUCCESS'));
      setTimeout(() => {
        setIsDelete(false);
        navigate(getFeaturePath('FINANCIAL_ACCOUNTS'));
      }, 3000);
    } else {
      alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    }
  };

  const fetchElementData = async () => {
    if (isLoading === false && !addNew) setIsLoading(true);

    let commonPositionList = commonPosition.data;

    if (!commonPositionList) {
      const metaDataResponse = await commonPosition.fetchData();

      if (
        !metaDataResponse ||
        !metaDataResponse.data ||
        metaDataResponse.data.status !== 0 ||
        !metaDataResponse.data.data ||
        !metaDataResponse.data.data.fields
      ) {
        setIsLoading(false);
        navigate('/error');
        return null;
      }

      commonPositionList = metaDataResponse.data.data.fields.find(field => field.selection === 'account.account.common.position.select');

      if (!commonPositionList) {
        setIsLoading(false);
        navigate('/error');
        return null;
      }

      commonPositionList = [...commonPositionList.selectionList];
      commonPosition.setData(commonPositionList);
    }

    if (addNew) return null;

    const accountResponseData = await fetchFinancialAccountService(id);

    const balanceResponse = await fetchAccountBalanceService(accountResponseData.data[0]);
    if (!balanceResponse || balanceResponse.status !== 0 || !balanceResponse.data) alertHandler('Error', t('SOMETHING_WENT_WRONG'));

    if (checkFlashOrError(balanceResponse.data)) alertHandler('Error', t('SOMETHING_WENT_WRONG'));

    let balanceBtn = balanceResponse?.data?.accountOpeningBalance;
    if (balanceBtn) setBalance(balanceBtn);
    setAccount({ ...accountResponseData.data[0] });
    setIsLoading(false);
  };

  const viewHandler = () => {
    navigate(getFeaturePath('FINANCIAL_ACCOUNTS', 'view', { id }));
    setShowMoreAction(false);
  };

  const editHandler = () => {
    navigate(getFeaturePath('FINANCIAL_ACCOUNTS', 'edit', { id }));
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
                feature="ACCOUNTING"
                subFeature="FINANCIAL_ACCOUNTS"
                modeText={
                  !addNew && enableEdit
                    ? `${t('LBL_EDIT')} ${t('LBL_FINANCIAL_ACCOUNT')}`
                    : !addNew && !enableEdit
                      ? `${t('LBL_VIEW')} ${t('LBL_FINANCIAL_ACCOUNT')}`
                      : 'LBL_ADD_FINANCIAL_ACCOUNT'
                }
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="info-tite-page float-start">
                <h4>{addNew ? t('LBL_NEW_FINANCIAL_ACCOUNT') : account.name ? account.name : ''}</h4>
              </div>

              <div className="reverse-page float-end">
                <BackButton disabled={isSave || isDelete} text={addNew ? 'LBL_CANCEL' : 'LBL_BACK'} />

                {(addNew || enableEdit) && <PrimaryButton disabled={isSave || isDelete} onClick={() => setIsSave(true)} />}
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
                    modelsEnumKey: 'FINANCIAL_ACCOUNTS',
                  }}
                />
              )}
              {showDelete && (
                <ConfirmationPopup
                  item={account.name}
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
                    {(Object.keys(account).length > 0 || addNew) && (
                      <>
                        {!addNew && (
                          <FinancialAccountForm
                            enableEdit={enableEdit}
                            data={account}
                            balance={balance}
                            isSave={isSave}
                            finshedSaveHandler={finshedSaveHandler}
                            isDelete={isDelete}
                            finshedDeleteHandler={finshedDeleteHandler}
                            alertHandler={alertHandler}
                            setActionInProgress={setActionInProgress}
                          />
                        )}
                        {addNew && (
                          <FinancialAccountForm
                            data={account}
                            balance={balance}
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
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FinancialAccountsEdit;
