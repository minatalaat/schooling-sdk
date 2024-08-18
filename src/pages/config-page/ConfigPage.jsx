import { useMemo } from 'react';
import { appConfigEnum } from '../../constants/appConfigEnum/appConfigEnum';
import { useTranslation } from 'react-i18next';
import AppConfigCardWithSkeleton from '../../components/ui/skeletons/AppConfigCardWithSkeleton';
import { useNavigate } from 'react-router-dom';
import { useFeatures } from '../../hooks/useFeatures';

function ConfigPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isFeatureAvailable, getFeaturePath } = useFeatures();
  // let appConfig = appConfigEnum;

  const stockManagementAvaiable = useMemo(() => {
    return isFeatureAvailable({ featureCode: '12' });
  }, []);
  return (
    <div className="page-body">
      <div className="container-fluid">
        {Object.keys(appConfigEnum) && Object.keys(appConfigEnum).length > 0 && (
          <>
            <div className="row mb-3">
              <div className="col-md-12 text-center">
                <h2
                  style={{
                    color: '#1F4FDE',
                  }}
                >
                  {t('LBL_CONFIG_PAGE')}
                </h2>
              </div>
            </div>
            <div className="row">
              {Object.keys(appConfigEnum) &&
                Object.keys(appConfigEnum).map(item => {
                  if (item === 'COMPANY_STOCK_CONFIG' && !stockManagementAvaiable) {
                    return null;
                  } else {
                    return (
                      <>
                        <div className="col-xl-3 col-md-3 col-xl-3 box-col-12">
                          <AppConfigCardWithSkeleton
                            onCardClick={
                              appConfigEnum[item].PATH
                                ? () => {
                                    navigate(getFeaturePath('CONFIG') + appConfigEnum[item].PATH);
                                  }
                                : null
                            }
                            item={appConfigEnum[item]}
                          />
                        </div>
                      </>
                    );
                  }
                })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ConfigPage;
