import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { BsCheckCircle } from 'react-icons/bs';

import InnerTable from '../../components/InnerTable';
import DepreciationLineModal from '../../components/depreciation/DepreciationLineModal';

import { formatFloatNumber } from '../../utils/helpers';
import { depreciationLinesActions } from '../../store/DepreciationLines';
import { FIXED_ASSET_STATUS_REV_ENUM } from '../../constants/enums/FixedAssetEnum';

function DepreciationLines({ tableTitle, pageMode, parentContext, hasCustomAction, customActionHandler }) {
  const { t } = useTranslation();
  const depreciationLines = useSelector(state => state.depreciationLines.depreciationLines);
  const statusEnum = {
    1: 'LBL_PLANNED',
    2: 'LBL_VALIDATED',
  };
  const statusRevEnum = {
    LBL_PLANNED: 1,
    LBL_VALIDATED: 2,
  };
  const lineHeaders = [
    t('LBL_DEPRECIATION_DATE'),
    t('LBL_DEPRECIATION_BASE'),
    t('LBL_DEPRECIATION'),
    t('LBL_CUMUALATIVE_DEPRECIATION'),
    t('LBL_ACCOUNTING_VALUE'),
    t('LBL_STATUS'),
  ];
  const dispatch = useDispatch();
  const [tempData, setTempData] = useState([]);
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
    dispatch(depreciationLinesActions.deleteLine({ lineId: line ? line.lineId : null }));
  };

  const onOpenMoreAction = line => {
    setEditLine(line);
    setViewLine(line);
  };

  useEffect(() => {
    let tempArr = [];
    depreciationLines.forEach(line => {
      tempArr.push({
        isDeleteable:
          pageMode &&
          pageMode === 'edit' &&
          parentContext &&
          parentContext.statusSelect < FIXED_ASSET_STATUS_REV_ENUM['LBL_VALIDATED'] &&
          line &&
          line.statusSelect !== statusRevEnum['LBL_VALIDATED']
            ? true
            : false,
        isEditable:
          pageMode &&
          pageMode === 'edit' &&
          parentContext &&
          parentContext.statusSelect < FIXED_ASSET_STATUS_REV_ENUM['LBL_VALIDATED'] &&
          line &&
          line.statusSelect !== statusRevEnum['LBL_VALIDATED']
            ? true
            : false,
        isViewable: true,
        customActionIcon: (
          <BsCheckCircle
            color={line && statusEnum[line.statusSelect] === 'LBL_PLANNED' ? '#256FAB' : '#83B1D6'}
            style={{
              width: '24px',
              height: '24px',
              verticalAlign: 'middle',
            }}
          />
        ),
        tableData: [
          { value: line.depreciationDate ? line.depreciationDate : '', type: 'text' },
          { value: line.depreciationBase ? line.depreciationBase : '', type: 'number' },
          { value: line.depreciation ? line.depreciation : '', type: 'number' },
          { value: line.cumulativeDepreciation ? line.cumulativeDepreciation : '', type: 'number' },
          { value: line.accountingValue ? formatFloatNumber(line.accountingValue).toString() : '', type: 'number' },
          { value: line.statusSelect ? t(statusEnum[line.statusSelect]) : '', type: 'text' },
        ],
        data: line,
        key: line.id,
        headData: line.depreciationBase ? line.depreciationBase : '',
      });
    });
    setTempData(tempArr);
  }, [depreciationLines, pageMode]);
  return (
    <>
      <InnerTable
        title={tableTitle}
        pageMode={pageMode}
        canAdd={false}
        onEditLine={editLineHandler}
        onViewLine={viewLineHandler}
        onDeleteLine={deleteLineHandler}
        lineHeaders={lineHeaders}
        lineData={tempData}
        withBorderSection={false}
        isRequired={pageMode && pageMode === 'edit' ? true : false}
        hasCustomAction={hasCustomAction}
        customActionHandler={customActionHandler}
        onOpenMoreAction={onOpenMoreAction}
      ></InnerTable>

      {showEditModal && (
        <DepreciationLineModal
          show={showEditModal}
          setShow={setShowEditModal}
          header={t('LBL_DEPRECIATION_LINE')}
          line={editLine}
          mode="edit"
        />
      )}
      {showViewModal && (
        <DepreciationLineModal
          show={showViewModal}
          setShow={setShowViewModal}
          header={t('LBL_DEPRECIATION_LINE')}
          line={viewLine}
          mode="view"
          onRealizeLine={customActionHandler}
          canRealize={
            pageMode === 'edit' &&
            parentContext &&
            parentContext.statusSelect >= FIXED_ASSET_STATUS_REV_ENUM['LBL_VALIDATED'] &&
            viewLine.statusSelect !== statusRevEnum['LBL_VALIDATED']
          }
        />
      )}
    </>
  );
}

export default DepreciationLines;
