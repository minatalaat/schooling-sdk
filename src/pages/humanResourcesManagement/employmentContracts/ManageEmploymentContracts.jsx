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
import EmploymentContractForm from './EmploymentContractForm';
import Calendar from '../../../components/ui/Calendar';

import { otherCostsLinesActions } from '../../../store/otherCostsLines';
import { MODELS } from '../../../constants/models';
import { useAxiosFunction } from '../../../hooks/useAxios';
import { useFeatures } from '../../../hooks/useFeatures';
import { getFetchUrl, getSearchUrl } from '../../../services/getUrl';
import { modelsEnum } from '../../../constants/modelsEnum/modelsEnum';
import { alertsActions } from '../../../store/alerts';

const ManageEmploymentContracts = ({ addNew, enableEdit }) => {
  const feature = 'HR_MANAGEMENT';
  const subFeature = 'EMPLOYMENT_CONTRACTS';

  const { api } = useAxiosFunction();
  const { t } = useTranslation();
  const { canView, canEdit, canDelete, getFeaturePath } = useFeatures(feature, subFeature);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fields = [
    'monthlyGlobalCost',
    'endDate',
    'contractType',
    'employmentContractVersion',
    'otherCostsEmployeeSet',
    'employee',
    'employmentContractTemplate',
    'hoursDistribution',
    'duration',
    'endOfContractReason',
    'endContractDetails',
    'ref',
    'minMonthlyRemuneration',
    'startTime',
    'amendmentTypeSelect',
    'annualGrossSalary',
    'executiveStatusSelect',
    'weeklyDuration',
    'amendmentDate',
    'employmentContractSubType',
    'trialPeriodDuration',
    'hourlyGrossSalary',
    'payCompany',
    'employment',
    'signatureDate',
    'companyDepartment',
    'coefficient',
    'position',
    'startDate',
    'status',
  ];

  const [contract, setContract] = useState({});
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
      alertHandler('Success', t('CONTRACT_SAVED_SUCCESS'));
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
      alertHandler('Success', t('CONTRACT_DELETED_SUCCESS'));
      setTimeout(() => {
        setIsDelete(false);
        navigate(getFeaturePath(subFeature));
      }, 3000);
    } else {
      alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    }
  };

  const getContract = async () => {
    if (addNew) return null;

    if (isLoading === false) setIsLoading(true);
    const contractResponse = await api('POST', getFetchUrl(modelsEnum[subFeature].name, id), {
      fields: fields,
      related: {},
    });
    if (!contractResponse.data || contractResponse.data.status !== 0 || !contractResponse.data.data || !contractResponse.data.data[0])
      return navigate('/error');
    setContract(contractResponse.data.data[0]);
    let othersCosts = contractResponse.data.data[0].otherCostsEmployeeSet;
    if (othersCosts && othersCosts.length > 0) getOthersCosts(othersCosts.map(cost => cost.id));
    else setIsLoading(false);
  };

  const getOtherCostsPayload = ids => {
    let payload = {
      fields: ['amount', 'description'],
      sortBy: null,
      data: {
        _domain: 'self.id in (:_field_ids)',
        _domainContext: {
          id: id,
          _model: MODELS.EMPLOYMENT_CONTRACT,
          _field: 'otherCostsEmployeeSet',
          _field_ids: ids,
        },
        _archived: true,
      },
      limit: -1,
      offset: 0,
      translate: true,
    };
    return payload;
  };

  const getOthersCosts = async ids => {
    const othersResponse = await api('POST', getSearchUrl(MODELS.OTHER_COSTS_EMPLOYEE), getOtherCostsPayload(ids));
    if (othersResponse.data.status !== 0 || othersResponse.data.total === null || othersResponse.data.total === undefined);
    let lines = [...othersResponse.data.data];
    if (lines && lines.length > 0) lines.forEach(line => (line.lineId = uuidv4()));
    else lines = [];
    dispatch(
      otherCostsLinesActions.setLines({
        otherCostsLines: lines,
      })
    );
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
    dispatch(
      otherCostsLinesActions.setLines({
        otherCostsLines: [],
      })
    );
    getContract();
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
            modelsEnumKey: 'EMPLOYMENT_CONTRACTS',
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
                <h4>{addNew ? t('LBL_NEW_CONTRACT') : contract?.employee?.name ?? ''}</h4>
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
                  item={contract?.employee?.name ?? ''}
                  onClickHandler={() => {
                    setIsDelete(true);
                    setShowDelete(false);
                  }}
                  setConfirmationPopup={setShowDelete}
                />
              )}
              {!isLoading && (
                <>
                  {(Object.keys(contract).length > 0 || addNew) && (
                    <>
                      {!addNew && (
                        <EmploymentContractForm
                          enableEdit={enableEdit}
                          data={contract}
                          isSave={isSave}
                          finshedSaveHandler={finshedSaveHandler}
                          isDelete={isDelete}
                          finshedDeleteHandler={finshedDeleteHandler}
                          alertHandler={alertHandler}
                          setActionInProgress={setActionInProgress}
                        />
                      )}
                      {addNew && (
                        <EmploymentContractForm
                          data={contract}
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

export default ManageEmploymentContracts;
