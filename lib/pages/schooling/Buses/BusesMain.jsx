import { Routes, Route, Navigate } from 'react-router-dom';
import BusesList from './BusesList';
import BusesManage from './BusesManage';
import StudentsList from './StudentsList';
import { FEATURES } from '../../../constants/Features/features';

const BusesMain = () => {
  const subFeature = 'BUSES';


  return (
    <Routes>
      <Route path="/" element={<BusesList />} />
      <Route path={FEATURES[subFeature].SUB_PATHS.EDIT} element={<BusesManage enableEdit={true} />} />
      <Route path={FEATURES[subFeature].SUB_PATHS.VIEW} element={<BusesManage enableEdit={false} />} />
      <Route path={FEATURES[subFeature].SUB_PATHS.ADD} element={<BusesManage addNew />} />
      <Route path={FEATURES[subFeature].SUB_PATHS.LIST} element={<StudentsList addNew />} />
      <Route path="*" element={<Navigate replace to="/home" />} />

    </Routes>
  );
};

export default BusesMain;
