import { useState, useEffect } from 'react';

import BreadCrumb from '../components/ui/BreadCrumb';
import TransactionsList from './TransactionsList';
import Calendar from '../components/ui/Calendar';

import { useFeatures } from '../hooks/useFeatures';
import { useParams } from 'react-router-dom';

function Transactions() {
  const { getFeaturePath } = useFeatures();
  const params = useParams();
  const id = params['*'].split('/')[0];
  const type = params['*'].split('/')[1];
  const [actionInProgress, setActionInProgress] = useState(false);
  const [isRun, setIsRun] = useState(false);
  const [partner, setPartner] = useState('');

  useEffect(() => {
    setActionInProgress(true);
    setPartner(id);
  }, []);

  let formikObj =
    type !== 'account'
      ? {
          values: {
            partner: {
              id: parseInt(id),
            },
          },
        }
      : {
          values: {
            account: {
              id: parseInt(id),
            },
          },
        };

  return (
    <>
      {actionInProgress && <div className="lodingpage"></div>}
      <div className="page-body">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <Calendar />
              {type === 'customer' && (
                <BreadCrumb
                  feature="SALES"
                  subFeature="CUSTOMERS"
                  modeText="LBL_VIEW_CUSTOMER"
                  moreBreadCrumb={[{ name: partner, path: getFeaturePath('CUSTOMERS', 'view', { id }) }]}
                />
              )}
              {type === 'supplier' && (
                <BreadCrumb
                  feature="PURCHASE"
                  subFeature="SUPPLIERS"
                  modeText="LBL_VIEW_SUPPLIER"
                  moreBreadCrumb={[{ name: partner, path: getFeaturePath('SUPPLIERS', 'view', { id }) }]}
                />
              )}
              {type === 'account' && (
                <BreadCrumb
                  feature="ACCOUNTING"
                  subFeature="FINANCIAL_ACCOUNTS"
                  modeText="LBL_FINANCIAL_ACCOUNT"
                  moreBreadCrumb={[{ name: partner, path: getFeaturePath('FINANCIAL_ACCOUNTS', 'view', { id }) }]}
                />
              )}
            </div>
          </div>
          {id && (
            <TransactionsList
              showBack={true}
              formik={formikObj}
              type={type}
              isRun={true}
              setIsRun={setIsRun}
              setActionInProgress={setActionInProgress}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default Transactions;
