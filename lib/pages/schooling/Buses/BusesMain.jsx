import { Routes, Route, Navigate } from 'react-router-dom';
import BusesList from './BusesList';
import BusesManage from './BusesManage';
import StudentsList from './StudentsList';
import { useFeatures } from '../../../hooks/useFeatures';

const BusesMain = () => {
  const feature = 'SCHOOLING';
  const subFeature = 'BUSES';

  const { featuresEnum } = useFeatures(feature, subFeature);

  return (
    <Routes>
      <Route path="/" element={<BusesList />} />
      <Route path={featuresEnum[subFeature].EDIT_ONLY} element={<BusesManage enableEdit={true} />} />
      <Route path={featuresEnum[subFeature].VIEW_ONLY} element={<BusesManage enableEdit={false} />} />
      <Route path={featuresEnum[subFeature].ADD_ONLY} element={<BusesManage addNew />} />
      <Route path={featuresEnum[subFeature].LIST_ONLY} element={<StudentsList addNew />} />
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default BusesMain;
