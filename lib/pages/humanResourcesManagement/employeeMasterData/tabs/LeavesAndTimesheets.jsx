import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import DropDown from '../../../../components/ui/inputs/DropDown';
import SearchModalAxelor from '../../../../components/ui/inputs/SearchModal/SearchModalAxelor';
import InnerTable from '../../../../components/InnerTable';
import ConfirmationPopup from '../../../../components/ConfirmationPopup';
import LeaveLine from '../modals/LeaveLine';

import useMetaFields from '../../../../hooks/metaFields/useMetaFields';
import { useAxiosFunction } from '../../../../hooks/useAxios';
import { getSearchUrl } from '../../../../services/getUrl';
import { MODELS } from '../../../../constants/models';
import { setFieldValue } from '../../../../utils/formHelpers';

export default function LeavesAndTimesheets({ formik, addNew, enableEdit, data, alertHandler }) {
  const timeLoggingPreferenceSelect = useMetaFields('hr.time.logging.preference.select');
  const statusSelect = useMetaFields('hrs.timesheet.status.select');

  const { api } = useAxiosFunction();
  const { t } = useTranslation();

  const [timeSheets, setTimeSheets] = useState(null);
  const [isLoading, setIsLoading] = useState(null);
  const [timeSheetsLineData, setTimeSheetsLineData] = useState([]);
  // const [leavesLineData, setLeavesLineData] = useState([]);
  const [showNewLine, setShowNewLine] = useState(false);
  const [showEditLine, setShowEditLine] = useState(false);
  const [selectedLine, setSelectedLine] = useState({});
  const [showDeleteConfiguration, setShowDeleteConfiguration] = useState(false);

  const timeSheetsLineHeaders = [t('LBL_FROM_DATE'), t('LBL_TO'), t('LBL_SENT_DATE'), t('LBL_STATUS')];
  // const leavesLineHeaders = [t('LBL_TYPE'), t('LBL_TOTAL'), t('LBL_REMAINING'), t('LBL_WAITING_FOR_VALIDATION')];

  const searchTimeSheets = async () => {
    if (addNew) return setIsLoading(false);
    setIsLoading(true);

    const payload = {
      fields: ['fromDate', 'statusSelect', 'sentDate', 'toDate', 'company'],
      sortBy: ['-fromDate'],
      data: {
        _domain: 'self.employee = :id',
        _domainContext: {
          _id: null,
          ...data,
          _model: MODELS.EMPLOYEE,
        },
        _domainAction: 'action-employee-view-user-timesheets',
        operator: 'and',
        criteria: [],
      },
      limit: -1,
      offset: 0,
      translate: true,
    };
    const res = await api('POST', getSearchUrl(MODELS.TIMESHEET), payload);

    if (!(res?.data?.status === 0)) {
      setIsLoading(false);
      return alertHandler('Error', t('LBL_ERROR_FETCHING_TIMESHEETS'));
    }

    setIsLoading(false);
    setTimeSheets(res?.data?.data || []);
  };

  useEffect(() => {
    let tempData = [];
    timeSheets &&
      timeSheets.length > 0 &&
      timeSheets.forEach(line => {
        tempData.push({
          isDeleteable: false,
          isEditable: true,
          isViewable: true,
          tableData: [
            { value: line.fromDate || '', type: 'text' },
            { value: line.toDate || '', type: 'text' },
            { value: line.sentDate || '', type: 'text' },
            { value: statusSelect.list.find(record => +record.value === line.statusSelect)?.label || '', type: 'text', translate: true },
          ],
          data: line,
          key: line.id ? line.id : line.lineId,
          headData: line.fromDate || '',
        });
      });
    setTimeSheetsLineData(tempData);
  }, [timeSheets]);

  useEffect(() => {
    searchTimeSheets();
  }, []);

  return (
    <div className="row">
      <div className="col-md-4">
        <DropDown
          options={timeLoggingPreferenceSelect.list}
          formik={formik}
          isRequired={true}
          label="LBL_TIME_LOGGING_PREFERENCE"
          accessor="timeLoggingPreferenceSelect"
          translate={timeLoggingPreferenceSelect.mode === 'enum'}
          keys={{ valueKey: 'value', titleKey: 'label' }}
          mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
        />
      </div>
      <div className="col-md-4">
        <SearchModalAxelor
          formik={formik}
          modelKey="DEFAULT_ACTIVITY_PRODUCT"
          mode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
          payloadDomain="self.isActivity = true AND self.dtype = 'Product'"
          isRequired={true}
          selectIdentifier="fullName"
          extraFields={['fullName']}
          defaultValueConfig={null}
        />
      </div>
      {/* Temp Comment till solution is finalized */}
      {/* <InnerTable
        title={t('LBL_LEAVE_LIST')}
        pageMode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
        lineHeaders={leavesLineHeaders}
        lineData={leavesLineData}
      /> */}
      {!addNew && (
        <InnerTable
          title={t('LBL_TIMESHEETS')}
          pageMode={addNew ? 'add' : enableEdit ? 'edit' : 'view'}
          lineHeaders={timeSheetsLineHeaders}
          lineData={timeSheetsLineData}
          isLoading={isLoading}
          canAdd={false}
        />
      )}
      {showEditLine && (
        <LeaveLine
          parentFormik={formik}
          showConfiguration={showEditLine}
          setShowConfiguration={setShowEditLine}
          checked={selectedLine}
          setChecked={setSelectedLine}
          edit
          data={data}
        />
      )}
      {showNewLine && <LeaveLine parentFormik={formik} showConfiguration={showNewLine} setShowConfiguration={setShowNewLine} data={data} />}
      {showDeleteConfiguration && (
        <ConfirmationPopup
          onClickHandler={() => {
            let index =
              formik.values.leaveLineList?.findIndex(config =>
                config.lineId ? config.lineId === selectedLine.lineId : config.id === selectedLine.id
              ) || -1;

            if (index !== -1) {
              if (formik.values.leaveLineList.length === 1) setSelectedLine(null);
              let tempArr = [...formik.values.leaveLineList];
              tempArr.splice(index, 1);
              setSelectedLine(null);
              setFieldValue(formik, 'leaveLineList', [...tempArr]);
            }
          }}
          setConfirmationPopup={setShowDeleteConfiguration}
          item={`1 ${t('DELETE_ONE_ACCOUNTING_CONFIGURATION')}`}
        />
      )}
    </div>
  );
}
