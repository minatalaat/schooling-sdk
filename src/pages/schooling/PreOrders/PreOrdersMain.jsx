import { Routes, Route, Navigate } from 'react-router-dom';
// import { featuresEnum } from '../../../constants/featuresEnum/featuresEnum';
import PreOrdersManage from './PreOrdersManage';
import { useFeatures } from '../../../hooks/useFeatures';
import PreOrdersList from './PreOrdersList';

const PreOrdersMain = () => {
  const feature = 'SCHOOLING';
  const subFeature = 'PRE_ORDERS';

  const { featuresEnum } = useFeatures(feature, subFeature);

  return (
    <Routes>
      <Route path="/" element={<PreOrdersList />} />
      <Route path={featuresEnum[subFeature].EDIT_ONLY} element={<PreOrdersManage enableEdit={true} />} />
      <Route path={featuresEnum[subFeature].VIEW_ONLY} element={<PreOrdersManage enableEdit={false} />} />
      <Route path={featuresEnum[subFeature].ADD_ONLY} element={<PreOrdersManage addNew />} />
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default PreOrdersMain;
