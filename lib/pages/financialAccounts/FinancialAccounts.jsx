import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import FinancialAccountEdit from './FinancialAccountEdit';
import FinancialAccountsList from './FinancialAccountsList';

import { useAxiosFunction } from '../../hooks/useAxios';
import { getModelFieldsUrl } from '../../services/getUrl';
import { MODELS } from '../../constants/models';
import { useFeatures } from '../../hooks/useFeatures';

const FinancialAccounts = () => {
  const { api } = useAxiosFunction();
  const { canView, canAdd, canEdit, featuresEnum } = useFeatures('ACCOUNTING', 'FINANCIAL_ACCOUNTS');

  const [commonPositions, setCommonPositions] = useState(null);

  const fetchMetaData = () => {
    return api('GET', getModelFieldsUrl(MODELS.ACCOUNT));
  };

  const attributes = {
    commonPosition: {
      data: commonPositions,
      setData: data => setCommonPositions(data),
      fetchData: fetchMetaData,
    },
  };

  return (
    <Routes>
      <Route path="/" element={<FinancialAccountsList {...attributes} />} />
      {canEdit && (
        <Route path={featuresEnum['FINANCIAL_ACCOUNTS'].EDIT_ONLY} element={<FinancialAccountEdit {...attributes} enableEdit={true} />} />
      )}
      {canView && (
        <Route path={featuresEnum['FINANCIAL_ACCOUNTS'].VIEW_ONLY} element={<FinancialAccountEdit {...attributes} enableEdit={false} />} />
      )}
      {canAdd && <Route path={featuresEnum['FINANCIAL_ACCOUNTS'].ADD_ONLY} element={<FinancialAccountEdit {...attributes} addNew />} />}
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default FinancialAccounts;
