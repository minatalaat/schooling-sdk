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
import EmployeeMasterDataForm from './EmployeeMasterDataForm';
import Calendar from '../../../components/ui/Calendar';

import { useAxiosFunction } from '../../../hooks/useAxios';
import { useFeatures } from '../../../hooks/useFeatures';
import { getFetchUrl } from '../../../services/getUrl';
import { modelsEnum } from '../../../constants/modelsEnum/modelsEnum';
import { MODELS } from '../../../constants/models';
import { alertsActions } from '../../../store/alerts';

export default function EmployeeMasterDataManage({ addNew, enableEdit }) {
  const feature = 'HR_MANAGEMENT';
  const subFeature = 'EMPLOYEE_MASTER_DATA';

  const { api } = useAxiosFunction();
  const { t } = useTranslation();
  const { canView, canEdit, canDelete, getFeaturePath } = useFeatures(feature, subFeature);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchPayload = {
    fields: [
      'dpaeList',
      'leaveLineList',
      'departmentOfBirth',
      'kilometricLogList',
      'bankDetails',
      'bonusCoef',
      'countryOfBirth',
      'leavingDate',
      'companyCbDetails',
      'phoneAtCustomer',
      'emergencyContact',
      'timesheetImputationSelect',
      'imposedDayEventsPlanning',
      'publicHolidayEventsPlanning',
      'lunchVoucherAdvanceList',
      'timesheetReminder',
      'mainEmploymentContract',
      'employeeAdvanceList',
      'exportCode',
      'negativeValueLeave',
      'employeeVehicleList',
      'external',
      'weeklyWorkHours',
      'fixedProPhone',
      'experienceSkillSet',
      'maritalStatus',
      'seniorityDate',
      'profitSharingBeneficiary',
      'lunchVoucherFormatSelect',
      'socialSecurityNumber',
      'emergencyContactRelationship',
      'maidenName',
      'managerUser',
      'cityOfBirth',
      'companyCbSelect',
      'hrManager',
      'employeeFileList',
      'timeLoggingPreferenceSelect',
      'contactPartner',
      'hireDate',
      'product',
      'skillSet',
      'sexSelect',
      'citizenship',
      'maritalName',
      'dailyWorkHours',
      'mobileProPhone',
      'emergencyNumber',
      'weeklyPlanning',
      'birthDate',
      'trainingSkillList',
      'stepByStepSelect',
      'employmentContractList',
      'hourlyRate',
      'user',
    ],
    related: {
      contactPartner: [
        'picture',
        'titleSelect',
        'firstName',
        'name',
        'emailAddress',
        'webSite',
        'fixedPhone',
        'mobilePhone',
        'fax',
        'simpleFullName',
      ],
      mainEmploymentContract: [
        'payCompany',
        'executiveStatusSelect',
        'employment',
        'companyDepartment',
        'payCompany.logo',
        'payCompany.name',
      ],
      employeeFileList: ['fileType', 'metaFile', 'recordDate', 'expirationDate', 'fileType.hasExpirationDate'],
    },
  };

  const [employee, setEmployee] = useState({});
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
      alertHandler('Success', t('EMPLOYEE_SAVED_SUCCESS'));
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
      alertHandler('Success', t('EMPLOYEE_DELETED_SUCCESS'));
      setTimeout(() => {
        setIsDelete(false);
        navigate(getFeaturePath(subFeature));
      }, 3000);
    } else {
      alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    }
  };

  const getEmployee = async () => {
    if (addNew) return null;

    if (isLoading === false) setIsLoading(true);
    const res = await api('POST', getFetchUrl(modelsEnum[subFeature].name, id), fetchPayload);
    if (!res.data || res.data.status !== 0 || !res.data.data || !res.data.data[0]) return navigate('/error');

    let resEmail = null;

    if (res?.data?.data[0]?.contactPartner?.emailAddress?.id) {
      resEmail = await api('POST', getFetchUrl(MODELS.EMAIL_ADDRESS, res?.data?.data[0]?.contactPartner?.emailAddress?.id), {
        fields: ['address'],
      });
    }

    setEmployee({
      ...res.data.data[0],
      contactPartner: {
        ...res.data.data[0].contactPartner,
        emailAddress: resEmail?.data?.data[0] || null,
      },
    });
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
    getEmployee();
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
            modelsEnumKey: 'EMPLOYEE_MASTER_DATA',
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
                <h4>{addNew ? t('LBL_NEW_EMPLOYEE') : employee.name ? employee.name : ''}</h4>
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
              <ActionsProgessBar
                feature={feature}
                subfeature={subFeature}
                editHandler={!enableEdit && !addNew ? (canEdit ? editHandler : null) : null}
                viewHandler={enableEdit && !addNew ? (canView ? viewHandler : null) : null}
                deleteHandler={canDelete && !addNew ? deleteHandler : null}
                setShowMoreAction={setShowMoreAction}
              />
              {showDelete && (
                <ConfirmationPopup
                  item={employee.name}
                  onClickHandler={() => {
                    setIsDelete(true);
                    setShowDelete(false);
                  }}
                  setConfirmationPopup={setShowDelete}
                />
              )}
              {!isLoading && (
                <>
                  {(Object.keys(employee).length > 0 || addNew) && (
                    <>
                      {!addNew && (
                        <EmployeeMasterDataForm
                          enableEdit={enableEdit}
                          data={employee}
                          isSave={isSave}
                          finshedSaveHandler={finshedSaveHandler}
                          isDelete={isDelete}
                          finshedDeleteHandler={finshedDeleteHandler}
                          alertHandler={alertHandler}
                          setActionInProgress={setActionInProgress}
                        />
                      )}
                      {addNew && (
                        <EmployeeMasterDataForm
                          data={employee}
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
