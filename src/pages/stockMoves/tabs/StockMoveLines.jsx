import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import InnerTable from '../../../components/InnerTable';
import StockMoveLineModal from './StockMoveLineModal';

import { formatFloatNumber } from '../../../utils/helpers';
import { stockMoveLineActions } from '../../../store/stockMoveLines';

const StockMoveLines = ({
  isPurchase,
  tableTitle,
  modalHeader,
  formik,
  data,
  addNew,
  enableEdit,
  stockMoveLineList,
  setStockMoveLineList,
  productDomain,
  parent,
  isInternal = false,
  setIsLoading,
  noAvailableQty = [],
  setNoAvailableQty = () => {},
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [addLine, setAddLine] = useState(null);
  const [editLine, setEditLine] = useState(null);
  const [viewLine, setViewLine] = useState(null);
  const [tempData, setTempData] = useState([]);

  const stockMoveType = useMemo(() => {
    if (!data && !addNew) return null;
    if (!data && addNew) return 'internal-stock-move';
    if (data.typeSelect === 2 && data.isReversion === false) return 'customer-delivery';
    if (data.typeSelect === 3 && data.isReversion === true) return 'customer-return';
    if (data.typeSelect === 3 && data.isReversion === false) return 'supplier-arrival';
    if (data.typeSelect === 2 && data.isReversion === true) return 'supplier-return';
    if (data.typeSelect === 1) return 'internal-stock-move';
    return null;
  }, [data]);

  let lineHeaders = [t('LBL_PRODUCT'), t('LBL_PRODUCT_NAME'), t('LBL_QUANTITY'), t('LBL_REAL_QTY'), t('LBL_UNIT'), t('LBL_UNIT_PRICE')];

  if (stockMoveType === 'customer-delivery' || stockMoveType === 'supplier-return') {
    lineHeaders.splice(4, 0, t('LBL_AVAILABLE_QTY'));
  }

  const addLineHandler = () => {
    let tempLine = { id: null, version: undefined, lineId: uuidv4() };
    dispatch(stockMoveLineActions.addLine({ line: tempLine }));
    setAddLine(tempLine);
    setShowAddModal(true);
  };

  const editLineHandler = line => {
    setShowEditModal(true);
    setEditLine(line);
  };

  const deleteLineHandler = line => {
    dispatch(stockMoveLineActions.deleteLine({ lineId: line.lineId }));
  };

  const viewLineHandler = line => {
    setShowViewModal(true);
    setViewLine(line);
  };

  const openMoreActionHandler = () => {
    // setSelectedLine(line);
  };

  useEffect(() => {
    updateStockMoveLines();
  }, [stockMoveLineList]);

  const updateStockMoveLines = () => {
    if (stockMoveLineList?.length > 0) {
      let tempArr = [];
      let tempQtyCheck = [...noAvailableQty];

      stockMoveLineList.forEach((line, index) => {
        let tempLine = { ...line };

        let lineIndex = -1;
        if (tempLine.id !== null) lineIndex = tempQtyCheck.indexOf(tempLine.id);
        else lineIndex = tempQtyCheck.indexOf(tempLine.lineId);

        if (lineIndex !== -1) {
          if (tempLine.realQty <= tempLine.availableQty) tempQtyCheck.splice(lineIndex, 1);
        }

        tempArr.push({
          isDeleteable: isInternal && data?.statusSelect < 3,
          isEditable: isInternal || data?.statusSelect < 3,
          isViewable: true,
          tableData: [
            { value: tempLine.product?.fullName ?? '', type: 'text' },
            { value: tempLine.productName ?? '', type: 'text' },
            { value: formatFloatNumber(tempLine.qty ?? 0), type: 'number' },
            { value: formatFloatNumber(tempLine.realQty ?? 0), type: 'number' },
            { value: tempLine.unit?.name ?? '', type: 'text' },
            { value: formatFloatNumber(tempLine.unitPriceUntaxed ?? 0), type: 'number' },
          ],
          data: tempLine,
          key: tempLine.lineId,
          headData: tempLine.product?.fullName ?? '',
        });

        if (stockMoveType === 'customer-delivery' || stockMoveType === 'supplier-return') {
          tempArr[index].tableData.splice(4, 0, { value: formatFloatNumber(tempLine.availableQty ?? 0), type: 'text' });
        }
      });
      setNoAvailableQty(tempQtyCheck);
      setTempData(tempArr);
      setIsLoading(false);
    } else {
      setTempData([]);
      setIsLoading(false);
    }
  };

  return (
    <>
      <InnerTable
        title={tableTitle}
        canAdd={isInternal && (addNew || (enableEdit && data?.statusSelect <= 2))}
        pageMode={addNew ? 'add' : enableEdit && data?.statusSelect <= 2 ? 'edit' : 'view'}
        onAddNewLine={addLineHandler}
        onEditLine={editLineHandler}
        onViewLine={viewLineHandler}
        onDeleteLine={deleteLineHandler}
        onOpenMoreAction={openMoreActionHandler}
        lineHeaders={lineHeaders}
        lineData={tempData}
        withBorderSection={false}
        alternativeID="lineId"
      />
      {showAddModal && (
        <StockMoveLineModal
          show={showAddModal}
          setShow={setShowAddModal}
          line={addLine}
          setLine={setAddLine}
          mode="add"
          stockMoveLineList={stockMoveLineList}
          setStockMoveLineList={setStockMoveLineList}
          data={data}
          formik={formik}
          header={modalHeader}
          isPurchase={isPurchase}
          productDomain={productDomain}
          parent={parent}
          isInternal={isInternal}
          stockMoveType={stockMoveType}
        />
      )}
      {showEditModal && (
        <StockMoveLineModal
          show={showEditModal}
          setShow={setShowEditModal}
          line={editLine}
          setLine={setEditLine}
          mode="edit"
          stockMoveLineList={stockMoveLineList}
          setStockMoveLineList={setStockMoveLineList}
          data={data}
          formik={formik}
          header={modalHeader}
          isPurchase={isPurchase}
          productDomain={productDomain}
          isInternal={isInternal}
          parent={parent}
          stockMoveType={stockMoveType}
        />
      )}
      {showViewModal && (
        <StockMoveLineModal
          formik={formik}
          show={showViewModal}
          setShow={setShowViewModal}
          line={viewLine}
          mode="view"
          header={modalHeader}
          isPurchase={isPurchase}
          stockMoveLineList={stockMoveLineList}
          setStockMoveLineList={setStockMoveLineList}
          isInternal={isInternal}
          parent={parent}
          stockMoveType={stockMoveType}
        />
      )}
    </>
  );
};

export default StockMoveLines;
