import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import RectangleSkeleton from '../../../components/ui/skeletons/RectangleSkeleton';

import { MODELS } from '../../../constants/models';
import StachFrameFill from '../../../assets/images/Stackframe_fill.svg';
import { formatFloatNumber } from '../../../utils/helpers';
import { useAxiosFunction } from '../../../hooks/useAxios';
import { getSearchUrl } from '../../../services/getUrl';
import { alertsActions } from '../../../store/alerts';
import { getItem } from '../../../utils/localStorage';

const TopCustomersOpenInvoices = () => {
  const [topCustomers, setTopCustomers] = useState([]);

  const { api } = useAxiosFunction();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(true);

  const fetchTopCustomers = () => {
    api(
      'POST',
      getSearchUrl(MODELS.INVOICE),
      {
        fields: [
          'tradingName',
          'paymentDelay',
          'inTaxTotal',
          'operationSubTypeSelect',
          'dueDate',
          'exTaxTotal',
          'invoiceDate',
          'debtRecoveryBlockingOk',
          'statusSelect',
          'partner',
          'partner.name',
          'amountRemaining',
          'invoiceId',
          'company',
          'currency',
        ],
        data: {
          _domain: 'self.statusSelect = 3 AND self.operationTypeSelect=3 AND self.companyInTaxTotalRemaining > 0',
        },
        limit: 5,
        offset: 0,
        translate: true,
        sortBy: ['-amountRemaining'],
      },
      res => {
        setIsLoading(false);

        if (res.data.status === 0) {
          if (res.data.data) {
            setTopCustomers(res.data.data);
          }
        } else {
          dispatch(alertsActions.initiateAlert({ title: 'Error', message: 'SOMETHING_WENT_WRONG' }));
        }
      }
    );
  };

  useEffect(() => {
    fetchTopCustomers();
  }, []);
  return (
    <div className="col-xl-6 d-flex flex-fill">
      {!isLoading && (
        <div className="card section-card card-no-border">
          <div className="card-header-q">
            <h5 className="float-start mb-0">
              {t('TOP')} {t('OPEN_INVOICES')} <span>{t('CUSTOMERS')}</span>
            </h5>
          </div>
          <div className="card-body-q pt-0">
            {topCustomers.length > 0 &&
              topCustomers.map(customer => (
                <div className="cel-top-2" key={customer.id}>
                  <h4 className="float-start">
                    <img
                      src={StachFrameFill}
                      alt={StachFrameFill}
                      style={
                        getItem('code') === 'ar'
                          ? { transform: 'rotate(180deg)', transitionProperty: 'transform' }
                          : { transform: 'rotate(0deg)', transitionProperty: 'transform' }
                      }
                    />
                    {`${customer?.invoiceId} - ${customer?.['partner.name']}`}
                  </h4>
                  <p className="float-end up">
                    {formatFloatNumber(customer.amountRemaining)} {t('LBL_SAR_BRIEF')}
                  </p>
                </div>
              ))}
            {topCustomers.length === 0 && (
              <div>
                <h4 className="text-center pt-5">{t('NO_DATA_AVAILABLE')}</h4>
              </div>
            )}
          </div>
        </div>
      )}
      {isLoading && <RectangleSkeleton height="250" />}
    </div>
  );
};

export default TopCustomersOpenInvoices;
