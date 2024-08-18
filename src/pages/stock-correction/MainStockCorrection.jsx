import { Routes, Route, Navigate } from 'react-router-dom';

import { useFeatures } from '../../hooks/useFeatures';
import StockCorrection from './StockCorrection';
import ManageStockCorrection from './ManageStockCorrection';

const MainStockCorrection = () => {
  const feature = 'STOCK_MANAGEMENT';
  const subFeature = 'STOCK_CORRECTION';

  const { canAdd, canEdit, canView, featuresEnum } = useFeatures(feature, subFeature);

  return (
    <Routes>
      <Route path="/" element={<StockCorrection />} />
      {canEdit && <Route path={featuresEnum[subFeature].EDIT_ONLY} element={<ManageStockCorrection enableEdit={true} />} />}
      {canView && <Route path={featuresEnum[subFeature].VIEW_ONLY} element={<ManageStockCorrection enableEdit={false} />} />}
      {canAdd && <Route path={featuresEnum[subFeature].ADD_ONLY} element={<ManageStockCorrection addNew />} />}
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default MainStockCorrection;
