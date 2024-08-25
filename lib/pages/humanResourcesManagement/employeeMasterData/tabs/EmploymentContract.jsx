import { useMemo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import BorderSection from '../../../../components/ui/inputs/BorderSection';
import DateInput from '../../../../components/ui/inputs/DateInput';
import NumberInput from '../../../../components/ui/inputs/NumberInput';
import ValueCard from '../../../../components/ui/inputs/ValueCard';
import SearchModalAxelor from '../../../../components/ui/inputs/SearchModal/SearchModalAxelor';
import DropDown from '../../../../components/ui/inputs/DropDown';
import TextInput from '../../../../components/ui/inputs/TextInput';
import InnerTable from '../../../../components/InnerTable';

import useMetaFields from '../../../../hooks/metaFields/useMetaFields';
import { convertNumberToString } from '../../../../utils/numericHelpers';
import { MODELS } from '../../../../constants/models';
import { useAxiosFunction } from '../../../../hooks/useAxios';
import { getSearchUrl } from '../../../../services/getUrl';
import { useFeatures } from '../../../../hooks/useFeatures';

export default function EmploymentContract({ formik, addNew, enableEdit, data, alertHandler }) {
  const executiveStatusSelect = useMetaFields('hr.employment.contract.executiveStatus.select');
  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  const { getFeaturePath } = useFeatures();

  const [employmentContracts, setEmploymentContracts] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lineData, setLineData] = useState([]);

  const lineHeaders = [t('LBL_CONTRACT_TYPE'), t('LBL_START_DATE'), t('LBL_END_DATE')];

  const dailyCost = useMemo(
    () => convertNumberToString(Number(formik.values.hourlyRate) * Number(formik.values.dailyWorkHours), 2),
    [formik.values.hourlyRate, formik.values.dailyWorkHours]
  );

  const searchEmploymentContracts = async () => {
    if (!(data?.employmentContractList?.length > 0)) return setIsLoading(false);
    setIsLoading(true);

    const idsList = data.employmentContractList.map(record => record.id);
    const payload = {
      fields: ['endDate', 'contractType', 'amendmentTypeSelect', 'startDate', 'status'],
      sortBy: null,
      data: {
        _domain: 'self.id in (:_field_ids)',
        _domainContext: { id: data.id, _model: MODELS.EMPLOYEE, _field: 'employmentContractList', _field_ids: idsList },
        _archived: true,
      },
      limit: -1,
      offset: 0,
      translate: true,
    };
    const res = await api('POST', getSearchUrl(MODELS.EMPLOYMENT_CONTRACT), payload);

    if (!(res?.data?.status === 0)) {
      setIsLoading(false);
      return alertHandler('Error', t('LBL_ERROR_FETCHING_EMPLOYMENT_CONTRACTS'));
    }

    setIsLoading(false);
    setEmploymentContracts(res?.data?.data || []);
  };

  const addLineHandler = () => {
    window.open(getFeaturePath('EMPLOYMENT_CONTRACTS', 'add'), '_blank', 'noopener,noreferrer');
  };

  const editLineHandler = line => {
    window.open(getFeaturePath('EMPLOYMENT_CONTRACTS', 'edit', { id: line.id }), '_blank', 'noopener,noreferrer');
  };

  const viewLineHandler = line => {
    window.open(getFeaturePath('EMPLOYMENT_CONTRACTS', 'view', { id: line.id }), '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    let tempData = [];
    employmentContracts &&
      employmentContracts.length > 0 &&
      employmentContracts.forEach(line => {
        tempData.push({
          isDeleteable: false,
          isEditable: true,
          isViewable: true,
          tableData: [
            { value: line.contractType?.name || '', type: 'text' },
            { value: line.startDate || '', type: 'text' },
            { value: line.endDate || '', type: 'text' },
          ],
          data: line,
          key: line.id ? line.id : line.lineId,
          headData: line.contractType?.name || '',
        });
      });
    setLineData(tempData);
  }, [employmentContracts]);

  useEffect(() => {
    searchEmploymentContracts();
  }, []);

  return (
    <div className="row">
      <div className="col-md-4">
        <DateInput
          formik={formik}
          label="LBL_DATE_OF_HIRE"
          accessor="hireDate"
          mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
          isRequired={true}
        />
      </div>
      <div className="col-md-4">
        <NumberInput
          formik={formik}
          label="LBL_WEEKLY_WORK_HOURS"
          accessor="weeklyWorkHours"
          mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
          isRequired={true}
        />
      </div>

      <div className="col-md-4">
        <NumberInput
          formik={formik}
          label="LBL_DAILY_WORK_HOURS"
          accessor="dailyWorkHours"
          mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
          isRequired={true}
        />
      </div>
      <div className="col-md-4">
        <NumberInput
          formik={formik}
          label="LBL_HOURLY_RATE"
          accessor="hourlyRate"
          mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
          isRequired={true}
        />
      </div>
      <div className="col-md-4">
        <ValueCard title="LBL_DAILY_COST" content={dailyCost} />
      </div>
      <BorderSection title="LBL_MAIN_EMPLOYMENT_CONTRACT" />
      <div className="col-md-4">
        <DropDown
          options={executiveStatusSelect.list}
          formik={formik}
          isRequired={false}
          label="LBL_EXECUTIVE_STATUS"
          accessor="executiveStatusSelect"
          translate={executiveStatusSelect.mode === 'enum'}
          keys={{ valueKey: 'value', titleKey: 'label' }}
          mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
          initialValue={0}
        />
      </div>
      <div className="col-md-4">
        <TextInput formik={formik} label="LBL_EMPLOYMENT" accessor="employment" mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'} />
      </div>
      <div className="col-md-4">
        <SearchModalAxelor
          formik={formik}
          modelKey="COMPANY_DEPARTMENTS"
          mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
          defaultValueConfig={false}
        />
      </div>
      {!addNew && (
        <InnerTable
          title={t('LBL_EMPLOYMENT_CONTRACTS')}
          pageMode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
          onAddNewLine={addLineHandler}
          onEditLine={editLineHandler}
          onViewLine={viewLineHandler}
          lineHeaders={lineHeaders}
          lineData={lineData}
          alternativeID="lineId"
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
