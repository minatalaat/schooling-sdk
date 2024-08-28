import { Routes, Route, Navigate } from 'react-router-dom';
import StudentsList from './StudentsList';
import StudentsManage from './StudentsManage';
import { FEATURES } from '../../../constants/Features/features';

const StudentsMain = () => {
  const subFeature = 'STUDENTS';

  return (
    <Routes>
      <Route path="/" element={<StudentsList />} />
      <Route path={FEATURES[subFeature].SUB_PATHS.EDIT} element={<StudentsManage enableEdit={true} />} />
      <Route path={FEATURES[subFeature].SUB_PATHS.VIEW} element={<StudentsManage enableEdit={false} />} />
      <Route path={FEATURES[subFeature].SUB_PATHS.ADD} element={<StudentsManage addNew />} />
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default StudentsMain;
