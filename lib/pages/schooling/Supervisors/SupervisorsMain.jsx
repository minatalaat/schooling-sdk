import { Routes, Route, Navigate } from 'react-router-dom';
import SupervisorsList from './SupervisorsList';
import SupervisorsManage from './SupervisorsManage';
import { FEATURES } from '../../../constants/Features/features';

const SupervisorsMain = () => {
  const subFeature = 'SUPERVISORS';

  return (
    <Routes>
      <Route path="/" element={<SupervisorsList />} />
      <Route path={FEATURES[subFeature].SUB_PATHS.EDIT} element={<SupervisorsManage enableEdit={true} />} />
      <Route path={FEATURES[subFeature].SUB_PATHS.VIEW} element={<SupervisorsManage enableEdit={false} />} />
      <Route path={FEATURES[subFeature].SUB_PATHS.ADD} element={<SupervisorsManage addNew />} />
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default SupervisorsMain;
