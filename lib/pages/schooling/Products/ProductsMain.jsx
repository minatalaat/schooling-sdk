import { Routes, Route, Navigate} from 'react-router-dom';

import ProductsList from './ProductsList';
import ProductManage from './ProductManage';
import { FEATURES } from '../../../constants/Features/features';

const ProductsMain = () => {
  const subFeature = 'CANTEEN_PRODUCTS';

  return (
    <Routes>
      <Route path="/" element={<ProductsList />} />
      <Route path={FEATURES[subFeature].SUB_PATHS.EDIT} eelement={<ProductManage enableEdit={true} />} />
      <Route path={FEATURES[subFeature].SUB_PATHS.VIEW} element={<ProductManage enableEdit={false} />} />
      <Route path={FEATURES[subFeature].SUB_PATHS.ADD} element={<ProductManage addNew  />} />
      <Route path="*" element={<Navigate replace to="/home" />} />

    </Routes>
  );
};

export default ProductsMain;
