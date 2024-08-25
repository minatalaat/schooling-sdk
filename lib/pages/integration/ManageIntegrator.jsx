import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import ManageConnectedIntegrator from './connectedIntegrator/ManageConnectedIntegrator';
import ManageNotConnectedIntegrator from './notConnectedIntegrator/ManageNotConnectedIntegrator';

import { INTEGRATION_STATUS, INTEGRATOR_CODE } from '../../constants/enums/IntegrationEnum';

import Foodics from '../../assets/images/foodics.svg';

const ManageIntegrator = ({ feature }) => {
  const { t } = useTranslation();
  let { state } = useLocation();
  let { integrationItem } = state || {
    code: INTEGRATOR_CODE.FOODICS,
    img: Foodics,
    alt: INTEGRATOR_CODE.FOODICS,
    icon: Foodics,
    nameEn: t('INTEGRATIONS.LBL_FOODICS'),
    nameAr: t('INTEGRATIONS.LBL_FOODICS'),
    descEn: t('INTEGRATIONS.LBL_FOODICS_DESC'),
    descAr: t('INTEGRATIONS.LBL_FOODICS_DESC'),
    featuresEn: ['Products', 'Inventory', 'Sale Orders', 'Payment Methods'],
    featuresAr: ['المنتجات', 'المخزون', 'أوامر البيع', 'طرق الدفع'],
  };
  const isConnected = integrationItem.status === INTEGRATION_STATUS.CONNECTED;
  
    if (isConnected) {
      return <ManageConnectedIntegrator integrationItem={integrationItem} feature={feature} />;
    }

  return <ManageNotConnectedIntegrator integrationItem={integrationItem} feature={feature} />;
};

export default ManageIntegrator;
