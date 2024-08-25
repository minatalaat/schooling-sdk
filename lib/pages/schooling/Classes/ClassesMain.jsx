import { Routes, Route, Navigate } from 'react-router-dom';
// import { featuresEnum } from '../../../constants/featuresEnum/featuresEnum';
import StudentsList from './StudentsList';
import ClassesList from './ClassesList';
import ClassesManage from './ClassesManage';
import StudentsAttendance from './StudentAttendance';
import { useFeatures } from '../../../hooks/useFeatures';

const ClassesMain = () => {
  const feature = 'SCHOOLING';
  const subFeature = 'CLASSES';

  const { featuresEnum } = useFeatures(feature, subFeature);

  return (
    <Routes>
      <Route path="/" element={<ClassesList />} />
      <Route path={featuresEnum[subFeature].EDIT_ONLY} element={<ClassesManage enableEdit={true} />} />
      <Route path={featuresEnum[subFeature].VIEW_ONLY} element={<ClassesManage enableEdit={false} />} />
      <Route path={featuresEnum[subFeature].ADD_ONLY} element={<ClassesManage addNew />} />
      <Route path={featuresEnum[subFeature].LIST_ONLY} element={<StudentsList addNew />} />
      <Route path={featuresEnum[subFeature].ATTENDANCE_ONLY} element={<StudentsAttendance addNew />} />

      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default ClassesMain;
