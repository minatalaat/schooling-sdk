import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import TaxEdit from './TaxEdit';
import TaxesList from './TaxesList';

import { MODELS } from '../../constants/models';
import { useAxiosFunction } from '../../hooks/useAxios';
import { getModelFieldsUrl } from '../../services/getUrl';
import { useFeatures } from '../../hooks/useFeatures';

const Taxes = () => {
  const { api } = useAxiosFunction();
  const { canAdd, canEdit, canView, featuresEnum } = useFeatures('APP_CONFIG', 'TAXES');

  const [typeSelects, setTypeSelects] = useState(null);

  const fetchMetaData = () => {
    return api('GET', getModelFieldsUrl(MODELS.TAXES));
  };

  const attributes = {
    typeSelect: {
      data: typeSelects,
      setData: data => setTypeSelects(data),
      fetchData: fetchMetaData,
    },
  };

  return (
    <Routes>
      <Route path="/" element={<TaxesList {...attributes} />} />
      {canEdit && <Route path={featuresEnum['TAXES'].EDIT_ONLY} element={<TaxEdit {...attributes} enableEdit={true} />} />}
      {canView && <Route path={featuresEnum['TAXES'].VIEW_ONLY} element={<TaxEdit {...attributes} enableEdit={false} />} />}
      {canAdd && <Route path={featuresEnum['TAXES'].ADD_ONLY} element={<TaxEdit {...attributes} addNew />} />}
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default Taxes;
