import { Routes, Route, Navigate } from 'react-router-dom';
// import { featuresEnum } from '../../../constants/featuresEnum/featuresEnum';
import SupervisorsList from './SupervisorsList';
import SupervisorsManage from './SupervisorsManage';
import { useFeatures } from '../../../hooks/useFeatures';

const SupervisorsMain = () => {
  const feature = 'SCHOOLING';
  const subFeature = 'SUPERVISORS';

  const { featuresEnum } = useFeatures(feature, subFeature);

  return (
    <Routes>
      <Route path="/" element={<SupervisorsList />} />
      <Route path={featuresEnum[subFeature].EDIT_ONLY} element={<SupervisorsManage enableEdit={true} />} />
      <Route path={featuresEnum[subFeature].VIEW_ONLY} element={<SupervisorsManage enableEdit={false} />} />
      <Route path={featuresEnum[subFeature].ADD_ONLY} element={<SupervisorsManage addNew />} />
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default SupervisorsMain;
