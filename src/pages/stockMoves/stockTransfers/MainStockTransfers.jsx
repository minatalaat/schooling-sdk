import { Routes, Route, Navigate } from 'react-router-dom';

import StockTransfers from './StockTransfers';
import ManageStockTransfers from './ManageStockTransfers';

import { useFeatures } from '../../../hooks/useFeatures';

const MainStockTransfers = () => {
  const feature = 'STOCK_MANAGEMENT';
  const subFeature = 'STOCK_TRANSFERS';

  const { canAdd, canEdit, canView, featuresEnum } = useFeatures(feature, subFeature);

  return (
    <Routes>
      <Route path="/" element={<StockTransfers />} />
      {canEdit && <Route path={featuresEnum[subFeature].EDIT_ONLY} element={<ManageStockTransfers enableEdit={true} />} />}
      {canView && <Route path={featuresEnum[subFeature].VIEW_ONLY} element={<ManageStockTransfers enableEdit={false} />} />}
      {canAdd && <Route path={featuresEnum[subFeature].ADD_ONLY} element={<ManageStockTransfers addNew />} />}
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default MainStockTransfers;
