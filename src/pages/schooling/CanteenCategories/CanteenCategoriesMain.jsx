import { Routes, Route, Navigate } from 'react-router-dom';
// import { featuresEnum } from '../../../constants/featuresEnum/featuresEnum';
import CanteenCategoriesManage from './CanteenCategoriesManage';
import CanteenCategoriesList from './CanteenCategoriesList';
import { useFeatures } from '../../../hooks/useFeatures';

const CanteenCategoriesMain = () => {
  const feature = 'SCHOOLING';
  const subFeature = 'CANTEEN_CATEGORIES';

  const { featuresEnum } = useFeatures(feature, subFeature);

  return (
    <Routes>
      <Route path="/" element={<CanteenCategoriesList />} />
      <Route path={featuresEnum[subFeature].EDIT_ONLY} element={<CanteenCategoriesManage enableEdit={true} />} />
      <Route path={featuresEnum[subFeature].VIEW_ONLY} element={<CanteenCategoriesManage enableEdit={false} />} />
      <Route path={featuresEnum[subFeature].ADD_ONLY} element={<CanteenCategoriesManage addNew />} />
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default CanteenCategoriesMain;
