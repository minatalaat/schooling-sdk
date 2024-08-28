import { Routes, Route, Navigate } from 'react-router-dom';
// import { featuresEnum } from '../../../constants/featuresEnum/featuresEnum';
import PreOrdersManage from './PreOrdersManage';
import PreOrdersList from './PreOrdersList';
import { FEATURES } from '../../../constants/Features/features';

const PreOrdersMain = () => {
  const subFeature = 'PRE_ORDERS';

  return (
    <Routes>
      <Route path="/" element={<PreOrdersList />} />
      <Route path={FEATURES[subFeature].SUB_PATHS.EDIT} element={<PreOrdersManage enableEdit={true} />} />
      <Route path={FEATURES[subFeature].SUB_PATHS.VIEW} element={<PreOrdersManage enableEdit={false} />} />
      <Route path={FEATURES[subFeature].SUB_PATHS.ADD} element={<PreOrdersManage addNew />} />
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default PreOrdersMain;
