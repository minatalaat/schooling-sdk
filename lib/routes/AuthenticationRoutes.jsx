import { Route, Routes, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import ChangeUserPassword from '../pages/users/ChangeUserPassword';
import Login from '../pages/Login';

export default function AuthenticationRoutes() {
  const { changePassword } = useSelector(state => state.auth);

  return (
    <Routes>
      {changePassword && <Route path="/change-password" element={<ChangeUserPassword />} />}
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
