import { Routes, Route, Navigate } from 'react-router-dom';

import UnitEdit from './UnitEdit';
import UnitsList from './UnitsList';

import { useFeatures } from '../../hooks/useFeatures';

const Units = () => {
  const { canAdd, canEdit, canView, featuresEnum } = useFeatures('APP_CONFIG', 'UNITS');

  return (
    <Routes>
      <Route path="/" element={<UnitsList />} />
      {canEdit && <Route path={featuresEnum['UNITS'].EDIT_ONLY} element={<UnitEdit enableEdit={true} />} />}
      {canView && <Route path={featuresEnum['UNITS'].VIEW_ONLY} element={<UnitEdit enableEdit={false} />} />}
      {canAdd && <Route path={featuresEnum['UNITS'].ADD_ONLY} element={<UnitEdit addNew />} />}
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default Units;
