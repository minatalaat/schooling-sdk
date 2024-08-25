import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import OpenInvoicesCard from './OpenInvoicesCard';

import { MODELS } from '../../../constants/models';
import { useAxiosFunction } from '../../../hooks/useAxios';
import { getSearchUrl } from '../../../services/getUrl';
import { useFeatures } from '../../../hooks/useFeatures';
import { alertsActions } from '../../../store/alerts';

function OpenInvoices({ type }) {
  const dispatch = useDispatch();

  const { api } = useAxiosFunction();
  const { getFeaturePath } = useFeatures();
  const [isLoading, setIsLoading] = useState(true);
  const [openInvoices, setOpenInvoices] = useState({
    currency: 'LBL_SAR_BRIEF',
    ref: type === 'LBL_SUPPLIERS' ? getFeaturePath('SUPPLIERS_INVOICES') : getFeaturePath('CUSTOMERS_INVOICES'),
    label: type,
    amount: 0,
  });

  const fetchOpenInvoices = () => {
    setIsLoading(true);
    api(
      'POST',
      getSearchUrl(MODELS.INVOICE),
      {
        fields: ['amountRemaining'],
        data: {
          _domain: `self.statusSelect = 3 AND self.operationTypeSelect = ${
            type === 'LBL_SUPPLIERS' ? 1 : 3
          } AND  self.companyInTaxTotalRemaining > 0`,
        },
        limit: 0,
        offset: 0,
        translate: true,
      },
      res => {
        setIsLoading(false);

        if (res.data.status === 0) {
          if (res.data.data) {
            let data = res.data.data;
            let totalAmount = 0;
            data.forEach(invoice => {
              totalAmount = totalAmount + Number(invoice.amountRemaining);
            });
            setOpenInvoices({ ...openInvoices, amount: totalAmount });
          }
        } else {
          dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'SOMETHING_WENT_WRONG' }));
        }
      }
    );
  };

  useEffect(() => {
    fetchOpenInvoices();
  }, []);
  return <OpenInvoicesCard invoices={openInvoices} isLoading={isLoading} />;
}

export default OpenInvoices;
