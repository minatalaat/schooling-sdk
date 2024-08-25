import { Routes, Route, Navigate } from 'react-router-dom';

import UsersGroups from './UsersGroups';
import AddUserGroup from './AddUserGroup';
import EditUserGroup from './EditUserGroup';
import ViewUserGroup from './ViewUserGroup';

import { useFeatures } from '../../hooks/useFeatures';

const MainUserGroups = () => {
  const feature = 'SETTINGS';
  const subFeature = 'USERS_GROUPS';

  const { canAdd, canEdit, canView, featuresEnum } = useFeatures(feature, subFeature);

  return (
    <Routes>
      <Route path="/" element={<UsersGroups feature={feature} subFeature={subFeature} />} />
      {canEdit && <Route path={featuresEnum[subFeature].EDIT_ONLY} element={<EditUserGroup feature={feature} subFeature={subFeature} />} />}
      {canView && <Route path={featuresEnum[subFeature].VIEW_ONLY} element={<ViewUserGroup feature={feature} subFeature={subFeature} />} />}
      {canAdd && <Route path={featuresEnum[subFeature].ADD_ONLY} element={<AddUserGroup feature={feature} subFeature={subFeature} />} />}
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default MainUserGroups;
