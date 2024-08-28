import { Routes, Route, Navigate } from 'react-router-dom';
import GradesManage from './GradesManage';
import GradesList from './GradesList';
import { FEATURES } from '../../../constants/Features/features';

const GradesMain = () => {
  const subFeature = 'GRADES';

  return (
    <Routes>
      <Route path="/" element={<GradesList />} />
      <Route path={FEATURES[subFeature].BASE_PATH.EDIT} element={<GradesManage enableEdit={true} />} />
      <Route path={FEATURES[subFeature].BASE_PATH.VIEW} element={<GradesManage enableEdit={false} />} />
      <Route path={FEATURES[subFeature].BASE_PATH.ADD} element={<GradesManage addNew />} />
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default GradesMain;
