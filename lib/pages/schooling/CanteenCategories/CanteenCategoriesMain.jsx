import { Routes, Route, Navigate } from 'react-router-dom';
// import { featuresEnum } from '../../../constants/featuresEnum/featuresEnum';
import CanteenCategoriesManage from './CanteenCategoriesManage';
import CanteenCategoriesList from './CanteenCategoriesList';
import { FEATURES } from '../../../constants/Features/features';

const CanteenCategoriesMain = () => {
  const subFeature = 'CANTEEN_CATEGORIES';
  return (
    <Routes>
      <Route path="/" element={<CanteenCategoriesList />} />
      <Route path={FEATURES[subFeature].SUB_PATHS.EDIT} element={<CanteenCategoriesManage enableEdit={true} />} />
      <Route path={FEATURES[subFeature].SUB_PATHS.VIEW} element={<CanteenCategoriesManage enableEdit={false} />} />
      <Route path={FEATURES[subFeature].SUB_PATHS.ADD} element={<CanteenCategoriesManage addNew />} />
      <Route path="*" element={<Navigate replace to="/home" />} />

    </Routes>
  );
};

export default CanteenCategoriesMain;
