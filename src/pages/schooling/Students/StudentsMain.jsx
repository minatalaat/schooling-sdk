import { Routes, Route, Navigate } from 'react-router-dom';
// import { featuresEnum } from '../../../constants/featuresEnum/featuresEnum';
import StudentsList from './StudentsList';
import StudentsManage from './StudentsManage';
import { useFeatures } from '../../../hooks/useFeatures';

const StudentsMain = () => {
  const feature = 'SCHOOLING';
  const subFeature = 'STUDENTS';

  const { featuresEnum } = useFeatures(feature, subFeature);

  return (
    <Routes>
      <Route path="/" element={<StudentsList />} />
      <Route path={featuresEnum[subFeature].EDIT_ONLY} element={<StudentsManage enableEdit={true} />} />
      <Route path={featuresEnum[subFeature].VIEW_ONLY} element={<StudentsManage enableEdit={false} />} />
      <Route path={featuresEnum[subFeature].ADD_ONLY} element={<StudentsManage addNew />} />
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default StudentsMain;
