import { useEffect, useState } from 'react';
import InnerTable from '../../components/InnerTable';
import { useTranslation } from 'react-i18next';
import { MODELS } from '../../constants/models';
import { useAxiosFunction } from '../../hooks/useAxios';
import { getSearchUrl } from '../../services/getUrl';
import { STOCK_MOVES_SEARCH_FIELDS } from './StockMovesPayloadsFields';
import { STOCK_MOVE_STATUS, STOCK_MOVE_ENUMS } from '../../constants/enums/StockMoveEnums';
import { useNavigate } from 'react-router-dom';
import { useFeatures } from '../../hooks/useFeatures';

const StockMoves = ({ isPurchase = true, isInvoice = false, tableTitle = 'LBL_STOCK_MOVES', data }) => {
  const { t } = useTranslation();
  const { api } = useAxiosFunction();
  const navigate = useNavigate();
  const { getFeaturePath } = useFeatures();
  const [tempData, setTempData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const lineHeaders = [
    t('LBL_REFERENCE'),
    t('LBL_TYPE'),
    t('LBL_FROM_STOCK_LOCATION'),
    t('LBL_TO_STOCK_LOCATION'),
    t('LBL_ESTIMATED_DATE'),
    t('LBL_ORIGIN'),
    t('LBL_STATUS'),
  ];

  const viewLineHandler = line => {
    if (isPurchase && line.typeSelect === 3) {
      // supplier arrival
      navigate(getFeaturePath('SUPPLIER_ARRIVALS', 'view', { id: line.id }));
    } else if (isPurchase && line.typeSelect === 2) {
      //supplier return
      navigate(getFeaturePath('SUPPLIER_RETURNS', 'view', { id: line.id }));
    } else if (!isPurchase && line.typeSelect === 3) {
      //customer return
      navigate(getFeaturePath('CUSTOMER_RETURNS', 'view', { id: line.id }));
    } else if (!isPurchase && line.typeSelect === 2) {
      //customer delivery
      navigate(getFeaturePath('CUSTOMER_DELIVERIES', 'view', { id: line.id }));
    }
  };

  useEffect(() => {
    if (data) {
      setIsLoading(true);
      getStockMoves();
    }
  }, []);

  const getInvoiceStockMovePayload = () => {
    let fieldsIds = [];
    data &&
      data.stockMoveSet &&
      data.stockMoveSet.length > 0 &&
      data.stockMoveSet.forEach(item => {
        fieldsIds.push(item.id);
      });
    let payload = {
      fields: STOCK_MOVES_SEARCH_FIELDS,
      sortBy: ['statusSelect', '-estimatedDate'],
      data: {
        _domain: 'self.id in (:_field_ids)',
        _domainContext: { id: data.id, _model: MODELS.INVOICE, _field: 'stockMoveSet', _field_ids: fieldsIds },
        _archived: true,
      },
      limit: -1,
      offset: 0,
      translate: true,
    };
    return payload;
  };

  const getPOStockMovePayload = () => {
    let payload = {
      fields: STOCK_MOVES_SEARCH_FIELDS,
      sortBy: ['statusSelect', '-estimatedDate'],
      data: {
        _domain: "self.originTypeSelect LIKE 'com.axelor.apps.purchase.db.PurchaseOrder' AND self.originId\n    = :purchaseOrder",
        _domainContext: {
          purchaseOrder: data.id,
          id: data.id,
          _id: null,
          _model: 'com.axelor.apps.purchase.db.PurchaseOrder',
        },
        _domainAction: 'action-purchase-order-view-stock-moves',
        operator: 'and',
        criteria: [],
      },
      limit: -1,
      offset: 0,
      translate: true,
    };
    return payload;
  };

  const getSOStockMovePayload = () => {
    let payload = {
      fields: STOCK_MOVES_SEARCH_FIELDS,
      sortBy: ['-estimatedDate'],
      data: {
        _domain: "self.originTypeSelect LIKE 'com.axelor.apps.sale.db.SaleOrder' AND self.originId =\n    :saleOrder",
        _domainContext: {
          _id: null,
          saleOrder: data.id,
          id: data.id,
          _model: 'com.axelor.apps.sale.db.SaleOrder',
        },
        _domainAction: 'action-sale-order-view-stock-moves',
        operator: 'and',
        criteria: [],
      },
      limit: -1,
      offset: 0,
      translate: true,
    };
    return payload;
  };

  const getStockMoves = async () => {
    let payload;

    if (isInvoice) {
      payload = getInvoiceStockMovePayload();
    } else if (isPurchase) {
      payload = getPOStockMovePayload();
    } else {
      payload = getSOStockMovePayload();
    }

    let movesResponse = await api('POST', getSearchUrl(MODELS.STOCK_MOVE), payload);
    let tempLines = movesResponse.data.data;
    let tempArr = [];

    if (tempLines && tempLines.length > 0) {
      tempLines.forEach(line => {
        tempArr.push({
          isDeleteable: false,
          isEditable: false,
          isViewable: true,
          tableData: [
            { value: line.stockMoveSeq ?? '', type: 'text' },
            { value: getStockMoveType(line), type: 'text', translate: true },
            { value: line.fromStockLocation?.name ?? '', type: 'text' },
            { value: line.toStockLocation?.name ?? '', type: 'text' },
            { value: line.estimatedDate ?? '', type: 'text' },
            { value: line.origin ?? '', type: 'text' },
            { value: STOCK_MOVE_STATUS[line.statusSelect] ?? '', type: 'text', translate: true },
          ],
          data: line,
          key: line.id,
          headData: line.stockMoveSeq,
        });
      });
    }

    setTempData(tempArr);
    setIsLoading(false);
  };

  const getStockMoveType = line => {
    if (line.typeSelect === 3 && !line.isReversion) return STOCK_MOVE_ENUMS[1];
    if (line.typeSelect === 2 && line.isReversion) return STOCK_MOVE_ENUMS[2];
    if (line.typeSelect === 2 && !line.isReversion) return STOCK_MOVE_ENUMS[3];
    if (line.typeSelect === 3 && line.isReversion) return STOCK_MOVE_ENUMS[4];
  };

  return (
    <>
      <InnerTable
        title={tableTitle}
        pageMode="view"
        // onEditLine={editLineHandler}
        onViewLine={viewLineHandler}
        lineHeaders={lineHeaders}
        lineData={tempData}
        withBorderSection={false}
        canAdd={false}
        isLoading={isLoading}
      />
    </>
  );
};

export default StockMoves;
