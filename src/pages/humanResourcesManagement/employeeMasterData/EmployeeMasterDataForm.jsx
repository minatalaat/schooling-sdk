import { useEffect } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import BasicInformation from './tabs/BasicInformation';
import EmploymentContract from './tabs/EmploymentContract';
import LeavesAndTimesheets from './tabs/LeavesAndTimesheets';
import UserCreation from './tabs/UserCreation';
import ContactPartnerInfo from './tabs/ContactPartnerInfo';
import Tabs from '../../../components/ui/inputs/Tabs';

import { getModelUrl, getRemoveAllUrl, getUploadUrl } from '../../../services/getUrl';
import { useAxiosFunction } from '../../../hooks/useAxios';
import { MODELS } from '../../../constants/models';
import { useTabs } from '../../../hooks/useTabs';

const EmployeeMasterDataForm = ({
  enableEdit,
  data,
  addNew,
  isSave,
  finshedSaveHandler,
  isDelete,
  finshedDeleteHandler,
  alertHandler,
  setActionInProgress,
}) => {
  const { api, uploadDocument } = useAxiosFunction();
  const { t } = useTranslation();
  const tabsProps = useTabs();

  let company = useSelector(state => state.userFeatures.companyInfo.company);

  const initialValues = {
    name: data?.contactPartner?.name || '',
    emailAddress: data?.contactPartner?.emailAddress?.address || '',
    fixedPhone: data?.contactPartner?.fixedPhone || '',
    mobilePhone: data?.contactPartner?.mobilePhone || '',
    picture: null,
    payCompany: company || null,
    fixedProPhone: data?.fixedProPhone || '',
    birthDate: data?.birthDate || '',
    maritalStatus: data?.maritalStatus || 0,
    sexSelect: data?.sexSelect || 0,
    countryOfBirth: data?.countryOfBirth || null,
    maritalName: data?.maritalName || '',
    socialSecurityNumber: data?.socialSecurityNumber || '',
    emergencyContact: data?.emergencyContact || '',
    emergencyNumber: data?.emergencyNumber || '',
    emergencyContactRelationship: data?.emergencyContactRelationship || '',
    managerUser: data?.managerUser || null,
    hrManager: data?.hrManager || false,
    external: data?.external || false,
    weeklyPlanning: data?.weeklyPlanning || null,
    publicHolidayEventsPlanning: data?.publicHolidayEventsPlanning || null,
    imposedDayEventsPlanning: data?.imposedDayEventsPlanning || null,
    hireDate: data?.hireDate || '',
    weeklyWorkHours: +data?.weeklyWorkHours || 0,
    dailyWorkHours: +data?.dailyWorkHours || 0,
    hourlyRate: +data?.hourlyRate || 0,
    executiveStatusSelect: data?.executiveStatusSelect || 0,
    employment: data?.employment || '',
    companyDepartment: data?.companyDepartment || null,
    timeLoggingPreferenceSelect: data?.timeLoggingPreferenceSelect || '',
    product: data?.product || null,
    user: data?.user || null,
    leaveLineList: data?.leaveLineList || null,
  };

  const validationSchema = Yup.object({
    name: Yup.string()
      .required(`* ${t('REQUIRED')}`)
      .trim(),
    emailAddress: Yup.string()
      .email(`* ${t('CUSTOMER_EMAIL_VALIDATION_MESSAGE')}`)
      .trim(),
    fixedPhone: Yup.string()
      .matches('^((?:[+?0?0?966]+)(?:\\s?\\d{2})(?:\\s?\\d{7}))$', `* ${t('CUSTOMER_PHONE_VALIDATION_MESSAGE')}`)
      .trim(),
    mobilePhone: Yup.string()
      .matches('^((?:[+?0?0?966]+)(?:\\s?\\d{2})(?:\\s?\\d{7}))$', `* ${t('CUSTOMER_PHONE_VALIDATION_MESSAGE')}`)
      .trim(),
    fixedProPhone: Yup.string().matches('^((?:[+?0?0?966]+)(?:\\s?\\d{2})(?:\\s?\\d{7}))$', `* ${t('CUSTOMER_PHONE_VALIDATION_MESSAGE')}`),
    birthDate: Yup.date().required(`* ${t('REQUIRED')}`),
    countryOfBirth: Yup.object()
      .nullable()
      .required(`* ${t('REQUIRED')}`),
    maritalName: Yup.string(),
    socialSecurityNumber: Yup.string().max(15, t('VALIDATION_BETWEEN_12_15')).min(12, t('VALIDATION_BETWEEN_12_15')),
    emergencyContact: Yup.string(),
    emergencyNumber: Yup.string(),
    emergencyContactRelationship: Yup.string(),
    managerUser: Yup.object().nullable(),
    hrManager: Yup.boolean(),
    external: Yup.boolean(),
    weeklyPlanning: Yup.object()
      .nullable()
      .required(`* ${t('REQUIRED')}`),
    publicHolidayEventsPlanning: Yup.object()
      .nullable()
      .required(`* ${t('REQUIRED')}`),
    imposedDayEventsPlanning: Yup.object().nullable(),
    hireDate: Yup.date().required(`* ${t('REQUIRED')}`),
    weeklyWorkHours: Yup.number()
      .required(`* ${t('REQUIRED')}`)
      .min(1, `* ${t('REQUIRED')}`),
    dailyWorkHours: Yup.number()
      .required(`* ${t('REQUIRED')}`)
      .min(1, `* ${t('REQUIRED')}`),
    hourlyRate: Yup.number()
      .required(`* ${t('REQUIRED')}`)
      .min(1, `* ${t('REQUIRED')}`),
    employment: Yup.string(),
    companyDepartment: Yup.object().nullable(),
    timeLoggingPreferenceSelect: Yup.string().required(`* ${t('REQUIRED')}`),
    product: Yup.object()
      .nullable()
      .required(`* ${t('REQUIRED')}`),
    user: Yup.object()
      .nullable()
      .required(`* ${t('REQUIRED')}`),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: addNew ? true : false,
  });

  const saveRecord = async () => {
    if (!formik.isValid) return alertHandler('Error', t('INVALID_FORM'));

    setActionInProgress(true);

    let emailResponse = data?.contactPartner?.emailAddress || null;

    if ((emailResponse?.address || '') !== formik.values.emailAddress || addNew) {
      emailResponse = await api('POST', getModelUrl(MODELS.EMAIL_ADDRESS), {
        data: {
          address: formik.values.emailAddress,
          id: data?.contactPartner?.emailAddress?.id || null,
          version: data?.contactPartner?.emailAddress?.$version || null,
        },
      });

      if (emailResponse?.data?.status === 0) {
        emailResponse = emailResponse.data?.data[0];
      } else {
        alertHandler('Error', t('LBL_ERROR_SAVE_EMAIL'));
      }
    }

    let picResposne = null;

    if (formik.values.picture && !formik.values.picture.id) {
      picResposne = await uploadDocument(getUploadUrl(MODELS.METAFILE), formik.values.picture);

      if (picResposne?.data?.status === 0) {
        picResposne = picResposne.data?.data[0];
      } else {
        alertHandler('Error', t('LBL_ERROR_SAVE_PICTURE'));
      }
    }

    let payload = {
      data: {
        leaveLineList: formik.values.leaveLineList,
        countryOfBirth: formik.values.countryOfBirth,
        emergencyContact: formik.values.emergencyContact,
        imposedDayEventsPlanning: formik.values.imposedDayEventsPlanning,
        weeklyPlanning: formik.values.weeklyPlanning,
        publicHolidayEventsPlanning: formik.values.publicHolidayEventsPlanning,
        mainEmploymentContract: {
          payCompany: company,
          executiveStatusSelect: +formik.values.executiveStatusSelect,
          employment: formik.values.employment,
          companyDepartment: formik.values.companyDepartment,
        },
        external: formik.values.external,
        fixedProPhone: formik.values.fixedProPhone,
        maritalStatus: formik.values.maritalStatus?.toString() || '',
        socialSecurityNumber: formik.values.socialSecurityNumber,
        emergencyContactRelationship: formik.values.emergencyContactRelationship,
        managerUser: formik.values.managerUser,
        hrManager: formik.values.hrManager,
        contactPartner: {
          fixedPhone: formik.values.fixedPhone,
          version: data?.contactPartner?.$version || null,
          picture: picResposne
            ? { fileName: picResposne.fileName, id: picResposne.id }
            : formik.values.logo
              ? data.logo
                ? data.logo
                : null
              : null,
          emailAddress: emailResponse || null,
          mobilePhone: formik.values.mobilePhone,
          name: formik.values.name,
          id: data?.contactPartner?.id || null,
        },
        sexSelect: formik.values.sexSelect,
        maritalName: formik.values.maritalName,
        birthDate: formik.values.birthDate,
        hourlyRate: formik.values.hourlyRate,
        weeklyWorkHours: formik.values.weeklyWorkHours,
        dailyWorkHours: formik.values.dailyWorkHours,
        hireDate: formik.values.hireDate,
        user: formik.values.user,
        timeLoggingPreferenceSelect: formik.values.timeLoggingPreferenceSelect,
        product: formik.values.product,
        stepByStepSelect: 5,
      },
    };

    if (enableEdit) payload = { ...payload, data: { ...payload.data, id: data.id, version: data.version } };

    await api('POST', getModelUrl(MODELS.EMPLOYEE), payload, () => {
      setActionInProgress(false);
      finshedSaveHandler('success');
    });
  };

  const deleteRecord = () => {
    setActionInProgress(true);
    const payload = {
      records: [{ id: data.id }],
    };
    api('POST', getRemoveAllUrl(MODELS.EMPLOYEE), payload, () => {
      setActionInProgress(false);
      finshedDeleteHandler('success');
    });
  };

  useEffect(() => {
    if (isSave) {
      saveRecord();
    }

    if (isDelete) {
      deleteRecord();
    }
  }, [isSave, isDelete, addNew, enableEdit]);

  useEffect(() => {
    tabsProps.setShowTabsContent(true);
  }, []);

  return (
    <>
      <div className="card">
        <ContactPartnerInfo formik={formik} addNew={addNew} enableEdit={enableEdit} data={data} alertHandler={alertHandler} />
      </div>
      <div className="card">
        <Tabs
          {...tabsProps}
          tabsList={[
            { accessor: 'basicInformation', label: 'LBL_BASIC_INFORMATION' },
            { accessor: 'employmentContract', label: 'LBL_THE_EMPLOYMENT_CONTRACT' },
            { accessor: 'leavesAndTimesheets', label: 'LBL_LEAVES_AND_TIMESHEET' },
            { accessor: 'userLink', label: 'LBL_USER_LINK' },
          ]}
        >
          <BasicInformation accessor="basicInformation" formik={formik} addNew={addNew} enableEdit={enableEdit} />
          <EmploymentContract
            accessor="employmentContract"
            formik={formik}
            addNew={addNew}
            enableEdit={enableEdit}
            data={data}
            alertHandler={alertHandler}
          />
          <LeavesAndTimesheets
            accessor="leavesAndTimesheets"
            formik={formik}
            addNew={addNew}
            enableEdit={enableEdit}
            data={data}
            alertHandler={alertHandler}
          />
          <UserCreation accessor="userLink" formik={formik} addNew={addNew} enableEdit={enableEdit} />
        </Tabs>
      </div>
    </>
  );
};

export default EmployeeMasterDataForm;
