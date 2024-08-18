import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import PaymentConditionEdit from './PaymentConditionEdit';
import PaymentConditionsList from './PaymentConditionsList';

import { useAxiosFunction } from '../../hooks/useAxios';
import { getModelFieldsUrl } from '../../services/getUrl';
import { MODELS } from '../../constants/models';
import { useFeatures } from '../../hooks/useFeatures';

const PaymentConditions = () => {
  const { api } = useAxiosFunction();
  const { canAdd, canEdit, canView, featuresEnum } = useFeatures('APP_CONFIG', 'PAYMENT_CONDITIONS');

  const [typeSelects, setTypeSelects] = useState(null);
  const [periodTypeSelects, setPeriodSelects] = useState(null);

  const fetchMetaData = () => {
    return api('GET', getModelFieldsUrl(MODELS.PAYMENTCONDITION));
  };

  const attributes = {
    typeSelect: {
      data: typeSelects,
      setData: data => setTypeSelects(data),
      fetchData: fetchMetaData,
    },
    periodTypeSelect: {
      data: periodTypeSelects,
      setData: data => setPeriodSelects(data),
      fetchData: fetchMetaData,
    },
  };

  return (
    <Routes>
      <Route path="/" element={<PaymentConditionsList {...attributes} />} />
      {canEdit && (
        <Route path={featuresEnum['PAYMENT_CONDITIONS'].EDIT_ONLY} element={<PaymentConditionEdit {...attributes} enableEdit={true} />} />
      )}
      {canView && (
        <Route path={featuresEnum['PAYMENT_CONDITIONS'].VIEW_ONLY} element={<PaymentConditionEdit {...attributes} enableEdit={false} />} />
      )}
      {canAdd && <Route path={featuresEnum['PAYMENT_CONDITIONS'].ADD_ONLY} element={<PaymentConditionEdit {...attributes} addNew />} />}
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default PaymentConditions;
