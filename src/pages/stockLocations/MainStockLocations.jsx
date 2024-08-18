import { Routes, Route, Navigate } from 'react-router-dom';

import ListStockLocations from './StockLocations';
import ManageStockLocations from './ManageStockLocations';

import { useFeatures } from '../../hooks/useFeatures';

const MainStockLocations = () => {
  const feature = 'STOCK_MANAGEMENT';
  const subFeature = 'STOCK_LOCATIONS';

  const { canAdd, canEdit, canView, featuresEnum } = useFeatures(feature, subFeature);

  return (
    <Routes>
      <Route path="/" element={<ListStockLocations />} />
      {canEdit && <Route path={featuresEnum[subFeature].EDIT_ONLY} element={<ManageStockLocations enableEdit={true} />} />}
      {canView && <Route path={featuresEnum[subFeature].VIEW_ONLY} element={<ManageStockLocations enableEdit={false} />} />}
      {canAdd && <Route path={featuresEnum[subFeature].ADD_ONLY} element={<ManageStockLocations addNew />} />}
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default MainStockLocations;
