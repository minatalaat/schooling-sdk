import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import InnerTable from '../../components/InnerTable';

import GenerateInvoiceStockLineModal from './GenerateInvoiceStockLineModal';
import { formatFloatNumber } from '../../utils/helpers';

function GenerateInvoiceStockLines({ tableTitle }) {
  const { t } = useTranslation();
  const generateInvoiceStockMovesLines = useSelector(state => state.generateInvoiceStockMovesLines.generateInvoiceStockMovesLines);
  // let tableTitle = t('LBL_SUPPLIER_ARRIVALS_LINES');
  const lineHeaders = [
    t('LBL_PRODUCT_NAME'),
    t('LBL_REAL_QTY'),
    t('LBL_QUANITY_TO_BE_INVOICED'),
    t('LBL_QUANTITY_REMAINIG'),
    t('LBL_INVOICED_QTY'),
  ];
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

  useEffect(() => {
    let tempArr = [];
    generateInvoiceStockMovesLines.forEach(line => {
      tempArr.push({
        isDeleteable: false,
        isEditable: true,
        isViewable: true,
        tableData: [
          { value: line.productName ?? '', type: 'text' },
          { value: line.realQty ? formatFloatNumber(line.realQty).toString() : '', type: 'number' },
          { value: line.qtyToInvoice ? formatFloatNumber(line.qtyToInvoice).toString() : '', type: 'number' },
          { value: line.remainingQty ? formatFloatNumber(line.remainingQty).toString() : '', type: 'number' },
          { value: line.qtyInvoiced ? formatFloatNumber(line.qtyInvoiced).toString() : '', type: 'number' },
        ],
        data: line,
        key: line.stockMoveLineId,
        headData: line.productName ?? '',
      });
    });
    setTempData(tempArr);
  }, [generateInvoiceStockMovesLines]);

  return (
    <>
      <InnerTable
        title={tableTitle}
        pageMode="edit"
        canAdd={false}
        onEditLine={editLineHandler}
        onViewLine={viewLineHandler}
        lineHeaders={lineHeaders}
        lineData={tempData}
        withBorderSection={false}
        isRequired={true}
        // alternativeID="lineId"
      />
      {showEditModal && (
        <GenerateInvoiceStockLineModal
          show={showEditModal}
          setShow={setShowEditModal}
          header={t('LBL_STOCK_MOVE_LINE')}
          line={editLine}
          mode="edit"
        />
      )}
      {showViewModal && (
        <GenerateInvoiceStockLineModal
          show={showViewModal}
          setShow={setShowViewModal}
          header={t('LBL_STOCK_MOVE_LINE')}
          line={viewLine}
          mode="view"
        />
      )}
    </>
  );
}

export default GenerateInvoiceStockLines;
