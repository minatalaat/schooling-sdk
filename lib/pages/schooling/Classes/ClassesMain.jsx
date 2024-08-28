import { Routes, Route, Navigate } from 'react-router-dom';
// import { featuresEnum } from '../../../constants/featuresEnum/featuresEnum';
import StudentsList from './StudentsList';
import ClassesList from './ClassesList';
import ClassesManage from './ClassesManage';
import StudentsAttendance from './StudentAttendance';
import { FEATURES } from '../../../constants/Features/features';

const ClassesMain = () => {
  const subFeature = 'CLASSES';

  return (
    <Routes>
      <Route path="/" element={<ClassesList />} />
      <Route path={FEATURES[subFeature].SUB_PATHS.EDIT} element={<ClassesManage enableEdit={true} />} />
      <Route path={FEATURES[subFeature].SUB_PATHS.VIEW} element={<ClassesManage enableEdit={false} />} />
      <Route path={FEATURES[subFeature].SUB_PATHS.ADD} element={<ClassesManage addNew />} />
      <Route path={FEATURES[subFeature].SUB_PATHS.LIST} element={<StudentsList addNew />} />
      <Route path={FEATURES[subFeature].SUB_PATHS.ATTENDANCE} element={<StudentsAttendance addNew />} />

      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default ClassesMain;
