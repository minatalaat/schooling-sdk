import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import InnerTable from '../../../components/InnerTable';

import { useAxiosFunction } from '../../../hooks/useAxios';
import { getSearchUrl } from '../../../services/getUrl';
import { MODELS } from '../../../constants/models';

export default function LocationContent({ stockLocationData, onAlert }) {
  const { t } = useTranslation();
  const { api } = useAxiosFunction();

  const [locationLines, setLocationLines] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLocationLines = async () => {
    setIsLoading(true);
    const locationLinesResponse = await api('POST', getSearchUrl(MODELS.STOCK_LOCATION_LINES), {
      fields: [
        'product',
        'unit',
        'rack',
        'requestedReservedQty',
        'stockLocation',
        'avgPrice',
        'reservedQty',
        'currentQty',
        'trackingNumber',
        'futureQty',
      ],
      sortBy: ['product'],
      data: {
        _domain:
          'self.stockLocation.id IN :contentLocationIds AND ((:includeOutOfStock = false AND\n    (self.currentQty != 0 OR self.futureQty != 0)) OR (:includeOutOfStock = true)) AND\n    ((:typeSelect = 3) OR (:typeSelect != 3 AND ((:includeVirtualSubLocation = true) OR\n    (:includeVirtualSubLocation = false AND self.stockLocation.typeSelect != 3))))',
        _domainContext: {
          ...stockLocationData,
          contentLocationIds: [stockLocationData.id],
          _model: MODELS.STOCK_LOCATION,
        },
        _domainAction: 'action-location-view-location-content',
        operator: 'and',
        criteria: [],
      },
      limit: 40,
      offset: 0,
      translate: true,
    });

    if (!locationLinesResponse || !locationLinesResponse.data || locationLinesResponse.data.status !== 0) {
      setIsLoading(false);
      return onAlert('Error', t('ERROR_LOADING_LOCATION_LINES'));
    }

    setIsLoading(false);
    setLocationLines(locationLinesResponse.data.data || []);
  };

  const lineHeaders = [t('LBL_PRODUCT'), t('LBL_CURRENT_QTY'), t('LBL_FUTURE_QTY'), t('LBL_UNIT'), t('LBL_AVERAGE_PRICE')];

  useEffect(() => {
    if (stockLocationData?.name) fetchLocationLines();
  }, []);

  useEffect(() => {
    let tempData = [];
    locationLines.length > 0 &&
      locationLines.forEach(line => {
        tempData.push({
          isDeleteable: false,
          isEditable: false,
          isViewable: false,
          tableData: [
            { value: line.product?.fullName || '', type: 'text' },
            { value: +line.currentQty || 0, type: 'number' },
            { value: +line.futureQty || 0, type: 'number' },
            { value: line.unit?.name || '', type: 'text' },
            { value: (+line.avgPrice)?.toFixed(2) || 0, type: 'number' },
          ],
          data: line,
          key: line.id,
          headData: line.product?.name || '',
        });
      });
    setLineData(tempData);
  }, [locationLines]);

  return <InnerTable pageMode="view" lineHeaders={lineHeaders} lineData={lineData} isLoading={isLoading} withBorderSection={false} />;
}
