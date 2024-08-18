import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import InnerTable from '../../../components/InnerTable';

import { useAxiosFunction } from '../../../hooks/useAxios';
import { getSearchUrl } from '../../../services/getUrl';
import { STOCK_MOVES_SEARCH_FIELDS } from '../StockMovesPayloadsFields';
import { STOCK_MOVE_STATUS } from '../../../constants/enums/StockMoveEnums';
import { MODELS } from '../../../constants/models';
import { useFeatures } from '../../../hooks/useFeatures';

const StockReturns = ({ tableTitle, stockMove }) => {
  const { api } = useAxiosFunction();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getFeaturePath } = useFeatures();

  const [tempData, setTempData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const lineHeaders = [
    t('LBL_REFERENCE'),
    t('LBL_FROM_STOCK_LOCATION'),
    t('LBL_TO_STOCK_LOCATION'),
    t('LBL_ESTIMATED_DATE'),
    t('LBL_STATUS'),
  ];
  useEffect(() => {
    setIsLoading(true);
    getStockReturns();
  }, []);

  const getReturnsPayload = () => {
    let payload = {
      fields: STOCK_MOVES_SEARCH_FIELDS,
      sortBy: ['-estimatedDate'],
      data: {
        _domain: `self.isReversion = TRUE AND self.reversionOriginStockMove.id = ${stockMove?.id}`,
        _domainContext: {
          _isReversion: true,
          _id: null,
          _model: MODELS.STOCK_MOVE,
        },
        operator: 'and',
        criteria: [],
      },
      limit: -1,
      offset: 0,
      translate: true,
    };
    return payload;
  };

  const getStockReturns = async () => {
    let movesResponse = await api('POST', getSearchUrl(MODELS.STOCK_MOVE), getReturnsPayload());
    let tempLines = movesResponse?.data?.data;
    let tempArr = [];

    if (tempLines && tempLines.length > 0) {
      tempLines.forEach(line => {
        tempArr.push({
          isDeleteable: false,
          isEditable: false,
          isViewable: true,
          tableData: [
            { value: line.stockMoveSeq ?? '', type: 'text' },
            { value: line.fromStockLocation?.name ?? '', type: 'text' },
            { value: line.toStockLocation?.name ?? '', type: 'text' },
            { value: line.estimatedDate ?? '', type: 'text' },
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

  const viewLineHandler = line => {
    if (line.typeSelect === 2) {
      navigate(getFeaturePath('SUPPLIER_RETURNS', 'view', { id: line.id }));
    } else {
      navigate(getFeaturePath('CUSTOMER_RETURNS', 'view', { id: line.id }));
    }
  };

  return (
    <>
      <InnerTable
        title={tableTitle}
        canAdd={false}
        pageMode="view"
        onViewLine={viewLineHandler}
        lineHeaders={lineHeaders}
        lineData={tempData}
        withBorderSection={false}
        alternativeID="lineId"
        isLoading={isLoading}
      />
    </>
  );
};

export default StockReturns;
