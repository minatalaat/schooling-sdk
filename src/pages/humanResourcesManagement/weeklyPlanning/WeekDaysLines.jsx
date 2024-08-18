import React, { useEffect, useState } from 'react';
import InnerTable from '../../../components/InnerTable';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { weekDaysActions } from '../../../store/weekDays';
import WeekDayModal from './WeekDayModal';

function WeekDaysLines({ tableTitle, pageMode }) {
  const { t } = useTranslation();
  const weekDays = useSelector(state => state.weekDays.weekDays);

  const lineHeaders = [
    t('LBL_DAY'),
    t('LBL_FIRST_PERIOD_FROM'),
    t('LBL_FIRST_PERIOD_TO'),
    t('LBL_SECOND_PERIOD_FROM'),
    t('LBL_SECOND_PERIOD_TO'),
    t('LBL_ORDER'),
  ];
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
    dispatch(weekDaysActions.deleteLine({ lineId: line ? line.lineId : null }));
  };

  useEffect(() => {
    let tempArr = [];
    weekDays.forEach(line => {
      tempArr.push({
        isDeleteable: pageMode && (pageMode === 'edit' || pageMode === 'add'),
        isEditable: pageMode && (pageMode === 'edit' || pageMode === 'add'),
        isViewable: true,
        customActionIcon: null,
        tableData: [
          { value: line.name ? line.name : '', type: 'text' },
          { value: line.morningFrom ? line.morningFrom : '', type: 'text' },
          { value: line.morningTo ? line.morningTo : '', type: 'text' },
          { value: line.afternoonFrom ? line.afternoonFrom : '', type: 'text' },
          { value: line.afternoonTo ? line.afternoonTo : '', type: 'text' },
          { value: line.sequence !== null ? line.sequence : '', type: 'text' },
        ],
        data: line,
        key: line.id,
        headData: line.day ? line.day : '',
      });
    });
    setTempData(tempArr);
  }, [weekDays, pageMode]);

  return (
    <>
      <InnerTable
        title={tableTitle}
        pageMode={pageMode}
        canAdd={true}
        onAddNewLine={() => {
          setShowAddModal(true);
        }}
        onEditLine={editLineHandler}
        onViewLine={viewLineHandler}
        onDeleteLine={deleteLineHandler}
        lineHeaders={lineHeaders}
        lineData={tempData}
        withBorderSection={false}
        isRequired={pageMode && pageMode === 'edit' ? true : false}
        hasCustomAction={false}
      />
      {showAddModal && <WeekDayModal show={showAddModal} setShow={setShowAddModal} header="LBL_WEEK_DAY" line={null} mode="add" />}
      {showEditModal && <WeekDayModal show={showEditModal} setShow={setShowEditModal} header="LBL_WEEK_DAY" line={editLine} mode="edit" />}
      {showViewModal && <WeekDayModal show={showViewModal} setShow={setShowViewModal} header="LBL_WEEK_DAY" line={viewLine} mode="view" />}
    </>
  );
}

export default WeekDaysLines;
