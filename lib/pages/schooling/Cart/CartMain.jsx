import { Routes, Route, Navigate } from 'react-router-dom';
import CartForm from './CartForm';

const CartMain = () => {
  return (
    <Routes>
      <Route path="/" element={<CartForm />} />
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default CartMain;
