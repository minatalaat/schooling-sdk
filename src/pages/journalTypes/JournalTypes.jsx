import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import JournalTypesList from './JournalTypesList';

import { useAxiosFunction } from '../../hooks/useAxios';
import { getModelFieldsUrl } from '../../services/getUrl';
import { MODELS } from '../../constants/models';

const JournalTypes = () => {
  const { api } = useAxiosFunction();

  const [technicalTypeSelects, setTechnicalTypesSelects] = useState(null);

  const fetchMetaData = () => {
    return api('GET', getModelFieldsUrl(MODELS.JOURNALTYPES));
  };

  const attributes = {
    technicalTypeSelect: {
      data: technicalTypeSelects,
      setData: data => setTechnicalTypesSelects(data),
      fetchData: fetchMetaData,
    },
  };

  return (
    <Routes>
      <Route path="/" element={<JournalTypesList {...attributes} />} />
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default JournalTypes;
