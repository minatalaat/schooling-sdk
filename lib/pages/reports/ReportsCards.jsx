import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';

import { reportsEnum } from '../../constants/reportsEnum/reportsEnum';
import { useFeatures } from '../../hooks/useFeatures';
import ReportsCardWithSkeleton from '../../components/ui/skeletons/ReportsCardWithSkeleton';

function ReportsCards() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { checkPrivilege, isFeatureAvailable } = useFeatures();

  const stockManagementAvailable = useMemo(() => {
    return isFeatureAvailable({ featureCode: '12' });
  }, []);

  const costCenterAvailable = useMemo(() => {
    return isFeatureAvailable({ featureCode: '13' });
  }, []);

  let supportedTypes = {
    FINANCIAL: {
      code: '1',
      label: 'LBL_FINANCIAL_REPORTS',
    },
    PURCAHSE_SALE: {
      code: '2',
      label: 'LBL_PURCAHSE_SALE_REPORTS',
    },
  };
  if (costCenterAvailable) supportedTypes = { ...supportedTypes, COST_ACCOUNTING: { code: '3', label: 'LBL_ANALYTICS_REPORTS' } };
  if (stockManagementAvailable) supportedTypes = { ...supportedTypes, INVENTORY: { code: '4', label: 'LBL_STOCK_MANAGEMENT_REPORTS' } };

  return (
    <div className="page-body">
      <div className="container-fluid">
        {Object.keys(supportedTypes) &&
          Object.keys(supportedTypes).length > 0 &&
          Object.keys(supportedTypes).map(type => {
            return (
              <>
                <div className="row mb-3">
                  <div className="col-md-12 text-center">
                    <h2
                      style={{
                        color: '#1F4FDE',
                      }}
                    >
                      {t(supportedTypes[type].label)}
                    </h2>
                  </div>
                </div>
                <div className="row">
                  {Object.keys(reportsEnum) &&
                    Object.keys(reportsEnum)
                      .filter(item => reportsEnum[item].type === supportedTypes[type].code)
                      .map(report => {
                        if (checkPrivilege('view', 'REPORTS', report)) {
                          return (
                            <>
                              <div className="col-xl-3 col-md-3 col-xl-3 box-col-12">
                                <ReportsCardWithSkeleton
                                  onCardClick={
                                    reportsEnum[report].path
                                      ? () => {
                                          navigate(reportsEnum[report].path);
                                        }
                                      : null
                                  }
                                  item={reportsEnum[report]}
                                />
                              </div>
                            </>
                          );
                        }

                        return null;
                      })}
                </div>
              </>
            );
          })}
      </div>
    </div>
  );
}

export default ReportsCards;
