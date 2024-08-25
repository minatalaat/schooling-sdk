import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import FiscalYearEdit from './FiscalYearEdit';
import FiscalYearsList from './FiscalYearsList';

import { useAxiosFunction } from '../../hooks/useAxios';
import { getModelFieldsUrl } from '../../services/getUrl';
import { MODELS } from '../../constants/models';
import { useFeatures } from '../../hooks/useFeatures';

const FiscalYears = () => {
  const { api } = useAxiosFunction();
  const { canAdd, canEdit, canView, featuresEnum } = useFeatures('APP_CONFIG', 'FISCAL_YEARS');

  const [periodDurationSelectList, setPeriodDurationSelectList] = useState(null);
  const [statusList, setStatusList] = useState(null);
  const [typeSelectList, setTypeSelectList] = useState(null);
  const [periodStatusSelectList, setPeriodStatusSelectList] = useState(null);

  const fetchMetaData = () => {
    return api('GET', getModelFieldsUrl(MODELS.FISCALYEAR));
  };

  const fetchPeriodMetaData = () => {
    return api('GET', getModelFieldsUrl(MODELS.PERIOD));
  };

  const attributes = {
    periodDurationSelect: {
      data: periodDurationSelectList,
      setData: data => setPeriodDurationSelectList(data),
      fetchData: fetchMetaData,
    },
    statusSelect: {
      data: statusList,
      setData: data => setStatusList(data),
      fetchData: fetchMetaData,
    },
    typeSelect: {
      data: typeSelectList,
      setData: data => setTypeSelectList(data),
      fetchData: fetchMetaData,
    },
    periodStatusSelect: {
      data: periodStatusSelectList,
      setData: data => setPeriodStatusSelectList(data),
      fetchData: fetchPeriodMetaData,
    },
  };

  return (
    <Routes>
      <Route path="/" element={<FiscalYearsList {...attributes} />} />
      {canEdit && <Route path={featuresEnum['FISCAL_YEARS'].EDIT_ONLY} element={<FiscalYearEdit {...attributes} enableEdit={true} />} />}
      {canView && <Route path={featuresEnum['FISCAL_YEARS'].VIEW_ONLY} element={<FiscalYearEdit {...attributes} enableEdit={false} />} />}
      {canAdd && <Route path={featuresEnum['FISCAL_YEARS'].ADD_ONLY} element={<FiscalYearEdit {...attributes} addNew />} />}
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default FiscalYears;
