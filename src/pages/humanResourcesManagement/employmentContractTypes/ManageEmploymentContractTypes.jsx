import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { useDispatch } from 'react-redux';

import Spinner from '../../../components/Spinner/Spinner';
import ConfirmationPopup from '../../../components/ConfirmationPopup';
import ActionsProgessBar from '../../../parts/ActionsProgessBar';
import MoreAction from '../../../parts/MoreAction';
import BreadCrumb from '../../../components/ui/BreadCrumb';
import BackButton from '../../../components/ui/buttons/BackButton';
import PrimaryButton from '../../../components/ui/buttons/PrimaryButton';
import EmploymentContractTypeForm from './EmploymentContractTypeForm';
import Calendar from '../../../components/ui/Calendar';

import { MODELS } from '../../../constants/models';
import { useAxiosFunction } from '../../../hooks/useAxios';
import { useFeatures } from '../../../hooks/useFeatures';
import { getFetchUrl, getSearchUrl } from '../../../services/getUrl';
import { modelsEnum } from '../../../constants/modelsEnum/modelsEnum';
import { alertsActions } from '../../../store/alerts';

const ManageEmploymentContractTypes = ({ addNew, enableEdit }) => {
  const feature = 'HR_MANAGEMENT';
  const subFeature = 'EMPLOYMENT_CONTRACT_TYPES';

  const { api } = useAxiosFunction();
  const { t } = useTranslation();
  const { canView, canEdit, canDelete, getFeaturePath } = useFeatures(feature, subFeature);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fields = ['isNoLongerUsed', 'name', 'description', 'employmentContractSubTypeList'];

  const [contractType, setContractType] = useState({});
  const [isSave, setIsSave] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [showMoreAction, setShowMoreAction] = useState(false);
  const [isLoading, setIsLoading] = useState(addNew ? false : true);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [contractSubTypeList, setContractSubTypeList] = useState([]);

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
      alertHandler('Success', t('CONTRACT_TYPE_SAVED_SUCCESS'));
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
      alertHandler('Success', t('CONTRACT_TYPE_DELETED_SUCCESS'));
      setTimeout(() => {
        setIsDelete(false);
        navigate(getFeaturePath(subFeature));
      }, 3000);
    } else {
      alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    }
  };

  const getContractType = async () => {
    if (addNew) return null;

    if (isLoading === false) setIsLoading(true);
    const contractTypeResponse = await api('POST', getFetchUrl(modelsEnum[subFeature].name, id), {
      fields: fields,
      related: {},
    });
    if (
      !contractTypeResponse.data ||
      contractTypeResponse.data.status !== 0 ||
      !contractTypeResponse.data.data ||
      !contractTypeResponse.data.data[0]
    )
      return navigate('/error');

    setContractType(contractTypeResponse.data.data[0]);
    let contractSubTypeList = contractTypeResponse.data.data[0].employmentContractSubTypeList;
    setIsTableLoading(true);

    if (contractSubTypeList && contractSubTypeList.length > 0) {
      let tempIDs = [];
      contractSubTypeList.forEach(line => {
        if (line.id) {
          tempIDs.push(line.id);
        }
      });
      getContractSubTypeList(tempIDs);
    } else {
      setIsTableLoading(false);
    }

    setIsLoading(false);
  };

  const getLinesPayload = tempIDs => {
    let payload = {
      fields: ['code', 'description'],
      sortBy: null,
      data: {
        _domain: 'self.id in (:_field_ids)',
        _domainContext: {
          id: 1,
          _model: 'com.axelor.apps.hr.db.EmploymentContractType',
          _field: 'employmentContractSubTypeList',
          _field_ids: tempIDs,
        },
        _archived: true,
      },
      limit: -1,
      offset: 0,
      translate: true,
    };
    return payload;
  };

  const getContractSubTypeList = async tempIDs => {
    const response = await api('POST', getSearchUrl(MODELS.EMPLOYMENT_CONTRACT_SUBTYPE), getLinesPayload(tempIDs));
    let status = response.data.status;
    let data = response.data.data;
    let total = response.data.total;

    if (status !== 0 || total === undefined || total === null || !data) {
      return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    }

    if (data) {
      let tempLines = [];
      data.forEach(moveLine => {
        let tempLine = { ...moveLine };
        tempLine.lineId = uuidv4();
        tempLines.push(tempLine);
      });
      setContractSubTypeList(tempLines);
    }

    setIsTableLoading(false);
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
    getContractType();
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
            modelsEnumKey: 'EMPLOYMENT_CONTRACT_TYPES',
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
                <h4>{addNew ? t('LBL_NEW_CONTRACT_TYPE') : contractType.name ? contractType.name : ''}</h4>
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
                  item={contractType?.name}
                  onClickHandler={() => {
                    setIsDelete(true);
                    setShowDelete(false);
                  }}
                  setConfirmationPopup={setShowDelete}
                />
              )}
              {!isLoading && (
                <>
                  {(Object.keys(contractType).length > 0 || addNew) && (
                    <>
                      {!addNew && (
                        <EmploymentContractTypeForm
                          enableEdit={enableEdit}
                          data={contractType}
                          isSave={isSave}
                          finshedSaveHandler={finshedSaveHandler}
                          isDelete={isDelete}
                          finshedDeleteHandler={finshedDeleteHandler}
                          alertHandler={alertHandler}
                          setActionInProgress={setActionInProgress}
                          contractSubTypeList={contractSubTypeList}
                          setContractSubTypeList={setContractSubTypeList}
                          isLoading={isTableLoading}
                        />
                      )}
                      {addNew && (
                        <EmploymentContractTypeForm
                          data={contractType}
                          addNew={addNew}
                          isSave={isSave}
                          finshedSaveHandler={finshedSaveHandler}
                          alertHandler={alertHandler}
                          setActionInProgress={setActionInProgress}
                          contractSubTypeList={contractSubTypeList}
                          setContractSubTypeList={setContractSubTypeList}
                          isLoading={isTableLoading}
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

export default ManageEmploymentContractTypes;
