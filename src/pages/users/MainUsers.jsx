import { Routes, Route, Navigate } from 'react-router-dom';

import Users from './Users';
import AddUser from './AddUser';
import EditUser from './EditUser';
import ViewUser from './ViewUser';

import { useFeatures } from '../../hooks/useFeatures';

const MainUsers = () => {
  const feature = 'SETTINGS';
  const subFeature = 'USERS';

  const { canAdd, canEdit, canView, featuresEnum } = useFeatures(feature, subFeature);

  return (
    <Routes>
      <Route path="/" element={<Users feature={feature} subFeature={subFeature} />} />
      {canEdit && <Route path={featuresEnum[subFeature].EDIT_ONLY} element={<EditUser feature={feature} subFeature={subFeature} />} />}
      {canView && <Route path={featuresEnum[subFeature].VIEW_ONLY} element={<ViewUser feature={feature} subFeature={subFeature} />} />}
      {canAdd && <Route path={featuresEnum[subFeature].ADD_ONLY} element={<AddUser feature={feature} subFeature={subFeature} />} />}
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default MainUsers;
