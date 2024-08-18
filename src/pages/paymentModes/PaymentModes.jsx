import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import PaymentModesEdit from './PaymentModesEdit';
import PaymentModesList from './PaymentModesList';

import { MODELS } from '../../constants/models';
import { useAxiosFunction } from '../../hooks/useAxios';
import { getModelFieldsUrl } from '../../services/getUrl';
import { useFeatures } from '../../hooks/useFeatures';

const PaymentModes = () => {
  const { api } = useAxiosFunction();
  const { canAdd, canEdit, canView, featuresEnum } = useFeatures('APP_CONFIG', 'PAYMENT_MODES');

  const [typeSelects, setTypeSelects] = useState(null);
  const [inOutSelects, setInOutSelects] = useState(null);

  const fetchMetaData = () => {
    return api('GET', getModelFieldsUrl(MODELS.PAYMENTMODES));
  };

  const attributes = {
    typeSelect: {
      data: typeSelects,
      setData: data => setTypeSelects(data),
      fetchData: fetchMetaData,
    },
    inOutSelect: {
      data: inOutSelects,
      setData: data => setInOutSelects(data),
      fetchData: fetchMetaData,
    },
  };

  return (
    <Routes>
      <Route path="/" element={<PaymentModesList />} />
      {canEdit && <Route path={featuresEnum['PAYMENT_MODES'].EDIT_ONLY} element={<PaymentModesEdit enableEdit={true} {...attributes} />} />}
      {canView && (
        <Route path={featuresEnum['PAYMENT_MODES'].VIEW_ONLY} element={<PaymentModesEdit enableEdit={false} {...attributes} />} />
      )}
      {canAdd && <Route path={featuresEnum['PAYMENT_MODES'].ADD_ONLY} element={<PaymentModesEdit addNew {...attributes} />} />}
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
};

export default PaymentModes;
