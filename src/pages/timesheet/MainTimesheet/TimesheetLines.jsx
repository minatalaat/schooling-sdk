import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import InnerTable from '../../../components/InnerTable';
import TimesheetLineModal from './TimesheetLineModal';

import { timesheetLinesActions } from '../../../store/timesheetLines';
import { getFetchUrl } from '../../../services/getUrl';
import { MODELS } from '../../../constants/models';
import { useAxiosFunction } from '../../../hooks/useAxios';
import { APP_TIMESHEET_FETCH_FIELDS } from '../timesheetEnums';

function TimesheetLines({ tableTitle, pageMode, configData, parentContext, formik, disableTimesheetLinesList, alertHandler }) {
  const { t } = useTranslation();
  const timesheetLines = useSelector(state => state.timesheetLines.timesheetLines);
  const { api } = useAxiosFunction();
  const [lineHeaders, setLineHeaders] = useState();
  const [enableActivity, setEnableActivity] = useState(false);
  const dispatch = useDispatch();
  const [tempData, setTempData] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editLine, setEditLine] = useState(null);
  const [viewLine, setViewLine] = useState(null);

  const editLineHandler = line => {
    setShowEditModal(true);
    setEditLine(line);
  };

  const viewLineHandler = line => {
    setShowViewModal(true);
    setViewLine(line);
  };

  const deleteLineHandler = line => {
    dispatch(timesheetLinesActions.deleteLine({ lineId: line ? line.lineId : null }));
  };

  const showDurationInDays = data => {
    if (
      (data[4] &&
        data[4] &&
        data[4].attrs &&
        data[4].attrs['timesheetLineList.duration'] &&
        data[4].attrs['timesheetLineList.duration'].title === 'Days') ||
      (data[3] &&
        data[3] &&
        data[3].attrs &&
        data[3].attrs['timesheetLineList.duration'] &&
        data[3].attrs['timesheetLineList.duration'].title === 'Days')
    ) {
      return true;
    } else {
      return false;
    }
  };

  const getEnableActivity = async dataForConfig => {
    const fetchTimesheetConfig = await api('POST', getFetchUrl(MODELS.APP_TIMESHEET, 2), {
      fields: APP_TIMESHEET_FETCH_FIELDS,
    });
    if (fetchTimesheetConfig.data.status !== 0) return alertHandler('Error', t('SOMETHING_WENT_WRONG'));
    let data = fetchTimesheetConfig.data.data;

    if (data && data[0]) {
      if (data[0].enableActivity) {
        if (showDurationInDays(dataForConfig)) {
          setLineHeaders([t('LBL_PROJECT'), t('LBL_TASK'), t('LBL_DATE'), t('LBL_ACTIVITY'), t('LBL_DAYS'), t('LBL_COMMENTS')]);
        } else {
          setLineHeaders([t('LBL_PROJECT'), t('LBL_TASK'), t('LBL_DATE'), t('LBL_ACTIVITY'), t('LBL_HOURS'), t('LBL_COMMENTS')]);
        }

        setEnableActivity(true);
      } else {
        if (showDurationInDays(dataForConfig)) {
          setLineHeaders([t('LBL_PROJECT'), t('LBL_TASK'), t('LBL_DATE'), t('LBL_DAYS'), t('LBL_COMMENTS')]);
        } else {
          setLineHeaders([t('LBL_PROJECT'), t('LBL_TASK'), t('LBL_DATE'), t('LBL_HOURS'), t('LBL_COMMENTS')]);
        }

        setEnableActivity(false);
      }
    }
  };

  useEffect(() => {
    let tempArr = [];
    timesheetLines.forEach(line => {
      tempArr.push({
        isDeleteable: !disableTimesheetLinesList,
        isEditable: !disableTimesheetLinesList,
        isViewable: true,
        tableData:
          configData && enableActivity
            ? [
                { value: line ? (line.project ? line.project.fullName : '') : '', type: 'text' },
                { value: line ? (line.projectTask ? line.projectTask.fullName : '') : '', type: 'text' },
                { value: line ? (line.date ? line.date : '') : '', type: 'text' },
                { value: line ? (line.product ? (line.product.fullName ? line.product.fullName : '') : '') : '', type: 'text' },
                { value: line ? (line.duration ? parseFloat(line.duration).toFixed(2).toString() : '') : '', type: 'text' },
                { value: line ? (line.comments ? line.comments : '') : '', type: 'text' },
              ]
            : [
                { value: line ? (line.project ? line.project.fullName : '') : '', type: 'text' },
                { value: line ? (line.projectTask ? line.projectTask.fullName : '') : '', type: 'text' },
                { value: line ? (line.date ? line.date : '') : '', type: 'text' },
                { value: line ? (line.duration ? parseFloat(line.duration).toFixed(2).toString() : '') : '', type: 'text' },
                { value: line ? (line.comments ? line.comments : '') : '', type: 'text' },
              ],
        data: line,
        key: line.id,
        headData: line ? (line.date ? line.date : '') : '',
      });
    });
    setTempData(tempArr);
  }, [timesheetLines, pageMode, configData, enableActivity]);
  useEffect(() => {
    if (configData != null) {
      getEnableActivity(configData);
    }
  }, [configData]);

  return (
    configData &&
    lineHeaders && (
      <>
        <InnerTable
          title={tableTitle}
          pageMode={pageMode}
          canAdd={!disableTimesheetLinesList}
          onAddNewLine={() => {
            setShowAddModal(true);
          }}
          onEditLine={editLineHandler}
          onViewLine={viewLineHandler}
          onDeleteLine={deleteLineHandler}
          lineHeaders={lineHeaders}
          lineData={tempData}
          withBorderSection={false}
          isRequired={pageMode !== 'view' && !disableTimesheetLinesList}
          hasCustomAction={false}
        ></InnerTable>
        {showAddModal && (
          <TimesheetLineModal
            show={showAddModal}
            setShow={setShowAddModal}
            header={t('LBL_TIMESHEET_LINE')}
            line={null}
            mode="add"
            configData={configData}
            parentContext={parentContext}
            formik={formik}
            showActivity={enableActivity}
          />
        )}
        {showEditModal && (
          <TimesheetLineModal
            show={showEditModal}
            setShow={setShowEditModal}
            header={t('LBL_TIMESHEET_LINE')}
            line={editLine}
            configData={configData}
            parentContext={parentContext}
            mode="edit"
            formik={formik}
            showActivity={enableActivity}
          />
        )}
        {showViewModal && (
          <TimesheetLineModal
            show={showViewModal}
            setShow={setShowViewModal}
            header={t('LBL_TIMESHEET_LINE')}
            line={viewLine}
            configData={configData}
            parentContext={parentContext}
            mode="view"
            formik={formik}
            showActivity={enableActivity}
          />
        )}
      </>
    )
  );
}

export default TimesheetLines;
