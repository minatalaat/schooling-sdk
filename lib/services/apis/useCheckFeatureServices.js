import { useMemo } from 'react';

import { useFeatures } from '../../hooks/useFeatures';

export const useCheckFeatureServices = () => {
  const { isFeatureAvailable } = useFeatures();

  const isStockManagementAvailable = useMemo(() => {
    return isFeatureAvailable({ featureCode: '12' });
  }, []);

  const isCostCenterAvailable = useMemo(() => {
    return isFeatureAvailable({ featureCode: '13' });
  }, []);

  const isFixedAssetAvailable = useMemo(() => {
    return isFeatureAvailable({ featureCode: '14' });
  }, []);

  return {
    isStockManagementAvailable,
    isCostCenterAvailable,
    isFixedAssetAvailable,
  };
};
