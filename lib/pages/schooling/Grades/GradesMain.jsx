import { Routes, Route, Navigate } from 'react-router-dom';
// import { featuresEnum } from '../../../constants/featuresEnum/featuresEnum';
import { useFeatures } from '../../../hooks/useFeatures';
import GradesManage from './GradesManage';
import GradesList from './GradesList';

const GradesMain = () => {
  const feature = 'SCHOOLING';
  const subFeature = 'GRADES';

  const { featuresEnum } = useFeatures(feature, subFeature);

  return (
    <Routes>
      <Route path="/" element={<GradesList />} />
      <Route path={featuresEnum[subFeature].EDIT_ONLY} element={<GradesManage enableEdit={true} />} />
      <Route path={featuresEnum[subFeature].VIEW_ONLY} element={<GradesManage enableEdit={false} />} />
      <Route path={featuresEnum[subFeature].ADD_ONLY} element={<GradesManage addNew />} />
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default GradesMain;
