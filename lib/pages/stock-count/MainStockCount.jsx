import { Routes, Route, Navigate } from 'react-router-dom';

import StockCount from './StockCount';
import ManageStockCount from './ManageStockCount';

import { useFeatures } from '../../hooks/useFeatures';

const MainStockCount = () => {
  const feature = 'STOCK_MANAGEMENT';
  const subFeature = 'STOCK_COUNT';

  const { canAdd, canEdit, canView, featuresEnum } = useFeatures(feature, subFeature);

  return (
    <Routes>
      <Route path="/" element={<StockCount />} />
      {canEdit && <Route path={featuresEnum[subFeature].EDIT_ONLY} element={<ManageStockCount enableEdit={true} />} />}
      {canView && <Route path={featuresEnum[subFeature].VIEW_ONLY} element={<ManageStockCount enableEdit={false} />} />}
      {canAdd && <Route path={featuresEnum[subFeature].ADD_ONLY} element={<ManageStockCount addNew={true} />} />}
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default MainStockCount;
