import { featuresEnum } from '../../constants/featuresEnum/featuresEnum';
import { MODELS } from '../../constants/models';
import { useAxiosFunction } from '../../hooks/useAxios';
import { getModelUrl, getSearchUrl } from '../getUrl';
import { useAuthServices } from './useAuthServices';

export const useFeatureConfigurationServices = () => {
  const { api } = useAxiosFunction();
  const { logoutService } = useAuthServices();

  const updateSupplyChainConfiguration = async isExist => {
    const supplyChainSearchRes = await api('POST', getSearchUrl(MODELS.APP_SUPPLY_CHAIN), {
      fields: ['id', 'version'],
      sortBy: null,
      data: {},
      limit: -1,
      offset: 0,
      translate: true,
    });
    const stockConfigSearchRes = await api('POST', getSearchUrl(MODELS.COMPANY_STOCK_CONFIG), {
      fields: ['id', 'version', 'authRedirectPurchaseOrderToStockMove', 'authRedirectSaleOrderToStockMove'],
      related: {},
    });

    if (supplyChainSearchRes?.data?.status !== 0) return false;
    if (stockConfigSearchRes?.data?.status !== 0) return false;
    let supplyChainConfig = supplyChainSearchRes?.data?.data?.[0] || null;
    let stockConfig = stockConfigSearchRes?.data?.data?.[0] || null;

    if (supplyChainConfig && stockConfig) {
      if (isExist) {
        const res = await api('POST', getModelUrl(MODELS.APP_SUPPLY_CHAIN), {
          data: {
            id: supplyChainConfig?.id,
            version: supplyChainConfig && supplyChainConfig.version !== null ? supplyChainConfig.version : null,
            customerStockMoveGenerationAuto: true,
            supplierStockMoveGenerationAuto: true,
            custStockMoveMgtOnSO: true,
            supplStockMoveMgtOnPO: true,
            generateInvoiceFromStockMove: true,
            terminateSaleOrderOnDelivery: true,
            terminatePurchaseOrderOnReceipt: true,
            generateInvoiceFromSaleOrder: false,
            generateInvoiceFromPurchaseOrder: false,
          },
        });
        if (res?.data?.status !== 0) return false;

        const stockConfigRes = await api('POST', getModelUrl(MODELS.COMPANY_STOCK_CONFIG), {
          data: {
            authRedirectPurchaseOrderToStockMove: true,
            authRedirectSaleOrderToStockMove: true,
            version: stockConfig && stockConfig.version !== null ? stockConfig.version : null,
            id: stockConfig?.id || null,
          },
        });
        if (stockConfigRes?.data?.status !== 0) return false;
        return true;
      } else {
        const res = await api('POST', getModelUrl(MODELS.APP_SUPPLY_CHAIN), {
          data: {
            id: supplyChainConfig?.id,
            version: supplyChainConfig && supplyChainConfig.version !== null ? supplyChainConfig.version : null,
            customerStockMoveGenerationAuto: false,
            supplierStockMoveGenerationAuto: false,
            custStockMoveMgtOnSO: false,
            supplStockMoveMgtOnPO: false,
            generateInvoiceFromStockMove: false,
            terminateSaleOrderOnDelivery: false,
            terminatePurchaseOrderOnReceipt: false,
            generateInvoiceFromSaleOrder: true,
            generateInvoiceFromPurchaseOrder: true,
          },
        });
        if (res?.data?.status !== 0) return false;
        const stockConfigRes = await api('POST', getModelUrl(MODELS.COMPANY_STOCK_CONFIG), {
          data: {
            authRedirectPurchaseOrderToStockMove: false,
            authRedirectSaleOrderToStockMove: false,
            version: stockConfig && stockConfig.version !== null ? stockConfig.version : null,
            id: stockConfig?.id || null,
          },
        });
        if (stockConfigRes?.data?.status !== 0) return false;
        return true;
      }
    } else {
      return false;
    }
  };

  const updateConfigurationsService = async (featureId, isExist) => {
    try {
      if (featureId === featuresEnum['STOCK_MANAGEMENT']?.id) {
        updateSupplyChainConfiguration(isExist);
      }
    } catch (err) {
      return logoutService();
    }
  };

  return { updateConfigurationsService };
};
