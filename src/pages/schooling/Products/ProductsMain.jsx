import { Routes, Route, Navigate } from 'react-router-dom';

import ProductsList from './ProductsList';
import ProductManage from './ProductManage';
import { useFeatures } from '../../../hooks/useFeatures';

const ProductsMain = () => {
  const feature = 'SCHOOLING';
  const subFeature = 'CANTEEN_PRODUCTS';

  const { featuresEnum } = useFeatures(feature, subFeature);

  return (
    <Routes>
      <Route path="/" element={<ProductsList />} />
      <Route path={featuresEnum[subFeature].EDIT_ONLY} element={<ProductManage enableEdit={true} />} />
      <Route path={featuresEnum[subFeature].VIEW_ONLY} element={<ProductManage enableEdit={false} />} />
      <Route path={featuresEnum[subFeature].ADD_ONLY} element={<ProductManage addNew />} />
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default ProductsMain;
