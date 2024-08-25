import { Route, Routes, Navigate } from 'react-router-dom';

import InActivity from '../components/main/InActivity/InActivity';
import Login from '../pages/Login';
import ChangeUserPassword from '../pages/users/ChangeUserPassword';

export default function FirstLoginRoutes() {
  return (
    <>
      <InActivity />
      <Routes>
        <Route path="/change-password" element={<ChangeUserPassword />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/change-password" />} />
      </Routes>
    </>
  );
}
