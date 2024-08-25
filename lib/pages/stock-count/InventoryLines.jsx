import { useEffect, useState } from 'react';
import InnerTable from '../../components/InnerTable';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import InventoryLineModal from './InventoryLineModal';

import { formatFloatNumber } from '../../utils/helpers';
import { inventoryLinesActions } from '../../store/inventoryLines';

function InventoryLines({ pageMode, data, alertHandler }) {
  const { t } = useTranslation();
  const inventoryLines = useSelector(state => state.inventoryLines.inventoryLines);
  let tableTitle = t('LBL_INVENTORY_LINES');
  const lineHeaders = [
    t('LBL_PRODUCT'),
    t('LBL_STOCK_LOCATION'),
    t('LBL_CURRENT_QTY'),
    t('LBL_REAL_QTY'),
    t('LBL_UNIT'),
    t('LBL_GAP'),
    t('LBL_GAP_VALUE'),
  ];
  const dispatch = useDispatch();
  const [tempData, setTempData] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editLine, setEditLine] = useState(null);
  const [viewLine, setViewLine] = useState(null);
  const [parentContext, setParentContext] = useState(null);

  const editLineHandler = line => {
    setShowEditModal(true);
    setEditLine(line);
  };

  const viewLineHandler = line => {
    setShowViewModal(true);
    setViewLine(line);
  };

  const deleteLineHandler = line => {
    dispatch(inventoryLinesActions.deleteLine({ lineId: line ? line.lineId : null }));
  };

  const onOpenMoreAction = line => {
    setEditLine(line);
    setViewLine(line);
  };

  useEffect(() => {
    let tempArr = [];
    inventoryLines.forEach(line => {
      tempArr.push({
        isDeleteable: false,
        // isDeleteable: pageMode && pageMode === 'edit' && data && data.statusSelect > 2 && data.statusSelect < 5 ? true : false,
        isEditable: pageMode && pageMode === 'edit' && data && data.statusSelect > 2 && data.statusSelect < 5 ? true : false,
        isViewable: true,
        tableData: [
          { value: line.product ? (line.product.fullName ? line.product.fullName : '') : '', type: 'text' },
          { value: line.stockLocation ? (line.stockLocation ? line.stockLocation.name : '') : '', type: 'text' },
          { value: line.currentQty ? formatFloatNumber(line.currentQty).toString() : '', type: 'number' },
          { value: line.realQty ? formatFloatNumber(line.realQty).toString() : '', type: 'string' },
          { value: line.unit ? (line.unit ? line.unit.name : '') : '', type: 'text' },
          { value: line?.gap?.toString() || '', type: 'number' },
          {
            value: line ? (Number(line?.realValue) === -1 ? null : formatFloatNumber(line?.gapValue || '').toString()) : '',
            type: 'string',
          },
        ],
        data: line,
        key: line.id,
        headData: line.product ? (line.product.fullName ? line.product.fullName : '') : '',
      });
    });
    setTempData(tempArr);
  }, [inventoryLines, pageMode]);

  useEffect(() => {
    setParentContext({
      _id: null,
      productFamily: null,
      formatSelect: 'pdf',
      inventoryLineList: data?.inventoryLineList || null,
      plannedStartDateT: data?.plannedStartDateT || null,
      stockLocation: data?.stockLocation || null,
      toRack: null,
      description: null,
      typeSelect: data?.typeSelect || null,
      productCategory: null,
      company: data?.company || null,
      id: data?.id || null,
      inventorySeq: data?.inventorySeq || null,
      plannedEndDateT: data?.plannedEndDateT || null,
      product: null,
      excludeOutOfStock: false,
      importFile: null,
      includeObsolete: false,
      version: data && data.version !== null ? data.version : 0,
      fromRack: null,
      includeSubStockLocation: true,
      statusSelect: data?.statusSelect || null,
      validatedOn: null,
      validatedBy: null,
      completedBy: null,
      wkfStatus: null,
      _model: 'com.axelor.apps.stock.db.Inventory',
    });
  }, [data]);
  return (
    <>
      <InnerTable
        title={tableTitle}
        pageMode={pageMode}
        canAdd={false}
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
        onOpenMoreAction={onOpenMoreAction}
      />
      {showAddModal && (
        <InventoryLineModal
          show={showAddModal}
          setShow={setShowAddModal}
          header={t('LBL_INVENTORY_LINE')}
          line={null}
          mode="add"
          stockLocation={data ? data.stockLocation : null}
          parentContext={parentContext}
          alertHandler={alertHandler}
        />
      )}
      {showEditModal && (
        <InventoryLineModal
          show={showEditModal}
          setShow={setShowEditModal}
          header={t('LBL_INVENTORY_LINE')}
          line={editLine}
          mode="edit"
          stockLocation={data ? data.stockLocation : null}
          parentContext={parentContext}
          alertHandler={alertHandler}
        />
      )}
      {showViewModal && (
        <InventoryLineModal
          show={showViewModal}
          setShow={setShowViewModal}
          header={t('LBL_INVENTORY_LINE')}
          line={viewLine}
          mode="view"
          stockLocation={data ? data.stockLocation : null}
          parentContext={parentContext}
          alertHandler={alertHandler}
        />
      )}
    </>
  );
}

export default InventoryLines;
