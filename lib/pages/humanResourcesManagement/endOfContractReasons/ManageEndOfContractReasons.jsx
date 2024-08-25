import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import Spinner from '../../../components/Spinner/Spinner';
import ConfirmationPopup from '../../../components/ConfirmationPopup';
import ActionsProgessBar from '../../../parts/ActionsProgessBar';
import MoreAction from '../../../parts/MoreAction';
import BreadCrumb from '../../../components/ui/BreadCrumb';
import BackButton from '../../../components/ui/buttons/BackButton';
import EndOfContractReasonForm from './EndOfContractReasonForm';
import Calendar from '../../../components/ui/Calendar';
import PrimaryButton from '../../../components/ui/buttons/PrimaryButton';

import { useAxiosFunction } from '../../../hooks/useAxios';
import { useFeatures } from '../../../hooks/useFeatures';
import { getFetchUrl } from '../../../services/getUrl';
import { modelsEnum } from '../../../constants/modelsEnum/modelsEnum';
import { alertsActions } from '../../../store/alerts';

const ManageEndOfContractReasons = ({ addNew, enableEdit }) => {
  const feature = 'HR_MANAGEMENT';
  const subFeature = 'END_OF_CONTRACT_REASONS';

  const { api } = useAxiosFunction();
  const { t } = useTranslation();
  const { canView, canEdit, canDelete, getFeaturePath } = useFeatures(feature, subFeature);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fields = ['reason'];

  const [endOfContractReason, setEndOfContractReason] = useState({});
  const [isSave, setIsSave] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [isLoading, setIsLoading] = useState(addNew ? false : true);

  const { id } = useParams();

  const alertHandler = (title, message) => {
    dispatch(alertsActions.initiateAlert({ title, message }));

    if (title !== 'Success') {
      if (isSave) setIsSave(false);
      if (isDelete) setIsDelete(false);
    }
  };

  const finshedSaveHandler = status => {
    if (status === 'success') {
      alertHandler('Success', t('END_OF_CONTRACT_REASON_SAVED_SUCCESS'));
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
      alertHandler('Success', t('END_OF_CONTRACT_REASON_DELETED_SUCCESS'));
      setTimeout(() => {
        setIsDelete(false);
        navigate(getFeaturePath(subFeature));
      }, 3000);
    } else {
      alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    }
  };

  const getEndOfContractReason = async () => {
    if (addNew) return null;

    if (isLoading === false) setIsLoading(true);
    const endOfContractReasonResponse = await api('POST', getFetchUrl(modelsEnum[subFeature].name, id), {
      fields: fields,
      related: {},
    });
    if (
      !endOfContractReasonResponse.data ||
      endOfContractReasonResponse.data.status !== 0 ||
      !endOfContractReasonResponse.data.data ||
      !endOfContractReasonResponse.data.data[0]
    )
      return navigate('/error');

    setEndOfContractReason(endOfContractReasonResponse.data.data[0]);
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
    getEndOfContractReason();
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
            modelsEnumKey: 'END_OF_CONTRACT_REASON',
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
                <h4>{addNew ? t('LBL_NEW_END_OF_CONTRACT_REASON') : endOfContractReason.reason ? endOfContractReason.reason : ''}</h4>
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
                  editHandler={!enableEdit ? (canEdit ? editHandler : null) : null}
                  viewHandler={enableEdit ? (canView ? viewHandler : null) : null}
                  deleteHandler={canDelete ? deleteHandler : null}
                  setShowMoreAction={setShowMoreAction}
                />
              )}
              {showDelete && (
                <ConfirmationPopup
                  item={endOfContractReason?.reason}
                  onClickHandler={() => {
                    setIsDelete(true);
                    setShowDelete(false);
                  }}
                  setConfirmationPopup={setShowDelete}
                />
              )}
              {!isLoading && (
                <>
                  {(Object.keys(endOfContractReason).length > 0 || addNew) && (
                    <>
                      {!addNew && (
                        <EndOfContractReasonForm
                          enableEdit={enableEdit}
                          data={endOfContractReason}
                          isSave={isSave}
                          finshedSaveHandler={finshedSaveHandler}
                          isDelete={isDelete}
                          finshedDeleteHandler={finshedDeleteHandler}
                          alertHandler={alertHandler}
                          setActionInProgress={setActionInProgress}
                        />
                      )}
                      {addNew && (
                        <EndOfContractReasonForm
                          data={endOfContractReason}
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
};

export default ManageEndOfContractReasons;
