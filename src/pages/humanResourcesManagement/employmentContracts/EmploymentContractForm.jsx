import { useEffect } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import TextInput from '../../../components/ui/inputs/TextInput';
import TextArea from '../../../components/ui/inputs/TextArea';
import NumberInput from '../../../components/ui/inputs/NumberInput';
import DateInput from '../../../components/ui/inputs/DateInput';
import TimeInput from '../../../components/ui/inputs/TimeInput';
import DropDown from '../../../components/ui/inputs/DropDown';
import SearchModalAxelor from '../../../components/ui/inputs/SearchModal/SearchModalAxelor';

import { MODELS } from '../../../constants/models';
import { useAxiosFunction } from '../../../hooks/useAxios';
import { getModelUrl, getRemoveAllUrl } from '../../../services/getUrl';
import { EXECUTIVE_STATUS_ENUMS, AMENDMENT_TYPE_ENUMS } from '../../../constants/enums/HREnums';
import OtherCostsTable from './OtherCostsTable';
import { parseDateString } from '../../../utils/helpers';
import { VALID_TEXT_WITH_SPECIAL_CHARS } from '../../../constants/regex/Regex';

const EmploymentContractForm = ({
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
  const { api } = useAxiosFunction();
  const { t } = useTranslation();
  const mode = addNew ? 'add' : enableEdit ? 'edit' : 'view';
  let otherCostsLines = useSelector(state => state.otherCostsLines.otherCostsLines);

  const initialValues = {
    employee: data?.employee || null,
    payCompany: data?.payCompany || null,
    companyDepartment: data?.companyDepartment || null,
    employmentContractVersion: data?.employmentContractVersion || 0,
    employmentContractTemplate: data?.employmentContractTemplate || '',
    amendmentTypeSelect: data?.amendmentTypeSelect || 0,
    amendmentDate: data?.amendmentDate || '',
    signatureDate: data?.signatureDate || '',
    contractType: data?.contractType || null,
    employmentContractSubType: data?.employmentContractSubType || null,
    executiveStatusSelect: data?.executiveStatusSelect || 0,
    employment: data?.employment || '',
    startDate: data?.startDate || '',
    trialPeriodDuration: data?.trialPeriodDuration || '',
    endDate: data?.endDate || '',
    weeklyDuration: data?.weeklyDuration || '',
    startTime: data?.startTime || '',
    duration: data?.duration || '',
    hoursDistribution: data?.hoursDistribution || '',
    position: data?.position || '',
    coefficient: data?.coefficient || '',
    hourlyGrossSalary: data?.hourlyGrossSalary || '',
    minMonthlyRemuneration: data?.minMonthlyRemuneration || '',
    annualGrossSalary: data?.annualGrossSalary || '',
    monthlyGlobalCost: data?.monthlyGlobalCost || '',
    reason: data?.endOfContractReason || null,
    endContractDetails: data?.endContractDetails || '',
    status: data?.status || 0,
  };

  const validationSchema = Yup.object({
    employee: Yup.object().required(t('REQUIRED')).nullable(),
    payCompany: Yup.object().nullable(),
    companyDepartment: Yup.object().nullable(),
    employmentContractVersion: Yup.number(t('LBL_INVALID_NUMBER_VALUE')),
    employmentContractTemplate: Yup.object().nullable(),
    amendmentTypeSelect: Yup.number(t('LBL_INVALID_NUMBER_VALUE')),
    amendmentDate: Yup.date(),
    signatureDate: Yup.date().transform(parseDateString).typeError(t('VALID_DATE_FORMAT')).required(t('REQUIRED')),
    contractType: Yup.object().required(t('REQUIRED')).nullable(),
    employmentContractSubType: Yup.object().nullable(),
    executiveStatusSelect: Yup.number(t('LBL_INVALID_NUMBER_VALUE')),
    employment: Yup.string(t('LBL_INVALID_VALUE')).matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')),
    startDate: Yup.date().transform(parseDateString).typeError(t('VALID_DATE_FORMAT')).required(t('REQUIRED')),
    trialPeriodDuration: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')),
    endDate: Yup.date()
      .transform(parseDateString)
      .typeError(t('VALID_DATE_FORMAT'))
      .min(Yup.ref('startDate'), t('LBL_ERROR_START_DATE_LARGER_END_DATE')),
    weeklyDuration: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')),
    duration: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')),
    hoursDistribution: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')),
    position: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')),
    coefficient: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')),
    hourlyGrossSalary: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')),
    minMonthlyRemuneration: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')),
    annualGrossSalary: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')),
    monthlyGlobalCost: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')),
    reason: Yup.object().required(t('REQUIRED')).nullable(),
    endContractDetails: Yup.string().matches(VALID_TEXT_WITH_SPECIAL_CHARS, t('VALID_INPUT_WITH_SPECIAL_CHARS')),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: addNew ? true : false,
  });

  const saveRecord = () => {
    if (formik.isValid && otherCostsLines.length > 0) {
      setActionInProgress(true);
      let payload = {
        data: {
          employee: formik.values.employee,
          payCompany: formik.values.payCompany,
          companyDepartment: formik.values.companyDepartment,
          employmentContractVersion: formik.values.employmentContractVersion,
          employmentContractTemplate: formik.values.employmentContractTemplate,
          amendmentTypeSelect: formik.values.amendmentTypeSelect,
          amendmentDate: formik.values.amendmentDate,
          signatureDate: formik.values.signatureDate,
          contractType: formik.values.contractType,
          employmentContractSubType: formik.values.employmentContractSubType,
          executiveStatusSelect: formik.values.executiveStatusSelect,
          employment: formik.values.employment,
          startDate: formik.values.startDate,
          trialPeriodDuration: formik.values.trialPeriodDuration,
          endDate: formik.values.endDate,
          weeklyDuration: formik.values.weeklyDuration,
          startTime: formik.values.startTime,
          duration: formik.values.duration,
          hoursDistribution: formik.values.hoursDistribution,
          position: formik.values.position,
          coefficient: formik.values.coefficient,
          hourlyGrossSalary: formik.values.hourlyGrossSalary,
          minMonthlyRemuneration: formik.values.minMonthlyRemuneration,
          annualGrossSalary: formik.values.annualGrossSalary,
          monthlyGlobalCost: formik.values.monthlyGlobalCost,
          endOfContractReason: formik.values.reason,
          endContractDetails: formik.values.endContractDetails,
          otherCostsEmployeeSet: otherCostsLines,
        },
      };

      if (enableEdit) payload = { ...payload, data: { ...payload.data, id: data.id, version: data.version } };

      api('POST', getModelUrl(MODELS.EMPLOYMENT_CONTRACT), payload, () => {
        setActionInProgress(false);
        finshedSaveHandler('success');
      });
    } else {
      alertHandler('Error', t('INVALID_FORM'));
    }
  };

  const deleteRecord = () => {
    setActionInProgress(true);
    const payload = {
      records: [{ id: data.id }],
    };
    api('POST', getRemoveAllUrl(MODELS.EMPLOYMENT_CONTRACT), payload, () => {
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

  const onGetEmployees = response => {
    let status = response.data.status;
    let data = response.data.data;
    let total = response.data.total;

    if (status !== 0 || total === undefined || total === null) {
      alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      return;
    }

    if (data) {
      let tempData = [...data];
      tempData.forEach(emp => {
        emp.partnerSeq = emp['contactPartner.partnerSeq'];
        emp.simpleFullName = emp['contactPartner.simpleFullName'];
        emp.fullName = emp['contactPartner.fullName'];
        emp.name = emp['contactPartner.fullName'];
      });
      return { displayedData: [...tempData], total: response.data.total || 0 };
    }
  };

  const onGetCompanies = response => {
    let status = response.data.status;
    let data = response.data.data;
    let total = response.data.total;

    if (status !== 0 || total === undefined || total === null) {
      alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      return;
    }

    if (data) {
      return { displayedData: [...data], total: response.data.total || 0 };
    }
  };

  const onGetDepartments = response => {
    let status = response.data.status;
    let data = response.data.data;
    let total = response.data.total;

    if (status !== 0 || total === undefined || total === null) {
      alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      return;
    }

    if (data) {
      return { displayedData: [...data], total: response.data.total || 0 };
    }
  };

  const onGetContractTypes = response => {
    let status = response.data.status;
    let data = response.data.data;
    let total = response.data.total;

    if (status !== 0 || total === undefined || total === null) {
      alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      return;
    }

    if (data) {
      return { displayedData: [...data], total: response.data.total || 0 };
    }
  };

  const onGetContractSubTypes = response => {
    let status = response.data.status;
    let data = response.data.data;
    let total = response.data.total;

    if (status !== 0 || total === undefined || total === null) {
      alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      return;
    }

    if (data) {
      return { displayedData: [...data], total: response.data.total || 0 };
    }
  };

  const onGetEndOfContractReasons = response => {
    let status = response.data.status;
    let data = response.data.data;
    let total = response.data.total;

    if (status !== 0 || total === undefined || total === null) {
      alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      return;
    }

    if (data) {
      return { displayedData: [...data], total: response.data.total || 0 };
    }
  };

  const onGetTemplates = response => {
    let status = response.data.status;
    let data = response.data.data;
    let total = response.data.total;

    if (status !== 0 || total === undefined || total === null) {
      alertHandler('Error', t('SOMETHING_WENT_WRONG'));
      return;
    }

    if (data) {
      return { displayedData: [...data], total: response.data.total || 0 };
    }
  };

  return (
    <>
      <div className="card">
        <div className="row">
          <div className="col-md-6">
            <SearchModalAxelor
              formik={formik}
              modelKey="EMPLOYEES_CONTRACTS"
              mode={mode}
              onSuccess={onGetEmployees}
              selectIdentifier="name"
              extraFields={[
                'archived',
                'mainEmploymentContract.payCompany',
                'contactPartner.partnerSeq',
                'contactPartner.mobilePhone',
                'contactPartner.fullName',
                'contactPartner.simpleFullName',
                'contactPartner.fixedPhone',
                'mainEmploymentContract.companyDepartment',
                'managerUser',
              ]}
              isRequired={true}
              defaultValueConfig={null}
            />
          </div>
          <div className="col-md-6">
            <SearchModalAxelor formik={formik} modelKey="PAY_COMPANIES" mode={mode} onSuccess={onGetCompanies} disabled={true} />
          </div>
          <div className="col-md-6">
            <SearchModalAxelor
              formik={formik}
              modelKey="COMPANY_DEPARTMENTS"
              mode={mode}
              onSuccess={onGetDepartments}
              payloadDomain="self.id IN (1)"
              defaultValueConfig={null}
            />
          </div>
          <div className="col-md-6">
            <NumberInput formik={formik} label="LBL_AMENDMENT" accessor="employmentContractVersion" mode={mode} />
          </div>
          <div className="col-md-4">
            <SearchModalAxelor
              formik={formik}
              modelKey="EMPLOYMENT_CONTRACT_TEMPLATES"
              mode={mode}
              onSuccess={onGetTemplates}
              defaultValueConfig={null}
            />
          </div>
          {parseInt(formik.values.employmentContractVersion) > 0 && (
            <>
              <div className="col-md-4">
                <DropDown
                  formik={formik}
                  mode={mode}
                  label="LBL_AMENDMENT_TYPE"
                  accessor="amendmentTypeSelect"
                  options={AMENDMENT_TYPE_ENUMS}
                />
              </div>
              <div className="col-md-4">
                <DateInput formik={formik} label="LBL_AMENDMENT_DATE" accessor="amendmentDate" mode={mode} />
              </div>
            </>
          )}
        </div>
        <div className="row">
          <div className="col-md-4">
            <DateInput formik={formik} label="LBL_SIGNATURE_DATE" accessor="signatureDate" mode={mode} isRequired={true} />
          </div>
          <div className="col-md-4">
            <SearchModalAxelor
              formik={formik}
              modelKey="EMPLOYMENT_CONTRACT_TYPES"
              mode={mode}
              onSuccess={onGetContractTypes}
              isRequired={true}
              defaultValueConfig={null}
            />
          </div>
          {formik.values.contractType && (
            <div className="col-md-4">
              <SearchModalAxelor
                formik={formik}
                modelKey="EMPLOYMENT_CONTRACT_SUBTYPES"
                mode={mode}
                onSuccess={onGetContractSubTypes}
                payloadDomain={`self.id IN (${formik.values.contractType.id})`}
                defaultValueConfig={null}
                selectIdentifier="code"
              />
            </div>
          )}
        </div>
        <div className="row">
          <div className="col-md-4">
            <DropDown
              formik={formik}
              mode={mode}
              label="LBL_EXECUTIVE_STATUS"
              accessor="executiveStatusSelect"
              options={EXECUTIVE_STATUS_ENUMS}
            />
          </div>
          <div className="col-md-4">
            <TextInput formik={formik} label="LBL_EMPLOYMENT" accessor="employment" mode={mode} />
          </div>
        </div>
        <div className="border-section"></div>
        <div className="section-title">
          <h4>{t('LBL_ORGANIZATION')}</h4>
        </div>
        <div className="row">
          <div className="col-md-3">
            <DateInput formik={formik} label="LBL_START_DATE" accessor="startDate" mode={mode} isRequired={true} />
          </div>
          <div className="col-md-3">
            <TextInput formik={formik} label="LBL_TRIAL_PERIOD_DURATION" accessor="trialPeriodDuration" mode={mode} />
          </div>
          <div className="col-md-3">
            <DateInput formik={formik} label="LBL_END_DATE" accessor="endDate" mode={mode} />
          </div>
          <div className="col-md-3">
            <NumberInput formik={formik} label="LBL_WEEKLY_DURATION" accessor="weeklyDuration" mode={mode} isRequired={true} />
          </div>
          <div className="col-md-3">
            <TimeInput formik={formik} label="LBL_START_TIME" accessor="startTime" mode={mode} />
          </div>
          <div className="col-md-3">
            <TextInput formik={formik} label="LBL_DURATION" accessor="duration" mode={mode} />
          </div>
          <div className="col-md-6">
            <TextArea formik={formik} label="LBL_HOURS_DISTRIBUTION" accessor="hoursDistribution" mode={mode} />
          </div>
        </div>
        <div className="border-section"></div>
        <div className="section-title">
          <h4>{t('LBL_POSITION_SALARY')}</h4>
        </div>
        <div className="row">
          <div className="col-md-4">
            <TextInput formik={formik} label="LBL_POSITION" accessor="position" mode={mode} />
          </div>
          <div className="col-md-4">
            <TextInput formik={formik} label="LBL_COEFFICIENT" accessor="coefficient" mode={mode} />
          </div>
          <div className="col-md-4">
            <NumberInput formik={formik} label="LBL_HOURLY_GROSS_SALARY" accessor="hourlyGrossSalary" mode={mode} isRequired={true} />
          </div>
          <div className="col-md-4">
            <NumberInput formik={formik} label="LBL_MIN_MONTHLY_REMUNERATION" accessor="minMonthlyRemuneration" mode={mode} />
          </div>
          <div className="col-md-4">
            <NumberInput formik={formik} label="LBL_ANNUAL_GROSS_SALARY" accessor="annualGrossSalary" mode={mode} />
          </div>
          <div className="col-md-4">
            <NumberInput formik={formik} label="LBL_MONTHLY_GLOBAL_COST" accessor="monthlyGlobalCost" mode={mode} />
          </div>
        </div>
        <OtherCostsTable mode={mode} />
        <div className="border-section"></div>
        <div className="section-title">
          <h4>{t('LBL_END_OF_CONTRACT')}</h4>
        </div>
        <div className="row">
          <div className="col-md-6">
            <SearchModalAxelor
              formik={formik}
              modelKey="END_OF_CONTRACT_REASONS"
              mode={mode}
              onSuccess={onGetEndOfContractReasons}
              isRequired={true}
              selectIdentifier="reason"
              defaultValueConfig={null}
            />
          </div>
          <div className="col-md-6">
            <TextInput formik={formik} label="LBL_DETAILS" accessor="endContractDetails" mode={mode} />
          </div>
        </div>
      </div>
    </>
  );
};

export default EmploymentContractForm;
