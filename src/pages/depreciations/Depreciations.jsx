import { Routes, Route, Navigate } from 'react-router-dom';

import ListingDepreciations from './ListingDepreciations';

const Depreciations = () => {
  return (
    <Routes>
      <Route path="/" element={<ListingDepreciations />} />
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default Depreciations;
